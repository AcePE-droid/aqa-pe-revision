"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BADGE_VISUALS } from "@/lib/badges";
import BadgeIcon from "@/components/progress/BadgeIcon";

type BadgeMeta = { name: string; description: string };

type Toast = { key: number; id: string; meta: BadgeMeta };

type BadgeUnlockContextValue = {
  notifyBadgesUnlocked: (badgeIds: string[]) => void;
};

const BadgeUnlockContext = createContext<BadgeUnlockContextValue | null>(null);

// How long each toast stays on screen before auto-dismissing.
const TOAST_DURATION_MS = 6000;

// App-wide badge-unlock toasts: mounted once in the root layout so a badge
// earned mid-flashcard-session or mid-question still pops up regardless of
// which page/section the user is currently on. Badge name/description text
// is fetched lazily (and cached in-memory for the session) rather than
// duplicated as a second hardcoded copy alongside the `badges` DB table.
export default function BadgeUnlockProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const metaCache = useRef<Map<string, BadgeMeta>>(new Map());
  const nextKey = useRef(0);
  const supabase = useMemo(() => createClient(), []);

  const dismiss = useCallback((key: number) => {
    setToasts((prev) => prev.filter((t) => t.key !== key));
  }, []);

  const notifyBadgesUnlocked = useCallback(
    (badgeIds: string[]) => {
      if (badgeIds.length === 0) return;

      void (async () => {
        const missing = badgeIds.filter((id) => !metaCache.current.has(id));
        if (missing.length > 0) {
          const { data, error } = await supabase
            .from("badges")
            .select("id, name, description")
            .in("id", missing);
          if (error) {
            console.warn("Failed to fetch badge details for unlock toast:", error);
          } else {
            for (const row of data ?? []) {
              metaCache.current.set(row.id, { name: row.name, description: row.description });
            }
          }
        }

        for (const id of badgeIds) {
          const meta = metaCache.current.get(id);
          if (!meta || !BADGE_VISUALS[id]) continue;
          const key = nextKey.current++;
          setToasts((prev) => [...prev, { key, id, meta }]);
          setTimeout(() => dismiss(key), TOAST_DURATION_MS);
        }
      })();
    },
    [dismiss, supabase]
  );

  const value = useMemo(() => ({ notifyBadgesUnlocked }), [notifyBadgesUnlocked]);

  return (
    <BadgeUnlockContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-3 px-4 sm:items-end sm:right-4 sm:left-auto">
        {toasts.map((toast) => (
          <div
            key={toast.key}
            className="badge-toast-enter pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
          >
            <BadgeIcon visual={BADGE_VISUALS[toast.id]} locked={false} size={44} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Badge unlocked!</p>
              <p className="truncate text-sm font-semibold text-slate-900">{toast.meta.name}</p>
              <p className="truncate text-xs text-slate-500">{toast.meta.description}</p>
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.key)}
              aria-label="Dismiss"
              className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </BadgeUnlockContext.Provider>
  );
}

export function useBadgeUnlock(): BadgeUnlockContextValue {
  const ctx = useContext(BadgeUnlockContext);
  if (!ctx) throw new Error("useBadgeUnlock must be used within BadgeUnlockProvider");
  return ctx;
}
