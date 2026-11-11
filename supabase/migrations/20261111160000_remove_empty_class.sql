-- "Remove empty class": staff who manage a class (its teacher, a school admin for
-- its school, or a platform admin) can remove a class only when the server finds
-- nothing tied to it: no current students, no enrolments past or present, and no
-- row in any other table that points at the class, except class set-up rows
-- (staff, groups, focus, live sessions, diagnostic session windows, invitations).
-- Anything else blocks the removal, so no student data can be lost or detached.
-- This replaces the old browser-side "Delete class", which deleted a class's
-- students first.
--
-- Schema: one function. Data: none changed on install.
-- Rollback: drop function public.remove_empty_class(uuid).

begin;

create or replace function public.remove_empty_class(p_class_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class classes%rowtype;
  v_students integer;
  v_enrolments integer;
  v_ref record;
  v_found boolean;
  -- Class set-up rows that hold no student data and are removed with the class.
  v_setup constant text[] := array['class_staff_memberships', 'class_group_members', 'class_realm_focus',
    'live_class_sessions', 'whole_math_diagnostic_school_sessions', 'school_invitations'];
begin
  if auth.uid() is null or not public.can_manage_class(p_class_id) then
    raise exception 'Class management access denied' using errcode = '42501';
  end if;

  select * into v_class from classes where id = p_class_id for update;
  if v_class.id is null then raise exception 'Class not found'; end if;

  select count(*) into v_students from students where class_id = p_class_id;
  if v_students > 0 then
    raise exception 'This class still has % student%. Move them to another class first.', v_students, case when v_students = 1 then '' else 's' end;
  end if;

  select count(*) into v_enrolments from class_enrollments where class_id = p_class_id;
  if v_enrolments > 0 then
    raise exception 'Students have been enrolled in this class before, so it keeps their history. Archive it instead.';
  end if;

  -- Every other table that references classes.id: block on any row.
  for v_ref in
    select cl.relname as table_name, att.attname as column_name
    from pg_constraint con
    join pg_class cl on cl.oid = con.conrelid
    join pg_namespace ns on ns.oid = cl.relnamespace
    join pg_attribute att on att.attrelid = con.conrelid and att.attnum = con.conkey[1]
    where con.contype = 'f'
      and con.confrelid = 'public.classes'::regclass
      and ns.nspname = 'public'
      and cl.relname not in ('students', 'class_enrollments')
      and cl.relname <> all (v_setup)
  loop
    execute format('select exists (select 1 from public.%I where %I = $1)', v_ref.table_name, v_ref.column_name)
      into v_found using p_class_id;
    if v_found then
      raise exception 'This class has saved student work (%), so it can''t be removed. Archive it instead.', v_ref.table_name;
    end if;
  end loop;

  delete from classes where id = p_class_id;

  if v_class.school_id is not null then
    perform public.write_school_audit(v_class.school_id, 'class_removed', 'class', p_class_id::text,
      jsonb_build_object('name', v_class.name, 'academicYear', v_class.academic_year), '{}'::jsonb, '{}'::jsonb);
  end if;

  return jsonb_build_object('removed', true, 'classId', p_class_id, 'name', v_class.name);
end;
$$;

revoke all on function public.remove_empty_class(uuid) from public, anon;
grant execute on function public.remove_empty_class(uuid) to authenticated;

commit;
