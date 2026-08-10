"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Question } from "@/types/content";
import { setQuestionAttempted } from "@/lib/progress";

type Props = {
  subtopicId: string;
  question: Question;
  prevHref: string | null;
  nextHref: string | null;
};

export default function QuestionView({ subtopicId, question, prevHref, nextHref }: Props) {
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  function reveal() {
    setRevealed(true);
    setQuestionAttempted(subtopicId, question.id);
  }

  return (
    <div>
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

      <div className="mt-8 flex justify-between border-t border-slate-200 pt-4">
        {prevHref ? (
          <Link
            href={prevHref}
            className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-blue-600"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Link>
        ) : (
          <span />
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-blue-600"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
