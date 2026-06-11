/**
 * calendar-proxy.js — Netlify Function
 *
 * Fetches a Google Calendar ICS feed server-side and returns it to the client.
 * Requires a valid icf_auth session cookie — unauthenticated requests are
 * rejected with 401 before any calendar data is returned.
 *
 * Usage:  /.netlify/functions/calendar-proxy?cal=lunch
 *         /.netlify/functions/calendar-proxy?cal=birthday
 *
 * Required env var:  AUTH_SECRET  (same secret used by auth-callback)
 */

const crypto = require('crypto');

const CALENDARS = {
  lunch:    'c_16d101edc06a072b283e851d543b6a024cada259be1b6be3dfd098272aa56fb9%40group.calendar.google.com',
  birthday: 'icf-campus.com_fm6n628u1trm8b0evais34neu8%40group.calendar.google.com',
};

// ─── Auth helpers (mirrors auth-callback / auth-guard logic) ─────────────────

function parseCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return null;
}

function verifyToken(token, secret) {
  try {
    const dot = token.lastIndexOf('.');
    if (dot === -1) return false;

    const payloadB64 = token.slice(0, dot);
    const sig        = token.slice(dot + 1);
    const payload    = Buffer.from(payloadB64, 'base64').toString('utf8');

    const [email, expiryStr] = payload.split('|');
    if (!email || !expiryStr) return false;
    if (Date.now() > Number(expiryStr)) return false;
    if (!email.toLowerCase().endsWith('@icf-cambodia.com')) return false;

    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    // Constant-time comparison to prevent timing attacks
    if (expected.length !== sig.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    console.error('AUTH_SECRET env var is missing');
    return { statusCode: 500, body: 'Server misconfiguration' };
  }

  // 1. Verify session cookie
  const cookieHeader = event.headers['cookie'] || event.headers['Cookie'] || '';
  const token = parseCookie(cookieHeader, 'icf_auth');

  if (!token || !verifyToken(token, secret)) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Unauthorized — please sign in first.',
    };
  }

  // 2. Resolve calendar
  const cal   = (event.queryStringParameters || {}).cal;
  const calId = CALENDARS[cal];

  if (!calId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: `Unknown calendar "${cal}". Valid values: ${Object.keys(CALENDARS).join(', ')}`,
    };
  }

  // 3. Fetch ICS from Google (server-side — no CORS issue)
  try {
    const icsUrl = `https://calendar.google.com/calendar/ical/${calId}/public/basic.ics`;
    const resp   = await fetch(icsUrl, { headers: { 'User-Agent': 'ICF-Staff-Hub/1.0' } });

    if (!resp.ok) {
      console.error(`Google Calendar returned ${resp.status} for cal="${cal}"`);
      return { statusCode: 502, body: `Calendar fetch failed (${resp.status})` };
    }

    const ics = await resp.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type':  'text/calendar; charset=utf-8',
        'Cache-Control': 'private, no-cache',
      },
      body: ics,
    };
  } catch (err) {
    console.error('calendar-proxy error:', err);
    return { statusCode: 502, body: 'Failed to fetch calendar' };
  }
};
