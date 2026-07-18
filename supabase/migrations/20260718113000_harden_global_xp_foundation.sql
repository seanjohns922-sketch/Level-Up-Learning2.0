begin;

-- Global XP reads should not load the catalogue and inventory, and must never
-- reconstruct a second balance from realm or daily activity data.
create or replace function public.get_student_global_xp_secure(p_student_id uuid)
returns table(
  xp_earned integer,
  xp_spent integer,
  xp_balance integer,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);

  insert into public.student_economy_wallets(student_id)
  values (p_student_id)
  on conflict do nothing;

  return query
  select
    w.xp_earned,
    w.xp_spent,
    w.xp_earned - w.xp_spent,
    w.updated_at
  from public.student_economy_wallets w
  where w.student_id = p_student_id;
end;
$$;

revoke all on function public.get_student_global_xp_secure(uuid) from public;
grant execute on function public.get_student_global_xp_secure(uuid) to anon, authenticated;

-- Completion XP is ledger-first. The caller supplies the immutable completion
-- receipt key so retries cannot increment either the wallet or daily totals.
create or replace function public.apply_completion_xp(
  p_student_id uuid,
  p_class_id uuid,
  p_questions integer,
  p_correct integer,
  p_lessons integer,
  p_quizzes integer,
  p_xp integer,
  p_source_type text,
  p_source_key text,
  p_metadata jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
  safe_xp integer := greatest(coalesce(p_xp, 0), 0);
begin
  if p_source_type not in ('lesson_completion', 'quiz_completion')
    or nullif(trim(p_source_key), '') is null then
    raise exception 'Invalid XP completion source';
  end if;

  insert into public.student_economy_transactions(
    student_id, transaction_type, xp_delta, source_type, source_key, metadata
  ) values (
    p_student_id, 'earn', safe_xp, p_source_type, p_source_key,
    coalesce(p_metadata, '{}'::jsonb)
  ) on conflict do nothing;
  get diagnostics inserted_count = row_count;

  if inserted_count = 0 then
    return false;
  end if;

  insert into public.student_economy_wallets(student_id, xp_earned)
  values (p_student_id, safe_xp)
  on conflict (student_id) do update set
    xp_earned = public.student_economy_wallets.xp_earned + excluded.xp_earned,
    updated_at = now();

  perform public.upsert_student_activity_daily(
    p_student_id,
    p_class_id,
    (timezone('Australia/Melbourne', now()))::date,
    greatest(coalesce(p_questions, 0), 0),
    greatest(coalesce(p_correct, 0), 0),
    greatest(coalesce(p_lessons, 0), 0),
    greatest(coalesce(p_quizzes, 0), 0),
    0,
    safe_xp
  );

  return true;
end;
$$;

revoke all on function public.apply_completion_xp(
  uuid, uuid, integer, integer, integer, integer, integer, text, text, jsonb
) from public, anon, authenticated;

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
begin
  perform public.assert_student_access(p_student_id);
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id or p_realm_id not in ('number', 'measurement') then
    raise exception 'Student context does not match';
  end if;

  insert into public.student_completion_receipts(student_id, realm_id, activity_type, completion_key)
  values (p_student_id, p_realm_id, 'lesson', p_completion_key)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  perform public.save_realm_lesson_attempt(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, p_week, p_lesson, p_lesson_id, p_attempt
  );
  perform public.apply_completion_xp(
    p_student_id,
    actual_class_id,
    coalesce(nullif(p_attempt->>'questionsAnswered', '')::integer, 0),
    coalesce(nullif(p_attempt->>'correctAnswers', '')::integer, 0),
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
      'lesson_id', p_lesson_id
    )
  );
  return true;
end;
$$;

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
begin
  perform public.assert_student_access(p_student_id);
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id or p_realm_id not in ('number', 'measurement') then
    raise exception 'Student context does not match';
  end if;

  insert into public.student_completion_receipts(student_id, realm_id, activity_type, completion_key)
  values (p_student_id, p_realm_id, 'quiz', p_completion_key)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  perform public.save_realm_weekly_quiz_attempt(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, p_week, p_quiz_id, p_attempt
  );
  perform public.apply_completion_xp(
    p_student_id,
    actual_class_id,
    coalesce(nullif(p_attempt->>'total', '')::integer, 0),
    coalesce(nullif(p_attempt->>'score', '')::integer, 0),
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
      'quiz_id', p_quiz_id
    )
  );
  return true;
end;
$$;

grant execute on function public.complete_realm_lesson(
  uuid, uuid, text, text, text, text, integer, integer, text, uuid, jsonb, integer
) to anon, authenticated;
grant execute on function public.complete_realm_quiz(
  uuid, uuid, text, text, text, text, integer, text, uuid, jsonb, integer
) to anon, authenticated;

-- No active completion path should be able to mint a random ledger identity.
drop function if exists public.apply_completion_xp(
  uuid, uuid, integer, integer, integer, integer, integer
);

commit;
