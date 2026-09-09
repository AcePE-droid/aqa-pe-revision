import { redirect } from "next/navigation";
import { createClient, getVerifiedUserId } from "@/lib/supabase/server";
import { CARD_BASE_CLASSES, CARD_BORDER_DEFAULT } from "@/lib/styles";
import FriendSearch from "@/components/friends/FriendSearch";
import FriendRequestsList from "@/components/friends/FriendRequestsList";
import FriendsList from "@/components/friends/FriendsList";

export default async function FriendsPage() {
  const supabase = await createClient();
  const userId = await getVerifiedUserId();
  if (!userId) redirect("/login");

  const { data: friendshipRows } = await supabase
    .from("friendships")
    .select("id, user_id_a, user_id_b, status, requested_by")
    .or(`user_id_a.eq.${userId},user_id_b.eq.${userId}`);

  const counterpartIds = (friendshipRows ?? []).map((r) => (r.user_id_a === userId ? r.user_id_b : r.user_id_a));

  const { data: profileRows } =
    counterpartIds.length > 0
      ? await supabase.from("profiles").select("user_id, username").in("user_id", counterpartIds)
      : { data: [] };

  const usernameById = new Map((profileRows ?? []).map((p) => [p.user_id, p.username]));

  const friendships = (friendshipRows ?? []).map((r) => {
    const counterpartId = r.user_id_a === userId ? r.user_id_b : r.user_id_a;
    return {
      id: r.id as number,
      counterpartId: counterpartId as string,
      counterpartUsername: usernameById.get(counterpartId) ?? "Unknown",
      status: r.status as "pending" | "accepted",
      requestedByMe: r.requested_by === userId,
    };
  });

  const incomingRequests = friendships
    .filter((f) => f.status === "pending" && !f.requestedByMe)
    .map((f) => ({ id: f.id, counterpartUsername: f.counterpartUsername }));

  const friends = friendships
    .filter((f) => f.status === "accepted")
    .map((f) => ({ id: f.id, counterpartUsername: f.counterpartUsername }));

  const connections = friendships.map((f) => ({
    userId: f.counterpartId,
    status:
      f.status === "accepted"
        ? ("accepted" as const)
        : f.requestedByMe
          ? ("pending_sent" as const)
          : ("pending_received" as const),
  }));

  return (
    <div className="py-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">Friends</h1>
      <p className="mt-2 text-slate-600">
        Find friends by username, then compare your progress on the friends leaderboard.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className={`${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT}`}>
          <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">Find friends</h2>
          <FriendSearch currentUserId={userId} connections={connections} />
        </section>

        <section className={`${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT}`}>
          <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">
            Friend requests{incomingRequests.length > 0 ? ` (${incomingRequests.length})` : ""}
          </h2>
          <FriendRequestsList requests={incomingRequests} />
        </section>

        <section className={`${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT} lg:col-span-2`}>
          <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">My friends</h2>
          <FriendsList friends={friends} />
        </section>
      </div>
    </div>
  );
}
