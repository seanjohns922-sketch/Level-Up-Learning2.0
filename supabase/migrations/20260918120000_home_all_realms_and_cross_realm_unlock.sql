begin;

-- Home learners get the full service: all six live realms, not the three that
-- happened to exist when Home onboarding shipped (2026-08-13). Teacher
-- placement RPCs were widened as each realm launched; the parent path was
-- never revisited, so a parent could not set a starting level for Statistica,
-- Pattern Peaks or Chance Hollow. Realm ACCESS was never restricted — this
-- closes the setup gap, and adds the read the student surfaces need to unlock
-- realms by evidence rather than sending a young learner to a pre-test that
-- does not exist.
--
-- Curriculum floors are unchanged and still authoritative: Number,
-- Measurelands and Starpath start at Ground, Statistica at Year 1, Pattern
-- Peaks and Chance Hollow at Year 3 (public.realm_first_level).

-- Shared level ordering. The Prep -> Year 6 case expression was repeated in
-- several migrations; name it once so floor comparisons read clearly.
create or replace function public.curriculum_level_index(p_level text)
returns integer
language sql
immutable
set search_path = public
as $$
  select case p_level
    when 'Prep' then 0
    when 'Foundation' then 0
    when 'Year 1' then 1
    when 'Year 2' then 2
    when 'Year 3' then 3
    when 'Year 4' then 4
    when 'Year 5' then 5
    when 'Year 6' then 6
    when 'Year 7' then 7
    when 'Year 8' then 8
    else null
  end;
$$;

-- Parent starting-level changes: widened to every live realm, with the same
-- floor messages the teacher RPC already raises so both surfaces explain a
-- rejection identically. Everything else is unchanged.
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
  if p_assigned_level not in ('Prep','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6') then
    raise exception 'Invalid working level';
  end if;
  if p_realm_id = 'statistics' and p_assigned_level = 'Prep' then
    raise exception 'Statistica starts at Year 1';
  end if;
  if p_realm_id in ('pattern', 'chance')
    and p_assigned_level not in ('Year 3', 'Year 4', 'Year 5', 'Year 6') then
    raise exception 'This realm supports Year 3 to Year 6';
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

-- Confirm starting levels for any subset of live realms in one transaction.
-- parent_set_home_starting_levels(uuid,text,text,text) takes three fixed realm
-- arguments and is already applied, so this is a new function keyed on a
-- realm -> level object. Any invalid or disallowed placement rolls the whole
-- object back rather than leaving onboarding half applied.
create or replace function public.parent_set_home_realm_levels(
  p_student_id uuid,
  p_levels jsonb
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_realm_id text;
  v_level text;
  v_applied integer := 0;
begin
  perform public.assert_parent_role();
  if not public.parent_can_manage_home_student(p_student_id) then
    raise exception 'Home student management has transferred to the school' using errcode = '42501';
  end if;
  if p_levels is null or jsonb_typeof(p_levels) <> 'object' then
    raise exception 'Starting levels must be a realm to level object';
  end if;

  for v_realm_id, v_level in select key, value #>> '{}' from jsonb_each(p_levels) loop
    perform public.parent_change_home_starting_level(p_student_id, v_realm_id, v_level);
    v_applied := v_applied + 1;
  end loop;

  if v_applied = 0 then
    raise exception 'At least one realm starting level is required';
  end if;

  insert into public.student_identity_audit_events (
    actor_user_id, action, student_id, after_state
  ) values (
    auth.uid(), 'home_starting_levels_confirmed', p_student_id, p_levels
  );
end;
$$;

-- New Home learners are seeded in every live realm they can actually start.
-- A realm whose curriculum begins above the chosen level is left unseeded, so
-- it reads as "unlocks at Level 3" on the student surfaces instead of routing
-- the child to a pre-test that does not exist. Nothing else changes.
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
  v_seeded jsonb := '[]'::jsonb;
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

  foreach v_realm_id in array array['number','measurement','space','statistics','pattern','chance']::text[] loop
    continue when public.curriculum_level_index(p_working_level)
      < public.curriculum_level_index(public.realm_first_level(v_realm_id));

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

    v_seeded := v_seeded || to_jsonb(v_realm_id);
  end loop;

  insert into public.student_identity_audit_events (
    actor_user_id, action, student_id, after_state
  ) values (
    auth.uid(), 'home_student_created', v_student_id,
    jsonb_build_object(
      'username', v_username,
      'schoolYearLevel', p_school_year_level,
      'workingLevel', p_working_level,
      'seededRealms', v_seeded,
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
    'seededRealms', v_seeded,
    'homeAccess', true
  );
end;
$$;

-- Every current working level in one read. The student surfaces need this to
-- decide which realms are open: reaching a level in ANY realm is the evidence
-- that a learner may attempt another realm's entry pre-test. Existing progress
-- reads are one realm per call, which would mean six round trips per render.
create or replace function public.get_student_realm_levels_secure(p_student_id uuid)
returns table(
  realm_id text,
  working_level text,
  placement_complete boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  return query
  select progress.realm_id, progress.working_level, progress.placement_complete
  from public.student_realm_progress progress
  where progress.student_id = p_student_id
    and progress.is_current;
end;
$$;

revoke all on function public.curriculum_level_index(text) from public, anon, authenticated;
grant execute on function public.curriculum_level_index(text) to anon, authenticated;

revoke all on function public.parent_set_home_realm_levels(uuid, jsonb) from public, anon;
grant execute on function public.parent_set_home_realm_levels(uuid, jsonb) to authenticated;

revoke all on function public.get_student_realm_levels_secure(uuid) from public, anon, authenticated;
grant execute on function public.get_student_realm_levels_secure(uuid) to anon, authenticated;

commit;
