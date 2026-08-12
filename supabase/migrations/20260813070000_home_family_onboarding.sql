begin;

create table if not exists public.student_pretest_reopen_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  realm_id text not null check (realm_id in ('number','measurement','space')),
  reopened_by uuid not null references auth.users(id) on delete restrict,
  reopened_at timestamptz not null default now(),
  reason text not null default 'home_parent_requested'
);

create index if not exists student_pretest_reopen_latest_idx
  on public.student_pretest_reopen_events(student_id, realm_id, reopened_at desc);

alter table public.student_pretest_reopen_events enable row level security;
revoke all on table public.student_pretest_reopen_events from public, anon, authenticated;

create or replace function public.parent_can_manage_home_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.parent_student_links link
      where link.parent_user_id = auth.uid()
        and link.student_id = p_student_id
        and link.status = 'active'
    )
    and exists (
      select 1
      from public.student_access_entitlements entitlement
      where entitlement.student_id = p_student_id
        and entitlement.access_source = 'home'
        and entitlement.status = 'active'
        and entitlement.starts_at <= now()
        and (entitlement.ends_at is null or entitlement.ends_at >= now())
    )
    and not exists (
      select 1
      from public.student_access_entitlements entitlement
      where entitlement.student_id = p_student_id
        and entitlement.access_source = 'school'
        and entitlement.status = 'active'
        and entitlement.starts_at <= now()
        and (entitlement.ends_at is null or entitlement.ends_at >= now())
    )
    and not exists (
      select 1
      from public.student_school_memberships membership
      where membership.student_id = p_student_id
        and membership.status = 'active'
        and membership.ended_at is null
    )
    and not exists (
      select 1
      from public.class_enrollments enrolment
      where enrolment.student_id = p_student_id
        and enrolment.status = 'active'
        and enrolment.ended_at is null
    );
$$;

revoke all on function public.parent_can_manage_home_student(uuid)
  from public, anon, authenticated;

create or replace function public.generate_home_student_username(
  p_first_name text,
  p_last_name text
)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_base text;
  v_candidate text;
begin
  perform pg_advisory_xact_lock(hashtextextended('home-student-username', 0));
  v_base := trim(both '.' from regexp_replace(
    lower(trim(p_first_name) || '.' || trim(p_last_name)),
    '[^a-z0-9]+', '.', 'g'
  ));
  if v_base = '' then
    v_base := 'explorer';
  end if;

  loop
    v_candidate := left(v_base, 24) || '.' || lower(substr(encode(extensions.gen_random_bytes(3), 'hex'), 1, 6));
    exit when not exists (
      select 1 from public.students student where lower(student.username) = v_candidate
    );
  end loop;
  return v_candidate;
end;
$$;

revoke all on function public.generate_home_student_username(text, text)
  from public, anon, authenticated;

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
      case when v_ground then 'ground_week1' else 'pretest' end,
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
      case when v_ground then 1 else null end,
      case when v_ground then 1 else null end,
      v_ground
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

create or replace function public.get_parent_home_student_management(p_student_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
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

  select jsonb_build_object(
    'studentId', student.id,
    'displayName', student.display_name,
    'username', student.username,
    'explorerCode', explorer.code,
    'schoolYearLevel', student.school_year_level,
    'workingLevel', student.working_level,
    'parentManaged', public.parent_can_manage_home_student(student.id),
    'schoolName', school.name,
    'placements', coalesce((
      select jsonb_agg(jsonb_build_object(
        'realmId', placement.realm_id,
        'workingLevel', placement.assigned_start_level,
        'entryMode', placement.assigned_entry_mode
      ) order by placement.realm_id)
      from public.student_realm_placement placement
      where placement.student_id = student.id
    ), '[]'::jsonb)
  ) into v_result
  from public.students student
  left join public.schools school on school.id = student.school_id
  left join public.student_explorer_codes explorer
    on explorer.student_id = student.id and explorer.status = 'active'
  where student.id = p_student_id
    and student.archived_at is null
    and coalesce(student.identity_status, 'active') = 'active';

  return v_result;
end;
$$;

create or replace function public.parent_reset_home_student_pin(
  p_student_id uuid,
  p_new_pin text
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_parent_role();
  if not public.parent_can_manage_home_student(p_student_id) then
    raise exception 'Home student management has transferred to the school' using errcode = '42501';
  end if;
  if coalesce(p_new_pin, '') !~ '^[0-9]{4}$' then
    raise exception 'PIN must contain exactly four digits';
  end if;

  update public.students set pin = p_new_pin where id = p_student_id;
  update public.student_access_credentials
  set revoked_at = coalesce(revoked_at, now())
  where student_id = p_student_id and credential_type = 'pin' and revoked_at is null;
  insert into public.student_access_credentials (
    student_id, credential_type, credential_secret, created_by
  ) values (p_student_id, 'pin', p_new_pin, auth.uid());
  update public.student_access_sessions
  set revoked_at = coalesce(revoked_at, now())
  where student_id = p_student_id and revoked_at is null;

  insert into public.student_identity_audit_events (
    actor_user_id, action, student_id, after_state
  ) values (auth.uid(), 'home_student_pin_reset', p_student_id, jsonb_build_object('sessionsRevoked', true));
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
  v_ground := p_assigned_level = 'Prep';

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

create or replace function public.parent_reset_home_pretest(
  p_student_id uuid,
  p_realm_id text
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_parent_role();
  if not public.parent_can_manage_home_student(p_student_id) then
    raise exception 'Home student management has transferred to the school' using errcode = '42501';
  end if;
  if p_realm_id not in ('number','measurement','space') then
    raise exception 'Invalid realm';
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
    raise exception 'Pre-test cannot be reset after canonical learning has begun';
  end if;

  update public.student_realm_progress
  set pretest_score = null,
      pretest_completed_at = null,
      required_weeks = '[]'::jsonb,
      optional_weeks = '[]'::jsonb,
      placement_complete = false,
      current_week = null,
      assigned_week = null,
      status = 'ASSIGNED_PROGRAM',
      updated_at = now()
  where student_id = p_student_id
    and realm_id = p_realm_id
    and is_current;

  update public.student_realm_placement
  set assigned_entry_mode = 'pretest', updated_at = now()
  where student_id = p_student_id and realm_id = p_realm_id;

  insert into public.student_pretest_reopen_events (
    student_id, realm_id, reopened_by
  ) values (p_student_id, p_realm_id, auth.uid());

  insert into public.student_identity_audit_events (
    actor_user_id, action, student_id, after_state
  ) values (
    auth.uid(), 'home_pretest_reopened', p_student_id,
    jsonb_build_object(
      'realmId', p_realm_id,
      'assessmentHistoryPreserved', true
    )
  );
end;
$$;

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

create or replace function public.home_student_login_lookup(
  p_username text,
  p_pin text
)
returns table(
  student_id uuid,
  display_name text,
  first_name text,
  last_name text,
  username text,
  class_id uuid,
  school_year_level text,
  working_level text,
  year_level text,
  session_token text
)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_student public.students%rowtype;
  v_token text;
begin
  select student.* into v_student
  from public.students student
  where lower(trim(student.username)) = lower(trim(p_username))
    and student.pin = trim(p_pin)
    and student.archived_at is null
    and coalesce(student.identity_status, 'active') = 'active'
    and exists (
      select 1 from public.student_access_entitlements entitlement
      where entitlement.student_id = student.id
        and entitlement.access_source = 'home'
        and entitlement.status = 'active'
        and entitlement.starts_at <= now()
        and (entitlement.ends_at is null or entitlement.ends_at >= now())
    )
  limit 1;

  if v_student.id is null then
    return;
  end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.student_access_sessions (student_id, token_hash, expires_at)
  values (
    v_student.id,
    encode(extensions.digest(v_token, 'sha256'), 'hex'),
    now() + interval '30 days'
  );

  return query select
    v_student.id, v_student.display_name, v_student.first_name,
    v_student.last_name, v_student.username, v_student.class_id,
    v_student.school_year_level, v_student.working_level,
    v_student.year_level, v_token;
end;
$$;

create or replace function public.get_student_explorer_code_secure(
  p_student_id uuid
)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  perform public.assert_student_read(p_student_id);

  select explorer.code
  into v_code
  from public.student_explorer_codes explorer
  where explorer.student_id = p_student_id
    and explorer.status = 'active'
  order by explorer.created_at desc
  limit 1;

  return v_code;
end;
$$;

revoke all on function public.create_home_student_for_parent(text,text,text,text,text)
  from public, anon;
revoke all on function public.get_parent_home_student_management(uuid)
  from public, anon;
revoke all on function public.parent_reset_home_student_pin(uuid,text)
  from public, anon;
revoke all on function public.parent_change_home_starting_level(uuid,text,text)
  from public, anon;
revoke all on function public.parent_reset_home_pretest(uuid,text)
  from public, anon;
revoke all on function public.home_student_login_lookup(text,text)
  from public;
revoke all on function public.get_student_explorer_code_secure(uuid)
  from public;

grant execute on function public.create_home_student_for_parent(text,text,text,text,text)
  to authenticated;
grant execute on function public.get_parent_home_student_management(uuid)
  to authenticated;
grant execute on function public.parent_reset_home_student_pin(uuid,text)
  to authenticated;
grant execute on function public.parent_change_home_starting_level(uuid,text,text)
  to authenticated;
grant execute on function public.parent_reset_home_pretest(uuid,text)
  to authenticated;
grant execute on function public.home_student_login_lookup(text,text)
  to anon, authenticated;
grant execute on function public.get_student_explorer_code_secure(uuid)
  to anon, authenticated;

commit;
