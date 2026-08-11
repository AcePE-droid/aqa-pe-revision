// Canonical card container tokens (fix 6). Every card-style element —
// subject cards, topic cards, subtopic cards — shares these so cards feel
// identical across the site regardless of which section they're in.
// Card variants add their own layout/content classes alongside these; they
// must not override them.
export const CARD_BASE_CLASSES =
  "rounded-xl border border-slate-200 bg-white p-5 md:p-6 transition-all duration-200";

// Added on top of CARD_BASE_CLASSES for cards that are actually clickable
// links (as opposed to e.g. a disabled "coming soon" card).
export const CARD_INTERACTIVE_CLASSES = "hover:shadow-md cursor-pointer";

// Default hover border for cards with no per-subject accent. Cards that
// carry a subject accent (lib/subject-styles.ts) use their own hoverBorder
// instead of this.
export const CARD_HOVER_BORDER = "hover:border-slate-300";

// Default hover background for cards with no per-subject accent. Cards that
// carry a subject accent (lib/subject-styles.ts) use their own hoverBg
// instead of this.
export const CARD_HOVER_BG = "hover:bg-slate-50";
