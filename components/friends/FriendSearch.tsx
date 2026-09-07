"use client";

import { useState } from "react";
import { UserPlus, Check, Clock } from "lucide-react";
import { searchUsernames, sendFriendRequest, type UsernameSearchResult } from "@/lib/friends";

type Connection = { userId: string; status: "accepted" | "pending_sent" | "pending_received" };

type Props = {
  currentUserId: string;
  connections: Connection[];
};

// Search box + results for /friends. Existing connections (already friends,
// already requested either direction) are shown as a status label instead
// of a re-clickable "Add friend" button, since send_friend_request() would
// just reject a duplicate request anyway.
export default function FriendSearch({ currentUserId, connections }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UsernameSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const statusById = new Map(connections.map((c) => [c.userId, c.status]));

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length === 0) return;
    setSearching(true);
    setError(null);
    const found = await searchUsernames(query, currentUserId);
    setResults(found);
    setSearching(false);
    setHasSearched(true);
  }

  async function handleAdd(userId: string) {
    setError(null);
    const err = await sendFriendRequest(userId);
    if (err) {
      setError(err);
      return;
    }
    setSentTo((prev) => new Set(prev).add(userId));
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={searching || query.trim().length === 0}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

      <ul className="mt-2 divide-y divide-slate-100">
        {results.map((r) => {
          const status = statusById.get(r.userId);
          const justSent = sentTo.has(r.userId);
          return (
            <li key={r.userId} className="flex items-center justify-between py-3 text-sm">
              <span className="font-medium text-slate-900">{r.username}</span>
              {status === "accepted" ? (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Check size={14} /> Friends
                </span>
              ) : status === "pending_sent" || justSent ? (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock size={14} /> Requested
                </span>
              ) : status === "pending_received" ? (
                <span className="text-xs text-slate-500">Sent you a request</span>
              ) : (
                <button
                  onClick={() => handleAdd(r.userId)}
                  className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <UserPlus size={14} /> Add friend
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {hasSearched && !searching && results.length === 0 && (
        <p className="mt-2 text-sm text-slate-500">No users found with that username.</p>
      )}
    </div>
  );
}
