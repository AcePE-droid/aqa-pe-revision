"use client";

import { useState } from "react";
import { BADGE_VISUALS, BADGE_ORDER } from "@/lib/badges";
import { formatRelativeTime } from "@/lib/relative-time";
import { CARD_BASE_CLASSES, CARD_BORDER_DEFAULT } from "@/lib/styles";
import BadgeIcon from "@/components/progress/BadgeIcon";

type Badge = { id: string; name: string; description: string };

type Props = {
  badges: Badge[];
  // badge id -> unlocked_at ISO timestamp, only present for badges this user has unlocked.
  unlockedAt: Record<string, string>;
};

const DEFAULT_VISIBLE_COUNT = 4;

export default function BadgesSection({ badges, unlockedAt }: Props) {
  const [expanded, setExpanded] = useState(false);
  const byId = new Map(badges.map((b) => [b.id, b]));
  const ordered = BADGE_ORDER.map((id) => byId.get(id)).filter((b): b is Badge => Boolean(b));

  // Default view: unlocked badges first (a visible sense of progress), then
  // locked ones in their existing spec order - a simple stand-in for "closest
  // to unlocking" since per-badge proximity data isn't available here.
  const collapsedOrder = [...ordered].sort((a, b) => {
    const aUnlocked = Boolean(unlockedAt[a.id]);
    const bUnlocked = Boolean(unlockedAt[b.id]);
    if (aUnlocked === bUnlocked) return 0;
    return aUnlocked ? -1 : 1;
  });

  const visible = expanded ? ordered : collapsedOrder.slice(0, DEFAULT_VISIBLE_COUNT);

  return (
    <section className={`${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT}`}>
      <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">Badges</h2>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-4">
        {visible.map((badge) => {
          const visual = BADGE_VISUALS[badge.id];
          if (!visual) return null;
          const unlocked = unlockedAt[badge.id];

          return (
            <div key={badge.id} className="flex flex-col items-center text-center">
              <BadgeIcon visual={visual} locked={!unlocked} />
              <p className={`mt-2 text-sm font-medium ${unlocked ? "text-slate-900" : "text-slate-400"}`}>
                {badge.name}
              </p>
              <p className="mt-1 text-xs leading-snug text-slate-500">
                {unlocked ? `Unlocked ${formatRelativeTime(unlocked)}` : badge.description}
              </p>
            </div>
          );
        })}
      </div>
      {ordered.length > DEFAULT_VISIBLE_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-6 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {expanded ? "Show less" : `Show all ${ordered.length} badges`}
        </button>
      )}
    </section>
  );
}
