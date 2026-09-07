"use client";

import { useState } from "react";

export type DayActivity = {
  label: string;
  fullLabel: string;
  cardsReviewed: number;
  questionsAnswered: number;
  total: number;
};

// Bars are interactive so the exact numbers behind each day's height are
// discoverable, not just the relative height: hover opens the popover on
// desktop, tap toggles it on mobile (no reliable hover there), and focus
// opens it via keyboard. Colours reuse the site's existing blue-600/slate
// tokens rather than introducing a new colour just for the tooltip.
export default function WeeklyActivityChart({ days }: { days: DayActivity[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const maxDayTotal = Math.max(1, ...days.map((d) => d.total));
  const hasRecentActivity = days.some((d) => d.total > 0);

  return (
    <div>
      <div className="mt-6 flex items-end justify-between gap-2" style={{ height: 96 }}>
        {days.map((d, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="relative flex flex-1 flex-col items-center gap-2">
              {isOpen && (
                <div
                  role="tooltip"
                  className="absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-md"
                >
                  {d.fullLabel}: {d.cardsReviewed} flashcard{d.cardsReviewed === 1 ? "" : "s"} reviewed,{" "}
                  {d.questionsAnswered} question{d.questionsAnswered === 1 ? "" : "s"} answered
                </div>
              )}
              <button
                type="button"
                disabled={!hasRecentActivity}
                onMouseEnter={() => hasRecentActivity && setOpenIndex(i)}
                onMouseLeave={() => setOpenIndex((prev) => (prev === i ? null : prev))}
                onFocus={() => hasRecentActivity && setOpenIndex(i)}
                onBlur={() => setOpenIndex((prev) => (prev === i ? null : prev))}
                onClick={() => hasRecentActivity && setOpenIndex((prev) => (prev === i ? null : i))}
                aria-label={`${d.fullLabel}: ${d.cardsReviewed} flashcards reviewed, ${d.questionsAnswered} questions answered`}
                className={`w-full rounded-t ${hasRecentActivity ? "bg-blue-600" : "bg-slate-200"} ${
                  hasRecentActivity ? "cursor-pointer" : "cursor-default"
                }`}
                style={{
                  height: hasRecentActivity ? `${Math.max(4, (d.total / maxDayTotal) * 80)}px` : "6px",
                }}
              />
              <span className="text-xs text-slate-500">{d.label}</span>
            </div>
          );
        })}
      </div>
      {!hasRecentActivity && (
        <p className="mt-2 text-xs text-slate-400">
          No activity yet — study a flashcard or question to see your trend.
        </p>
      )}
    </div>
  );
}
