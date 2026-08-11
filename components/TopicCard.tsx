"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFlashcardProgress } from "@/lib/progress";

type Props = {
  name: string;
  href: string;
  subtopicIds: string[];
  total: number;
};

export default function TopicCard({ name, href, subtopicIds, total }: Props) {
  const [known, setKnown] = useState<number | null>(null);

  useEffect(() => {
    // localStorage isn't available during SSR, so this can only be read after mount -
    // deliberately deferred to avoid a client/server hydration mismatch.
    const count = subtopicIds.reduce((sum, id) => {
      const progress = getFlashcardProgress(id);
      return sum + Object.values(progress).filter((s) => s === "known").length;
    }, 0);
    setKnown(count);
  }, [subtopicIds]);

  if (total === 0) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-6 opacity-50">
        <h2 className="text-lg font-bold text-slate-900">{name}</h2>
        <p className="text-sm text-slate-500">Coming soon</p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100" />
      </div>
    );
  }

  const pct = known ? Math.min(100, Math.round((known / total) * 100)) : 0;

  return (
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-lg border border-slate-200 p-6 transition-shadow hover:border-blue-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">{name}</h2>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
      </div>
      <p className="text-sm text-slate-500">
        {known === null
          ? "\u00A0"
          : known > 0
            ? `${known} / ${total} cards known`
            : `${total} card${total === 1 ? "" : "s"}`}
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}
