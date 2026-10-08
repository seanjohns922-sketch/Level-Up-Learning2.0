-- LOCAL DISPOSABLE DATABASE ONLY. Never run this fixture on Supabase/production.
-- It models the Realtime schema; can_view_class is a controlled permission stub.
create role anon;
create role authenticated;
create schema realtime;
create table realtime.messages(id integer, extension text);
alter table realtime.messages enable row level security;
insert into realtime.messages values (1, 'broadcast');
grant usage on schema realtime to anon, authenticated;
grant select, insert on realtime.messages to anon, authenticated;
create function realtime.topic() returns text language sql stable as
$$ select current_setting('test.topic', true) $$;
create function public.can_view_class(class_id uuid) returns boolean language sql stable as
$$ select current_setting('test.teacher', true) = 'allowed'
   and class_id = '11111111-1111-1111-1111-111111111111'::uuid $$;
-- Deliberately permissive old policy: retirement restrictions must override it.
create policy legacy_broad on realtime.messages for all to anon, authenticated
using (true) with check (true);
