import { CARD_BASE_CLASSES, CARD_BORDER_DEFAULT } from "@/lib/styles";

// Mirrors the shape of the subtopic list in app/notes/[subjectSlug]/
// [topicSlug]/page.tsx. The page itself is prebuilt now, so this rarely
// shows - it covers the case where the payload isn't already cached (a cold
// visit, or a slow connection), where without it the previous page simply
// sat there unchanged and the click looked ignored.
export default function NotesTopicLoading() {
  return (
    <div className="py-16">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-9 w-72 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-4 w-56 animate-pulse rounded bg-slate-100" />

      <div className="mt-8 flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 ${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT}`}
          >
            <div className="h-5 w-6 animate-pulse rounded bg-slate-200" />
            <div className="h-5 flex-1 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-24 shrink-0 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
