"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthUserId } from "@/lib/supabase/useAuthUserId";
import { FRIEND_REQUESTS_CHANGED_EVENT } from "@/lib/friends";

// Count of incoming (not-yet-responded-to) friend requests for the
// signed-in user, shown as a small badge next to the "Friends" link in
// AuthStatus. Refetches on sign-in/out and whenever
// FRIEND_REQUESTS_CHANGED_EVENT fires (accept/decline on /friends) - Header
// stays mounted across client-side navigation, so it wouldn't otherwise
// notice a request being responded to on another page.
export function useIncomingFriendRequestCount(): number {
  const userId = useAuthUserId();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }

    const supabase = createClient();

    async function fetchCount() {
      const { count: c } = await supabase
        .from("friendships")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .neq("requested_by", userId)
        .or(`user_id_a.eq.${userId},user_id_b.eq.${userId}`);
      setCount(c ?? 0);
    }

    fetchCount();
    window.addEventListener(FRIEND_REQUESTS_CHANGED_EVENT, fetchCount);
    return () => window.removeEventListener(FRIEND_REQUESTS_CHANGED_EVENT, fetchCount);
  }, [userId]);

  return count;
}
