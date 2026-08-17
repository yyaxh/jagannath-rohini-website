"""Quick smoke test for the public API.

Run with a scratch database so it never touches production data:

    DATABASE_URL="sqlite:///./tmp_smoke.db" python test_quick.py
"""
from fastapi.testclient import TestClient
from app.main import app

results = []


def check(name: str, cond: bool, extra: str = "") -> None:
    results.append((name, cond))
    print(f"[{'PASS' if cond else 'FAIL'}] {name} {extra}")


with TestClient(app) as c:
    # Health
    r = c.get('/api/health')
    check('health', r.status_code == 200, str(r.json()))

    # Public config
    r = c.get('/api/config')
    check('config', r.status_code == 200)

    # Blog
    r = c.get('/api/blog')
    check('blog list', r.status_code == 200)

    # Gallery
    r = c.get('/api/gallery')
    check('gallery', r.status_code == 200)

    # Live status
    r = c.get('/api/live/status')
    check('live/status', r.status_code == 200)

    # Site content (defaults when nothing overridden)
    r = c.get('/api/site/content')
    check('site/content', r.status_code == 200)

    # Announcements
    r = c.get('/api/announcements')
    check('announcements', r.status_code == 200)

    # Documents
    r = c.get('/api/documents')
    check('documents', r.status_code == 200)

    # Membership form — accepted or schema-validated, never a 500
    r = c.post('/api/forms/membership', json={'full_name': 'Test', 'phone': '9876543210', 'email': 'test@test.com'})
    check('forms/membership', r.status_code in (200, 201, 422), f'status={r.status_code}')

    # Seva form — accepted or schema-validated, never a 500
    r = c.post('/api/forms/seva', json={'full_name': 'Test', 'phone': '9876543210', 'email': 'test@test.com', 'seva_type': 'abhishek'})
    check('forms/seva', r.status_code in (200, 201, 422), f'status={r.status_code}')

    # Login with wrong credentials must be rejected
    r = c.post('/api/auth/login', json={'email': 'admin@jagannathmandirrohini.com', 'password': 'WrongPass123!'})
    check('auth login rejects bad creds', r.status_code == 401, f'status={r.status_code}')

    # Webhook with bad signature must be rejected
    r = c.post('/api/donations/webhook', json={'event': {'event_type': 'payment.captured', 'payload': {}}}, headers={'X-Razorpay-Signature': 'badsig'})
    check('webhook rejects bad signature', r.status_code in (400, 403), f'status={r.status_code}')

    # Admin-protected routes without auth must be rejected
    r = c.get('/api/admin/members')
    check('admin routes require auth', r.status_code == 401, f'status={r.status_code}')

failed = [name for name, ok in results if not ok]
print(f"\n{len(results) - len(failed)}/{len(results)} checks passed")
if failed:
    print('FAILED:', failed)
    raise SystemExit(1)
print('All smoke checks passed')
