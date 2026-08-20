const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

/**
 * Format a rich notification message for the freelancer
 */
export function formatLeadNotification(leadData) {
  return `🆕 *New SmartOrbit Lead*

*Lead ID:* ${leadData.leadId || 'N/A'}
*Client:* ${leadData.clientName || 'Unknown'}
*WhatsApp:* +${leadData.whatsappNumber || ''}

*Service:* ${leadData.service || 'Not specified'}

*Source:* ${leadData.source || 'website'}
*Entry Point:* ${leadData.entryPoint || 'unknown'}

*Initial Message:* "${leadData.initialMessage || ''}"

*Date:* ${leadData.date || new Date().toLocaleDateString()}
*Time:* ${leadData.time || new Date().toLocaleTimeString()}

*Status:* New
*State:* HUMAN_HANDOFF (Automation stopped, ready for your reply)`;
}

/**
 * Dispatches notification to configured channels (Telegram, Discord, etc.)
 */
export async function sendLeadNotification(leadData) {
  const messageText = formatLeadNotification(leadData);
  const results = { telegram: null, discord: null };

  // 1. Telegram
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: messageText,
          parse_mode: 'Markdown'
        })
      });
      results.telegram = res.ok;
    } catch (err) {
      console.error('[Notifier Telegram Error]', err.message);
      results.telegram = false;
    }
  }

  // 2. Discord Webhook
  if (DISCORD_WEBHOOK_URL) {
    try {
      const res = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageText
        })
      });
      results.discord = res.ok;
    } catch (err) {
      console.error('[Notifier Discord Error]', err.message);
      results.discord = false;
    }
  }

  if (!TELEGRAM_BOT_TOKEN && !DISCORD_WEBHOOK_URL) {
    console.log('[Notifier Local Log]', messageText);
  }

  return results;
}
