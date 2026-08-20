import crypto from 'crypto';
import { MESSAGES, SERVICES } from './constants.js';

const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';
const META_WHATSAPP_TOKEN = process.env.META_WHATSAPP_TOKEN;
const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;

/**
 * Validates Meta webhook signature header (x-hub-signature-256)
 */
export function verifyWebhookSignature(signatureHeader, rawBody) {
  if (!META_APP_SECRET) {
    // If app secret is not configured in development, bypass signature check
    return true;
  }
  if (!signatureHeader || !rawBody) {
    return false;
  }

  const parts = signatureHeader.split('sha256=');
  if (parts.length !== 2) return false;
  const expectedSig = parts[1];

  const hmac = crypto.createHmac('sha256', META_APP_SECRET);
  hmac.update(rawBody);
  const digest = hmac.digest('hex');

  return crypto.timingSafeEqual(Buffer.from(digest, 'hex'), Buffer.from(expectedSig, 'hex'));
}

/**
 * Sends a raw message payload to WhatsApp Cloud API
 */
async function sendRawWhatsAppPayload(payload) {
  if (!META_WHATSAPP_TOKEN || !META_PHONE_NUMBER_ID) {
    console.log('[WhatsApp Mock Delivery]', JSON.stringify(payload, null, 2));
    return { mock: true, success: true };
  }

  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_PHONE_NUMBER_ID}/messages`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${META_WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[WhatsApp API Error] HTTP ${res.status}:`, errText);
      throw new Error(`WhatsApp API responded with HTTP ${res.status}: ${errText}`);
    }

    return await res.json();
  } catch (err) {
    console.error('[WhatsApp Network Error]', err);
    throw err;
  }
}

/**
 * Sends a plain text message to a WhatsApp number
 */
export async function sendTextMessage(to, text) {
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: String(to),
    type: 'text',
    text: {
      preview_url: false,
      body: text
    }
  };
  return await sendRawWhatsAppPayload(payload);
}

/**
 * Sends the 4 service options as an interactive list message
 * with automatic fallback to text message if list is rejected or unsupported
 */
export async function sendServiceOptions(to, introText = MESSAGES.GREETING) {
  const listRows = SERVICES.map(s => ({
    id: s.id,
    title: s.name.length > 24 ? s.name.substring(0, 24) : s.name,
    description: s.name
  }));

  const interactivePayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: String(to),
    type: 'interactive',
    interactive: {
      type: 'list',
      header: {
        type: 'text',
        text: 'SmartOrbit Services'
      },
      body: {
        text: introText
      },
      footer: {
        text: 'SmartOrbit Freelancers'
      },
      action: {
        button: 'Select Service',
        sections: [
          {
            title: 'Our Service Categories',
            rows: listRows
          }
        ]
      }
    }
  };

  try {
    return await sendRawWhatsAppPayload(interactivePayload);
  } catch (err) {
    console.warn('[WhatsApp Interactive Fallback] Sending plain text options instead.', err.message);
    return await sendTextMessage(to, introText);
  }
}

/**
 * Sends confirmation message after service selection
 */
export async function sendConfirmationMessage(to, serviceName) {
  const text = MESSAGES.CONFIRMATION(serviceName);
  return await sendTextMessage(to, text);
}
