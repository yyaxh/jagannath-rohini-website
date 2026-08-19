import hashlib
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import Response
from app.limiter import limiter
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Donation, DonationStatus, ProcessedWebhookEvent
from app.schemas import DonationCreate, DonationOut, RazorpayVerify
from app.security import require_admin
from app.utils.razorpay_client import create_order, verify_payment_signature, verify_webhook_signature
from app.utils.receipt import generate_receipt_pdf, make_receipt_number
from app.utils.notify import send_donation_receipt

router = APIRouter(prefix="/api/donations", tags=["donations"])
logger = logging.getLogger("donations")


class DonationSnapshot:
    """Lightweight copy of donation fields — survives session closure in BackgroundTask."""

    def __init__(self, d):
        self.id = d.id
        self.donor_name = d.donor_name
        self.donor_phone = d.donor_phone
        self.donor_email = d.donor_email
        self.donor_pan = d.donor_pan
        self.address = d.address
        self.cause = d.cause
        self.amount = d.amount
        self.receipt_number = d.receipt_number
        self.razorpay_payment_id = d.razorpay_payment_id
        self.created_at = d.created_at
        self.updated_at = d.updated_at


@router.post("", response_model=DonationOut, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_DONATIONS)
def create_donation(request: Request, payload: DonationCreate, db: Session = Depends(get_db)):
    donation = Donation(
        donor_name=payload.donor_name,
        donor_phone=payload.donor_phone,
        donor_email=payload.donor_email,
        donor_pan=payload.donor_pan,
        address=payload.address,
        cause=payload.cause,
        amount=payload.amount,
        status=DonationStatus.created,
    )
    db.add(donation)
    db.commit()
    db.refresh(donation)

    try:
        order = create_order(
            amount_rupees=payload.amount,
            receipt=f"donation_{donation.id}",
            notes={"donation_id": donation.id, "cause": payload.cause},
        )
    except Exception:
        logger.exception("Razorpay order creation failed for donation %s", donation.id)
        raise HTTPException(status_code=502, detail="Could not initiate payment. Please try again.")

    donation.razorpay_order_id = order["id"]
    db.commit()
    db.refresh(donation)
    return donation


@router.post("/verify")
@limiter.limit(settings.RATE_LIMIT_DONATIONS)
def verify_donation(request: Request, payload: RazorpayVerify, db: Session = Depends(get_db)):
    donation = db.get(Donation, payload.donation_id)
    if not donation or donation.razorpay_order_id != payload.razorpay_order_id:
        raise HTTPException(status_code=404, detail="Donation not found")

    ok = verify_payment_signature(
        payload.razorpay_order_id, payload.razorpay_payment_id, payload.razorpay_signature
    )
    if not ok:
        raise HTTPException(status_code=400, detail="Payment verification failed")

    return {"message": "Payment received, confirming shortly.", "donation_id": donation.id}


@router.post("/webhook", include_in_schema=False)
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    raw_body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    if not verify_webhook_signature(raw_body, signature):
        logger.warning("Rejected webhook call with invalid signature")
        raise HTTPException(status_code=400, detail="Invalid signature")

    payload = await request.json()
    event = payload.get("event")
    # Razorpay includes event_id on every webhook; if absent, derive a stable
    # id from the raw body so retries still collapse to one processed event.
    event_id = payload.get("event_id") or hashlib.sha256(raw_body).hexdigest()
    entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    order_id = entity.get("order_id")
    payment_id = entity.get("id")

    if not order_id:
        return {"status": "ignored"}

    # Idempotency guard: insert-then-check. If this event was already
    # processed, skip it — prevents double receipts / double status flips.
    try:
        db.add(ProcessedWebhookEvent(event_id=event_id))
        db.flush()
    except IntegrityError:
        db.rollback()
        logger.info("Duplicate webhook event %s ignored", event_id)
        return {"status": "ok", "duplicate": True}

    donation = db.query(Donation).filter(Donation.razorpay_order_id == order_id).first()
    if not donation:
        logger.warning("Webhook for unknown order_id %s", order_id)
        db.rollback()
        return {"status": "ignored"}

    if event == "payment.captured":
        donation.status = DonationStatus.paid
        donation.razorpay_payment_id = payment_id
        if not donation.receipt_number:
            donation.receipt_number = make_receipt_number(donation.id, donation.created_at)
        db.commit()
        # Snapshot donation fields BEFORE BackgroundTask so the receipt
        # email works even after get_db closes the session.
        snap = DonationSnapshot(donation)
        from starlette.background import BackgroundTask
        from fastapi.responses import JSONResponse

        return JSONResponse(
            content={"status": "ok", "receipt_email_scheduled": bool(settings.SMTP_FROM)},
            background=BackgroundTask(_send_receipt_safe, snap),
        )
    elif event == "payment.failed":
        donation.status = DonationStatus.failed
        db.commit()

    return {"status": "ok"}


def _send_receipt_safe(snap) -> None:
    """Background helper — never raises into the webhook response."""
    try:
        ok = send_donation_receipt(snap, snap.donor_email)
        if not ok:
            logger.warning("Receipt email failed for donation %s", snap.id)
    except Exception:
        logger.exception("Unexpected error sending receipt for donation %s", snap.id)


@router.get("/{donation_id}/receipt")
@limiter.limit(settings.RATE_LIMIT_DEFAULT)
def download_receipt(donation_id: str, request: Request, email: str, db: Session = Depends(get_db)):
    donation = db.get(Donation, donation_id)
    if not donation or donation.donor_email.strip().lower() != email.strip().lower():
        raise HTTPException(status_code=404, detail="Receipt not found")

    if donation.status != DonationStatus.paid:
        raise HTTPException(status_code=409, detail="Receipt is only available for completed payments")

    if not donation.receipt_number:
        donation.receipt_number = make_receipt_number(donation.id, donation.created_at)
        db.commit()
        db.refresh(donation)

    pdf_bytes = generate_receipt_pdf(donation, donation.receipt_number)
    filename = f"{donation.receipt_number.replace('/', '-')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


@router.get("", dependencies=[Depends(require_admin)])
def list_donations(db: Session = Depends(get_db)):
    rows = db.query(Donation).order_by(Donation.created_at.desc()).limit(500).all()
    return [
        {
            "id": d.id,
            "donor_name": d.donor_name,
            "donor_phone": d.donor_phone,
            "donor_email": d.donor_email,
            "cause": d.cause,
            "amount": float(d.amount),
            "status": d.status,
            "created_at": d.created_at,
        }
        for d in rows
    ]


@router.get("/smtp-test", dependencies=[Depends(require_admin)])
def smtp_test():
    """Send a test email to verify SMTP credentials work. Admin only."""
    import smtplib
    from email.mime.text import MIMEText

    if not (settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASS and settings.SMTP_FROM):
        return {"ok": False, "error": "SMTP not fully configured. Check SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM on Render."}
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
            msg = MIMEText("This is a test email from Jagannath Mandir Rohini. If you see this, SMTP is working!")
            msg["From"] = settings.SMTP_FROM
            msg["To"] = settings.SMTP_FROM
            msg["Subject"] = "JMR SMTP Test – Working!"
            server.send_message(msg)
        return {"ok": True, "message": f"Test email sent to {settings.SMTP_FROM}. Check inbox."}
    except Exception as e:
        logger.exception("SMTP test failed")
        return {"ok": False, "error": str(e)}