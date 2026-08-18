begin;

create or replace function public.touch_live_student_presence_secure(
  p_student_id uuid,
  p_class_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);

  if not exists (
    select 1
    from public.students student
    where student.id = p_student_id
      and student.class_id = p_class_id
      and student.archived_at is null
  ) then
    raise exception 'Student context does not match' using errcode = '42501';
  end if;

  update public.live_student_activity
  set
    last_active_at = clock_timestamp(),
    updated_at = clock_timestamp()
  where student_id = p_student_id
    and class_id = p_class_id;

  return found;
end;
$$;

revoke all on function public.touch_live_student_presence_secure(uuid, uuid)
  from public;
grant execute on function public.touch_live_student_presence_secure(uuid, uuid)
  to anon, authenticated;

commit;
