import re
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator

PHONE_RE = re.compile(r"^[6-9]\d{9}$")  # Indian mobile numbers
PAN_RE = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]$")


class DonationCreate(BaseModel):
    donor_name: str = Field(min_length=2, max_length=120)
    donor_phone: str
    donor_email: EmailStr
    donor_pan: str | None = None
    address: str | None = Field(default=None, max_length=500)
    cause: str = Field(pattern=r"^(general|annadaan|rath_yatra|seva|annaprasad|temple_construction)$")
    amount: float = Field(gt=0, le=1_000_000)  # sanity cap; adjust as needed

    @field_validator("donor_phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_RE.match(v):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return v

    @field_validator("donor_pan")
    @classmethod
    def validate_pan(cls, v: str | None) -> str | None:
        if v in (None, ""):
            return None
        v = v.strip().upper()
        if not PAN_RE.match(v):
            raise ValueError("Enter a valid PAN (e.g. ABCDE1234F)")
        return v


class DonationOut(BaseModel):
    id: str
    razorpay_order_id: str | None
    amount: float
    status: str

    class Config:
        from_attributes = True


class RazorpayVerify(BaseModel):
    donation_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class MembershipCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str
    email: EmailStr
    address: str = Field(min_length=5, max_length=500)
    occupation: str | None = Field(default=None, max_length=120)
    family_members: int | None = Field(default=None, ge=0, le=50)
    message: str | None = Field(default=None, max_length=1000)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_RE.match(v):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return v


class SevaCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str
    email: EmailStr
    seva_type: str = Field(min_length=2, max_length=120)
    preferred_date: str | None = None
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_RE.match(v):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return v


# ---- Society Membership (Form 1) ----
# Fixed amount per membership type, in Rupees.
SOCIETY_MEMBERSHIP_AMOUNTS: dict[str, float] = {
    "partner": 551000.0,   # Partner Member
    "founder": 111000.0,   # Founder Member (Voting Right)
    "life": 73000.0,       # Life Member
    "general": 31000.0,    # General Member
    "advisor": 251000.0,   # Advisor
}

DAINIK_SEWA_ONE_TIME_AMOUNT: float = 2100.0   # One-time membership (₹2,100)
DAINIK_SEWA_RECURRING_AMOUNT: float = 200.0   # Recurring ₹200/month


class SocietyMembershipCreate(BaseModel):
    membership_type: str
    name: str = Field(min_length=2, max_length=120)
    father_husband_name: str | None = Field(default=None, max_length=120)
    gotra: str | None = Field(default=None, max_length=120)
    dob: str | None = Field(default=None, max_length=20)
    blood_group: str | None = Field(default=None, max_length=20)
    residence_address: str | None = Field(default=None, max_length=1000)
    office_address: str | None = Field(default=None, max_length=1000)
    residence_telephone: str | None = Field(default=None, max_length=30)
    office_telephone: str | None = Field(default=None, max_length=30)
    mobile: str
    fax: str | None = Field(default=None, max_length=30)
    email: EmailStr
    pan: str | None = None
    aadhaar: str | None = None
    occupation_designation: str | None = Field(default=None, max_length=160)
    introducing_member_name: str | None = Field(default=None, max_length=120)
    introducing_member_mobile: str | None = Field(default=None, max_length=20)
    member_photo: str | None = Field(default=None, max_length=120)
    spouse_photo: str | None = Field(default=None, max_length=120)
    pan_document: str | None = Field(default=None, max_length=120)
    aadhaar_document: str | None = Field(default=None, max_length=120)
    payment_method: str = Field(default="online", max_length=40)
    cheque_dd_number: str | None = Field(default=None, max_length=80)
    payment_date: str | None = Field(default=None, max_length=40)
    bank_drawn_on: str | None = Field(default=None, max_length=160)
    amount_in_words: str | None = Field(default=None, max_length=255)
    transaction_ref: str | None = Field(default=None, max_length=160)
    place: str | None = Field(default=None, max_length=160)
    member_signature: str | None = Field(default=None, max_length=160)
    terms_accepted: bool = Field(default=True)

    @field_validator("membership_type")
    @classmethod
    def validate_membership_type(cls, v: str) -> str:
        if v not in SOCIETY_MEMBERSHIP_AMOUNTS:
            raise ValueError("Invalid membership type")
        return v

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_RE.match(v):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return v

    @field_validator("pan")
    @classmethod
    def validate_pan(cls, v: str | None) -> str | None:
        if v in (None, ""):
            return None
        v = v.strip().upper()
        if not PAN_RE.match(v):
            raise ValueError("Enter a valid PAN (e.g. ABCDE1234F)")
        return v


class DainikSewaCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    gotra: str | None = Field(default=None, max_length=120)
    father_name: str | None = Field(default=None, max_length=120)
    spouse_name: str | None = Field(default=None, max_length=120)
    office_address: str | None = Field(default=None, max_length=1000)
    residence_address: str | None = Field(default=None, max_length=1000)
    email: EmailStr
    office_telephone: str | None = Field(default=None, max_length=30)
    residence_telephone: str | None = Field(default=None, max_length=30)
    mobile: str
    self_profession: str | None = Field(default=None, max_length=160)
    spouse_profession: str | None = Field(default=None, max_length=160)
    self_dob: str | None = Field(default=None, max_length=20)
    spouse_dob: str | None = Field(default=None, max_length=20)
    marriage_anniversary: str | None = Field(default=None, max_length=20)
    child1_name: str | None = Field(default=None, max_length=120)
    child1_birthday: str | None = Field(default=None, max_length=20)
    child2_name: str | None = Field(default=None, max_length=120)
    child2_birthday: str | None = Field(default=None, max_length=20)
    child3_name: str | None = Field(default=None, max_length=120)
    child3_birthday: str | None = Field(default=None, max_length=20)
    self_blood_group: str | None = Field(default=None, max_length=20)
    spouse_blood_group: str | None = Field(default=None, max_length=20)
    pan: str | None = None
    aadhaar: str | None = None
    temple_contribution: str | None = Field(default=None, max_length=2000)
    photo: str | None = Field(default=None, max_length=120)
    consent: bool = Field(default=False)
    applicant_signature: str | None = Field(default=None, max_length=160)
    payment_method: str = Field(default="online", max_length=40)
    cheque_dd_number: str | None = Field(default=None, max_length=80)
    payment_date: str | None = Field(default=None, max_length=40)
    bank_drawn_on: str | None = Field(default=None, max_length=160)
    amount_in_words: str | None = Field(default=None, max_length=255)
    transaction_ref: str | None = Field(default=None, max_length=160)
    recurring_consent: bool = Field(default=False)
    auto_payment_consent: bool = Field(default=False)
    recurring_payment_method: str | None = Field(default=None, max_length=40)
    recurring_start_date: str | None = Field(default=None, max_length=40)
    recurring_ref_id: str | None = Field(default=None, max_length=160)
    place: str | None = Field(default=None, max_length=160)

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_RE.match(v):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return v


class MembershipOrderOut(BaseModel):
    id: str
    razorpay_order_id: str | None
    razorpay_subscription_id: str | None
    amount: float
    status: str


class MembershipVerify(BaseModel):
    form_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class SubscriptionVerify(BaseModel):
    form_id: str
    razorpay_subscription_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class BlogPostOut(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: str | None
    content: str
    cover_image: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class BlogPostCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    slug: str = Field(pattern=r"^[a-z0-9-]{3,220}$")
    excerpt: str | None = Field(default=None, max_length=400)
    content: str = Field(min_length=10)
    cover_image: str | None = None
    published: bool = False


class GalleryItemOut(BaseModel):
    id: str
    title: str
    image_url: str
    category: str

    class Config:
        from_attributes = True


class GalleryItemCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    image_url: str = Field(max_length=500)
    category: str = Field(default="general", max_length=80)


class AdminLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---- Site content (announcements / documents / settings) ----


class AnnouncementCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    body: str | None = Field(default=None, max_length=2000)
    active: bool = True


class AnnouncementOut(BaseModel):
    id: str
    title: str
    body: str | None
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentOut(BaseModel):
    id: str
    title: str
    category: str
    file_url: str | None = None
    original_name: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class SettingsOut(BaseModel):
    live_stream: str = ""          # admin-set YouTube embed/video id or URL
    timings: list[dict] = []       # [{"name": ..., "time": ...}]
    festivals: list[dict] = []     # [{"name": ..., "date": ...}]
    under_construction: bool = False
    donate_banner: str = ""
    logo_url: str = ""             # admin-uploaded header logo (relative /api/files/...)


class SettingsUpdate(BaseModel):
    live_stream: str | None = None
    timings: list[dict] | None = None
    festivals: list[dict] | None = None
    under_construction: bool | None = None
    donate_banner: str | None = None
    logo_url: str | None = None
