-- Per-user, per-subtopic self-tracked state: whether the notes have been
-- read, and a self-assessed confidence rating.
--
-- Persistent state, not an event log - deliberately NOT activity_events,
-- which is append-only and feeds the leaderboard. Nothing here writes an
-- activity event, so a self-assessed confidence rating can never influence
-- leaderboard score (activity_events.content_type is constrained to
-- 'flashcard' | 'question', so that's enforced by the schema, not just by
-- convention).
--
-- Row absent = notes unread and unrated; confidence null = not yet rated.
-- Signed-in only; there's no localStorage fallback for this, unlike
-- flashcard progress.

create table if not exists public.subtopic_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  subtopic_id text not null,
  notes_read boolean not null default false,
  confidence text check (confidence in ('red', 'amber', 'green')),
  updated_at timestamptz not null default now(),
  primary key (user_id, subtopic_id)
);

alter table public.subtopic_progress enable row level security;

create policy "Users can select their own subtopic progress"
  on public.subtopic_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own subtopic progress"
  on public.subtopic_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own subtopic progress"
  on public.subtopic_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Included so this state can be cleared per-row (and so a future bulk reset
-- is possible at all) - question_progress omitted a delete policy and as a
-- result its rows can't be cleared by the app today.
create policy "Users can delete their own subtopic progress"
  on public.subtopic_progress
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Explicit grants -- automatic Data API exposure is disabled at the project
-- level, so nothing is reachable without these.
grant select, insert, update, delete on public.subtopic_progress to authenticated;
