"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// Shows a "Log in" link when signed out, or a profile menu (email + log out)
// when signed in. Lives in the header's nav row alongside the other links.
export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
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
          <button
            onClick={handleLogOut}
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
