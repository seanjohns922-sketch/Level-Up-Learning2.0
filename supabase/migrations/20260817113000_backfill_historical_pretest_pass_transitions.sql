-- Pre-test passes recorded before complete_realm_assessment created the next
-- level can remain parked on a PASSED current row. Repair only untouched
-- historical placements; later teacher placements and existing progress win.
do $$
declare
  candidate record;
  next_working_level text;
begin
  for candidate in
    with latest_passes as (
      select distinct on (assessment.student_id, assessment.realm_id, assessment.working_level)
        assessment.student_id,
        assessment.realm_id,
        assessment.working_level,
        assessment.completed_at
      from public.student_realm_assessments assessment
      where assessment.assessment_type = 'pretest'
        and assessment.passed = true
        and assessment.completed_at < '2026-07-17'::timestamptz
        and assessment.realm_id in ('number', 'measurement')
        and assessment.working_level ~ '^Year [0-5]$'
      order by
        assessment.student_id,
        assessment.realm_id,
        assessment.working_level,
        assessment.completed_at desc
    )
    select progress.*
    from latest_passes pass
    join public.student_realm_progress progress
      on progress.student_id = pass.student_id
     and progress.realm_id = pass.realm_id
     and progress.working_level = pass.working_level
     and progress.is_current = true
     and progress.status = 'PASSED'
    where not exists (
      select 1
      from public.student_realm_progress next_progress
      where next_progress.student_id = progress.student_id
        and next_progress.realm_id = progress.realm_id
        and next_progress.working_level =
          'Year ' || ((substring(progress.working_level from '[0-9]+'))::integer + 1)
    )
  loop
    next_working_level :=
      'Year ' || ((substring(candidate.working_level from '[0-9]+'))::integer + 1);

    update public.student_realm_progress
    set is_current = false
    where id = candidate.id
      and is_current = true;

    insert into public.student_realm_progress (
      student_id,
      class_id,
      realm_id,
      program_key,
      school_year_level,
      working_level,
      is_current,
      status,
      current_week,
      assigned_week,
      placement_complete,
      required_weeks,
      optional_weeks,
      unlocked_legends
    ) values (
      candidate.student_id,
      candidate.class_id,
      candidate.realm_id,
      lower(replace(next_working_level, ' ', '')) ||
        case
          when candidate.realm_id = 'measurement' then '-measurelands'
          else '-number'
        end,
      candidate.school_year_level,
      next_working_level,
      true,
      'ASSIGNED_PROGRAM',
      1,
      1,
      false,
      '[]'::jsonb,
      '[]'::jsonb,
      coalesce(candidate.unlocked_legends, '[]'::jsonb)
    );
  end loop;
end;
$$;
