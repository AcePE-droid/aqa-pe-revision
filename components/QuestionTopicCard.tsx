import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CARD_BASE_CLASSES, CARD_INTERACTIVE_CLASSES, CARD_HOVER_BORDER, CARD_HOVER_BG } from "@/lib/styles";

type Props = {
  name: string;
  href: string;
  total: number;
  hoverBorderClassName?: string;
  hoverBgClassName?: string;
  arrowClassName?: string;
};

// Topic-level card for the Practice Questions subject browser. Deliberately
// has no progress bar (question progress tracking is a separate concern -
// see fix notes) - just a name, a question count, and a "Coming soon" state
// for topics that have no questions imported yet, matching the flashcard
// TopicCard's empty-state pattern minus the progress bar.
export default function QuestionTopicCard({
  name,
  href,
  total,
  hoverBorderClassName = CARD_HOVER_BORDER,
  hoverBgClassName = CARD_HOVER_BG,
  arrowClassName = "text-blue-600",
}: Props) {
  if (total === 0) {
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
        {total} question{total === 1 ? "" : "s"}
      </p>
    </Link>
  );
}
