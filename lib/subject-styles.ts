// Per-subject accent colours, used across the site (icons, progress bars,
// card borders, study-mode breadcrumb) so a student always has a visual
// anchor to which subject they're in. The accent is shown at all times on
// subject-scoped elements, not just on hover - hover feedback (shadow,
// subtle background tint) stays separate and subtle.
//
// The three accent hex values themselves live as named theme colours in
// app/globals.css (--color-subject-anatomy/psychology/society), generated
// into `bg-subject-anatomy`, `text-subject-anatomy`, `border-subject-anatomy`
// etc. utilities. Tailwind can't detect dynamically-constructed class names
// like `text-subject-${slug}`, so every class string used anywhere in the
// app must be written out in full here rather than built at runtime.

export type SubjectStyle = {
  icon: string;
  progressBar: string;
  // Permanent border colour for any card/element representing this subject.
  border: string;
  // Subtle hover-only background tint, layered on top of the permanent
  // border above.
  hoverBg: string;
  lightBg: string;
  // Hex colours for the deck-mastery confetti celebration (FlashcardStudy).
  // canvas-confetti needs real colour values rather than Tailwind classes,
  // so these are written out as hex: a lighter tint, the exact accent, and a
  // darker shade, all derived from the single specified accent hex (the
  // accent hex itself is never altered).
  confettiColors: string[];
};

const DEFAULT_STYLE: SubjectStyle = {
  icon: "text-blue-600",
  progressBar: "bg-blue-600",
  border: "border-slate-200",
  hoverBg: "hover:bg-slate-50",
  lightBg: "bg-blue-50",
  confettiColors: ["#93c5fd", "#60a5fa", "#2563eb"],
};

// Keyed by subject slug (matches `getSubjects()` in lib/content.ts, i.e.
// `slugify(topic.subject)`).
export const subjectStyles: Record<string, SubjectStyle> = {
  "anatomy-physiology": {
    icon: "text-subject-anatomy",
    progressBar: "bg-subject-anatomy",
    border: "border-subject-anatomy",
    hoverBg: "hover:bg-subject-anatomy/5",
    lightBg: "bg-subject-anatomy/10",
    confettiColors: ["#8390b1", "#405487", "#303f65"],
  },
  "sports-psychology": {
    icon: "text-subject-psychology",
    progressBar: "bg-subject-psychology",
    border: "border-subject-psychology",
    hoverBg: "hover:bg-subject-psychology/5",
    lightBg: "bg-subject-psychology/10",
    confettiColors: ["#f3a8a1", "#ee8278", "#b3625a"],
  },
  "sport-society-history": {
    icon: "text-subject-society",
    progressBar: "bg-subject-society",
    border: "border-subject-society",
    hoverBg: "hover:bg-subject-society/5",
    lightBg: "bg-subject-society/10",
    confettiColors: ["#ddeaac", "#cee188", "#9ba966"],
  },
};

export function getSubjectStyle(subjectSlug: string): SubjectStyle {
  return subjectStyles[subjectSlug] ?? DEFAULT_STYLE;
}
