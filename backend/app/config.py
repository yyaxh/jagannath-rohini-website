"""
Central config. Everything sensitive comes from environment variables —
NOTHING is hardcoded here.
"""
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "sqlite:///./temple.db"

    # Admin auth
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 12

    ADMIN_EMAIL: str
    ADMIN_PASSWORD_HASH: str

    # Razorpay
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    RAZORPAY_WEBHOOK_SECRET: str

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    # YouTube
    YOUTUBE_CHANNEL_ID: str = ""
    YOUTUBE_API_KEY: str = ""

    # Trust / 80G details
    TRUST_LEGAL_NAME: str = "Oriya Samaj (Regd. No. S/37924/2000)"
    TRUST_ADDRESS: str = "DAMB Apartments, Sector 11 Extn, Sector 11, Rohini, New Delhi 110085"
    TRUST_PAN: str = "AAAAA0000A"
    TRUST_80G_REG_NO: str = "AAAAA0000A00000"
    TRUST_80G_VALID_FROM: str = "AY 2024-25"
    TRUST_80G_VALID_TO: str = "AY 2026-27"
    TRUST_12A_REG_NO: str = ""
    RECEIPT_NUMBER_PREFIX: str = "JMR"

    # Rate limiting
    RATE_LIMIT_DEFAULT: str = "60/minute"
    RATE_LIMIT_FORMS: str = "5/minute"
    RATE_LIMIT_DONATIONS: str = "10/minute"

    # SMTP Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    SMTP_FROM: str = ""

    # File uploads for membership forms (photos, PAN/Aadhaar docs). Validated by
    # magic bytes and stored as bytea rows in the DATABASE (Postgres via
    # Supabase in production). No local disk used, so uploads survive restarts.
    MAX_UPLOAD_BYTES: int = 5 * 1024 * 1024  # 5 MB

    # Optional: pre-created Razorpay plan id for the ₹200/month recurring
    # Dainik Sewa subscription. If left empty a monthly plan is created once.
    DAINIK_SEWA_PLAN_ID: str = ""

    # Frontend static build — set to the built `dist/` directory to have the
    # backend serve the SPA (single container / Docker deploy). Left empty in
    # dev where Vite serves the frontend on its own port.
    FRONTEND_DIST: str = ""

    # Content-Security-Policy sent on every response (single global middleware).
    # Override via CSP env var if your Google-site-verification probes complain.
    CSP: str = (
        "default-src 'self'; "
        "script-src 'self' https://checkout.razorpay.com; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self'; "
        "frame-src https://checkout.razorpay.com https://www.youtube.com https://www.youtube-nocookie.com"
    )

    REQUIRED_IN_PRODUCTION: tuple[str, ...] = (
        "JWT_SECRET",
        "ADMIN_EMAIL",
        "ADMIN_PASSWORD_HASH",
        "RAZORPAY_KEY_ID",
        "RAZORPAY_KEY_SECRET",
        "RAZORPAY_WEBHOOK_SECRET",
        # 80G receipts go out with these — never allow placeholder values.
        "TRUST_PAN",
        "TRUST_80G_REG_NO",
    )

    # Values that are obviously placeholders ("replace-..." or fake 80G details
    # like AAAAA0000A). Startup fails loud in production instead of quietly
    # issuing receipts with bogus trust numbers.
    PLACEHOLDER_MARKERS: tuple[str, ...] = ("replace-", "AAAAA")

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def frontend_dist_dir(self) -> Path | None:
        """Resolved frontend dist path, or None if not configured/existing."""
        if not self.FRONTEND_DIST:
            return None
        p = Path(self.FRONTEND_DIST)
        return p if p.is_dir() else None

    def validate_ready(self) -> list[str]:
        """Return a list of missing required secrets so startup can fail loud."""
        missing = []
        for key in self.REQUIRED_IN_PRODUCTION:
            value = getattr(self, key, "")
            if value in (None, ""):
                missing.append(key)
            elif isinstance(value, str) and any(
                marker.lower() in value.lower() for marker in self.PLACEHOLDER_MARKERS
            ):
                missing.append(key)
        return missing


settings = Settings()