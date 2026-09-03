begin;

-- UI locks are not an authority boundary. Reject lesson and quiz inserts that
-- do not match the student's current canonical pathway, even if a route or RPC
-- is called directly.
create or replace function public.realm_week_is_playable(
  p_student_id uuid,
  p_realm_id text,
  p_working_level text,
  p_program_key text,
  p_week integer
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  progress public.student_realm_progress%rowtype;
  maximum_week integer;
  required_count integer := 0;
  completed_required_count integer := 0;
  first_incomplete_required integer;
  optional_count integer := 0;
begin
  maximum_week := case
    when p_realm_id = 'number' then 12
    when p_realm_id in ('measurement', 'space') then 8
    when p_realm_id = 'statistics' then 6
    else 0
  end;
  if p_week < 1 or p_week > maximum_week then return false; end if;

  select * into progress
  from public.student_realm_progress candidate
  where candidate.student_id = p_student_id
    and candidate.realm_id = p_realm_id
    and candidate.working_level = p_working_level
    and candidate.is_current
  limit 1;

  if progress.id is null
    or progress.program_key is distinct from p_program_key
    or progress.status <> 'ASSIGNED_PROGRAM'
    or not progress.placement_complete then
    return false;
  end if;

  select count(distinct required_week.value::integer)
  into required_count
  from jsonb_array_elements_text(coalesce(progress.required_weeks, '[]'::jsonb)) as required_week(value)
  where required_week.value ~ '^[0-9]+$'
    and required_week.value::integer between 1 and maximum_week;

  if required_count > 0 then
    select count(distinct required_week.value::integer)
    into completed_required_count
    from jsonb_array_elements_text(coalesce(progress.required_weeks, '[]'::jsonb)) as required_week(value)
    where required_week.value ~ '^[0-9]+$'
      and required_week.value::integer between 1 and maximum_week
      and exists (
        select 1
        from public.student_weekly_quiz_attempts quiz
        where quiz.student_id = p_student_id
          and quiz.realm_id = p_realm_id
          and quiz.working_level = p_working_level
          and quiz.week = required_week.value::integer
          and quiz.passed
          and quiz.accuracy_percent >= 80
      );

    if completed_required_count = required_count then return true; end if;

    select min(required_week.value::integer)
    into first_incomplete_required
    from jsonb_array_elements_text(coalesce(progress.required_weeks, '[]'::jsonb)) as required_week(value)
    where required_week.value ~ '^[0-9]+$'
      and required_week.value::integer between 1 and maximum_week
      and not exists (
        select 1
        from public.student_weekly_quiz_attempts quiz
        where quiz.student_id = p_student_id
          and quiz.realm_id = p_realm_id
          and quiz.working_level = p_working_level
          and quiz.week = required_week.value::integer
          and quiz.passed
          and quiz.accuracy_percent >= 80
      );

    return exists (
      select 1
      from jsonb_array_elements_text(coalesce(progress.required_weeks, '[]'::jsonb)) as required_week(value)
      where required_week.value ~ '^[0-9]+$'
        and required_week.value::integer = p_week
        and (
          required_week.value::integer = first_incomplete_required
          or required_week.value::integer <= coalesce(progress.assigned_week, 1)
          or exists (
            select 1
            from public.student_weekly_quiz_attempts quiz
            where quiz.student_id = p_student_id
              and quiz.realm_id = p_realm_id
              and quiz.working_level = p_working_level
              and quiz.week = p_week
              and quiz.passed
              and quiz.accuracy_percent >= 80
          )
        )
    );
  end if;

  select count(distinct optional_week.value::integer)
  into optional_count
  from jsonb_array_elements_text(coalesce(progress.optional_weeks, '[]'::jsonb)) as optional_week(value)
  where optional_week.value ~ '^[0-9]+$'
    and optional_week.value::integer between 1 and maximum_week;

  if optional_count = maximum_week then return true; end if;
  return p_week = least(maximum_week, greatest(1, coalesce(progress.assigned_week, 1)));
end;
$$;

revoke all on function public.realm_week_is_playable(uuid, text, text, text, integer)
  from public, anon, authenticated;

create or replace function public.enforce_realm_lesson_sequence()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.lesson not between 1 and 3
    or not public.realm_week_is_playable(
      new.student_id, new.realm_id, new.working_level, new.program_key, new.week
    ) then
    raise exception 'Lesson is locked by the canonical student pathway' using errcode = '42501';
  end if;

  if new.lesson > 1 and not exists (
    select 1
    from public.student_lesson_attempts previous
    where previous.student_id = new.student_id
      and previous.realm_id = new.realm_id
      and previous.working_level = new.working_level
      and previous.week = new.week
      and previous.lesson = new.lesson - 1
      and previous.completed
  ) then
    raise exception 'The previous lesson must be completed first' using errcode = '42501';
  end if;
  return new;
end;
$$;

create or replace function public.enforce_realm_quiz_sequence()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  completed_lesson_count integer;
begin
  if not public.realm_week_is_playable(
    new.student_id, new.realm_id, new.working_level, new.program_key, new.week
  ) then
    raise exception 'Quiz is locked by the canonical student pathway' using errcode = '42501';
  end if;

  select count(distinct lesson.lesson)
  into completed_lesson_count
  from public.student_lesson_attempts lesson
  where lesson.student_id = new.student_id
    and lesson.realm_id = new.realm_id
    and lesson.working_level = new.working_level
    and lesson.week = new.week
    and lesson.lesson between 1 and 3
    and lesson.completed;

  if completed_lesson_count < 3 then
    raise exception 'All three lessons must be completed before the quiz' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_realm_lesson_sequence() from public, anon, authenticated;
revoke all on function public.enforce_realm_quiz_sequence() from public, anon, authenticated;

drop trigger if exists trg_enforce_realm_lesson_sequence on public.student_lesson_attempts;
create trigger trg_enforce_realm_lesson_sequence
before insert on public.student_lesson_attempts
for each row execute function public.enforce_realm_lesson_sequence();

drop trigger if exists trg_enforce_realm_quiz_sequence on public.student_weekly_quiz_attempts;
create trigger trg_enforce_realm_quiz_sequence
before insert on public.student_weekly_quiz_attempts
for each row execute function public.enforce_realm_quiz_sequence();

commit;
