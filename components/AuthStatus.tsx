"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { migrateLocalProgressToCloud } from "@/lib/progress";

type Props = {
  // "desktop" (default) is the compact dropdown used in the header's nav row.
  // "mobile" renders the same auth state as plain, full-width rows for the
  // hamburger menu instead, and calls onNavigate whenever an item is chosen
  // so the caller can close the menu.
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

// Shows a "Log in" link when signed out, or a profile menu (email + log out)
// when signed in.
export default function AuthStatus({ variant = "desktop", onNavigate }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // Only fires on a genuine sign-in (not on session restore at mount,
      // which fires "INITIAL_SESSION"), so this runs once per real sign-in -
      // a no-op if the user's cloud progress is already populated.
      if (event === "SIGNED_IN" && session?.user) {
        migrateLocalProgressToCloud(session.user.id);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (variant !== "desktop") return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [variant]);

  async function handleLogOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    onNavigate?.();
  }

  if (variant === "mobile") {
    if (!user) {
      return (
        <Link
          href="/login"
          onClick={onNavigate}
          className="flex min-h-[44px] items-center border-b-2 border-transparent px-4 text-base font-medium text-slate-700 hover:bg-slate-50"
        >
          Log in
        </Link>
      );
    }

    const label = user.user_metadata?.full_name || user.email;

    return (
      <div className="mt-2 border-t border-slate-200 pt-2">
        <p className="truncate px-4 pb-1 text-xs text-slate-500">{label}</p>
        <Link
          href="/account"
          onClick={onNavigate}
          className="flex min-h-[44px] items-center px-4 text-base font-medium text-slate-700 hover:bg-slate-50"
        >
          Your account
        </Link>
        <button
          onClick={handleLogOut}
          className="flex min-h-[44px] w-full items-center px-4 text-left text-base font-medium text-slate-700 hover:bg-slate-50"
        >
          Log out
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="border-b-2 border-transparent pb-1 text-slate-700 transition-colors duration-150 hover:text-slate-900"
      >
        Log in
      </Link>
    );
  }

  const label = user.user_metadata?.full_name || user.email;

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setMenuOpen((open) => !open)}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        {label}
      </button>
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-md">
          <p className="truncate px-1 pb-2 text-xs text-slate-500">{user.email}</p>
          <Link
            href="/account"
            onClick={() => setMenuOpen(false)}
            className="block w-full rounded-md px-3 py-1.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Your account
          </Link>
          <button
            onClick={handleLogOut}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
