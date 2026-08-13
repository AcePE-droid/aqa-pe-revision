"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Question } from "@/types/content";
import { getQuestionProgress, setQuestionAttempted } from "@/lib/progress";
import { getSubjectStyle } from "@/lib/subject-styles";

type Props = {
  breadcrumb: string;
  subjectSlug: string;
  backHref: string;
  questions: Question[];
};

export default function QuestionSession({ breadcrumb, subjectSlug, backHref, questions }: Props) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [attemptedIds, setAttemptedIds] = useState<Set<string>>(new Set());

  const question = questions[index];

  useEffect(() => {
    // localStorage isn't available during SSR, so this can only be read after mount -
    // deliberately deferred to avoid a client/server hydration mismatch.
    const ids = new Set<string>();
    for (const q of questions) {
      const progress = getQuestionProgress(q.subtopicId);
      if (progress[q.id]) ids.add(q.id);
    }
    setAttemptedIds(ids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goTo(newIndex: number) {
    if (newIndex < 0 || newIndex >= questions.length) return;
    setIndex(newIndex);
    setAnswer("");
    setSelectedOption(null);
    setRevealed(false);
  }

  function reveal() {
    setRevealed(true);
    setQuestionAttempted(question.subtopicId, question.id);
    setAttemptedIds((prev) => new Set(prev).add(question.id));
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
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href={backHref}
          aria-label="Exit question session"
          className="shrink-0 text-slate-400 hover:text-slate-700"
        >
          <X className="h-6 w-6" />
        </Link>
        <p className={`min-w-0 truncate text-center text-sm ${subjectStyle.icon}`}>{breadcrumb}</p>
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
            <div className="flex items-baseline justify-between">
              <h1 className="text-xl font-semibold text-slate-900">{question.questionNumber}</h1>
              <span className="text-sm text-slate-500">{question.marks} marks</span>
            </div>
            <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-800">{question.question}</p>

            {question.isMultipleChoice && question.options ? (
              <div className="mt-6 flex flex-col gap-2">
                {question.options.map((option) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = revealed && option === question.correctOption;
                  const isWrongSelected = revealed && isSelected && option !== question.correctOption;
                  return (
                    <button
                      key={option}
                      onClick={() => !revealed && setSelectedOption(option)}
                      disabled={revealed}
                      className={`rounded-md border px-4 py-3 text-left text-sm ${
                        isCorrect
                          ? "border-green-400 bg-green-50 text-green-800"
                          : isWrongSelected
                            ? "border-red-300 bg-red-50 text-red-700"
                            : isSelected
                              ? "border-blue-400 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={revealed}
                rows={6}
                placeholder="Type your answer..."
                className="mt-6 w-full rounded-md border border-slate-200 p-4 text-slate-800 focus:border-blue-400 focus:outline-none disabled:bg-slate-50"
              />
            )}

            {!revealed ? (
              <button
                onClick={reveal}
                className="mt-4 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Reveal Mark Scheme
              </button>
            ) : (
              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">Mark Scheme</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {question.markScheme}
                </p>
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
