import crypto from 'crypto';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
let PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

if (PRIVATE_KEY) {
  // Handle escaped newlines in env variables
  PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
}

let cachedAccessToken = null;
let tokenExpiresAt = 0;

/**
 * Creates a JWT and exchanges it for a Google OAuth2 access token
 */
async function getGoogleAccessToken() {
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedAccessToken;
  }

  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedClaimSet = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
  const unsignedToken = `${encodedHeader}.${encodedClaimSet}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  const signature = signer.sign(PRIVATE_KEY, 'base64url');
  const jwt = `${unsignedToken}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to obtain Google access token: HTTP ${res.status} ${errorText}`);
  }

  const tokenData = await res.json();
  cachedAccessToken = tokenData.access_token;
  tokenExpiresAt = Date.now() + tokenData.expires_in * 1000;
  return cachedAccessToken;
}

/**
 * Format date in DD-MMM-YYYY format (e.g. 20-Aug-2026)
 */
function formatDate(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Format time in hh:mm A format (e.g. 03:45 PM)
 */
function formatTime(date) {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, '0');
  return `${strHours}:${minutes} ${ampm}`;
}

/**
 * Appends a lead row to the "SmartOrbit Leads" Google Sheet
 */
export async function appendLeadToGoogleSheet(leadData, maxRetries = 2) {
  const now = new Date();
  const formattedDate = formatDate(now);
  const formattedTime = formatTime(now);

  const rowValues = [
    leadData.leadId || '',
    formattedDate,
    formattedTime,
    leadData.clientName || 'Unknown',
    leadData.whatsappNumber ? `+${leadData.whatsappNumber}` : '',
    leadData.service || '',
    leadData.initialMessage || '',
    leadData.source || 'website',
    leadData.entryPoint || 'unknown',
    leadData.conversationState || 'HUMAN_HANDOFF',
    leadData.leadStatus || 'New',
    leadData.lastContacted || '',
    leadData.notes || ''
  ];

  if (!SPREADSHEET_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    console.log('[Google Sheets Mock Log] Would append row:', rowValues);
    return { success: true, mock: true, row: rowValues };
  }

  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const accessToken = await getGoogleAccessToken();
      const range = encodeURIComponent('SmartOrbit Leads!A:M');
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [rowValues]
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Google Sheets API returned HTTP ${res.status}: ${errText}`);
      }

      const result = await res.json();
      console.log('[Google Sheets Append Success]', result.updates?.updatedRange);
      return { success: true, updates: result.updates };
    } catch (err) {
      lastError = err;
      console.error(`[Google Sheets Append Attempt ${attempt} Failed]`, err.message);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  console.error('[Google Sheets Append Exhausted Retries]', lastError);
  return { success: false, error: lastError?.message };
}
