"use client";

import { useState } from "react";
import { UserMinus } from "lucide-react";
import { removeFriend } from "@/lib/friends";

type Friend = { id: number; counterpartUsername: string };

export default function FriendsList({ friends: initialFriends }: { friends: Friend[] }) {
  const [friends, setFriends] = useState(initialFriends);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  async function handleRemove(id: number) {
    setError(null);
    setRemovingId(id);
    const err = await removeFriend(id);
    setRemovingId(null);
    if (err) {
      setError(err);
      return;
    }
    setFriends((prev) => prev.filter((f) => f.id !== id));
  }

  if (friends.length === 0) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        You haven&rsquo;t added any friends yet - search for a username above to get started.
      </p>
    );
  }

  return (
    <div className="mt-4">
      {error && <p className="mb-2 text-sm text-red-700">{error}</p>}
      <ul className="divide-y divide-slate-100">
        {friends.map((f) => (
          <li key={f.id} className="flex items-center justify-between py-3 text-sm">
            <span className="font-medium text-slate-900">{f.counterpartUsername}</span>
            <button
              onClick={() => handleRemove(f.id)}
              disabled={removingId === f.id}
              aria-label={`Remove ${f.counterpartUsername}`}
              className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <UserMinus size={14} /> Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
