// Per-subject accent colours, used sparingly across the site (icons, progress
// bars, hover borders, study-mode breadcrumb) so a student always has a
// visual anchor to which subject they're in.
//
// Tailwind can't detect dynamically-constructed class names like
// `text-${color}-700`, so every class string used anywhere in the app must
// be written out in full here rather than built at runtime.

export type SubjectStyle = {
  icon: string;
  progressBar: string;
  lightBg: string;
  hoverBorder: string;
  hoverBg: string;
  // Stronger hover border cue than `hoverBorder`, for the study-mode
  // flashcard specifically (it's the sole focal point of that screen, so it
  // warrants a more visible signal than the -300 shade used on regular
  // cards). Stored pre-fixed with `group-hover:` since that's the only place
  // this field is used.
  hoverBorderStrong: string;
  // Hex colours for the deck-mastery confetti celebration (FlashcardStudy).
  // canvas-confetti needs real colour values rather than Tailwind classes,
  // so these are written out as hex (300/400/600 shades of the accent).
  confettiColors: string[];
};

const DEFAULT_STYLE: SubjectStyle = {
  icon: "text-blue-600",
  progressBar: "bg-blue-600",
  lightBg: "bg-blue-50",
  hoverBorder: "hover:border-blue-300",
  hoverBg: "hover:bg-slate-50",
  hoverBorderStrong: "group-hover:border-blue-400",
  confettiColors: ["#93c5fd", "#60a5fa", "#2563eb"],
};

// Keyed by subject slug (matches `getSubjects()` in lib/content.ts, i.e.
// `slugify(topic.subject)`).
export const subjectStyles: Record<string, SubjectStyle> = {
  "anatomy-physiology": {
    icon: "text-rose-700",
    progressBar: "bg-rose-600",
    lightBg: "bg-rose-50",
    hoverBorder: "hover:border-rose-300",
    hoverBg: "hover:bg-rose-50/60",
    hoverBorderStrong: "group-hover:border-rose-400",
    confettiColors: ["#fda4af", "#fb7185", "#e11d48"],
  },
  "sports-psychology": {
    icon: "text-violet-700",
    progressBar: "bg-violet-600",
    lightBg: "bg-violet-50",
    hoverBorder: "hover:border-violet-300",
    hoverBg: "hover:bg-violet-50/60",
    hoverBorderStrong: "group-hover:border-violet-400",
    confettiColors: ["#c4b5fd", "#a78bfa", "#7c3aed"],
  },
  "sport-society-history": {
    icon: "text-amber-700",
    progressBar: "bg-amber-600",
    lightBg: "bg-amber-50",
    hoverBorder: "hover:border-amber-300",
    hoverBg: "hover:bg-amber-50/60",
    hoverBorderStrong: "group-hover:border-amber-400",
    confettiColors: ["#fcd34d", "#fbbf24", "#d97706"],
  },
};

export function getSubjectStyle(subjectSlug: string): SubjectStyle {
  return subjectStyles[subjectSlug] ?? DEFAULT_STYLE;
}
