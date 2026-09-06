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
      <path d="M12 7.5l2.6 1.9-1 3h-3.2l-1-3z" />
      <path d="M12 3.5v4M12 20.5v-4M4.3 8.6l3.1-.7M19.7 8.6l-3.1-.7M5 16.4l2.9-2.1M19 16.4l-2.9-2.1" />
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
      <path d="M7 8h8M11 2v12" />
      <path d="M11 15v7" />
    </svg>
  );
}

export function TableTennisBat(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="6" />
      <path d="M14.2 14.2L21 21" />
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
      <circle cx="12" cy="4.5" r="2" />
      <path d="M12 6.5L6 19h12z" />
      <path d="M12 6.5v12.5" />
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
