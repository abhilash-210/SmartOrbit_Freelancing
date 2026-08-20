# SmartOrbit — Deployment & Admin Operations Guide

This guide covers deploying the website and serverless automation to **Vercel**, setting up persistent state storage, configuring notifications, and using the Admin API to reset contacts.

---

## 1. Upstash Redis Setup (State Storage & Idempotency)

The system uses [Upstash Redis](https://upstash.com) as a zero-latency, serverless-friendly database for conversation state and deduplicating webhook events.

1. Go to [console.upstash.com](https://console.upstash.com) and create a free account.
2. Click **Create Database**:
   - Name: `smartorbit-state`
   - Region: Choose closest to your Vercel region (e.g. `ap-south-1` / Mumbai or `us-east-1`).
3. Under the **REST API** section of your database dashboard, copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## 2. Instant Mobile Notifications (Telegram Bot Setup)

Get instant push notifications on your phone whenever a client completes the intake:

1. Open Telegram and search for `@BotFather`.
2. Send `/newbot`, name your bot (e.g. `SmartOrbit Leads Bot`), and choose a username.
3. BotFather will give you a token (e.g. `7182938491:AAH...`). Save this as `TELEGRAM_BOT_TOKEN`.
4. Start a chat with your new bot by clicking its link and sending `/start`.
5. Get your Chat ID by messaging `@userinfobot` on Telegram. Copy the `Id` number (e.g. `123456789`). Save this as `TELEGRAM_CHAT_ID`.

---

## 3. Vercel Deployment & Environment Variables

### Step 3.1: Push Project to GitHub
```bash
git add .
git commit -m "feat: implement WhatsApp intake automation, Vercel serverless webhooks, and Sheets logging"
git push origin main
```

### Step 3.2: Configure Environment Variables in Vercel
In your Vercel Project Dashboard:
1. Go to **Settings** > **Environment Variables**.
2. Add the following keys:

| Variable Name | Required | Description |
| :--- | :--- | :--- |
| `META_WHATSAPP_TOKEN` | Yes | Meta System User Permanent Token |
| `META_PHONE_NUMBER_ID` | Yes | WhatsApp Business Phone Number ID |
| `META_VERIFY_TOKEN` | Yes | Custom secret string for webhook verification |
| `META_APP_SECRET` | Optional | Meta App Secret (for HMAC SHA-256 verification) |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis REST Token |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Yes | ID from Google Sheet URL |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Yes | Google Cloud Service Account Email |
| `GOOGLE_PRIVATE_KEY` | Yes | Service account private key (RSA PEM) |
| `TELEGRAM_BOT_TOKEN` | Optional | Telegram Bot Token for push alerts |
| `TELEGRAM_CHAT_ID` | Optional | Your Telegram Chat ID |
| `ADMIN_API_KEY` | Yes | Secret key to protect `/api/admin` operations |

3. Click **Redeploy** in Vercel to apply environment variables.

---

## 4. Admin API & Manual Contact Reset

Once a contact enters `HUMAN_HANDOFF`, the automation permanently remains silent so you can chat manually.

If you ever want to reset a contact back to `NEW` (for testing or restarting intake):

### Option A: Reset via cURL / Terminal
```bash
curl -X POST https://your-domain.vercel.app/api/admin \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_API_KEY" \
  -d '{ "action": "reset", "phone": "918019677679" }'
```

**Response:**
```json
{
  "success": true,
  "message": "Contact +918019677679 state reset to NEW successfully."
}
```

### Option B: Check Contact State via Browser / GET
```bash
curl "https://your-domain.vercel.app/api/admin?key=YOUR_ADMIN_API_KEY&phone=918019677679"
```

**Response:**
```json
{
  "phone": "918019677679",
  "contact": {
    "state": "HUMAN_HANDOFF",
    "selectedService": "Web Design",
    "leadId": "SO-20260820-0001",
    "source": "website",
    "updatedAt": "2026-08-20T15:00:00.000Z"
  }
}
```
