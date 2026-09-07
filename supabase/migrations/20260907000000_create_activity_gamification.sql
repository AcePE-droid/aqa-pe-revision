-- Analytics/gamification foundation: activity logging, daily rollups,
-- streaks, leaderboard scoring, and badges. Additive only - none of this
-- touches or replaces the existing flashcard_progress table or the
-- localStorage-based question progress in lib/progress.ts.
--
-- Signed-in users only: every table here is keyed on user_id, so anonymous
-- visitors simply don't get activity logged/scored (same gating already
-- used for flashcard_progress cloud sync).

-- ---------------------------------------------------------------------
-- 1. activity_events - append-only log of every flashcard review and
-- self-graded question answer.
-- ---------------------------------------------------------------------
create table if not exists public.activity_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  content_type text not null check (content_type in ('flashcard', 'question')),
  subject text not null,
  bucket text not null, -- subtopic id
  item_id text not null, -- flashcard id or question id
  result text not null check (result in ('known', 'still_learning', 'correct', 'incorrect')),
  is_first_transition boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists activity_events_user_created_idx on public.activity_events (user_id, created_at desc);
create index if not exists activity_events_user_content_idx on public.activity_events (user_id, content_type);
create index if not exists activity_events_user_subject_idx on public.activity_events (user_id, subject);

alter table public.activity_events enable row level security;

create policy "Users can select their own activity events"
  on public.activity_events for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own activity events"
  on public.activity_events for insert to authenticated
  with check (auth.uid() = user_id);

-- Append-only log: no update/delete grants or policies.
grant select, insert on public.activity_events to authenticated;

-- ---------------------------------------------------------------------
-- 2. daily_activity - per-day rollup, kept in sync from activity_events
-- inside log_activity_event() below so streak calculations only need to
-- scan this small table, not the full event log.
-- ---------------------------------------------------------------------
create table if not exists public.daily_activity (
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  cards_reviewed int not null default 0,
  questions_answered int not null default 0,
  was_active boolean not null default false,
  primary key (user_id, date)
);

create index if not exists daily_activity_user_date_idx on public.daily_activity (user_id, date desc);

alter table public.daily_activity enable row level security;

create policy "Users can select their own daily activity"
  on public.daily_activity for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own daily activity"
  on public.daily_activity for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own daily activity"
  on public.daily_activity for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on public.daily_activity to authenticated;

-- ---------------------------------------------------------------------
-- 3. bucket_watermarks - per (user, subtopic) lowest-ever known% seen,
-- used only to detect the "Turnaround" badge (a bucket going from under
-- 30% known to over 80% known).
-- ---------------------------------------------------------------------
create table if not exists public.bucket_watermarks (
  user_id uuid not null references auth.users (id) on delete cascade,
  subtopic_id text not null,
  min_known_pct numeric not null,
  primary key (user_id, subtopic_id)
);

alter table public.bucket_watermarks enable row level security;

create policy "Users can select their own bucket watermarks"
  on public.bucket_watermarks for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own bucket watermarks"
  on public.bucket_watermarks for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own bucket watermarks"
  on public.bucket_watermarks for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on public.bucket_watermarks to authenticated;

-- ---------------------------------------------------------------------
-- 4. question_progress - cloud mirror of self-graded question results for
-- signed-in users. This is purely additive for analytics purposes: the
-- existing localStorage-only question tracking in lib/progress.ts is
-- untouched and remains the source of truth for the on-page UI. This
-- table exists only so activity logging can tell whether a question is
-- transitioning to "correct" for the first time.
-- ---------------------------------------------------------------------
create table if not exists public.question_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  correct boolean not null,
  marks_awarded int not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

alter table public.question_progress enable row level security;

create policy "Users can select their own question progress"
  on public.question_progress for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own question progress"
  on public.question_progress for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own question progress"
  on public.question_progress for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on public.question_progress to authenticated;

-- ---------------------------------------------------------------------
-- 5. leaderboard_scores - cached scores, recomputed per-user after each
-- event (recompute_user_score) and re-ranked on a schedule
-- (recompute_leaderboard_ranks, called from a Vercel Cron route using the
-- service-role client).
-- ---------------------------------------------------------------------
create table if not exists public.leaderboard_scores (
  user_id uuid not null references auth.users (id) on delete cascade,
  window text not null check (window in ('all_time', 'weekly')),
  volume_points numeric not null default 0,
  accuracy_bonus numeric not null default 0,
  consistency_bonus numeric not null default 0,
  score numeric not null default 0,
  rank int,
  updated_at timestamptz not null default now(),
  primary key (user_id, window)
);

alter table public.leaderboard_scores enable row level security;

-- Scoped to each user's own row for now - Prompt 1 is data-layer only, no
-- leaderboard UI yet. A future "My Progress" leaderboard prompt will need
-- a broader select policy so users can see each other's rank/score.
create policy "Users can select their own leaderboard score"
  on public.leaderboard_scores for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own leaderboard score"
  on public.leaderboard_scores for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own leaderboard score"
  on public.leaderboard_scores for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- The `rank` column is only ever written by recompute_leaderboard_ranks(),
-- a security definer function called from the service-role cron route, so
-- it bypasses these grants/policies entirely.
grant select, insert, update on public.leaderboard_scores to authenticated;

-- ---------------------------------------------------------------------
-- 6. badges - static reference data, seeded below. Rows are never written
-- by the app itself outside of migrations.
-- ---------------------------------------------------------------------
create table if not exists public.badges (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  category text not null,
  unlock_condition_type text not null,
  unlock_condition_value jsonb,
  is_premium boolean not null default false
);

alter table public.badges enable row level security;

create policy "Anyone signed in can view badges"
  on public.badges for select to authenticated
  using (true);

grant select on public.badges to authenticated;

insert into public.badges (id, name, description, icon, category, unlock_condition_type, unlock_condition_value, is_premium) values
  ('first_steps', 'First steps', 'Reviewed your first flashcard or answered your first question.', 'Footprints', 'milestone', 'first_event', null, false),
  ('well_rounded', 'Well rounded', 'Studied all 3 subjects.', 'Compass', 'milestone', 'all_subjects', null, false),
  ('anatomy_apprentice', 'Anatomy apprentice', 'Seen 50% of Anatomy & Physiology content.', 'HeartPulse', 'subject', 'subject_coverage', '{"subject": "Anatomy & Physiology", "pct": 50}', false),
  ('anatomy_expert', 'Anatomy expert', 'Seen 100% of Anatomy & Physiology content.', 'HeartPulse', 'subject', 'subject_coverage', '{"subject": "Anatomy & Physiology", "pct": 100}', false),
  ('psychology_apprentice', 'Psychology apprentice', 'Seen 50% of Sports Psychology content.', 'Brain', 'subject', 'subject_coverage', '{"subject": "Sports Psychology", "pct": 50}', false),
  ('psychology_expert', 'Psychology expert', 'Seen 100% of Sports Psychology content.', 'Brain', 'subject', 'subject_coverage', '{"subject": "Sports Psychology", "pct": 100}', false),
  ('society_apprentice', 'Society apprentice', 'Seen 50% of Sport, Society & History content.', 'Users2', 'subject', 'subject_coverage', '{"subject": "Sport, Society & History", "pct": 50}', false),
  ('society_expert', 'Society expert', 'Seen 100% of Sport, Society & History content.', 'Users2', 'subject', 'subject_coverage', '{"subject": "Sport, Society & History", "pct": 100}', false),
  ('streak_3', '3-day streak', 'Studied 3 days in a row.', 'Flame', 'streak', 'streak', '{"days": 3}', false),
  ('streak_7', '7-day streak', 'Studied 7 days in a row.', 'Flame', 'streak', 'streak', '{"days": 7}', false),
  ('streak_30', '30-day streak', 'Studied 30 days in a row.', 'Flame', 'streak', 'streak', '{"days": 30}', false),
  ('turnaround', 'Turnaround', 'Took a topic from under 30% known to over 80% known.', 'TrendingUp', 'mastery', 'turnaround', null, false),
  ('perfectionist', 'Perfectionist', '100% known on a full topic.', 'Star', 'mastery', 'perfectionist', null, false),
  ('card_shark', 'Card shark', 'Reviewed 500 flashcards lifetime.', 'Layers', 'volume', 'lifetime_count', '{"content_type": "flashcard", "count": 500}', false),
  ('question_master', 'Question master', 'Answered 100 questions lifetime.', 'ClipboardCheck', 'volume', 'lifetime_count', '{"content_type": "question", "count": 100}', false),
  ('toolkit_member', 'Toolkit member', 'Subscribed to the PE Revision Toolkit.', 'Crown', 'premium', 'premium', null, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 7. user_badges - unlocked badges. No insert/update/delete grant to
-- authenticated: every row is written by the security-definer
-- check_and_award_badges() function below, so a signed-in user can't
-- unlock arbitrary badges (e.g. the premium one) by calling the table
-- directly from the browser.
-- ---------------------------------------------------------------------
create table if not exists public.user_badges (
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_id text not null references public.badges (id),
  unlocked_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

alter table public.user_badges enable row level security;

create policy "Users can select their own unlocked badges"
  on public.user_badges for select to authenticated
  using (auth.uid() = user_id);

grant select on public.user_badges to authenticated;

-- ---------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------

-- Current + longest streak (consecutive was_active days) from daily_activity.
create or replace function public.get_user_streak(p_user_id uuid)
returns table (current_streak int, longest_streak int)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_current int := 0;
  v_longest int := 0;
  v_prev_date date := null;
  v_anchor date;
  r record;
begin
  select case
    when exists (
      select 1 from public.daily_activity
      where user_id = p_user_id and date = current_date and was_active
    ) then current_date
    else current_date - 1
  end into v_anchor;

  for r in
    select date from public.daily_activity
    where user_id = p_user_id and was_active and date <= v_anchor
    order by date desc
  loop
    if v_prev_date is null or r.date = v_prev_date - 1 then
      v_current := v_current + 1;
      v_prev_date := r.date;
    else
      exit;
    end if;
  end loop;

  select coalesce(max(island_len), 0) into v_longest
  from (
    select count(*) as island_len
    from (
      select date, date - (row_number() over (order by date))::int as grp
      from public.daily_activity
      where user_id = p_user_id and was_active
    ) grouped
    group by grp
  ) islands;

  current_streak := v_current;
  longest_streak := greatest(v_longest, v_current);
  return next;
end;
$$;

grant execute on function public.get_user_streak(uuid) to authenticated;

-- Recomputes one user's cached score for both windows (all_time, weekly).
-- score = volume_points * (1 + accuracy_bonus * 0.10) * (1 + consistency_bonus * 0.20)
-- accuracy_bonus: min(first-time-correct/known events in window / 20, 1)
-- consistency_bonus: min(current streak, 10) / 10
create or replace function public.recompute_user_score(p_user_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_current_streak int;
  v_window_name text;
  v_since timestamptz;
  v_flashcards int;
  v_questions int;
  v_first_transitions int;
  v_volume numeric;
  v_accuracy_bonus numeric;
  v_consistency_bonus numeric;
  v_score numeric;
begin
  select current_streak into v_current_streak from public.get_user_streak(p_user_id);

  for v_window_name, v_since in
    select * from (values ('all_time', null::timestamptz), ('weekly', now() - interval '7 days')) as w(name, since)
  loop
    select
      count(*) filter (where content_type = 'flashcard'),
      count(*) filter (where content_type = 'question'),
      count(*) filter (where is_first_transition)
    into v_flashcards, v_questions, v_first_transitions
    from public.activity_events
    where user_id = p_user_id
      and (v_since is null or created_at >= v_since);

    v_volume := v_flashcards * 1 + v_questions * 2;
    v_accuracy_bonus := least(v_first_transitions / 20.0, 1);
    v_consistency_bonus := least(v_current_streak, 10) / 10.0;
    v_score := v_volume * (1 + v_accuracy_bonus * 0.10) * (1 + v_consistency_bonus * 0.20);

    insert into public.leaderboard_scores (user_id, window, volume_points, accuracy_bonus, consistency_bonus, score, updated_at)
    values (p_user_id, v_window_name, v_volume, v_accuracy_bonus, v_consistency_bonus, v_score, now())
    on conflict (user_id, window) do update
      set volume_points = excluded.volume_points,
          accuracy_bonus = excluded.accuracy_bonus,
          consistency_bonus = excluded.consistency_bonus,
          score = excluded.score,
          updated_at = now();
  end loop;
end;
$$;

grant execute on function public.recompute_user_score(uuid) to authenticated;

-- Checks and awards any badges p_user_id has newly earned, scoped to the
-- categories relevant to this event's content_type so it doesn't have to
-- check all badges on every call. security definer so it can write to
-- user_badges despite authenticated having no direct insert grant there
-- (this is what stops a signed-in user unlocking badges, especially the
-- premium one, by calling the table directly from devtools).
create or replace function public.check_and_award_badges(
  p_user_id uuid,
  p_content_type text,
  p_subject text,
  p_bucket text,
  p_subject_total_items int,
  p_bucket_total_items int,
  p_bucket_known_pct numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_badge record;
  v_count int;
  v_current_streak int;
  v_distinct_subjects int;
  v_subject_seen int;
  v_watermark numeric;
begin
  if not exists (select 1 from public.user_badges where user_id = p_user_id and badge_id = 'first_steps') then
    insert into public.user_badges (user_id, badge_id) values (p_user_id, 'first_steps') on conflict do nothing;
  end if;

  if not exists (select 1 from public.user_badges where user_id = p_user_id and badge_id = 'well_rounded') then
    select count(distinct subject) into v_distinct_subjects from public.activity_events where user_id = p_user_id;
    if v_distinct_subjects >= 3 then
      insert into public.user_badges (user_id, badge_id) values (p_user_id, 'well_rounded') on conflict do nothing;
    end if;
  end if;

  if p_subject_total_items is not null and p_subject_total_items > 0 then
    select count(distinct item_id) into v_subject_seen
    from public.activity_events
    where user_id = p_user_id and subject = p_subject;

    for v_badge in
      select * from public.badges
      where category = 'subject'
        and unlock_condition_type = 'subject_coverage'
        and unlock_condition_value ->> 'subject' = p_subject
    loop
      if not exists (select 1 from public.user_badges where user_id = p_user_id and badge_id = v_badge.id) then
        if (v_subject_seen::numeric / p_subject_total_items) * 100 >= (v_badge.unlock_condition_value ->> 'pct')::numeric then
          insert into public.user_badges (user_id, badge_id) values (p_user_id, v_badge.id) on conflict do nothing;
        end if;
      end if;
    end loop;
  end if;

  select current_streak into v_current_streak from public.get_user_streak(p_user_id);
  for v_badge in select * from public.badges where unlock_condition_type = 'streak' loop
    if not exists (select 1 from public.user_badges where user_id = p_user_id and badge_id = v_badge.id) then
      if v_current_streak >= (v_badge.unlock_condition_value ->> 'days')::int then
        insert into public.user_badges (user_id, badge_id) values (p_user_id, v_badge.id) on conflict do nothing;
      end if;
    end if;
  end loop;

  if p_content_type = 'flashcard' then
    if p_bucket_known_pct is not null then
      select min_known_pct into v_watermark from public.bucket_watermarks
      where user_id = p_user_id and subtopic_id = p_bucket;

      if not exists (select 1 from public.user_badges where user_id = p_user_id and badge_id = 'turnaround') then
        if v_watermark is not null and v_watermark < 30 and p_bucket_known_pct > 80 then
          insert into public.user_badges (user_id, badge_id) values (p_user_id, 'turnaround') on conflict do nothing;
        end if;
      end if;

      if not exists (select 1 from public.user_badges where user_id = p_user_id and badge_id = 'perfectionist') then
        if p_bucket_total_items is not null and p_bucket_total_items > 0 and p_bucket_known_pct >= 100 then
          insert into public.user_badges (user_id, badge_id) values (p_user_id, 'perfectionist') on conflict do nothing;
        end if;
      end if;
    end if;

    if not exists (select 1 from public.user_badges where user_id = p_user_id and badge_id = 'card_shark') then
      select count(*) into v_count from public.activity_events where user_id = p_user_id and content_type = 'flashcard';
      if v_count >= 500 then
        insert into public.user_badges (user_id, badge_id) values (p_user_id, 'card_shark') on conflict do nothing;
      end if;
    end if;
  end if;

  if p_content_type = 'question' then
    if not exists (select 1 from public.user_badges where user_id = p_user_id and badge_id = 'question_master') then
      select count(*) into v_count from public.activity_events where user_id = p_user_id and content_type = 'question';
      if v_count >= 100 then
        insert into public.user_badges (user_id, badge_id) values (p_user_id, 'question_master') on conflict do nothing;
      end if;
    end if;
  end if;
end;
$$;

-- Logs one activity event end-to-end: inserts the event, rolls it into
-- daily_activity, updates the bucket watermark (flashcards only),
-- recomputes this user's cached score, and runs the badge check. Called
-- via supabase.rpc() from lib/activity.ts. security invoker - runs as the
-- calling (authenticated) user, so the RLS policies above apply normally;
-- the auth.uid() check below stops a user from logging events for anyone
-- else.
create or replace function public.log_activity_event(
  p_user_id uuid,
  p_content_type text,
  p_subject text,
  p_bucket text,
  p_item_id text,
  p_result text,
  p_is_first_transition boolean,
  p_subject_total_items int default null,
  p_bucket_total_items int default null,
  p_bucket_known_pct numeric default null
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'not authorized';
  end if;

  insert into public.activity_events (user_id, content_type, subject, bucket, item_id, result, is_first_transition)
  values (p_user_id, p_content_type, p_subject, p_bucket, p_item_id, p_result, p_is_first_transition);

  insert into public.daily_activity (user_id, date, cards_reviewed, questions_answered, was_active)
  values (
    p_user_id,
    current_date,
    case when p_content_type = 'flashcard' then 1 else 0 end,
    case when p_content_type = 'question' then 1 else 0 end,
    true
  )
  on conflict (user_id, date) do update
    set cards_reviewed = public.daily_activity.cards_reviewed + excluded.cards_reviewed,
        questions_answered = public.daily_activity.questions_answered + excluded.questions_answered,
        was_active = true;

  if p_content_type = 'flashcard' and p_bucket_known_pct is not null then
    insert into public.bucket_watermarks (user_id, subtopic_id, min_known_pct)
    values (p_user_id, p_bucket, p_bucket_known_pct)
    on conflict (user_id, subtopic_id) do update
      set min_known_pct = least(public.bucket_watermarks.min_known_pct, excluded.min_known_pct);
  end if;

  perform public.recompute_user_score(p_user_id);
  perform public.check_and_award_badges(
    p_user_id, p_content_type, p_subject, p_bucket,
    p_subject_total_items, p_bucket_total_items, p_bucket_known_pct
  );
end;
$$;

grant execute on function public.log_activity_event(uuid, text, text, text, text, text, boolean, int, int, numeric) to authenticated;

-- Recomputes `rank` for every user in leaderboard_scores, partitioned by
-- window. security definer so it can see/update every user's row despite
-- the per-user RLS policies above; only ever called from the service-role
-- Vercel Cron route (app/api/cron/recompute-leaderboard), so no grant to
-- authenticated/anon is needed - the service role bypasses grants anyway.
create or replace function public.recompute_leaderboard_ranks()
returns void
language sql
security definer
set search_path = public
as $$
  update public.leaderboard_scores ls
  set rank = ranked.rank
  from (
    select user_id, window, row_number() over (partition by window order by score desc) as rank
    from public.leaderboard_scores
  ) ranked
  where ls.user_id = ranked.user_id and ls.window = ranked.window;
$$;
