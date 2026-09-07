import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Recomputes leaderboard_scores.rank for every user, called every 15
// minutes by Vercel Cron (see vercel.json). Uses the service-role client
// because ranking requires reading every user's score, which per-user RLS
// policies on leaderboard_scores don't allow - see recompute_leaderboard_ranks()
// in supabase/migrations/20260907000000_create_activity_gamification.sql.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("Recompute leaderboard: admin client unavailable:", err);
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const { error } = await admin.rpc("recompute_leaderboard_ranks");
  if (error) {
    console.error("Failed to recompute leaderboard ranks:", error);
    return NextResponse.json({ error: "Failed to recompute ranks" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
