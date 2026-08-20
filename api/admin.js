import {
  getContactState,
  setContactState,
  resetContactState,
  normalizePhone
} from './lib/stateManager.js';
import { CONVERSATION_STATES } from './lib/constants.js';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'smartorbit_admin_secret_2026';

function isAuthorized(req) {
  const headerKey = req.headers['x-admin-key'];
  const queryKey = req.query?.key;
  return (headerKey === ADMIN_API_KEY || queryKey === ADMIN_API_KEY);
}

export default async function handler(req, res) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
  }

  // GET: Status check
  if (req.method === 'GET') {
    const phone = req.query?.phone;
    if (phone) {
      const contact = await getContactState(phone);
      return res.status(200).json({ phone: normalizePhone(phone), contact: contact || { state: 'NEW' } });
    }

    return res.status(200).json({
      status: 'online',
      system: 'SmartOrbit WhatsApp Intake Automation',
      availableStates: CONVERSATION_STATES
    });
  }

  // POST: Admin Actions (Reset / State Update)
  if (req.method === 'POST') {
    const { action, phone, state } = req.body || {};
    const normalized = normalizePhone(phone);

    if (!normalized) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (action === 'reset') {
      await resetContactState(normalized);
      console.log(`[Admin Action] Reset conversation state for +${normalized}`);
      return res.status(200).json({
        success: true,
        message: `Contact +${normalized} state reset to NEW successfully.`
      });
    }

    if (action === 'set_state' && state) {
      if (!CONVERSATION_STATES[state]) {
        return res.status(400).json({ error: `Invalid state. Must be one of: ${Object.keys(CONVERSATION_STATES).join(', ')}` });
      }
      const updated = await setContactState(normalized, { state });
      return res.status(200).json({
        success: true,
        message: `Contact +${normalized} state updated to ${state}`,
        contact: updated
      });
    }

    return res.status(400).json({ error: 'Unsupported action. Use action: "reset" or "set_state".' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
