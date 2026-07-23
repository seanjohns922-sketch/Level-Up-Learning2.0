begin;

-- Starpath is a real student program. Open the completion / reward / progress
-- surface to the 'space' realm so lessons and Voyage Quizzes persist and bank XP
-- exactly like Number Nexus and Measurelands. Teacher-placement and assessment
-- RPCs are intentionally left number/measurement-only (Starpath has no teacher
-- placement or pre/post tests).

-- ── Table constraints ───────────────────────────────────────────────────────
alter table public.student_completion_receipts
  drop constraint if exists student_completion_receipts_realm_id_check;
alter table public.student_completion_receipts
  add constraint student_completion_receipts_realm_id_check
  check (realm_id in ('number', 'measurement', 'space'));

alter table public.economy_items
  drop constraint if exists economy_items_realm_id_check;
alter table public.economy_items
  add constraint economy_items_realm_id_check
  check (realm_id in ('number', 'measurement', 'space'));

-- ── complete_realm_lesson (widen realm guard to include 'space') ─────────────
create or replace function public.complete_realm_lesson(
  p_student_id uuid,
  p_class_id uuid,
  p_realm_id text,
  p_program_key text,
  p_school_year_level text,
  p_working_level text,
  p_week integer,
  p_lesson integer,
  p_lesson_id text,
  p_completion_key uuid,
  p_attempt jsonb default '{}'::jsonb,
  p_xp integer default 40
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
  actual_class_id uuid;
  reward_eligible boolean;
  questions_answered integer := greatest(coalesce(nullif(p_attempt->>'questionsAnswered', '')::integer, 0), 0);
  correct_answers integer := greatest(coalesce(nullif(p_attempt->>'correctAnswers', '')::integer, 0), 0);
begin
  perform public.assert_student_access(p_student_id);
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id or p_realm_id not in ('number', 'measurement', 'space') then
    raise exception 'Student context does not match';
  end if;

  insert into public.student_completion_receipts(student_id, realm_id, activity_type, completion_key)
  values (p_student_id, p_realm_id, 'lesson', p_completion_key)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  -- Serialize different browser/session keys for the same logical lesson.
  perform pg_advisory_xact_lock(
    hashtext(p_student_id::text),
    hashtext(concat_ws(':', p_realm_id, p_working_level, p_week::text, p_lesson::text))
  );

  select not exists (
    select 1
    from public.student_lesson_attempts sla
    where sla.student_id = p_student_id
      and sla.realm_id = p_realm_id
      and sla.working_level = p_working_level
      and sla.week = p_week
      and sla.lesson = p_lesson
      and sla.completed
  ) into reward_eligible;

  perform public.save_realm_lesson_attempt(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, p_week, p_lesson, p_lesson_id, p_attempt
  );

  if reward_eligible then
    perform public.apply_completion_xp(
      p_student_id,
      actual_class_id,
      questions_answered,
      least(correct_answers, questions_answered),
      1,
      0,
      p_xp,
      'lesson_completion',
      p_completion_key::text,
      jsonb_build_object(
        'realm_id', p_realm_id,
        'program_key', p_program_key,
        'working_level', p_working_level,
        'week', p_week,
        'lesson', p_lesson,
        'lesson_id', p_lesson_id,
        'reward_attempt', 1
      )
    );
  else
    perform public.upsert_student_activity_daily(
      p_student_id,
      actual_class_id,
      (timezone('Australia/Melbourne', now()))::date,
      questions_answered,
      least(correct_answers, questions_answered),
      0,
      0,
      0,
      0
    );
  end if;

  return reward_eligible;
end;
$$;

-- ── complete_realm_quiz (widen realm guard to include 'space') ───────────────
create or replace function public.complete_realm_quiz(
  p_student_id uuid,
  p_class_id uuid,
  p_realm_id text,
  p_program_key text,
  p_school_year_level text,
  p_working_level text,
  p_week integer,
  p_quiz_id text,
  p_completion_key uuid,
  p_attempt jsonb default '{}'::jsonb,
  p_xp integer default 0
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
  actual_class_id uuid;
  reward_eligible boolean;
  questions_answered integer := greatest(coalesce(nullif(p_attempt->>'total', '')::integer, 0), 0);
  correct_answers integer := greatest(coalesce(nullif(p_attempt->>'score', '')::integer, 0), 0);
begin
  perform public.assert_student_access(p_student_id);
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id or p_realm_id not in ('number', 'measurement', 'space') then
    raise exception 'Student context does not match';
  end if;

  insert into public.student_completion_receipts(student_id, realm_id, activity_type, completion_key)
  values (p_student_id, p_realm_id, 'quiz', p_completion_key)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  perform pg_advisory_xact_lock(
    hashtext(p_student_id::text),
    hashtext(concat_ws(':', p_realm_id, p_working_level, p_week::text, p_quiz_id))
  );

  select not exists (
    select 1
    from public.student_weekly_quiz_attempts swqa
    where swqa.student_id = p_student_id
      and swqa.realm_id = p_realm_id
      and swqa.working_level = p_working_level
      and swqa.week = p_week
      and swqa.quiz_id = p_quiz_id
  ) into reward_eligible;

  perform public.save_realm_weekly_quiz_attempt(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, p_week, p_quiz_id, p_attempt
  );

  if reward_eligible then
    perform public.apply_completion_xp(
      p_student_id,
      actual_class_id,
      questions_answered,
      least(correct_answers, questions_answered),
      0,
      1,
      p_xp,
      'quiz_completion',
      p_completion_key::text,
      jsonb_build_object(
        'realm_id', p_realm_id,
        'program_key', p_program_key,
        'working_level', p_working_level,
        'week', p_week,
        'quiz_id', p_quiz_id,
        'reward_attempt', 1
      )
    );
  else
    perform public.upsert_student_activity_daily(
      p_student_id,
      actual_class_id,
      (timezone('Australia/Melbourne', now()))::date,
      questions_answered,
      least(correct_answers, questions_answered),
      0,
      0,
      0,
      0
    );
  end if;

  return reward_eligible;
end;
$$;

-- ── discover_realm_collectible_secure (widen realm guard) ────────────────────
-- Space has no discoverable catalog items yet, so this simply returns null for
-- 'space' until items exist — but it must not raise 'Invalid realm'.
create or replace function public.discover_realm_collectible_secure(
  p_student_id uuid,
  p_realm_id text,
  p_completion_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  desired_rarity text;
  discovered public.economy_items%rowtype;
  duplicate_item boolean;
  essence_award integer := 0;
  inserted_count integer;
  roll double precision := random();
begin
  perform public.assert_student_access(p_student_id);
  if p_realm_id not in ('number', 'measurement', 'space') then raise exception 'Invalid realm'; end if;
  if not exists (
    select 1 from public.student_completion_receipts scr
    where scr.student_id = p_student_id
      and scr.realm_id = p_realm_id
      and scr.activity_type = 'lesson'
      and scr.completion_key = p_completion_key
  ) then
    raise exception 'A completed lesson is required';
  end if;

  desired_rarity := case
    when roll < 0.02 then 'legendary'
    when roll < 0.10 then 'epic'
    when roll < 0.30 then 'rare'
    when roll < 0.60 then 'uncommon'
    else 'common'
  end;

  select * into discovered
  from public.economy_items i
  where i.active and i.discoverable and i.realm_id = p_realm_id
  order by
    case when i.rarity = desired_rarity then 0 else 1 end,
    case i.rarity when 'common' then 1 when 'uncommon' then 2 when 'rare' then 3 when 'epic' then 4 else 5 end,
    random()
  limit 1;
  if discovered.item_key is null then return null; end if;

  duplicate_item := exists(
    select 1 from public.student_inventory
    where student_id = p_student_id and item_key = discovered.item_key
  );
  essence_award := case when duplicate_item then
    case discovered.rarity when 'common' then 5 when 'uncommon' then 10 when 'rare' then 20 when 'epic' then 35 else 60 end
    else 0 end;

  insert into public.student_economy_transactions(
    student_id, transaction_type, essence_delta, source_type, source_key, item_key,
    metadata
  ) values (
    p_student_id,
    case when duplicate_item then 'duplicate' else 'discovery' end,
    essence_award,
    'lesson_discovery',
    p_completion_key::text,
    discovered.item_key,
    jsonb_build_object('realm_id', p_realm_id, 'rarity', discovered.rarity)
  ) on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return null; end if;

  if duplicate_item then
    insert into public.student_economy_wallets(student_id, essence)
    values (p_student_id, essence_award)
    on conflict (student_id) do update set
      essence = public.student_economy_wallets.essence + excluded.essence,
      updated_at = now();
  else
    insert into public.student_inventory(student_id, item_key, acquisition_type)
    values (p_student_id, discovered.item_key, 'discovery');
  end if;

  return jsonb_build_object(
    'item_key', discovered.item_key,
    'name', discovered.name,
    'rarity', discovered.rarity,
    'icon', discovered.icon,
    'accent', discovered.accent,
    'duplicate', duplicate_item,
    'essence_awarded', essence_award
  );
end;
$$;

-- ── get_student_realm_progress_compat_secure (widen realm guard) ─────────────
create or replace function public.get_student_realm_progress_compat_secure(
  p_student_id uuid,
  p_realm_id text
)
returns table(
  student_id uuid,
  class_id uuid,
  realm_id text,
  program_key text,
  school_year_level text,
  working_level text,
  is_current boolean,
  status text,
  current_week integer,
  assigned_week integer,
  placement_complete boolean,
  pretest_score integer,
  pretest_completed_at timestamptz,
  posttest_score integer,
  posttest_completed_at timestamptz,
  required_weeks jsonb,
  optional_weeks jsonb,
  unlocked_legends jsonb,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  if p_realm_id not in ('number', 'measurement', 'space') then
    raise exception 'Invalid realm';
  end if;
  return query select * from public.get_student_realm_progress_compat(p_student_id, p_realm_id);
end;
$$;

-- ── save_student_realm_progress_secure (widen realm guard) ───────────────────
create or replace function public.save_student_realm_progress_secure(
  p_student_id uuid,
  p_class_id uuid,
  p_realm_id text,
  p_program_key text,
  p_school_year_level text,
  p_working_level text,
  p_data jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actual_class_id uuid;
begin
  perform public.assert_student_access(p_student_id);
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id or p_realm_id not in ('number', 'measurement', 'space') then
    raise exception 'Student context does not match';
  end if;
  perform public.save_student_realm_progress(
    p_student_id, actual_class_id, p_realm_id, p_program_key,
    p_school_year_level, p_working_level, p_data
  );
end;
$$;

commit;
