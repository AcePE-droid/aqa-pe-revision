"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Question } from "@/types/content";

type Props = {
  basePath: string; // e.g. "/paper-1/applied-anatomy/cardiovascular"
  notesMarkdown: string | null;
  flashcardCount: number;
  questions: Question[];
};

type Tab = "notes" | "flashcards" | "questions";

export default function SubtopicTabs({ basePath, notesMarkdown, flashcardCount, questions }: Props) {
  const [tab, setTab] = useState<Tab>("notes");

  const tabs: { id: Tab; label: string }[] = [
    { id: "notes", label: "Notes" },
    { id: "flashcards", label: "Flashcards" },
    { id: "questions", label: "Practice Questions" },
  ];

  return (
    <div className="mt-8">
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium ${
              tab === t.id
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="py-6">
        {tab === "notes" &&
          (notesMarkdown ? (
            <article className="prose prose-slate max-w-[65ch] prose-headings:font-serif">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{notesMarkdown}</ReactMarkdown>
            </article>
          ) : (
            <p className="text-slate-500">Notes for this subtopic haven&apos;t been added yet.</p>
          ))}

        {tab === "flashcards" &&
          (flashcardCount > 0 ? (
            <div>
              <p className="text-slate-600">{flashcardCount} flashcards ready to study.</p>
              <Link
                href={`${basePath}/flashcards`}
                className="mt-4 inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Start Studying
              </Link>
            </div>
          ) : (
            <p className="text-slate-500">No flashcards for this subtopic yet.</p>
          ))}

        {tab === "questions" &&
          (questions.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {questions.map((q) => (
                <li key={q.id}>
                  <Link
                    href={`${basePath}/questions/${q.id}`}
                    className="block rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50/50"
                  >
                    <span className="font-medium text-slate-900">{q.questionNumber}</span>
                    <span className="ml-2 text-sm text-slate-500">({q.marks} marks)</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">No practice questions for this subtopic yet.</p>
          ))}
      </div>
    </div>
  );
}
