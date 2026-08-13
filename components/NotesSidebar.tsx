"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getSubjectStyle } from "@/lib/subject-styles";

export type NotesSubtopic = {
  slug: string;
  name: string;
  href: string;
  hasNotes: boolean;
};

export type NotesTopic = {
  slug: string;
  name: string;
  paperName: string;
  subtopics: NotesSubtopic[];
};

export type NotesSubject = {
  slug: string;
  name: string;
  topics: NotesTopic[];
};

type Props = {
  subjects: NotesSubject[];
};

export default function NotesSidebar({ subjects }: Props) {
  const pathname = usePathname();
  const activeSubjectSlug = subjects.find((subject) =>
    subject.topics.some((topic) => topic.subtopics.some((s) => pathname === s.href))
  )?.slug;

  const [openSubject, setOpenSubject] = useState<string | null>(
    activeSubjectSlug ?? subjects[0]?.slug ?? null
  );

  return (
    <nav
      aria-label="Notes topics"
      className="w-full shrink-0 md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] md:w-64 md:overflow-y-auto"
    >
      <ul className="flex flex-col gap-1">
        {subjects.map((subject) => {
          const style = getSubjectStyle(subject.slug);
          const isOpen = openSubject === subject.slug;
          return (
            <li key={subject.slug}>
              <button
                type="button"
                onClick={() => setOpenSubject(isOpen ? null : subject.slug)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                <span className={style.icon}>{subject.name}</span>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                )}
              </button>

              {isOpen && (
                <ul className="ml-3 flex flex-col gap-3 border-l border-slate-200 py-1 pl-3">
                  {subject.topics.map((topic) => (
                    <li key={topic.slug}>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          {topic.name}
                        </span>
                        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                          {topic.paperName}
                        </span>
                      </div>
                      <ul className="flex flex-col gap-0.5">
                        {topic.subtopics.map((subtopic) => {
                          const isActive = pathname === subtopic.href;
                          return (
                            <li key={subtopic.slug}>
                              <Link
                                href={subtopic.href}
                                className={`block rounded-md px-2 py-1 text-sm transition-colors ${
                                  isActive
                                    ? `${style.lightBg} font-medium text-slate-900`
                                    : subtopic.hasNotes
                                      ? "text-slate-700 hover:bg-slate-50"
                                      : "text-slate-400 hover:bg-slate-50"
                                }`}
                              >
                                {subtopic.name}
                                {!subtopic.hasNotes && (
                                  <span className="ml-1.5 text-xs text-slate-400">(not added yet)</span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
