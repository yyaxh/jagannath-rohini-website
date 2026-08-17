import logging

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

from app.utils.receipt import generate_receipt_pdf
from app.config import settings

logger = logging.getLogger("notify")


def _smtp_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASS and settings.SMTP_FROM)


def send_donation_receipt(donation, recipient_email: str) -> bool:
    """Send donation receipt email with PDF attachment. Returns False if SMTP
    is not configured or sending fails — never raises."""
    if not _smtp_configured():
        logger.info("SMTP not configured; skipping receipt email for %s", donation.id)
        return False

    if not donation.receipt_number:
        return False

    try:
        pdf_bytes = generate_receipt_pdf(donation, donation.receipt_number)
    except Exception:
        logger.exception("PDF generation failed for donation %s", donation.id)
        return False

    msg = MIMEMultipart()
    msg["From"] = settings.SMTP_FROM
    msg["To"] = recipient_email
    msg["Subject"] = f"Jagannath Mandir Rohini – Donation Receipt #{donation.receipt_number}"

    body = f"""
Jai Jagannath!

Thank you for your generous donation of ₹{float(donation.amount):,.2f} towards "{donation.cause}".

Your 80G tax receipt is attached. You may also download it anytime from our website using your email.

Donation Details:
- Receipt No.: {donation.receipt_number}
- Amount: ₹{float(donation.amount):,.2f}
- Cause: {donation.cause}
- Date: {donation.updated_at.strftime('%d %B %Y') if donation.updated_at else donation.created_at.strftime('%d %B %Y')}

With heartfelt gratitude,
Oriya Samaj (Regd. No. S/37924/2000) | Shree Jagannath Mandir Rohini
DAMB Apartments, Sector 11 Extn, Sector 11, Rohini, New Delhi 110085
Email: info@jagannathmandirrohini.com
"""
    msg.attach(MIMEText(body, "plain"))

    part = MIMEBase("application", "octet-stream")
    part.set_payload(pdf_bytes)
    encoders.encode_base64(part)
    part.add_header("Content-Disposition", f'attachment; filename="{donation.receipt_number}.pdf"')
    msg.attach(part)

    return _send(msg)


def send_form_confirmation(form_type: str, email: str, name: str) -> bool:
    """Send confirmation email for membership/seva form. Returns False when
    SMTP is not configured or sending fails — never raises."""
    if not _smtp_configured():
        return False

    msg = MIMEMultipart()
    msg["From"] = settings.SMTP_FROM
    msg["To"] = email
    msg["Subject"] = f"Jagannath Mandir Rohini – {form_type} Form Received"

    body = f"""
Jai Jagannath {name}!

Thank you for submitting your {form_type} request. We have received your details and will contact you soon.

If you have any questions, please reach out to the temple office.

With blessings,
Oriya Samaj (Regd. No. S/37924/2000) | Shree Jagannath Mandir Rohini
DAMB Apartments, Sector 11 Extn, Sector 11, Rohini, New Delhi 110085
Email: info@jagannathmandirrohini.com
"""
    msg.attach(MIMEText(body, "plain"))

    return _send(msg)


def _send(msg: MIMEMultipart) -> bool:
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
            server.send_message(msg)
        return True
    except Exception:
        logger.exception("SMTP send failed to %s", msg.get("To"))
        return False