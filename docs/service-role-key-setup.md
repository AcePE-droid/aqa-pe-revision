# Supabase service_role key setup (required for account deletion)

Part 3 of the accounts work adds a "Delete my account" flow. Deleting a
Supabase auth user requires the **service_role key** - a separate, much more
powerful key than the `anon` `public` key used everywhere else in this
project.

**This key bypasses Row Level Security entirely.** Treat it like a database
admin password:

- Never commit it to git (it must only ever live in `.env.local` locally and
  in Vercel's Environment Variables - never in a file that gets committed)
- Never expose it to the browser (it must not be prefixed with `NEXT_PUBLIC_`
  - it isn't, but double-check if you're ever adding new env vars)
- Never share it in chat, a support ticket, screenshots, etc.

If this key ever leaks, rotate it immediately in Supabase (Settings → API →
service_role key → regenerate).

## 1. Get the key from Supabase

1. In your Supabase project, go to **Settings → API**.
2. Under **Project API keys**, find **`service_role`** (marked **secret**).
3. Click to reveal it and copy the value.

## 2. Add it locally

Open `.env.local` in the project root and paste it in:

```
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

## 3. Add it in Vercel

Go to your project on [vercel.com](https://vercel.com) → **Settings →
Environment Variables**, add `SUPABASE_SERVICE_ROLE_KEY` with the same value,
for the **Production** (and Preview, if used) environment, then redeploy.

## 4. Where it's used

Only in one place: `lib/supabase/admin.ts`, imported only by the server-side
route handler at `app/api/delete-account/route.ts`. It is never imported by
any `"use client"` component.
