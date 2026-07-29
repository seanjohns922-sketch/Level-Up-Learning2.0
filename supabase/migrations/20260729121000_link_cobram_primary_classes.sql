begin;

-- Consolidate the existing classes owned by the three Cobram Primary
-- educators into one canonical school tenant. Class and student identifiers
-- are preserved, so progression, attempts, assessments and rewards remain
-- attached to the same records.
do $$
declare
  v_school_id uuid;
  v_account_key text;
  v_aliases text[];
  v_user_id uuid;
  v_match_count integer;
begin
  create temporary table cobram_educators (
    account_key text primary key,
    user_id uuid not null unique
  ) on commit drop;

  foreach v_account_key in array array[
    'amy.hollisters',
    'marika.newey',
    'miranda.johns'
  ]
  loop
    v_aliases := case v_account_key
      when 'amy.hollisters' then array['amy.hollisters', 'amy.hollister']
      when 'marika.newey' then array['marika.newey', 'mairkia.newey']
      else array['miranda.johns']
    end;

    select
      count(*),
      (array_agg(teacher.id order by teacher.id))[1]
    into v_match_count, v_user_id
    from public.teachers teacher
    where lower(split_part(coalesce(teacher.email, ''), '@', 1))
        = any(v_aliases)
      or regexp_replace(
          lower(coalesce(teacher.display_name, '')),
          '[^a-z0-9]+',
          '',
          'g'
        ) = any(
        select regexp_replace(alias, '[^a-z0-9]+', '', 'g')
        from unnest(v_aliases) alias
      );

    if v_match_count <> 1 then
      raise exception
        'Expected one teacher account for %, found %',
        v_account_key,
        v_match_count;
    end if;

    insert into cobram_educators (account_key, user_id)
    values (v_account_key, v_user_id);
  end loop;

  -- Prefer an existing Cobram Primary tenant not created by one of the three
  -- educators. This selects the shared school over their legacy personal
  -- school records if duplicate names exist.
  select school.id
  into v_school_id
  from public.schools school
  where regexp_replace(
    lower(school.name),
    '[^a-z0-9]+',
    '',
    'g'
  ) in ('cobramprimary', 'cobramprimaryschool')
    and school.status = 'active'
  order by
    case
      when school.created_by in (
        select educator.user_id from cobram_educators educator
      ) then 1
      else 0
    end,
    (
      select count(*)
      from public.school_memberships membership
      where membership.school_id = school.id
        and membership.status = 'active'
    ) desc,
    (
      select count(*)
      from public.classes class
      where class.school_id = school.id
        and class.status = 'active'
    ) desc,
    school.created_at,
    school.id
  limit 1;

  if v_school_id is null then
    raise exception
      'No active Cobram Primary school tenant exists; refusing to create a duplicate';
  end if;

  create temporary table cobram_moved_classes on commit drop as
  select
    class.id,
    class.teacher_id,
    class.school_id as previous_school_id,
    coalesce(
      class.academic_year,
      extract(year from class.created_at)::integer,
      extract(year from current_date)::integer
    ) as calendar_year
  from public.classes class
  join cobram_educators educator on educator.user_id = class.teacher_id
  where class.school_id is distinct from v_school_id;

  insert into public.school_memberships (
    school_id,
    user_id,
    role,
    status,
    accepted_at,
    ended_at,
    updated_at
  )
  select
    v_school_id,
    educator.user_id,
    'teacher',
    'active',
    now(),
    null,
    now()
  from cobram_educators educator
  on conflict (school_id, user_id) do update set
    role = case
      when public.school_memberships.role in ('school_admin', 'principal')
        then public.school_memberships.role
      else 'teacher'
    end,
    status = 'active',
    accepted_at = coalesce(public.school_memberships.accepted_at, now()),
    ended_at = null,
    updated_at = now();

  insert into public.academic_years (
    school_id,
    name,
    calendar_year,
    starts_on,
    ends_on,
    status
  )
  select distinct
    v_school_id,
    moved.calendar_year::text,
    moved.calendar_year,
    make_date(moved.calendar_year, 1, 1),
    make_date(moved.calendar_year, 12, 31),
    case
      when moved.calendar_year = extract(year from current_date)::integer
        then 'active'
      when moved.calendar_year < extract(year from current_date)::integer
        then 'closed'
      else 'planned'
    end
  from cobram_moved_classes moved
  on conflict (school_id, calendar_year) do nothing;

  update public.classes class
  set
    school_id = v_school_id,
    academic_year = moved.calendar_year,
    academic_year_id = year.id
  from cobram_moved_classes moved
  join public.academic_years year
    on year.school_id = v_school_id
   and year.calendar_year = moved.calendar_year
  where class.id = moved.id;

  update public.students student
  set school_id = v_school_id
  where student.class_id in (
    select moved.id from cobram_moved_classes moved
  );

  update public.class_enrollments enrolment
  set
    school_id = v_school_id,
    academic_year_id = class.academic_year_id,
    updated_at = now()
  from public.classes class
  where class.id = enrolment.class_id
    and class.id in (
      select moved.id from cobram_moved_classes moved
    );

  update public.class_staff_memberships staffing
  set
    school_id = v_school_id,
    updated_at = now()
  where staffing.class_id in (
    select moved.id from cobram_moved_classes moved
  );

  insert into public.class_staff_memberships (
    class_id,
    school_id,
    user_id,
    role,
    status,
    assigned_by
  )
  select
    moved.id,
    v_school_id,
    moved.teacher_id,
    'lead_teacher',
    'active',
    moved.teacher_id
  from cobram_moved_classes moved
  on conflict (class_id, user_id) do update set
    school_id = excluded.school_id,
    role = 'lead_teacher',
    status = 'active',
    ended_at = null,
    updated_at = now();

  update public.student_staff_assignments assignment
  set school_id = v_school_id
  where assignment.student_id in (
    select student.id
    from public.students student
    join cobram_moved_classes moved on moved.id = student.class_id
  );

  insert into public.school_audit_log (
    school_id,
    actor_user_id,
    action,
    target_type,
    target_id,
    previous_state,
    new_state,
    metadata
  )
  select
    v_school_id,
    null,
    'class_tenant_reconciled',
    'class',
    moved.id::text,
    jsonb_build_object('school_id', moved.previous_school_id),
    jsonb_build_object('school_id', v_school_id),
    jsonb_build_object(
      'migration', '20260729121000_link_cobram_primary_classes',
      'teacher_id', moved.teacher_id
    )
  from cobram_moved_classes moved;

  -- Remove only obsolete bootstrap memberships created by the legacy
  -- one-school-per-teacher migration. Legitimate access to other schools is
  -- deliberately retained.
  update public.school_memberships membership
  set
    status = 'inactive',
    ended_at = now(),
    updated_at = now()
  from public.schools school
  join cobram_educators educator
    on school.created_by = educator.user_id
  where membership.school_id = school.id
    and membership.user_id = educator.user_id
    and school.id <> v_school_id
    and school.school_code =
      'SCH' || upper(substr(md5(educator.user_id::text), 1, 7))
    and not exists (
      select 1
      from public.classes class
      where class.school_id = school.id
        and class.status = 'active'
    );

  update public.schools school
  set
    status = 'archived',
    updated_at = now()
  where school.id <> v_school_id
    and school.school_code in (
      select
        'SCH' || upper(substr(md5(educator.user_id::text), 1, 7))
      from cobram_educators educator
    )
    and not exists (
      select 1
      from public.classes class
      where class.school_id = school.id
        and class.status = 'active'
    )
    and not exists (
      select 1
      from public.school_memberships membership
      where membership.school_id = school.id
        and membership.status = 'active'
    );

  if (
    select count(*)
    from public.school_memberships membership
    join cobram_educators educator on educator.user_id = membership.user_id
    where membership.school_id = v_school_id
      and membership.status = 'active'
  ) <> 3 then
    raise exception 'Cobram Primary educator membership reconciliation failed';
  end if;

  if exists (
    select 1
    from public.classes class
    join cobram_educators educator on educator.user_id = class.teacher_id
    where class.school_id is distinct from v_school_id
  ) then
    raise exception 'One or more educator classes remain outside Cobram Primary';
  end if;

  if exists (
    select 1
    from public.students student
    join public.classes class on class.id = student.class_id
    join cobram_educators educator on educator.user_id = class.teacher_id
    where student.school_id is distinct from v_school_id
  ) then
    raise exception 'One or more primary-class students remain outside Cobram Primary';
  end if;

  if exists (
    select 1
    from public.class_enrollments enrolment
    join public.classes class on class.id = enrolment.class_id
    join cobram_educators educator on educator.user_id = class.teacher_id
    where enrolment.school_id is distinct from v_school_id
       or enrolment.academic_year_id is distinct from class.academic_year_id
  ) then
    raise exception 'One or more Cobram Primary enrolments remain inconsistent';
  end if;
end;
$$;

commit;
