import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Recomputes every user's leaderboard score and then their rank, called once
// daily at 04:00 UTC by Vercel Cron (see vercel.json). Daily rather than more
// often because Vercel's Hobby plan caps how frequently crons can run.
//
// Scores first, ranks second: ranks are derived from the scores, so ranking
// before the recompute would just rank yesterday's numbers. The score pass
// exists because recompute_user_score() otherwise only runs when a user
// studies, which leaves the weekly window frozen at whatever it was when they
// last opened the site instead of decaying as events age past 7 days. See
// recompute_all_scores() in
// supabase/migrations/20260923000000_recompute_all_scores.sql.
//
// Uses the service-role client because both steps span every user's rows,
// which the per-user RLS policies on leaderboard_scores don't allow.
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

  // Ranks are deliberately skipped if the score pass failed - ranking stale
  // scores would report success while leaving the same numbers in place.
  const { data: usersScored, error: scoreError } = await admin.rpc("recompute_all_scores");
  if (scoreError) {
    console.error("Failed to recompute leaderboard scores:", scoreError);
    return NextResponse.json({ error: "Failed to recompute scores" }, { status: 500 });
  }

  const { error } = await admin.rpc("recompute_leaderboard_ranks");
  if (error) {
    console.error("Failed to recompute leaderboard ranks:", error);
    return NextResponse.json({ error: "Failed to recompute ranks" }, { status: 500 });
  }

  return NextResponse.json({ success: true, usersScored });
}
