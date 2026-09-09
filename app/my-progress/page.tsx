import { redirect } from "next/navigation";
import { createClient, getVerifiedUserId } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCachedProgressContentIndexData, getSubjects, type ProgressContentIndex } from "@/lib/content";
import { getSubjectStyle } from "@/lib/subject-styles";
import { CARD_BASE_CLASSES, CARD_BORDER_DEFAULT } from "@/lib/styles";
import BadgesSection from "@/components/progress/BadgesSection";
import LeaderboardSection, { type LeaderboardRow } from "@/components/progress/LeaderboardSection";
import WeeklyActivityChart from "@/components/progress/WeeklyActivityChart";

// Buckets (subtopics) need at least this many attempted items before they're
// eligible for "Focus on this next" - otherwise a single missed flashcard in
// a barely-touched topic would show up as a 0% "weakest" bucket.
const MIN_BUCKET_ATTEMPTS = 5;

// Buckets at or above this known/correct percentage are considered mastered
// and must never appear in "Focus on this next", even if there aren't 5
// other genuinely weak buckets to fill out the list.
const MASTERY_THRESHOLD_PCT = 90;

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{label}</p>
    </div>
  );
}

export default async function MyProgressPage() {
  const supabase = await createClient();
  const userId = await getVerifiedUserId();
  if (!userId) redirect("/login");

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

  const [
    { data: streakRows },
    { data: flashcardRows },
    { data: questionRows },
    { data: recentDailyRows },
    { data: allDailyRows },
    { data: badgeRows },
    { data: userBadgeRows },
    { data: myScoreRows },
    { data: friendshipRows },
  ] = await Promise.all([
    supabase.rpc("get_user_streak", { p_user_id: userId }),
    supabase.from("flashcard_progress").select("flashcard_id, status").eq("user_id", userId),
    supabase.from("question_progress").select("question_id, correct").eq("user_id", userId),
    supabase
      .from("daily_activity")
      .select("date, cards_reviewed, questions_answered")
      .eq("user_id", userId)
      .gte("date", sevenDaysAgoStr),
    supabase.from("daily_activity").select("cards_reviewed, questions_answered").eq("user_id", userId),
    supabase.from("badges").select("id, name, description"),
    supabase.from("user_badges").select("badge_id, unlocked_at").eq("user_id", userId),
    supabase.from("leaderboard_scores").select("window_name, score, rank").eq("user_id", userId),
    // Fetched here (rather than inside the leaderboard try/catch below) so it
    // runs in the same round trip as everything else above, instead of a
    // separate sequential wave after this Promise.all resolves.
    supabase
      .from("friendships")
      .select("user_id_a, user_id_b")
      .eq("status", "accepted")
      .or(`user_id_a.eq.${userId},user_id_b.eq.${userId}`),
  ]);

  // --- Leaderboard: score reads use the service-role admin client because
  // ranking requires seeing every user's score, which per-user RLS on
  // leaderboard_scores doesn't allow (see the migration's own note on that
  // policy). Falls back to an empty leaderboard rather than crashing the
  // page if the service-role key isn't configured. Usernames are read with
  // the regular (RLS-scoped) client instead - profiles has a "select ->
  // anyone signed in" policy, so no admin client is needed there.
  let weeklyLeaderboard: LeaderboardRow[] = [];
  let allTimeLeaderboard: LeaderboardRow[] = [];
  let friendsWeeklyLeaderboard: LeaderboardRow[] = [];
  let friendsAllTimeLeaderboard: LeaderboardRow[] = [];
  let hasFriends = false;
  try {
    const admin = createAdminClient();

    const friendIds = (friendshipRows ?? []).map((r) => (r.user_id_a === userId ? r.user_id_b : r.user_id_a));
    hasFriends = friendIds.length > 0;
    const friendsAndSelfIds = [userId, ...friendIds];

    const [
      { data: weeklyScores },
      { data: allTimeScores },
      { data: friendsWeeklyScores },
      { data: friendsAllTimeScores },
    ] = await Promise.all([
      admin
        .from("leaderboard_scores")
        .select("user_id, score, rank")
        .eq("window_name", "weekly")
        .not("rank", "is", null)
        .order("rank", { ascending: true })
        .limit(10),
      admin
        .from("leaderboard_scores")
        .select("user_id, score, rank")
        .eq("window_name", "all_time")
        .not("rank", "is", null)
        .order("rank", { ascending: true })
        .limit(10),
      admin.from("leaderboard_scores").select("user_id, score").eq("window_name", "weekly").in("user_id", friendsAndSelfIds),
      admin
        .from("leaderboard_scores")
        .select("user_id, score")
        .eq("window_name", "all_time")
        .in("user_id", friendsAndSelfIds),
    ]);

    const allUserIds = new Set<string>(friendsAndSelfIds);
    for (const row of weeklyScores ?? []) allUserIds.add(row.user_id);
    for (const row of allTimeScores ?? []) allUserIds.add(row.user_id);

    const { data: profileRows } = await supabase
      .from("profiles")
      .select("user_id, username")
      .in("user_id", Array.from(allUserIds));
    const usernameById = new Map((profileRows ?? []).map((p) => [p.user_id, p.username]));

    const toRow = (row: { user_id: string; score: number; rank: number | null }): LeaderboardRow => ({
      userId: row.user_id,
      displayName: usernameById.get(row.user_id) ?? "Unknown",
      rank: row.rank,
      score: row.score,
    });

    weeklyLeaderboard = (weeklyScores ?? []).map(toRow);
    allTimeLeaderboard = (allTimeScores ?? []).map(toRow);

    // Friends tab is ranked within just this user + their accepted friends
    // (not the global `rank` column, which wouldn't make sense for a small
    // subset). Anyone with no leaderboard_scores row yet (no activity) still
    // shows up at score 0 rather than being dropped, so a friend doesn't
    // just seem to be missing.
    const buildFriendsRows = (rows: { user_id: string; score: number }[] | null): LeaderboardRow[] => {
      const scoreById = new Map((rows ?? []).map((r) => [r.user_id, r.score]));
      return friendsAndSelfIds
        .map((id) => ({
          userId: id,
          displayName: usernameById.get(id) ?? "Unknown",
          score: scoreById.get(id) ?? 0,
        }))
        .sort((a, b) => b.score - a.score)
        .map((row, i) => ({ ...row, rank: i + 1 }));
    };

    friendsWeeklyLeaderboard = buildFriendsRows(friendsWeeklyScores);
    friendsAllTimeLeaderboard = buildFriendsRows(friendsAllTimeScores);
  } catch (err) {
    console.warn("Leaderboard unavailable:", err);
  }

  const yourRank = {
    weekly: myScoreRows?.find((r) => r.window_name === "weekly")?.rank ?? null,
    allTime: myScoreRows?.find((r) => r.window_name === "all_time")?.rank ?? null,
  };

  // --- Content coverage, subject strength, focus buckets ---
  const indexData = await getCachedProgressContentIndexData();
  const index: ProgressContentIndex = {
    flashcardSubject: new Map(indexData.flashcardSubject),
    flashcardBucket: new Map(indexData.flashcardBucket),
    questionSubject: new Map(indexData.questionSubject),
    questionBucket: new Map(indexData.questionBucket),
    buckets: new Map(indexData.buckets),
    subjectTotals: new Map(indexData.subjectTotals),
  };
  const subjects = getSubjects();

  let totalContentItems = 0;
  for (const total of index.subjectTotals.values()) totalContentItems += total;

  const itemsSeen = (flashcardRows?.length ?? 0) + (questionRows?.length ?? 0);
  const coveragePct = totalContentItems > 0 ? Math.round((itemsSeen / totalContentItems) * 100) : 0;

  let lifetimeCards = 0;
  let lifetimeQuestions = 0;
  for (const row of allDailyRows ?? []) {
    lifetimeCards += row.cards_reviewed;
    lifetimeQuestions += row.questions_answered;
  }

  const subjectKnownCount = new Map<string, number>();
  const bucketAttempted = new Map<string, number>();
  const bucketKnown = new Map<string, number>();

  for (const row of flashcardRows ?? []) {
    const subject = index.flashcardSubject.get(row.flashcard_id);
    const bucket = index.flashcardBucket.get(row.flashcard_id);
    if (bucket) {
      bucketAttempted.set(bucket, (bucketAttempted.get(bucket) ?? 0) + 1);
      if (row.status === "known") bucketKnown.set(bucket, (bucketKnown.get(bucket) ?? 0) + 1);
    }
    if (subject && row.status === "known") {
      subjectKnownCount.set(subject, (subjectKnownCount.get(subject) ?? 0) + 1);
    }
  }
  for (const row of questionRows ?? []) {
    const subject = index.questionSubject.get(row.question_id);
    const bucket = index.questionBucket.get(row.question_id);
    if (bucket) {
      bucketAttempted.set(bucket, (bucketAttempted.get(bucket) ?? 0) + 1);
      if (row.correct) bucketKnown.set(bucket, (bucketKnown.get(bucket) ?? 0) + 1);
    }
    if (subject && row.correct) {
      subjectKnownCount.set(subject, (subjectKnownCount.get(subject) ?? 0) + 1);
    }
  }

  const subjectStrength = subjects.map((s) => {
    const total = index.subjectTotals.get(s.name) ?? 0;
    const known = subjectKnownCount.get(s.name) ?? 0;
    return { ...s, pct: total > 0 ? Math.round((known / total) * 100) : 0 };
  });

  const bucketStats: {
    id: string;
    name: string;
    topicName: string;
    pct: number;
  }[] = [];
  for (const [id, info] of index.buckets) {
    const attempted = bucketAttempted.get(id) ?? 0;
    if (attempted < MIN_BUCKET_ATTEMPTS) continue;
    const known = bucketKnown.get(id) ?? 0;
    const pct = Math.round((known / attempted) * 100);
    if (pct >= MASTERY_THRESHOLD_PCT) continue;
    bucketStats.push({
      id,
      name: info.name,
      topicName: info.topicName,
      pct,
    });
  }
  bucketStats.sort((a, b) => a.pct - b.pct);
  const focusBuckets = bucketStats.slice(0, 5);

  // --- Last 7 days activity strip ---
  const dailyByDate = new Map((recentDailyRows ?? []).map((r) => [r.date, r]));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const row = dailyByDate.get(dateStr);
    const cardsReviewed = row?.cards_reviewed ?? 0;
    const questionsAnswered = row?.questions_answered ?? 0;
    return {
      label: d.toLocaleDateString("en-GB", { weekday: "short" }),
      fullLabel: d.toLocaleDateString("en-GB", { weekday: "long" }),
      cardsReviewed,
      questionsAnswered,
      total: cardsReviewed + questionsAnswered,
    };
  });

  const currentStreak = streakRows?.[0]?.current_streak ?? 0;
  const unlockedAt = Object.fromEntries((userBadgeRows ?? []).map((r) => [r.badge_id, r.unlocked_at]));

  return (
    <div className="py-16">
      {/* Hero */}
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 px-6 py-10 text-center md:px-10 md:py-12">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          My Progress
        </h1>
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-y-8 sm:grid-cols-4">
          <StatTile label="Content covered" value={`${coveragePct}%`} />
          <StatTile label="Day streak" value={String(currentStreak)} />
          <StatTile label="Cards studied" value={lifetimeCards.toLocaleString()} />
          <StatTile label="Questions answered" value={lifetimeQuestions.toLocaleString()} />
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Strength by subject */}
        <section className={`${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT}`}>
          <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">
            Strength by subject
          </h2>
          <div className="mt-5 space-y-5">
            {subjectStrength.map((s) => {
              const style = getSubjectStyle(s.slug);
              return (
                <div key={s.slug}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{s.name}</span>
                    <span className="font-semibold text-slate-900">{s.pct}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${style.progressBar}`}
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Focus on this next */}
        <section className={`${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT}`}>
          <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">
            Focus on this next
          </h2>
          {focusBuckets.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Keep studying - once you&rsquo;ve attempted a few items in a topic, weak spots will show
              up here.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {focusBuckets.map((b) => (
                <li key={b.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{b.name}</p>
                    <p className="text-xs text-slate-500">{b.topicName}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">{b.pct}% known</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Last 7 days */}
        <section className={`${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT}`}>
          <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">Last 7 days</h2>
          <WeeklyActivityChart days={days} />
        </section>

        {badgeRows && <BadgesSection badges={badgeRows} unlockedAt={unlockedAt} />}
      </div>

      <div className="mt-6">
        <LeaderboardSection
          weekly={weeklyLeaderboard}
          allTime={allTimeLeaderboard}
          friendsWeekly={friendsWeeklyLeaderboard}
          friendsAllTime={friendsAllTimeLeaderboard}
          hasFriends={hasFriends}
          currentUserId={userId}
          yourRank={yourRank}
        />
      </div>
    </div>
  );
}
