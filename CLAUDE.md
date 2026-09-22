# CLAUDE.md — Ace PE Project Context

AQA A-Level PE (7582) revision website. This file gives you the context you need
to operate in two modes:

1. **Diagnostic mode** — when I ask "what's wrong" or similar, scan the relevant
   code/UI yourself and report real issues, not guesses.
2. **Execution mode** — when I give an instruction, implement it fully and
   correctly, following the workflow rules below.

## Project overview

- Three main content sections: **Flashcards, Notes, Practice Questions**, each
  with distinct visual identities, plus a gamification layer (My Progress
  analytics, badges, leaderboards, friends system).
- I am the sole builder at this stage.

## Brand colours

`app/globals.css` is the source of truth for the hex values;
`lib/subject-styles.ts` decides which subject uses which token. Tailwind can't
detect dynamically-built class names, so every class string is written out in
full in `subject-styles.ts` rather than constructed at runtime.

| Hex | Token | Used for |
| --- | --- | --- |
| `#405487` | `--color-subject-anatomy` | Anatomy & Physiology accent |
| `#f5b4ae` | `--color-subject-psychology` | Sports Psychology accent |
| `#6fa189` | `--color-subject-society` | Sport, Society & History accent |
| `#736aec` | `--color-blue-600` | Site-wide highlight |
| `#f4efe6` | `--background` | Page background |
| `#0f172a` | `--foreground` | Body text |

The site-wide highlight (links, "Start now" CTAs, active nav underlines, small
badges) **deliberately overrides Tailwind's stock `blue-*` ramp**, so every
`blue-*` utility across the site renders violet, not blue. `blue-50/100/300/400/
500/600/700/800` are a proportional tint/shade ramp derived from `#736aec`.

The confetti hexes in `subject-styles.ts` are derived tints and shades of the
three subject accents — the accent hex itself is never altered.

Note on the solid subject cards: the three accents have very different
lightness, so they don't share one text colour. Navy takes white text; the
coral and green are mid-tone and fail contrast with white, so they use dark
text instead.

## Stack

- Next.js (App Router) on React 19, deployed via Vercel (Hobby plan), Supabase
  backend, Tailwind v4.
- **lucide-react** for all iconography, including badges. The badge spec was
  written against Tabler; lucide covers every requested icon 1:1, so it's reused
  rather than adding a second icon package. See the note at the top of
  `lib/badges.ts` — one originally-requested icon (`Users2`) no longer exists in
  the installed lucide version, which is why `badges.ts` keeps its own icon map
  instead of reading the `icon` column from the DB.
- `npm run lint` and `npm run build` are the only automated checks — there is no
  test suite.
- Content pipeline tooling (separate from live site runtime): Bash + pandoc for
  `.docx` source reading, Python/matplotlib (Agg backend) for graphs, Node.js
  `docx` package for output, LibreOffice headless for PDF verification.

## Content model

Static JSON/markdown under `content/`, read through `lib/content.ts`. Four
levels: **2 papers → 3 subjects → 10 topics → 46 subtopics.** All 46 subtopics
have all three content types, with no gaps:

| Type | Files | Items |
| --- | --- | --- |
| Flashcards | 46 | 2,407 |
| Questions | 46 | 752 |
| Notes | 46 | — |

Bucket (subtopic) names are the canonical cross-reference key — flashcards,
notes and questions all share the same naming.

Routing splits by section: flashcards and questions share a
`/[paperSlug]/[topicSlug]/[subtopicSlug]/` tree, while notes have their own
`/notes/[subjectSlug]/[topicSlug]/[subtopicSlug]/` tree keyed on subject.

## Section detail

**Flashcards**: known/learning counters, "still learning" persistence, hover
styling pulled from `subjectStyles`, shuffle toggle (off by default). Progress
is hybrid — `lib/progress.ts` backs anonymous visitors entirely with
localStorage, signed-in users go to Supabase. `FlashcardStudy.tsx` reads
Supabase progress but pulls "still learning" card IDs from localStorage either
way.

**Notes**: generated via a copyright-safe two-pass pipeline (facts extracted
first, notes written fresh from facts — no original source text in context).
One `.md` per subtopic, structured under `##` headings.

**Practice Questions**: CSV import via `npm run import:questions -- <path.csv>`.
The importer takes a CSV path as an argument — there is no fixed imports
directory. Expected columns:

```
Question Number, Question, Marks, Mark Scheme, Topic
```

plus optional `Is Multiple Choice`, `Options` (separated by " | "), and
`Correct Option` for MCQs. `Topic` is matched against `content/subtopics.json`;
`Sub-topic` is accepted as a legacy alias. Re-running is safe — rows whose
question text already exists in that subtopic are skipped.

Tariffs run 1–8 marks plus 15-markers, with a stray 12 and 14. 83 questions are
multiple choice. Extended-response mark schemes are overwhelmingly structured
by assessment objective (AO1/AO2/AO3), not banded Level 1–4 tables — only 4 of
the 119 extended-response questions use banded wording. The `Question` type has
no image or graph field, so questions are text-only.

**My Progress / Gamification**: coverage %, subject strength, weak-bucket focus
list, 7-day activity chart, 16 badges as lucide icon components (coloured circle
+ centred icon). Almost all of the logic lives in Postgres, not app code —
`recompute_user_score()` implements the leaderboard formula:

```
volume_points × (1 + accuracy_bonus × 0.10) × (1 + consistency_bonus × 0.20)
```

where volume is `flashcards × 1 + questions × 2`, accuracy is capped at 20
first-correct transitions, and consistency is capped at a 10-day streak. Scores
compute for both `all_time` and `weekly` windows, recomputed daily by a Vercel
cron at 04:00 (Hobby cron limit). Accuracy only credits first-correct
transitions, to block self-grading exploits.

`check_and_award_badges()` and `log_activity_event()` are `security definer`
specifically so a signed-in user can't self-award badges (especially the premium
one) by calling the tables directly from devtools.

Leaderboards and public profiles are free; the paywall is on premium toolkit
features only (anatomy explorer, streak-freeze tokens, exclusive badges) — not
yet implemented beyond the `toolkit_member` badge. Friends system: mutual
acceptance, always-on username discoverability.

## Known open issues

Check these still apply before reporting them fixed.

- Notes exist for all 46 buckets but depth is very uneven — roughly nine files
  sit under 3.5 KB (mostly the Paper 2 psychology buckets) against 14–20 KB for
  the anatomy bucket.
- The flashcard shuffle toggle is `useState(false)` on mount, so it resets on
  every navigation rather than persisting for the session.
- `README.md` is still create-next-app boilerplate. The real docs are in
  `docs/` (environment variables, service-role key setup, Supabase setup).

## How to behave

### When I ask "what's wrong" / "check the site" / similar diagnostic requests

- Actually inspect the relevant files, components and styles — don't speculate
  or recall from memory of past conversations.
- Cross-check against the bucket naming, CSV schema and brand/style conventions
  above so you can catch inconsistencies (e.g. a component not pulling from
  `subjectStyles`, a bucket name that doesn't match the finalised list, colours
  that drift from the documented hex values).
- Report concrete findings: file, location, what's wrong, why it's wrong. Don't
  fix anything yet unless I say so — surface first.

### When I give you an instruction to build or fix something

- Implement it fully and correctly — don't do a partial pass and leave TODOs
  unless something is genuinely blocked (e.g. missing credentials, ambiguous
  requirement). If blocked, say so specifically rather than shipping a half-done
  version silently.
- Match existing patterns already in the codebase (component structure, styling
  approach, naming) rather than introducing a new pattern for a one-off fix.
- Prefer **Concept B layouts** (hero banner + widget grid) over generic
  dashboard-card layouts for any new page or section — pages should feel like
  distinct motivational moments, not just data displays.

### Workflow — applies to all UI/feature work

1. Propose a plan in plain English first.
2. Pause and wait for my confirmation before implementing.
3. Implement.
4. Pause again before pushing/deploying — wait for explicit go-ahead.

*(Exception: the Notes content-generation pipeline runs straight through without
pause — Google Docs is the review environment for that one, not this
confirm-before-push flow.)*

### Other standing rules

- Copyright: never reproduce original source text directly into notes or any
  generated content — two-pass fact-extraction only.
- Any new service signup (hosting, email sending, notifications, etc.) — flag
  which email I should use (I have a dedicated site email separate from
  personal).
- CSV imports: read from a file on disk and pass the path to the import script —
  don't rely on pasted content in chat for bulk data.
