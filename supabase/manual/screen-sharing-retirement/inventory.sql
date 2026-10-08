-- Read-only metadata inventory. Run with an authorised administrator.
-- Do not export student rows, DOM payloads, secrets, object names or sessions.
begin read only;
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'realtime'
   or (schemaname = 'storage' and tablename in ('objects', 'buckets'));

select schemaname, tablename
from pg_tables
where schemaname not in ('pg_catalog', 'information_schema')
  and tablename ~* '(rrweb|screen|recording|replay)';

select n.nspname as schema_name, p.proname as function_name
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and (p.proname ~* '(rrweb|screen|recording|replay)'
    or p.prosrc ~* '(screen_events|rrweb|screen-)');

select id, name, public from storage.buckets;
-- Candidate counts only, not evidence that matching objects are recordings.
select bucket_id, count(*) as candidate_objects
from storage.objects
where bucket_id ~* '(rrweb|screen|recording|replay)'
   or name ~* '(^|/)(rrweb|screen-recordings?|recordings?)(/|$)'
group by bucket_id;
rollback;
