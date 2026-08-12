begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(68);

select has_function('public','get_student_identity_merge_conflicts',array['uuid','uuid'],
  'PA4 exposes deterministic merge conflict detection');
select has_function('public','confirm_parent_child_link',array['text','text','text'],
  'Parent confirmation requires Explorer Code, PIN and relationship');
select has_function('public','student_belonged_to_school_at',array['uuid','uuid','timestamp with time zone','uuid'],
  'Historical school attribution is available');
select function_returns('public','can_access_student',array['uuid'],'boolean',
  'Canonical access predicate remains boolean');
select ok(pg_get_functiondef('public.can_access_student_read(uuid)'::regprocedure) like '%archived_at is null%'
  and pg_get_functiondef('public.can_write_student(uuid)'::regprocedure) like '%archived_at is null%',
  'Archived students are denied by canonical read and write predicates');
select ok(pg_get_functiondef('public.can_access_student_read(uuid)'::regprocedure) like '%identity_status%'
  and pg_get_functiondef('public.can_write_student(uuid)'::regprocedure) like '%identity_status%',
  'Merged students are denied by canonical read and write predicates');
select ok(pg_get_functiondef('public.resolve_student_identity_merge(uuid,boolean,text)'::regprocedure) like '%get_student_identity_merge_conflicts%',
  'Merge approval rechecks conflicts');
select ok(pg_get_functiondef('public.resolve_student_identity_merge(uuid,boolean,text)'::regprocedure) like '%student_access_sessions%',
  'Merge revokes duplicate student sessions');
select ok(pg_get_functiondef('public.resolve_student_identity_merge(uuid,boolean,text)'::regprocedure) like '%student_access_credentials%',
  'Merge revokes duplicate credentials');
select ok(pg_get_functiondef('public.confirm_parent_child_link(text,text,text)'::regprocedure) like '%credential_type=''pin''%',
  'Parent linking verifies the child PIN');
select ok(pg_get_functiondef('public.get_platform_admin_school_detail(uuid)'::regprocedure) like '%student_belonged_to_school_at%',
  'School detail uses event-time attribution');
select has_function('public','can_access_student_read',array['uuid'],
  'PA4 exposes a canonical student read predicate');
select has_function('public','can_write_student',array['uuid'],
  'PA4 exposes a canonical student write predicate');
select ok(pg_get_functiondef('public.can_access_student_read(uuid)'::regprocedure) like '%parent_student_links%',
  'Read predicate can include active parent links');
select ok(pg_get_functiondef('public.can_write_student(uuid)'::regprocedure) not like '%parent_student_links%',
  'Write predicate does not include parent links');
select ok(pg_get_functiondef('public.assert_student_access(uuid)'::regprocedure) like '%assert_student_write%',
  'Legacy student assertion is now a write assertion');
select ok(pg_get_functiondef('public.get_student_realm_progress_compat_secure(uuid,text)'::regprocedure) like '%assert_student_read%',
  'Student progress read RPC uses the read assertion');
select ok(not has_function_privilege('authenticated','public.resolve_student_identity_merge_pa4_internal(uuid,boolean,text)','EXECUTE'),
  'Unsafe internal merge implementation is not directly executable');
select ok(to_regprocedure('public.confirm_parent_child_link(text,text)') is null,
  'Explorer-Code-only confirmation no longer exists');

set local role postgres;
insert into auth.users(id,email,aud,role,raw_user_meta_data)
values
  ('f1000000-0000-0000-0000-000000000001','owner@pa4-safety.test','authenticated','authenticated','{}'),
  ('f1000000-0000-0000-0000-000000000002','parent@pa4-safety.test','authenticated','authenticated','{"role":"parent"}'),
  ('f1000000-0000-0000-0000-000000000003','teacher@pa4-safety.test','authenticated','authenticated','{}');

insert into public.user_profiles(user_id,email,display_name,status)
values
  ('f1000000-0000-0000-0000-000000000001','owner@pa4-safety.test','PA4 Owner','active'),
  ('f1000000-0000-0000-0000-000000000002','parent@pa4-safety.test','PA4 Parent','active'),
  ('f1000000-0000-0000-0000-000000000003','teacher@pa4-safety.test','PA4 Teacher','active')
on conflict(user_id) do update set status=excluded.status;

insert into public.platform_roles(user_id,role,status)
values('f1000000-0000-0000-0000-000000000001','platform_owner','active');

insert into public.schools(id,name,school_code,status)
values
  ('f2000000-0000-0000-0000-000000000001','PA4 School A','PA4SAFEA','active'),
  ('f2000000-0000-0000-0000-000000000002','PA4 School B','PA4SAFEB','active');

insert into public.academic_years(id,school_id,name,calendar_year,starts_on,ends_on,status)
values
  ('f3000000-0000-0000-0000-000000000001','f2000000-0000-0000-0000-000000000001','2026',2026,'2026-01-01','2026-12-31','active'),
  ('f3000000-0000-0000-0000-000000000002','f2000000-0000-0000-0000-000000000002','2026',2026,'2026-01-01','2026-12-31','active');

insert into public.school_licence_entitlements(school_id,academic_year_id,status,seat_limit,start_date,end_date,billing_status)
values
  ('f2000000-0000-0000-0000-000000000001','f3000000-0000-0000-0000-000000000001','active',100,'2026-01-01','2026-12-31','free'),
  ('f2000000-0000-0000-0000-000000000002','f3000000-0000-0000-0000-000000000002','active',100,'2026-01-01','2026-12-31','free');

insert into public.classes(id,name,class_code,teacher_id,school_id,academic_year,academic_year_id,status)
values
  ('f4000000-0000-0000-0000-000000000001','PA4 Class A','PA4CLASSA','f1000000-0000-0000-0000-000000000003','f2000000-0000-0000-0000-000000000001',2026,'f3000000-0000-0000-0000-000000000001','active'),
  ('f4000000-0000-0000-0000-000000000002','PA4 Class B','PA4CLASSB','f1000000-0000-0000-0000-000000000003','f2000000-0000-0000-0000-000000000002',2026,'f3000000-0000-0000-0000-000000000002','active');

insert into public.students(id,display_name,school_id,pin)
values
  ('f5000000-0000-0000-0000-000000000001','Conflict Survivor','f2000000-0000-0000-0000-000000000001','1111'),
  ('f5000000-0000-0000-0000-000000000002','Conflict Duplicate','f2000000-0000-0000-0000-000000000002','2222'),
  ('f5000000-0000-0000-0000-000000000003','Safe Survivor','f2000000-0000-0000-0000-000000000001','3333'),
  ('f5000000-0000-0000-0000-000000000004','Safe Duplicate','f2000000-0000-0000-0000-000000000001','4443'),
  ('f5000000-0000-0000-0000-000000000005','Parent Link Target',null,'4444'),
  ('f5000000-0000-0000-0000-000000000006','Transfer Student','f2000000-0000-0000-0000-000000000002','5555');

-- Every protected domain exists on both conflict identities. This request must
-- remain blocked rather than combining competing educational meaning.
insert into public.student_realm_progress(student_id,realm_id,program_key,working_level,current_week)
values
  ('f5000000-0000-0000-0000-000000000001','number','level-3','Level 3',2),
  ('f5000000-0000-0000-0000-000000000002','number','level-4','Level 4',5);
insert into public.student_economy_wallets(student_id,xp_earned,essence)
values
  ('f5000000-0000-0000-0000-000000000001',10,1),
  ('f5000000-0000-0000-0000-000000000002',20,2);
insert into public.economy_items(item_key,name,description,category,realm_id,rarity,icon,purchasable,discoverable)
values('collectible_quartz','PA4 Quartz','PA4 merge fixture','collectible','number','common','fixture',false,true);
insert into public.student_inventory(student_id,item_key,acquisition_type)
values
  ('f5000000-0000-0000-0000-000000000001','collectible_quartz','reward'),
  ('f5000000-0000-0000-0000-000000000002','collectible_quartz','reward');
insert into public.parent_student_links(parent_user_id,student_id,relationship,status)
values
  ('f1000000-0000-0000-0000-000000000002','f5000000-0000-0000-0000-000000000001','guardian','active'),
  ('f1000000-0000-0000-0000-000000000002','f5000000-0000-0000-0000-000000000002','guardian','active');
insert into public.student_access_entitlements(student_id,access_source,school_id,academic_year_id,status,billing_status,starts_at)
values
  ('f5000000-0000-0000-0000-000000000001','home',null,null,'active','free',now()-interval '40 days'),
  ('f5000000-0000-0000-0000-000000000002','home',null,null,'active','free',now()-interval '40 days'),
  ('f5000000-0000-0000-0000-000000000001','school','f2000000-0000-0000-0000-000000000001','f3000000-0000-0000-0000-000000000001','active','free',now()-interval '40 days'),
  ('f5000000-0000-0000-0000-000000000002','school','f2000000-0000-0000-0000-000000000002','f3000000-0000-0000-0000-000000000002','active','free',now()-interval '40 days');
insert into public.student_school_memberships(student_id,school_id,academic_year_id,status,starts_at,ended_at)
values
  ('f5000000-0000-0000-0000-000000000001','f2000000-0000-0000-0000-000000000001','f3000000-0000-0000-0000-000000000001','ended',now()-interval '40 days',now()-interval '20 days'),
  ('f5000000-0000-0000-0000-000000000002','f2000000-0000-0000-0000-000000000002','f3000000-0000-0000-0000-000000000002','ended',now()-interval '40 days',now()-interval '20 days');
insert into public.class_enrollments(student_id,class_id,school_id,academic_year_id,is_primary,status,enrolled_at,ended_at)
values
  ('f5000000-0000-0000-0000-000000000001','f4000000-0000-0000-0000-000000000001','f2000000-0000-0000-0000-000000000001','f3000000-0000-0000-0000-000000000001',false,'ended',now()-interval '40 days',now()-interval '20 days'),
  ('f5000000-0000-0000-0000-000000000002','f4000000-0000-0000-0000-000000000002','f2000000-0000-0000-0000-000000000002','f3000000-0000-0000-0000-000000000002',false,'ended',now()-interval '40 days',now()-interval '20 days');

select is(jsonb_array_length(public.get_student_identity_merge_conflicts(
  'f5000000-0000-0000-0000-000000000001','f5000000-0000-0000-0000-000000000002')),8,
  'all eight competing identity domains are detected');
set local role authenticated;
select set_config('request.jwt.claim.sub','f1000000-0000-0000-0000-000000000001',true);

select lives_ok($$select public.request_student_identity_merge(
  'f5000000-0000-0000-0000-000000000001','f5000000-0000-0000-0000-000000000002','conflict fixture')$$,
  'conflicted identities can be submitted for explicit review');
set local role postgres;
select is((select preview->>'mergeable' from public.student_identity_merge_requests
  where survivor_student_id='f5000000-0000-0000-0000-000000000001' order by created_at desc limit 1),'false',
  'conflicted merge preview is marked unmergeable');

create or replace function pg_temp.capture_merge_failure(p_request_id uuid)
returns text language plpgsql as $$
begin
  perform public.resolve_student_identity_merge(p_request_id,true,'attempt blocked merge');
  return 'NO ERROR';
exception when others then
  return sqlstate||':'||sqlerrm;
end;
$$;
select alike(pg_temp.capture_merge_failure((select id from public.student_identity_merge_requests
  where survivor_student_id='f5000000-0000-0000-0000-000000000001' order by created_at desc limit 1)),
  'P0001:Merge blocked by unresolved identity conflicts:%','ambiguous merge fails closed');
select is((select status from public.student_identity_merge_requests
  where survivor_student_id='f5000000-0000-0000-0000-000000000001' order by created_at desc limit 1),'pending',
  'blocked merge request remains pending');
select is((select count(*) from public.students where id in(
  'f5000000-0000-0000-0000-000000000001','f5000000-0000-0000-0000-000000000002')
  and identity_status='active' and archived_at is null),2::bigint,'blocked merge leaves both identities active');

-- One-sided economy state can move because no competing canonical state exists.
set local role postgres;
insert into public.student_economy_transactions(student_id,transaction_type,xp_delta,essence_delta,source_type,source_key)
values('f5000000-0000-0000-0000-000000000004','earn',25,3,'fixture','one-sided-economy');
insert into public.student_economy_wallets(student_id,xp_earned,xp_spent,essence)
values('f5000000-0000-0000-0000-000000000004',25,0,3);
insert into public.student_access_sessions(student_id,token_hash,expires_at)
values('f5000000-0000-0000-0000-000000000004',encode(extensions.digest('retired-token','sha256'),'hex'),now()+interval '1 day');
insert into public.student_access_credentials(student_id,credential_type,credential_secret)
values('f5000000-0000-0000-0000-000000000004','pin','4443');

set local role authenticated;
select set_config('request.jwt.claim.sub','f1000000-0000-0000-0000-000000000001',true);
select lives_ok($$select public.request_student_identity_merge(
  'f5000000-0000-0000-0000-000000000003','f5000000-0000-0000-0000-000000000004','one-sided fixture')$$,
  'one-sided identity merge can be requested');
set local role postgres;
select is((select preview->>'mergeable' from public.student_identity_merge_requests
  where survivor_student_id='f5000000-0000-0000-0000-000000000003' order by created_at desc limit 1),'true',
  'one-sided merge preview is mergeable');
select lives_ok($$select public.resolve_student_identity_merge((select id from public.student_identity_merge_requests
  where survivor_student_id='f5000000-0000-0000-0000-000000000003' order by created_at desc limit 1),true,'approved fixture')$$,
  'one-sided merge resolves successfully');
select is((select identity_status from public.students where id='f5000000-0000-0000-0000-000000000004'),'merged',
  'duplicate identity is retired');
select ok((select revoked_at is not null from public.student_access_sessions where student_id='f5000000-0000-0000-0000-000000000004'),
  'duplicate student session is revoked');
select ok((select revoked_at is not null from public.student_access_credentials where student_id='f5000000-0000-0000-0000-000000000004'),
  'duplicate student credential is revoked');
select set_config('request.headers','{"x-student-session":"retired-token"}',true);
select ok(not public.can_access_student('f5000000-0000-0000-0000-000000000004'),
  'retired duplicate session cannot access the merged identity');
select is((select count(*) from public.student_economy_transactions
  where student_id='f5000000-0000-0000-0000-000000000003' and source_key='one-sided-economy'),1::bigint,
  'one-sided economy transaction moves to survivor');
select is((select count(*) from public.student_economy_transactions
  where student_id='f5000000-0000-0000-0000-000000000004'),0::bigint,
  'retired duplicate no longer owns economy transactions');
select is((select xp_earned from public.student_economy_wallets
  where student_id='f5000000-0000-0000-0000-000000000003'),25,
  'survivor wallet preserves earned XP');
select is((select essence from public.student_economy_wallets
  where student_id='f5000000-0000-0000-0000-000000000003'),3,
  'survivor wallet preserves essence');

-- Parent linking stores unsuccessful attempts and requires both permanent
-- Explorer Code possession and the child's current PIN.
set local role postgres;
delete from public.student_explorer_codes
where student_id='f5000000-0000-0000-0000-000000000005';
insert into public.student_explorer_codes(student_id,code,code_normalised)
values('f5000000-0000-0000-0000-000000000005','LUL-2345-6789','LUL23456789');
update public.students
set class_id='f4000000-0000-0000-0000-000000000001',
    school_id='f2000000-0000-0000-0000-000000000001',
    school_year_level='Year 3',
    year_level='Year 3'
where id='f5000000-0000-0000-0000-000000000005';
insert into public.class_enrollments(student_id,class_id,school_id,academic_year_id,is_primary,status)
values('f5000000-0000-0000-0000-000000000005','f4000000-0000-0000-0000-000000000001','f2000000-0000-0000-0000-000000000001','f3000000-0000-0000-0000-000000000001',true,'active')
on conflict(student_id,class_id) do update set status='active', ended_at=null, is_primary=true;
insert into public.student_realm_progress(student_id,class_id,realm_id,program_key,school_year_level,working_level,current_week,required_weeks)
values('f5000000-0000-0000-0000-000000000005','f4000000-0000-0000-0000-000000000001','number','level-3-number','Year 3','Year 3',2,'[1,2]'::jsonb);
insert into public.student_weekly_quiz_attempts(student_id,class_id,realm_id,program_key,school_year_level,working_level,week,quiz_id,correct_count,total_questions,accuracy_percent,passed)
values('f5000000-0000-0000-0000-000000000005','f4000000-0000-0000-0000-000000000001','number','level-3-number','Year 3','Year 3',1,'fixture-quiz',8,10,80,true);
insert into public.student_realm_assessments(student_id,class_id,realm_id,program_key,school_year_level,working_level,assessment_type,correct_count,total_questions,score_percent,passed)
values('f5000000-0000-0000-0000-000000000005','f4000000-0000-0000-0000-000000000001','number','level-3-number','Year 3','Year 3','pretest',8,10,80,false);
set local role authenticated;
select set_config('request.jwt.claim.sub','f1000000-0000-0000-0000-000000000002',true);
select is(public.preview_parent_child_link('LUL-AAAA-BBBB')->>'matched','false',
  'invalid Explorer Code returns a neutral result');
set local role postgres;
select is((select count(*) from public.parent_link_attempts where parent_user_id='f1000000-0000-0000-0000-000000000002' and outcome='not_matched'),1::bigint,
  'invalid Explorer Code attempt is retained');
set local role authenticated;
select is(public.confirm_parent_child_link('LUL-2345-6789','0000','guardian')->>'linked','false',
  'wrong child PIN does not create a parent link');
set local role postgres;
select is((select count(*) from public.parent_link_attempts where parent_user_id='f1000000-0000-0000-0000-000000000002' and outcome='pin_not_matched'),1::bigint,
  'wrong PIN attempt is retained for throttling and audit');
set local role authenticated;
select is(public.confirm_parent_child_link('LUL-2345-6789','4444','guardian')->>'linked','true',
  'Explorer Code plus current PIN links the child');
set local role postgres;
select is((select count(*) from public.parent_student_links where parent_user_id='f1000000-0000-0000-0000-000000000002'
  and student_id='f5000000-0000-0000-0000-000000000005' and status='active'),1::bigint,
  'verified parent link is active');
set local role authenticated;
select lives_ok($$select public.get_parent_home_snapshot()$$,
  'linked parent can read the parent home snapshot');
select lives_ok($$select public.get_parent_child_realm_snapshot('f5000000-0000-0000-0000-000000000005','number')$$,
  'linked parent can read the child realm snapshot');
select lives_ok($$select public.get_student_realm_progress_compat_secure('f5000000-0000-0000-0000-000000000005','number')$$,
  'linked parent can read child realm progress through read predicate');
select lives_ok($$select public.get_student_realm_weekly_quiz_attempts_secure('f5000000-0000-0000-0000-000000000005','number','Year 3')$$,
  'linked parent can read child quiz results through read predicate');
select lives_ok($$select public.get_student_realm_assessments_secure('f5000000-0000-0000-0000-000000000005','number','Year 3')$$,
  'linked parent can read child assessment results through read predicate');
select throws_ok($$select public.complete_realm_lesson('f5000000-0000-0000-0000-000000000005','f4000000-0000-0000-0000-000000000001','number','level-3-number','Year 3','Year 3',1,1,'fixture-lesson','10000000-0000-0000-0000-000000000001','{}'::jsonb,40)$$,
  '42501','Student write access denied','linked parent cannot complete a lesson');
select throws_ok($$select public.complete_realm_quiz('f5000000-0000-0000-0000-000000000005','f4000000-0000-0000-0000-000000000001','number','level-3-number','Year 3','Year 3',1,'fixture-quiz-parent','10000000-0000-0000-0000-000000000002','{}'::jsonb,0)$$,
  '42501','Student write access denied','linked parent cannot submit a weekly quiz');
select throws_ok($$select public.complete_realm_assessment('f5000000-0000-0000-0000-000000000005','f4000000-0000-0000-0000-000000000001','number','level-3-number','Year 3','Year 3','pretest','10000000-0000-0000-0000-000000000003','{}'::jsonb,'{}'::jsonb)$$,
  '42501','Student write access denied','linked parent cannot submit a pre-test');
select throws_ok($$select public.complete_realm_assessment('f5000000-0000-0000-0000-000000000005','f4000000-0000-0000-0000-000000000001','number','level-3-number','Year 3','Year 3','posttest','10000000-0000-0000-0000-000000000004','{}'::jsonb,'{}'::jsonb)$$,
  '42501','Student write access denied','linked parent cannot submit a post-test');
select throws_ok($$select public.save_student_realm_progress_secure('f5000000-0000-0000-0000-000000000005','f4000000-0000-0000-0000-000000000001','number','level-3-number','Year 3','Year 3','{"current_week":8}'::jsonb)$$,
  '42501','Student write access denied','linked parent cannot advance progression');
select throws_ok($$select public.save_student_realm_progress_secure('f5000000-0000-0000-0000-000000000005','f4000000-0000-0000-0000-000000000001','number','level-3-number','Year 3','Year 3','{"unlocked_legends":["numbot-builder"]}'::jsonb)$$,
  '42501','Student write access denied','linked parent cannot unlock cards');
select throws_ok($$select public.upsert_student_activity_daily_secure('f5000000-0000-0000-0000-000000000005','f4000000-0000-0000-0000-000000000001',current_date,1,1,1,0,60,10)$$,
  '42501','Student write access denied','linked parent cannot award XP or alter streak evidence');
select throws_ok($$select public.evaluate_gems_secure('f5000000-0000-0000-0000-000000000005','parent-negative','fixture')$$,
  '42501','Student write access denied','linked parent cannot award gems');
select throws_ok($$select public.discover_realm_collectible_secure('f5000000-0000-0000-0000-000000000005','number','10000000-0000-0000-0000-000000000005')$$,
  '42501','Student write access denied','linked parent cannot create economy discovery transactions');
select throws_ok($$select public.purchase_economy_item_secure('f5000000-0000-0000-0000-000000000005','avatar_nexus_hoodie','10000000-0000-0000-0000-000000000006')$$,
  '42501','Student write access denied','linked parent cannot purchase inventory');
select throws_ok($$select public.equip_economy_item_secure('f5000000-0000-0000-0000-000000000005','avatar_nexus_hoodie')$$,
  '42501','Student write access denied','linked parent cannot alter equipped inventory');
select throws_ok($$select public.set_student_avatar_base_secure('f5000000-0000-0000-0000-000000000005','{"skin":"warm"}'::jsonb)$$,
  '42501','Student write access denied','linked parent cannot alter avatar state');
select throws_ok($$select public.unequip_economy_slot_secure('f5000000-0000-0000-0000-000000000005','avatar')$$,
  '42501','Student write access denied','linked parent cannot unequip inventory');
select throws_ok($$select public.set_favourite_gem_secure('f5000000-0000-0000-0000-000000000005',gen_random_uuid())$$,
  '42501','Student write access denied','linked parent cannot alter gem display');
select throws_ok($$select public.record_realmie_product_event_secure('f5000000-0000-0000-0000-000000000005','realmies_room_opened',null,'number','parent-negative',null,'{}'::jsonb)$$,
  '42501','Student write access denied','linked parent cannot unlock or mutate Realmies surfaces');

set local role postgres;
insert into public.student_access_sessions(student_id,token_hash,expires_at)
values('f5000000-0000-0000-0000-000000000005',encode(extensions.digest('student-positive-token','sha256'),'hex'),now()+interval '1 day');
set local role authenticated;
select set_config('request.jwt.claim.sub','',true);
select set_config('request.headers','{"x-student-session":"student-positive-token"}',true);
select lives_ok($$select public.complete_realm_lesson('f5000000-0000-0000-0000-000000000005','f4000000-0000-0000-0000-000000000001','number','level-3-number','Year 3','Year 3',1,2,'fixture-lesson-student','10000000-0000-0000-0000-000000000007','{}'::jsonb,40)$$,
  'student session can still complete a lesson');
select set_config('request.headers','{}',true);
select set_config('request.jwt.claim.sub','f1000000-0000-0000-0000-000000000003',true);
select lives_ok($$select public.complete_realm_quiz('f5000000-0000-0000-0000-000000000005','f4000000-0000-0000-0000-000000000001','number','level-3-number','Year 3','Year 3',2,'fixture-quiz-teacher','10000000-0000-0000-0000-000000000008','{}'::jsonb,0)$$,
  'authorised teacher flow can still submit a quiz');

-- A transfer changes current access without assigning historical activity to
-- the new school.
set local role postgres;
insert into public.student_school_memberships(student_id,school_id,academic_year_id,status,starts_at,ended_at,link_method)
values
  ('f5000000-0000-0000-0000-000000000006','f2000000-0000-0000-0000-000000000001','f3000000-0000-0000-0000-000000000001','ended',now()-interval '30 days',now()-interval '10 days','fixture-transfer'),
  ('f5000000-0000-0000-0000-000000000006','f2000000-0000-0000-0000-000000000002','f3000000-0000-0000-0000-000000000002','active',now()-interval '9 days',null,'fixture-transfer');
select ok(public.student_belonged_to_school_at('f5000000-0000-0000-0000-000000000006','f2000000-0000-0000-0000-000000000001',now()-interval '20 days'),
  'School A owns activity completed before transfer');
select ok(not public.student_belonged_to_school_at('f5000000-0000-0000-0000-000000000006','f2000000-0000-0000-0000-000000000002',now()-interval '20 days'),
  'School B cannot see activity from before transfer');
select ok(public.student_belonged_to_school_at('f5000000-0000-0000-0000-000000000006','f2000000-0000-0000-0000-000000000002',now()),
  'School B owns activity completed after transfer');
select ok(not public.student_belonged_to_school_at('f5000000-0000-0000-0000-000000000006','f2000000-0000-0000-0000-000000000001',now()),
  'School A cannot see activity completed after transfer');

select * from finish();
rollback;
