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

1. In your new project, go to **Settings → API** (left sidebar, gear icon → API).
2. You'll see two values you need:
   - **Project URL** — looks like `https://abcdefghijk.supabase.co`
   - **Project API keys → `anon` `public`** — a long string starting with `eyJ...`
3. Put these into two places:

   **Locally:** open `.env.local` in the project root and replace the
   placeholder values:
   ```
   NEXT_PUBLIC_SUPABASE_URL="https://abcdefghijk.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ...your-anon-key..."
   ```

   **In production (Vercel):** go to your project on
   [vercel.com](https://vercel.com) → **Settings → Environment Variables**,
   and add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   with the same values, for the **Production** (and Preview, if you use
   preview deployments) environment. Redeploy after adding them.

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
   - **Name**: anything, e.g. "PE Revision".
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

## 6. Done

Once `.env.local` has real values (step 3) and Google + magic link are
enabled (steps 4–5), the app is ready to test locally:

```
npm run dev
```

Visit `/login`, try both "Continue with Google" and the magic link form, and
confirm you land back on the homepage signed in.
