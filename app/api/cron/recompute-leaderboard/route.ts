import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Recomputes leaderboard_scores.rank for every user, called once daily at
// 04:00 UTC by Vercel Cron (see vercel.json). Daily rather than more often
// because Vercel's Hobby plan caps how frequently crons can run. Uses the
// service-role client because ranking requires reading every user's score,
// which per-user RLS policies on leaderboard_scores don't allow - see
// recompute_leaderboard_ranks() in
// supabase/migrations/20260907000000_create_activity_gamification.sql.
export async function GET(request: NextRequest) {
  // Checked before comparing: without this, an unset CRON_SECRET would make
  // the comparison below the literal string "Bearer undefined", which anyone
  // could send to trigger a recompute.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("Recompute leaderboard: CRON_SECRET is not configured.");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
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
