import {
  SERVICES,
  CONVERSATION_STATES,
  SOURCES,
  ENTRY_POINTS,
  MESSAGES,
  WEBSITE_PREFILL_SUBSTRING
} from './lib/constants.js';
import {
  isMessageProcessed,
  markMessageProcessed,
  getContactState,
  setContactState,
  generateLeadId,
  normalizePhone
} from './lib/stateManager.js';
import {
  sendServiceOptions,
  sendConfirmationMessage,
  verifyWebhookSignature
} from './lib/whatsapp.js';
import { appendLeadToGoogleSheet } from './lib/googleSheets.js';
import { sendLeadNotification } from './lib/notifier.js';

const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'smartorbit_verify_token_2026';

/**
 * Helper to match user text/payload to one of the 4 service options
 */
export function matchService(userInput) {
  if (!userInput) return null;
  const cleanInput = String(userInput).trim().toLowerCase();

  for (const service of SERVICES) {
    if (service.id === cleanInput) return service;
    if (service.name.toLowerCase() === cleanInput) return service;
    for (const alias of service.aliases) {
      if (cleanInput === alias || cleanInput.includes(alias)) {
        return service;
      }
    }
  }
  return null;
}

/**
 * Main webhook handler for Vercel Serverless Function
 */
export default async function handler(req, res) {
  // 1. Webhook Verification Handshake (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
      console.log('[Webhook Verification Success]');
      return res.status(200).send(challenge);
    }
    console.warn('[Webhook Verification Failed] Invalid token or mode.');
    return res.status(403).json({ error: 'Verification failed' });
  }

  // 2. Incoming WhatsApp Event Processing (POST)
  if (req.method === 'POST') {
    try {
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const signature = req.headers['x-hub-signature-256'];

      if (signature && !verifyWebhookSignature(signature, rawBody)) {
        console.error('[Webhook Signature Mismatch] Unauthorized request.');
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const body = req.body;
      if (body.object !== 'whatsapp_business_account') {
        return res.status(200).json({ status: 'ignored_non_whatsapp_event' });
      }

      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;

      // Handle delivery status updates (sent, delivered, read) without error
      if (value?.statuses && (!value.messages || value.messages.length === 0)) {
        return res.status(200).json({ status: 'status_ack' });
      }

      const messages = value?.messages;
      if (!messages || messages.length === 0) {
        return res.status(200).json({ status: 'no_messages' });
      }

      const message = messages[0];
      const messageId = message.id;
      const rawPhone = message.from;
      const from = normalizePhone(rawPhone);
      const contactInfo = value?.contacts?.[0];
      const profileName = contactInfo?.profile?.name || 'Valued Client';

      // 3. Idempotency Check
      if (await isMessageProcessed(messageId)) {
        console.log(`[Duplicate Webhook Event] Message ${messageId} already processed. Skipping.`);
        return res.status(200).json({ status: 'already_processed', messageId });
      }
      await markMessageProcessed(messageId);

      // Extract message text / interactive payload
      let messageText = '';
      if (message.type === 'text') {
        messageText = message.text?.body || '';
      } else if (message.type === 'interactive') {
        messageText = message.interactive?.list_reply?.id ||
                      message.interactive?.list_reply?.title ||
                      message.interactive?.button_reply?.id ||
                      message.interactive?.button_reply?.title || '';
      } else if (message.type === 'button') {
        messageText = message.button?.payload || message.button?.text || '';
      }

      console.log(`[Incoming Message] From: +${from} (${profileName}) | Type: ${message.type} | Text: "${messageText}"`);

      // 4. Retrieve Contact Conversation State
      const contact = await getContactState(from);

      // SAFE DECISION LOGIC:
      // If contact is in HUMAN_HANDOFF or MANUAL_CONVERSATION, DO NOTHING.
      if (contact && (contact.state === CONVERSATION_STATES.HUMAN_HANDOFF || contact.state === CONVERSATION_STATES.MANUAL_CONVERSATION)) {
        console.log(`[Safe Decision] Contact +${from} is in ${contact.state}. Automation remains silent.`);
        return res.status(200).json({ status: 'human_handoff_silent', phone: from });
      }

      // STATE: NEW CONTACT (NULL or NEW)
      if (!contact || contact.state === CONVERSATION_STATES.NEW) {
        const isWebsiteOrigin = messageText.toLowerCase().includes(WEBSITE_PREFILL_SUBSTRING);
        const source = isWebsiteOrigin ? SOURCES.WEBSITE : SOURCES.DIRECT_WHATSAPP;
        const entryPoint = isWebsiteOrigin ? ENTRY_POINTS.DISCUSS_PROJECT_BUTTON : ENTRY_POINTS.DIRECT_MESSAGE;

        await setContactState(from, {
          name: profileName,
          state: CONVERSATION_STATES.WAITING_FOR_SERVICE,
          source,
          entryPoint,
          initialMessage: messageText
        });

        console.log(`[New Lead Intake Started] +${from} | Source: ${source}`);
        await sendServiceOptions(from, MESSAGES.GREETING);

        return res.status(200).json({
          status: 'greeting_sent',
          phone: from,
          state: CONVERSATION_STATES.WAITING_FOR_SERVICE
        });
      }

      // STATE: WAITING_FOR_SERVICE
      if (contact.state === CONVERSATION_STATES.WAITING_FOR_SERVICE || contact.state === CONVERSATION_STATES.INTAKE_STARTED) {
        const selectedService = matchService(messageText);

        if (selectedService) {
          const leadId = await generateLeadId();

          // 1. Update State -> HUMAN_HANDOFF immediately to stop further automation
          const updatedContact = await setContactState(from, {
            state: CONVERSATION_STATES.HUMAN_HANDOFF,
            selectedService: selectedService.name,
            leadId
          });

          console.log(`[Service Selected] +${from} -> ${selectedService.name} | Lead ID: ${leadId}`);

          // 2. Send Confirmation Message
          await sendConfirmationMessage(from, selectedService.name);

          // 3. Save Lead in Google Sheets (async with retry)
          appendLeadToGoogleSheet({
            leadId,
            clientName: contact.name || profileName,
            whatsappNumber: from,
            service: selectedService.name,
            initialMessage: contact.initialMessage || '',
            source: contact.source || SOURCES.WEBSITE,
            entryPoint: contact.entryPoint || ENTRY_POINTS.UNKNOWN,
            conversationState: CONVERSATION_STATES.HUMAN_HANDOFF,
            leadStatus: 'New'
          }).catch(err => console.error('[Google Sheets Background Error]', err));

          // 4. Send Instant Freelancer Notification
          sendLeadNotification({
            leadId,
            clientName: contact.name || profileName,
            whatsappNumber: from,
            service: selectedService.name,
            initialMessage: contact.initialMessage || '',
            source: contact.source || SOURCES.WEBSITE,
            entryPoint: contact.entryPoint || ENTRY_POINTS.UNKNOWN
          }).catch(err => console.error('[Notification Background Error]', err));

          return res.status(200).json({
            status: 'lead_captured',
            leadId,
            service: selectedService.name,
            state: CONVERSATION_STATES.HUMAN_HANDOFF
          });
        } else {
          // Invalid reply -> Re-prompt with service options
          console.log(`[Invalid Service Choice] +${from} sent: "${messageText}". Re-prompting options.`);
          await sendServiceOptions(from, MESSAGES.INVALID_SELECTION);

          return res.status(200).json({
            status: 'invalid_choice_prompted',
            phone: from,
            state: CONVERSATION_STATES.WAITING_FOR_SERVICE
          });
        }
      }

      return res.status(200).json({ status: 'unhandled_state', state: contact?.state });
    } catch (err) {
      console.error('[Webhook Unhandled Exception]', err);
      // Return 200 to WhatsApp to avoid infinite redelivery loops, but log error
      return res.status(200).json({ error: 'Internal error logged safely' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
