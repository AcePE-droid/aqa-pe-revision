// Client-side helpers for the friend system - thin wrappers around the
// security-definer RPCs in
// supabase/migrations/20260909000000_friends_system.sql, so components
// don't call supabase.rpc(...) with raw string names directly.

import { createClient } from "@/lib/supabase/client";

// Dispatched on window whenever the signed-in user's incoming friend
// requests change (accept/decline), so AuthStatus's pending-request count
// badge - which fetches independently on mount and doesn't otherwise know
// about actions taken on /friends - can refetch without a full page reload.
export const FRIEND_REQUESTS_CHANGED_EVENT = "friend-requests-changed";

export type UsernameSearchResult = {
  userId: string;
  username: string;
};

// Exact-or-partial username search, case-insensitive, excluding the
// searching user themselves. Relies on profiles' "anyone signed in can
// view" select policy.
export async function searchUsernames(query: string, excludeUserId: string): Promise<UsernameSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, username")
    .ilike("username", `%${trimmed}%`)
    .neq("user_id", excludeUserId)
    .limit(20);

  if (error) {
    console.warn("Failed to search usernames:", error);
    return [];
  }
  return (data ?? []).map((row) => ({ userId: row.user_id, username: row.username }));
}

// Returns an error message on failure (e.g. already requested, already
// friends), or null on success.
export async function sendFriendRequest(targetUserId: string): Promise<string | null> {
  const supabase = createClient();
  const { error } = await supabase.rpc("send_friend_request", { p_target_user_id: targetUserId });
  return error?.message ?? null;
}

export async function respondFriendRequest(friendshipId: number, accept: boolean): Promise<string | null> {
  const supabase = createClient();
  const { error } = await supabase.rpc("respond_friend_request", {
    p_friendship_id: friendshipId,
    p_accept: accept,
  });
  return error?.message ?? null;
}

export async function removeFriend(friendshipId: number): Promise<string | null> {
  const supabase = createClient();
  const { error } = await supabase.rpc("remove_friend", { p_friendship_id: friendshipId });
  return error?.message ?? null;
}

export async function updateUsername(username: string): Promise<string | null> {
  const supabase = createClient();
  const { error } = await supabase.rpc("update_username", { p_username: username });
  return error?.message ?? null;
}
