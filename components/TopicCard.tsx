"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFlashcardProgress } from "@/lib/progress";
import { CARD_BASE_CLASSES, CARD_INTERACTIVE_CLASSES, CARD_HOVER_BORDER, CARD_HOVER_BG } from "@/lib/styles";

type Props = {
  name: string;
  href: string;
  subtopicIds: string[];
  total: number;
  progressBarClassName?: string;
  hoverBorderClassName?: string;
  hoverBgClassName?: string;
  arrowClassName?: string;
};

export default function TopicCard({
  name,
  href,
  subtopicIds,
  total,
  progressBarClassName = "bg-blue-600",
  hoverBorderClassName = CARD_HOVER_BORDER,
  hoverBgClassName = CARD_HOVER_BG,
  arrowClassName = "text-blue-600",
}: Props) {
  const [known, setKnown] = useState<number | null>(null);

  useEffect(() => {
    // localStorage isn't available during SSR, so this can only be read after mount -
    // deliberately deferred to avoid a client/server hydration mismatch.
    const count = subtopicIds.reduce((sum, id) => {
      const progress = getFlashcardProgress(id);
      return sum + Object.values(progress).filter((s) => s === "known").length;
    }, 0);
    setKnown(count);
  }, [subtopicIds]);

  if (total === 0) {
    return (
      <div className={`flex flex-col gap-3 ${CARD_BASE_CLASSES} opacity-50`}>
        <h2 className="text-lg font-bold text-slate-900">{name}</h2>
        <p className="text-sm text-slate-500">Coming soon</p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100" />
      </div>
    );
  }

  const pct = known ? Math.min(100, Math.round((known / total) * 100)) : 0;

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
        {known === null
          ? "\u00A0"
          : known > 0
            ? `${known} / ${total} cards known`
            : `${total} card${total === 1 ? "" : "s"}`}
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${progressBarClassName}`} style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}
