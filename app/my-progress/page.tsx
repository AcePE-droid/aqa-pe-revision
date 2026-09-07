import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProgressContentIndex, getSubjects } from "@/lib/content";
import { getSubjectStyle } from "@/lib/subject-styles";
import { CARD_BASE_CLASSES, CARD_BORDER_DEFAULT } from "@/lib/styles";
import BadgesSection from "@/components/progress/BadgesSection";
import LeaderboardSection, { type LeaderboardRow } from "@/components/progress/LeaderboardSection";

// Buckets (subtopics) need at least this many attempted items before they're
// eligible for "Focus on this next" - otherwise a single missed flashcard in
// a barely-touched topic would show up as a 0% "weakest" bucket.
const MIN_BUCKET_ATTEMPTS = 5;

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
  ] = await Promise.all([
    supabase.rpc("get_user_streak", { p_user_id: user.id }),
    supabase.from("flashcard_progress").select("flashcard_id, status").eq("user_id", user.id),
    supabase.from("question_progress").select("question_id, correct").eq("user_id", user.id),
    supabase
      .from("daily_activity")
      .select("date, cards_reviewed, questions_answered")
      .eq("user_id", user.id)
      .gte("date", sevenDaysAgoStr),
    supabase.from("daily_activity").select("cards_reviewed, questions_answered").eq("user_id", user.id),
    supabase.from("badges").select("id, name, description"),
    supabase.from("user_badges").select("badge_id, unlocked_at").eq("user_id", user.id),
    supabase.from("leaderboard_scores").select("window_name, score, rank").eq("user_id", user.id),
  ]);

  // --- Leaderboard: uses the service-role admin client because ranking
  // requires seeing every user's score, which per-user RLS on
  // leaderboard_scores doesn't allow (see the migration's own note on that
  // policy). Falls back to an empty leaderboard rather than crashing the
  // page if the service-role key isn't configured.
  let weeklyLeaderboard: LeaderboardRow[] = [];
  let allTimeLeaderboard: LeaderboardRow[] = [];
  try {
    const admin = createAdminClient();
    const [{ data: weeklyScores }, { data: allTimeScores }, { data: usersPage }] = await Promise.all([
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
      admin.auth.admin.listUsers({ perPage: 1000 }),
    ]);

    const nameById = new Map<string, string>();
    for (const u of usersPage?.users ?? []) {
      nameById.set(u.id, (u.user_metadata?.full_name as string | undefined) || u.email || "Anonymous");
    }

    const toRow = (row: { user_id: string; score: number; rank: number | null }): LeaderboardRow => ({
      userId: row.user_id,
      displayName: nameById.get(row.user_id) ?? "Anonymous",
      rank: row.rank,
      score: row.score,
    });

    weeklyLeaderboard = (weeklyScores ?? []).map(toRow);
    allTimeLeaderboard = (allTimeScores ?? []).map(toRow);
  } catch (err) {
    console.warn("Leaderboard unavailable:", err);
  }

  const yourRank = {
    weekly: myScoreRows?.find((r) => r.window_name === "weekly")?.rank ?? null,
    allTime: myScoreRows?.find((r) => r.window_name === "all_time")?.rank ?? null,
  };

  // --- Content coverage, subject strength, focus buckets ---
  const index = getProgressContentIndex();
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
    bucketStats.push({
      id,
      name: info.name,
      topicName: info.topicName,
      pct: Math.round((known / attempted) * 100),
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
    const total = (row?.cards_reviewed ?? 0) + (row?.questions_answered ?? 0);
    return { label: d.toLocaleDateString("en-GB", { weekday: "short" }), total };
  });
  const maxDayTotal = Math.max(1, ...days.map((d) => d.total));
  const hasRecentActivity = days.some((d) => d.total > 0);

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
          <div className="mt-6 flex items-end justify-between gap-2" style={{ height: 96 }}>
            {days.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t ${hasRecentActivity ? "bg-blue-600" : "bg-slate-200"}`}
                  style={{
                    height: hasRecentActivity ? `${Math.max(4, (d.total / maxDayTotal) * 80)}px` : "6px",
                  }}
                />
                <span className="text-xs text-slate-500">{d.label}</span>
              </div>
            ))}
          </div>
          {!hasRecentActivity && (
            <p className="mt-2 text-xs text-slate-400">
              No activity yet — study a flashcard or question to see your trend.
            </p>
          )}
        </section>

        {badgeRows && <BadgesSection badges={badgeRows} unlockedAt={unlockedAt} />}
      </div>

      <div className="mt-6">
        <LeaderboardSection
          weekly={weeklyLeaderboard}
          allTime={allTimeLeaderboard}
          currentUserId={user.id}
          yourRank={yourRank}
        />
      </div>
    </div>
  );
}
