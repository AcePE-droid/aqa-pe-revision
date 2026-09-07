-- Friend system: unique usernames + a friend-request/accept/unfriend flow,
-- so the "Friends" leaderboard tab (previously a static "coming soon" card
-- in LeaderboardSection.tsx) can be filtered to the signed-in user's
-- accepted friends. Additive only - doesn't touch flashcard_progress,
-- question_progress, or the activity/badges tables from the prior migration.

-- ---------------------------------------------------------------------
-- 1. profiles - one row per signed-in user, holding their unique display
-- username. Auto-created by the trigger below on signup (covers both the
-- magic-link and Google OAuth flows, since both create an auth.users row);
-- backfilled for any pre-existing users at the bottom of this file.
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  username_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness ("Alex" and "alex" can't both exist) while
-- still preserving the case the user picked for display.
create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));

alter table public.profiles enable row level security;

-- Every signed-in user can look up any other user's username - required for
-- friend search and for rendering friend names anywhere in the UI. No
-- other profile data is exposed by this table.
create policy "Anyone signed in can view profiles"
  on public.profiles for select to authenticated
  using (true);

-- No insert/update grant to authenticated: rows are only ever written by
-- handle_new_user() (on signup) and update_username() below, both
-- security definer, so a user can't rename themselves to an already-taken
-- name or edit someone else's row directly from devtools.
grant select on public.profiles to authenticated;

-- ---------------------------------------------------------------------
-- Slugifies p_base (lowercase, letters/digits/underscore only, 3-20 chars,
-- falling back to "user" if that leaves nothing usable) and appends a
-- numeric suffix until it's unique. Used both by the signup trigger and
-- the one-off backfill below.
-- ---------------------------------------------------------------------
create or replace function public.generate_unique_username(p_base text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base text;
  v_candidate text;
  v_suffix int := 1;
begin
  v_base := lower(regexp_replace(coalesce(p_base, ''), '[^a-z0-9_]', '', 'gi'));
  v_base := substring(v_base from 1 for 20);
  if v_base is null or length(v_base) < 3 then
    v_base := 'user';
  end if;

  v_candidate := v_base;
  while exists (select 1 from public.profiles where lower(username) = lower(v_candidate)) loop
    v_suffix := v_suffix + 1;
    v_candidate := substring(v_base from 1 for greatest(1, 20 - length(v_suffix::text))) || v_suffix::text;
  end loop;

  return v_candidate;
end;
$$;

-- security definer trigger function so it can write to profiles despite
-- authenticated having no insert grant there. Retries on a unique_violation
-- (two concurrent signups racing for the same suggested name) rather than
-- letting the collision abort signup entirely.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base text;
  v_username text;
  v_attempt int := 0;
begin
  v_base := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1));

  loop
    v_username := public.generate_unique_username(v_base);
    begin
      insert into public.profiles (user_id, username) values (new.id, v_username);
      exit;
    exception when unique_violation then
      v_attempt := v_attempt + 1;
      if v_attempt >= 5 then
        raise;
      end if;
    end;
  end loop;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill for users who signed up before this migration. Runs row-by-row
-- (not a single set-based insert...select) so each generate_unique_username
-- call sees the previous iteration's already-inserted row and can't hand
-- out the same suggested name to two existing users sharing a base name.
do $$
declare
  r record;
  v_username text;
begin
  for r in
    select id, email, raw_user_meta_data from auth.users
    where not exists (select 1 from public.profiles p where p.user_id = auth.users.id)
  loop
    v_username := public.generate_unique_username(coalesce(r.raw_user_meta_data ->> 'full_name', split_part(r.email, '@', 1)));
    insert into public.profiles (user_id, username) values (r.id, v_username) on conflict (user_id) do nothing;
  end loop;
end;
$$;

-- Lets a signed-in user change their own username, subject to format
-- validation, uniqueness, and a 30-day cooldown since their last change -
-- all enforced here server-side since none of it can be trusted from the
-- client.
create or replace function public.update_username(p_username text)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_current record;
begin
  if auth.uid() is null then
    raise exception 'not authorized';
  end if;

  if p_username !~ '^[a-zA-Z0-9_]{3,20}$' then
    raise exception 'Usernames must be 3-20 characters and can only contain letters, numbers, and underscores.';
  end if;

  select username, username_updated_at into v_current
  from public.profiles where user_id = auth.uid();

  if not found then
    raise exception 'Profile not found.';
  end if;

  if v_current.username_updated_at > now() - interval '30 days' then
    raise exception 'You can only change your username once every 30 days. Next change available %.',
      to_char(v_current.username_updated_at + interval '30 days', 'DD Mon YYYY');
  end if;

  if exists (
    select 1 from public.profiles
    where lower(username) = lower(p_username) and user_id <> auth.uid()
  ) then
    raise exception 'That username is already taken.';
  end if;

  update public.profiles
  set username = p_username, username_updated_at = now()
  where user_id = auth.uid();
end;
$$;

grant execute on function public.update_username(text) to authenticated;

-- ---------------------------------------------------------------------
-- 2. friendships - one row per pair (never two directional rows).
-- user_id_a/user_id_b are always stored ordered (a < b), enforced by the
-- check constraint, so (a, b) and (b, a) can never both exist. All writes
-- go through the security-definer functions below - no insert/update/
-- delete grant to authenticated - so a user can't forge a request as
-- someone else, accept on someone else's behalf, or fabricate an
-- already-accepted row from devtools.
-- ---------------------------------------------------------------------
create table if not exists public.friendships (
  id bigint generated always as identity primary key,
  user_id_a uuid not null references auth.users (id) on delete cascade,
  user_id_b uuid not null references auth.users (id) on delete cascade,
  status text not null check (status in ('pending', 'accepted')),
  requested_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint friendships_ordered_pair check (user_id_a < user_id_b),
  constraint friendships_unique_pair unique (user_id_a, user_id_b)
);

create index if not exists friendships_user_a_idx on public.friendships (user_id_a);
create index if not exists friendships_user_b_idx on public.friendships (user_id_b);

alter table public.friendships enable row level security;

create policy "Users can select their own friendships"
  on public.friendships for select to authenticated
  using (auth.uid() = user_id_a or auth.uid() = user_id_b);

grant select on public.friendships to authenticated;

-- Sends a friend request, creating a 'pending' row. Fails if a row already
-- exists between the two users (pending either direction, or already
-- accepted) - use respond_friend_request/remove_friend to change that row
-- instead of creating a second one.
create or replace function public.send_friend_request(p_target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_a uuid;
  v_b uuid;
begin
  if auth.uid() is null then
    raise exception 'not authorized';
  end if;

  if p_target_user_id = auth.uid() then
    raise exception 'You can''t add yourself as a friend.';
  end if;

  if not exists (select 1 from public.profiles where user_id = p_target_user_id) then
    raise exception 'User not found.';
  end if;

  v_a := least(auth.uid(), p_target_user_id);
  v_b := greatest(auth.uid(), p_target_user_id);

  if exists (select 1 from public.friendships where user_id_a = v_a and user_id_b = v_b) then
    raise exception 'A friend request already exists between you and this user.';
  end if;

  insert into public.friendships (user_id_a, user_id_b, status, requested_by)
  values (v_a, v_b, 'pending', auth.uid());
end;
$$;

grant execute on function public.send_friend_request(uuid) to authenticated;

-- Accepts (status -> 'accepted') or declines (row deleted) a pending
-- request. Only the recipient (not the original requester) can respond.
create or replace function public.respond_friend_request(p_friendship_id bigint, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.friendships;
begin
  if auth.uid() is null then
    raise exception 'not authorized';
  end if;

  select * into v_row from public.friendships where id = p_friendship_id;
  if not found then
    raise exception 'Friend request not found.';
  end if;

  if v_row.status <> 'pending' then
    raise exception 'This request has already been responded to.';
  end if;

  if auth.uid() not in (v_row.user_id_a, v_row.user_id_b) then
    raise exception 'not authorized';
  end if;

  if auth.uid() = v_row.requested_by then
    raise exception 'You can''t respond to your own request.';
  end if;

  if p_accept then
    update public.friendships set status = 'accepted', responded_at = now() where id = p_friendship_id;
  else
    delete from public.friendships where id = p_friendship_id;
  end if;
end;
$$;

grant execute on function public.respond_friend_request(bigint, boolean) to authenticated;

-- Deletes a friendship row (either an accepted friendship, unfriending
-- with no notification to the other party, or a still-pending request
-- either side wants to cancel). Either participant may call this.
create or replace function public.remove_friend(p_friendship_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.friendships;
begin
  if auth.uid() is null then
    raise exception 'not authorized';
  end if;

  select * into v_row from public.friendships where id = p_friendship_id;
  if not found then
    return;
  end if;

  if auth.uid() not in (v_row.user_id_a, v_row.user_id_b) then
    raise exception 'not authorized';
  end if;

  delete from public.friendships where id = p_friendship_id;
end;
$$;

grant execute on function public.remove_friend(bigint) to authenticated;
