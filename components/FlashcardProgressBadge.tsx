"use client";

import { useEffect, useState } from "react";
import { getFlashcardProgress } from "@/lib/progress";

type Props = {
  subtopicId: string;
  total: number;
};

export default function FlashcardProgressBadge({ subtopicId, total }: Props) {
  const [known, setKnown] = useState<number | null>(null);

  useEffect(() => {
    // localStorage isn't available during SSR, so this can only be read after mount -
    // deliberately deferred to avoid a client/server hydration mismatch.
    const progress = getFlashcardProgress(subtopicId);
    setKnown(Object.values(progress).filter((s) => s === "known").length);
  }, [subtopicId]);

  if (total === 0) return null;

  return (
    <p className="mt-1 text-sm text-slate-500">
      {known === null ? "\u00A0" : `${known}/${total} flashcards known`}
    </p>
  );
}
