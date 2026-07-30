begin;

-- The classes were moved to the shared Cobram tenant before the school
-- student directory existed. Reconcile their current students independently
-- of whether the classes themselves still need moving.
do $$
declare
  v_school_id uuid;
  v_account_key text;
  v_aliases text[];
  v_user_id uuid;
  v_match_count integer;
  v_class_count integer;
  v_student_count integer;
  v_students_updated integer;
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
  order by (
    select count(*)
    from public.classes class
    join cobram_educators educator
      on educator.user_id = class.teacher_id
    where class.school_id = school.id
      and class.status = 'active'
  ) desc,
  school.created_at,
  school.id
  limit 1;

  if v_school_id is null then
    raise exception 'Active Cobram Primary school tenant not found';
  end if;

  create temporary table cobram_target_classes on commit drop as
  select
    class.id,
    class.academic_year_id
  from public.classes class
  join cobram_educators educator on educator.user_id = class.teacher_id
  where class.school_id = v_school_id
    and class.status = 'active';

  select count(*) into v_class_count from cobram_target_classes;
  if v_class_count <> 3 then
    raise exception
      'Expected three active Cobram educator classes, found %',
      v_class_count;
  end if;

  if exists (
    select 1
    from cobram_target_classes target
    where target.academic_year_id is null
  ) then
    raise exception 'One or more Cobram classes have no academic year';
  end if;

  create temporary table cobram_target_students on commit drop as
  select
    student.id,
    student.class_id,
    target.academic_year_id,
    student.school_id as previous_school_id
  from public.students student
  join cobram_target_classes target on target.id = student.class_id;

  select count(*) into v_student_count from cobram_target_students;
  if v_student_count = 0 then
    raise exception 'No students found in the three Cobram classes';
  end if;

  update public.students student
  set school_id = v_school_id
  from cobram_target_students target
  where student.id = target.id
    and student.school_id is distinct from v_school_id;

  get diagnostics v_students_updated = row_count;

  -- The current class is canonical. End any conflicting primary enrolment for
  -- the same academic year before restoring the current class enrolment.
  update public.class_enrollments enrolment
  set
    status = 'ended',
    ended_at = coalesce(enrolment.ended_at, now()),
    is_primary = false,
    updated_at = now()
  from cobram_target_students target
  where enrolment.student_id = target.id
    and enrolment.class_id <> target.class_id
    and enrolment.academic_year_id = target.academic_year_id
    and enrolment.status = 'active'
    and enrolment.ended_at is null
    and enrolment.is_primary;

  insert into public.class_enrollments (
    student_id,
    class_id,
    school_id,
    academic_year_id,
    is_primary,
    status,
    enrolled_at,
    ended_at,
    updated_at
  )
  select
    target.id,
    target.class_id,
    v_school_id,
    target.academic_year_id,
    true,
    'active',
    now(),
    null,
    now()
  from cobram_target_students target
  on conflict (student_id, class_id) do update set
    school_id = excluded.school_id,
    academic_year_id = excluded.academic_year_id,
    is_primary = true,
    status = 'active',
    ended_at = null,
    updated_at = now();

  update public.student_staff_assignments assignment
  set school_id = v_school_id
  where assignment.student_id in (
    select target.id from cobram_target_students target
  )
    and assignment.school_id is distinct from v_school_id;

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
    'class_students_tenant_reconciled',
    'school',
    v_school_id::text,
    null,
    jsonb_build_object(
      'class_count', v_class_count,
      'student_count', v_student_count
    ),
    jsonb_build_object(
      'migration', '20260730101000_reconcile_cobram_class_students',
      'students_updated', v_students_updated
    )
  where not exists (
    select 1
    from public.school_audit_log log
    where log.school_id = v_school_id
      and log.action = 'class_students_tenant_reconciled'
      and log.metadata->>'migration'
        = '20260730101000_reconcile_cobram_class_students'
  );

  if exists (
    select 1
    from cobram_target_students target
    join public.students student on student.id = target.id
    where student.school_id is distinct from v_school_id
  ) then
    raise exception 'One or more Cobram class students remain outside the school';
  end if;

  if exists (
    select 1
    from cobram_target_students target
    left join public.class_enrollments enrolment
      on enrolment.student_id = target.id
     and enrolment.class_id = target.class_id
     and enrolment.school_id = v_school_id
     and enrolment.status = 'active'
     and enrolment.ended_at is null
     and enrolment.is_primary
    where enrolment.id is null
  ) then
    raise exception 'One or more Cobram class enrolments remain inconsistent';
  end if;

  raise notice
    'Cobram reconciliation: % classes, % students, % school assignments updated',
    v_class_count,
    v_student_count,
    v_students_updated;
end;
$$;

commit;
