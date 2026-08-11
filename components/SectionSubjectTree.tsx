"use client";

import { useState } from "react";
import Link from "next/link";
import { Folder, ChevronRight, ChevronDown } from "lucide-react";

export type PaperGroup = {
  paper: { slug: string; name: string };
  topics: {
    slug: string;
    name: string;
    meta: string; // e.g. "12 cards", "Notes available", "5 questions"
  }[];
};

type Props = {
  groups: PaperGroup[];
  basePath: string; // prefix prepended to "/paperSlug/topicSlug", e.g. "" for flashcards, "/notes", "/questions"
};

export default function SectionSubjectTree({ groups, basePath }: Props) {
  const [openPaper, setOpenPaper] = useState<string | null>(groups[0]?.paper.slug ?? null);

  return (
    <div className="mt-8 overflow-hidden rounded-lg border border-slate-200">
      <p className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Specification Structure
      </p>

      {groups.map(({ paper, topics }) => {
        const isOpen = openPaper === paper.slug;
        return (
          <div key={paper.slug} className="border-b border-slate-200 last:border-b-0">
            <button
              onClick={() => setOpenPaper(isOpen ? null : paper.slug)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
            >
              <Folder className="h-4 w-4 shrink-0 text-blue-600" />
              <span className="flex-1 text-sm font-semibold text-slate-900">
                {paper.name} &mdash; {topics.length} topic{topics.length === 1 ? "" : "s"}
              </span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
              )}
            </button>

            {isOpen && (
              <div className="flex flex-col">
                {topics.map((topic) => (
                  <Link
                    key={topic.slug}
                    href={`${basePath}/${paper.slug}/${topic.slug}`}
                    className="flex items-center gap-3 border-t border-slate-100 py-3 pl-11 pr-4 hover:bg-blue-50/50"
                  >
                    <Folder className="h-4 w-4 shrink-0 text-slate-300" />
                    <span className="flex-1 text-sm font-medium text-slate-900">{topic.name}</span>
                    <span className="text-xs text-slate-400">{topic.meta}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
