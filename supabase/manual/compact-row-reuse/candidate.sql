-- EXPERIMENT ONLY: not approved for production migration; mixed-load latency did not improve.
-- Reuse the already-scoped event row instead of fetching each selected ID again.
-- No tables, stored data, RLS, function signature or access grants change.
-- Rollback: restore get_live_class_compact_event_page_secure from
-- 20261118120000_compact_live_class_event_reads.sql (retain its context helper).
begin;

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
  -- Retain the table composite so selected rows need no second primary-key lookup.
  select e.*, e as event_row,
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
  select s.* from scoped s left join starts b
   on s.student_id=b.student_id and s.key_type=b.key_type and s.activity_key=b.activity_key
  where (s.key_type is not null and (b.id is null or (s.created_at,s.id)>=(b.created_at,b.id)))
   or s.id in (select id from latest)
 )
 select (e.event_row).* from selected e
 where (p_after_created_at is null or (e.created_at,e.id)>(p_after_created_at,p_after_id))
 order by e.created_at,e.id limit 500;
end;
$$;
revoke all on function public.get_live_class_compact_event_page_secure(uuid,uuid[],text[],timestamptz,uuid,timestamptz,uuid) from public,anon;
grant execute on function public.get_live_class_compact_event_page_secure(uuid,uuid[],text[],timestamptz,uuid,timestamptz,uuid) to authenticated;
commit;
