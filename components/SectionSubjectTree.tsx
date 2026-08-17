"use client";

import { useState } from "react";
import Link from "next/link";
import { Folder, ChevronRight, ChevronDown } from "lucide-react";
import { getSubjectStyle } from "@/lib/subject-styles";

export type SubtopicItem = {
  slug: string;
  name: string;
  href: string;
  meta: string;
};

export type TopicItem = {
  slug: string;
  name: string;
  href: string; // topic-level session, aggregating all of its subtopics' questions
  meta: string; // e.g. "12 questions"
  subtopics: SubtopicItem[];
};

export type PaperGroup = {
  paper: { slug: string; name: string };
  topics: TopicItem[];
};

type Props = {
  groups: PaperGroup[];
  subjectSlug: string;
};

export default function SectionSubjectTree({ groups, subjectSlug }: Props) {
  const [openPaper, setOpenPaper] = useState<string | null>(groups[0]?.paper.slug ?? null);
  const [openTopics, setOpenTopics] = useState<Set<string>>(new Set());
  const style = getSubjectStyle(subjectSlug);

  function toggleTopic(key: string) {
    setOpenTopics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="mt-8 overflow-hidden rounded-lg border border-slate-200">
      <p className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Specification Structure
      </p>

      {groups.map(({ paper, topics }) => {
        const isPaperOpen = openPaper === paper.slug;
        return (
          <div key={paper.slug} className="border-b border-slate-200 last:border-b-0">
            <button
              onClick={() => setOpenPaper(isPaperOpen ? null : paper.slug)}
              className={`flex w-full items-center gap-3 border border-transparent px-4 py-3 text-left ${style.hoverBorder} ${style.hoverBg}`}
            >
              <Folder className="h-4 w-4 shrink-0 text-blue-600" />
              <span className="flex-1 text-sm font-semibold text-slate-900">
                {paper.name} &mdash; {topics.length} topic{topics.length === 1 ? "" : "s"}
              </span>
              {isPaperOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
              )}
            </button>

            {isPaperOpen && (
              <div className="flex flex-col">
                {topics.map((topic) => {
                  const key = `${paper.slug}:${topic.slug}`;
                  const isTopicOpen = openTopics.has(key);
                  return (
                    <div key={topic.slug} className="border-t border-slate-100">
                      <div
                        className={`flex items-center gap-3 border border-transparent py-3 pl-11 pr-4 ${style.hoverBorder} ${style.hoverBg}`}
                      >
                        <Folder className="h-4 w-4 shrink-0 text-slate-300" />
                        <Link href={topic.href} className="flex-1 text-sm font-medium text-slate-900">
                          {topic.name}
                        </Link>
                        <span className="text-xs text-slate-400">{topic.meta}</span>
                        {topic.subtopics.length > 0 && (
                          <button
                            onClick={() => toggleTopic(key)}
                            aria-label={isTopicOpen ? "Collapse subtopics" : "Expand subtopics"}
                            className="rounded p-1 hover:bg-slate-100"
                          >
                            {isTopicOpen ? (
                              <ChevronDown className="h-4 w-4 shrink-0 text-slate-300" />
                            ) : (
                              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                            )}
                          </button>
                        )}
                      </div>

                      {isTopicOpen && (
                        <div className="flex flex-col pb-2">
                          {topic.subtopics.map((subtopic) => (
                            <Link
                              key={subtopic.slug}
                              href={subtopic.href}
                              className={`flex items-center gap-3 border border-transparent py-2 pl-[4.75rem] pr-4 text-sm text-slate-700 hover:text-slate-900 ${style.hoverBorder} ${style.hoverBg}`}
                            >
                              <span className="flex-1">{subtopic.name}</span>
                              <span className="text-xs text-slate-400">{subtopic.meta}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
