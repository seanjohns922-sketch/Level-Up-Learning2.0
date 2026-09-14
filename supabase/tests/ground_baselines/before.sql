-- Synthetic fixtures only. Run in an isolated schema-only clone, never production.
create function public.ground_test_assert(ok boolean,label text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label;end$$;
insert into auth.users(id,email,aud,role,raw_user_meta_data) values('ed100000-0000-0000-0000-000000000001','ground-parent@example.invalid','authenticated','authenticated','{"role":"parent"}');
insert into public.user_profiles(user_id,email,display_name,status) values('ed100000-0000-0000-0000-000000000001','ground-parent@example.invalid','Synthetic Parent','active') on conflict(user_id) do update set status='active';
select set_config('request.jwt.claim.sub','ed100000-0000-0000-0000-000000000001',false);
select set_config('request.jwt.claims','{"sub":"ed100000-0000-0000-0000-000000000001","user_metadata":{"role":"parent"}}',false);
set role authenticated;
create temporary table old_ground as select public.create_home_student_for_parent('Existing','Fixture','Prep','Prep','2468') result;
reset role;
update public.student_realm_progress set current_week=5,assigned_week=1,placement_complete=true,unlocked_legends='["existing-reward"]' where student_id=(select (result->>'studentId')::uuid from old_ground);
create temporary table preserved_progress as select to_jsonb(t) value from public.student_realm_progress t;
create temporary table preserved_students as select to_jsonb(t) value from public.students t;
