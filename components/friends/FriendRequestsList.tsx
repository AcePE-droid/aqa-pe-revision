"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { respondFriendRequest, FRIEND_REQUESTS_CHANGED_EVENT } from "@/lib/friends";

type Request = { id: number; counterpartUsername: string };

export default function FriendRequestsList({ requests: initialRequests }: { requests: Request[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [error, setError] = useState<string | null>(null);

  async function handleRespond(id: number, accept: boolean) {
    setError(null);
    const err = await respondFriendRequest(id, accept);
    if (err) {
      setError(err);
      return;
    }
    setRequests((prev) => prev.filter((r) => r.id !== id));
    window.dispatchEvent(new Event(FRIEND_REQUESTS_CHANGED_EVENT));
  }

  if (requests.length === 0) {
    return <p className="mt-4 text-sm text-slate-500">No pending friend requests.</p>;
  }

  return (
    <div className="mt-4">
      {error && <p className="mb-2 text-sm text-red-700">{error}</p>}
      <ul className="divide-y divide-slate-100">
        {requests.map((r) => (
          <li key={r.id} className="flex items-center justify-between py-3 text-sm">
            <span className="font-medium text-slate-900">{r.counterpartUsername}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleRespond(r.id, true)}
                aria-label={`Accept ${r.counterpartUsername}`}
                className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
              >
                <Check size={14} /> Accept
              </button>
              <button
                onClick={() => handleRespond(r.id, false)}
                aria-label={`Decline ${r.counterpartUsername}`}
                className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <X size={14} /> Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
