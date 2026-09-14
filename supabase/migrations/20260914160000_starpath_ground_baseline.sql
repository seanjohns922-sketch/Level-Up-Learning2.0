begin;

-- Keep all existing entry-test realms enabled; add only Ground Space.
create or replace function public.realm_first_level_pretest_enabled(p_realm_id text, p_level text)
returns boolean language sql immutable set search_path = public as $$
  select (p_realm_id = 'space' and p_level = 'Prep')
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

  -- Ground Space is baseline evidence, never automatic placement advancement.
  if p_realm_id = 'space' and p_working_level = 'Prep' and p_assessment_type = 'pretest' then
    effective_progress := effective_progress || jsonb_build_object(
      'status', 'ASSIGNED_PROGRAM', 'placement_complete', true,
      'current_week', 1, 'assigned_week', 1,
      'required_weeks', '[1,2,3,4,5,6,7,8]'::jsonb,
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
  (assigned_start_level = 'Prep' and (assigned_entry_mode = 'ground_week1' or (realm_id = 'space' and assigned_entry_mode in ('pretest', 'full_level'))))
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

  if v_working_level = 'Prep' and p_realm_id <> 'space' then
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
    and p_realm_id <> 'space';

  insert into public.teacher_realm_actions (teacher_id, student_id, realm_id, action)
  values (v_teacher, p_student_id, p_realm_id, 'pretest_reset');
end;
$$;

-- Existing learning and historical scores are deliberately not reset or backfilled.
commit;
