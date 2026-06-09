# Google OAuth Setup Guide
## ICF Cambodia Staff Hub — Access Restriction

This guide sets up Google login so only `@icf-cambodia.com` accounts can access the Staff Hub.

---

## Step 1 — Create a Google OAuth App

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create a new project (or use an existing one), e.g. **"ICF Staff Hub"**
3. Navigate to **APIs & Services → OAuth consent screen**
   - User type: **Internal** (this limits access to your Google Workspace domain automatically)
   - App name: `ICF Cambodia Staff Hub`
   - User support email: your admin email
   - Save
4. Navigate to **APIs & Services → Credentials**
5. Click **+ Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `Staff Hub`
   - Authorized redirect URIs — add both:
     ```
     https://candid-moxie-b648e8.netlify.app/.netlify/functions/auth-callback
     ```
     *(If you add a custom domain later, add that URI too)*
6. Click **Create** — copy the **Client ID** and **Client Secret**

---

## Step 2 — Set Environment Variables in Netlify

1. Open [app.netlify.com](https://app.netlify.com/) → your site → **Site configuration → Environment variables**
2. Add these three variables:

| Variable | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | The Client ID from Step 1 |
| `GOOGLE_CLIENT_SECRET` | The Client Secret from Step 1 |
| `AUTH_SECRET` | A long random string (generate one below) |

**Generate AUTH_SECRET** — run this in your terminal or use any random string generator (32+ characters):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. Click **Save** after adding all three variables.

---

## Step 3 — Deploy

Push the code to your repo (or trigger a manual deploy in Netlify). The edge function activates on the next deploy.

---

## How It Works (Summary)

```
User visits any page
      ↓
Edge Function checks icf_auth cookie
      ↓ (missing or expired)
Redirect → /auth/login.html
      ↓ (clicks "Sign in with Google")
Google OAuth (only @icf-cambodia.com accounts allowed)
      ↓ (success)
Signed cookie set (8-hour session)
      ↓
User lands on original page ✓
```

**To log out:** link users to `/auth/logout`

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Redirect loop on login page | Check `GOOGLE_CLIENT_ID` is set in Netlify env vars |
| "domain" error after Google login | User signed in with a non-@icf-cambodia.com account |
| "token" error | Check `GOOGLE_CLIENT_SECRET` is correct |
| Works locally but not in production | Make sure the Netlify deploy completed after adding env vars |
