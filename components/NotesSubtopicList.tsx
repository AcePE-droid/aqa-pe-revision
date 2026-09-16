"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthUserId } from "@/lib/supabase/useAuthUserId";
import {
  getSubtopicProgressMap,
  setConfidence,
  setNotesRead,
  CONFIDENCE_LEVELS,
  CONFIDENCE_LABELS,
  type Confidence,
  type SubtopicProgress,
} from "@/lib/subtopic-progress";

export type NotesSubtopicRow = {
  id: string;
  name: string;
  slug: string;
  hasNotes: boolean;
};

type Props = {
  subtopics: NotesSubtopicRow[];
  basePath: string;
  cardClassName: string;
  mutedCardClassName: string;
};

const DOT_CLASSES: Record<Confidence, { on: string; off: string }> = {
  red: { on: "bg-red-500 border-red-500", off: "border-slate-300 hover:border-red-400" },
  amber: { on: "bg-amber-500 border-amber-500", off: "border-slate-300 hover:border-amber-400" },
  green: { on: "bg-green-600 border-green-600", off: "border-slate-300 hover:border-green-500" },
};

function ConfidenceDots({
  value,
  disabled,
  onChange,
}: {
  value: Confidence | null;
  disabled: boolean;
  onChange: (next: Confidence | null) => void;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Confidence">
      {CONFIDENCE_LEVELS.map((level) => {
        const active = value === level;
        return (
          <button
            key={level}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            // Clicking the active level clears the rating back to unrated.
            aria-label={`${CONFIDENCE_LABELS[level]}${active ? " (selected)" : ""}`}
            title={CONFIDENCE_LABELS[level]}
            onClick={() => onChange(active ? null : level)}
            className={`h-4 w-4 rounded-full border-2 transition-colors disabled:opacity-40 ${
              active ? DOT_CLASSES[level].on : DOT_CLASSES[level].off
            }`}
          />
        );
      })}
    </div>
  );
}

export default function NotesSubtopicList({
  subtopics,
  basePath,
  cardClassName,
  mutedCardClassName,
}: Props) {
  const userId = useAuthUserId();
  const [progress, setProgress] = useState<Record<string, SubtopicProgress> | null>(null);

  useEffect(() => {
    if (!userId) {
      setProgress(null);
      return;
    }
    let cancelled = false;
    const ids = subtopics.filter((s) => s.hasNotes).map((s) => s.id);
    getSubtopicProgressMap(userId, ids).then((map) => {
      if (!cancelled) setProgress(map);
    });
    return () => {
      cancelled = true;
    };
    // subtopics is a stable server-rendered list for this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  function current(subtopicId: string): SubtopicProgress {
    return progress?.[subtopicId] ?? { notesRead: false, confidence: null };
  }

  function update(subtopicId: string, patch: Partial<SubtopicProgress>) {
    setProgress((prev) => ({
      ...(prev ?? {}),
      [subtopicId]: { ...current(subtopicId), ...patch },
    }));
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      {subtopics.map((subtopic, i) => {
        const number = String(i + 1).padStart(2, "0");

        if (!subtopic.hasNotes) {
          return (
            <div key={subtopic.id} className={`flex items-center gap-4 ${mutedCardClassName}`}>
              <span className="font-serif text-lg font-light text-slate-300">{number}</span>
              <h2 className="flex-1 font-serif text-base font-semibold text-slate-900">
                {subtopic.name}
              </h2>
              <p className="text-sm text-slate-500">Coming soon</p>
            </div>
          );
        }

        const { notesRead, confidence } = current(subtopic.id);
        const pending = userId !== null && progress === null;

        return (
          <div key={subtopic.id} className={`flex items-center gap-4 ${cardClassName}`}>
            {/* The link deliberately covers only the number and title: the
                controls to its right are interactive, and nesting buttons
                inside an anchor is invalid and breaks keyboard nav. */}
            <Link href={`${basePath}/${subtopic.slug}`} className="flex flex-1 items-center gap-4">
              <span className="font-serif text-lg font-light text-slate-300">{number}</span>
              <h2 className="flex-1 font-serif text-base font-semibold text-slate-900">
                {subtopic.name}
              </h2>
            </Link>

            {userId === null ? (
              <p className="text-sm text-slate-500">Notes available</p>
            ) : (
              <div className="flex shrink-0 items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={notesRead}
                    disabled={pending}
                    onChange={(e) => {
                      const next = e.target.checked;
                      update(subtopic.id, { notesRead: next });
                      setNotesRead(userId, subtopic.id, next);
                    }}
                    className="h-4 w-4 rounded border-slate-300 accent-blue-600 disabled:opacity-40"
                  />
                  Read
                </label>
                <ConfidenceDots
                  value={confidence}
                  disabled={pending}
                  onChange={(next) => {
                    update(subtopic.id, { confidence: next });
                    setConfidence(userId, subtopic.id, next);
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
