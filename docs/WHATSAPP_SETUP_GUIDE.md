# SmartOrbit — WhatsApp Business Cloud API Setup Guide

This guide explains how to set up the official **Meta WhatsApp Business Cloud API** for SmartOrbit lead-intake automation.

---

## 1. Prerequisites

1. A **Meta (Facebook) Developer Account** ([developers.facebook.com](https://developers.facebook.com)).
2. A **Meta Business Manager Account** ([business.facebook.com](https://business.facebook.com)).
3. A phone number for SmartOrbit WhatsApp Business (must be able to receive SMS/Voice OTP for verification, and not currently registered on regular WhatsApp mobile app on the same device without migration).

---

## 2. Step-by-Step Meta Developer Setup

### Step 2.1: Create a Meta App
1. Go to [developers.facebook.com/apps](https://developers.facebook.com/apps).
2. Click **Create App**.
3. Select **Other** > Next.
4. Select **Business** as the app type > Next.
5. Enter **App Name** (e.g. `SmartOrbit WhatsApp Intake`) and link your Meta Business Account > Click **Create App**.

### Step 2.2: Add WhatsApp Product
1. On the App Dashboard, find **WhatsApp** under *Add products to your app* and click **Set up**.
2. Under the left sidebar, navigate to **WhatsApp** > **API Setup**.
3. You will see:
   - **Temporary Access Token** (valid for 24h, for initial testing).
   - **Phone number ID** (e.g. `1029384756...` — save this as `META_PHONE_NUMBER_ID`).
   - **WhatsApp Business Account ID**.

---

## 3. Generate Permanent System User Access Token

> ⚠️ **Important:** Do NOT use the 24-hour temporary token in production. Follow these steps to generate a permanent token that never expires.

1. Go to **Meta Business Settings** ([business.facebook.com/settings](https://business.facebook.com/settings)).
2. Under **Users** > **System Users**, click **Add**.
3. Name it `SmartOrbit Admin Bot` and set Role to **Admin**.
4. Click **Add Assets**:
   - Select **Apps** > choose your `SmartOrbit WhatsApp Intake` app > enable **Full Control (Manage App)** > Save.
5. Click **Generate New Token**:
   - Select your SmartOrbit app.
   - Set Token Expiration to **Never**.
   - Select the following permissions:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
6. Click **Generate Token** and copy it immediately.
7. Save this token as your `META_WHATSAPP_TOKEN` environment variable.

---

## 4. Webhook Configuration in Meta

Once your website/backend is deployed on Vercel:

1. In Meta Developer Portal, go to **WhatsApp** > **Configuration**.
2. Next to **Webhook**, click **Edit**.
3. Enter:
   - **Callback URL**: `https://<YOUR-VERCEL-DOMAIN>/api/webhook` (e.g. `https://smartorbit.vercel.app/api/webhook`)
   - **Verify Token**: Enter your custom secret string (e.g. `smartorbit_verify_token_2026`). Must match `META_VERIFY_TOKEN` in your Vercel environment variables.
4. Click **Verify and Save**.
5. Under **Webhook fields**, click **Manage** and subscribe to:
   - `messages` (Checked ✅)
6. Click **Done**.

---

## 5. Webhook Signature Security (Optional but Recommended)

1. Go to **App Settings** > **Basic** in Meta Developer Portal.
2. Copy your **App Secret**.
3. Add it to Vercel environment variables as `META_APP_SECRET`.
4. The webhook will automatically verify HMAC SHA-256 signatures (`x-hub-signature-256`) on all incoming requests.

---

## 6. Verification Checklist

- [ ] Permanent token created (`META_WHATSAPP_TOKEN`)
- [ ] Phone Number ID copied (`META_PHONE_NUMBER_ID`)
- [ ] Webhook URL verified on Meta (`/api/webhook`)
- [ ] Subscribed to `messages` field
