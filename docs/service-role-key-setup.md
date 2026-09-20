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

If this key ever leaks, rotate it immediately in Supabase (**Project Settings
→ API Keys →** the `service_role`/secret key → regenerate), then update it in
`.env.local` and Vercel and redeploy - the old key keeps working in the
running deployment until you do.

## 1. Get the key from Supabase

1. In your Supabase project, open **Project Settings** (the gear at the foot
   of the left sidebar) → **API Keys**.
2. Find **`service_role`** — or **secret** (`sb_secret_...`) on newer
   projects.
3. Click to reveal it and copy the value.

It is the key kept behind a reveal button. The publishable/`anon` key beside
it is shown openly, because that one is meant to be public. Both begin `eyJ`
on older projects, so go by the label, not the shape.

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

Only via `lib/supabase/admin.ts`, which has three callers - all server-side,
and none of them a `"use client"` component:

- `app/api/delete-account/route.ts` - deleting the signed-in user's auth row.
- `app/api/cron/recompute-leaderboard/route.ts` - ranking every user's score,
  which per-user RLS policies don't allow.
- `app/my-progress/page.tsx` - reading the leaderboard tables, for the same
  reason.

Each caller wraps `createAdminClient()` in a try/catch and degrades rather
than crashing, so a missing key shows up as a broken delete button, stale
ranks, or empty leaderboards - never an error page.

If you add a fourth caller, add it here.
