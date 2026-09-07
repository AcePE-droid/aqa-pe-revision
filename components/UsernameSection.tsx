"use client";

import { useState } from "react";
import { updateUsername } from "@/lib/friends";

type Props = {
  initialUsername: string;
  usernameUpdatedAt: string; // ISO timestamp
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Lets a signed-in user change their own username. The 30-day cooldown is
// enforced server-side in update_username() (see
// supabase/migrations/20260909000000_friends_system.sql) - the client-side
// canChange check here is just to disable the form early and show the
// unlock date, not the actual enforcement.
export default function UsernameSection({ initialUsername, usernameUpdatedAt }: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [input, setInput] = useState(initialUsername);
  const [updatedAt, setUpdatedAt] = useState(usernameUpdatedAt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const nextChangeDate = new Date(new Date(updatedAt).getTime() + THIRTY_DAYS_MS);
  const canChange = Date.now() >= nextChangeDate.getTime();
  const trimmedInput = input.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (trimmedInput.length === 0 || trimmedInput === username) return;

    setSaving(true);
    const err = await updateUsername(trimmedInput);
    setSaving(false);

    if (err) {
      setError(err);
      return;
    }
    setUsername(trimmedInput);
    setUpdatedAt(new Date().toISOString());
    setSuccess(true);
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900">Username</h2>
      <p className="mt-1 text-sm text-slate-600">
        Friends find you by this username, and it&rsquo;s what shows on the friends leaderboard. You can
        change it once every 30 days.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!canChange || saving}
          maxLength={20}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
        />
        <button
          type="submit"
          disabled={!canChange || saving || trimmedInput.length === 0 || trimmedInput === username}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
      {!canChange && (
        <p className="mt-2 text-xs text-slate-500">
          You can change your username again on{" "}
          {nextChangeDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-700">Username updated.</p>}
    </div>
  );
}
