-- Run in a NEW psql connection after after.sql, against the isolated fixture DB.
-- Demonstrates committed attempt persistence and a fresh student login.
create temporary table returning_student as select id,username from public.students where first_name='New' and last_name='Fixture';
select public.ground_test_assert((select count(*)=1 from returning_student),'Fresh connection finds the committed synthetic learner');
grant select on returning_student to anon;
do $$begin perform set_config('request.headers',jsonb_build_object('x-student-session',(select session_token from public.home_student_login_lookup((select username from returning_student),'2468') limit 1))::text,false);end$$;
set role anon;
do $$declare realm text; student uuid:=(select id from returning_student); weeks int; before_count int; begin
 foreach realm in array array['number','measurement','space'] loop
 weeks:=case when realm='number' then 12 else 8 end;
 perform public.ground_test_assert((select count(*)=1 from public.get_student_realm_assessments_secure(student,realm,'Prep')),realm||' original baseline survives reconnection/reopening');
 perform public.complete_realm_assessment(student,null,realm,public.realm_program_key('Prep',realm),'Prep','Prep','pretest',gen_random_uuid(),'{"score_percent":40}', '{"placement_complete":true,"status":"ASSIGNED_PROGRAM"}');
 perform public.complete_realm_assessment(student,null,realm,public.realm_program_key('Prep',realm),'Prep','Prep','posttest',gen_random_uuid(),'{"score_percent":90,"question_results":[{"question_id":"synthetic-post","student_answer":"4","correct":true}]}',jsonb_build_object('placement_complete',true,'status','PASSED','current_week',weeks));
 perform public.ground_test_assert((select count(*)=3 from public.get_student_realm_assessments_secure(student,realm,'Prep')),realm||' first baseline, retest and post-test remain separate');
 perform public.ground_test_assert((select pretest_score=40 and posttest_score=90 and current_week=weeks from public.get_student_realm_progress_compat_secure(student,realm) where is_current),realm||' completed Ground reloads both scores and final week');
 select count(*) into before_count from public.get_student_realm_assessments_secure(student,realm,'Prep');
 begin
 perform public.complete_realm_assessment(student,null,realm,public.realm_program_key('Prep',realm),'Prep','Prep','posttest',gen_random_uuid(),'{"score_percent":90}','{"current_week":"bad-integer"}');
 raise exception 'Expected a failed progress save';
 exception when invalid_text_representation then null;
 end;
 perform public.ground_test_assert((select count(*)=before_count from public.get_student_realm_assessments_secure(student,realm,'Prep')),realm||' failed progress save rolls back the assessment');
 end loop;
end$$;
