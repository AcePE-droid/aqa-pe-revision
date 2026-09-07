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
  weekly: LeaderboardRow[];
  allTime: LeaderboardRow[];
  // Ranked within just the signed-in user + their accepted friends (see
  // app/my-progress/page.tsx) - always includes the signed-in user, even
  // when hasFriends is false.
  friendsWeekly: LeaderboardRow[];
  friendsAllTime: LeaderboardRow[];
  hasFriends: boolean;
  currentUserId: string;
  // "Your rank" line shown below the list when the signed-in user isn't in
  // the top 10 fetched for that window - null if they have no score yet.
  // Only relevant to the Global tab - the Friends tab always includes the
  // signed-in user in its (usually short) list already.
  yourRank: { weekly: number | null; allTime: number | null };
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
  weekly,
  allTime,
  friendsWeekly,
  friendsAllTime,
  hasFriends,
  currentUserId,
  yourRank,
}: Props) {
  const [selectedWindow, setSelectedWindow] = useState<"weekly" | "all_time">("weekly");
  const [tab, setTab] = useState<"global" | "friends">("global");

  const globalRows = selectedWindow === "weekly" ? weekly : allTime;
  const friendRows = selectedWindow === "weekly" ? friendsWeekly : friendsAllTime;
  const rows = tab === "global" ? globalRows : friendRows;
  const myRank = selectedWindow === "weekly" ? yourRank.weekly : yourRank.allTime;
  const inTop10 = globalRows.some((r) => r.userId === currentUserId);

  return (
    <section className={`${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">Leaderboard</h2>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-md border border-slate-300 p-0.5">
            <ToggleButton active={tab === "global"} onClick={() => setTab("global")}>
              Global
            </ToggleButton>
            <ToggleButton active={tab === "friends"} onClick={() => setTab("friends")}>
              Friends
            </ToggleButton>
          </div>
          <div className="flex rounded-md border border-slate-300 p-0.5">
            <ToggleButton active={selectedWindow === "weekly"} onClick={() => setSelectedWindow("weekly")}>
              This week
            </ToggleButton>
            <ToggleButton active={selectedWindow === "all_time"} onClick={() => setSelectedWindow("all_time")}>
              All time
            </ToggleButton>
          </div>
        </div>
      </div>

      {tab === "friends" && !hasFriends ? (
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
        <>
          <ol className="mt-6 divide-y divide-slate-100">
            {rows.map((row) => (
              <li
                key={row.userId}
                className={`flex items-center justify-between py-3 text-sm ${
                  row.userId === currentUserId ? "font-semibold text-slate-900" : "text-slate-700"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 text-right text-slate-400">{row.rank ?? "-"}</span>
                  <span>
                    {row.displayName}
                    {row.userId === currentUserId ? " (you)" : ""}
                  </span>
                </span>
                <span className="tabular-nums text-slate-500">{Math.round(row.score)} pts</span>
              </li>
            ))}
          </ol>
          {tab === "global" && !inTop10 && myRank !== null && (
            <p className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-500">
              Your rank: <span className="font-semibold text-slate-900">#{myRank}</span>
            </p>
          )}
        </>
      )}
    </section>
  );
}
