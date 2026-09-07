-- Makes check_and_award_badges()/log_activity_event() return the ids of any
-- badges newly unlocked by this call, so the client can pop up a "badge
-- unlocked" toast immediately without a second round-trip query. Both
-- functions previously returned void; return type changes require a drop +
-- recreate rather than create-or-replace.

drop function if exists public.log_activity_event(uuid, text, text, text, text, text, boolean, int, int, numeric);
drop function if exists public.check_and_award_badges(uuid, text, text, text, int, int, numeric);

create or replace function public.check_and_award_badges(
  p_user_id uuid,
  p_content_type text,
  p_subject text,
  p_bucket text,
  p_subject_total_items int,
  p_bucket_total_items int,
  p_bucket_known_pct numeric
)
returns text[]
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
  v_new_badges text[] := '{}';
begin
  if not exists (select 1 from public.user_badges where user_id = p_user_id and badge_id = 'first_steps') then
    insert into public.user_badges (user_id, badge_id) values (p_user_id, 'first_steps') on conflict do nothing;
    if found then
      v_new_badges := array_append(v_new_badges, 'first_steps');
    end if;
  end if;

  if not exists (select 1 from public.user_badges where user_id = p_user_id and badge_id = 'well_rounded') then
    select count(distinct subject) into v_distinct_subjects from public.activity_events where user_id = p_user_id;
    if v_distinct_subjects >= 3 then
      insert into public.user_badges (user_id, badge_id) values (p_user_id, 'well_rounded') on conflict do nothing;
      if found then
        v_new_badges := array_append(v_new_badges, 'well_rounded');
      end if;
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
          if found then
            v_new_badges := array_append(v_new_badges, v_badge.id);
          end if;
        end if;
      end if;
    end loop;
  end if;

  select current_streak into v_current_streak from public.get_user_streak(p_user_id);
  for v_badge in select * from public.badges where unlock_condition_type = 'streak' loop
    if not exists (select 1 from public.user_badges where user_id = p_user_id and badge_id = v_badge.id) then
      if v_current_streak >= (v_badge.unlock_condition_value ->> 'days')::int then
        insert into public.user_badges (user_id, badge_id) values (p_user_id, v_badge.id) on conflict do nothing;
        if found then
          v_new_badges := array_append(v_new_badges, v_badge.id);
        end if;
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
          if found then
            v_new_badges := array_append(v_new_badges, 'turnaround');
          end if;
        end if;
      end if;

      if not exists (select 1 from public.user_badges where user_id = p_user_id and badge_id = 'perfectionist') then
        if p_bucket_total_items is not null and p_bucket_total_items > 0 and p_bucket_known_pct >= 100 then
          insert into public.user_badges (user_id, badge_id) values (p_user_id, 'perfectionist') on conflict do nothing;
          if found then
            v_new_badges := array_append(v_new_badges, 'perfectionist');
          end if;
        end if;
      end if;
    end if;

    if not exists (select 1 from public.user_badges where user_id = p_user_id and badge_id = 'card_shark') then
      select count(*) into v_count from public.activity_events where user_id = p_user_id and content_type = 'flashcard';
      if v_count >= 500 then
        insert into public.user_badges (user_id, badge_id) values (p_user_id, 'card_shark') on conflict do nothing;
        if found then
          v_new_badges := array_append(v_new_badges, 'card_shark');
        end if;
      end if;
    end if;
  end if;

  if p_content_type = 'question' then
    if not exists (select 1 from public.user_badges where user_id = p_user_id and badge_id = 'question_master') then
      select count(*) into v_count from public.activity_events where user_id = p_user_id and content_type = 'question';
      if v_count >= 100 then
        insert into public.user_badges (user_id, badge_id) values (p_user_id, 'question_master') on conflict do nothing;
        if found then
          v_new_badges := array_append(v_new_badges, 'question_master');
        end if;
      end if;
    end if;
  end if;

  return v_new_badges;
end;
$$;

grant execute on function public.check_and_award_badges(uuid, text, text, text, int, int, numeric) to authenticated;

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
returns text[]
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_new_badges text[];
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
  v_new_badges := public.check_and_award_badges(
    p_user_id, p_content_type, p_subject, p_bucket,
    p_subject_total_items, p_bucket_total_items, p_bucket_known_pct
  );

  return v_new_badges;
end;
$$;

grant execute on function public.log_activity_event(uuid, text, text, text, text, text, boolean, int, int, numeric) to authenticated;
