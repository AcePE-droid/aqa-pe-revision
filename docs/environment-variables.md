# Environment variables

Every environment variable this project reads, what it does, where to get it,
and what breaks if it's missing. Copy `.env.example` to `.env.local` and work
through this page once.

Two other docs cover parts of this in more depth and are worth reading
alongside it:

- [`supabase-setup.md`](./supabase-setup.md) - creating the Supabase project
  and getting the first two variables.
- [`service-role-key-setup.md`](./service-role-key-setup.md) - the
  service_role key specifically, and why it's dangerous.

## Where values go

**Locally:** `.env.local` in the project root. It's gitignored (`.env*`) and
must stay that way. Restart `npm run dev` after editing it.

**In production:** your project on [vercel.com](https://vercel.com) ->
**Settings** -> **Environment Variables**, for the Production environment
(and Preview, if you use preview deployments).

**Redeploy after any change in Vercel.** Environment variables are baked in
at build/boot time; deployments that already exist keep the old values.

Only variables prefixed `NEXT_PUBLIC_` are sent to the browser. The other
four are server-only and must never gain that prefix.

## Quick reference

| Variable | Source | Needed locally | Needed in Vercel |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard | Yes | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard | Yes | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard | To test deletion | Yes |
| `RESEND_API_KEY` | Resend dashboard | To test the form | Yes |
| `FEEDBACK_TO_EMAIL` | You choose it | To test the form | Yes |
| `CRON_SECRET` | You generate it | Optional | Yes |

---

## `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Where from:** Supabase dashboard -> your project -> **Settings** -> **API**.
The URL is under *Project URL*; the key is under *Project API keys* ->
**`anon` `public`**. Both are designed to be public - Row Level Security is
what actually protects user data, not the secrecy of the anon key.

**Consumed in:** `lib/supabase/client.ts` (browser), `lib/supabase/server.ts`
(server components and route handlers), `middleware.ts` (session refresh), and
`lib/supabase/admin.ts` uses the URL.

**Without them:** nothing works. Sign-in, progress tracking, flashcard and
question results, friends, and the leaderboard all fail. Note that all four
call sites use a non-null assertion (`!`), so a missing value surfaces as a
confusing runtime error rather than a clear "not configured" message.

Full walkthrough: [`supabase-setup.md`](./supabase-setup.md).

---

## `SUPABASE_SERVICE_ROLE_KEY`

**Where from:** Supabase dashboard -> your project -> **Settings** -> **API**
-> *Project API keys* -> **`service_role`** (marked secret - click to reveal).
Some dashboards now show this under **Settings** -> **API Keys**. It's a long
JWT beginning `eyJ`.

**This key bypasses Row Level Security entirely.** Treat it like a database
admin password. Never commit it, never prefix it with `NEXT_PUBLIC_`, never
import the admin client from a Client Component.

**Consumed in:** `lib/supabase/admin.ts` - `createAdminClient()` reads it and
throws if it (or the Supabase URL) is missing.

**Without it,** two server routes fail:

- `app/api/delete-account/route.ts` catches the throw and returns 500
  `"Account deletion is not configured"`. The "Delete my account" button on
  `/account` fails for every user.
- `app/api/cron/recompute-leaderboard/route.ts` catches it and returns 500
  `"Not configured"`, so leaderboard ranks silently go stale.

Full walkthrough: [`service-role-key-setup.md`](./service-role-key-setup.md).

---

## `RESEND_API_KEY`

**Where from:** sign up at [resend.com](https://resend.com), then **API Keys**
-> **Create API Key**. "Sending access" permission is enough. The value starts
`re_` and is shown only once, so save it straight into `.env.local` and Vercel.

**Consumed in:** `app/api/feedback/route.ts` - checked in the configuration
guard, then used to construct the Resend client on each request.

**Without it:** a submission to `/feedback` passes validation and then returns
500 with the generic message *"Something went wrong. Please try again later."*
The real reason only appears in the server log. Nothing is queued or retried -
the feedback is simply lost.

### The sender-address constraint (read this one)

The route sends from `AcePE Feedback <onboarding@resend.dev>`, Resend's shared
test sender. It needs no domain verification, which is why it's there - but
**Resend only delivers mail from that address to the email address the Resend
account itself is registered with.** Feedback sent to any other address is
accepted by the API and never arrives.

So either:

- register your Resend account with the inbox you want feedback in, and set
  `FEEDBACK_TO_EMAIL` to that same address; or
- verify your own domain in Resend (**Domains** -> **Add Domain**, then add
  the DNS records it gives you) and change the `from:` address in
  `app/api/feedback/route.ts` to something on that domain. This is what you
  want eventually - the shared test sender is not suitable for production.

---

## `FEEDBACK_TO_EMAIL`

**Where from:** nowhere - you choose it. It's the inbox that receives feedback
submissions.

Use a plain address (`you@example.com`), not the `Name <you@example.com>`
display-name form: the value is passed straight to Resend's `to` field. And
per the constraint above, it currently has to be your Resend account's own
email address.

It's read from an environment variable rather than hardcoded specifically so
your address never appears in anything shipped to the browser.

**Consumed in:** `app/api/feedback/route.ts` - read at module scope, checked
in the same guard as `RESEND_API_KEY`, and used as the recipient.

**Without it:** exactly the same 500 as a missing `RESEND_API_KEY` - the guard
checks both together.

**Because it's read at module scope** it is captured when the serverless
function cold-starts. Changing it in Vercel needs a redeploy to take effect;
`RESEND_API_KEY` is read per-request and isn't subject to that.

---

## `CRON_SECRET`

**Where from:** generate your own. Don't reuse any other key:

```bash
openssl rand -hex 32
```

**Set it in Vercel.** `CRON_SECRET` is a name Vercel treats specially: when
the variable exists on the project, Vercel automatically sends
`Authorization: Bearer <CRON_SECRET>` with every cron invocation. There's
nothing to wire up in code. You only need it in `.env.local` if you want to
call the route by hand.

**Consumed in:** `app/api/cron/recompute-leaderboard/route.ts`, which
`vercel.json` schedules daily at 04:00 UTC. (Daily rather than more often
because Vercel's Hobby plan limits cron frequency.)

**Without it:** the route returns 500 `"Not configured"` and refuses to run.
Vercel's cron still fires, fails, and `recompute_leaderboard_ranks()` never
executes - so leaderboard positions freeze where they are, with no
user-visible error anywhere. Check the Vercel deployment logs if ranks look
stuck.

To test the route manually once it's set:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-deployment-url/api/cron/recompute-leaderboard
```

---

## Adding a new variable

1. Add the name, with an empty value and a one-line comment, to
   `.env.example`.
2. Document it here.
3. Add it in Vercel and redeploy.
4. If it's a secret, make sure it has no `NEXT_PUBLIC_` prefix and is only
   read from server-side code - route handlers, server components, or
   `middleware.ts`, never a `"use client"` component.
