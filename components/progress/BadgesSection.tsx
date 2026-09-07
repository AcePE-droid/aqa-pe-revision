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

export default function BadgesSection({ badges, unlockedAt }: Props) {
  const byId = new Map(badges.map((b) => [b.id, b]));
  const ordered = BADGE_ORDER.map((id) => byId.get(id)).filter((b): b is Badge => Boolean(b));

  return (
    <section className={`${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT}`}>
      <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">Badges</h2>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-4">
        {ordered.map((badge) => {
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
    </section>
  );
}
