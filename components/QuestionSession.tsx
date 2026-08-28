"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, ClipboardCheck } from "lucide-react";
import type { Question } from "@/types/content";
import { getQuestionProgress, setQuestionAttempted, setQuestionMarks } from "@/lib/progress";
import { getSubjectStyle } from "@/lib/subject-styles";

type Props = {
  breadcrumb: string;
  subjectSlug: string;
  backHref: string;
  questions: Question[];
};

// A mark scheme is plain text with line breaks, but almost always contains
// runs of "- " bulleted marking points mixed with plain lead-in/explanation
// lines (see content/questions/**.json). Splitting on that convention turns
// it into a real list wherever the source uses one, without requiring the
// content itself to be restructured.
type MarkSchemeBlock = { type: "paragraph"; text: string } | { type: "list"; items: string[] };

function parseMarkScheme(raw: string): MarkSchemeBlock[] {
  const blocks: MarkSchemeBlock[] = [];
  let currentList: string[] | null = null;

  for (const rawLine of raw.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      currentList = null;
      continue;
    }
    const bullet = line.match(/^[-•]\s+(.*)$/);
    if (bullet) {
      if (!currentList) {
        currentList = [];
        blocks.push({ type: "list", items: currentList });
      }
      currentList.push(bullet[1]);
    } else {
      currentList = null;
      blocks.push({ type: "paragraph", text: line });
    }
  }
  return blocks;
}

// Multiple-choice options are stored with their own leading letter (e.g. "C -
// Analysing the ratio..."), but that letter isn't guaranteed to line up with
// the option's position in the array, so the badge always derives its letter
// from index and the raw label prefix is stripped for display only -
// `question.correctOption` comparisons keep using the untouched raw string.
function optionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

function stripOptionLabel(option: string): string {
  return option.replace(/^[A-Za-z]\s*[-.):]\s*/, "");
}

// Colour bands for the self-assessed-mark badge, matching the site's
// existing green/amber/red palette used elsewhere for correct/incorrect
// states (see the multiple-choice option classes below).
function markBadgeClasses(marksAwarded: number, totalMarks: number): string {
  const pct = totalMarks > 0 ? marksAwarded / totalMarks : 0;
  if (pct >= 0.8) return "border-green-300 bg-green-100 text-green-800";
  if (pct >= 0.5) return "border-amber-300 bg-amber-100 text-amber-800";
  return "border-red-300 bg-red-100 text-red-800";
}

export default function QuestionSession({ breadcrumb, subjectSlug, backHref, questions }: Props) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [attemptedIds, setAttemptedIds] = useState<Set<string>>(new Set());
  const [selfMarks, setSelfMarks] = useState<Record<string, number>>({});

  const question = questions[index];

  useEffect(() => {
    // localStorage isn't available during SSR, so this can only be read after mount -
    // deliberately deferred to avoid a client/server hydration mismatch.
    const ids = new Set<string>();
    const marks: Record<string, number> = {};
    for (const q of questions) {
      const progress = getQuestionProgress(q.subtopicId);
      if (progress[q.id]) {
        ids.add(q.id);
        if (progress[q.id].marksAwarded !== undefined) {
          marks[q.id] = progress[q.id].marksAwarded!;
        }
      }
    }
    setAttemptedIds(ids);
    setSelfMarks(marks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goTo(newIndex: number) {
    if (newIndex < 0 || newIndex >= questions.length) return;
    setIndex(newIndex);
    setAnswer("");
    setSelectedOption(null);
    setRevealed(false);
  }

  function toggleReveal() {
    if (!revealed) {
      setRevealed(true);
      setQuestionAttempted(question.subtopicId, question.id);
      setAttemptedIds((prev) => new Set(prev).add(question.id));
    } else {
      setRevealed(false);
    }
  }

  function saveMark(marks: number) {
    setQuestionMarks(question.subtopicId, question.id, marks);
    setSelfMarks((prev) => ({ ...prev, [question.id]: marks }));
  }

  const subjectStyle = getSubjectStyle(subjectSlug);
  const attemptedCount = attemptedIds.size;

  if (!question) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white">
        <p className="text-slate-500">No questions here yet.</p>
        <Link href={backHref} className="text-blue-600 hover:underline">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white [background-image:radial-gradient(circle,rgba(100,116,139,0.09)_1.25px,transparent_1.25px)] [background-size:28px_28px] [background-position:center]">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
        <Link
          href={backHref}
          aria-label="Exit question session"
          className="shrink-0 text-slate-400 hover:text-slate-700"
        >
          <X className="h-6 w-6" />
        </Link>
        <p
          className={`min-w-0 truncate text-center text-xs font-semibold uppercase tracking-widest ${subjectStyle.icon}`}
        >
          {breadcrumb}
        </p>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <p className="text-sm text-slate-500">
            Question {index + 1} of {questions.length}
          </p>
          <p className="text-xs text-slate-400">{attemptedCount} answered</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 pb-4">
        <div className="w-full sm:w-[65%] sm:max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg sm:p-10">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-md border-2 border-slate-900 px-2 font-serif text-lg font-bold text-slate-900">
                {question.questionNumber}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                {selfMarks[question.id] !== undefined && (
                  <span
                    className={`rounded-md border px-2 py-1 text-xs font-semibold ${markBadgeClasses(selfMarks[question.id], question.marks)}`}
                  >
                    {selfMarks[question.id]}/{question.marks}
                  </span>
                )}
                <span className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {question.marks} mark{question.marks === 1 ? "" : "s"}
                </span>
              </div>
            </div>
            <p className="mt-5 whitespace-pre-wrap font-serif text-lg leading-8 text-slate-800">
              {question.question}
            </p>

            {question.isMultipleChoice && question.options ? (
              <div className="mt-6 flex flex-col gap-2">
                {question.options.map((option, i) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = revealed && option === question.correctOption;
                  const isWrongSelected = revealed && isSelected && option !== question.correctOption;
                  return (
                    <button
                      key={option}
                      onClick={() => !revealed && setSelectedOption(option)}
                      disabled={revealed}
                      className={`flex items-center gap-3 rounded-md border px-4 py-3 text-left text-sm ${
                        isCorrect
                          ? "border-green-400 bg-green-50 text-green-800"
                          : isWrongSelected
                            ? "border-red-300 bg-red-50 text-red-700"
                            : isSelected
                              ? "border-blue-400 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                        {optionLetter(i)}
                      </span>
                      <span className="font-serif">{stripOptionLabel(option)}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="ruled-lines mt-6 h-[224px] w-full rounded-md border border-slate-200 px-4 py-0 font-serif text-slate-800 focus:border-blue-400 focus:outline-none"
              />
            )}

            <button
              onClick={toggleReveal}
              className="mt-4 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              {revealed ? "Hide Mark Scheme" : "Show Mark Scheme"}
            </button>

            {revealed && (
              <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
                <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
                  <ClipboardCheck className="h-4 w-4 text-slate-500" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                    Mark Scheme
                  </p>
                </div>
                <div className="px-4 py-4">
                  {parseMarkScheme(question.markScheme).map((block, i) =>
                    block.type === "list" ? (
                      <ul
                        key={i}
                        className="mt-2 list-disc space-y-1 pl-5 font-serif text-sm leading-6 text-slate-700 first:mt-0"
                      >
                        {block.items.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p key={i} className="mt-2 font-serif text-sm leading-6 text-slate-700 first:mt-0">
                        {block.text}
                      </p>
                    )
                  )}
                  <p className="mt-4 border-t border-slate-100 pt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Total: {question.marks} mark{question.marks === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="border-t border-slate-200 bg-white px-4 py-4">
                  <p className="text-sm font-medium text-slate-700">How many marks did you give yourself?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.from({ length: question.marks + 1 }, (_, i) => i).map((mark) => (
                      <button
                        key={mark}
                        onClick={() => saveMark(mark)}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-colors ${
                          selfMarks[question.id] === mark
                            ? "border-blue-600 bg-blue-100 text-blue-600"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {mark}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">out of {question.marks}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3 px-4 pb-8 pt-2 sm:px-6">
        <button
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        <button
          onClick={() => goTo(index + 1)}
          disabled={index === questions.length - 1}
          className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
