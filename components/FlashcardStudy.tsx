"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import type { Flashcard } from "@/types/content";
import {
  getFlashcardProgress,
  setFlashcardStatus,
  getFlashcardCelebrated,
  setFlashcardCelebrated,
  getLastLearningCardIds,
  setLastLearningCardIds,
  type FlashcardStatus,
} from "@/lib/progress";
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
  const [celebrating, setCelebrating] = useState(false);
  // The cards actually being studied right now. Equal to the full `cards`
  // prop except after a filtered restart (see restart()), where it's
  // narrowed to the not-yet-known cards. Kept separate from `cards` so the
  // celebration check (maybeCelebrate) can keep judging mastery against the
  // whole subtopic rather than whatever subset is in the current session.
  const [sessionCards, setSessionCards] = useState<Flashcard[]>(cards);
  // True when the student hit "Restart deck" but every card in the subtopic
  // is already known, so there's nothing left to filter down to.
  const [reviewEmpty, setReviewEmpty] = useState(false);
  // IDs marked "learning" as of the end of the last completed session for
  // this subtopic - frozen snapshot, only refreshed when the current
  // session itself completes (see mark()).
  const [lastLearningIds, setLastLearningIds] = useState<Set<string>>(new Set());
  const subjectStyle = getSubjectStyle(subjectSlug);

  const timers = useRef<number[]>([]);

  useEffect(() => {
    setProgress(getFlashcardProgress(subtopicId));
    setSessionCards(cards);
    setReviewEmpty(false);
    setLastLearningIds(new Set(getLastLearningCardIds(subtopicId)));
  }, [subtopicId, cards]);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  function schedule(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  const card = sessionCards[index];

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
    if (newIndex < 0 || newIndex >= sessionCards.length) return;
    runTransition(newIndex, newIndex > index ? "next" : "prev");
  }

  function mark(status: FlashcardStatus) {
    if (navPhase !== "idle") return;
    setFlashcardStatus(subtopicId, card.id, status);
    const updatedProgress = { ...progress, [card.id]: status };
    setProgress(updatedProgress);
    setHighlighted(status);
    schedule(() => setHighlighted(null), HIGHLIGHT_MS);

    if (index < sessionCards.length - 1) {
      runTransition(index + 1, "next");
    } else {
      const learningIds = cards.filter((c) => updatedProgress[c.id] === "learning").map((c) => c.id);
      setLastLearningCardIds(subtopicId, learningIds);
      setLastLearningIds(new Set(learningIds));
      setDirection("next");
      setNavPhase("out");
      schedule(() => {
        setNavPhase("idle");
        setDeckEnded(true);
        maybeCelebrate(updatedProgress);
      }, OUT_MS);
    }
  }

  function maybeCelebrate(finalProgress: Record<string, FlashcardStatus>) {
    const allKnown = cards.length > 0 && cards.every((c) => finalProgress[c.id] === "known");
    if (!allKnown || getFlashcardCelebrated(subtopicId)) return;
    setFlashcardCelebrated(subtopicId, true);
    setCelebrating(true);
    confetti({
      particleCount: 40,
      spread: 70,
      startVelocity: 35,
      gravity: 1.1,
      ticks: 150,
      scalar: 0.75,
      origin: { x: 0.5, y: 0.45 },
      colors: subjectStyle.confettiColors,
    });
  }

  // useAll=true bypasses the not-known filter (used by the "Restart with all
  // cards" edge-case button when every card is already known).
  function restart(useAll = false) {
    if (!useAll) {
      const remaining = cards.filter((c) => progress[c.id] !== "known");
      if (remaining.length === 0) {
        setReviewEmpty(true);
        return;
      }
      setSessionCards(remaining);
    } else {
      setSessionCards(cards);
    }
    setReviewEmpty(false);
    setDeckEnded(false);
    setIndex(0);
    setFlipped(false);
    setNavPhase("idle");
    setCelebrating(false);
    setFlashcardCelebrated(subtopicId, false);
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
            Card {index + 1} of {sessionCards.length}
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
            {reviewEmpty ? (
              <p className="text-lg font-medium text-slate-700">
                Every card is marked as known — nothing to review.
              </p>
            ) : celebrating ? (
              <>
                <Trophy className={`h-12 w-12 ${subjectStyle.icon}`} />
                <p className="text-lg font-medium text-slate-700">Nice work — every card marked as known.</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-slate-700">You&rsquo;ve reached the end of the deck.</p>
                {learningCount > 0 && (
                  <p className="text-sm text-slate-500">
                    You&rsquo;re still learning {learningCount} flashcard{learningCount === 1 ? "" : "s"}.
                  </p>
                )}
              </>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => restart(reviewEmpty)}
                className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {reviewEmpty ? "Restart with all cards" : "Restart deck"}
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
            className="group flex min-h-[70vh] w-full cursor-pointer [perspective:1000px] sm:min-h-[55vh] sm:w-[65%] sm:max-w-3xl"
          >
            <div
              className={`relative h-full w-full transition-transform duration-[450ms] ease-out [transform-style:preserve-3d] ${
                flipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              <div className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-md transition-[box-shadow,border-color] duration-200 ease-out [backface-visibility:hidden] group-hover:shadow-lg group-hover:ring-4 group-hover:ring-slate-200/60 ${subjectStyle.hoverBorderStrong} sm:p-12`}>
                {lastLearningIds.has(card.id) && (
                  <span className="absolute left-4 top-4 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 sm:left-6 sm:top-6">
                    Still learning
                  </span>
                )}
                <div className={contentTransitionClasses(navPhase, direction)}>
                  <p className="text-2xl font-medium leading-relaxed text-slate-900 sm:text-3xl">
                    {card.front}
                  </p>
                  <p className="mt-8 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Tap to flip
                  </p>
                </div>
              </div>
              <div className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-md transition-[box-shadow,border-color] duration-200 ease-out [backface-visibility:hidden] [transform:rotateY(180deg)] group-hover:shadow-lg group-hover:ring-4 group-hover:ring-slate-200/60 ${subjectStyle.hoverBorderStrong} sm:p-12`}>
                {lastLearningIds.has(card.id) && (
                  <span className="absolute left-4 top-4 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 sm:left-6 sm:top-6">
                    Still learning
                  </span>
                )}
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
              disabled={index === sessionCards.length - 1 || navPhase !== "idle"}
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
