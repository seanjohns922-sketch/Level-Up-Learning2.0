-- Run explicitly against the intended database with ON_ERROR_STOP=1. Synthetic data only; always rolls back.
\set QUIET 1
begin;
set local statement_timeout='30s';
set local lock_timeout='5s';
create function pg_temp.check_true(ok boolean,label text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end$$;
-- All identities and activity below are synthetic, uncommitted and rolled back.
create temporary table verify_ids as select gen_random_uuid() parent_id;
insert into auth.users(id,email,aud,role,raw_user_meta_data)
select parent_id,'starpath-verify-'||parent_id||'@example.invalid','authenticated','authenticated','{"role":"parent"}'::jsonb from verify_ids;
insert into public.user_profiles(user_id,email,display_name,status)
select parent_id,'starpath-verify-'||parent_id||'@example.invalid','Synthetic Starpath Verification','active' from verify_ids
on conflict(user_id) do update set status='active';
grant select on verify_ids to authenticated,anon;
do $$begin perform set_config('request.jwt.claim.sub',(select parent_id::text from verify_ids),true); perform set_config('request.jwt.claims',jsonb_build_object('sub',(select parent_id from verify_ids),'user_metadata',jsonb_build_object('role','parent'))::text,true);end$$;
set local role authenticated;
create temporary table verify_student as select public.create_home_student_for_parent('Synthetic','Starpath Verification','Prep','Prep','2468') result;
grant select on verify_student to anon;
do $$begin perform set_config('request.headers',jsonb_build_object('x-student-session',(select session_token from public.home_student_login_lookup((select result->>'username' from verify_student),'2468') limit 1))::text,true); perform set_config('request.jwt.claim.sub','',true); perform set_config('request.jwt.claims','{}',true);end$$;
set local role anon;
select pg_temp.check_true(public.complete_realm_assessment((select (result->>'studentId')::uuid from verify_student),null,'space','prep-space','Prep','Prep','pretest','ec700000-0000-0000-0000-000000000001','{"score_percent":95,"correct_count":19,"total_questions":20,"placement_result":{"assessment_evidence":{"comparison_group":"starpath-space-2026-09-14","bank_versions":["2"]}},"question_results":[{"question_id":"synthetic-replay","student_answer":{"points":[[0,0],[1,0],[0,1]]},"correct":true}]}','{"placement_complete":true,"status":"PASSED","next_working_level":"Year 1","unlocked_legends":[]}'),'Real student-session auth accepts synthetic Ground baseline save');
select pg_temp.check_true(not public.complete_realm_assessment((select (result->>'studentId')::uuid from verify_student),null,'space','prep-space','Prep','Prep','pretest','ec700000-0000-0000-0000-000000000001','{"score_percent":95}','{}'),'Live duplicate completion is idempotent');
select pg_temp.check_true((select pretest_score=95 and placement_complete and working_level='Prep' and current_week=1 and required_weeks='[1,2,3,4,5,6,7,8]'::jsonb from public.get_student_realm_progress_compat_secure((select (result->>'studentId')::uuid from verify_student),'space') where is_current),'Live authenticated reload retains Ground and full eight-week pathway');
select pg_temp.check_true((select question_results #>> '{0,student_answer,points,2,1}'='1' and placement_result #>> '{assessment_evidence,comparison_group}'='starpath-space-2026-09-14' from public.get_student_realm_assessments_secure((select (result->>'studentId')::uuid from verify_student),'space','Prep')),'Live assessment read preserves response geometry and comparison metadata');
select pg_temp.check_true(public.complete_realm_assessment((select (result->>'studentId')::uuid from verify_student),null,'space','prep-space','Prep','Prep','posttest','ec700000-0000-0000-0000-000000000002','{"score_percent":100,"correct_count":20,"total_questions":20,"placement_result":{"assessment_evidence":{"comparison_group":"starpath-space-2026-09-14","bank_versions":["2"]}}}','{"status":"PASSED","placement_complete":true,"current_week":8,"required_weeks":[1,2,3,4,5,6,7,8],"unlocked_legends":[]}'),'Live synthetic post-test save succeeds');
select pg_temp.check_true((select count(*)=2 from public.get_student_realm_assessments_secure((select (result->>'studentId')::uuid from verify_student),'space','Prep')),'Live secure read returns separate pre and post attempts');
select pg_temp.check_true((select pretest_score=95 and posttest_score=100 and current_week=8 from public.get_student_realm_progress_compat_secure((select (result->>'studentId')::uuid from verify_student),'space') where is_current),'Live progress read retains both scores and completed week');
rollback;
