begin;

create or replace function public.get_live_class_activity_today(p_class_id uuid)
returns table(
  student_id uuid,
  class_id uuid,
  activity_date date,
  seconds_active integer,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_view_class(p_class_id) then
    raise exception 'Class access denied';
  end if;

  return query
  select
    activity.student_id,
    activity.class_id,
    activity.activity_date,
    activity.seconds_active,
    activity.updated_at
  from public.student_activity_daily activity
  join public.students student on student.id = activity.student_id
  where activity.class_id = p_class_id
    and student.class_id = p_class_id
    and student.archived_at is null
    and activity.activity_date = (timezone('Australia/Melbourne', now()))::date;
end;
$$;

revoke all on function public.get_live_class_activity_today(uuid) from public, anon;
grant execute on function public.get_live_class_activity_today(uuid) to authenticated;

commit;
