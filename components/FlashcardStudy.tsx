"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Flashcard } from "@/types/content";
import { getFlashcardProgress, setFlashcardStatus, type FlashcardStatus } from "@/lib/progress";
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

// Between-card content transition timings. OUT also doubles as the "brief
// delay before auto-advance" from Change 1 - the mark-button highlight fires
// at the same moment the outgoing content starts fading/sliding, so a
// student sees the click register and the card leave together instead of
// two separate waits stacking up.
const OUT_MS = 250;
const IN_MS = 200;
const HIGHLIGHT_MS = 180;

type NavPhase = "idle" | "out" | "enterStart" | "enter";
type NavDirection = "next" | "prev";

function contentTransitionClasses(phase: NavPhase, direction: NavDirection): string {
  switch (phase) {
    case "out":
      return `transition-[opacity,transform] duration-[250ms] ease-out opacity-0 ${
        direction === "next" ? "-translate-x-5" : "translate-x-5"
      }`;
    case "enterStart":
      // Instant (untransitioned) jump to the entry offset, painted for one
      // frame before "enter" turns the transition back on - this is what
      // makes the incoming card arrive from the opposite side rather than
      // just reversing the outgoing motion.
      return `opacity-0 ${direction === "next" ? "translate-x-5" : "-translate-x-5"}`;
    case "enter":
    case "idle":
    default:
      return "transition-[opacity,transform] duration-200 ease-out opacity-100 translate-x-0";
  }
}

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
  const [progress, setProgress] = useState<Record<string, FlashcardStatus>>({});
  const [navPhase, setNavPhase] = useState<NavPhase>("idle");
  const [direction, setDirection] = useState<NavDirection>("next");
  const [deckEnded, setDeckEnded] = useState(false);
  const [highlighted, setHighlighted] = useState<FlashcardStatus | null>(null);

  const timers = useRef<number[]>([]);

  useEffect(() => {
    setProgress(getFlashcardProgress(subtopicId));
  }, [subtopicId]);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  function schedule(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  const card = cards[index];

  function runTransition(newIndex: number, dir: NavDirection) {
    if (navPhase !== "idle") return;
    setDirection(dir);
    setNavPhase("out");
    schedule(() => {
      setIndex(newIndex);
      setFlipped(false);
      setNavPhase("enterStart");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setNavPhase("enter"));
      });
      schedule(() => setNavPhase("idle"), IN_MS);
    }, OUT_MS);
  }

  function goTo(newIndex: number) {
    if (newIndex < 0 || newIndex >= cards.length) return;
    runTransition(newIndex, newIndex > index ? "next" : "prev");
  }

  function mark(status: FlashcardStatus) {
    if (navPhase !== "idle") return;
    setFlashcardStatus(subtopicId, card.id, status);
    setProgress((prev) => ({ ...prev, [card.id]: status }));
    setHighlighted(status);
    schedule(() => setHighlighted(null), HIGHLIGHT_MS);

    if (index < cards.length - 1) {
      runTransition(index + 1, "next");
    } else {
      setDirection("next");
      setNavPhase("out");
      schedule(() => {
        setNavPhase("idle");
        setDeckEnded(true);
      }, OUT_MS);
    }
  }

  function restart() {
    setDeckEnded(false);
    setIndex(0);
    setFlipped(false);
    setNavPhase("idle");
  }

  const knownCount = Object.values(progress).filter((s) => s === "known").length;
  const learningCount = Object.values(progress).filter((s) => s === "learning").length;

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
  const subjectStyle = getSubjectStyle(subjectSlug);

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
        <p className="min-w-0 truncate text-center text-sm text-slate-700">{breadcrumb}</p>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <p className="text-sm text-slate-500">
            Card {index + 1} of {cards.length}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {knownCount} known
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {learningCount} learning
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-4">
        {deckEnded ? (
          <div className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-6 text-center sm:min-h-[55vh] sm:w-[65%] sm:max-w-3xl">
            <p className="text-lg font-medium text-slate-700">You&rsquo;ve reached the end of the deck.</p>
            <div className="flex gap-3">
              <button
                onClick={restart}
                className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Restart deck
              </button>
              <Link
                href={backHref}
                className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Exit to topics
              </Link>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              if (navPhase === "idle") setFlipped((f) => !f);
            }}
            className="group flex min-h-[70vh] w-full [perspective:1000px] sm:min-h-[55vh] sm:w-[65%] sm:max-w-3xl"
          >
            <div
              className={`relative h-full w-full transition-transform duration-[450ms] ease-out [transform-style:preserve-3d] ${
                flipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              <div className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg transition-colors [backface-visibility:hidden] ${subjectStyle.hoverBorderStrong} sm:p-12`}>
                <div className={contentTransitionClasses(navPhase, direction)}>
                  <p className="text-2xl font-medium leading-relaxed text-slate-900 sm:text-3xl">
                    {card.front}
                  </p>
                  <p className="mt-8 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Tap to flip
                  </p>
                </div>
              </div>
              <div className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg transition-colors [backface-visibility:hidden] [transform:rotateY(180deg)] ${subjectStyle.hoverBorderStrong} sm:p-12`}>
                <div className={contentTransitionClasses(navPhase, direction)}>
                  <p className="text-2xl font-medium leading-relaxed text-slate-900 sm:text-3xl">
                    {card.back}
                  </p>
                  <p className="mt-8 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Tap to flip
                  </p>
                </div>
              </div>
            </div>
          </button>
        )}
      </div>

      {!deckEnded && (
        <div className="flex flex-col gap-3 px-4 pb-8 pt-2 sm:px-6">
          <div className="flex justify-center gap-3">
            <button
              onClick={() => mark("learning")}
              disabled={navPhase !== "idle"}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition-all duration-150 ease-out active:scale-[0.98] ${
                highlighted === "learning"
                  ? "border-amber-500 bg-amber-500 text-white"
                  : "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              Still Learning
            </button>
            <button
              onClick={() => mark("known")}
              disabled={navPhase !== "idle"}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition-all duration-150 ease-out active:scale-[0.98] ${
                highlighted === "known"
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100"
              }`}
            >
              Mark as Known
            </button>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => goTo(index - 1)}
              disabled={index === 0 || navPhase !== "idle"}
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button
              onClick={() => goTo(index + 1)}
              disabled={index === cards.length - 1 || navPhase !== "idle"}
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
