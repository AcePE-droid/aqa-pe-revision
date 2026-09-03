import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { CARD_BASE_CLASSES, CARD_INTERACTIVE_CLASSES, CARD_BORDER_DEFAULT } from "@/lib/styles";

// Notes-only subject card: a calmer, editorial "table of contents" treatment
// (article-grid style), deliberately distinct from the solid-fill SubjectCard
// used by Flashcards and the two-column progress-bar QuestionSubjectCard used
// by Practice Questions. The subject accent is confined to the icon and the
// small underline beneath the heading rather than a full card fill or border.
type Props = {
  name: string;
  subtitle: string;
  href: string;
  Icon: LucideIcon;
  iconClassName: string;
  accentBarClassName: string;
  index: number;
};

export default function NotesSubjectCard({
  name,
  subtitle,
  href,
  Icon,
  iconClassName,
  accentBarClassName,
  index,
}: Props) {
  const numeral = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={href}
      className={`flex flex-col ${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT} ${CARD_INTERACTIVE_CLASSES}`}
    >
      <div className="flex items-start justify-between">
        <Icon className={`h-6 w-6 ${iconClassName}`} />
        <span
          aria-hidden="true"
          className="select-none font-serif text-4xl font-light text-slate-200"
        >
          {numeral}
        </span>
      </div>
      <h2 className="mt-6 font-serif text-xl font-semibold text-slate-900">{name}</h2>
      <span className={`mt-2 block h-0.5 w-10 ${accentBarClassName}`} />
      <p className="mt-3 text-sm leading-relaxed text-slate-500">{subtitle}</p>
    </Link>
  );
}
