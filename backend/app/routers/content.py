import json
import re
import uuid

from fastapi import APIRouter, Depends, Form, HTTPException, Request, UploadFile, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.limiter import limiter
from app.models import Announcement, Document, GalleryItem, PublicFile, SiteSetting
from app.schemas import (
    AnnouncementCreate,
    AnnouncementOut,
    DocumentOut,
    SettingsOut,
    SettingsUpdate,
)
from app.security import require_admin
from app.utils.uploads import inspect_upload

router = APIRouter(tags=["site-content"])

ALLOWED_NAME = re.compile(r"[A-Za-z0-9]+\.[A-Za-z0-9]+")

_SETTING_KEYS = ("live_stream", "timings", "festivals", "under_construction", "donate_banner", "logo_url")


def _get_setting(db: Session, key: str) -> str:
    row = db.get(SiteSetting, key)
    return row.value if row else ""


def _set_setting(db: Session, key: str, value: str) -> None:
    row = db.get(SiteSetting, key)
    if row is None:
        db.add(SiteSetting(key=key, value=value))
    else:
        row.value = value
    db.commit()


def _public_settings(db: Session) -> SettingsOut:
    def _as_list(raw: str) -> list:
        try:
            val = json.loads(raw) if raw else []
            return val if isinstance(val, list) else []
        except Exception:
            return []

    return SettingsOut(
        live_stream=_get_setting(db, "live_stream"),
        timings=_as_list(_get_setting(db, "timings")),
        festivals=_as_list(_get_setting(db, "festivals")),
        under_construction=_get_setting(db, "under_construction").lower() in ("1", "true", "yes"),
        donate_banner=_get_setting(db, "donate_banner"),
        logo_url=_get_setting(db, "logo_url"),
    )


def _store_public_file(db: Session, file: UploadFile) -> str:
    content, ext, content_type = inspect_upload(file)
    stored = f"{uuid.uuid4().hex}.{ext}"
    original = file.filename or ""
    safe_original = re.sub(r"[^A-Za-z0-9._-]", "_", original)[:100] or None
    db.add(
        PublicFile(
            stored_name=stored,
            file_data=content,
            content_type=content_type,
            size_bytes=len(content),
            original_name=safe_original,
        )
    )
    return stored


# ---------------------------------------------------------------------------
# Public endpoints
# ---------------------------------------------------------------------------


@router.get("/api/announcements", response_model=list[AnnouncementOut])
def list_announcements(db: Session = Depends(get_db)):
    return (
        db.query(Announcement)
        .filter(Announcement.active.is_(True))
        .order_by(Announcement.created_at.desc())
        .limit(20)
        .all()
    )


@router.get("/api/documents", response_model=list[DocumentOut])
def list_documents(db: Session = Depends(get_db)):
    rows = db.query(Document).order_by(Document.created_at.desc()).limit(100).all()
    out = []
    for r in rows:
        item = DocumentOut.model_validate(r)
        item.file_url = f"/api/files/{r.file_name}"
        out.append(item)
    return out


@router.get("/api/files/{filename}")
@limiter.limit("120/minute")
def serve_public_file(request: Request, filename: str, db: Session = Depends(get_db)):
    """Serve a PUBLIC file (gallery image, government PDF). Only files stored
    through the public_files table — membership ID proofs stay admin-only."""
    if not ALLOWED_NAME.match(filename):
        raise HTTPException(status_code=400, detail="Invalid filename")
    row = db.query(PublicFile).filter(PublicFile.stored_name == filename).first()
    if not row:
        raise HTTPException(status_code=404, detail="File not found")
    return Response(
        content=row.file_data,
        media_type=row.content_type,
        headers={"Content-Disposition": f'inline; filename="{row.original_name or filename}"'},
    )


@router.get("/api/site/settings", response_model=SettingsOut)
def public_settings(db: Session = Depends(get_db)):
    return _public_settings(db)


# ---------------------------------------------------------------------------
# Editable site content blocks (hero slides, videos, blog cards, beshas,
# footer, header contact, content pages). The frontend ships hardcoded
# defaults; admin overrides are stored here (JSON) and the frontend falls
# back to its defaults for any block that isn't saved yet.
# ---------------------------------------------------------------------------

CONTENT_BLOCK_KEYS = (
    "hero_slides",
    "featured_videos",
    "blog_cards",
    "beshas",
    "footer",
    "header_contact",
    "content_pages",
)


@router.get("/api/site/content")
def site_content(db: Session = Depends(get_db)):
    """Return every admin-saved content block (public — this is site content,
    not secrets). Blocks that were never saved simply won't be present and the
    frontend keeps using its hardcoded defaults for them."""
    out: dict = {}
    for key in CONTENT_BLOCK_KEYS:
        raw = _get_setting(db, f"content.{key}")
        if raw:
            try:
                out[key] = json.loads(raw)
            except Exception:
                continue
    return out


@router.put("/api/admin/site/content")
def update_site_content(
    payload: dict,
    db: Session = Depends(get_db),
    admin: str = Depends(require_admin),
):
    """Save one or more content blocks (admin only). Each key must be a known
    block; values are stored as JSON and returned back."""
    unknown = [k for k in payload if k not in CONTENT_BLOCK_KEYS]
    if unknown:
        raise HTTPException(status_code=400, detail=f"Unknown content block(s): {', '.join(unknown)}")
    for key, value in payload.items():
        if value is None:
            # null means "reset this block to the built-in default"
            row = db.get(SiteSetting, f"content.{key}")
            if row is not None:
                db.delete(row)
                db.commit()
            continue
        _set_setting(db, f"content.{key}", json.dumps(value))
    return site_content(db)


# ---------------------------------------------------------------------------
# Admin endpoints (all protected by require_admin)
# ---------------------------------------------------------------------------


@router.post("/api/admin/announcements", response_model=AnnouncementOut, status_code=status.HTTP_201_CREATED)
def create_announcement(payload: AnnouncementCreate, db: Session = Depends(get_db), admin: str = Depends(require_admin)):
    item = Announcement(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/api/admin/announcements/{item_id}")
def delete_announcement(item_id: str, db: Session = Depends(get_db), admin: str = Depends(require_admin)):
    item = db.get(Announcement, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Announcement not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


@router.post("/api/admin/documents", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
def upload_document(
    request: Request,
    title: str = Form(""),
    category: str = Form("general"),
    file: UploadFile | None = None,
    db: Session = Depends(get_db),
    admin: str = Depends(require_admin),
):
    if not title.strip():
        raise HTTPException(status_code=400, detail="Title is required")
    if file is None:
        raise HTTPException(status_code=400, detail="File is required")
    stored = _store_public_file(db, file)
    db.flush()
    item = Document(
        title=title.strip(),
        category=category.strip() or "general",
        file_name=stored,
        original_name=file.filename or None,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    out = DocumentOut.model_validate(item)
    out.file_url = f"/api/files/{item.file_name}"
    return out


@router.delete("/api/admin/documents/{item_id}")
def delete_document(item_id: str, db: Session = Depends(get_db), admin: str = Depends(require_admin)):
    item = db.get(Document, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(item)
    db.query(PublicFile).filter(PublicFile.stored_name == item.file_name).delete()
    db.commit()
    return {"message": "Deleted"}


@router.post("/api/admin/gallery", response_model=dict, status_code=status.HTTP_201_CREATED)
def upload_gallery_item(
    request: Request,
    title: str = Form(""),
    category: str = Form("general"),
    file: UploadFile | None = None,
    db: Session = Depends(get_db),
    admin: str = Depends(require_admin),
):
    if not title.strip():
        raise HTTPException(status_code=400, detail="Title is required")
    if file is None:
        raise HTTPException(status_code=400, detail="Image is required")
    stored = _store_public_file(db, file)
    db.flush()
    item = GalleryItem(title=title.strip(), image_url=f"/api/files/{stored}", category=category.strip() or "general")
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "title": item.title, "image_url": item.image_url, "category": item.category}


@router.put("/api/admin/site/settings", response_model=SettingsOut)
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_db), admin: str = Depends(require_admin)):
    if payload.live_stream is not None:
        _set_setting(db, "live_stream", payload.live_stream.strip())
    if payload.timings is not None:
        _set_setting(db, "timings", json.dumps(payload.timings))
    if payload.festivals is not None:
        _set_setting(db, "festivals", json.dumps(payload.festivals))
    if payload.under_construction is not None:
        _set_setting(db, "under_construction", "1" if payload.under_construction else "0")
    if payload.donate_banner is not None:
        _set_setting(db, "donate_banner", payload.donate_banner)
    if payload.logo_url is not None:
        _set_setting(db, "logo_url", payload.logo_url)
    return _public_settings(db)


@router.post("/api/admin/logo", response_model=dict, status_code=status.HTTP_201_CREATED)
def upload_logo(
    request: Request,
    file: UploadFile | None = None,
    db: Session = Depends(get_db),
    admin: str = Depends(require_admin),
):
    """Upload a header logo (PNG/JPG/WebP/GIF). Stored as a public file and
    referenced by the site-wide `logo_url` setting."""
    if file is None:
        raise HTTPException(status_code=400, detail="Image is required")
    stored = _store_public_file(db, file)
    db.flush()
    logo_url = f"/api/files/{stored}"
    _set_setting(db, "logo_url", logo_url)
    return {"logo_url": logo_url, "stored_name": stored}
