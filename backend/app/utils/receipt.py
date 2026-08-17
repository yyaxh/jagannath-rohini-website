"""
80G donation receipt PDF generator – Professional design with gold border, Om symbol, thank-you note.
"""
from __future__ import annotations

import io
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import Table, TableStyle

from app.config import settings

PRIMARY = colors.HexColor("#B8272E")  # temple red
GOLD = colors.HexColor("#D4AF37")
DARK = colors.HexColor("#1a1a1a")
MUTED = colors.HexColor("#666666")
LIGHT_GOLD = colors.HexColor("#F5E6CA")


def _amount_in_words(amount: float) -> str:
    ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
            "Seventeen", "Eighteen", "Nineteen"]
    tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    def two_digit(n: int) -> str:
        if n < 20:
            return ones[n]
        return (tens[n // 10] + (" " + ones[n % 10] if n % 10 else "")).strip()

    def three_digit(n: int) -> str:
        if n >= 100:
            return ones[n // 100] + " Hundred" + (" " + two_digit(n % 100) if n % 100 else "")
        return two_digit(n)

    rupees = int(amount)
    if rupees == 0:
        return "Zero Rupees Only"

    parts = []
    crore, rupees = divmod(rupees, 10_000_000)
    lakh, rupees = divmod(rupees, 100_000)
    thousand, rupees = divmod(rupees, 1_000)
    hundred = rupees

    if crore:
        parts.append(three_digit(crore) + " Crore")
    if lakh:
        parts.append(three_digit(lakh) + " Lakh")
    if thousand:
        parts.append(three_digit(thousand) + " Thousand")
    if hundred:
        parts.append(three_digit(hundred))

    return " ".join(parts) + " Rupees Only"


def make_receipt_number(donation_id: str, created_at: datetime) -> str:
    year = created_at.year
    short_id = donation_id.replace("-", "").upper()[:8]
    return f"{settings.RECEIPT_NUMBER_PREFIX}/80G/{year}/{short_id}"


CAUSE_LABELS = {
    "general": "General Temple Fund",
    "annadaan": "Annadaan (Free Meal Seva)",
    "rath_yatra": "Rath Yatra Fund",
    "seva": "Nitya Seva / Puja",
    "annaprasad": "Annaprasad Booking",
    "temple_construction": "New Temple Construction Fund",
}


def generate_receipt_pdf(donation, receipt_number: str) -> bytes:
    """Generate professional 80G receipt PDF with gold border and Om symbol."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    margin = 20 * mm
    inner_margin = 18 * mm

    # ---- Gold Border ----
    c.setStrokeColor(GOLD)
    c.setLineWidth(2)
    c.rect(margin, margin, width - 2 * margin, height - 2 * margin)
    
    # Inner subtle border
    c.setStrokeColor(LIGHT_GOLD)
    c.setLineWidth(0.5)
    c.rect(margin + 3, margin + 3, width - 2 * margin - 6, height - 2 * margin - 6)

    # ---- Header Band (Red) ----
    c.setFillColor(PRIMARY)
    c.rect(margin, height - 32 * mm, width - 2 * margin, 32 * mm, fill=1, stroke=0)
    
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(margin + 6 * mm, height - 14 * mm, "JAGANNATH MANDIR, ROHINI")
    
    c.setFont("Helvetica", 9)
    c.drawString(margin + 6 * mm, height - 20 * mm, settings.TRUST_LEGAL_NAME)
    c.drawString(margin + 6 * mm, height - 25 * mm, settings.TRUST_ADDRESS)

    # ---- "DONATION RECEIPT" Gold Text ----
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 14)
    c.drawRightString(width - margin - 6 * mm, height - 14 * mm, "DONATION RECEIPT")
    c.setFillColor(colors.white)
    c.setFont("Helvetica", 8)
    c.drawRightString(width - margin - 6 * mm, height - 20 * mm, "(Valid under Section 80G, Income Tax Act, 1961)")
    
    # ---- "Jai Jagannath!" subtitle (top-right, below the 80G line) ----
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 11)
    c.drawRightString(width - margin - 6 * mm, height - 25 * mm, "Jai Jagannath!")
    
    # ---- Om Symbol (top-right) ----
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 22)
    c.drawRightString(width - margin - 6 * mm, height - 32 * mm, "ॐ")

    y = height - 44 * mm

    # ---- Receipt Meta Box ----
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 9)
    meta_rows = [
        ("Receipt No.", receipt_number),
        ("Date", donation.updated_at.strftime("%d %B %Y") if donation.updated_at else datetime.now(timezone.utc).strftime("%d %B %Y")),
        ("Payment Ref (Razorpay)", donation.razorpay_payment_id or "-"),
    ]
    box_h = 18 * mm
    c.setStrokeColor(colors.HexColor("#dddddd"))
    c.setFillColor(colors.HexColor("#fafafa"))
    c.rect(margin, y - box_h, width - 2 * margin, box_h, fill=1, stroke=1)
    ry = y - 6 * mm
    for label, value in meta_rows:
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(MUTED)
        c.drawString(margin + 5 * mm, ry, f"{label}:")
        c.setFont("Helvetica", 9)
        c.setFillColor(DARK)
        c.drawString(margin + 50 * mm, ry, str(value))
        ry -= 6 * mm

    y -= box_h + 10 * mm

    # ---- Donor Details ----
    c.setFillColor(PRIMARY)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin + 5 * mm, y, "Donor Details")
    y -= 8 * mm

    donor_rows = [
        ("Name", donation.donor_name),
        ("Phone", donation.donor_phone),
        ("Email", donation.donor_email),
        ("PAN", donation.donor_pan or "Not provided"),
        ("Address", donation.address or "Not provided"),
    ]
    c.setFont("Helvetica", 9.5)
    c.setFillColor(DARK)
    for label, value in donor_rows:
        c.setFont("Helvetica-Bold", 9)
        c.drawString(margin + 5 * mm, y, f"{label}:")
        c.setFont("Helvetica", 9)
        c.drawString(margin + 35 * mm, y, str(value)[:80])
        y -= 6 * mm

    y -= 4 * mm

    # ---- Donation Table ----
    c.setFillColor(PRIMARY)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin + 5 * mm, y, "Donation Details")
    y -= 8 * mm

    table_data = [
        ["Purpose / Cause", "Mode of Payment", "Amount (INR)"],
        [CAUSE_LABELS.get(donation.cause, donation.cause), "Online (Razorpay)", f"Rs. {float(donation.amount):,.2f}"],
    ]
    tbl = Table(table_data, colWidths=[(width - 2 * margin) * 0.45, (width - 2 * margin) * 0.28, (width - 2 * margin) * 0.27])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dddddd")),
        ("ALIGN", (2, 0), (2, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    tw, th = tbl.wrapOn(c, width - 2 * margin, 40 * mm)
    tbl.drawOn(c, margin + 5 * mm, y - th)
    y -= th + 6 * mm

    c.setFont("Helvetica-Oblique", 9.5)
    c.setFillColor(DARK)
    c.drawString(margin + 5 * mm, y, f"Amount in words: {_amount_in_words(float(donation.amount))}")
    y -= 10 * mm

    # ---- 80G Tax Exemption Box ----
    c.setStrokeColor(GOLD)
    c.setFillColor(LIGHT_GOLD)
    c.rect(margin + 3 * mm, y - 30 * mm, width - 2 * margin - 6 * mm, 30 * mm, fill=1, stroke=1)
    
    c.setFillColor(PRIMARY)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin + 8 * mm, y - 5 * mm, "Tax Exemption Details")
    y -= 8 * mm

    note_lines = [
        f"PAN of Trust: {settings.TRUST_PAN}",
        f"80G Registration No. (URN): {settings.TRUST_80G_REG_NO}",
        f"Validity: {settings.TRUST_80G_VALID_FROM} to {settings.TRUST_80G_VALID_TO}",
    ]
    if settings.TRUST_12A_REG_NO:
        note_lines.append(f"12A Registration No.: {settings.TRUST_12A_REG_NO}")

    c.setFont("Helvetica", 8.5)
    c.setFillColor(DARK)
    ry = y - 12 * mm
    for line in note_lines:
        c.drawString(margin + 8 * mm, ry, line)
        ry -= 5.5 * mm

    y -= 30 * mm + 6 * mm

    # ---- Disclaimer ----
    c.setFont("Helvetica", 7.5)
    c.setFillColor(MUTED)
    disclaimer = (
        "This is a system-generated receipt and does not require a physical signature. This donation is eligible "
        "for tax deduction under Section 80G of the Income Tax Act, 1961, subject to the limits and conditions "
        "prescribed therein. Donors are advised to verify current 80G validity on the Income Tax e-filing portal "
        "before claiming deduction. No goods or services were provided in exchange for this donation."
    )
    text_obj = c.beginText(margin + 5 * mm, y)
    text_obj.setFont("Helvetica", 7.5)
    text_obj.setFillColor(MUTED)
    max_width = width - 2 * margin - 10 * mm
    line = ""
    for word in disclaimer.split():
        trial = f"{line} {word}".strip()
        if c.stringWidth(trial, "Helvetica", 7.5) > max_width:
            text_obj.textLine(line)
            line = word
        else:
            line = trial
    if line:
        text_obj.textLine(line)
    c.drawText(text_obj)

    # ---- Thank You Note ----
    y -= 20 * mm
    c.setFillColor(PRIMARY)
    c.setFont("Helvetica-Oblique", 11)
    thank_you = '"With heartfelt gratitude for your Seva. May Lord Jagannath, Balabhadra and Subhadra Devi bless you and your family with peace and prosperity."'
    text_obj2 = c.beginText(margin + 5 * mm, y)
    text_obj2.setFont("Helvetica-Oblique", 11)
    text_obj2.setFillColor(PRIMARY)
    max_width = width - 2 * margin - 10 * mm
    line2 = ""
    for word in thank_you.split():
        trial = f"{line2} {word}".strip()
        if c.stringWidth(trial, "Helvetica-Oblique", 11) > max_width:
            text_obj2.textLine(line2)
            line2 = word
        else:
            line2 = trial
    if line2:
        text_obj2.textLine(line2)
    c.drawText(text_obj2)

    # ---- Authorised Signatory block ----
    y -= 16 * mm
    c.setFillColor(DARK)
    c.setFont("Helvetica", 10)
    c.drawString(margin + 5 * mm, y, "Authorised Signatory")
    c.setFont("Helvetica-Bold", 9.5)
    c.drawString(margin + 5 * mm, y - 6 * mm, settings.TRUST_LEGAL_NAME)

    # ---- Footer ----
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7)
    c.drawCentredString(width / 2, 14 * mm, "Jagannath Mandir, Rohini  -  Jai Jagannath")
    c.drawCentredString(width / 2, 10 * mm, "This is a computer-generated document and does not require a physical signature.")

    c.showPage()
    c.save()
    buf.seek(0)
    return buf.getvalue()