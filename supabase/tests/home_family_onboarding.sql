begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(41);

select has_function('public','create_home_student_for_parent',array['text','text','text','text','text'],
  'Home family onboarding exposes atomic child creation');
select has_function('public','home_student_login_lookup',array['text','text'],
  'Home learners have a username and PIN login path');
select has_function('public','parent_reset_home_student_pin',array['uuid','text'],
  'Home parents can reset a student PIN');
select has_function('public','parent_change_home_starting_level',array['uuid','text','text'],
  'Home parents can manage an initial working level');
select has_function('public','parent_set_home_starting_levels',array['uuid','text','text','text'],
  'Home parents can confirm realm-specific starting levels atomically');
select has_function('public','parent_reset_home_pretest',array['uuid','text'],
  'Home parents can reopen a pre-test');
select has_function('public','get_student_explorer_code_secure',array['uuid'],
  'Students have a secure read path for their Explorer Code');
select ok(pg_get_functiondef('public.get_student_explorer_code_secure(uuid)'::regprocedure) like '%assert_student_read%',
  'Explorer Code reads use canonical student read authorisation');
select ok(pg_get_functiondef('public.parent_reset_home_pretest(uuid,text)'::regprocedure) not like '%delete from public.student_realm_assessments%',
  'Home pre-test reset preserves immutable assessment history');
select ok(pg_get_functiondef('public.parent_can_manage_home_student(uuid)'::regprocedure) like '%student_school_memberships%'
  and pg_get_functiondef('public.parent_can_manage_home_student(uuid)'::regprocedure) like '%class_enrollments%'
  and pg_get_functiondef('public.parent_can_manage_home_student(uuid)'::regprocedure) like '%access_source = ''school''%',
  'Home management fails closed across every school relationship');

set local role postgres;
insert into auth.users(id,email,aud,role,raw_user_meta_data)
values('e1000000-0000-0000-0000-000000000001','parent@home-onboarding.test','authenticated','authenticated','{"role":"parent"}');
insert into public.user_profiles(user_id,email,display_name,status)
values('e1000000-0000-0000-0000-000000000001','parent@home-onboarding.test','Home Parent','active')
on conflict(user_id) do update set status='active';

set local role authenticated;
select set_config('request.jwt.claim.sub','e1000000-0000-0000-0000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"e1000000-0000-0000-0000-000000000001","user_metadata":{"role":"parent"}}',true);
create temporary table created_home_student as
select public.create_home_student_for_parent('Ava','Fixture','Year 3','Year 2','2468') result;

select ok((select nullif(result->>'studentId','') is not null from created_home_student),
  'Parent creates one canonical Home student');
select ok((select result->>'username' ~ '^ava\.fixture\.[a-f0-9]{6}$' from created_home_student),
  'Server generates a stable-format unique username');
select ok((select result->>'explorerCode' ~ '^LUL-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$' from created_home_student),
  'Server generates a permanent Explorer Code');

set local role postgres;
create temporary table home_ids as
select (result->>'studentId')::uuid student_id, result->>'username' username
from created_home_student;
grant select on home_ids to authenticated, anon;
select is((select count(*) from public.parent_student_links link join home_ids ids on ids.student_id=link.student_id
  where link.parent_user_id='e1000000-0000-0000-0000-000000000001' and link.status='active'),1::bigint,
  'Parent relationship is created atomically');
select is((select count(*) from public.student_access_entitlements entitlement join home_ids ids on ids.student_id=entitlement.student_id
  where entitlement.access_source='home' and entitlement.status='active'),1::bigint,
  'Free Home entitlement is created atomically');
select is((select count(*) from public.student_explorer_codes explorer join home_ids ids on ids.student_id=explorer.student_id
  where explorer.status='active'),1::bigint,
  'Exactly one active Explorer Code exists');
select is((select count(*) from public.student_realm_progress progress join home_ids ids on ids.student_id=progress.student_id
  where progress.is_current),3::bigint,
  'All three live realms receive initial progress');
select is((select count(*) from public.student_realm_progress progress join home_ids ids on ids.student_id=progress.student_id
  where progress.is_current and not progress.placement_complete and progress.current_week is null),3::bigint,
  'Year 1-6 Home learners begin at pre-test');

set local role authenticated;
select ok((public.get_parent_home_student_management((select student_id from home_ids))->>'parentManaged')::boolean,
  'Parent can manage the Home-only child');
select ok(pg_get_functiondef('public.get_parent_home_snapshot()'::regprocedure) like '%''username'', student.username%',
  'Parent snapshot includes usernames for printable Home access cards');
select lives_ok($$select public.parent_set_home_starting_levels(
  (select student_id from home_ids),'Year 3','Year 2','Year 4'
)$$, 'Parent can confirm a different starting level for every realm');
select is((select working_level from public.student_realm_progress progress join home_ids ids on ids.student_id=progress.student_id
  where progress.realm_id='number' and progress.is_current),'Year 3',
  'Number Nexus receives its confirmed starting level');
select is((select working_level from public.student_realm_progress progress join home_ids ids on ids.student_id=progress.student_id
  where progress.realm_id='measurement' and progress.is_current),'Year 2',
  'Measurelands receives its confirmed starting level');
select is((select working_level from public.student_realm_progress progress join home_ids ids on ids.student_id=progress.student_id
  where progress.realm_id='space' and progress.is_current),'Year 4',
  'Starpath receives its confirmed starting level');
select throws_ok($$select public.parent_set_home_starting_levels(
  (select student_id from home_ids),'Year 5','Year 5','Invalid level'
)$$, 'P0001','Invalid working level',
  'An invalid realm level rejects the whole confirmation');
select is((select jsonb_object_agg(progress.realm_id,progress.working_level order by progress.realm_id)
  from public.student_realm_progress progress join home_ids ids on ids.student_id=progress.student_id
  where progress.is_current),
  '{"measurement":"Year 2","number":"Year 3","space":"Year 4"}'::jsonb,
  'Failed confirmation leaves every prior realm level unchanged');
select is((select count(*) from public.home_student_login_lookup((select username from home_ids),'2468')),1::bigint,
  'Home student can log in with generated username and PIN');
select set_config(
  'request.headers',
  json_build_object(
    'x-student-session',
    (select session_token from public.home_student_login_lookup((select username from home_ids),'2468') limit 1)
  )::text,
  true
);
set local role anon;
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claims','{}',true);
select matches(
  public.get_student_explorer_code_secure((select student_id from home_ids)),
  '^LUL-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$',
  'Home student session can read its permanent Explorer Code'
);
select set_config('request.headers','{}',true);
set local role authenticated;
select set_config('request.jwt.claim.sub','e1000000-0000-0000-0000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"e1000000-0000-0000-0000-000000000001","user_metadata":{"role":"parent"}}',true);

set local role postgres;
insert into public.student_access_sessions(student_id,token_hash,expires_at)
select student_id,encode(extensions.digest('old-home-session','sha256'),'hex'),now()+interval '1 day' from home_ids;
set local role authenticated;
select lives_ok($$select public.parent_reset_home_student_pin((select student_id from home_ids),'1357')$$,
  'Home parent can reset the PIN');
set local role postgres;
select ok((select bool_and(session.revoked_at is not null) from public.student_access_sessions session join home_ids ids on ids.student_id=session.student_id),
  'PIN reset revokes existing student sessions');

set local role authenticated;
select lives_ok($$select public.parent_change_home_starting_level((select student_id from home_ids),'number','Year 3')$$,
  'Parent can adjust a starting level before learning begins');
set local role postgres;
select is((select working_level from public.student_realm_progress progress join home_ids ids on ids.student_id=progress.student_id
  where progress.realm_id='number' and progress.is_current),'Year 3',
  'Starting-level change updates canonical current progress');
insert into public.student_realm_assessments(student_id,realm_id,program_key,school_year_level,working_level,assessment_type,score_percent,placement_result,question_results)
select student_id,'number','level-3-number','Year 3','Year 3','pretest',70,'{}','[]' from home_ids;
update public.student_realm_progress set pretest_score=70,pretest_completed_at=now(),placement_complete=true,current_week=1,assigned_week=1
where student_id=(select student_id from home_ids) and realm_id='number' and is_current;
set local role authenticated;
select lives_ok($$select public.parent_reset_home_pretest((select student_id from home_ids),'number')$$,
  'Parent can reopen a pre-test before learning begins');
set local role postgres;
select is((select count(*) from public.student_realm_assessments assessment join home_ids ids on ids.student_id=assessment.student_id
  where assessment.realm_id='number' and assessment.assessment_type='pretest'),1::bigint,
  'Reopening a pre-test preserves the prior snapshot');
set local role authenticated;
select is((select count(*) from public.get_student_realm_assessments_secure((select student_id from home_ids),'number','Year 3')),0::bigint,
  'Superseded pre-test is excluded from the active assessment view');
set local role postgres;
select ok((select not progress.placement_complete and progress.pretest_score is null and progress.current_week is null
  from public.student_realm_progress progress join home_ids ids on ids.student_id=progress.student_id
  where progress.realm_id='number' and progress.is_current),
  'Reopening a pre-test resets only the current placement pointer');
insert into public.student_lesson_attempts(student_id,realm_id,program_key,school_year_level,working_level,week,lesson,lesson_id,attempt_no,completed)
select student_id,'number','level-3-number','Year 3','Year 3',1,1,'home-evidence',1,true from home_ids;
set local role authenticated;
select throws_ok($$select public.parent_change_home_starting_level((select student_id from home_ids),'number','Year 4')$$,
  'P0001','Starting level cannot change after canonical learning has begun',
  'Parent cannot rewrite placement after learning evidence exists');
select throws_ok($$select public.parent_reset_home_pretest((select student_id from home_ids),'number')$$,
  'P0001','Pre-test cannot be reset after canonical learning has begun',
  'Parent cannot reopen pre-test after learning evidence exists');

set local role postgres;
insert into public.schools(id,name,school_code,status)
values('e2000000-0000-0000-0000-000000000001','Handover School','HOMEHAND','active');
insert into public.academic_years(id,school_id,name,calendar_year,starts_on,ends_on,status)
values('e3000000-0000-0000-0000-000000000001','e2000000-0000-0000-0000-000000000001','2026',2026,'2026-01-01','2026-12-31','active');
insert into public.student_school_memberships(student_id,school_id,academic_year_id,status,starts_at,link_method)
select student_id,'e2000000-0000-0000-0000-000000000001','e3000000-0000-0000-0000-000000000001','active',now(),'fixture-handover' from home_ids;
set local role authenticated;
select ok(not (public.get_parent_home_student_management((select student_id from home_ids))->>'parentManaged')::boolean,
  'Active school membership transfers management away from parent');
select throws_ok($$select public.parent_reset_home_student_pin((select student_id from home_ids),'9999')$$,
  '42501','Home student management has transferred to the school',
  'Parent cannot reset PIN after school handover');
select is((select count(*) from public.home_student_login_lookup((select username from home_ids),'1357')),1::bigint,
  'Independent Home login remains valid after school handover');

select * from finish();
rollback;
