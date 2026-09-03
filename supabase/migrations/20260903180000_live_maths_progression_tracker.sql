begin;

-- Live maths progression keeps the last official Whole-Maths strand result,
-- the latest realm checkpoint, and a continuously recomputed prediction as
-- separate values. Realm pre/post-tests recalibrate the checkpoint; only a
-- completed six-strand diagnostic can create an official overall result.

create table if not exists public.student_live_maths_progression (
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  realm_id text not null check (realm_id in ('number', 'measurement', 'space', 'statistics')),
  strand text not null check (strand in ('number', 'measurement', 'space', 'statistics')),
  current_working_level text not null,
  official_level numeric(4,2) null check (official_level is null or official_level between 0 and 6),
  official_at timestamptz null,
  checkpoint_level numeric(4,2) not null check (checkpoint_level between 0 and 6),
  checkpoint_source text not null check (checkpoint_source in ('diagnostic', 'pretest', 'posttest', 'placement')),
  checkpoint_at timestamptz not null,
  predicted_level numeric(4,2) not null check (predicted_level between 0 and 6),
  prediction_confidence integer not null check (prediction_confidence between 0 and 100),
  evidence jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (student_id, realm_id)
);

-- Upgrade an earlier draft of this migration safely. That draft labelled realm
-- pre-tests/placements as official and did not have a separate checkpoint.
alter table public.student_live_maths_progression
  alter column official_level drop not null,
  alter column official_at drop not null,
  add column if not exists checkpoint_level numeric(4,2),
  add column if not exists checkpoint_source text,
  add column if not exists checkpoint_at timestamptz;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'student_live_maths_progression'
      and column_name = 'official_source'
  ) then
    execute $upgrade$
      update public.student_live_maths_progression
      set checkpoint_level = coalesce(
            checkpoint_level,
            official_level,
            nullif(substring(current_working_level from '[0-9]+'), '')::numeric,
            0
          ),
          checkpoint_source = coalesce(checkpoint_source, official_source, 'placement'),
          checkpoint_at = coalesce(checkpoint_at, official_at, updated_at, now()),
          official_level = null,
          official_at = null
    $upgrade$;
    alter table public.student_live_maths_progression drop column official_source;
  else
    update public.student_live_maths_progression
    set checkpoint_level = coalesce(
          checkpoint_level,
          official_level,
          nullif(substring(current_working_level from '[0-9]+'), '')::numeric,
          0
        ),
        checkpoint_source = coalesce(checkpoint_source, 'placement'),
        checkpoint_at = coalesce(checkpoint_at, official_at, updated_at, now())
    where checkpoint_level is null or checkpoint_source is null or checkpoint_at is null;
  end if;
end;
$$;

alter table public.student_live_maths_progression
  alter column checkpoint_level set not null,
  alter column checkpoint_source set not null,
  alter column checkpoint_at set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.student_live_maths_progression'::regclass
      and conname = 'student_live_maths_progression_checkpoint_level_check'
  ) then
    alter table public.student_live_maths_progression
      add constraint student_live_maths_progression_checkpoint_level_check
      check (checkpoint_level between 0 and 6);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.student_live_maths_progression'::regclass
      and conname = 'student_live_maths_progression_checkpoint_source_check'
  ) then
    alter table public.student_live_maths_progression
      add constraint student_live_maths_progression_checkpoint_source_check
      check (checkpoint_source in ('diagnostic', 'pretest', 'posttest', 'placement'));
  end if;
end;
$$;

create index if not exists student_live_maths_progression_class_idx
  on public.student_live_maths_progression(class_id, realm_id, predicted_level desc);

alter table public.student_live_maths_progression enable row level security;
revoke all on table public.student_live_maths_progression from public, anon, authenticated;

create or replace function public.maths_progression_level_number(p_level text)
returns integer
language sql
immutable
set search_path = public
as $$
  select case
    when lower(trim(coalesce(p_level, ''))) in ('prep', 'foundation', 'ground', 'ground level') then 0
    when substring(coalesce(p_level, '') from '[0-9]+')::integer between 1 and 6
      then substring(coalesce(p_level, '') from '[0-9]+')::integer
    else null
  end;
$$;

revoke all on function public.maths_progression_level_number(text) from public, anon, authenticated;

create or replace function public.refresh_student_live_maths_progression(
  p_student_id uuid,
  p_realm_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quiz_pass constant integer := 80;
  v_mastery constant integer := 85;
  v_floor constant integer := 40;
  v_lesson_week_credit constant numeric := 0.4;
  v_lessons_per_week constant integer := 3;
  v_max_confidence constant integer := 95;
  v_progress public.student_realm_progress%rowtype;
  v_working_number integer;
  v_total_weeks integer;
  v_official numeric;
  v_official_at timestamptz;
  v_checkpoint numeric;
  v_checkpoint_source text;
  v_checkpoint_at timestamptz;
  v_assessment_type text;
  v_assessment_level integer;
  v_assessment_score numeric;
  v_assessment_at timestamptz;
  v_passed_quiz_weeks integer := 0;
  v_unconfirmed_lessons integer := 0;
  v_week_equivalents numeric := 0;
  v_predicted numeric;
  v_confidence integer;
begin
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics') then return; end if;

  select progress.* into v_progress
  from public.student_realm_progress progress
  where progress.student_id = p_student_id
    and progress.realm_id = p_realm_id
    and progress.is_current
  order by progress.updated_at desc
  limit 1;

  if not found or v_progress.class_id is null then
    delete from public.student_live_maths_progression
    where student_id = p_student_id and realm_id = p_realm_id;
    return;
  end if;

  v_working_number := public.maths_progression_level_number(v_progress.working_level);
  if v_working_number is null then return; end if;
  v_total_weeks := case
    when p_realm_id = 'number' then 12
    when p_realm_id = 'statistics' then 6
    else 8
  end;

  -- Only a completed Whole-Maths strand result is official. Realm assessments
  -- are verified checkpoints for the live estimate, never official results.
  select result.measured_level, result.completed_at
  into v_official, v_official_at
  from public.whole_math_diagnostic_strand_results result
  join public.whole_math_diagnostic_sittings sitting on sitting.id = result.sitting_id
  where result.student_id = p_student_id
    and result.realm_id = p_realm_id
    and result.status = 'completed'
    and result.measured_level is not null
    and sitting.status = 'completed'
    and sitting.checkpoint in ('start', 'mid', 'end')
    and (
      select count(distinct completed_result.strand)
      from public.whole_math_diagnostic_strand_results completed_result
      where completed_result.sitting_id = sitting.id
        and completed_result.status = 'completed'
        and completed_result.measured_level is not null
    ) = 6
  order by result.completed_at desc
  limit 1;

  -- Any completed strand diagnostic, including a teacher-triggered ad-hoc
  -- check, may be the latest verified realm checkpoint. Ad-hoc checks never
  -- populate official_level.
  select result.measured_level, result.completed_at
  into v_checkpoint, v_checkpoint_at
  from public.whole_math_diagnostic_strand_results result
  join public.whole_math_diagnostic_sittings sitting on sitting.id = result.sitting_id
  where result.student_id = p_student_id
    and result.realm_id = p_realm_id
    and result.status = 'completed'
    and result.measured_level is not null
    and sitting.status = 'completed'
  order by result.completed_at desc
  limit 1;
  if v_checkpoint is not null then
    v_checkpoint_source := 'diagnostic';
  end if;

  -- The newest realm pre/post-test is a verified live checkpoint. Mastery at
  -- 85% confirms the next level boundary; a non-passing score still
  -- recalibrates position within (or just below) the tested level.
  select
    lower(assessment.assessment_type),
    public.maths_progression_level_number(assessment.working_level),
    assessment.score_percent,
    assessment.completed_at
  into v_assessment_type, v_assessment_level, v_assessment_score, v_assessment_at
  from public.student_realm_assessments assessment
  where assessment.student_id = p_student_id
    and assessment.realm_id = p_realm_id
    and lower(assessment.assessment_type) in ('pretest', 'posttest')
  order by assessment.completed_at desc
  limit 1;

  if not found then
    select historical.assessment_type, historical.assessment_level,
      historical.assessment_score, historical.assessment_at
    into v_assessment_type, v_assessment_level, v_assessment_score, v_assessment_at
    from (
      select 'pretest'::text as assessment_type,
        public.maths_progression_level_number(progress.working_level) as assessment_level,
        progress.pretest_score::numeric as assessment_score,
        progress.pretest_completed_at as assessment_at
      from public.student_realm_progress progress
      where progress.student_id = p_student_id and progress.realm_id = p_realm_id
        and progress.pretest_score is not null and progress.pretest_completed_at is not null
      union all
      select 'posttest'::text,
        public.maths_progression_level_number(progress.working_level),
        progress.posttest_score::numeric,
        progress.posttest_completed_at
      from public.student_realm_progress progress
      where progress.student_id = p_student_id and progress.realm_id = p_realm_id
        and progress.posttest_score is not null and progress.posttest_completed_at is not null
    ) historical
    order by historical.assessment_at desc
    limit 1;
  end if;

  if found and v_assessment_level is not null and v_assessment_score is not null
    and (v_checkpoint_at is null or v_assessment_at > v_checkpoint_at) then
    v_checkpoint := greatest(0, least(6, case
      when v_assessment_score >= v_mastery then v_assessment_level + 1
      when v_assessment_score >= v_floor then v_assessment_level + ((v_assessment_score - v_floor) / (v_mastery - v_floor))
      else v_assessment_level - least(0.9, (v_floor - v_assessment_score) / v_floor)
    end));
    v_checkpoint_source := v_assessment_type;
    v_checkpoint_at := v_assessment_at;
  end if;

  -- A teacher placement is a transparent fallback, not verified evidence.
  if v_checkpoint is null then
    v_checkpoint := v_working_number;
    v_checkpoint_source := 'placement';
    v_checkpoint_at := coalesce(v_progress.created_at, v_progress.updated_at, now());
  end if;

  select count(*) into v_passed_quiz_weeks
  from (
    select attempt.week
    from public.student_weekly_quiz_attempts attempt
    where attempt.student_id = p_student_id
      and attempt.realm_id = p_realm_id
      and attempt.working_level = v_progress.working_level
      and attempt.completed_at > v_checkpoint_at
    group by attempt.week
    having max(attempt.accuracy_percent) >= v_quiz_pass or bool_or(attempt.passed)
  ) passed_weeks;

  select count(*) into v_unconfirmed_lessons
  from (
    select attempt.week, attempt.lesson
    from public.student_lesson_attempts attempt
    where attempt.student_id = p_student_id
      and attempt.realm_id = p_realm_id
      and attempt.working_level = v_progress.working_level
      and attempt.completed
      and attempt.completed_at > v_checkpoint_at
      and not exists (
        select 1 from public.student_weekly_quiz_attempts quiz
        where quiz.student_id = attempt.student_id
          and quiz.realm_id = attempt.realm_id
          and quiz.working_level = attempt.working_level
          and quiz.week = attempt.week
          and quiz.completed_at > v_checkpoint_at
          and (quiz.accuracy_percent >= v_quiz_pass or quiz.passed)
      )
    group by attempt.week, attempt.lesson
  ) unconfirmed_lessons;

  v_week_equivalents := v_passed_quiz_weeks
    + (v_unconfirmed_lessons::numeric / v_lessons_per_week) * v_lesson_week_credit;
  v_predicted := least(6, round((v_checkpoint + v_week_equivalents / v_total_weeks)::numeric, 2));
  v_confidence := least(
    v_max_confidence,
    case v_checkpoint_source when 'diagnostic' then 70 when 'posttest' then 70 when 'pretest' then 60 else 25 end
      + least(25, v_passed_quiz_weeks * 4 + v_unconfirmed_lessons)
  );

  insert into public.student_live_maths_progression (
    student_id, class_id, realm_id, strand, current_working_level,
    official_level, official_at, checkpoint_level, checkpoint_source, checkpoint_at, predicted_level,
    prediction_confidence, evidence, updated_at
  ) values (
    p_student_id, v_progress.class_id, p_realm_id, p_realm_id, v_progress.working_level,
    round(v_official, 2), v_official_at, round(v_checkpoint, 2), v_checkpoint_source, v_checkpoint_at, v_predicted,
    v_confidence,
    jsonb_build_object(
      'passedQuizWeeks', v_passed_quiz_weeks,
      'completedUnconfirmedLessons', v_unconfirmed_lessons,
      'confirmedWeekEquivalents', round(v_week_equivalents, 2),
      'totalWeeks', v_total_weeks,
      'quizPassPercent', v_quiz_pass,
      'lessonWeekCredit', v_lesson_week_credit
    ),
    now()
  ) on conflict (student_id, realm_id) do update set
    class_id = excluded.class_id,
    strand = excluded.strand,
    current_working_level = excluded.current_working_level,
    official_level = excluded.official_level,
    official_at = excluded.official_at,
    checkpoint_level = excluded.checkpoint_level,
    checkpoint_source = excluded.checkpoint_source,
    checkpoint_at = excluded.checkpoint_at,
    predicted_level = excluded.predicted_level,
    prediction_confidence = excluded.prediction_confidence,
    evidence = excluded.evidence,
    updated_at = now();
end;
$$;

revoke all on function public.refresh_student_live_maths_progression(uuid, text) from public, anon, authenticated;

create or replace function public.refresh_live_maths_progression_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.realm_id, old.realm_id) is not null then
    perform public.refresh_student_live_maths_progression(
      coalesce(new.student_id, old.student_id),
      coalesce(new.realm_id, old.realm_id)
    );
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function public.refresh_live_maths_progression_trigger() from public, anon, authenticated;

drop trigger if exists trg_refresh_live_progression_from_progress on public.student_realm_progress;
create trigger trg_refresh_live_progression_from_progress
after insert or update or delete on public.student_realm_progress
for each row execute function public.refresh_live_maths_progression_trigger();

drop trigger if exists trg_refresh_live_progression_from_lessons on public.student_lesson_attempts;
create trigger trg_refresh_live_progression_from_lessons
after insert or update or delete on public.student_lesson_attempts
for each row execute function public.refresh_live_maths_progression_trigger();

drop trigger if exists trg_refresh_live_progression_from_quizzes on public.student_weekly_quiz_attempts;
create trigger trg_refresh_live_progression_from_quizzes
after insert or update or delete on public.student_weekly_quiz_attempts
for each row execute function public.refresh_live_maths_progression_trigger();

drop trigger if exists trg_refresh_live_progression_from_assessments on public.student_realm_assessments;
create trigger trg_refresh_live_progression_from_assessments
after insert or update or delete on public.student_realm_assessments
for each row execute function public.refresh_live_maths_progression_trigger();

drop trigger if exists trg_refresh_live_progression_from_diagnostic on public.whole_math_diagnostic_strand_results;
create trigger trg_refresh_live_progression_from_diagnostic
after insert or update or delete on public.whole_math_diagnostic_strand_results
for each row execute function public.refresh_live_maths_progression_trigger();

-- The last strand result is saved before its sitting is marked completed. This
-- second trigger refreshes all six rows after that final status transition, so
-- a partial sitting can never leak into official_level.
create or replace function public.refresh_live_maths_progression_from_sitting_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  diagnostic_result record;
begin
  for diagnostic_result in
    select result.student_id, result.realm_id
    from public.whole_math_diagnostic_strand_results result
    where result.sitting_id = coalesce(new.id, old.id)
      and result.realm_id is not null
  loop
    perform public.refresh_student_live_maths_progression(
      diagnostic_result.student_id,
      diagnostic_result.realm_id
    );
  end loop;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function public.refresh_live_maths_progression_from_sitting_trigger() from public, anon, authenticated;

drop trigger if exists trg_refresh_live_progression_from_diagnostic_sitting on public.whole_math_diagnostic_sittings;
create trigger trg_refresh_live_progression_from_diagnostic_sitting
after insert or update or delete on public.whole_math_diagnostic_sittings
for each row execute function public.refresh_live_maths_progression_from_sitting_trigger();

-- Drop first: an earlier version of this function returns a different set of
-- columns, and create-or-replace cannot change a function's return type.
drop function if exists public.get_teacher_live_maths_progression(uuid);

create function public.get_teacher_live_maths_progression(p_class_id uuid)
returns table (
  student_id uuid,
  realm_id text,
  strand text,
  current_working_level text,
  official_level numeric,
  official_at timestamptz,
  checkpoint_level numeric,
  checkpoint_source text,
  checkpoint_at timestamptz,
  predicted_level numeric,
  prediction_confidence integer,
  evidence jsonb,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.classes class
    where class.id = p_class_id and public.teacher_belongs_to_auth(class.teacher_id)
  ) then
    raise exception 'Not authorized for this class' using errcode = '42501';
  end if;

  return query
  select
    progression.student_id,
    progression.realm_id,
    progression.strand,
    progression.current_working_level,
    progression.official_level,
    progression.official_at,
    progression.checkpoint_level,
    progression.checkpoint_source,
    progression.checkpoint_at,
    progression.predicted_level,
    progression.prediction_confidence,
    progression.evidence,
    progression.updated_at
  from public.student_live_maths_progression progression
  where progression.class_id = p_class_id
  order by progression.student_id, progression.realm_id;
end;
$$;

revoke all on function public.get_teacher_live_maths_progression(uuid) from public, anon, authenticated;
grant execute on function public.get_teacher_live_maths_progression(uuid) to authenticated;

-- Materialise current students without inventing evidence or changing progress.
do $$
declare
  current_progress record;
begin
  for current_progress in
    select progress.student_id, progress.realm_id
    from public.student_realm_progress progress
    where progress.is_current and progress.realm_id in ('number', 'measurement', 'space', 'statistics')
  loop
    perform public.refresh_student_live_maths_progression(current_progress.student_id, current_progress.realm_id);
  end loop;
end;
$$;

commit;
