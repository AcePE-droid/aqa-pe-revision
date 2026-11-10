"use client";

import { useState } from "react";
import Link from "next/link";
import { CARD_BASE_CLASSES, CARD_BORDER_DEFAULT } from "@/lib/styles";

export type LeaderboardRow = {
  userId: string;
  displayName: string;
  rank: number | null;
  score: number;
};

type Props = {
  // Ranked within just the signed-in user + their accepted friends (see
  // app/my-progress/page.tsx) - always includes the signed-in user, even
  // when hasFriends is false.
  //
  // There is deliberately no global board. It showed the top 10 usernames
  // to every signed-in user, which is more exposure than a revision site
  // needs, and across a small user base it was either empty or the same
  // name every week. Friends-only keeps the comparison that motivates
  // without publishing anyone to strangers.
  friendsWeekly: LeaderboardRow[];
  friendsAllTime: LeaderboardRow[];
  hasFriends: boolean;
  currentUserId: string;
};

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
        active ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

export default function LeaderboardSection({
  friendsWeekly,
  friendsAllTime,
  hasFriends,
  currentUserId,
}: Props) {
  const [selectedWindow, setSelectedWindow] = useState<"weekly" | "all_time">("weekly");

  const rows = selectedWindow === "weekly" ? friendsWeekly : friendsAllTime;

  return (
    <section className={`${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">
          Friends leaderboard
        </h2>
        <div className="flex rounded-md border border-slate-300 p-0.5">
          <ToggleButton active={selectedWindow === "weekly"} onClick={() => setSelectedWindow("weekly")}>
            This week
          </ToggleButton>
          <ToggleButton active={selectedWindow === "all_time"} onClick={() => setSelectedWindow("all_time")}>
            All time
          </ToggleButton>
        </div>
      </div>

      {!hasFriends ? (
        <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">No friends yet</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
            Search for friends by username on the{" "}
            <Link href="/friends" className="font-medium text-blue-600 hover:underline">
              Friends
            </Link>{" "}
            page to see how you compare.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-center text-sm text-slate-500">No scores yet - be the first!</p>
      ) : (
        <ol className="mt-6 divide-y divide-slate-100">
          {rows.map((row) => (
            <li
              key={row.userId}
              className={`flex items-center justify-between gap-3 py-3 text-sm ${
                row.userId === currentUserId ? "font-semibold text-slate-900" : "text-slate-700"
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="w-6 shrink-0 text-right text-slate-400">{row.rank ?? "-"}</span>
                <span className="truncate">
                  {row.displayName}
                  {row.userId === currentUserId ? " (you)" : ""}
                </span>
              </span>
              <span className="shrink-0 tabular-nums text-slate-500">{Math.round(row.score)} pts</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
