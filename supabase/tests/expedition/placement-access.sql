-- Run after the expedition placement-reader migration. No changes are retained.
-- Uses the approved student only to attach a short-lived session within this transaction.
begin;
do $$
declare
 sid uuid; supplied text := encode(extensions.gen_random_bytes(32),'hex'); got integer;
begin
 select s.id into strict sid from public.students s
 where lower(coalesce(to_jsonb(s)->>'first_name','') || ' ' || coalesce(to_jsonb(s)->>'last_name',''))='boden johns'
    or lower(coalesce(to_jsonb(s)->>'display_name',''))='boden johns';
 insert into public.student_access_sessions(student_id,token_hash,expires_at)
 values(sid,encode(extensions.digest(supplied,'sha256'),'hex'),now()+interval '5 minutes');
 perform set_config('request.jwt.claims','{}',true);
 perform set_config('request.headers',jsonb_build_object('x-student-session',supplied)::text,true);
 set local role anon;
 select count(*) into got from public.get_student_expedition_placements_secure(sid);
 if exists(select 1 from public.get_student_expedition_placements_secure(sid) where student_id<>sid) then raise exception 'Cross-student rows';end if;
 begin
  perform * from public.get_student_expedition_placements_secure('00000000-0000-0000-0000-000000000000');
  raise exception 'Cross-student call should reject';
 exception when insufficient_privilege then null;
 end;
 perform set_config('request.headers','{}',true);
 begin
  perform * from public.get_student_expedition_placements_secure(sid);
  raise exception 'Missing session should reject';
 exception when insufficient_privilege then null;
 end;
 perform set_config('request.headers','{"x-student-session":"invalid"}',true);
 begin
  perform * from public.get_student_expedition_placements_secure(sid);
  raise exception 'Invalid session should reject';
 exception when insufficient_privilege then null;
 end;
 reset role;
 raise notice 'PASS valid anon session, cross-student, missing and invalid session checks';
end $$;
rollback;
