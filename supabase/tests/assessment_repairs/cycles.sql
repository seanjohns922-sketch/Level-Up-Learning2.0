-- Run after ground_baselines fixtures in an isolated schema-only database.
begin;
create temporary table cycle_before as select to_jsonb(a) value from public.student_realm_assessments a;
insert into public.student_realm_assessments(student_id,realm_id,program_key,working_level,assessment_type,score_percent,completed_at,placement_result)
values('ed500000-0000-0000-0000-000000000001','statistics','year1-statistica','Year 1','pretest',40,now()-interval '80 days','{"assessment_evidence":{"comparison_group":"repair-test"}}');
insert into public.student_realm_assessments(student_id,realm_id,program_key,working_level,assessment_type,score_percent,completed_at,placement_result)
values('ed500000-0000-0000-0000-000000000001','statistics','year1-statistica','Year 1','pretest',70,now()-interval '40 days','{"assessment_evidence":{"comparison_group":"repair-test"}}');
insert into public.student_realm_assessments(student_id,realm_id,program_key,working_level,assessment_type,score_percent,completed_at,placement_result)
values('ed500000-0000-0000-0000-000000000001','statistics','year1-statistica','Year 1','posttest',90,now()-interval '20 days','{"assessment_evidence":{"comparison_group":"repair-test"}}');
select public.ground_test_assert((select count(distinct placement_result #>> '{assessment_evidence,learning_cycle_id}')=1 from public.student_realm_assessments where realm_id='statistics'),'Baseline retry and post-test share a server-assigned cycle');
select set_config('request.jwt.claim.sub','ed100000-0000-0000-0000-000000000001',false);
select public.ground_test_assert(public.get_school_analytics_snapshot('ed200000-0000-0000-0000-000000000001','ed300000-0000-0000-0000-000000000001',30,null,null,'statistics') #>> '{overview,averageGrowth}'='50.0','Statistics uses the original cycle baseline, not the 70% retry');
insert into public.student_realm_assessments(student_id,realm_id,program_key,working_level,assessment_type,score_percent,completed_at,placement_result)
values('ed500000-0000-0000-0000-000000000001','statistics','year1-statistica','Year 1','pretest',30,now()-interval '10 days','{"assessment_evidence":{"comparison_group":"repair-test"}}');
select public.ground_test_assert((select count(distinct placement_result #>> '{assessment_evidence,learning_cycle_id}')=2 from public.student_realm_assessments where realm_id='statistics'),'A baseline after the completed post-test starts a new cycle');
select public.ground_test_assert(public.get_school_analytics_snapshot('ed200000-0000-0000-0000-000000000001','ed300000-0000-0000-0000-000000000001',30,null,null,'statistics') #>> '{overview,matchedGrowthPairs}'='0','New cycle awaiting post-test does not show the previous cycle growth');
insert into public.student_realm_assessments(student_id,realm_id,program_key,working_level,assessment_type,score_percent,completed_at,placement_result)
values('ed500000-0000-0000-0000-000000000001','statistics','year1-statistica','Year 1','posttest',85,now()-interval '1 day','{"assessment_evidence":{"comparison_group":"repair-test"}}');
select public.ground_test_assert(public.get_school_analytics_snapshot('ed200000-0000-0000-0000-000000000001','ed300000-0000-0000-0000-000000000001',30,null,null,'statistics') #>> '{overview,averageGrowth}'='55.0','Second cycle pairs its own baseline and post-test');
select public.ground_test_assert(not exists(select value from cycle_before except select to_jsonb(a) from public.student_realm_assessments a),'Cycle tracking leaves all historical evidence unchanged');
rollback;
