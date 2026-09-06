"use client";

import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import {
  Football,
  Basketball,
  GolfClub,
  TennisRacket,
  TableTennisBat,
  Netball,
  BoxingGlove,
  Shuttlecock,
  RugbyBall,
  Bicycle,
  Volleyball,
  CricketBat,
  Skis,
} from "./SportsIcons";

// Routes where the ambient icon backdrop should NOT show: the marketing
// homepage and static utility/account pages. Every other route belongs to
// the notes / practice-questions / flashcards study flows (including the
// shared `/[paperSlug]/[topicSlug]/...` pages those flows use), so the
// backdrop is shown by default rather than matched per-section.
const HIDDEN_ROUTES = ["/", "/about", "/privacy", "/terms", "/login", "/account", "/past-papers"];

// Fixed, hand-placed set (not randomised, to avoid hydration mismatches and
// layout jitter) of chalky, low-opacity sport icons that sit behind page
// content - purely decorative, echoing each subject's accent colours
// (navy/pink/green from lib/subject-styles.ts) in muted tints.
const ICONS: {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  className: string;
  style: { top?: string; bottom?: string; left?: string; right?: string; width: string; height: string; transform: string };
  hideOnMobile?: boolean;
}[] = [
  {
    Icon: Football,
    className: "text-subject-anatomy/20",
    style: { top: "6%", left: "5%", width: "50px", height: "50px", transform: "rotate(-9deg)" },
  },
  {
    Icon: Basketball,
    className: "text-subject-psychology/25",
    style: { top: "10%", right: "6%", width: "58px", height: "58px", transform: "rotate(12deg)" },
  },
  {
    Icon: GolfClub,
    className: "text-subject-society/20",
    style: { top: "34%", left: "3%", width: "68px", height: "68px", transform: "rotate(-18deg)" },
  },
  {
    Icon: TennisRacket,
    className: "text-subject-anatomy/20",
    style: { top: "30%", right: "4%", width: "68px", height: "68px", transform: "rotate(16deg)" },
  },
  {
    Icon: Netball,
    className: "text-subject-society/20",
    style: { top: "54%", right: "5%", width: "56px", height: "56px", transform: "rotate(-6deg)" },
  },
  {
    Icon: TableTennisBat,
    className: "text-subject-psychology/38",
    style: { top: "58%", left: "6%", width: "50px", height: "50px", transform: "rotate(8deg)" },
  },
  {
    Icon: BoxingGlove,
    className: "text-subject-anatomy/20",
    style: { top: "78%", left: "10%", width: "62px", height: "62px", transform: "rotate(9deg)" },
  },
  {
    Icon: Shuttlecock,
    className: "text-subject-psychology/22",
    style: { top: "20%", left: "26%", width: "46px", height: "46px", transform: "rotate(-6deg)" },
    hideOnMobile: true,
  },
  {
    Icon: RugbyBall,
    className: "text-subject-society/20",
    style: { top: "82%", right: "12%", width: "64px", height: "64px", transform: "rotate(-12deg)" },
  },
  {
    Icon: Bicycle,
    className: "text-subject-anatomy/18",
    style: { top: "46%", left: "17%", width: "56px", height: "56px", transform: "rotate(6deg)" },
    hideOnMobile: true,
  },
  {
    Icon: Volleyball,
    className: "text-subject-psychology/40",
    style: { top: "68%", left: "44%", width: "48px", height: "48px", transform: "rotate(-8deg)" },
    hideOnMobile: true,
  },
  {
    Icon: CricketBat,
    className: "text-subject-society/20",
    style: { top: "42%", right: "15%", width: "54px", height: "54px", transform: "rotate(0deg)" },
    hideOnMobile: true,
  },
  {
    Icon: Skis,
    className: "text-subject-anatomy/18",
    style: { top: "68%", left: "58%", width: "52px", height: "52px", transform: "rotate(0deg)" },
    hideOnMobile: true,
  },
];

export default function SportsBackground() {
  const pathname = usePathname();
  if (HIDDEN_ROUTES.includes(pathname)) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {ICONS.map(({ Icon, className, style, hideOnMobile }, index) => (
        <Icon
          key={index}
          className={`absolute ${hideOnMobile ? "hidden sm:block" : ""} ${className}`}
          style={style}
        />
      ))}
    </div>
  );
}
