-- XP rules set by the server, and a student check on brain-break XP.
--
-- Before this, the app told the server how much XP to pay for a lesson or quiz
-- (and the server did not cap it), and brain-break XP had no check on who was
-- calling. With XP about to buy things, the server now decides:
--   lesson_completion  40 XP, first time each lesson is finished (unchanged rule)
--   quiz_completion    60 XP the first time a weekly quiz is passed (80%+),
--                      on whichever attempt that is (was: first attempt only,
--                      scaled by score)
--   brain_break        up to 10 XP, the student's own session or teacher only,
--                      at most 30 brain-break awards per student per day
--
-- Schema: none. Three functions are replaced with the same signatures, so
-- existing grants and app calls keep working (p_xp is still accepted, ignored).
-- Data: none changed. XP already banked stays as it is.
-- Rollback: re-run the previous definitions of complete_realm_lesson and
-- complete_realm_quiz (20260910170000_release_chance_hollow_live_realm.sql) and
-- award_brain_break_xp_secure (20260809120000_brain_break_xp.sql).

begin;

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
  lesson_xp constant integer := 40; -- set here; p_xp from the app is ignored
  inserted_count integer;
  actual_class_id uuid;
  reward_eligible boolean;
  questions_answered integer := greatest(coalesce(nullif(p_attempt->>'questionsAnswered', '')::integer, 0), 0);
  correct_answers integer := greatest(coalesce(nullif(p_attempt->>'correctAnswers', '')::integer, 0), 0);
begin
  perform public.assert_student_access(p_student_id);
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id or p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
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
      lesson_xp,
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
  quiz_pass_xp constant integer := 60;   -- set here; p_xp from the app is ignored
  quiz_pass_percent constant integer := 80; -- lib/assessment-rules.ts weekly quiz pass mark
  inserted_count integer;
  actual_class_id uuid;
  first_attempt boolean;
  passed_before boolean;
  this_passed boolean;
  reward_eligible boolean;
  questions_answered integer := greatest(coalesce(nullif(p_attempt->>'total', '')::integer, 0), 0);
  correct_answers integer := greatest(coalesce(nullif(p_attempt->>'score', '')::integer, 0), 0);
  attempt_percent numeric;
begin
  perform public.assert_student_access(p_student_id);
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id or p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
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

  select
    not exists (
      select 1 from public.student_weekly_quiz_attempts swqa
      where swqa.student_id = p_student_id and swqa.realm_id = p_realm_id
        and swqa.working_level = p_working_level and swqa.week = p_week and swqa.quiz_id = p_quiz_id
    ),
    exists (
      select 1 from public.student_weekly_quiz_attempts swqa
      where swqa.student_id = p_student_id and swqa.realm_id = p_realm_id
        and swqa.working_level = p_working_level and swqa.week = p_week and swqa.quiz_id = p_quiz_id
        and swqa.passed
    )
  into first_attempt, passed_before;

  attempt_percent := case
    when questions_answered > 0 then 100.0 * least(correct_answers, questions_answered) / questions_answered
    else coalesce(nullif(p_attempt->>'percent', '')::numeric, 0)
  end;
  this_passed := attempt_percent >= quiz_pass_percent;
  -- Pays once: the first time this quiz is passed.
  reward_eligible := this_passed and not passed_before;

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
      case when first_attempt then 1 else 0 end,
      quiz_pass_xp,
      'quiz_completion',
      p_completion_key::text,
      jsonb_build_object(
        'realm_id', p_realm_id,
        'program_key', p_program_key,
        'working_level', p_working_level,
        'week', p_week,
        'quiz_id', p_quiz_id,
        'reward', 'first_pass'
      )
    );
  else
    -- Activity still counts every attempt's questions; a quiz counts as
    -- completed on its first attempt, as before.
    perform public.upsert_student_activity_daily(
      p_student_id,
      actual_class_id,
      (timezone('Australia/Melbourne', now()))::date,
      questions_answered,
      least(correct_answers, questions_answered),
      0,
      case when first_attempt then 1 else 0 end,
      0,
      0
    );
  end if;

  return reward_eligible;
end;
$$;

create or replace function public.award_brain_break_xp_secure(
  p_student_id uuid,
  p_class_id uuid,
  p_xp integer,
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
  safe_xp integer := least(greatest(coalesce(p_xp, 0), 0), 10); -- hard server cap
  awards_today integer;
begin
  -- Only the student's own session or a teacher can award it (never a parent).
  perform public.assert_student_write(p_student_id);
  if nullif(trim(p_source_key), '') is null or p_source_key not like 'bb:%' or length(p_source_key) > 200 then
    raise exception 'brain_break XP requires a brain-break source key';
  end if;
  if safe_xp = 0 then
    return false;
  end if;

  perform pg_advisory_xact_lock(hashtext(p_student_id::text), hashtext('brain_break'));
  select count(*) into awards_today
  from public.student_economy_transactions
  where student_id = p_student_id
    and source_type = 'brain_break'
    and created_at >= (date_trunc('day', timezone('Australia/Melbourne', now())) at time zone 'Australia/Melbourne');
  if awards_today >= 30 then
    return false; -- daily limit reached
  end if;

  insert into public.student_economy_transactions(
    student_id, transaction_type, xp_delta, source_type, source_key, metadata
  ) values (
    p_student_id, 'earn', safe_xp, 'brain_break', p_source_key,
    coalesce(p_metadata, '{}'::jsonb)
  ) on conflict (student_id, source_type, source_key) do nothing;
  get diagnostics inserted_count = row_count;

  if inserted_count = 0 then
    return false; -- already earned for this break
  end if;

  insert into public.student_economy_wallets(student_id, xp_earned)
  values (p_student_id, safe_xp)
  on conflict (student_id) do update set
    xp_earned = public.student_economy_wallets.xp_earned + excluded.xp_earned,
    updated_at = now();

  return true;
end;
$$;

revoke all on function public.award_brain_break_xp_secure(uuid, uuid, integer, text, jsonb) from public;
-- Student sessions run as anon with the validated x-student-session header.
grant execute on function public.award_brain_break_xp_secure(uuid, uuid, integer, text, jsonb) to anon, authenticated;

commit;
