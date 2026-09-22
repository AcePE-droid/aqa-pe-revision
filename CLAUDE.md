# CLAUDE.md — Ace PE Project Context

You are working in the terminal on my AQA A-Level PE (7582) revision website,
built with Claude Code locally. This file gives you the context you need to
operate in two modes:

1. **Diagnostic mode** — when I ask "what's wrong" or similar, scan the relevant
   code/UI yourself and report real issues, not guesses.
2. **Execution mode** — when I give an instruction, implement it fully and
   correctly, to the best of your ability, following the workflow rules below.

## Project overview

- AQA A-Level PE (7582) revision site with three main content sections:
  **Flashcards, Notes, Practice Questions**, each with distinct visual
  identities, plus a gamification layer (My Progress analytics, badges,
  leaderboards, friends system).
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
`blue-*` utility across the site renders violet, not blue.

The confetti hexes in `subject-styles.ts` are derived tints and shades of the
three subject accents — the accent hex itself is never altered.

## Stack

- Next.js, deployed via Vercel (Hobby plan), Supabase backend.
- Development happens via Claude Code locally (VS Code or terminal) — this is
  you.
- **lucide-react** for all iconography, including badges. The badge spec was
  written against Tabler; lucide covers every requested icon 1:1, so it's reused
  rather than adding a second icon package — see the note at the top of
  `lib/badges.ts`.
- Content pipeline tooling (separate from live site runtime): Bash + pandoc for
  `.docx` source reading, Python/matplotlib (Agg backend) for graphs, Node.js
  `docx` package for output, LibreOffice headless for PDF verification.

## Site structure & current state

**Flashcards**: known/learning counters, "still learning" persistence via
localStorage, hover styling pulled from a `subjectStyles` lookup, shuffle toggle
(off by default).

**Notes**: generated via a copyright-safe two-pass pipeline (facts extracted
first, notes written fresh from facts — no original source text in context).
One `.md` per subtopic, structured under `##` headings.

**Practice Questions**: CSV import via
`npm run import:questions -- <path-to.csv>`. The importer takes a CSV path as an
argument — there is no fixed imports directory. Expected columns:

```
Question Number, Question, Marks, Mark Scheme, Topic
```

plus optional `Is Multiple Choice`, `Options` (separated by " | "), and
`Correct Option` for MCQs. `Topic` is matched against `content/subtopics.json`;
`Sub-topic` is accepted as a legacy alias. Re-running is safe — rows whose
question text already exists in that subtopic are skipped.

Extended-response mark schemes are structured by assessment objective
(AO1/AO2/AO3), not banded Level 1–4 tables. The `Question` type has no image or
graph field, so questions are text-only.

**My Progress / Gamification**: coverage %, subject strength, weak-bucket focus
list, 7-day activity chart, badges as lucide icon components (coloured circle +
centred icon). Leaderboard score:
`volume_points × (1 + accuracy_bonus × 0.10) × (1 + consistency_bonus × 0.20)`,
recomputed daily (Vercel Hobby cron limit). Accuracy bonus only credits
first-correct transitions per item, to block self-grading exploits.
Leaderboards/public profiles are free; paywall is on premium toolkit features
only (anatomy explorer, streak-freeze tokens, exclusive badges). Friends system:
mutual acceptance, always-on username discoverability.

**Content consistency**: flashcards, notes and questions all share the same
subtopic bucket naming across the site — treat bucket names as the canonical
cross-reference key.

## Known open issues

Check these still apply before reporting them fixed.

- Notes exist for all 46 buckets but depth is very uneven — roughly nine files
  sit under 3.5 KB (mostly the Paper 2 psychology buckets) against 14–20 KB for
  the anatomy bucket.

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

### Scope

- Do only what I ask. Don't make additional changes, corrections or
  improvements I haven't asked for — surface them and let me decide.

### Other standing rules

- Copyright: never reproduce original source text directly into notes or any
  generated content — two-pass fact-extraction only.
- Any new service signup (hosting, email sending, notifications, etc.) — flag
  which email I should use (I have a dedicated site email separate from
  personal).
- CSV imports: read from a file on disk and pass the path to the import script —
  don't rely on pasted content in chat for bulk data.
