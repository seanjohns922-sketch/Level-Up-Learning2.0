select public.ground_test_assert(not exists(select value from preserved_progress except select to_jsonb(t) from public.student_realm_progress t),'Migration preserves every existing progress row');
select public.ground_test_assert(not exists(select value from preserved_students except select to_jsonb(t) from public.students t),'Migration preserves existing learner identity and placement');
set role authenticated;
create temporary table new_ground as select public.create_home_student_for_parent('New','Fixture','Prep','Prep','2468') result;
grant select on new_ground to anon;
reset role;
select public.ground_test_assert((select count(*)=3 from public.student_realm_placement where student_id=(select (result->>'studentId')::uuid from new_ground) and assigned_entry_mode='pretest'),'New Home Ground entry requires a pretest in all three realms');
-- Parent may read student progress, but completion must use the actual student session.
reset role;
select public.ground_test_assert((select count(*)=3 from public.student_realm_progress where student_id=(select (result->>'studentId')::uuid from new_ground) and not placement_complete and current_week is null),'New Home baseline is genuinely uncompleted');
set role authenticated;
do $$begin perform set_config('request.headers',jsonb_build_object('x-student-session',(select session_token from public.home_student_login_lookup((select result->>'username' from new_ground),'2468') limit 1))::text,false);perform set_config('request.jwt.claim.sub','',false);perform set_config('request.jwt.claims','{}',false);end$$;
set role anon;
do $$declare realm text; student uuid:=(select (result->>'studentId')::uuid from new_ground); receipt uuid; required jsonb; before_count int; begin
 foreach realm in array array['number','measurement','space'] loop
 receipt:=gen_random_uuid();required:=case when realm='number' then '[1,2,3,4,5,6,7,8,9,10,11,12]'::jsonb else '[1,2,3,4,5,6,7,8]'::jsonb end;
 perform public.ground_test_assert(public.complete_realm_assessment(student,null,realm,public.realm_program_key('Prep',realm),'Prep','Prep','pretest',receipt,jsonb_build_object('score_percent',95,'placement_result',jsonb_build_object('assessment_evidence',jsonb_build_object('comparison_group','ground-'||realm||'-2026-09-14')),'question_results','[{"question_id":"synthetic-baseline","student_answer":"3","correct":true}]'::jsonb),'{"status":"PASSED","placement_complete":true,"next_working_level":"Year 1"}'),realm||' baseline saves with real student-session auth');
 perform public.ground_test_assert(not public.complete_realm_assessment(student,null,realm,public.realm_program_key('Prep',realm),'Prep','Prep','pretest',receipt,'{"score_percent":95}','{}'),realm||' duplicate retry does not duplicate an attempt');
 perform public.ground_test_assert((select status='ASSIGNED_PROGRAM' and current_week=1 and placement_complete and required_weeks=required and pretest_score=95 from public.get_student_realm_progress_compat_secure(student,realm) where is_current),realm||' high baseline retains Ground and full program');
 perform public.ground_test_assert((select count(*)=1 from public.get_student_realm_assessments_secure(student,realm,'Prep')),realm||' baseline reloads');
 end loop;
end$$;
-- Parent reset preserves history, while the canonical placement flag reopens entry.
reset role;
select set_config('request.jwt.claim.sub','ed100000-0000-0000-0000-000000000001',false);
select set_config('request.jwt.claims','{"sub":"ed100000-0000-0000-0000-000000000001","user_metadata":{"role":"parent"}}',false);
select set_config('request.headers','{}',false);
set role authenticated;
select public.parent_reset_home_pretest((select (result->>'studentId')::uuid from new_ground),'number');
select public.ground_test_assert((select count(*)=1 from public.get_student_realm_assessments_secure((select (result->>'studentId')::uuid from new_ground),'number','Prep')),'Parent reopening keeps original Ground baseline visible in secure history');
select public.parent_change_home_starting_level((select (result->>'studentId')::uuid from new_ground),'measurement','Year 1');
select public.parent_change_home_starting_level((select (result->>'studentId')::uuid from new_ground),'measurement','Prep');
reset role;
select public.ground_test_assert((select not placement_complete and current_week is null from public.student_realm_progress where student_id=(select (result->>'studentId')::uuid from new_ground) and realm_id='measurement' and is_current),'Parent choosing Ground requests its baseline');
-- Establish a synthetic school teacher and class to exercise real teacher ownership.
insert into public.teachers(id,user_id,email) values('ed100000-0000-0000-0000-000000000001','ed100000-0000-0000-0000-000000000001','ground-parent@example.invalid') on conflict(id) do nothing;
insert into public.schools(id,name,school_code,status) values('ed200000-0000-0000-0000-000000000001','Synthetic Baseline School','GROUNDQA','active');
insert into public.school_memberships(school_id,user_id,role,status) values('ed200000-0000-0000-0000-000000000001','ed100000-0000-0000-0000-000000000001','teacher','active');
insert into public.academic_years(id,school_id,name,calendar_year,starts_on,ends_on,status) values('ed300000-0000-0000-0000-000000000001','ed200000-0000-0000-0000-000000000001','2026',2026,'2026-01-01','2026-12-31','active');
insert into public.classes(id,name,code,class_code,teacher_id,teacher_user_id,school_id,academic_year_id,status) values('ed400000-0000-0000-0000-000000000001','Synthetic Class','GROUNDQACLASS','GROUNDQACLASS','ed100000-0000-0000-0000-000000000001','ed100000-0000-0000-0000-000000000001','ed200000-0000-0000-0000-000000000001','ed300000-0000-0000-0000-000000000001','active');
insert into public.students(id,display_name,class_id,school_id,year_level,school_year_level) values('ed500000-0000-0000-0000-000000000001','Synthetic School Learner','ed400000-0000-0000-0000-000000000001','ed200000-0000-0000-0000-000000000001','Prep','Prep');
set role authenticated;
select public.teacher_change_starting_level('ed500000-0000-0000-0000-000000000001','number','Prep','pretest');
select public.teacher_change_starting_level('ed500000-0000-0000-0000-000000000001','measurement','Prep','pretest');
reset role;
select public.ground_test_assert((select count(*)=2 from public.student_realm_progress where student_id='ed500000-0000-0000-0000-000000000001' and not placement_complete),'Teacher Ground placements create uncompleted baselines');
select public.ground_test_assert((select count(*)=2 from public.student_realm_placement where student_id='ed500000-0000-0000-0000-000000000001' and assigned_entry_mode='pretest'),'Teacher pretest entry survives placement constraints');
-- Preserve the existing learner through all other learners' operations.
select public.ground_test_assert(not exists(select value from preserved_progress except select to_jsonb(t) from public.student_realm_progress t),'Other learners onboarding and assessment saves leave existing progress untouched');
insert into public.school_licence_entitlements(school_id,academic_year_id,status,seat_limit,start_date,end_date,billing_status) values('ed200000-0000-0000-0000-000000000001','ed300000-0000-0000-0000-000000000001','active',100,current_date-1,current_date+365,'free');
-- Reporting reads the original version-compatible Ground baseline, but keeps
-- higher-level Number reporting unchanged.
insert into public.student_access_entitlements(student_id,access_source,school_id,academic_year_id,status,billing_status) values('ed500000-0000-0000-0000-000000000001','school','ed200000-0000-0000-0000-000000000001','ed300000-0000-0000-0000-000000000001','active','free');
insert into public.class_enrollments(student_id,class_id,school_id,academic_year_id,status,is_primary) values('ed500000-0000-0000-0000-000000000001','ed400000-0000-0000-0000-000000000001','ed200000-0000-0000-0000-000000000001','ed300000-0000-0000-0000-000000000001','active',true);
insert into public.student_realm_assessments(student_id,realm_id,program_key,working_level,assessment_type,score_percent,completed_at,placement_result)
select 'ed500000-0000-0000-0000-000000000001',r.realm,public.realm_program_key('Prep',r.realm),'Prep',t.kind,t.score,now()-t.days*interval '1 day',jsonb_build_object('assessment_evidence',jsonb_build_object('comparison_group','ground-'||r.realm||'-2026-09-14')) from (values('number'),('measurement')) r(realm) cross join (values('pretest',40,90),('pretest',75,10),('posttest',90,1)) t(kind,score,days);
insert into public.student_realm_assessments(student_id,realm_id,program_key,working_level,assessment_type,score_percent,completed_at)
select 'ed500000-0000-0000-0000-000000000001','number',public.realm_program_key('Year 1','number'),'Year 1',t.kind,t.score,now()-t.days*interval '1 day' from (values('pretest',40,90),('pretest',70,10),('posttest',90,1)) t(kind,score,days);
set role authenticated;
select public.ground_test_assert(public.get_school_analytics_snapshot('ed200000-0000-0000-0000-000000000001','ed300000-0000-0000-0000-000000000001',30,null,null,'measurement') #>> '{overview,averageGrowth}'='50.0','Teacher measurement growth uses original baseline even outside reporting window');
select public.ground_test_assert(public.get_school_analytics_snapshot('ed200000-0000-0000-0000-000000000001','ed300000-0000-0000-0000-000000000001',30,null,null,'number') #>> '{overview,averageGrowth}'='35.0','Number reporting combines Ground original-baseline growth with unchanged higher-level growth');
select public.teacher_reset_pretest('ed500000-0000-0000-0000-000000000001','number');
reset role;
select public.ground_test_assert((select count(*)=4 from public.student_realm_assessments where student_id='ed500000-0000-0000-0000-000000000001' and realm_id='number' and assessment_type='pretest'),'Ground teacher reset preserves both Ground and higher-level history');
insert into public.student_realm_assessments(student_id,realm_id,program_key,working_level,assessment_type,score_percent,completed_at,placement_result) values('ed500000-0000-0000-0000-000000000001','measurement','prep-measurelands','Prep','posttest',100,now(),'{"assessment_evidence":{"comparison_group":"incompatible-bank"}}');
set role authenticated;
select public.ground_test_assert(public.get_school_analytics_snapshot('ed200000-0000-0000-0000-000000000001','ed300000-0000-0000-0000-000000000001',30,null,null,'measurement') #>> '{overview,matchedGrowthPairs}'='0','Teacher reporting excludes incompatible Ground assessment versions');
reset role;
