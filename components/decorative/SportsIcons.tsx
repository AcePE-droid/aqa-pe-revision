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
      <path d="M16.5 3L6.5 20.5" />
      <path d="M6.5 20.5l-3 1.2" />
      <path d="M16.5 3l2.6.9-.9 2.7-2.6-.9z" />
    </svg>
  );
}

export function TennisRacket(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <ellipse cx="11" cy="8" rx="6" ry="7" />
      <path d="M5 8h12M11 1v14" />
      <path d="M11 15v7" />
    </svg>
  );
}

export function TableTennisBat(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="9" r="6" />
      <path d="M9 15v6" strokeWidth={3} />
      <circle cx="18.5" cy="17.5" r="1.3" fill="currentColor" stroke="none" />
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
      <path d="M9 3.5a3.5 3.5 0 0 1 3.5 3.5v3H14a3 3 0 0 1 3 3v2.5A5.5 5.5 0 0 1 11.5 21h-1A5.5 5.5 0 0 1 5 15.5V9a3.5 3.5 0 0 1 3.5-3.5z" />
      <path d="M9 10v3" />
    </svg>
  );
}

export function Shuttlecock(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <ellipse cx="12" cy="19" rx="2.2" ry="1.6" />
      <path d="M12 17.5L7 6h10z" />
      <path d="M12 17.5V6" />
      <path d="M8.5 10.5h7M7.7 13.5h8.6" />
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
