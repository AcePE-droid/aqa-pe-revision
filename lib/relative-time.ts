// Formats a past ISO timestamp as a short relative string (e.g. "3 days
// ago") for "unlocked X ago" badge copy. Deliberately simple/approximate
// (no date library) - good enough for this one piece of copy.
export function formatRelativeTime(isoString: string): string {
  const then = new Date(isoString).getTime();
  const diffSeconds = Math.max(0, Math.floor((Date.now() - then) / 1000));

  const units: [string, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [label, secondsPerUnit] of units) {
    const value = Math.floor(diffSeconds / secondsPerUnit);
    if (value >= 1) return `${value} ${label}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
}
