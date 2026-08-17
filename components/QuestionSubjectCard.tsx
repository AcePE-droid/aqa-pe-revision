"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getQuestionProgress } from "@/lib/progress";
import { CARD_BASE_CLASSES, CARD_INTERACTIVE_CLASSES } from "@/lib/styles";

type Props = {
  name: string;
  subtitle: string;
  href: string;
  icon: ReactNode;
  iconClassName: string;
  hoverBorderClassName: string;
  hoverBgClassName: string;
  progressBarClassName: string;
  subtopicIds: string[];
  totalQuestions: number;
};

export default function QuestionSubjectCard({
  name,
  subtitle,
  href,
  icon,
  iconClassName,
  hoverBorderClassName,
  hoverBgClassName,
  progressBarClassName,
  subtopicIds,
  totalQuestions,
}: Props) {
  const [attempted, setAttempted] = useState<number | null>(null);

  useEffect(() => {
    // localStorage isn't available during SSR, so this can only be read after mount -
    // deliberately deferred to avoid a client/server hydration mismatch.
    const count = subtopicIds.reduce((sum, id) => {
      const progress = getQuestionProgress(id);
      return sum + Object.values(progress).filter(Boolean).length;
    }, 0);
    setAttempted(count);
  }, [subtopicIds]);

  if (totalQuestions === 0) {
    return (
      <div className={`flex items-start gap-4 ${CARD_BASE_CLASSES} opacity-50`}>
        {icon}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{name}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <p className="mt-3 text-sm text-slate-500">Coming soon</p>
        </div>
      </div>
    );
  }

  const pct = attempted ? Math.min(100, Math.round((attempted / totalQuestions) * 100)) : 0;

  return (
    <Link
      href={href}
      className={`flex items-start gap-4 ${CARD_BASE_CLASSES} ${CARD_INTERACTIVE_CLASSES} ${hoverBorderClassName} ${hoverBgClassName}`}
    >
      {icon}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">{name}</h2>
          <ArrowRight className={`mt-1 h-4 w-4 shrink-0 ${iconClassName}`} />
        </div>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        <p className="mt-3 text-sm text-slate-500">
          {attempted === null
            ? "\u00A0"
            : attempted > 0
              ? `${attempted} / ${totalQuestions} questions answered`
              : `${totalQuestions} question${totalQuestions === 1 ? "" : "s"}`}
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${progressBarClassName}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Link>
  );
}
