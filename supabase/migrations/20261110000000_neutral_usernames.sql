-- Usernames no longer derive from the user's real name.
--
-- The sign-up form never asks for a name, but handle_new_user() built the
-- username out of one anyway:
--
--   coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
--
-- so "Jess Hartley" signing in with Google became `jesshartley`, and
-- `j.hartley24@school.sch.uk` on a magic link became `jhartley24`. That
-- username is readable by every signed-in user (profiles has a
-- select-to-authenticated policy, which friend search relies on), so the
-- site was publishing a real name that it had deliberately never asked for.
-- For an audience that is largely under 18 that is the wrong default, and
-- it is the one a school would object to.
--
-- This migration:
--   1. generates a neutral handle instead, from a wordlist,
--   2. leaves the 30-day rename cooldown unstarted until the first
--      deliberate rename, so a new account is never stuck with the name it
--      was given,
--   3. adds username_chosen so the UI can prompt once, and
--   4. renames the accounts that already have a name-derived username.
--
-- It also fixes update_username(), which could never have worked: it was
-- declared `security invoker` while `authenticated` holds only
-- `grant select on public.profiles` and profiles has no update policy, so
-- every rename failed with 42501 permission denied. The friends-system
-- migration's own comment ("rows are only ever written by handle_new_user()
-- and update_username() below, both security definer") describes the
-- intent; the function did not match it.

-- ---------------------------------------------------------------------
-- 1. username_chosen - false while the user still has the handle we gave
-- them, true once they have either renamed it or explicitly kept it. Drives
-- the one-time prompt; nothing enforces anything on it.
-- ---------------------------------------------------------------------
alter table public.profiles
  add column if not exists username_chosen boolean not null default false;

-- ---------------------------------------------------------------------
-- 2. A neutral handle: adjective + noun + three digits, e.g. SwiftWinger420.
--
-- Deliberately not `user_8fa2`-shaped. A handle that reads like an account
-- number is one the student immediately replaces with their real name,
-- which is the behaviour this migration exists to avoid; one that already
-- feels like a handle tends to get kept.
--
-- Longest possible output is 6 + 8 + 3 = 17 characters, inside both the
-- 20-char column usage elsewhere and update_username's 3-20 format rule.
-- 20 x 20 x 900 = 360,000 combinations, and the loop retries on collision,
-- so the suffix is for variety rather than for uniqueness.
-- ---------------------------------------------------------------------
create or replace function public.generate_neutral_username()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_adjectives text[] := array[
    'Swift', 'Bold', 'Quick', 'Calm', 'Keen', 'Brave', 'Sharp', 'Steady',
    'Nimble', 'Fierce', 'Bright', 'Agile', 'Strong', 'Eager', 'Lively',
    'Smooth', 'Rapid', 'Solid', 'Prime', 'Ace'
  ];
  v_nouns text[] := array[
    'Sprinter', 'Striker', 'Winger', 'Keeper', 'Captain', 'Rower', 'Jumper',
    'Hurdler', 'Pacer', 'Setter', 'Server', 'Skipper', 'Fullback', 'Flanker',
    'Batter', 'Bowler', 'Fielder', 'Pitcher', 'Climber', 'Skater'
  ];
  v_candidate text;
  v_attempt int := 0;
begin
  loop
    v_candidate :=
      v_adjectives[1 + floor(random() * array_length(v_adjectives, 1))::int] ||
      v_nouns[1 + floor(random() * array_length(v_nouns, 1))::int] ||
      (100 + floor(random() * 900))::text;

    exit when not exists (
      select 1 from public.profiles where lower(username) = lower(v_candidate)
    );

    v_attempt := v_attempt + 1;
    -- Rather than spin forever if the wordlist ever does fill up: fall back
    -- to something guaranteed unique. Still name-free, which is the point.
    if v_attempt >= 50 then
      v_candidate := 'Player' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
      exit;
    end if;
  end loop;

  return v_candidate;
end;
$$;

revoke execute on function public.generate_neutral_username() from public;

-- ---------------------------------------------------------------------
-- 3. Signup trigger: neutral handle, and username_updated_at backdated to
-- the epoch so update_username's 30-day cooldown does not count the moment
-- of signup as the user's first rename. Without that, a student spent their
-- first month unable to change a handle they never picked.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
  v_attempt int := 0;
begin
  loop
    v_username := public.generate_neutral_username();
    begin
      insert into public.profiles (user_id, username, username_updated_at, username_chosen)
      values (new.id, v_username, 'epoch', false);
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

-- ---------------------------------------------------------------------
-- 4. update_username: now security definer (see the header), and records
-- that the user has made a deliberate choice.
--
-- The cooldown rule is unchanged - once every 30 days - but because signup
-- backdates username_updated_at, the first rename is always allowed.
-- ---------------------------------------------------------------------
create or replace function public.update_username(p_username text)
returns void
language plpgsql
security definer
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
  set username = p_username,
      username_updated_at = now(),
      username_chosen = true
  where user_id = auth.uid();
end;
$$;

grant execute on function public.update_username(text) to authenticated;

-- ---------------------------------------------------------------------
-- 5. confirm_username: the user has seen the handle we gave them and is
-- keeping it. Deliberately does NOT touch username_updated_at, so keeping
-- the generated name does not spend the free first rename - they can still
-- change their mind next week.
-- ---------------------------------------------------------------------
create or replace function public.confirm_username()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authorized';
  end if;

  update public.profiles
  set username_chosen = true
  where user_id = auth.uid();
end;
$$;

grant execute on function public.confirm_username() to authenticated;

-- ---------------------------------------------------------------------
-- 6. Rename the accounts that already carry a name-derived username.
--
-- Every existing row predates username_chosen, so all of them were
-- generated by the old trigger and none were deliberately picked. Run
-- row-by-row, not as one set-based update, so each generate_neutral_username
-- call sees the rows already rewritten by this loop and cannot hand the same
-- handle to two users.
--
-- username_updated_at is backdated here too: these users are being renamed
-- by us, not by themselves, so they should keep a free rename.
-- ---------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in select user_id from public.profiles where username_chosen = false loop
    update public.profiles
    set username = public.generate_neutral_username(),
        username_updated_at = 'epoch'
    where user_id = r.user_id;
  end loop;
end;
$$;
