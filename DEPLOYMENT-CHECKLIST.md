# 🚀 Deployment & Keys Checklist — Jagannath Mandir Rohini

> Website handover ke liye complete checklist. Jo keys client se mangni hain,
> jo Render/Razorpay/Google/Gmail mein set karni hain — sab yahan hai.
>
> **Architecture:** Frontend = Vercel → `jagannathmandirrohini.com` · Backend = Render →
> `https://jagannath-rohini-website.onrender.com` · DB = Postgres (Render) · Payment = Razorpay

---

## Part A — Client se maangne wali keys

Ye keys client (trust/accountant) se lena hain. Inke bina payment, email, live stream nahi chalega.

| # | Key | Kahan se milegi | Kya hai | Kahan daalni hai |
|---|-----|----------------|---------|------------------|
| 1 | `RAZORPAY_KEY_ID` | Razorpay dashboard → Settings → API Keys (live: `rzp_live_...`) | Payment ka public key | Render + `.env` |
| 2 | `RAZORPAY_KEY_SECRET` | Razorpay dashboard → API Keys | Payment ka secret | Render + `.env` |
| 3 | `RAZORPAY_WEBHOOK_SECRET` | Razorpay dashboard → Settings → Webhooks pe khud banate ho | Webhook verify ke liye (koi bhi strong random string) | Render + `.env` + Razorpay webhook settings |
| 4 | `YOUTUBE_API_KEY` | Google Cloud Console (YouTube Data API v3) | Channel live detect karne ke liye | Render + `.env` |
| 5 | `SMTP_USER` | Gmail account (temple ka) | Email bhejne ke liye | Render + `.env` |
| 6 | `SMTP_PASS` | Gmail → App Passwords (16-digit) | Email password | Render + `.env` |
| 7 | `SMTP_FROM` | Same Gmail address | Email "from" address | Render + `.env` |

**Pehle se ready (kuch nahi chahiye):**

| Key | Value |
|-----|-------|
| `YOUTUBE_CHANNEL_ID` | `UCJrQm3cCnyF8rIvFh9-3-nw` (already set) |
| `JWT_SECRET` | Already set |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` | Already set (admin login ke liye) |
| `TRUST_PAN` | `AAATO0943J` |
| `TRUST_80G_REG_NO` | `DIT(E)2014-15/DEL OE 25473/03092014/5352` |
| `TRUST_80G_VALID_FROM` / `TRUST_80G_VALID_TO` | `03/09/2014` / `AY 2026-27` |
| `TRUST_LEGAL_NAME` | `Oriya Samaj (Regd. No. S/37924/2000)` |
| `TRUST_ADDRESS` | `CS/OCF-4, PKT-D-15, Sector-7, Rohini, Delhi-110085` |

---

## Part B — Render dashboard (production backend)

Render pe service → **Environment** → **Environment Variables** mein ye daalo
(ye saari `sync: false` hain = Render auto-set nahi karta, manually daalna hoga):

```
RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_WEBHOOK_SECRET=xxxx
YOUTUBE_CHANNEL_ID=UCJrQm3cCnyF8rIvFh9-3-nw
YOUTUBE_API_KEY=xxxx
SMTP_USER=temple.email@gmail.com
SMTP_PASS=16-digit-app-password
SMTP_FROM=temple.email@gmail.com
TRUST_PAN=AAATO0943J
TRUST_80G_REG_NO=DIT(E)2014-15/DEL OE 25473/03092014/5352
TRUST_80G_VALID_FROM=03/09/2014
TRUST_80G_VALID_TO=AY 2026-27
JWT_SECRET=<same as .env>
ADMIN_EMAIL=admin@jagannathmandirrohini.com
ADMIN_PASSWORD_HASH=<same as .env>
```

> ⚠️ **Zaroori:** `TRUST_PAN` aur `TRUST_80G_REG_NO` **real values** hi daalo.
> Placeholder (`AAAAA...`) daala toh backend **production mein start hi nahi hoga**
> (fake 80G receipt na jaye isliye — intentional safety guard).

**Render pe pehle se set hain (koi action nahi):** `ENVIRONMENT=production`,
`DATABASE_URL` (auto), `ALLOWED_ORIGINS`, `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`.

---

## Part C — Razorpay dashboard (payment)

### 1. Settlement account verify (payment kis account pe aayegi)
- **Settings → Settlements → Bank Account**
- Confirm: `ORIYA SAMAJ REGD` · A/c `117310100010730` · IFSC `UBIN0811734` · Union Bank of India
- ⚠️ Account holder ka naam bank records jaisa hi hona chahiye, warna settlement reject hota hai

### 2. Webhook setup (payment confirm hone pe receipt email isi se trigger hoti hai)
- **Settings → Webhooks → Add Webhook** — do URL add karo:
  1. `https://jagannath-rohini-website.onrender.com/api/donations/webhook`
  2. `https://jagannath-rohini-website.onrender.com/api/forms/webhook`
- **Secret:** wahi `RAZORPAY_WEBHOOK_SECRET` jo Render mein daala
- **Events (sab select karo):** `payment.captured`, `payment.failed`,
  `subscription.authenticated`, `subscription.charged`
- ⚠️ Webhook ke bina donation "paid" kabhi nahi hogi aur receipt email nahi jayegi

### 3. Live mode
- Test keys (`rzp_test_`) se pehle test karo, phir **live keys** (`rzp_live_`) enable karo

---

## Part D — Google Cloud (YouTube API key)

1. [console.cloud.google.com](https://console.cloud.google.com) → project banao (ya existing)
2. **APIs & Services → Library** → **YouTube Data API v3** → Enable
3. **Credentials → Create Credentials → API Key** → copy
4. Key ko restrict kar sakte ho (YouTube Data API v3 tak) — recommended

---

## Part E — Gmail (SMTP for receipt emails)

1. Temple ka Gmail account (ya jo bhi official email ho)
2. Gmail → **Settings → Accounts → Other Google Account settings → Security**
3. **2-Step Verification ON** karo (zaroori)
4. **App passwords** → create → select "Mail" → 16-digit password milega
5. Ye `SMTP_PASS` mein daalo (Gmail login password nahi!)

---

## Part F — Vercel (frontend) — kuch nahi daalna

- Frontend relative `/api` use karta hai; `vercel.json` ka rewrite
  `/api/*` → Render backend bhejta hai. **Koi env var chahiye nahi.**
- Sirf **Redeploy** karo (ya GitHub push pe auto-deploy agar connected hai)

---

## Part G — Local `backend/.env` (testing ke liye)

Local mein bhi same values daalo taaki testing production jaisi ho:

```
RAZORPAY_KEY_ID=rzp_test_xxxx        # test mode mein
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_WEBHOOK_SECRET=xxxx
YOUTUBE_API_KEY=xxxx
SMTP_USER=...  SMTP_PASS=...  SMTP_FROM=...
```

---

## ✅ Post-setup verification (5 minute)

1. **Payment test:** Website pe ₹1 (ya ₹10) ka real donation karo → Razorpay checkout → pay
   - Email pe **80G receipt PDF** aani chahiye
   - Razorpay dashboard → **Settlements** mein transaction dikhna chahiye (destination account = Union Bank)
2. **YouTube live test:** YouTube pe channel live karo (ya phone se) → Live Darshan page pe ~1 min mein player aa jaye
3. **Admin login:** `/admin` pe login karo → panel khule

Kuch bhi fail ho toh logs dekho (Render → service → Logs) ya code se help lo.
