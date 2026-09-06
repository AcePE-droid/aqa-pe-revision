"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getQuestionProgress } from "@/lib/progress";
import { CARD_SHAPE_CLASSES } from "@/lib/styles";
import SubjectSquareCard from "@/components/SubjectSquareCard";

type Props = {
  name: string;
  subtitle: string;
  href: string;
  icon: ReactNode;
  borderClassName: string;
  subtopicIds: string[];
  totalQuestions: number;
  solidBgClassName: string;
  onSolidTextClassName: string;
  onSolidSubtextClassName: string;
  onSolidTrackClassName: string;
  onSolidFillClassName: string;
  index: number;
};

export default function QuestionSubjectCard({
  name,
  subtitle,
  href,
  icon,
  borderClassName,
  subtopicIds,
  totalQuestions,
  solidBgClassName,
  onSolidTextClassName,
  onSolidSubtextClassName,
  onSolidTrackClassName,
  onSolidFillClassName,
  index,
}: Props) {
  const [attempted, setAttempted] = useState<number | null>(null);

  useEffect(() => {
    // localStorage isn't available during SSR, so this can only be read after mount -
    // deliberately deferred to avoid a client/server hydration mismatch.
    const count = subtopicIds.reduce((sum, id) => {
      const progress = getQuestionProgress(id);
      return sum + Object.values(progress).filter((p) => p.attempted).length;
    }, 0);
    setAttempted(count);
  }, [subtopicIds]);

  if (totalQuestions === 0) {
    return (
      <div className={`flex flex-col ${CARD_SHAPE_CLASSES} ${borderClassName} opacity-50`}>
        {icon}
        <h2 className="mt-6 font-serif text-xl font-semibold text-slate-900">{name}</h2>
        <span className="mt-2 block h-0.5 w-10 bg-slate-300" />
        <p className="mt-3 text-sm leading-relaxed text-slate-500">{subtitle}</p>
        <p className="mt-3 text-sm text-slate-500">Coming soon</p>
      </div>
    );
  }

  const pct = attempted ? Math.min(100, Math.round((attempted / totalQuestions) * 100)) : 0;

  return (
    <SubjectSquareCard
      name={name}
      subtitle={subtitle}
      href={href}
      icon={icon}
      solidBgClassName={solidBgClassName}
      borderClassName={borderClassName}
      onSolidTextClassName={onSolidTextClassName}
      onSolidSubtextClassName={onSolidSubtextClassName}
      onSolidFillClassName={onSolidFillClassName}
      index={index}
    >
      <p className={`mt-3 text-sm ${onSolidSubtextClassName}`}>
        {attempted === null
          ? "\u00A0"
          : attempted > 0
            ? `${attempted} / ${totalQuestions} questions answered`
            : `${totalQuestions} question${totalQuestions === 1 ? "" : "s"}`}
      </p>
      <div className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${onSolidTrackClassName}`}>
        <div className={`h-full rounded-full ${onSolidFillClassName}`} style={{ width: `${pct}%` }} />
      </div>
    </SubjectSquareCard>
  );
}
