-- Parents of home learners can skip a week: at most 4 per realm per level.
--
-- A skip moves the child's current week on by one, the same way a teacher's
-- "advance week" override does, and is recorded in the same table with reason
-- 'parent_skip' (teacher_id holds the parent's user id: the column is the
-- acting adult). The child's app already treats every override as an opened
-- week, so no app change is needed for the next week to open.
--
-- Rules, all enforced here:
--   * only an active linked parent, and only for a home learner (no school
--     entitlement, school membership or class enrolment:
--     parent_can_manage_home_student);
--   * only the child's current week, never the last week of the level;
--   * at most 4 parent skips per child, realm and level;
--   * lessons and quizzes in a parent-skipped week earn no XP and do not count
--     as a learning day (so no Chrono Crystal), even if done later. The work is
--     still saved and still shows in reports.
--
-- Schema: student_progress_overrides.reason gains 'parent_skip'.
-- New: parent_skip_child_week, get_parent_child_week_skips (authenticated).
-- Replaced (same signatures, grants kept): complete_realm_lesson,
-- complete_realm_quiz — identical to 20261027120000 apart from the skip check.
-- Data: none changed.
-- Rollback: delete parent_skip rows (restoring each student_realm_progress
-- current_week/assigned_week from previous_state if wanted), drop the two new
-- functions, restore the reason check without 'parent_skip', and re-run
-- complete_realm_lesson / complete_realm_quiz from
-- 20261027120000_server_side_xp_rules.sql.

begin;

alter table public.student_progress_overrides
  drop constraint if exists student_progress_overrides_reason_check;
alter table public.student_progress_overrides
  add constraint student_progress_overrides_reason_check
  check (reason in (
    'additional_needs', 'iep', 'professional_judgement',
    'extended_absence', 'technical_issue', 'other', 'parent_skip'
  ));

create or replace function public.parent_week_skip_limit()
returns integer language sql immutable set search_path = public as $$ select 4 $$;

create or replace function public.is_parent_skipped_week(
  p_student_id uuid, p_realm_id text, p_working_level text, p_week integer
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.student_progress_overrides skip
    where skip.student_id = p_student_id
      and skip.realm_id = p_realm_id
      and skip.working_level = p_working_level
      and skip.week = p_week
      and skip.reason = 'parent_skip'
  );
$$;

revoke all on function public.is_parent_skipped_week(uuid, text, text, integer)
  from public, anon, authenticated;

create or replace function public.parent_skip_child_week(
  p_student_id uuid,
  p_realm_id text,
  p_week integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_parent uuid := auth.uid();
  v_progress public.student_realm_progress%rowtype;
  v_last_week integer;
  v_next_week integer;
  v_used integer;
begin
  perform public.assert_parent_role();
  if not public.parent_can_manage_home_student(p_student_id) then
    raise exception 'Only home learners can skip weeks' using errcode = '42501';
  end if;
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
    raise exception 'Invalid realm';
  end if;

  select * into v_progress
  from public.student_realm_progress
  where student_id = p_student_id
    and realm_id = p_realm_id
    and is_current
  for update;

  if v_progress.id is null
    or v_progress.status <> 'ASSIGNED_PROGRAM'
    or not v_progress.placement_complete then
    raise exception 'This realm has not started yet';
  end if;
  if p_week is distinct from coalesce(v_progress.current_week, v_progress.assigned_week, 1) then
    raise exception 'Only the current week can be skipped';
  end if;

  v_last_week := public.realm_program_week_count(p_realm_id, v_progress.working_level);
  if p_week < 1 or p_week >= v_last_week then
    raise exception 'The last week of a level cannot be skipped';
  end if;

  -- One skip at a time per child and realm, so two taps cannot both pass the count.
  perform pg_advisory_xact_lock(hashtext(p_student_id::text), hashtext('parent_skip:' || p_realm_id));
  select count(*) into v_used
  from public.student_progress_overrides skip
  where skip.student_id = p_student_id
    and skip.realm_id = p_realm_id
    and skip.working_level = v_progress.working_level
    and skip.reason = 'parent_skip';
  if v_used >= public.parent_week_skip_limit() then
    raise exception 'No skips left for this level';
  end if;

  v_next_week := p_week + 1;

  insert into public.student_progress_overrides (
    student_id, realm_id, working_level, week, advanced_to_week,
    teacher_id, reason, previous_state, new_state
  ) values (
    p_student_id, p_realm_id, v_progress.working_level, p_week, v_next_week,
    v_parent, 'parent_skip',
    jsonb_build_object(
      'current_week', v_progress.current_week,
      'assigned_week', v_progress.assigned_week,
      'status', v_progress.status
    ),
    jsonb_build_object(
      'current_week', v_next_week,
      'assigned_week', v_next_week,
      'status', v_progress.status,
      'advancement', 'parent_skip'
    )
  );

  update public.student_realm_progress
  set current_week = v_next_week,
      assigned_week = v_next_week,
      updated_at = now()
  where id = v_progress.id;

  return jsonb_build_object(
    'realmId', p_realm_id,
    'workingLevel', v_progress.working_level,
    'skippedWeek', p_week,
    'currentWeek', v_next_week,
    'skipsLeft', public.parent_week_skip_limit() - v_used - 1
  );
end;
$$;

revoke all on function public.parent_skip_child_week(uuid, text, integer) from public, anon;
grant execute on function public.parent_skip_child_week(uuid, text, integer) to authenticated;

-- Skip state for every current realm of one child: which weeks were skipped on
-- the current level, how many skips are left, and whether this parent may skip.
create or replace function public.get_parent_child_week_skips(p_student_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_can_skip boolean;
begin
  perform public.assert_parent_role();
  if not exists (
    select 1 from public.parent_student_links link
    where link.parent_user_id = auth.uid()
      and link.student_id = p_student_id
      and link.status = 'active'
  ) then
    raise exception 'Child access denied' using errcode = '42501';
  end if;
  v_can_skip := public.parent_can_manage_home_student(p_student_id);

  return jsonb_build_object(
    'canSkip', v_can_skip,
    'limit', public.parent_week_skip_limit(),
    'realms', coalesce((
      select jsonb_agg(jsonb_build_object(
        'realmId', progress.realm_id,
        'workingLevel', progress.working_level,
        'weekCount', public.realm_program_week_count(progress.realm_id, progress.working_level),
        'skippedWeeks', coalesce((
          select jsonb_agg(jsonb_build_object('week', skip.week, 'skippedAt', skip.created_at) order by skip.week)
          from public.student_progress_overrides skip
          where skip.student_id = p_student_id
            and skip.realm_id = progress.realm_id
            and skip.working_level = progress.working_level
            and skip.reason = 'parent_skip'
        ), '[]'::jsonb),
        'skipsLeft', greatest(0, public.parent_week_skip_limit() - (
          select count(*)::integer
          from public.student_progress_overrides skip
          where skip.student_id = p_student_id
            and skip.realm_id = progress.realm_id
            and skip.working_level = progress.working_level
            and skip.reason = 'parent_skip'
        ))
      ) order by progress.realm_id)
      from public.student_realm_progress progress
      where progress.student_id = p_student_id and progress.is_current
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_parent_child_week_skips(uuid) from public, anon;
grant execute on function public.get_parent_child_week_skips(uuid) to authenticated;

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

  -- A parent-skipped week pays nothing and is not a learning day.
  select not exists (
    select 1
    from public.student_lesson_attempts sla
    where sla.student_id = p_student_id
      and sla.realm_id = p_realm_id
      and sla.working_level = p_working_level
      and sla.week = p_week
      and sla.lesson = p_lesson
      and sla.completed
  ) and not public.is_parent_skipped_week(p_student_id, p_realm_id, p_working_level, p_week)
  into reward_eligible;

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
  skipped_week boolean;
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
  skipped_week := public.is_parent_skipped_week(p_student_id, p_realm_id, p_working_level, p_week);

  attempt_percent := case
    when questions_answered > 0 then 100.0 * least(correct_answers, questions_answered) / questions_answered
    else coalesce(nullif(p_attempt->>'percent', '')::numeric, 0)
  end;
  this_passed := attempt_percent >= quiz_pass_percent;
  -- Pays once: the first time this quiz is passed. A parent-skipped week pays nothing.
  reward_eligible := this_passed and not passed_before and not skipped_week;

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
    -- completed on its first attempt, as before, except in a parent-skipped
    -- week, which is never a learning day.
    perform public.upsert_student_activity_daily(
      p_student_id,
      actual_class_id,
      (timezone('Australia/Melbourne', now()))::date,
      questions_answered,
      least(correct_answers, questions_answered),
      0,
      case when first_attempt and not skipped_week then 1 else 0 end,
      0,
      0
    );
  end if;

  return reward_eligible;
end;
$$;

commit;
