import type { SVGProps } from "react";

// Simple line-art sport icons used purely as decorative background motifs
// (see SportsBackground). Style matches lucide's conventions (24x24 viewBox,
// round caps/joins) so they read consistently even at low opacity.
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function Football(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8.7l3.1 2.3-1.2 3.7h-3.8l-1.2-3.7z" />
      <path d="M12 8.7L12 3M15.1 11L20.6 9.2M13.9 14.7L17.3 19.3M10.1 14.7L6.7 19.3M8.9 11L3.4 9.2" />
    </svg>
  );
}

export function Basketball(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3v18" />
      <path d="M5.6 5.6c2.4 3 2.4 9.8 0 12.8" />
      <path d="M18.4 5.6c-2.4 3-2.4 9.8 0 12.8" />
    </svg>
  );
}

export function GolfClub(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M17.5 3.5L7 19" />
      <path d="M16.3 4.9l2.4-2.4" />
      <path d="M7 19l3.6 1.3 1-2.7-3.6-1.4z" />
    </svg>
  );
}

export function TennisRacket(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <ellipse cx="12" cy="8" rx="6" ry="7.5" />
      <path d="M8 5h8M7.3 8h9.4M8 11h8M10 1.5v13M12 1v14M14 1.5v13" />
      <path d="M9.3 14.8L11 16M14.7 14.8L13 16" />
      <rect x="10.3" y="16" width="3.4" height="6.5" rx="1" />
    </svg>
  );
}

export function TableTennisBat(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="9" r="6" />
      <path d="M9 15v6" strokeWidth={3} />
    </svg>
  );
}

export function Netball(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M4 8.5c4 2.8 12 2.8 16 0M4 15.5c4-2.8 12-2.8 16 0" />
    </svg>
  );
}

export function BoxingGlove(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="2.5" width="6" height="5" rx="2" />
      <rect x="5.5" y="7" width="12" height="13" rx="6" />
      <ellipse cx="4.5" cy="13" rx="2.6" ry="3.2" />
    </svg>
  );
}

export function Shuttlecock(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <ellipse cx="12" cy="19" rx="2.1" ry="1.5" />
      <path d="M12 17.5L6.5 5.5h11z" />
      <path d="M9 17L8 6M15 17l1-11M12 17.5V5.5" />
      <path d="M7.7 10h8.6M8.6 13.5h6.8" />
    </svg>
  );
}

export function RugbyBall(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <g transform="rotate(-35 12 12)">
        <ellipse cx="12" cy="12" rx="9" ry="5" />
        <path d="M3.5 12h17" />
        <path d="M8.5 10.3v3.4M11 9.6v4.8M13.5 10.3v3.4" />
      </g>
    </svg>
  );
}

export function Bicycle(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="6" cy="17" r="3.5" />
      <circle cx="18" cy="17" r="3.5" />
      <path d="M6 17l5.5-10h3l4 10" />
      <path d="M10.5 7h3.5" />
      <path d="M13 17h5" />
    </svg>
  );
}

export function Volleyball(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c2 3 2 15 0 18M3 12c3-2 15-2 18 0" />
      <path d="M5.6 6.4c2 3 2 8.2 0 11.2M18.4 6.4c-2 3-2 8.2 0 11.2" />
    </svg>
  );
}

export function CricketBat(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <g transform="rotate(-25 12 12)">
        <rect x="9" y="13" width="6" height="9" rx="2.5" />
        <path d="M10.3 13l1.7 2.2 1.7-2.2" />
        <rect x="10.4" y="2" width="3.2" height="11" rx="1.4" />
        <path d="M10.4 5.2h3.2M10.4 7.7h3.2M10.4 10.2h3.2" />
      </g>
    </svg>
  );
}

export function Skis(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9.5 21V6c0-1.4.5-2.3 1.3-3M10.8 3c.8.7 1.2 1.6 1.2 3v15" />
      <path d="M12.8 21V6.5c0-1.4.5-2.3 1.3-3M14.1 3.5c.8.7 1.2 1.6 1.2 3v14.5" />
      <path d="M9.3 13h2.5M13 13.5h2.5" />
      <path d="M6 20V7l-1.2 1.4M6 7l1.2 1.4" />
      <path d="M18 20V7l-1.2 1.4M18 7l1.2 1.4" />
      <circle cx="6" cy="15.5" r="1.5" />
      <circle cx="18" cy="15.5" r="1.5" />
    </svg>
  );
}
