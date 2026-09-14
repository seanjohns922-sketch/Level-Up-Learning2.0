-- Run after ground_baselines fixtures and the repair migrations in an isolated schema-only database.
begin;
select set_config('request.jwt.claim.sub','ed100000-0000-0000-0000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"ed100000-0000-0000-0000-000000000001","user_metadata":{"role":"parent"}}',true);
select public.teacher_change_starting_level('ed500000-0000-0000-0000-000000000001','number','Year 1','pretest');
create temporary table repair_before as select to_jsonb(a) value from public.student_realm_assessments a;
set role authenticated;
select public.teacher_reset_pretest('ed500000-0000-0000-0000-000000000001','number');
reset role;
select public.ground_test_assert(not exists(select value from repair_before except select to_jsonb(a) from public.student_realm_assessments a),'Higher-level teacher reset preserves every assessment row and its original score');
select public.ground_test_assert((select not placement_complete from public.student_realm_progress where student_id='ed500000-0000-0000-0000-000000000001' and realm_id='number' and is_current),'Retained higher-level history does not complete reset placement');
set role authenticated;
select public.ground_test_assert((select count(*)=3 from public.get_student_realm_assessments_secure('ed500000-0000-0000-0000-000000000001','number','Year 1')),'Secure history retains both baseline attempts and post-test after higher-level reset');
reset role;

rollback;
