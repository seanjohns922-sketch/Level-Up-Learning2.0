begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(30);

set local role postgres;
insert into auth.users (id, email, aud, role)
values
  ('b1000000-0000-0000-0000-000000000001', 'owner@pa2.test', 'authenticated', 'authenticated'),
  ('b1000000-0000-0000-0000-000000000002', 'existing-admin@pa2.test', 'authenticated', 'authenticated'),
  ('b1000000-0000-0000-0000-000000000003', 'teacher@pa2.test', 'authenticated', 'authenticated'),
  ('b1000000-0000-0000-0000-000000000004', 'parent@pa2.test', 'authenticated', 'authenticated');

insert into public.user_profiles (user_id, email, display_name, status)
values
  ('b1000000-0000-0000-0000-000000000001', 'owner@pa2.test', 'PA2 Owner', 'active'),
  ('b1000000-0000-0000-0000-000000000002', 'existing-admin@pa2.test', 'Existing Admin', 'active'),
  ('b1000000-0000-0000-0000-000000000003', 'teacher@pa2.test', 'Cross-school Teacher', 'active'),
  ('b1000000-0000-0000-0000-000000000004', 'parent@pa2.test', 'PA2 Parent', 'active')
on conflict (user_id) do update set status = excluded.status;

insert into public.platform_roles (user_id, role, status)
values ('b1000000-0000-0000-0000-000000000001', 'platform_owner', 'active');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'b1000000-0000-0000-0000-000000000001', true);

select lives_ok(format(
  $$select public.platform_owner_provision_school('PA2 Alpha School','PA2ALPHA','VIC','Government',%s,5,'active',current_date - 1,current_date + 365,'free','existing-admin@pa2.test','PA2 test','create-alpha')$$,
  extract(year from current_date)::integer
), 'atomic school provisioning succeeds');

select lives_ok(format(
  $$select public.platform_owner_provision_school('PA2 Beta School','PA2BETA','NSW','Independent',%s,5,'trial',current_date - 1,current_date + 365,'trial',null,'PA2 test','create-beta')$$,
  extract(year from current_date)::integer
), 'trial school provisioning succeeds');

select throws_ok(format(
  $$select public.platform_owner_provision_school('Duplicate Code','PA2ALPHA','VIC','Government',%s,5,'active',current_date - 1,current_date + 365,'free',null,null,'duplicate-code')$$,
  extract(year from current_date)::integer
), 'P0001', 'School code is already in use', 'duplicate school code is rejected');

set local role postgres;
select is((select count(*) from public.academic_years where school_id = (select id from public.schools where school_code = 'PA2ALPHA')), 1::bigint, 'one explicit academic year is created');
select is((select count(*) from public.school_licence_entitlements where school_id = (select id from public.schools where school_code = 'PA2ALPHA')), 1::bigint, 'one licence is created');
select is((select count(*) from public.school_memberships where school_id = (select id from public.schools where school_code = 'PA2ALPHA') and user_id = 'b1000000-0000-0000-0000-000000000002' and role = 'school_admin' and status = 'active'), 1::bigint, 'existing administrator receives one active membership');

select lives_ok($$select public.platform_owner_assign_school_admin((select id from public.schools where school_code = 'PA2BETA'),'new-admin@pa2.test','invite-beta-1')$$, 'new administrator email creates an invitation');
select lives_ok($$select public.platform_owner_assign_school_admin((select id from public.schools where school_code = 'PA2BETA'),'new-admin@pa2.test','invite-beta-2')$$, 'repeated administrator assignment is idempotent');
select is((select count(*) from public.school_invitations where school_id = (select id from public.schools where school_code = 'PA2BETA') and email = 'new-admin@pa2.test' and status = 'pending'), 1::bigint, 'pending administrator invitation is not duplicated');

set local role postgres;
insert into public.school_memberships (school_id, user_id, role, status)
values
  ((select id from public.schools where school_code = 'PA2ALPHA'), 'b1000000-0000-0000-0000-000000000003', 'teacher', 'active'),
  ((select id from public.schools where school_code = 'PA2BETA'), 'b1000000-0000-0000-0000-000000000003', 'teacher', 'active');

insert into public.students (id, display_name, school_id)
values ('b5000000-0000-0000-0000-000000000001', 'PA2 Student', (select id from public.schools where school_code = 'PA2ALPHA'));

insert into public.student_access_entitlements (student_id, access_source, school_id, academic_year_id, status, billing_status)
values
  ('b5000000-0000-0000-0000-000000000001', 'school', (select id from public.schools where school_code = 'PA2ALPHA'), (select id from public.academic_years where school_id = (select id from public.schools where school_code = 'PA2ALPHA')), 'active', 'free'),
  ('b5000000-0000-0000-0000-000000000001', 'home', null, null, 'active', 'free');

insert into public.parent_student_links (parent_user_id, student_id, relationship, status)
values ('b1000000-0000-0000-0000-000000000004', 'b5000000-0000-0000-0000-000000000001', 'guardian', 'active');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'b1000000-0000-0000-0000-000000000001', true);

select throws_ok($$select public.platform_owner_update_school_access((select id from public.schools where school_code = 'PA2ALPHA'),(select id from public.academic_years where school_id = (select id from public.schools where school_code = 'PA2ALPHA')),0,current_date - 1,current_date + 365,'free',null,null)$$, 'P0001', 'Cannot reduce this school''s seat entitlement to 0. 1 active students currently use school access.', 'seat reduction below active use is blocked');
select throws_ok($$select public.platform_owner_transition_school((select id from public.schools where school_code = 'PA2ALPHA'),'archive','')$$, 'P0001', 'A reason is required', 'archive requires a reason');

select set_config('request.jwt.claim.sub', 'b1000000-0000-0000-0000-000000000002', true);
select throws_ok($$select public.platform_owner_transition_school((select id from public.schools where school_code = 'PA2ALPHA'),'archive','Not allowed')$$, '42501', 'Platform owner access required', 'only Platform Owner can archive');

select set_config('request.jwt.claim.sub', 'b1000000-0000-0000-0000-000000000001', true);
set local role postgres;
select lives_ok($$select public.platform_owner_transition_school((select id from public.schools where school_code = 'PA2BETA'),'pause','Temporary hold')$$, 'trial school can be paused');
select is((select status from public.school_licence_entitlements where school_id = (select id from public.schools where school_code = 'PA2BETA')), 'paused', 'pause makes school access non-operational');
select lives_ok($$select public.platform_owner_transition_school((select id from public.schools where school_code = 'PA2BETA'),'reactivate','Resume trial','trial',current_date - 1,current_date + 365)$$, 'paused school can be reactivated');
select is((select status from public.school_licence_entitlements where school_id = (select id from public.schools where school_code = 'PA2BETA')), 'trial', 'reactivation restores the selected licence state');

select lives_ok($$select public.platform_owner_transition_school((select id from public.schools where school_code = 'PA2ALPHA'),'archive','Trial ended')$$, 'active school can be archived');
select is((select status from public.schools where school_code = 'PA2ALPHA'), 'archived', 'school is canonically archived');
select is((select status from public.student_access_entitlements where student_id = 'b5000000-0000-0000-0000-000000000001' and access_source = 'school'), 'revoked', 'school entitlement is held during archive');
select is((select status from public.student_access_entitlements where student_id = 'b5000000-0000-0000-0000-000000000001' and access_source = 'home'), 'active', 'Home entitlement remains active');
select is((select status from public.parent_student_links where student_id = 'b5000000-0000-0000-0000-000000000001'), 'active', 'parent relationship remains active');
select is((select status from public.school_memberships where school_id = (select id from public.schools where school_code = 'PA2ALPHA') and user_id = 'b1000000-0000-0000-0000-000000000003'), 'inactive', 'archived school membership becomes inactive');
select is((select status from public.school_memberships where school_id = (select id from public.schools where school_code = 'PA2BETA') and user_id = 'b1000000-0000-0000-0000-000000000003'), 'active', 'cross-school membership is unaffected');
select throws_ok($$insert into public.school_invitations (school_id,email,role,status,token_hash,idempotency_key,expires_at) values ((select id from public.schools where school_code = 'PA2ALPHA'),'blocked@pa2.test','teacher','pending','blocked-token','blocked-invite',now() + interval '7 days')$$, 'P0001', 'This school is not currently accepting staff invitations', 'archived school rejects new invitations');

select lives_ok($$select public.platform_owner_transition_school((select id from public.schools where school_code = 'PA2ALPHA'),'restore','School returning','active',current_date - 1,current_date + 365)$$, 'archived school can be restored');
select is((select id from public.students where id = 'b5000000-0000-0000-0000-000000000001'), 'b5000000-0000-0000-0000-000000000001'::uuid, 'restore preserves student identity');
select is((select status from public.student_access_entitlements where student_id = 'b5000000-0000-0000-0000-000000000001' and access_source = 'school'), 'active', 'restore reactivates the held school entitlement');
select is((select count(*) from public.school_memberships where school_id = (select id from public.schools where school_code = 'PA2ALPHA') and user_id = 'b1000000-0000-0000-0000-000000000003'), 1::bigint, 'restore does not duplicate memberships');
select ok((select count(*) >= 3 from public.platform_admin_audit_log where entity_id = (select id::text from public.schools where school_code = 'PA2ALPHA') and action in ('school_created','school_archived','school_restored')), 'lifecycle audit records are written');

set local role postgres;
select throws_ok($$update public.platform_admin_audit_log set reason = 'changed' where action = 'school_archived'$$, '42501', 'Platform audit records are immutable', 'PA2 audit records remain immutable');

select * from finish();
rollback;
