-- ---------------------------------------------------------------------
-- Nightly score recompute.
--
-- recompute_user_score() was only ever reached from log_activity_event(),
-- i.e. when that one user studies. Nothing else recalculated `score`, and
-- the nightly cron only ever wrote `rank` (recompute_leaderboard_ranks()
-- is a single UPDATE derived from whatever scores already exist).
--
-- That left the weekly window wrong. It is computed as "events in the 7
-- days before now" at the moment of writing, so once a user stops studying
-- their events age out of the window while nothing re-runs: the weekly
-- score freezes at its last value instead of decaying towards zero. Two
-- users who studied the same amount could sit at very different weekly
-- scores purely by when they last opened the site.
--
-- This adds a recompute of every user's score, to run from the same cron
-- immediately before the ranks are recalculated (ranks derive from scores,
-- so the order matters).
--
-- It loops and delegates to recompute_user_score() rather than restating
-- the formula as one set-based statement: the scoring rule then has a
-- single definition, and cannot drift between the per-event path and the
-- nightly one. The cost is a handful of small indexed queries per user
-- with activity, which the (user_id, ...) indexes on activity_events and
-- daily_activity already serve. If the user base ever grows enough for
-- that to matter, this is the place to switch to a set-based rewrite.
--
-- security definer so it can read every user's activity and write every
-- user's score despite the per-user RLS policies on those tables - the
-- same reasoning as recompute_leaderboard_ranks() below it. It is only
-- ever called from the service-role cron route, so no grant is given to
-- authenticated or anon; a signed-in user must not be able to trigger a
-- full-table recompute.
-- ---------------------------------------------------------------------
create or replace function public.recompute_all_scores()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_count int := 0;
begin
  for v_user_id in select distinct user_id from public.activity_events loop
    perform public.recompute_user_score(v_user_id);
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.recompute_all_scores() from public;
