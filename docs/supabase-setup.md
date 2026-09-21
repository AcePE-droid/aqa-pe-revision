# Supabase setup (do this before deploying auth)

This project uses Supabase for user accounts (magic link + Google sign-in).
Supabase can't be set up automatically — follow these steps once, in order.

## 1. Create a Supabase account

1. Go to [supabase.com](https://supabase.com) and click **Start your project**.
2. Sign up (GitHub sign-in is easiest) if you don't already have an account.

## 2. Create a new project

1. From the Supabase dashboard, click **New project**.
2. Choose your organisation (or create one — any name is fine).
3. **Name**: `aqa-pe-revision` (or anything you'll recognise).
4. **Database password**: click "Generate a password" and **save it somewhere
   secure** (a password manager). You won't need it for this setup, but
   you'll need it later if you ever connect to the database directly.
5. **Region**: choose a region close to the UK — **`eu-west-2` (London)** if
   available, otherwise **`eu-central-1` (Frankfurt)**.
6. Click **Create new project**. Wait 1–2 minutes for it to finish provisioning.

## 3. Get your API URL and anon key

1. In your new project, open **Project Settings** (gear icon at the foot of
   the left sidebar). The two values live on separate pages:
   - **Data API → Project URL** (sometimes labelled "API URL") — looks like
     `https://abcdefghijk.supabase.co`. Use the bare origin: no trailing
     slash, and trim any `/rest/v1` path if the page shows one.
   - **API Keys → `anon` / publishable** — a long string starting `eyJ...`,
     or `sb_publishable_...` on newer projects. If both exist, the older JWT
     is under a **Legacy API keys** tab; stick with whichever this project
     already uses.
2. Put these into two places:

   **Locally:** open `.env.local` in the project root and replace the
   placeholder values:
   ```
   NEXT_PUBLIC_SUPABASE_URL="https://abcdefghijk.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ...your-anon-key..."
   ```

   **In production (Vercel):** go to your project on
   [vercel.com](https://vercel.com) → **Settings → Environment Variables**,
   and add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   with the same values. Tick **Production and Preview** for both, and set
   **Type: Config**, not Secret — see "Two Vercel settings that are easy to
   get wrong" in [`environment-variables.md`](./environment-variables.md),
   because getting either wrong breaks preview deployments in a way that
   leaves the live site looking fine. Redeploy after adding them.

   For this step, only use the `anon` `public` key — it's the only one safe
   to expose to the browser. The site also uses the `service_role` key (for
   account deletion) — see `docs/service-role-key-setup.md` for that,
   separately; it's a secret, server-only key and doesn't go in
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 4. Enable Google sign-in

This requires creating a Google Cloud OAuth client first, then telling
Supabase about it.

### 4a. Get the redirect URI from Supabase

1. In Supabase, go to **Authentication → Providers**, find **Google** in the
   list, and click to expand it.
2. Copy the **Callback URL (for OAuth)** shown there — it will look like:
   ```
   https://abcdefghijk.supabase.co/auth/v1/callback
   ```
   (Same project ref as your Project URL, with `/auth/v1/callback` on the
   end.) You'll paste this into Google Cloud in the next step.
3. Leave this Supabase tab open — you'll come back to paste in Google's
   credentials shortly.

### 4b. Create a Google OAuth client

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing one) from the project
   dropdown at the top.
3. Go to **APIs & Services → OAuth consent screen**.
   - User type: **External**.
   - Fill in the required fields (app name, your email as support/contact
     email). You don't need to add scopes or test users for this.
   - Publish the app (or leave in testing mode if you only want to test with
     your own Google account initially — you can publish later).
4. Go to **APIs & Services → Credentials**.
5. Click **Create Credentials → OAuth client ID**.
   - **Application type**: Web application.
   - **Name**: anything, e.g. "AcePE".
   - **Authorized redirect URIs**: click **Add URI** and paste the Supabase
     callback URL you copied in step 4a
     (`https://abcdefghijk.supabase.co/auth/v1/callback`).
   - Click **Create**.
6. Google will show you a **Client ID** and **Client secret** — copy both.

### 4c. Paste the Google credentials into Supabase

1. Back in the Supabase tab (**Authentication → Providers → Google**):
   - Toggle **Enable Sign in with Google** on.
   - Paste the **Client ID** and **Client secret** from Google.
   - Click **Save**.

## 5. Enable email confirmation for magic links

1. In Supabase, go to **Authentication → Sign In / Providers → Email**
   (or **Authentication → Settings**, depending on the dashboard version).
2. Make sure **Confirm email** is turned on. This is what makes the magic
   link flow work (Supabase emails a one-time sign-in link instead of a
   password).
3. Supabase's default email sender works out of the box for testing, but has
   a low sending limit. If magic link emails stop arriving after testing a
   lot, you'll want to set up a custom SMTP provider under
   **Project Settings → Auth → SMTP Settings** — not required to get started.

### 5a. Point the magic link emails at `/auth/callback` directly

**This is required.** With Supabase's default templates, magic links only work
if the link is opened in the same browser that requested it — and it usually
isn't, because people click links from a mail app. Skipping this leaves every
such student stuck on "Something went wrong signing you in".

The default templates use `{{ .ConfirmationURL }}`, which routes through
Supabase and comes back to the site carrying a PKCE `code`. Exchanging that
code needs a verifier cookie stored in the browser that called
`signInWithOtp` — a different browser doesn't have it, so the exchange fails.
A `token_hash` carries no browser-bound state and works from anywhere, which
is what `app/auth/callback/route.ts` verifies instead.

Under **Authentication → Emails** (called **Email Templates** in some
dashboard versions), edit both of these templates. Each ships with an
`<a href="{{ .ConfirmationURL }}">` — replace just that `href`:

| Template | New `href` |
| --- | --- |
| **Magic Link** | `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=magiclink` |
| **Confirm signup** | `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=signup` |

Both templates matter: a returning student gets **Magic Link**, someone
signing up for the first time gets **Confirm signup**.

`{{ .RedirectTo }}` is the `emailRedirectTo` the browser sent, which
`app/login/page.tsx` builds from the current origin — so a link requested on
localhost points back at localhost, and one requested on the live site points
at the live site. If a test email arrives with a link starting `?token_hash=`
then that variable rendered empty on your project; use
`{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink`
instead, accepting that local magic links will then point at production.

Test it the way a student will: request a link on the live site, then open it
from your phone, or paste it into a different browser. That is the case the
old setup failed.

## 6. Set the site and redirect URLs

Skipping this is what breaks sign-in after the site moves to a new domain,
and it fails quietly: when a redirect target isn't on the allowlist Supabase
doesn't error, it silently falls back to the Site URL. The symptom is landing
back on `localhost` or the old domain rather than seeing a message.

1. Go to **Authentication → URL Configuration**.
2. Set **Site URL** to the canonical origin — `https://www.acepe.co.uk`.
   No trailing slash, and `www`: the apex and the `.vercel.app` deployment
   URL both 308-redirect there.
3. Under **Redirect URLs**, add every origin that serves `/auth/callback`:

   | URL | Why |
   | --- | --- |
   | `https://www.acepe.co.uk/auth/callback` | production |
   | `http://localhost:3000/auth/callback` | local dev |
   | `https://aqa-pe-revision-*.vercel.app/auth/callback` | Vercel previews (optional; globs are allowed) |

Both sign-in paths in `app/login/page.tsx` build their redirect from
`window.location.origin`, so they follow whatever host the browser is on —
which is exactly why each of those hosts has to be listed here.

Nothing needs redeploying; these apply immediately. The Google OAuth client
in Google Cloud Console is unaffected — its redirect URI points at
`https://<project>.supabase.co/auth/v1/callback`, which doesn't change with
the site's domain.

## 7. Done

Once `.env.local` has real values (step 3), Google + magic link are
enabled (steps 4–5) and the URLs are allowlisted (step 6), the app is ready
to test locally:

```
npm run dev
```

Visit `/login`, try both "Continue with Google" and the magic link form, and
confirm you land back on the homepage signed in.
