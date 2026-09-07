import { Lock } from "lucide-react";
import type { BadgeVisual } from "@/lib/badges";

type Props = {
  visual: BadgeVisual;
  locked: boolean;
  size?: number;
};

// A coloured circle with a single centred icon - unlocked badges show their
// real icon/colour, locked badges are greyed out with a lock icon in place
// of the normal one (per the site owner's badge visual spec).
export default function BadgeIcon({ visual, locked, size = 48 }: Props) {
  const Icon = visual.icon;
  const iconSize = Math.round(size / 2);

  if (locked) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full bg-slate-200"
        style={{ width: size, height: size }}
      >
        <Lock className="text-slate-400" size={iconSize} />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full ${visual.circleBg}`}
      style={{ width: size, height: size }}
    >
      <Icon className={visual.iconColor} size={iconSize} />
    </div>
  );
}
