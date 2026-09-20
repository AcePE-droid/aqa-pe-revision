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
**Settings** -> **Environment Variables**.

**Redeploy after any change in Vercel.** Environment variables are baked in
at build/boot time; deployments that already exist keep the old values. This
cuts both ways: a bad value can't break a running deployment, and a good one
won't reach it either.

Only variables prefixed `NEXT_PUBLIC_` are sent to the browser. The other
four are server-only and must never gain that prefix.

### Two Vercel settings that are easy to get wrong

**Environments.** Tick **Production and Preview** for the two
`NEXT_PUBLIC_SUPABASE_*` variables. Without them a preview build dies while
prerendering `/_not-found`, because `middleware.ts` constructs a Supabase
client and the 404 page can't be statically exported without one. Production
is unaffected, so this fails quietly on pull requests while the live site
stays healthy - it went unnoticed across four PRs here.

In the environments dropdown, choose **Environments -> Preview**, not
**Preview Branches**. The latter scopes the variable to named branches only,
so every new branch reintroduces the same failure.

**Type: Config vs Secret.** A `NEXT_PUBLIC_` variable must be **Config**.
Secret values are write-only - Vercel will not let you read them back, or
convert them to Config afterwards - and the public prefix contradicts the
whole idea, since the value ends up in browser JavaScript regardless. If one
of these was created as a Secret, the only fix is to delete it and add it
again as Config.

The three unprefixed secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`,
`CRON_SECRET`) are the opposite: they should stay **Secret**.

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

**Where from:** Supabase dashboard -> your project -> **Project Settings**
(the gear at the foot of the left sidebar), then:

- **Data API** -> **Project URL** (or "API URL") for `NEXT_PUBLIC_SUPABASE_URL`.
  Take the bare origin: `https://<ref>.supabase.co`, with no trailing slash and
  no `/rest/v1` path. The `<ref>` also appears in the dashboard's own address
  bar, so you can read it from there.
- **API Keys** -> the **`anon` / publishable** key for
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Supabase is migrating key formats. Older projects have a JWT starting `eyJ`;
newer ones issue `sb_publishable_...`, with the old style under a **Legacy API
keys** tab. Use whichever this project is already running on, and treat a
format change as its own piece of work - not something to fold into an
unrelated deploy.

Both values are designed to be public - Row Level Security is what actually
protects user data, not the secrecy of the anon key. The `NEXT_PUBLIC_` prefix
means Next.js compiles them into the JavaScript every visitor downloads.

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

**Where from:** Supabase dashboard -> your project -> **Project Settings** ->
**API Keys** -> **`service_role`** (or **secret**, `sb_secret_...` on newer
projects). It is hidden behind a reveal button, which is how you tell it apart
from the publishable key sitting next to it.

**This key bypasses Row Level Security entirely.** Treat it like a database
admin password. Never commit it, never prefix it with `NEXT_PUBLIC_`, never
import the admin client from a Client Component.

**Consumed in:** `lib/supabase/admin.ts` - `createAdminClient()` reads it and
throws if it (or the Supabase URL) is missing.

**Without it,** three places degrade - and none of them crash, which is what
makes a missing key easy to miss:

- `app/api/delete-account/route.ts` catches the throw and returns 500
  `"Account deletion is not configured"`. The "Delete my account" button on
  `/account` fails for every user.
- `app/api/cron/recompute-leaderboard/route.ts` catches it and returns 500
  `"Not configured"`, so leaderboard ranks silently go stale.
- `app/my-progress/page.tsx` catches it and renders **empty leaderboards**.
  The page still loads and looks fine; the leaderboards are simply blank,
  with nothing on screen to say why.

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

### The sending domain

The route sends from `AcePE Feedback <feedback@mail.acepe.co.uk>`. That
address does not need a mailbox behind it - nothing is ever delivered to it,
and replies go to the person who submitted the form, because the route sets
`replyTo` to their address.

What it does need is for `mail.acepe.co.uk` to stay **Verified** in Resend
(**Domains**). Verification rests on three DNS records in the `acepe.co.uk`
zone:

| Type | Name | Points at |
| --- | --- | --- |
| TXT | `resend._domainkey.mail` | the DKIM public key |
| CNAME | `rsend.mail` | `rsend-euw1.forge.rmta.net` |
| CNAME | `send.mail` | `send.forge.rmta.net` |

Delete or alter any of those and sending stops. If mail suddenly vanishes,
check the domain's status in Resend before looking anywhere else.

To send from a different address, change the `from:` in
`app/api/feedback/route.ts`. Anything `@mail.acepe.co.uk` works without
further setup; a different domain needs verifying in Resend first.

---

## `FEEDBACK_TO_EMAIL`

**Where from:** nowhere - you choose it. It's the inbox that receives feedback
submissions.

Use a plain address (`you@example.com`), not the `Name <you@example.com>`
display-name form: the value is passed straight to Resend's `to` field. Any
inbox will do - the restriction to the Resend account's own address applied
only while the route sent from Resend's shared test sender, which it no
longer does.

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
