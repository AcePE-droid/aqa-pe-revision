// Mirrors the shape of a notes page: back link, topic eyebrow, the section
// numeral beside the title, the rule under it, then body text. Same purpose
// as the topic-level skeleton one directory up - the page is prebuilt, so
// this is the fallback for an uncached payload rather than the normal path.
export default function NotesSubtopicLoading() {
  return (
    <div className="py-16">
      <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />

      <div className="mt-6 max-w-[68ch]">
        <div className="h-3 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 flex items-baseline gap-4">
          <div className="h-10 w-12 animate-pulse rounded bg-slate-200" />
          <div className="h-9 flex-1 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="mt-6 h-px w-full bg-slate-200" />
      </div>

      <div className="mt-8 max-w-[68ch] space-y-12">
        {Array.from({ length: 3 }).map((_, section) => (
          <div key={section}>
            <div className="h-7 w-64 animate-pulse rounded bg-slate-200" />
            <div className="mt-6 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
