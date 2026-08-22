"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Tracks the current signed-in user's ID (or null when signed out).
 * Components that read flashcard progress include this in their effect's
 * dependency array so they refetch on sign-in/sign-out instead of caching
 * progress fetched under a previous auth state.
 */
export function useAuthUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return userId;
}
