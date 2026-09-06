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
    style: { top: "6%", left: "5%", width: "44px", height: "44px", transform: "rotate(-12deg)" },
  },
  {
    Icon: Basketball,
    className: "text-subject-psychology/25",
    style: { top: "10%", right: "6%", width: "52px", height: "52px", transform: "rotate(15deg)" },
  },
  {
    Icon: GolfClub,
    className: "text-subject-society/20",
    style: { top: "34%", left: "3%", width: "60px", height: "60px", transform: "rotate(-20deg)" },
  },
  {
    Icon: TennisRacket,
    className: "text-subject-anatomy/20",
    style: { top: "30%", right: "4%", width: "56px", height: "56px", transform: "rotate(18deg)" },
  },
  {
    Icon: TableTennisBat,
    className: "text-subject-psychology/25",
    style: { top: "58%", left: "6%", width: "44px", height: "44px", transform: "rotate(10deg)" },
  },
  {
    Icon: Netball,
    className: "text-subject-society/20",
    style: { top: "54%", right: "5%", width: "48px", height: "48px", transform: "rotate(-8deg)" },
  },
  {
    Icon: BoxingGlove,
    className: "text-subject-anatomy/20",
    style: { top: "78%", left: "10%", width: "52px", height: "52px", transform: "rotate(12deg)" },
  },
  {
    Icon: Shuttlecock,
    className: "text-subject-psychology/22",
    style: { top: "20%", left: "26%", width: "40px", height: "40px", transform: "rotate(-6deg)" },
    hideOnMobile: true,
  },
  {
    Icon: RugbyBall,
    className: "text-subject-society/20",
    style: { top: "82%", right: "12%", width: "56px", height: "56px", transform: "rotate(-15deg)" },
  },
  {
    Icon: Bicycle,
    className: "text-subject-anatomy/18",
    style: { top: "46%", left: "17%", width: "48px", height: "48px", transform: "rotate(8deg)" },
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
