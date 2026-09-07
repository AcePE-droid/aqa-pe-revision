// Per-badge icon + colour for the My Progress badges grid. Keyed by badge id
// (matches `badges.id` in supabase/migrations/20260907000000_create_activity_gamification.sql),
// deliberately independent of that migration's `icon` column - this map
// reflects the site owner's Tabler-equivalent icon spec given after the
// migration was written (lucide-react is reused rather than adding a second
// icon package, since it already covers every icon requested 1:1), and one
// requested icon ("Users2") no longer exists in the installed lucide-react
// version, so a DB-value lookup wouldn't be reliable anyway.
import type { LucideIcon } from "lucide-react";
import {
  Footprints,
  Brain,
  HeartPulse,
  Users,
  Flame,
  TrendingUp,
  Star,
  Layers,
  ClipboardCheck,
  Crown,
} from "lucide-react";
import { subjectStyles } from "@/lib/subject-styles";

export type BadgeVisual = {
  icon: LucideIcon;
  circleBg: string;
  iconColor: string;
};

// Cross-subject badges (milestones, streaks, mastery, volume) share one
// neutral accent rather than borrowing a subject colour.
const NEUTRAL: Pick<BadgeVisual, "circleBg" | "iconColor"> = {
  circleBg: "bg-blue-600",
  iconColor: "text-white",
};

// Distinct gold/premium accent for the paid toolkit badge, so it visually
// signals "exclusive" rather than blending in with the free badges.
const PREMIUM: Pick<BadgeVisual, "circleBg" | "iconColor"> = {
  circleBg: "bg-amber-500",
  iconColor: "text-amber-900",
};

const anatomy = subjectStyles["anatomy-physiology"];
const psychology = subjectStyles["sports-psychology"];
const society = subjectStyles["sport-society-history"];

export const BADGE_VISUALS: Record<string, BadgeVisual> = {
  first_steps: { icon: Footprints, ...NEUTRAL },
  well_rounded: { icon: Brain, ...NEUTRAL },
  anatomy_apprentice: { icon: HeartPulse, circleBg: anatomy.solidBg, iconColor: anatomy.onSolidIcon },
  anatomy_expert: { icon: HeartPulse, circleBg: anatomy.solidBg, iconColor: anatomy.onSolidIcon },
  psychology_apprentice: { icon: Brain, circleBg: psychology.solidBg, iconColor: psychology.onSolidIcon },
  psychology_expert: { icon: Brain, circleBg: psychology.solidBg, iconColor: psychology.onSolidIcon },
  society_apprentice: { icon: Users, circleBg: society.solidBg, iconColor: society.onSolidIcon },
  society_expert: { icon: Users, circleBg: society.solidBg, iconColor: society.onSolidIcon },
  streak_3: { icon: Flame, ...NEUTRAL },
  streak_7: { icon: Flame, ...NEUTRAL },
  streak_30: { icon: Flame, ...NEUTRAL },
  turnaround: { icon: TrendingUp, ...NEUTRAL },
  perfectionist: { icon: Star, ...NEUTRAL },
  card_shark: { icon: Layers, ...NEUTRAL },
  question_master: { icon: ClipboardCheck, ...NEUTRAL },
  toolkit_member: { icon: Crown, ...PREMIUM },
};

// Explicit display order for the badges grid - a plain `select *` from
// Postgres has no guaranteed row order, so the grid always renders in this
// fixed sequence (matches the order badges were introduced in the schema).
export const BADGE_ORDER = [
  "first_steps",
  "well_rounded",
  "anatomy_apprentice",
  "anatomy_expert",
  "psychology_apprentice",
  "psychology_expert",
  "society_apprentice",
  "society_expert",
  "streak_3",
  "streak_7",
  "streak_30",
  "turnaround",
  "perfectionist",
  "card_shark",
  "question_master",
  "toolkit_member",
];
