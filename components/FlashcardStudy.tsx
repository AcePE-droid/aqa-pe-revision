"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Flashcard } from "@/types/content";
import {
  getFlashcardProgress,
  setFlashcardStatus,
  type FlashcardStatus,
} from "@/lib/progress";

type Props = {
  subtopicId: string;
  subtopicName: string;
  backHref: string;
  cards: Flashcard[];
};

export default function FlashcardStudy({ subtopicId, subtopicName, backHref, cards }: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState<Record<string, FlashcardStatus>>({});

  useEffect(() => {
    // localStorage isn't available during SSR, so this can only be read after mount -
    // deliberately deferred to avoid a client/server hydration mismatch.
    setProgress(getFlashcardProgress(subtopicId));
  }, [subtopicId]);

  const card = cards[index];

  function goTo(newIndex: number) {
    if (newIndex < 0 || newIndex >= cards.length) return;
    setIndex(newIndex);
    setFlipped(false);
  }

  function mark(status: FlashcardStatus) {
    setFlashcardStatus(subtopicId, card.id, status);
    setProgress((prev) => ({ ...prev, [card.id]: status }));
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link href={backHref} aria-label="Exit study mode" className="text-slate-400 hover:text-slate-700">
          <X className="h-6 w-6" />
        </Link>
        <p className="text-sm font-medium text-slate-500">
          {index + 1} / {cards.length}
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <button
          onClick={() => setFlipped((f) => !f)}
          className="flex aspect-[3/2] w-full max-w-lg flex-col items-center justify-center rounded-2xl border border-slate-200 p-8 text-center shadow-sm transition-colors hover:border-blue-300"
        >
          <p className="text-lg font-medium text-slate-900">{flipped ? card.back : card.front}</p>
          <p className="mt-6 text-xs uppercase tracking-wide text-slate-400">
            Tap to flip
          </p>
        </button>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
          {cards.map((c, i) => {
            const status = progress[c.id] ?? "unseen";
            const color =
              status === "known"
                ? "bg-blue-600"
                : status === "learning"
                ? "bg-amber-400"
                : "bg-slate-200";
            return (
              <span
                key={c.id}
                className={`h-2 w-2 rounded-full ${color} ${i === index ? "ring-2 ring-offset-2 ring-slate-300" : ""}`}
              />
            );
          })}
        </div>
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
