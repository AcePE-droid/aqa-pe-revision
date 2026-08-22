"use client";

import { useEffect, useState } from "react";
import { getSubtopicCounts } from "@/lib/progress";
import { useAuthUserId } from "@/lib/supabase/useAuthUserId";

type Props = {
  subtopicId: string;
  flashcardIds: string[];
  total: number;
};

export default function FlashcardProgressBadge({ subtopicId, flashcardIds, total }: Props) {
  const [known, setKnown] = useState<number | null>(null);
  const userId = useAuthUserId();

  useEffect(() => {
    // Reading progress (local or cloud) can't happen synchronously, so this
    // can only resolve after mount - deliberately deferred to avoid a
    // client/server hydration mismatch, and re-run on auth state changes so
    // signing in/out doesn't leave stale counts on screen.
    let cancelled = false;
    getSubtopicCounts(subtopicId, flashcardIds).then(({ known }) => {
      if (!cancelled) setKnown(known);
    });
    return () => {
      cancelled = true;
    };
  }, [subtopicId, flashcardIds, userId]);

  if (total === 0) return null;

  return (
    <p className="mt-1 text-sm text-slate-500">
      {known === null ? "\u00A0" : `${known}/${total} flashcards known`}
    </p>
  );
}
