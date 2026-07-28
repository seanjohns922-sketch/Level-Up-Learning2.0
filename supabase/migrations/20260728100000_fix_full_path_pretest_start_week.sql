begin;

-- A pre-test below 50% assigns the complete program. The full program always
-- begins at Week 1; diagnostic skill mappings only choose a starting week for
-- targeted pathways.
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
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id
    or p_realm_id not in ('number', 'measurement', 'space')
    or p_assessment_type not in ('pretest', 'posttest') then
    raise exception 'Student context does not match';
  end if;

  if p_assessment_type = 'pretest'
    and assessment_percent < 50
    and nullif(effective_progress->>'next_working_level', '') is null then
    full_program_weeks := case
      when p_realm_id = 'number' then '[1,2,3,4,5,6,7,8,9,10,11,12]'::jsonb
      else '[1,2,3,4,5,6,7,8]'::jsonb
    end;
    effective_progress := effective_progress || jsonb_build_object(
      'current_week', 1,
      'assigned_week', 1,
      'required_weeks', full_program_weeks,
      'optional_weeks', '[]'::jsonb
    );
  end if;

  insert into public.student_completion_receipts(student_id, realm_id, activity_type, completion_key)
  values (p_student_id, p_realm_id, p_assessment_type, p_completion_key)
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
      lower(replace(effective_progress->>'next_working_level', ' ', '')) ||
        case when p_realm_id = 'measurement' then '-measurelands'
             when p_realm_id = 'space' then '-starpath'
             else '-number' end,
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

-- Repair only untouched full-path placements. Genuine lesson/quiz work and
-- explicit teacher advancement are authoritative and must never be rolled back.
update public.student_realm_progress progress
set
  current_week = 1,
  assigned_week = 1,
  required_weeks = case
    when progress.realm_id = 'number' then '[1,2,3,4,5,6,7,8,9,10,11,12]'::jsonb
    else '[1,2,3,4,5,6,7,8]'::jsonb
  end,
  optional_weeks = '[]'::jsonb,
  updated_at = now()
where progress.realm_id in ('number', 'measurement', 'space')
  and progress.pretest_score < 50
  and progress.placement_complete
  and greatest(
    coalesce(progress.current_week, 1),
    coalesce(progress.assigned_week, 1)
  ) > 1
  and not exists (
    select 1
    from public.student_lesson_attempts attempt
    where attempt.student_id = progress.student_id
      and attempt.realm_id = progress.realm_id
      and attempt.working_level = progress.working_level
  )
  and not exists (
    select 1
    from public.student_weekly_quiz_attempts attempt
    where attempt.student_id = progress.student_id
      and attempt.realm_id = progress.realm_id
      and attempt.working_level = progress.working_level
  )
  and not exists (
    select 1
    from public.student_progress_overrides override_row
    where override_row.student_id = progress.student_id
      and override_row.realm_id = progress.realm_id
      and override_row.working_level = progress.working_level
  );

commit;
