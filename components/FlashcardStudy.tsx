"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Flashcard } from "@/types/content";
import { setFlashcardStatus, type FlashcardStatus } from "@/lib/progress";
import { getSubjectStyle } from "@/lib/subject-styles";

type Props = {
  subtopicId: string;
  subtopicName: string;
  topicName: string;
  subjectSlug: string;
  backHref: string;
  cards: Flashcard[];
  groupLabel?: string;
};

export default function FlashcardStudy({
  subtopicId,
  subtopicName,
  topicName,
  subjectSlug,
  backHref,
  cards,
  groupLabel,
}: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];

  function goTo(newIndex: number) {
    if (newIndex < 0 || newIndex >= cards.length) return;
    setIndex(newIndex);
    setFlipped(false);
  }

  function mark(status: FlashcardStatus) {
    setFlashcardStatus(subtopicId, card.id, status);
  }

  if (!card) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white">
        <p className="text-slate-500">No flashcards to study yet.</p>
        <Link href={backHref} className="text-blue-600 hover:underline">
          Back to {subtopicName}
        </Link>
      </div>
    );
  }

  const breadcrumb = [topicName, subtopicName, groupLabel].filter(Boolean).join(" · ");
  const breadcrumbColor = getSubjectStyle(subjectSlug).icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white [background-image:radial-gradient(circle,rgba(100,116,139,0.09)_1.25px,transparent_1.25px)] [background-size:28px_28px] [background-position:center]">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href={backHref}
          aria-label="Exit study mode"
          className="shrink-0 text-slate-400 hover:text-slate-700"
        >
          <X className="h-6 w-6" />
        </Link>
        <p className={`min-w-0 truncate text-center text-sm ${breadcrumbColor}`}>{breadcrumb}</p>
        <p className="shrink-0 text-sm text-slate-500">
          Card {index + 1} of {cards.length}
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-4">
        <button
          onClick={() => setFlipped((f) => !f)}
          className="group flex min-h-[70vh] w-full [perspective:1000px] sm:min-h-[55vh] sm:w-[65%] sm:max-w-3xl"
        >
          <div
            className={`relative h-full w-full transition-transform duration-[450ms] ease-out [transform-style:preserve-3d] ${
              flipped ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg transition-colors [backface-visibility:hidden] group-hover:border-blue-300 sm:p-12">
              <p className="text-2xl font-medium leading-relaxed text-slate-900 sm:text-3xl">
                {card.front}
              </p>
              <p className="mt-8 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Tap to flip
              </p>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg transition-colors [backface-visibility:hidden] [transform:rotateY(180deg)] group-hover:border-blue-300 sm:p-12">
              <p className="text-2xl font-medium leading-relaxed text-slate-900 sm:text-3xl">
                {card.back}
              </p>
              <p className="mt-8 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Tap to flip
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-8 pt-2 sm:px-6">
        <div className="flex justify-center gap-3">
          <button
            onClick={() => mark("learning")}
            className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
          >
            Still Learning
          </button>
          <button
            onClick={() => mark("known")}
            className="rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800 hover:bg-blue-100"
          >
            Mark as Known
          </button>
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <button
            onClick={() => goTo(index + 1)}
            disabled={index === cards.length - 1}
            className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
