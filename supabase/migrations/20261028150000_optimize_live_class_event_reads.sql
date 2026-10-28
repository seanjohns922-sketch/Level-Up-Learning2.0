-- Check the existing class permission once per request rather than per event.
-- Existing table RLS and data remain unchanged. No anonymous/student grant.
create or replace function public.get_live_class_events_secure(
  p_class_id uuid,
  p_student_ids uuid[] default null,
  p_event_types text[] default null,
  p_newest_first boolean default false,
  p_limit integer default null
)
returns setof public.live_activity_events
language plpgsql stable security definer set search_path = public
as $$
begin
  if auth.uid() is null or not public.can_view_class(p_class_id) then
    raise exception 'Class access denied' using errcode = '42501';
  end if;
  if p_limit < 0 then
    raise exception 'Event limit must be non-negative' using errcode = '22023';
  end if;

  -- NULL retains the API's existing response cap; do not truncate history here.
  if coalesce(p_newest_first, false) then
    return query
      select event.* from public.live_activity_events event
      where event.class_id = p_class_id
        and (p_student_ids is null or event.student_id = any(p_student_ids))
        and (p_event_types is null or event.event_type = any(p_event_types))
      order by event.created_at desc
      limit p_limit;
  else
    return query
      select event.* from public.live_activity_events event
      where event.class_id = p_class_id
        and (p_student_ids is null or event.student_id = any(p_student_ids))
        and (p_event_types is null or event.event_type = any(p_event_types))
      order by event.created_at asc
      limit p_limit;
  end if;
end;
$$;
revoke all on function public.get_live_class_events_secure(uuid, uuid[], text[], boolean, integer) from public, anon;
grant execute on function public.get_live_class_events_secure(uuid, uuid[], text[], boolean, integer) to authenticated;
