import { CONVERSATION_STATES } from './constants.js';

// In-memory fallback cache for development/testing when Redis env vars are absent
const memoryStore = {
  contacts: new Map(),
  processedMessages: new Set(),
  leadCounters: new Map()
};

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisCommand(command, ...args) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return null;
  }
  try {
    const res = await fetch(`${UPSTASH_URL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([command, ...args])
    });
    if (!res.ok) {
      console.error(`[Redis Error] HTTP ${res.status}: ${await res.text()}`);
      return null;
    }
    const data = await res.json();
    return data.result;
  } catch (err) {
    console.error('[Redis Network Error]', err);
    return null;
  }
}

/**
 * Normalizes phone number to digits only
 */
export function normalizePhone(rawPhone) {
  if (!rawPhone) return '';
  return String(rawPhone).replace(/[^\d]/g, '');
}

/**
 * Check if a WhatsApp message ID has already been processed (Idempotency)
 */
export async function isMessageProcessed(messageId) {
  if (!messageId) return false;
  
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    const exists = await redisCommand('EXISTS', `msg:${messageId}`);
    return exists === 1;
  }
  return memoryStore.processedMessages.has(messageId);
}

/**
 * Mark a WhatsApp message ID as processed (TTL 24 hours = 86400s)
 */
export async function markMessageProcessed(messageId) {
  if (!messageId) return;

  if (UPSTASH_URL && UPSTASH_TOKEN) {
    await redisCommand('SET', `msg:${messageId}`, '1', 'EX', '86400');
  } else {
    memoryStore.processedMessages.add(messageId);
  }
}

/**
 * Retrieve contact conversation state
 */
export async function getContactState(rawPhone) {
  const phone = normalizePhone(rawPhone);
  if (!phone) return null;

  if (UPSTASH_URL && UPSTASH_TOKEN) {
    const raw = await redisCommand('GET', `contact:${phone}`);
    if (!raw) return null;
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return null;
    }
  }

  return memoryStore.contacts.get(phone) || null;
}

/**
 * Persist contact conversation state
 */
export async function setContactState(rawPhone, stateData) {
  const phone = normalizePhone(rawPhone);
  if (!phone) return;

  const existing = (await getContactState(phone)) || {};
  const updated = {
    ...existing,
    ...stateData,
    phone,
    updatedAt: new Date().toISOString(),
    createdAt: existing.createdAt || new Date().toISOString()
  };

  if (UPSTASH_URL && UPSTASH_TOKEN) {
    await redisCommand('SET', `contact:${phone}`, JSON.stringify(updated));
  } else {
    memoryStore.contacts.set(phone, updated);
  }

  return updated;
}

/**
 * Reset contact state (Admin only)
 */
export async function resetContactState(rawPhone) {
  const phone = normalizePhone(rawPhone);
  if (!phone) return false;

  if (UPSTASH_URL && UPSTASH_TOKEN) {
    await redisCommand('DEL', `contact:${phone}`);
  } else {
    memoryStore.contacts.delete(phone);
  }
  return true;
}

/**
 * Generate unique sequential Lead ID in format SO-YYYYMMDD-XXXX
 */
export async function generateLeadId() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

  let counter = 1;

  if (UPSTASH_URL && UPSTASH_TOKEN) {
    const res = await redisCommand('INCR', `lead_seq:${dateStr}`);
    counter = typeof res === 'number' ? res : 1;
  } else {
    const current = memoryStore.leadCounters.get(dateStr) || 0;
    counter = current + 1;
    memoryStore.leadCounters.set(dateStr, counter);
  }

  const padded = String(counter).padStart(4, '0');
  return `SO-${dateStr}-${padded}`;
}

/**
 * Clear in-memory store (for unit tests)
 */
export function _resetMemoryStoreForTesting() {
  memoryStore.contacts.clear();
  memoryStore.processedMessages.clear();
  memoryStore.leadCounters.clear();
}
