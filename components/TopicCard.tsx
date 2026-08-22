"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSubtopicProgress } from "@/lib/progress";
import { useAuthUserId } from "@/lib/supabase/useAuthUserId";
import { CARD_BASE_CLASSES, CARD_INTERACTIVE_CLASSES, CARD_HOVER_BORDER, CARD_HOVER_BG } from "@/lib/styles";

type Props = {
  name: string;
  href: string;
  subtopicFlashcards: { subtopicId: string; flashcardIds: string[] }[];
  total: number;
  progressBarClassName?: string;
  hoverBorderClassName?: string;
  hoverBgClassName?: string;
  arrowClassName?: string;
};

export default function TopicCard({
  name,
  href,
  subtopicFlashcards,
  total,
  progressBarClassName = "bg-blue-600",
  hoverBorderClassName = CARD_HOVER_BORDER,
  hoverBgClassName = CARD_HOVER_BG,
  arrowClassName = "text-blue-600",
}: Props) {
  const [known, setKnown] = useState<number | null>(null);
  const userId = useAuthUserId();

  useEffect(() => {
    // Reading progress (local or cloud) can't happen synchronously, so this
    // can only resolve after mount - deliberately deferred to avoid a
    // client/server hydration mismatch, and re-run on auth state changes so
    // signing in/out doesn't leave a stale count on screen.
    let cancelled = false;
    Promise.all(
      subtopicFlashcards.map(({ subtopicId, flashcardIds }) => getSubtopicProgress(subtopicId, flashcardIds))
    ).then((progressBySubtopic) => {
      if (cancelled) return;
      const count = progressBySubtopic.reduce(
        (sum, progress) => sum + Object.values(progress).filter((s) => s === "known").length,
        0
      );
      setKnown(count);
    });
    return () => {
      cancelled = true;
    };
  }, [subtopicFlashcards, userId]);

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
