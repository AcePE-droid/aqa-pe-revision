import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CARD_BASE_CLASSES, CARD_INTERACTIVE_CLASSES, CARD_HOVER_BORDER, CARD_HOVER_BG } from "@/lib/styles";

type Props = {
  index: number;
  name: string;
  href: string;
  withNotes: number;
  total: number;
  hoverBorderClassName?: string;
  hoverBgClassName?: string;
  arrowClassName?: string;
};

// Topic-level card for the Notes topic browser. Styled like a textbook's
// table of contents (numbered, serif chapter titles) rather than the bold
// sans/progress-bar treatment flashcards and questions use - notes have no
// completion state, just a chapter number and a "X of Y subtopics with
// notes" count, with a "Coming soon" state when no subtopic has notes yet.
export default function NotesTopicCard({
  index,
  name,
  href,
  withNotes,
  total,
  hoverBorderClassName = CARD_HOVER_BORDER,
  hoverBgClassName = CARD_HOVER_BG,
  arrowClassName = "text-blue-600",
}: Props) {
  const number = String(index).padStart(2, "0");

  if (withNotes === 0) {
    return (
      <div className={`flex items-start gap-4 ${CARD_BASE_CLASSES} opacity-50`}>
        <span className="font-serif text-2xl font-light text-slate-300">{number}</span>
        <div>
          <h2 className="font-serif text-lg font-semibold text-slate-900">{name}</h2>
          <p className="text-sm text-slate-500">Coming soon</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-start gap-4 ${CARD_BASE_CLASSES} ${CARD_INTERACTIVE_CLASSES} ${hoverBorderClassName} ${hoverBgClassName}`}
    >
      <span className="font-serif text-2xl font-light text-slate-300">{number}</span>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif text-lg font-semibold text-slate-900">{name}</h2>
          <ArrowRight className={`mt-1 h-4 w-4 shrink-0 ${arrowClassName}`} />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {withNotes} of {total} subtopic{total === 1 ? "" : "s"} with notes
        </p>
      </div>
    </Link>
  );
}
