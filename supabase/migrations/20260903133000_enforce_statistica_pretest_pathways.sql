begin;

-- Statistica is a six-week live realm. Assessment completion must use its
-- canonical program key and six-week boundary instead of the old generic
-- non-Number fallback (eight weeks).
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
    or p_realm_id not in ('number', 'measurement', 'space', 'statistics')
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
      else '[1,2,3,4,5,6,7,8]'::jsonb
    end;
    effective_progress := effective_progress || jsonb_build_object(
      'current_week', 1,
      'assigned_week', 1,
      'required_weeks', full_program_weeks,
      'optional_weeks', '[]'::jsonb
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

revoke all on function public.complete_realm_assessment(
  uuid, uuid, text, text, text, text, text, uuid, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.complete_realm_assessment(
  uuid, uuid, text, text, text, text, text, uuid, jsonb, jsonb
) to anon, authenticated;

-- Repair Statistica rows created by the two generic fallbacks. Week arrays are
-- constrained to the six-week program, and every program key uses Statistica's
-- suffix so canonical restoration cannot cross into Number Nexus state.
update public.student_realm_progress progress
set
  program_key = public.realm_program_key(progress.working_level, 'statistics'),
  required_weeks = coalesce((
    select jsonb_agg(value order by value)
    from (
      select distinct required_week.value::integer as value
      from jsonb_array_elements_text(coalesce(progress.required_weeks, '[]'::jsonb)) as required_week(value)
      where required_week.value ~ '^[0-9]+$'
        and required_week.value::integer between 1 and 6
    ) valid_weeks
  ), '[]'::jsonb),
  optional_weeks = coalesce((
    select jsonb_agg(value order by value)
    from (
      select distinct optional_week.value::integer as value
      from jsonb_array_elements_text(coalesce(progress.optional_weeks, '[]'::jsonb)) as optional_week(value)
      where optional_week.value ~ '^[0-9]+$'
        and optional_week.value::integer between 1 and 6
    ) valid_weeks
  ), '[]'::jsonb),
  current_week = case when progress.current_week is null then null else least(6, greatest(1, progress.current_week)) end,
  assigned_week = case when progress.assigned_week is null then null else least(6, greatest(1, progress.assigned_week)) end,
  updated_at = now()
where progress.realm_id = 'statistics';

commit;
