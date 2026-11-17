-- Read-only optimisation. Existing tables, policies and historical events remain.
-- Rollback: remove these two functions; clients fall back only on missing RPC.
begin;

-- Match the JS payload predicate used by resolveCurrentActivityRow. PostgreSQL
-- numeric supports values beyond JS Number: reject float overflow explicitly.
create or replace function public.live_event_has_activity_context(payload jsonb)
returns boolean language plpgsql immutable set search_path=public as $$
declare week_value double precision;
begin
 if jsonb_typeof(payload->'lessonId') = 'string' and
    length(btrim(payload->>'lessonId', U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF')) > 0 then
  return true;
 end if;
 if jsonb_typeof(payload->'week') = 'number' then
  begin
   week_value := (payload->>'week')::double precision;
   return week_value >= 0 and week_value < 'Infinity'::double precision;
  exception when numeric_value_out_of_range then
   -- JS underflow becomes signed zero, which passes >= 0; overflow is not finite.
   return abs((payload->>'week')::numeric) < 1;
  end;
 end if;
 return false;
end;
$$;
revoke all on function public.live_event_has_activity_context(jsonb) from public,anon,authenticated;

create or replace function public.get_live_class_compact_event_page_secure(
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
 return query
 with scoped as materialized (
  select e.*,
   case when jsonb_typeof(e.payload->'lessonId')='string' and e.payload->>'lessonId' <> '' then 'id'
        when jsonb_typeof(e.payload->'lessonTitle')='string' and e.payload->>'lessonTitle' <> '' then 'title' end as key_type,
   case when jsonb_typeof(e.payload->'lessonId')='string' and e.payload->>'lessonId' <> '' then e.payload->>'lessonId'
        when jsonb_typeof(e.payload->'lessonTitle')='string' and e.payload->>'lessonTitle' <> '' then e.payload->>'lessonTitle' end as activity_key
  from public.live_activity_events e
  where e.class_id=p_class_id
   and (p_student_ids is null or e.student_id=any(p_student_ids))
   and (p_event_types is null or e.event_type=any(p_event_types))
   and (e.created_at,e.id)<=(p_through_created_at,p_through_id)
 ), starts as (
  select distinct on (student_id,key_type,activity_key)
   student_id,key_type,activity_key,created_at,id
  from scoped where key_type is not null and event_type in ('lesson_started','quiz_started')
  order by student_id,key_type,activity_key,created_at desc,id desc
 ), latest as (
  -- JS Date has millisecond precision. Stable sorting keeps the FIRST database
  -- row within a tied latest millisecond, not the highest UUID in that group.
  select distinct on (student_id) id
  from scoped where public.live_event_has_activity_context(payload)
  order by student_id,date_trunc('milliseconds',created_at) desc,created_at,id
 ), selected as (
  select s.id from scoped s left join starts b
   on s.student_id=b.student_id and s.key_type=b.key_type and s.activity_key=b.activity_key
  where (s.key_type is not null and (b.id is null or (s.created_at,s.id)>=(b.created_at,b.id)))
   or s.id in (select id from latest)
 )
 select e.* from public.live_activity_events e join selected s on s.id=e.id
 where (p_after_created_at is null or (e.created_at,e.id)>(p_after_created_at,p_after_id))
 order by e.created_at,e.id limit 500;
end;
$$;
revoke all on function public.get_live_class_compact_event_page_secure(uuid,uuid[],text[],timestamptz,uuid,timestamptz,uuid) from public,anon;
grant execute on function public.get_live_class_compact_event_page_secure(uuid,uuid[],text[],timestamptz,uuid,timestamptz,uuid) to authenticated;
commit;
