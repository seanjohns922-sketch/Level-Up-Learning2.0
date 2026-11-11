-- Realm access: a teacher can lock a realm for individual students (Placements >
-- Realm access). A locked realm stays shut at school and at home until a teacher
-- opens it again. It replaces Focus Mode in the teacher screens; the Focus table
-- and functions are left in place, unused.
--
-- Schema: one new table (one row per locked student and realm) and three
-- functions. Data: none changed; nobody is locked when this is installed.
-- Security: the table has RLS on and no direct grants. Teachers read and change
-- locks only for students in a class they manage; students only read their own.
-- Rollback: drop the three functions and public.student_realm_locks.

begin;

create table if not exists public.student_realm_locks (
  student_id uuid not null references public.students(id) on delete cascade,
  realm_id text not null check (realm_id in ('number', 'measurement', 'space', 'pattern', 'statistics', 'chance')),
  class_id uuid references public.classes(id) on delete set null,
  locked_by uuid,
  locked_at timestamptz not null default now(),
  primary key (student_id, realm_id)
);

alter table public.student_realm_locks enable row level security;
revoke all on public.student_realm_locks from public, anon, authenticated;

-- A student belongs to the class through their current class or an open enrolment.
create or replace function public.student_in_class(p_student_id uuid, p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from students s where s.id = p_student_id and s.class_id = p_class_id and s.archived_at is null)
    or exists (select 1 from class_enrollments e where e.student_id = p_student_id and e.class_id = p_class_id and e.status = 'active' and e.ended_at is null);
$$;
revoke all on function public.student_in_class(uuid, uuid) from public, anon, authenticated;

-- Teacher: the locked realms of every student in one class.
create or replace function public.teacher_get_realm_locks(p_class_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.can_view_class(p_class_id) then
    raise exception 'Class access denied' using errcode = '42501';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('studentId', l.student_id, 'realmId', l.realm_id) order by l.student_id, l.realm_id)
    from student_realm_locks l
    where public.student_in_class(l.student_id, p_class_id)
  ), '[]'::jsonb);
end;
$$;

-- Teacher: lock or open realms. p_changes is [{studentId, realmId, locked}].
-- All changes apply together, or none do.
create or replace function public.teacher_set_realm_locks(p_class_id uuid, p_changes jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_change jsonb;
  v_student uuid;
  v_realm text;
begin
  if auth.uid() is null or not public.can_manage_class(p_class_id) then
    raise exception 'Class management access denied' using errcode = '42501';
  end if;
  if jsonb_typeof(p_changes) <> 'array' or jsonb_array_length(p_changes) > 2000 then
    raise exception 'Realm access changes must be a list of up to 2000 changes';
  end if;
  for v_change in select * from jsonb_array_elements(p_changes) loop
    v_student := (v_change->>'studentId')::uuid;
    v_realm := v_change->>'realmId';
    if v_realm not in ('number', 'measurement', 'space', 'pattern', 'statistics', 'chance') then
      raise exception 'Unknown realm: %', v_realm;
    end if;
    if not public.student_in_class(v_student, p_class_id) then
      raise exception 'Student is not in this class' using errcode = '42501';
    end if;
    if (v_change->>'locked')::boolean then
      insert into student_realm_locks (student_id, realm_id, class_id, locked_by)
      values (v_student, v_realm, p_class_id, auth.uid())
      on conflict (student_id, realm_id) do nothing;
    else
      delete from student_realm_locks where student_id = v_student and realm_id = v_realm;
    end if;
  end loop;
  return public.teacher_get_realm_locks(p_class_id);
end;
$$;

-- Student: their own locked realms.
create or replace function public.get_student_realm_locks(p_student_id uuid)
returns text[]
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.assert_student_read(p_student_id);
  return coalesce((select array_agg(realm_id order by realm_id) from student_realm_locks where student_id = p_student_id), '{}');
end;
$$;

revoke all on function public.teacher_get_realm_locks(uuid), public.teacher_set_realm_locks(uuid, jsonb), public.get_student_realm_locks(uuid) from public, anon;
grant execute on function public.teacher_get_realm_locks(uuid), public.teacher_set_realm_locks(uuid, jsonb) to authenticated;
grant execute on function public.get_student_realm_locks(uuid) to anon, authenticated;

commit;
