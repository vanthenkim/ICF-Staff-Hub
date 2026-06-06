/**
 * auth-guard.js — Netlify Edge Function
 *
 * Protects every page of the Staff Hub. Checks for a valid signed session
 * cookie (icf_auth). If missing or invalid, redirects to /auth/login.html.
 *
 * Cookie format:  base64(email|expiry) . hmac-sha256-hex(email|expiry, AUTH_SECRET)
 */

const ALLOWED_PREFIXES = [
  '/auth/',
  '/.netlify/',
  '/assets/',
];

const ALLOWED_EXACT = [
  '/service-worker.js',
  '/manifest.json',
];

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // Always allow auth pages, Netlify internals, static assets, and PWA files
  if (
    ALLOWED_EXACT.includes(path) ||
    ALLOWED_PREFIXES.some(p => path.startsWith(p))
  ) {
    return context.next();
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const token = parseCookie(cookieHeader, 'icf_auth');

  if (token && await verifyToken(token)) {
    return context.next();
  }

  // Redirect to login, preserving the original destination
  const loginUrl = new URL('/auth/login.html', url.origin);
  loginUrl.searchParams.set('redirect', path + url.search);
  return Response.redirect(loginUrl.toString(), 302);
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseCookie(header, name) {
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    if (key === name) return part.slice(eq + 1).trim();
  }
  return null;
}

async function verifyToken(token) {
  try {
    const dot = token.lastIndexOf('.');
    if (dot === -1) return false;

    const payloadB64 = token.slice(0, dot);
    const sig       = token.slice(dot + 1);
    const payload   = atob(payloadB64);

    const [email, expiryStr] = payload.split('|');
    if (!email || !expiryStr) return false;

    // Check expiry
    if (Date.now() > Number(expiryStr)) return false;

    // Enforce domain (belt-and-suspenders; callback also enforces this)
    if (!email.toLowerCase().endsWith('@icf-cambodia.com')) return false;

    // Verify HMAC signature
    const secret = Netlify.env.get('AUTH_SECRET');
    if (!secret) return false;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    const sigBytes = new Uint8Array(
      sig.match(/.{2}/g).map(b => parseInt(b, 16))
    );

    return await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payload));
  } catch {
    return false;
  }
}

export const config = { path: '/*' };
