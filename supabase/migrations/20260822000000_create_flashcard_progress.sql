-- Flashcard progress for signed-in users.
--
-- Anonymous users continue to use localStorage (see lib/progress.ts) --
-- this table only backs synced, signed-in progress. Status values match
-- the existing localStorage shape exactly ("learning" | "known"); rows
-- are simply absent for "unseen" cards, same as localStorage.

create table if not exists public.flashcard_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  flashcard_id text not null,
  status text not null check (status in ('learning', 'known')),
  updated_at timestamptz not null default now(),
  primary key (user_id, flashcard_id)
);

alter table public.flashcard_progress enable row level security;

create policy "Users can select their own flashcard progress"
  on public.flashcard_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own flashcard progress"
  on public.flashcard_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own flashcard progress"
  on public.flashcard_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own flashcard progress"
  on public.flashcard_progress
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Explicit grants -- automatic Data API exposure is disabled at the project
-- level (per an earlier setup step), so nothing is reachable without these.
-- Only `authenticated` gets access; `anon` gets nothing.
grant select, insert, update, delete on public.flashcard_progress to authenticated;
