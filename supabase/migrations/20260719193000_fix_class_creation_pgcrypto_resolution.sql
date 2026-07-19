begin;

-- Supabase installs pgcrypto in the extensions schema. This security-definer
-- function uses a restricted search_path, so school-code generation must call
-- gen_random_bytes through its owning schema.
create or replace function public.create_class_for_teacher(
  p_name text,
  p_class_code text,
  p_year_levels text[],
  p_school_name text,
  p_academic_year integer
)
returns table(class_id uuid, school_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  teacher_id uuid := auth.uid();
  selected_school_id uuid;
  clean_school_name text := nullif(trim(p_school_name), '');
  generated_school_code text;
  new_class_id uuid;
begin
  if teacher_id is null then
    raise exception 'Login required';
  end if;
  if nullif(trim(p_name), '') is null then
    raise exception 'Class name is required';
  end if;
  if nullif(trim(p_class_code), '') is null then
    raise exception 'Class code is required';
  end if;
  if clean_school_name is null then
    raise exception 'School name is required';
  end if;
  if p_academic_year not between 2000 and 2100 then
    raise exception 'Academic year is invalid';
  end if;

  select s.id into selected_school_id
  from public.schools s
  join public.school_memberships sm on sm.school_id = s.id
  where sm.user_id = teacher_id
    and sm.status = 'active'
    and lower(trim(s.name)) = lower(clean_school_name)
  order by sm.created_at
  limit 1;

  if selected_school_id is null then
    loop
      generated_school_code := 'SCH' || upper(substr(
        encode(extensions.gen_random_bytes(5), 'hex'),
        1,
        7
      ));
      exit when not exists (
        select 1
        from public.schools
        where school_code = generated_school_code
      );
    end loop;

    insert into public.schools (name, school_code, created_by)
    values (clean_school_name, generated_school_code, teacher_id)
    returning id into selected_school_id;

    insert into public.school_memberships (school_id, user_id, role)
    values (selected_school_id, teacher_id, 'school_admin');
  end if;

  insert into public.classes (
    name,
    class_code,
    teacher_id,
    year_levels,
    school_id,
    academic_year,
    status,
    created_by
  ) values (
    trim(p_name),
    upper(trim(p_class_code)),
    teacher_id,
    coalesce(p_year_levels, '{}'::text[]),
    selected_school_id,
    p_academic_year,
    'active',
    teacher_id
  ) returning id into new_class_id;

  return query select new_class_id, selected_school_id;
end;
$$;

revoke all on function public.create_class_for_teacher(text, text, text[], text, integer)
  from public, anon;
grant execute on function public.create_class_for_teacher(text, text, text[], text, integer)
  to authenticated;

commit;
