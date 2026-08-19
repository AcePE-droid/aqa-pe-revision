import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CARD_BASE_CLASSES, CARD_INTERACTIVE_CLASSES, CARD_HOVER_BORDER, CARD_HOVER_BG } from "@/lib/styles";

type Props = {
  name: string;
  href: string;
  withNotes: number;
  total: number;
  hoverBorderClassName?: string;
  hoverBgClassName?: string;
  arrowClassName?: string;
};

// Topic-level card for the Notes topic browser. No progress bar (notes have
// no completion state, per spec) - just a name and a "X of Y subtopics with
// notes" count, with a "Coming soon" state when no subtopic has notes yet.
export default function NotesTopicCard({
  name,
  href,
  withNotes,
  total,
  hoverBorderClassName = CARD_HOVER_BORDER,
  hoverBgClassName = CARD_HOVER_BG,
  arrowClassName = "text-blue-600",
}: Props) {
  if (withNotes === 0) {
    return (
      <div className={`flex flex-col gap-3 ${CARD_BASE_CLASSES} opacity-50`}>
        <h2 className="text-lg font-bold text-slate-900">{name}</h2>
        <p className="text-sm text-slate-500">Coming soon</p>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`flex flex-col gap-3 ${CARD_BASE_CLASSES} ${CARD_INTERACTIVE_CLASSES} ${hoverBorderClassName} ${hoverBgClassName}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">{name}</h2>
        <ArrowRight className={`mt-1 h-4 w-4 shrink-0 ${arrowClassName}`} />
      </div>
      <p className="text-sm text-slate-500">
        {withNotes} of {total} subtopic{total === 1 ? "" : "s"} with notes
      </p>
    </Link>
  );
}
