/**
 * auth-callback.js — Netlify Function
 *
 * Handles the Google OAuth 2.0 callback.
 *   1. Exchanges the authorization code for an access token.
 *   2. Fetches the user's email from Google.
 *   3. Rejects anyone whose email is not @icf-cambodia.com.
 *   4. Issues a signed, HttpOnly session cookie (8-hour TTL).
 *   5. Redirects back to the originally requested page.
 *
 * Required env vars:  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET, URL
 */

const crypto = require('crypto');

// HMAC-SHA256 hex signature
function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function redirectTo(location) {
  return {
    statusCode: 302,
    headers: { Location: location, 'Cache-Control': 'no-store' },
    body: '',
  };
}

exports.handler = async (event) => {
  const { code, state, error } = event.queryStringParameters || {};

  if (error) {
    return redirectTo('/auth/login.html?error=google');
  }
  if (!code) {
    return redirectTo('/auth/login.html?error=no_code');
  }

  try {
    // ── 1. Exchange code for tokens ──────────────────────────────────────────
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  `${process.env.URL}/.netlify/functions/auth-callback`,
        grant_type:    'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      console.error('Token exchange failed:', tokens);
      return redirectTo('/auth/login.html?error=token');
    }

    // ── 2. Get user profile ──────────────────────────────────────────────────
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const user = await userRes.json();

    if (!user.email) {
      return redirectTo('/auth/login.html?error=no_email');
    }

    // ── 3. Enforce domain restriction ────────────────────────────────────────
    if (!user.email.toLowerCase().endsWith('@icf-cambodia.com')) {
      return redirectTo('/auth/login.html?error=domain');
    }

    // ── 4. Create signed cookie ──────────────────────────────────────────────
    const expiry  = Date.now() + 8 * 60 * 60 * 1000;        // 8 hours
    const payload = `${user.email}|${expiry}`;
    const sig     = sign(payload, process.env.AUTH_SECRET);
    const cookie  = `${Buffer.from(payload).toString('base64')}.${sig}`;

    // ── 5. Redirect to original destination ─────────────────────────────────
    const destination = decodeURIComponent(state || '/');

    return {
      statusCode: 302,
      headers: {
        Location:    destination,
        'Set-Cookie': `icf_auth=${cookie}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`,
        'Cache-Control': 'no-store',
      },
      body: '',
    };
  } catch (err) {
    console.error('Auth callback error:', err);
    return redirectTo('/auth/login.html?error=server');
  }
};
