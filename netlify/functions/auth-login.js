/**
 * auth-login.js — Netlify Function
 *
 * Starts the Google OAuth 2.0 flow. Redirects the browser to Google's
 * consent page. The `hd` parameter hints that only @icf-cambodia.com
 * accounts should be offered (Google enforces it on its side too, and
 * the callback does a hard enforcement check).
 *
 * Required env vars:  GOOGLE_CLIENT_ID, URL (auto-set by Netlify)
 */

exports.handler = async (event) => {
  const redirect = event.queryStringParameters?.redirect || '/';

  const params = new URLSearchParams({
    client_id:    process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.URL}/.netlify/functions/auth-callback`,
    response_type: 'code',
    scope:        'email profile',
    hd:           'icf-cambodia.com',          // hosted-domain hint
    state:        encodeURIComponent(redirect), // carry original destination
    access_type:  'online',
    prompt:       'select_account',
  });

  return {
    statusCode: 302,
    headers: {
      Location:      `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      'Cache-Control': 'no-store',
    },
    body: '',
  };
};
