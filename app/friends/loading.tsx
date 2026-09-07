import { CARD_BASE_CLASSES, CARD_BORDER_DEFAULT } from "@/lib/styles";

// Mirrors the shape of the real Friends page so navigation feels instant
// even though the page itself needs a couple of sequential Supabase round
// trips before it can render (see app/friends/page.tsx).
export default function FriendsLoading() {
  return (
    <div className="py-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">Friends</h1>
      <p className="mt-2 text-slate-600">
        Find friends by username, then compare your progress on the friends leaderboard.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className={`${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT}`}>
          <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
          <div className="mt-5 h-10 w-full animate-pulse rounded-md bg-slate-100" />
        </section>

        <section className={`${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT}`}>
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-5 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
          </div>
        </section>

        <section className={`${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT} lg:col-span-2`}>
          <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 w-full animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
