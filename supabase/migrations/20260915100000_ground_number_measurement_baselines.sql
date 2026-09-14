begin;

-- Enable the remaining Ground baselines; retain every existing higher-level rule.
create or replace function public.realm_first_level_pretest_enabled(p_realm_id text, p_level text)
returns boolean language sql immutable set search_path = public as $$
  select (p_realm_id in ('number','measurement','space') and p_level = 'Prep')
      or (p_realm_id = 'statistics' and p_level = 'Year 1')
      or (p_realm_id = 'pattern' and p_level = 'Year 3')
      or (p_realm_id = 'chance' and p_level = 'Year 3');
$$;

create or replace function public.complete_realm_assessment(
  p_student_id uuid,
  p_class_id uuid,
  p_realm_id text,
  p_program_key text,
  p_school_year_level text,
  p_working_level text,
  p_assessment_type text,
  p_completion_key uuid,
  p_attempt jsonb default '{}'::jsonb,
  p_progress jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
  actual_class_id uuid;
  effective_progress jsonb := coalesce(p_progress, '{}'::jsonb);
  assessment_percent integer := coalesce(
    nullif(p_attempt->>'score_percent', '')::integer,
    nullif(p_attempt->>'percent', '')::integer,
    0
  );
  full_program_weeks jsonb;
begin
  perform public.assert_student_access(p_student_id);
  select student.class_id into actual_class_id
  from public.students student
  where student.id = p_student_id;

  if p_class_id is distinct from actual_class_id
    or p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance')
    or p_assessment_type not in ('pretest', 'posttest') then
    raise exception 'Student context does not match';
  end if;
  perform pg_advisory_xact_lock(
    hashtextextended(
      p_student_id::text || ':' || p_realm_id || ':' ||
      p_working_level || ':' || p_assessment_type,
      0
    )
  );

  if p_assessment_type = 'pretest'
    and assessment_percent < 50
    and nullif(effective_progress->>'next_working_level', '') is null then
    full_program_weeks := case
      when p_realm_id = 'number' then '[1,2,3,4,5,6,7,8,9,10,11,12]'::jsonb
      when p_realm_id = 'statistics' then '[1,2,3,4,5,6]'::jsonb
      when p_realm_id = 'chance' then '[1,2,3,4,5,6]'::jsonb
      when p_realm_id = 'pattern' then '[1,2,3,4,5,6,7,8]'::jsonb
      else '[1,2,3,4,5,6,7,8]'::jsonb
    end;
    effective_progress := effective_progress || jsonb_build_object(
      'current_week', 1,
      'assigned_week', 1,
      'required_weeks', full_program_weeks,
      'optional_weeks', '[]'::jsonb
    );
  end if;

  -- Every Ground pre-test records a baseline and starts the full program.
  if p_realm_id in ('number','measurement','space') and p_working_level = 'Prep' and p_assessment_type = 'pretest' then
    effective_progress := effective_progress || jsonb_build_object(
      'status', 'ASSIGNED_PROGRAM', 'placement_complete', true,
      'current_week', 1, 'assigned_week', 1,
      'required_weeks', case when p_realm_id='number' then '[1,2,3,4,5,6,7,8,9,10,11,12]'::jsonb else '[1,2,3,4,5,6,7,8]'::jsonb end,
      'optional_weeks', '[]'::jsonb, 'next_working_level', null
    );
  end if;

  insert into public.student_completion_receipts(
    student_id, realm_id, activity_type, completion_key
  ) values (
    p_student_id, p_realm_id, p_assessment_type, p_completion_key
  )
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  perform public.save_realm_assessment(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, p_assessment_type, p_attempt
  );
  perform public.save_student_realm_progress(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, effective_progress
  );

  if p_assessment_type = 'pretest'
    and nullif(effective_progress->>'next_working_level', '') is not null then
    perform public.save_student_realm_progress(
      p_student_id,
      actual_class_id,
      p_realm_id,
      public.realm_program_key(effective_progress->>'next_working_level', p_realm_id),
      p_school_year_level,
      effective_progress->>'next_working_level',
      jsonb_build_object(
        'status', 'ASSIGNED_PROGRAM',
        'current_week', 1,
        'assigned_week', 1,
        'placement_complete', false,
        'required_weeks', '[]'::jsonb,
        'optional_weeks', '[]'::jsonb,
        'unlocked_legends', coalesce(effective_progress->'unlocked_legends', '[]'::jsonb)
      )
    );
  end if;

  return true;
end;
$$;

alter table public.student_realm_placement drop constraint if exists student_realm_placement_ground_entry_check;
alter table public.student_realm_placement add constraint student_realm_placement_ground_entry_check check (
  (assigned_start_level = 'Prep' and (assigned_entry_mode = 'ground_week1' or (realm_id in ('number','measurement','space') and assigned_entry_mode in ('pretest', 'full_level'))))
  or (assigned_start_level <> 'Prep' and assigned_entry_mode <> 'ground_week1')
);

create or replace function public.teacher_reset_pretest(
  p_student_id uuid,
  p_realm_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher uuid := auth.uid();
  v_working_level text;
begin
  if p_realm_id is null or length(trim(p_realm_id)) = 0 then
    raise exception 'realm_id is required';
  end if;
  if not public.teacher_owns_student(p_student_id) then
    raise exception 'not authorized for this student' using errcode = '42501';
  end if;

  select progress.working_level
  into v_working_level
  from public.student_realm_progress progress
  where progress.student_id = p_student_id
    and progress.realm_id = p_realm_id
    and progress.is_current
  limit 1;

  if v_working_level = 'Prep' and p_realm_id not in ('number','measurement','space') then
    raise exception 'Ground Level does not use a pre-test' using errcode = '22023';
  end if;

  update public.student_realm_progress
  set pretest_score = null,
      pretest_completed_at = null,
      required_weeks = '[]'::jsonb,
      optional_weeks = '[]'::jsonb,
      placement_complete = false,
      status = 'ASSIGNED_PROGRAM',
      updated_at = now()
  where student_id = p_student_id
    and realm_id = p_realm_id
    and is_current;

  delete from public.student_realm_assessments
  where student_id = p_student_id
    and realm_id = p_realm_id
    and assessment_type = 'pretest'
    and p_realm_id <> 'space'
    and v_working_level <> 'Prep'
    and working_level <> 'Prep';

  insert into public.teacher_realm_actions (teacher_id, student_id, realm_id, action)
  values (v_teacher, p_student_id, p_realm_id, 'pretest_reset');
end;
$$;

-- Existing learning and historical scores are deliberately not reset or backfilled.


create or replace function public.create_home_student_for_parent(
  p_first_name text,
  p_last_name text,
  p_school_year_level text,
  p_working_level text,
  p_pin text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_first_name text := nullif(trim(p_first_name), '');
  v_last_name text := nullif(trim(p_last_name), '');
  v_student_id uuid := gen_random_uuid();
  v_username text;
  v_explorer_code text;
  v_realm_id text;
  v_ground boolean;
begin
  perform public.assert_parent_role();
  if v_first_name is null or v_last_name is null then
    raise exception 'First and last name are required';
  end if;
  if length(v_first_name) > 60 or length(v_last_name) > 60 then
    raise exception 'Student name is too long';
  end if;
  if p_school_year_level not in ('Prep','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6') then
    raise exception 'Invalid school year level';
  end if;
  if p_working_level not in ('Prep','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6') then
    raise exception 'Invalid working level';
  end if;
  if coalesce(p_pin, '') !~ '^[0-9]{4}$' then
    raise exception 'PIN must contain exactly four digits';
  end if;

  v_username := public.generate_home_student_username(v_first_name, v_last_name);
  v_ground := p_working_level = 'Prep';

  insert into public.students (
    id, display_name, first_name, last_name, username, pin,
    school_year_level, working_level, year_level, class_id, school_id
  ) values (
    v_student_id, v_first_name || ' ' || v_last_name, v_first_name, v_last_name,
    v_username, p_pin, p_school_year_level, p_working_level, p_school_year_level,
    null, null
  );

  insert into public.student_access_credentials (
    student_id, credential_type, credential_secret, created_by
  ) values (v_student_id, 'pin', p_pin, auth.uid());

  v_explorer_code := public.ensure_student_explorer_code_internal(v_student_id, auth.uid());

  insert into public.parent_student_links (
    parent_user_id, student_id, relationship, status, link_method,
    approved_at, approved_by, ended_at, updated_at
  ) values (
    auth.uid(), v_student_id, 'guardian', 'active', 'parent_created_home_student',
    now(), auth.uid(), null, now()
  );

  insert into public.student_access_entitlements (
    student_id, access_source, status, billing_status, starts_at, notes,
    created_by, updated_by
  ) values (
    v_student_id, 'home', 'active', 'free', now(),
    '2026 free Home access - parent-created Home learner', auth.uid(), auth.uid()
  );

  foreach v_realm_id in array array['number','measurement','space']::text[] loop
    insert into public.student_realm_placement (
      student_id, realm_id, assigned_start_level, assigned_entry_mode,
      placement_source, placement_assigned_by, placement_assigned_at, updated_at
    ) values (
      v_student_id, v_realm_id, p_working_level,
      case when v_ground and not public.realm_first_level_pretest_enabled(v_realm_id,p_working_level) then 'ground_week1' else 'pretest' end,
      'parent_home', auth.uid(), now(), now()
    );

    insert into public.student_realm_progress (
      student_id, class_id, realm_id, program_key, school_year_level,
      working_level, is_current, status, current_week, assigned_week,
      placement_complete
    ) values (
      v_student_id, null, v_realm_id,
      public.realm_program_key(p_working_level, v_realm_id),
      p_school_year_level, p_working_level, true, 'ASSIGNED_PROGRAM',
      case when v_ground and not public.realm_first_level_pretest_enabled(v_realm_id,p_working_level) then 1 else null end,
      case when v_ground and not public.realm_first_level_pretest_enabled(v_realm_id,p_working_level) then 1 else null end,
      v_ground and not public.realm_first_level_pretest_enabled(v_realm_id,p_working_level)
    );
  end loop;

  insert into public.student_identity_audit_events (
    actor_user_id, action, student_id, after_state
  ) values (
    auth.uid(), 'home_student_created', v_student_id,
    jsonb_build_object(
      'username', v_username,
      'schoolYearLevel', p_school_year_level,
      'workingLevel', p_working_level,
      'homeAccess', true
    )
  );

  return jsonb_build_object(
    'studentId', v_student_id,
    'displayName', v_first_name || ' ' || v_last_name,
    'username', v_username,
    'explorerCode', v_explorer_code,
    'schoolYearLevel', p_school_year_level,
    'workingLevel', p_working_level,
    'homeAccess', true
  );
end;
$$;

create or replace function public.parent_change_home_starting_level(
  p_student_id uuid,
  p_realm_id text,
  p_assigned_level text
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_school_year_level text;
  v_ground boolean;
begin
  perform public.assert_parent_role();
  if not public.parent_can_manage_home_student(p_student_id) then
    raise exception 'Home student management has transferred to the school' using errcode = '42501';
  end if;
  if p_realm_id not in ('number','measurement','space') then
    raise exception 'Invalid realm';
  end if;
  if p_assigned_level not in ('Prep','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6') then
    raise exception 'Invalid working level';
  end if;
  if exists (
    select 1 from public.student_lesson_attempts attempt
    where attempt.student_id = p_student_id and attempt.realm_id = p_realm_id
    union all
    select 1 from public.student_weekly_quiz_attempts attempt
    where attempt.student_id = p_student_id and attempt.realm_id = p_realm_id
    union all
    select 1 from public.student_realm_assessments assessment
    where assessment.student_id = p_student_id and assessment.realm_id = p_realm_id
      and assessment.assessment_type = 'posttest'
  ) then
    raise exception 'Starting level cannot change after canonical learning has begun';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_student_id::text || ':' || p_realm_id, 0));
  select school_year_level into v_school_year_level from public.students where id = p_student_id;
  v_ground := p_assigned_level = 'Prep' and not public.realm_first_level_pretest_enabled(p_realm_id,p_assigned_level);

  update public.student_realm_progress
  set is_current = false, updated_at = now()
  where student_id = p_student_id and realm_id = p_realm_id and is_current;

  insert into public.student_realm_placement (
    student_id, realm_id, assigned_start_level, assigned_entry_mode,
    placement_source, placement_assigned_by, placement_assigned_at, updated_at
  ) values (
    p_student_id, p_realm_id, p_assigned_level,
    case when v_ground then 'ground_week1' else 'pretest' end,
    'parent_home', auth.uid(), now(), now()
  ) on conflict (student_id, realm_id) do update set
    assigned_start_level = excluded.assigned_start_level,
    assigned_entry_mode = excluded.assigned_entry_mode,
    placement_source = 'parent_home',
    placement_assigned_by = auth.uid(),
    placement_assigned_at = now(),
    updated_at = now();

  insert into public.student_realm_progress (
    student_id, class_id, realm_id, program_key, school_year_level,
    working_level, is_current, status, current_week, assigned_week,
    placement_complete, pretest_score, pretest_completed_at,
    required_weeks, optional_weeks
  ) values (
    p_student_id, null, p_realm_id,
    public.realm_program_key(p_assigned_level, p_realm_id),
    v_school_year_level, p_assigned_level, true, 'ASSIGNED_PROGRAM',
    case when v_ground then 1 else null end,
    case when v_ground then 1 else null end,
    v_ground, null, null, '[]'::jsonb, '[]'::jsonb
  ) on conflict (student_id, realm_id, working_level) do update set
    is_current = true,
    status = 'ASSIGNED_PROGRAM',
    current_week = excluded.current_week,
    assigned_week = excluded.assigned_week,
    placement_complete = excluded.placement_complete,
    pretest_score = null,
    pretest_completed_at = null,
    required_weeks = '[]'::jsonb,
    optional_weeks = '[]'::jsonb,
    updated_at = now();

  insert into public.student_identity_audit_events (
    actor_user_id, action, student_id, after_state
  ) values (
    auth.uid(), 'home_starting_level_changed', p_student_id,
    jsonb_build_object('realmId', p_realm_id, 'workingLevel', p_assigned_level)
  );
end;
$$;

-- Keep baseline history visible through secure reads after explicit reopening.
create or replace function public.get_student_realm_assessments_secure(
  p_student_id uuid,
  p_realm_id text,
  p_working_level text default null
)
returns setof public.student_realm_assessments
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_student_read(p_student_id);
  return query
  select assessment.*
  from public.student_realm_assessments assessment
  where assessment.student_id = p_student_id
    and assessment.realm_id = p_realm_id
    and (p_working_level is null or assessment.working_level = p_working_level)
    and (
      assessment.assessment_type <> 'pretest'
      or assessment.realm_id = 'space'
      or (assessment.working_level = 'Prep' and assessment.realm_id in ('number','measurement'))
      or assessment.completed_at > coalesce((
        select max(reopen.reopened_at)
        from public.student_pretest_reopen_events reopen
        where reopen.student_id = assessment.student_id
          and reopen.realm_id = assessment.realm_id
      ), '-infinity'::timestamptz)
    )
  order by assessment.completed_at desc;
end;
$$;

create or replace function public.get_school_analytics_snapshot(
  p_school_id uuid,
  p_academic_year_id uuid,
  p_days integer default 30,
  p_year_level text default null,
  p_class_id uuid default null,
  p_realm_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_days integer := greatest(7, least(coalesce(p_days, 30), 90));
  v_since timestamptz;
  v_result jsonb;
  v_can_view_administration boolean;
begin
  v_can_view_administration := public.can_view_school_administration(p_school_id);

  if not (
    v_can_view_administration
    or public.has_school_role(p_school_id, array['teacher'])
  ) then
    raise exception 'School analytics access denied' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.academic_years ay
    where ay.id = p_academic_year_id
      and ay.school_id = p_school_id
  ) then
    raise exception 'Academic year does not belong to this school' using errcode = '22023';
  end if;

  v_since := now() - make_interval(days => v_days);

  with
  cohort as (
    select distinct on (s.id)
      s.id as student_id,
      coalesce(nullif(s.display_name, ''), nullif(concat_ws(' ', s.first_name, s.last_name), ''), s.username, 'Student') as student_name,
      coalesce(s.school_year_level, s.year_level) as year_level,
      ce.class_id,
      c.name as class_name
    from public.student_access_entitlements sae
    join public.students s on s.id = sae.student_id and s.archived_at is null
    left join lateral (
      select enrolment.class_id
      from public.class_enrollments enrolment
      where enrolment.student_id = s.id
        and enrolment.school_id = p_school_id
        and enrolment.academic_year_id = p_academic_year_id
        and enrolment.status = 'active'
        and enrolment.ended_at is null
      order by enrolment.is_primary desc, enrolment.enrolled_at desc
      limit 1
    ) ce on true
    left join public.classes c on c.id = ce.class_id
    where sae.access_source = 'school'
      and sae.school_id = p_school_id
      and sae.academic_year_id = p_academic_year_id
      and sae.status = 'active'
      and sae.starts_at <= now()
      and (sae.ends_at is null or sae.ends_at >= now())
      and (p_year_level is null or coalesce(s.school_year_level, s.year_level) = p_year_level)
      and (p_class_id is null or ce.class_id = p_class_id)
    order by s.id
  ),
  canonical_lessons as (
    select distinct on (a.student_id, a.realm_id, a.working_level, a.week, a.lesson)
      a.student_id, a.realm_id, a.working_level, a.week, a.lesson,
      a.topic_focus, a.accuracy_percent::numeric as accuracy_percent,
      a.completed_at as activity_at
    from public.student_lesson_attempts a
    join cohort co on co.student_id = a.student_id
    where a.completed
      and a.completed_at >= v_since
      and (p_realm_id is null or a.realm_id = p_realm_id)
    order by a.student_id, a.realm_id, a.working_level, a.week, a.lesson,
      a.completed_at desc, a.attempt_no desc
  ),
  canonical_quizzes as (
    select distinct on (a.student_id, a.realm_id, a.working_level, a.week)
      a.student_id, a.realm_id, a.working_level, a.week,
      a.accuracy_percent::numeric as accuracy_percent,
      a.completed_at as activity_at
    from public.student_weekly_quiz_attempts a
    join cohort co on co.student_id = a.student_id
    where a.completed_at >= v_since
      and (p_realm_id is null or a.realm_id = p_realm_id)
    order by a.student_id, a.realm_id, a.working_level, a.week,
      a.completed_at desc, a.attempt_no desc
  ),
  latest_assessments as (
    select distinct on (a.student_id, a.realm_id, a.working_level, lower(a.assessment_type))
      a.student_id, a.realm_id, a.working_level,
      lower(a.assessment_type) as assessment_type,
      a.score_percent::numeric as score_percent,
      a.completed_at
    from public.student_realm_assessments a
    join cohort co on co.student_id = a.student_id
    where (p_realm_id is null or a.realm_id = p_realm_id)
    order by a.student_id, a.realm_id, a.working_level, lower(a.assessment_type), a.completed_at desc
  ),
  realm_latest_assessment as (
    -- Most recent assessment per student x realm: the placement pre-test, then
    -- each level's post-test. This is the "where they are" signal for achievement
    -- bands (lesson practice accuracy is NOT used for banding).
    select distinct on (student_id, realm_id)
      student_id, realm_id, working_level, assessment_type, score_percent, completed_at
    from latest_assessments
    order by student_id, realm_id, completed_at desc
  ),
  paired_growth as (
    select post.student_id, post.realm_id, post.working_level,
      pre.score_percent::numeric as pre_score, post.score_percent as post_score,
      post.score_percent - pre.score_percent as growth, post.completed_at
    from latest_assessments post
    join lateral (
      select a.score_percent, a.completed_at, a.placement_result
      from public.student_realm_assessments a
      where a.student_id = post.student_id and a.realm_id = post.realm_id
        and a.working_level = post.working_level
        and lower(a.assessment_type) in ('pre', 'pretest', 'pre-test')
      order by a.completed_at, a.id
      limit 1
    ) pre on pre.completed_at < post.completed_at
    where (post.realm_id = 'space' or (post.working_level = 'Prep' and post.realm_id in ('number','measurement')))
      and post.assessment_type in ('post', 'posttest', 'post-test')
      and post.completed_at >= v_since
      and ((
        pre.placement_result #>> '{assessment_evidence,comparison_group}' is not null
        and pre.placement_result #>> '{assessment_evidence,comparison_group}' = (
          select a.placement_result #>> '{assessment_evidence,comparison_group}'
          from public.student_realm_assessments a
          where a.student_id = post.student_id and a.realm_id = post.realm_id
            and a.working_level = post.working_level
            and lower(a.assessment_type) in ('post', 'posttest', 'post-test')
            and a.completed_at = post.completed_at
          order by a.id limit 1
        )
      ))
    union all
    -- Preserve the existing latest-pre/latest-post reporting for other realms.
    select pre.student_id, pre.realm_id, pre.working_level,
      pre.score_percent as pre_score, post.score_percent as post_score,
      post.score_percent - pre.score_percent as growth, post.completed_at
    from latest_assessments pre
    join latest_assessments post
      on post.student_id = pre.student_id
      and post.realm_id = pre.realm_id
      and post.working_level = pre.working_level
    where not (pre.realm_id = 'space' or (pre.working_level = 'Prep' and pre.realm_id in ('number','measurement')))
      and pre.assessment_type in ('pre', 'pretest', 'pre-test')
      and post.assessment_type in ('post', 'posttest', 'post-test')
      and post.completed_at >= v_since
  ),
  activity as (
    select student_id, realm_id, working_level, accuracy_percent, activity_at, 'lesson'::text as kind
    from canonical_lessons
    union all
    select student_id, realm_id, working_level, accuracy_percent, activity_at, 'quiz'::text
    from canonical_quizzes
    union all
    select student_id, realm_id, working_level, score_percent, completed_at, 'assessment'::text
    from latest_assessments
    where completed_at >= v_since
  ),
  recent_7d as (
    select * from activity where activity_at >= now() - interval '7 days'
  ),
  recent_14d as (
    select * from activity where activity_at >= now() - interval '14 days'
  ),
  lesson_7d as (
    select student_id, count(*) as lesson_count
    from canonical_lessons
    where activity_at >= now() - interval '7 days'
    group by student_id
  ),
  latest_evidence as (
    select distinct on (student_id) student_id, accuracy_percent, activity_at
    from recent_14d
    order by student_id, activity_at desc
  ),
  realm_summary as (
    select
      r.realm_id,
      count(distinct r.student_id) as active_students,
      round(avg(r.accuracy_percent), 1) as average_accuracy,
      count(*) filter (where r.kind = 'lesson') as lessons,
      count(*) filter (where r.kind = 'quiz') as quizzes
    from activity r
    group by r.realm_id
  ),
  student_activity_summary as (
    select
      a.student_id,
      max(a.activity_at) as last_active,
      round(avg(a.accuracy_percent), 1) as average_accuracy,
      count(distinct a.realm_id) as realms_used,
      count(distinct a.activity_at::date) as learning_days,
      bool_or(a.activity_at >= now() - interval '7 days') as active_this_week
    from activity a
    group by a.student_id
  ),
  student_growth_summary as (
    select
      pg.student_id,
      round(avg(pg.growth), 1) as average_growth
    from paired_growth pg
    group by pg.student_id
  ),
  current_progress as (
    select distinct on (srp.student_id, srp.realm_id)
      srp.student_id,
      srp.realm_id,
      srp.working_level,
      srp.current_week,
      srp.status,
      srp.pretest_score::numeric as pretest_score,
      srp.posttest_score::numeric as posttest_score
    from public.student_realm_progress srp
    join cohort co on co.student_id = srp.student_id
    where srp.is_current
      and (p_realm_id is null or srp.realm_id = p_realm_id)
    order by srp.student_id, srp.realm_id, srp.updated_at desc
  ),
  mastered_realms as (
    select la.student_id, la.realm_id, la.working_level, la.score_percent
    from latest_assessments la
    where la.assessment_type in ('post', 'posttest', 'post-test')
      and la.score_percent >= 85
  ),
  student_mastery_summary as (
    select student_id, count(*) as mastered_levels
    from mastered_realms
    group by student_id
  ),
  student_realm_keys as (
    select distinct student_id, realm_id from activity
    union
    select distinct student_id, realm_id from current_progress
  ),
  student_realm_activity as (
    select
      student_id,
      realm_id,
      round(avg(accuracy_percent), 1) as average_accuracy,
      count(*) as activities,
      max(working_level) as evidence_level
    from activity
    group by student_id, realm_id
  ),
  student_realm_summary as (
    select
      keys.student_id,
      jsonb_agg(jsonb_build_object(
        'realmId', keys.realm_id,
        'averageAccuracy', sra.average_accuracy,
        'activities', coalesce(sra.activities, 0),
        'currentLevel', coalesce(cp.working_level, sra.evidence_level),
        'currentWeek', cp.current_week,
        'pathwayStatus', cp.status,
        'pretestScore', cp.pretest_score,
        'posttestScore', cp.posttest_score,
        'assessmentScore', rla.score_percent,
        'assessmentLevel', rla.working_level,
        'assessmentType', rla.assessment_type,
        'mastered', exists (
          select 1 from mastered_realms mr
          where mr.student_id = keys.student_id and mr.realm_id = keys.realm_id
        ),
        'growth', (
          select round(avg(pg.growth), 1)
          from paired_growth pg
          where pg.student_id = keys.student_id and pg.realm_id = keys.realm_id
        )
      ) order by keys.realm_id) as realms
    from student_realm_keys keys
    left join student_realm_activity sra
      on sra.student_id = keys.student_id and sra.realm_id = keys.realm_id
    left join current_progress cp
      on cp.student_id = keys.student_id and cp.realm_id = keys.realm_id
    left join realm_latest_assessment rla
      on rla.student_id = keys.student_id and rla.realm_id = keys.realm_id
    group by keys.student_id
  ),
  class_summary as (
    select
      co.class_id,
      co.class_name,
      count(*) as students,
      count(*) filter (where sas.active_this_week) as active_students,
      count(*) filter (where coalesce(l7.lesson_count, 0) >= 3) as weekly_target_met,
      coalesce(sum(sms.mastered_levels), 0) as mastered_levels,
      round(avg(sas.average_accuracy), 1) as average_accuracy,
      round(avg(sgs.average_growth), 1) as average_growth
    from cohort co
    left join student_activity_summary sas on sas.student_id = co.student_id
    left join student_growth_summary sgs on sgs.student_id = co.student_id
    left join lesson_7d l7 on l7.student_id = co.student_id
    left join student_mastery_summary sms on sms.student_id = co.student_id
    group by co.class_id, co.class_name
  ),
  student_summary as (
    select
      co.student_id, co.student_name, co.year_level, co.class_id, co.class_name,
      sas.last_active,
      sas.average_accuracy,
      coalesce(sas.realms_used, 0) as realms_used,
      coalesce(sas.learning_days, 0) as learning_days,
      coalesce(sas.active_this_week, false) as active_this_week,
      coalesce(l7.lesson_count, 0) >= 3 as weekly_target_met,
      coalesce(sms.mastered_levels, 0) as mastered_levels,
      case
        when coalesce(sas.active_this_week, false) and coalesce(le.accuracy_percent, 0) >= 80 then 'on_track'
        when coalesce(sas.active_this_week, false) then 'active'
        else 'needs_attention'
      end as status,
      sgs.average_growth,
      coalesce(srs.realms, '[]'::jsonb) as realms
    from cohort co
    left join student_activity_summary sas on sas.student_id = co.student_id
    left join student_growth_summary sgs on sgs.student_id = co.student_id
    left join student_realm_summary srs on srs.student_id = co.student_id
    left join lesson_7d l7 on l7.student_id = co.student_id
    left join student_mastery_summary sms on sms.student_id = co.student_id
    left join latest_evidence le on le.student_id = co.student_id
  )
  select jsonb_build_object(
    'generatedAt', now(),
    'windowDays', v_days,
    'filters', jsonb_build_object(
      'yearLevel', p_year_level,
      'classId', p_class_id,
      'realmId', p_realm_id
    ),
    'overview', jsonb_build_object(
      'students', (select count(*) from cohort),
      'activeThisWeek', (select count(distinct student_id) from recent_7d),
      'weeklyTargetMet', (select count(*) from lesson_7d where lesson_count >= 3),
      'onTrack', (select count(*) from latest_evidence where accuracy_percent >= 80),
      'levelsMastered', (select count(*) from latest_assessments where score_percent >= 85 and assessment_type in ('post','posttest','post-test')),
      'averageGrowth', (select round(avg(growth), 1) from paired_growth),
      'matchedGrowthPairs', (select count(*) from paired_growth)
    ),
    'realms', coalesce((select jsonb_agg(jsonb_build_object(
      'realmId', realm_id,
      'activeStudents', active_students,
      'averageAccuracy', average_accuracy,
      'lessons', lessons,
      'quizzes', quizzes,
      'averageGrowth', (select round(avg(pg.growth), 1) from paired_growth pg where pg.realm_id = rs.realm_id)
    ) order by realm_id) from realm_summary rs), '[]'::jsonb),
    'growthTrend', coalesce((select jsonb_agg(jsonb_build_object(
      'date', day::date,
      'averageGrowth', average_growth,
      'matchedPairs', matched_pairs
    ) order by day) from (
      select date_trunc('day', completed_at) as day, round(avg(growth), 1) as average_growth, count(*) as matched_pairs
      from paired_growth group by date_trunc('day', completed_at)
    ) trend), '[]'::jsonb),
    'engagementTrend', coalesce((select jsonb_agg(jsonb_build_object(
      'date', day::date,
      'activeStudents', active_students,
      'activities', activities
    ) order by day) from (
      select activity_at::date as day, count(distinct student_id) as active_students, count(*) as activities
      from activity group by activity_at::date
    ) trend), '[]'::jsonb),
    'engagement', jsonb_build_object(
      'activeLearners', (select count(distinct student_id) from activity),
      'averageLearningDays', (select round(avg(days), 1) from (select count(distinct activity_at::date) days from activity group by student_id) d),
      'returningLearners', (select count(*) from (select student_id from activity group by student_id having count(distinct activity_at::date) >= 2) r),
      'lessonsCompleted', (select count(*) from canonical_lessons),
      'quizzesCompleted', (select count(*) from canonical_quizzes)
    ),
    'curriculum', coalesce((select jsonb_agg(jsonb_build_object(
      'topic', topic,
      'yearLevel', year_level,
      'realmId', realm_id,
      'students', students,
      'evidenceCount', evidence_count,
      'averageAccuracy', average_accuracy
    ) order by realm_id, year_level) from (
      select
        case la.working_level when 'Prep' then 'Ground post-test'
          else 'Level ' || replace(la.working_level, 'Year ', '') || ' post-test' end as topic,
        la.working_level as year_level, la.realm_id as realm_id,
        count(distinct la.student_id) as students, count(*) as evidence_count,
        round(avg(la.score_percent), 1) as average_accuracy
      from latest_assessments la
      where la.assessment_type in ('post', 'posttest', 'post-test')
      group by la.working_level, la.realm_id
    ) topics), '[]'::jsonb),
    'classes', coalesce((select jsonb_agg(jsonb_build_object(
      'id', class_id, 'name', coalesce(class_name, 'Not assigned'), 'students', students,
      'activeStudents', active_students, 'weeklyTargetMet', weekly_target_met,
      'masteredLevels', mastered_levels, 'averageAccuracy', average_accuracy, 'averageGrowth', average_growth
    ) order by class_name nulls last) from class_summary), '[]'::jsonb),
    -- Anonymous working-level evidence powers whole-school placement and
    -- intervention visuals without disclosing another class's students.
    'analysisStudents', coalesce((select jsonb_agg(jsonb_build_object(
      'yearLevel', summary.year_level,
      'realms', coalesce((
        select jsonb_agg(jsonb_build_object(
          'realmId', realm->>'realmId',
          'currentLevel', realm->>'currentLevel',
          'pretestScore', realm->'pretestScore'
        ))
        from jsonb_array_elements(summary.realms) realm
      ), '[]'::jsonb)
    )) from student_summary summary), '[]'::jsonb),
    'students', coalesce((select jsonb_agg(jsonb_build_object(
      'id', student_id, 'name', student_name, 'yearLevel', year_level,
      'classId', class_id, 'className', coalesce(class_name, 'Not assigned'),
      'lastActive', last_active, 'averageAccuracy', average_accuracy,
      'realmsUsed', realms_used, 'learningDays', learning_days,
      'activeThisWeek', active_this_week, 'weeklyTargetMet', weekly_target_met,
      'masteredLevels', mastered_levels, 'status', status,
      'averageGrowth', average_growth, 'realms', realms
    ) order by student_name)
      from student_summary
      where v_can_view_administration
        or public.can_view_student(student_id)
    ), '[]'::jsonb),
    'methodology', jsonb_build_object(
      'weeklyTarget', 'At least 3 unique completed lessons in the last 7 days.',
      'onTrack', 'Canonical activity in the last 14 days with latest lesson, quiz or assessment evidence at 80% or higher.',
      'mastery', 'Latest post-test score of 85% or higher.',
      'growth', 'Space and Ground Number/Measurement: later post-test minus first compatible-version baseline at the same working level. Other levels retain latest post-test minus latest pre-test.',
      'lessonDeduplication', '(student, realm, level, week, lesson)',
      'quizDeduplication', '(student, realm, level, week)'
    )
  ) into v_result;

  return v_result;
end;
$$;
commit;
