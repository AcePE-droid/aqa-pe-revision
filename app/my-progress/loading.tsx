import { CARD_BASE_CLASSES, CARD_BORDER_DEFAULT } from "@/lib/styles";

// Mirrors the shape of the real My Progress page so navigation feels instant
// even though the page itself needs several sequential Supabase round trips
// before it can render (see app/my-progress/page.tsx).
export default function MyProgressLoading() {
  return (
    <div className="py-16">
      {/* Hero */}
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 px-6 py-10 text-center md:px-10 md:py-12">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          My Progress
        </h1>
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-y-8 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-9 w-14 animate-pulse rounded-md bg-slate-200" />
              <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <section key={i} className={`${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT}`}>
            <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-5 space-y-4">
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6">
        <section className={`${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT}`}>
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-full animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
