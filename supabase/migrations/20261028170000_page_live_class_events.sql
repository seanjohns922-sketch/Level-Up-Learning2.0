-- Bounded keyset pages; preserve all matching history without API-cap truncation.
create or replace function public.get_live_class_event_page_secure(
 p_class_id uuid,
 p_student_ids uuid[] default null,
 p_event_types text[] default null,
 p_after_created_at timestamptz default null,
 p_after_id uuid default null,
 p_through_created_at timestamptz default null,
 p_through_id uuid default null
) returns setof public.live_activity_events
language plpgsql stable security definer set search_path=public
as $$
begin
 if auth.uid() is null or not public.can_view_class(p_class_id) then
  raise exception 'Class access denied' using errcode='42501';
 end if;
 if (p_after_created_at is null) <> (p_after_id is null)
 or p_through_created_at is null or p_through_id is null then
  raise exception 'Complete event cursors are required' using errcode='22023';
 end if;
 return query select e.* from public.live_activity_events e
 where e.class_id=p_class_id
 and (p_student_ids is null or e.student_id=any(p_student_ids))
 and (p_event_types is null or e.event_type=any(p_event_types))
 and (p_after_created_at is null or (e.created_at,e.id)>(p_after_created_at,p_after_id))
 and (e.created_at,e.id)<=(p_through_created_at,p_through_id)
 order by e.created_at,e.id limit 500;
end;
$$;
revoke all on function public.get_live_class_event_page_secure(uuid,uuid[],text[],timestamptz,uuid,timestamptz,uuid) from public,anon;
grant execute on function public.get_live_class_event_page_secure(uuid,uuid[],text[],timestamptz,uuid,timestamptz,uuid) to authenticated;
