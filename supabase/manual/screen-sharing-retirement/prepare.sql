-- APPROVAL REQUIRED. Not an automatic migration. Test in staging first.
-- Keep the Realtime service enabled. After deploying the matching client,
-- turn OFF "Allow public access to channels" in the Supabase dashboard.
-- SQL alone does NOT block legacy public channels or revoke cached joins.
begin;

-- Restrictive policies also deny access if a permissive legacy policy exists.
create policy "RELIQ retired screen topics denied"
on realtime.messages as restrictive for all to anon, authenticated
using (coalesce(realtime.topic(), '') not like 'screen-%')
with check (coalesce(realtime.topic(), '') not like 'screen-%');

-- No remaining RELIQ browser feature publishes Broadcast or Presence data.
-- Lesson/activity telemetry writes to public tables through validated RPCs.
create policy "RELIQ browser realtime publishing denied"
on realtime.messages as restrictive for insert to anon, authenticated
with check (false);

-- Authorise the private channel used only to receive Live Class DB changes.
-- Existing table RLS still controls which Postgres Changes rows are delivered.
create policy "RELIQ authorised live class channel"
on realtime.messages for select to authenticated
using (
  extension = 'broadcast'
  and case
    when realtime.topic() ~ '^live-class-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    then public.can_view_class(substring(realtime.topic() from 12)::uuid)
    else false
  end
);

-- A pre-existing broad SELECT policy must not bypass the class boundary.
create policy "RELIQ browser realtime receive boundary"
on realtime.messages as restrictive for select to anon, authenticated
using (
  extension = 'broadcast'
  and case
    when current_user = 'authenticated'
      and realtime.topic() ~ '^live-class-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    then public.can_view_class(substring(realtime.topic() from 12)::uuid)
    else false
  end
);

commit;
