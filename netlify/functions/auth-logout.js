/**
 * auth-logout.js — Netlify Function
 *
 * Clears the session cookie and redirects to the login page.
 * Link or redirect to /.netlify/functions/auth-logout from any page.
 */

exports.handler = async () => {
  return {
    statusCode: 302,
    headers: {
      Location: '/auth/login.html',
      'Set-Cookie': 'icf_auth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'Cache-Control': 'no-store',
    },
    body: '',
  };
};
