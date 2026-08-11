import Link from "next/link";
import type { Flashcard } from "@/types/content";
import { slugify } from "@/lib/slug";

type Props = {
  basePath: string; // e.g. "/paper-1/applied-anatomy/cardiovascular"
  flashcards: Flashcard[];
};

export default function FlashcardGroupList({ basePath, flashcards }: Props) {
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
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:border-blue-300 hover:bg-blue-50/50"
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
