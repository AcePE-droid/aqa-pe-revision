// Canonical card container tokens (fix 6). Every card-style element —
// subject cards, topic cards, subtopic cards — shares these so cards feel
// identical across the site regardless of which section they're in.
// Card variants add their own layout/content classes alongside these; they
// must not override them.
//
// Deliberately excludes a border colour: subject-scoped cards need a
// permanently-visible accent border (lib/subject-styles.ts `border` field),
// while subject-agnostic cards fall back to CARD_BORDER_DEFAULT below. Every
// consumer of CARD_BASE_CLASSES must supply one or the other explicitly.
// Shared shape/spacing, deliberately excluding a background colour so
// solid-fill subject cards (SubjectCard, QuestionSubjectCard) can supply
// their own accent background instead of the default white below.
export const CARD_SHAPE_CLASSES = "rounded-xl border p-5 md:p-6 transition-all duration-200";

export const CARD_BASE_CLASSES = `${CARD_SHAPE_CLASSES} bg-white`;

// Added on top of CARD_BASE_CLASSES for cards that are actually clickable
// links (as opposed to e.g. a disabled "coming soon" card).
export const CARD_INTERACTIVE_CLASSES = "hover:shadow-md cursor-pointer";

// Default (permanent) border colour for cards with no per-subject accent.
export const CARD_BORDER_DEFAULT = "border-slate-200";

// Extra hover darkening for cards with no per-subject accent. Cards that
// carry a subject accent (lib/subject-styles.ts) already show their accent
// border at all times, so hover:shadow-md (from CARD_INTERACTIVE_CLASSES)
// alone is their hover cue.
export const CARD_HOVER_BORDER = "hover:border-slate-300";

// Default hover background for cards with no per-subject accent. Cards that
// carry a subject accent (lib/subject-styles.ts) use their own hoverBg
// instead of this.
export const CARD_HOVER_BG = "hover:bg-slate-50";
