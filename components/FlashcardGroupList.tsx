"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Flashcard } from "@/types/content";
import { slugify } from "@/lib/slug";
import { getSubjectStyle } from "@/lib/subject-styles";
import { getFlashcardProgress } from "@/lib/progress";

type Props = {
  basePath: string; // e.g. "/paper-1/applied-anatomy/cardiovascular"
  flashcards: Flashcard[];
  subjectSlug: string;
  subtopicId: string;
};

export default function FlashcardGroupList({ basePath, flashcards, subjectSlug, subtopicId }: Props) {
  const style = getSubjectStyle(subjectSlug);
  // Aggregate progress across the whole subtopic (all groups combined), not
  // scoped to whichever group a student might study next. Deferred to a
  // client-only read (localStorage isn't available during SSR) to avoid a
  // hydration mismatch, matching the pattern used by FlashcardProgressBadge.
  const [known, setKnown] = useState<number | null>(null);
  const [learning, setLearning] = useState<number | null>(null);

  useEffect(() => {
    const progress = getFlashcardProgress(subtopicId);
    setKnown(flashcards.filter((c) => progress[c.id] === "known").length);
    setLearning(flashcards.filter((c) => progress[c.id] === "learning").length);
  }, [subtopicId, flashcards]);

  if (flashcards.length === 0) {
    return <p className="mt-8 text-slate-500">No flashcards for this subtopic yet.</p>;
  }

  const groups = new Map<string, { label: string; count: number }>();
  for (const card of flashcards) {
    const label = card.group?.trim() || "General";
    const key = slugify(label);
    const existing = groups.get(key);
    groups.set(key, { label, count: (existing?.count ?? 0) + 1 });
  }
  const groupList = Array.from(groups.entries()).sort((a, b) => a[1].label.localeCompare(b[1].label));

  return (
    <div className="mt-8">
      <p className="text-slate-600">{flashcards.length} flashcards ready to study.</p>
      {known !== null && learning !== null && (known > 0 || learning > 0) && (
        <div className="mt-3 max-w-xs">
          <p className="text-sm text-slate-500">
            {known} known · {learning} still learning
          </p>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${style.progressBar}`}
              style={{ width: `${Math.min(100, Math.round((known / flashcards.length) * 100))}%` }}
            />
          </div>
        </div>
      )}
      <Link
        href={`${basePath}/flashcards`}
        className="mt-4 inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        Study All
      </Link>

      {groupList.length > 1 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-slate-500">Or study by group:</p>
          <ul className="mt-3 flex flex-col gap-2">
            {groupList.map(([key, { label, count }]) => (
              <li key={key}>
                <Link
                  href={`${basePath}/flashcards?group=${key}`}
                  className={`flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 ${style.hoverBorder} ${style.hoverBg}`}
                >
                  <span className="text-sm font-medium text-slate-900">{label}</span>
                  <span className="text-xs text-slate-500">{count} card{count === 1 ? "" : "s"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
