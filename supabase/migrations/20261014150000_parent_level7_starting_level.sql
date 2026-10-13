-- Level 7 for parents: parents may choose a Home starting level up to Year 7
-- in any realm (teachers can since 20261007100000). Only the allowed-level
-- checks change; the rest of the function is unchanged from
-- 20260918120000_home_all_realms_and_cross_realm_unlock.sql, and
-- parent_set_home_realm_levels calls this one, so it needs no change.
-- Level 8 is added when it is released (docs/advanced-pathway-levels-7-8.md).
--
-- Safety: stops without changing anything unless the live function body is
-- exactly the 20260918120000 version.
-- Rollback: re-run the 20260918120000 definition of this function.
begin;

do $guard$
begin
  if (
    select md5(p.prosrc) from pg_proc p
    where p.oid = 'public.parent_change_home_starting_level(uuid,text,text)'::regprocedure
  ) is distinct from 'eb564936c11604e43a3d09d3b3cd1e02' then
    raise exception 'parent_change_home_starting_level differs from 20260918120000; nothing was changed. Review before applying.';
  end if;
end
$guard$;

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
  if p_realm_id not in ('number','measurement','space','statistics','pattern','chance') then
    raise exception 'Invalid realm';
  end if;
  if p_assigned_level not in ('Prep','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6','Year 7') then
    raise exception 'Invalid working level';
  end if;
  if p_realm_id = 'statistics' and p_assigned_level = 'Prep' then
    raise exception 'Statistica starts at Year 1';
  end if;
  if p_realm_id in ('pattern', 'chance')
    and p_assigned_level not in ('Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7') then
    raise exception 'This realm supports Year 3 to Year 7';
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


commit;
