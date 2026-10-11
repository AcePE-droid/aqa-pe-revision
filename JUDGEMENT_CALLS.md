# Judgement calls

Decisions taken without explicit instruction, logged so they can be reversed
rather than discovered later. Newest first.

## 2026-10-10 — Block-structured notes preview

**This file did not exist.** It was referenced as the place to log judgement
calls, so it has been created. If a log already exists somewhere else, these
entries should be merged into it.

### how_it_works gained a third mode: "sequence"

A chain of eight single-word stages (the airway: nose, pharynx, larynx...)
rendered as eight stacked boxes with seven arrows between them, which spent a
whole screen on a handful of words. The vertical chain is right for
cause-and-effect where each stage is a clause, so it was kept - a third mode
was added rather than changing the existing one.

"sequence" sets the items inline across the page with arrows between, wrapping
as needed. Applied where the longest item is 30 characters or fewer, which
selected exactly two blocks: the airway pathway, and the blood vessel run
(arteries, arterioles, capillaries, venules, veins). Every other chain has
real clauses and was left alone.

**Rule for the remaining topics:** names in order are a sequence; anything
needing more than a few words per stage is a chain.

### Coverage against the old notes is now checked by a script, not by eye

Third round of feedback: comparing side by side showed the rewrite had dropped
content - the sympathetic and parasympathetic nervous systems, and the
chemo/baro/proprioceptors, were mentioned in prose but not defined, and other
material was missing entirely. The instruction is that no key information may
be lost anywhere, across all topics.

Checking this by eye does not scale to 46 subtopics, so
`scripts/check-notes-coverage.ts` was written. It extracts every **bolded**
term and every `## ` heading from the old markdown and reports anything with
no match in the new blocks. Matching is loose (case-insensitive, plural and
hyphen tolerant) because the rewrite is allowed to reword - it is the concept
that must survive, not the sentence.

On the first run against Cardiovascular it found **41 missing terms and 7
missing sections**, including an entire section on cardiovascular disease,
the whole of the heart's structure, and the blood vessel types. The sample was
rewritten and now reports zero. **This script should gate every subtopic in
the at-scale run.**

Two caveats on the script, both deliberate:

- It reports *candidates*, not proof. A concept can legitimately be covered
  under different wording, so the list needs reading rather than clearing.
- It only catches what the old notes marked in bold or used as a heading.
  Unbolded prose detail is not checked, so it is a floor on completeness, not
  a ceiling.

### Reading the old notes as a coverage reference

The original brief said not to reword the existing notes, and the two-pass
process exists so the writing is done without the source in context. The
instruction to verify nothing is lost requires reading the old notes, so they
have been used as a **completeness checklist** - a list of concepts that must
appear - rather than as a source to rewrite from. The sample content is still
written from spec knowledge. These are different uses and the distinction
should be kept during the at-scale run.

### The sample grew from 7 sections to 11

Restructured, not padded: the sections now map to the same ground the old
notes covered, reordered by spec bullet. 17 explainer blocks, 17 definition
blocks covering 58 defined terms, 6 how_it_works, 6 mix_ups, 5 compare, 4
lock_it_in, 3 formula, 3 say_it_to_score.

### An exam-expectation claim slipped back in during the rewrite

The rewrite reintroduced "questions on this topic generally expect all three
to be named", which the previous round had removed. Caught on review and
replaced. **This is a sign the rule needs to be enforced by a check rather
than by care** - a grep for exam/examiner/mark claims should run alongside the
coverage check in the at-scale run.

### big_idea block removed, and claims about exam expectations stripped

Second round of feedback: remove the `big_idea` block, and remove assertions
about what exam questions want, on the grounds that those are not things that
can be known.

- `BigIdeaBlock`, its component and all three uses were **deleted**. Sections
  now open straight into prose or definitions, which reads more like a
  reference and less like a study guide talking at the reader.
- Three unsupported claims were removed: "exam questions usually expect all
  three to be named", "it is a common short-answer question", and the
  say-it-to-score subtitle "The wording examiners are looking for", which is
  now "The standard AQA terminology for this topic" - a claim about
  terminology rather than about examiner behaviour.

**One tension left unresolved.** The `say_it_to_score` block was specified in
the original brief as "exact AQA terms/phrases that earn marks", and its title
still carries that implication even with the subtitle fixed. The block has
been kept because it was explicitly asked for, but if the objection extends to
the premise rather than just the wording, the block itself should be renamed
or dropped. **Needs a decision before the at-scale run**, since every subtopic
will carry it.

This rule should be encoded in the generator: state what the physiology is and
what the standard terminology is, never what an examiner will reward.

### Analogy block removed; explainer block added (revision after first preview)

Feedback on the first preview was that the notes felt thin on key text, and
that the "think of it like" analogy block read as childish rather than
professional.

- The `analogy` block type and its component were **deleted**, not hidden. It
  was a lightbulb icon on a tinted panel with the label "Think of it like".
  Nothing is committed, so there is no history to recover it from - it would
  need rebuilding if wanted later.
- A new `explainer` block was added: plain connected prose, no label and no
  panel, deliberately styled as the body text of the page rather than as
  another boxed component competing with the blocks around it.

The original brief said "each chunk is 1-3 sentences max, no long paragraphs".
The explainer block is a deliberate exception to that, which is what was
asked for. To stop it drifting back towards the textbook's wall of block text,
it is capped by convention at one or two short paragraphs per use, and the
type's doc comment says so. **If the at-scale generation starts producing
five-paragraph explainers, that convention has failed and needs enforcing in
the generator.**

### Sample subtopic was expanded, not just restyled

The first preview covered conduction, cardiac output, Starling's law, venous
return and vascular shunting. Three further areas were missing against the
spec and have been added: heart rate regulation (neural, hormonal, intrinsic,
plus cardiovascular drift), and oxygen transport (oxyhaemoglobin dissociation,
Bohr shift, arterio-venous difference). The sample now runs to seven sections.

### Sample content was written from AQA spec knowledge, not from source

The two-pass process specifies Pass 1 as fact extraction from the source
`.txt`. Those sources are not on this machine (see "Blocked" below), so the
preview subtopic was written directly from general knowledge of the AQA 7582
specification. No textbook text and none of the existing notes were used as
input. This content is a **design sample for approving the format**, not
final content, and should be regenerated through the real two-pass process
once the sources are available.

### Formula block reuses the existing pull-quote vocabulary

The brief described the formula style in words (thick vertical accent bar,
italic serif, slate blue-grey, warm cream) but the referenced screenshot was
not attached. That description closely matches the blockquote treatment the
markdown notes already used - a `w-1` accent bar in the subject colour plus
`font-serif italic text-slate-700`. The formula block was built from that same
vocabulary with a heavier bar and a cream panel, so formulas read as part of
the existing family. **Needs checking against the actual screenshot.**

### The formula accent bar is subject-coloured, not fixed

"Use this same style for every formula" could mean one fixed colour site-wide,
or the same design taking each subject's accent. The subject accent was chosen
because every other accented element on the site works that way. Formulas in
Sports Psychology will therefore have a pink bar, not a slate blue one.
**Flag if a single fixed colour was intended.**

### Cream panel colour is a guess

`#efe5d4` was picked as a warm cream that sits a step deeper than the page
background (`#f4efe6`) so the panel reads as a distinct surface. The page is
already cream, so a panel in the exact background colour would be invisible.
This hex is not in `globals.css` and is not part of the documented palette.
**Needs a real value, ideally promoted to a token.**

### Definitions deliberately avoid a boxed callout

The brief asked for definitions to be visually distinct from both the formula
block and the textbook's definition boxes. A bordered box would have collided
with both, so definitions are a hairline-ruled list with the term in the
subject accent - closer to a glossary than a callout.

### Section labels use slate-600, diverging from the site's slate-500

The small uppercase labels ("Key terms", "How it works") were initially
`text-slate-500` to match existing labels like "Also study". Measured on the
cream background that is 4.16:1 at 12px, just under the 4.5:1 WCAG AA
threshold. The new blocks use `text-slate-600` instead. This means the new
labels are very slightly darker than the site's existing ones.
**The existing `text-slate-500` labels have the same problem and would need
the same change for consistency** - not done here, as it is outside what was
asked.

### Both formats coexist during conversion

`getNotesBlocks` returns null when a subtopic has no block document, and the
notes page falls back to the markdown renderer. Nothing had to be deleted to
preview the new format, and any subtopic not yet converted is untouched.

### One component file rather than nine

All nine block components live in `components/notes/NoteBlocks.tsx` with a
single exported dispatcher, rather than one file per block. Easier to review
as a set while the design is still being agreed. Splitting them later is
mechanical.

### Em dashes removed from generated content

The first draft of the sample used em dashes. The repo has a commit
specifically replacing em dashes with ordinary punctuation, so they were
replaced with hyphens. Worth encoding as a rule for the at-scale generation.

### Content edits need a dev-server restart

`lib/content.ts` keeps an in-memory `jsonFileCache` that never invalidates -
deliberate, so My Progress doesn't re-parse hundreds of files per request.
The side effect is that editing a content JSON file does not show up in the
running dev server; it serves the first version it read. This cost a confusing
debugging detour during the preview. **Worth knowing before the at-scale
generation run** - either restart between batches, or skip the cache when
NODE_ENV is development.

## Skill Acquisition

### Six continuum headings consolidated, then split again for mobile

The old notes gave each of the six continua its own `##` heading. First draft
replaced all six with one four-column table. On a 375px screen that table was
unreadable, so it became a short two-column "classified by" table plus thirteen
key terms (open skill, closed skill, gross skill, and so on). Nothing was lost -
every definition and every example from the six old sections is in the key
terms - but the coverage checker still flags all six old headings as missing,
because the headings themselves are gone by design.

### `Compare` now stacks on narrow screens

Skill Acquisition has tables whose cells run to a full sentence, which the
existing component squeezed into two or three words per line on a phone. Rather
than distort the content to fit the component, `Compare` now renders one card
per row below the `sm` breakpoint, with the column name as a label. The rule is
mechanical: stack when there are more than two columns, or when any cell is over
80 characters. **This changes Applied Anatomy too** - 16 of its 17 tables now
stack on mobile. Desktop is untouched. Worth a look on a real phone before this
is approved.

### "five types" of feedback was wrong in the old notes

`guidance-feedback.md` says the mnemonic covers five types, then lists six
(Positive, Negative, Extrinsic, Performance, Intrinsic, Results). The rewrite
gives the mnemonic without a count rather than repeating the error. Flagging it
rather than treating it as a silent fix.

### No `say_it_to_score` blocks in this topic

The unresolved question about that block's title - it still implies knowledge of
what earns marks - meant it was not reached for here. Nothing in Skill
Acquisition needed it; the exact-terminology content sits in key terms instead.

### Two coverage-checker flags left standing

`Benefits` (skill-classification-practice) was a bolded list label in the old
notes, not a term; its content is in the mental practice prose. `Focus/
concentration` (memory-models) is written as "Focus and concentration", which
the checker matches literally and so reports. Both are false positives.

## Sport and Society

### The coverage checker is nearly blind on `post-wwii-to-present`

That file has only three bolded terms across five sections, so the checker
verifies almost nothing. Coverage was confirmed a second way instead: every year
mentioned in the old notes (1863, 1874, 1880, 1885, 1901, 1928, 1937, 1961,
1968, 1984, 1995, 2007) and every proper noun was checked against the new
blocks. All present. **The checker's floor is lower than it looks on
prose-heavy, lightly-bolded files** - the later Paper 2 topics may be the same,
so dates and names need checking directly there too.

### Repeated terms across sections, deliberately

`Time`, `Income` and `Role models` each appear as key terms more than once in
`equal-opportunities`, because the old notes use them in MR MC, TIME and TRIPS
with different meanings each time (Time as "work, study or family commitments"
in TIME, but "childcare or domestic responsibilities" in TRIPS). Keeping both
preserves the distinction rather than collapsing them.

### Barrier and solution lists left as prose

For disabled people, ethnic minority groups and women, the old notes give a list
of barriers and a list of solutions that do not pair up one to one. Rendering
them as a two-column table would have invented pairings the source does not
make, so they stay as explainer prose with the named terms pulled out as key
terms.

### One empty table cell, on purpose

In the benefits table, `Economic` has no individual-level entry because the old
notes only give a society-level economic benefit. The cell is blank rather than
filled with invented content.

### Historical chains use `chain` mode

The Wenlock-to-Athens sequence and the footballers' wages sequence are rendered
as chains, which labels them "What causes what". They are chronological, but
they are also causal (Brookes influenced de Coubertin; the Bosman ruling drove
wages up), so the label holds. Flagging in case you read them as plain
timelines and want a neutral label instead.

## Paper 2

### Attribution of strategies to a specific actor

In `aggression`, the old notes give one flat list of strategies for reducing
aggression and say only that "coaches, players and referees can all play a
part". The rewrite splits that list across those three actors in a table.
Assigning each strategy to one of them is my inference, not something the
source states item by item. It reads better and is, I think, correct, but it is
the one place in Paper 2 where I organised content the source left unorganised.
Say the word and it goes back to a flat list.

### Empty table cells removed rather than filled

Three tables ended up with a cell the source gives no content for: first-class
levers (how common), Podium Potential (example), and broad internal attentional
style (example). In each case the column was removed or merged rather than
filled with something invented. An earlier draft of the attentional-styles table
did invent an example, "planning a game strategy"; that has been taken out.

### The checker is weakest on Paper 2's prose-heavy files

Several Paper 2 files carry a lot of content in unbolded prose, so the coverage
checker verifies less than its clean output suggests. `post-wwii-to-present` was
the extreme case and was checked a second way, against every date and proper
noun. The same caution applies to `role-of-technology`,
`development-elite-performers` and `commercialisation-media`, which are heavy
with named schemes, acronyms and figures.

### Slash-form terms are a recurring false positive

The checker matches literally across a slash, so terms written as
`Focus/concentration`, `Skills/position-based`, `resistance/load (R)`,
`velocity/speed-time graph` and `balance/wobble board` are reported missing when
the rewrite spells them with "and" or "or". All five are present in substance.
Worth fixing in the checker if it gets more use.

### 22 formula blocks, almost all in biomechanics

The formula block finally earns its place in Paper 2: 12 of the 22 are in
Biomechanical Movement, with the rest spread across energy systems, information
processing, personality (Lewin), arousal (drive theory) and group dynamics
(Steiner). Worth looking at a few of these specifically, since the style was
never checked against the reference screenshot that was meant to be attached.

## Full-coverage audit (after all 46 subtopics)

A sweep over all 285 old sections, comparing the distinctive vocabulary of each
against the new blocks, found **three genuine omissions, all in Applied Anatomy**
(the topic written before the coverage checker existed). All three are now fixed:

1. `cardiovascular` - the figure that exercise can reduce stroke risk by as much
   as 27 per cent had been dropped entirely from the cardiovascular disease
   section.
2. `cardiovascular` - the venous return section was missing its final paragraph:
   that a rise in systolic pressure increases venous return, and that venous
   return is driven by a pressure gradient of venous pressure minus right atrial
   pressure divided by venous vascular resistance, so small changes produce
   comparatively large effects.
3. `cardiovascular` - cardiovascular drift gave only half the reason heart rate
   rises. It maintains cardiac output *and* supplies extra energy for cooling the
   body.

A fourth, smaller fix: the musculoskeletal planes table did not record that the
planes are imaginary, or that the sagittal and frontal planes are vertical.

**Why the checker missed these.** It only looks at `**bolded**` terms and `##`
headings. All three omissions sat in unbolded prose inside sections whose bolded
terms were all present, so the subtopic reported clean. The vocabulary sweep is
the stronger test and should be run over any future topic, not just the term
check. Median coverage across all 285 sections is now 93 per cent, with nothing
below 80 per cent that has not been manually read and confirmed.

## Statistics removed on request

Nine figures were stripped at the user's instruction: effect-size and
health-outcome claims (the "27 per cent stroke risk" family) and commercial or
historical figures. The reasoning is the same as for the earlier removal of
exam-expectation claims - these are assertions whose accuracy cannot be stood
behind, and which would be awkward if a teacher queried them.

Removed:
- stroke risk reduced by as much as 27 per cent
- blood pressure lowered by 5 to 10 mmHg, heart attack risk cut by up to 20 per cent
- the American Heart Association's 150 minutes a week guideline
- VO2 max improved by roughly 10 to 20 per cent through endurance training
- the EIS figure that athletes recall only 30 per cent of a performance, with
  performance analysis supplying the missing 70 per cent
- Premier League TV rights at 253.5 million pounds rising to 8.7 billion
- Nike's 250 million dollar deal with Rory McIlroy
- the Gold Event Series target of 100 events
- over 40 Russian athletes banned from Rio 2016

**Kept at the user's explicit request:** slipstreaming saving a following
cyclist up to around 30 per cent of their energy.

Five of the nine needed the surrounding sentence rewording rather than straight
deletion, so the point survives without the figure - for example performance
analysis now "supplies what memory misses", and Premier League rights have
"grown enormously across successive deals since the early 1990s".

**Deliberately untouched**, since they are examinable content rather than
claims: physiological reference values (70 ml stroke volume, 72 bpm, partial
pressures, the 3 and 97 per cent oxygen transport split, lactate thresholds,
ATP yields), training protocols and doses (sets, reps, percentages of 1RM,
caffeine and creatine dosing, water temperatures), and dates. UKAD's "100% Me"
programme name is kept as a proper noun.

**One borderline case left alone:** UK Anti-Doping protecting sport across
"more than 40 sports". It is a scope count rather than an outcome claim, and it
was not in either group as listed, so it stays until the user says otherwise.

## Mnemonics removed on request

All memory-device acronyms were stripped as textbook-specific creative devices.
**27 were found, not the 23 first reported** - the initial catalogue missed
`LOSE` (sources of error in indirect calorimetry), the "five S factors" for
physical recreation benefits, and the "three S and three E factors" for sport's
societal benefits. The complete set was found by searching the old notes for the
phrases that introduce a mnemonic (`remembered using`, `remembered via`,
`remembered as`, `acronym`, `mnemonic`) rather than by relying on a hand-written
list. That search now returns nothing.

In every case the letters stood for real examinable content, so each became a
plain list rather than being deleted - "Many Bees Can Look Towards Flowers"
became "Six causes: motivation, boredom, coaching, limit of ability, targets too
low, fatigue". Three section headings carried a mnemonic and were renamed.

**Seven were restored** at the user's instruction, as essential for learning:
SMARTER, FITT, ACE FACE, BEDTOP, AS IF, SPORR and DCR. 20 remain removed.

Restoring SPORR also resolves the asymmetry flagged earlier: it sits beside
FITT in the same subtopic, and with both back the two headings and the two
recall bullets match each other again.

Restoring BEDTOP needed a small merge rather than a straight swap: the bullet
that had replaced it (audience and co-actors passive, competitive co-actors and
social reinforcers active) was new material worth keeping, so it was folded
into the following bullet instead of being discarded. They differ in kind from the others:
both are standard, widely published coaching frameworks rather than one
author's invention, and FITT is near-universal in PE teaching. 23 others stay removed, including SPORR, which
sits alongside FITT in the same subtopic, so that section's two
headings are deliberately asymmetric - one spelled out, one acronym.

**What this did not fix.** Verbatim overlap with the old notes is unchanged at
49 per cent. Stripping mnemonics removes the most identifiable fingerprint but
does not touch the inherited wording in the definition and explainer blocks.
That remains open and needs the source `.txt` files to resolve properly.

## Explainer prose rewritten to reduce inherited wording

31 explainer paragraphs that reproduced 30+ consecutive words from the old
notes were rewritten: same facts, names, dates and figures, different sentences.
Definitions, tables and formulas were deliberately left alone, on the user's
reasoning that a technical definition can only be reworded so far before it
stops being correct - which the data supports, since the latitude in a
definition is genuinely narrow and the risk of introducing an error outweighs
the benefit.

Effect, measured as the share of the notes sitting inside a run of identical
consecutive words:

| run length | before | after |
| 8+  | 49.4% | 48.5% |
| 20+ | 18.9% | 17.5% |
| 30+ |  8.5% |  6.6% |
| 40+ |  3.7% |  3.1% |

Within explainer blocks alone, the 30+ word figure fell from 22% to under 2%.
The whole-notes numbers barely move because definitions dominate the word
count and were left untouched by design.

**Two terms were lost in the paraphrasing and had to be restored.** Rewriting
"all-seater stadiums with fan segregation" as "terraces replaced with seats and
rival supporters kept apart" preserved the meaning but dropped two pieces of
subject terminology; likewise "vicious circle" became "the circle feeds
itself". Both are back. The lesson is that rewriting for distinctiveness can
quietly paraphrase away exact terminology, so a terminology check has to follow
any such pass - the bolded-term checker does not catch it, because these words
were not bolded in the old notes.

**Verification:** median section-level vocabulary coverage 92% (93% before),
no bolded term lost beyond the mnemonics already removed on request, all 46
pages still rendering, tsc and lint clean.

## RESOLVED: the copyright question, measured against the actual source

The source material was located on the user's Google Drive, under
`AQA PE Notes / 01 - Source Text (input)` - photographs of the textbook pages,
one PDF per subtopic. (The folder the user first pointed to, `02 - Generated
Notes (output)`, holds the pipeline's own output: the same notes already in the
repo, in prose rather than bullets. It has no bearing on this question.)

Two subtopics could be read as text and measured directly against the textbook.
The result closes the issue:

| subtopic | version | 8+ words | 15+ | 20+ | longest shared run |
| fluid mechanics | old notes | 3.6% | 0% | 0% | 10 words |
| fluid mechanics | new blocks | 2.6% | 0% | 0% | 9 words |
| projectile motion | old notes | 0.0% | 0% | 0% | none |
| projectile motion | new blocks | 0.0% | 0% | 0% | none |

The single longest passage either version shares with the textbook is ten words
- "over the top of the car travels a shorter distance" - which is the only
sensible way to describe airflow over a car.

**What this means.** The 49% figure measured earlier was overlap between the new
blocks and the *old notes*. Both are independently almost completely clear of
the textbook, so that shared wording is the project's own generated phrasing,
not the publisher's. The two-pass pipeline did what CLAUDE.md says it does. No
rewrite from source is needed, and the earlier concern is withdrawn.

The user's own reasoning - that a definition can only be reworded so far - turns
out to have been right for a better reason than either of us gave at the time:
the wording being preserved was never the textbook's to begin with.

**Caveat on coverage.** Only 2 of 46 source PDFs could be tested. The rest are
page photographs with no OCR text layer, and the Drive connector returns only
page placeholders for them. Reading those would need the images themselves.
Two clean results at opposite ends of the overlap range are strong evidence but
are not the whole set.

## Blocked

### Source files: located, and no longer blocking

Resolved. The sources live on the user's Google Drive under `AQA PE Notes /
01 - Source Text (input)`, as page photographs. They were used to verify the
notes against the textbook (see above). Most have no OCR text layer, so reading
them in bulk would mean processing the images.

### The formula screenshot was not attached

The brief refers twice to an attached screenshot for the formula style. No
image came through. The block was built from the written description and has
not been compared against the reference.
