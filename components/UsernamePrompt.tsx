"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CARD_SHAPE_CLASSES } from "@/lib/styles";
import { confirmUsername, updateUsername } from "@/lib/friends";

type Props = {
  username: string;
};

/**
 * Shown once, on My Progress and Friends, to anyone still carrying the
 * username generated for them at signup (profiles.username_chosen = false).
 *
 * The point is consent rather than decoration: the username is the one piece
 * of a student's account that other signed-in users can see, and before this
 * existed it was assigned silently, so the first they knew of it was a
 * classmate turning up in their friend requests. Either button clears the
 * prompt - "keep" is a real answer, not a dismissal, which is why it writes
 * username_chosen rather than just hiding the card locally.
 */
export default function UsernamePrompt({ username }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(username);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const trimmed = input.trim();

  async function handleKeep() {
    setError(null);
    setBusy(true);
    const err = await confirmUsername();
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    // Hide immediately, then refresh so the server component stops sending
    // the prompt on the next navigation too.
    setDone(true);
    router.refresh();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (trimmed.length === 0 || trimmed === username) return;

    setBusy(true);
    const err = await updateUsername(trimmed);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) return null;

  return (
    <section className={`${CARD_SHAPE_CLASSES} border-blue-300 bg-blue-50`}>
      <h2 className="text-base font-semibold text-slate-900">
        Your username is{" "}
        <span className="font-mono font-semibold text-blue-700">{username}</span>
      </h2>
      <p className="mt-1 max-w-prose text-sm text-slate-600">
        This is the only part of your account other students can see. It is what friends use to
        find you, and what shows on the friends leaderboard. Your email and your real name are
        never shown to anyone. Keep this one or pick your own, and please don&rsquo;t use your
        full name.
      </p>

      {editing ? (
        <form onSubmit={handleSave} className="mt-4 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            maxLength={20}
            aria-label="Choose a username"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none disabled:bg-slate-50"
          />
          <button
            type="submit"
            disabled={busy || trimmed.length === 0 || trimmed === username}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setInput(username);
              setError(null);
            }}
            disabled={busy}
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={handleKeep}
            disabled={busy}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? "Saving..." : "Keep this username"}
          </button>
          <button
            onClick={() => setEditing(true)}
            disabled={busy}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Choose my own
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </section>
  );
}
