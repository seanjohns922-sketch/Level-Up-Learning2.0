begin;

grant select on public.student_realm_placement to authenticated;

-- Older teacher placement writes omitted class context, so class-scoped reads
-- could not see the seeded progress row even though the placement was saved.
update public.student_realm_progress srp
set
  class_id = coalesce(srp.class_id, s.class_id),
  school_year_level = coalesce(srp.school_year_level, s.school_year_level, s.year_level),
  updated_at = now()
from public.students s
where s.id = srp.student_id
  and (srp.class_id is null or srp.school_year_level is null);

create or replace function public.teacher_change_starting_level(
  p_student_id uuid,
  p_realm_id text,
  p_assigned_level text,
  p_entry_mode text default 'pretest'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher uuid := auth.uid();
  v_entry text := coalesce(nullif(trim(p_entry_mode), ''), 'pretest');
  v_old text;
  v_has_progress boolean;
  v_class_id uuid;
  v_school_year_level text;
begin
  if p_realm_id not in ('number', 'measurement') then
    raise exception 'Invalid realm';
  end if;
  if p_assigned_level not in ('Prep', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6') then
    raise exception 'Invalid assigned level';
  end if;
  if v_entry not in ('pretest', 'full_level', 'ground_week1') then
    raise exception 'Invalid entry mode';
  end if;
  if not public.teacher_owns_student(p_student_id) then
    raise exception 'Not authorized for this student' using errcode = '42501';
  end if;

  select s.class_id, coalesce(s.school_year_level, s.year_level)
  into v_class_id, v_school_year_level
  from public.students s
  where s.id = p_student_id;

  select assigned_start_level into v_old
  from public.student_realm_placement
  where student_id = p_student_id and realm_id = p_realm_id;

  insert into public.student_realm_placement (
    student_id,
    realm_id,
    assigned_start_level,
    assigned_entry_mode,
    placement_source,
    placement_assigned_by,
    placement_assigned_at,
    updated_at
  ) values (
    p_student_id,
    p_realm_id,
    p_assigned_level,
    v_entry,
    'teacher',
    v_teacher,
    now(),
    now()
  )
  on conflict (student_id, realm_id) do update set
    assigned_start_level = excluded.assigned_start_level,
    assigned_entry_mode = excluded.assigned_entry_mode,
    placement_source = 'teacher',
    placement_assigned_by = excluded.placement_assigned_by,
    placement_assigned_at = now(),
    updated_at = now();

  select exists (
    select 1
    from public.student_realm_progress
    where student_id = p_student_id
      and realm_id = p_realm_id
  ) into v_has_progress;

  if not v_has_progress then
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
      placement_complete
    ) values (
      p_student_id,
      v_class_id,
      p_realm_id,
      public.realm_program_key(p_assigned_level, p_realm_id),
      v_school_year_level,
      p_assigned_level,
      true,
      'ASSIGNED_PROGRAM',
      case when v_entry = 'pretest' then null else 1 end,
      case when v_entry = 'pretest' then null else 1 end,
      v_entry <> 'pretest'
    );
  end if;

  insert into public.teacher_realm_actions (
    teacher_id,
    student_id,
    realm_id,
    action,
    old_value,
    new_value
  ) values (
    v_teacher,
    p_student_id,
    p_realm_id,
    'placement_changed',
    v_old,
    p_assigned_level
  );
end;
$$;

revoke all on function public.teacher_change_starting_level(uuid, text, text, text) from public, anon;
grant execute on function public.teacher_change_starting_level(uuid, text, text, text) to authenticated;

create or replace function public.teacher_change_starting_levels(
  p_realm_id text,
  p_placements jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  placement jsonb;
  saved_count integer := 0;
begin
  if jsonb_typeof(p_placements) <> 'array' then
    raise exception 'Placements must be an array';
  end if;

  for placement in select value from jsonb_array_elements(p_placements)
  loop
    perform public.teacher_change_starting_level(
      nullif(placement->>'student_id', '')::uuid,
      p_realm_id,
      placement->>'assigned_level',
      coalesce(placement->>'entry_mode', 'pretest')
    );
    saved_count := saved_count + 1;
  end loop;

  return saved_count;
end;
$$;

revoke all on function public.teacher_change_starting_levels(text, jsonb) from public, anon;
grant execute on function public.teacher_change_starting_levels(text, jsonb) to authenticated;

commit;
