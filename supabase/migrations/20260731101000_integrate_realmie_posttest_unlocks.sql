begin;

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
  saved_assessment_id uuid;
begin
  perform public.assert_student_access(p_student_id);
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id
    or p_realm_id not in ('number', 'measurement', 'space')
    or p_assessment_type not in ('pretest', 'posttest') then
    raise exception 'Student context does not match';
  end if;

  -- Serialise assessment completion for this exact student scope. This makes
  -- the canonical assessment selected below unambiguous under concurrent calls.
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
  )
  values (p_student_id, p_realm_id, p_assessment_type, p_completion_key)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then
    return false;
  end if;

  perform public.save_realm_assessment(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, p_assessment_type, p_attempt
  );
  perform public.save_student_realm_progress(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, effective_progress
  );

  if p_assessment_type = 'posttest' then
    select assessment.id
    into saved_assessment_id
    from public.student_realm_assessments assessment
    where assessment.student_id = p_student_id
      and assessment.realm_id = p_realm_id
      and assessment.working_level = p_working_level
      and assessment.assessment_type = 'posttest'
    order by assessment.created_at desc, assessment.id desc
    limit 1;

    if saved_assessment_id is null then
      raise exception 'Canonical post-test persistence failed';
    end if;

    perform public.grant_standard_realmie_for_canonical_posttest(
      p_student_id,
      p_realm_id,
      p_working_level,
      saved_assessment_id,
      p_completion_key,
      false
    );
  end if;

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

revoke all on function public.complete_realm_assessment(
  uuid, uuid, text, text, text, text, text, uuid, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.complete_realm_assessment(
  uuid, uuid, text, text, text, text, text, uuid, jsonb, jsonb
) to anon, authenticated;

create or replace function public.backfill_standard_realmies_internal()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_candidate record;
  v_result jsonb;
  v_students_examined integer;
  v_candidate_completions integer;
  v_eligible_completions integer := 0;
  v_realmies_granted integer := 0;
  v_already_owned integer := 0;
  v_skipped_records integer := 0;
  v_conflicts integer := 0;
begin
  select count(distinct progress.student_id), count(*)
  into v_students_examined, v_candidate_completions
  from public.student_realm_progress progress
  where progress.realm_id in ('number', 'measurement', 'space')
    and progress.working_level in (
      'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'
    );

  for v_candidate in
    select
      progress.student_id,
      progress.realm_id,
      progress.working_level,
      assessment.id as assessment_id
    from public.student_realm_progress progress
    join lateral (
      select candidate.id
      from public.student_realm_assessments candidate
      where candidate.student_id = progress.student_id
        and candidate.realm_id = progress.realm_id
        and candidate.working_level = progress.working_level
        and candidate.assessment_type = 'posttest'
        and candidate.score_percent >= 85
        and candidate.passed is true
      order by candidate.completed_at desc, candidate.id desc
      limit 1
    ) assessment on true
    where progress.realm_id in ('number', 'measurement', 'space')
      and progress.working_level in (
        'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'
      )
      and progress.posttest_score >= 85
      and progress.posttest_completed_at is not null
      and progress.status = 'PASSED'
  loop
    v_eligible_completions := v_eligible_completions + 1;

    begin
      v_result := public.grant_standard_realmie_for_canonical_posttest(
        v_candidate.student_id,
        v_candidate.realm_id,
        v_candidate.working_level,
        v_candidate.assessment_id,
        v_candidate.assessment_id,
        true
      );

      if coalesce((v_result->>'granted')::boolean, false) then
        v_realmies_granted := v_realmies_granted + 1;
      else
        v_already_owned := v_already_owned + 1;
      end if;
    exception
      when others then
        v_conflicts := v_conflicts + 1;
        raise warning
          'Realmies backfill skipped student %, realm %, level %: %',
          v_candidate.student_id,
          v_candidate.realm_id,
          v_candidate.working_level,
          sqlerrm;
    end;
  end loop;

  v_skipped_records := greatest(
    coalesce(v_candidate_completions, 0) - v_eligible_completions,
    0
  ) + v_conflicts;

  return jsonb_build_object(
    'students_examined', coalesce(v_students_examined, 0),
    'candidate_completions', coalesce(v_candidate_completions, 0),
    'eligible_completions', v_eligible_completions,
    'realmies_granted', v_realmies_granted,
    'already_owned', v_already_owned,
    'skipped_records', v_skipped_records,
    'conflicts_or_invalid_mappings', v_conflicts
  );
end;
$$;

revoke all on function public.backfill_standard_realmies_internal()
  from public, anon, authenticated;

do $$
declare
  v_backfill_result jsonb;
begin
  v_backfill_result := public.backfill_standard_realmies_internal();
  raise notice 'Realmies R2 backfill result: %', v_backfill_result;
end;
$$;

commit;
