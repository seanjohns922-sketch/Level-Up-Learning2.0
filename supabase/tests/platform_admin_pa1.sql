begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(29);

set local role postgres;
insert into auth.users (id, email, aud, role)
values
  ('a1000000-0000-0000-0000-000000000001', 'owner@pa1.test', 'authenticated', 'authenticated'),
  ('a1000000-0000-0000-0000-000000000002', 'platform-admin@pa1.test', 'authenticated', 'authenticated'),
  ('a1000000-0000-0000-0000-000000000003', 'school-admin@pa1.test', 'authenticated', 'authenticated'),
  ('a1000000-0000-0000-0000-000000000004', 'teacher@pa1.test', 'authenticated', 'authenticated'),
  ('a1000000-0000-0000-0000-000000000005', 'parent@pa1.test', 'authenticated', 'authenticated'),
  ('a1000000-0000-0000-0000-000000000006', 'revoked@pa1.test', 'authenticated', 'authenticated'),
  ('a1000000-0000-0000-0000-000000000007', 'student@pa1.test', 'authenticated', 'authenticated');

insert into public.user_profiles (user_id, email, display_name, status)
values
  ('a1000000-0000-0000-0000-000000000001', 'owner@pa1.test', 'Owner', 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'platform-admin@pa1.test', 'Future Admin', 'active'),
  ('a1000000-0000-0000-0000-000000000003', 'school-admin@pa1.test', 'School Admin', 'active'),
  ('a1000000-0000-0000-0000-000000000004', 'teacher@pa1.test', 'Teacher', 'active'),
  ('a1000000-0000-0000-0000-000000000005', 'parent@pa1.test', 'Parent', 'active'),
  ('a1000000-0000-0000-0000-000000000006', 'revoked@pa1.test', 'Revoked Owner', 'active'),
  ('a1000000-0000-0000-0000-000000000007', 'student@pa1.test', 'Student', 'active')
on conflict (user_id) do update set status = excluded.status;

insert into public.platform_roles (user_id, role, status)
values
  ('a1000000-0000-0000-0000-000000000001', 'platform_owner', 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'platform_admin', 'active'),
  ('a1000000-0000-0000-0000-000000000006', 'platform_owner', 'revoked');

insert into public.schools (id, name, school_code, status, created_by)
values ('a2000000-0000-0000-0000-000000000001', 'PA1 School', 'PA1TEST', 'active', 'a1000000-0000-0000-0000-000000000001');

insert into public.academic_years (id, school_id, name, calendar_year, starts_on, ends_on, status, created_by)
values ('a3000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000001', '2090', 2090, '2090-01-01', '2090-12-31', 'planned', 'a1000000-0000-0000-0000-000000000001');

insert into public.school_licence_entitlements (
  id, school_id, academic_year_id, status, seat_limit, start_date, end_date, billing_status, created_by
) values (
  'a4000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000001',
  'a3000000-0000-0000-0000-000000000001', 'active', 4, current_date - 1, current_date + 365,
  'free', 'a1000000-0000-0000-0000-000000000001'
);

insert into public.school_memberships (school_id, user_id, role, status)
values
  ('a2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'school_admin', 'active'),
  ('a2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'teacher', 'active');

insert into public.students (id, display_name, school_id)
values
  ('a5000000-0000-0000-0000-000000000001', 'School Only', 'a2000000-0000-0000-0000-000000000001'),
  ('a5000000-0000-0000-0000-000000000002', 'School Home', 'a2000000-0000-0000-0000-000000000001'),
  ('a5000000-0000-0000-0000-000000000003', 'Home Only', null),
  ('a5000000-0000-0000-0000-000000000004', 'Inactive', null),
  ('a5000000-0000-0000-0000-000000000005', 'Archive Test', 'a2000000-0000-0000-0000-000000000001');

insert into public.student_access_entitlements (
  student_id, access_source, school_id, academic_year_id, status, billing_status
) values
  ('a5000000-0000-0000-0000-000000000001', 'school', 'a2000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000001', 'active', 'free'),
  ('a5000000-0000-0000-0000-000000000002', 'school', 'a2000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000001', 'active', 'free'),
  ('a5000000-0000-0000-0000-000000000002', 'home', null, null, 'active', 'free'),
  ('a5000000-0000-0000-0000-000000000003', 'home', null, null, 'active', 'free'),
  ('a5000000-0000-0000-0000-000000000005', 'school', 'a2000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000001', 'active', 'free');

update public.students
set archived_at = now()
where id = 'a5000000-0000-0000-0000-000000000005';

insert into public.parent_student_links (parent_user_id, student_id, relationship, status)
values
  ('a1000000-0000-0000-0000-000000000005', 'a5000000-0000-0000-0000-000000000001', 'guardian', 'active'),
  ('a1000000-0000-0000-0000-000000000005', 'a5000000-0000-0000-0000-000000000002', 'guardian', 'active');

set local role authenticated;

select set_config('request.jwt.claim.sub', 'a1000000-0000-0000-0000-000000000001', true);
select ok(public.is_platform_owner(), 'canonical active Platform Owner is allowed');
select is(public.get_platform_admin_access_context()->>'role', 'platform_owner', 'access context exposes the canonical owner role');
select lives_ok($$ select public.get_platform_admin_overview() $$, 'Platform Owner reads the overview');
select lives_ok($$ select public.get_platform_admin_school_summaries() $$, 'Platform Owner reads all school summaries');
select lives_ok($$ select public.get_platform_admin_school_detail('a2000000-0000-0000-0000-000000000001') $$, 'Platform Owner reads school detail');
select is((public.get_platform_admin_school_detail('a2000000-0000-0000-0000-000000000001')->'licence'->>'used')::integer, 2, 'archived students do not consume active school seats');

select set_config('request.jwt.claim.sub', 'a1000000-0000-0000-0000-000000000002', true);
select ok(not public.is_platform_owner(), 'future platform_admin is not elevated during PA1');
select throws_ok($$ select public.get_platform_admin_overview() $$, '42501', 'Platform owner access required', 'platform_admin is denied during PA1');

select set_config('request.jwt.claim.sub', 'a1000000-0000-0000-0000-000000000003', true);
select throws_ok($$ select public.get_platform_admin_school_summaries() $$, '42501', 'Platform owner access required', 'school admin is denied');
select throws_ok($$ select public.platform_owner_update_school_access('a2000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000001', 5, current_date - 1, current_date + 365, 'free', null, null) $$, '42501', 'Platform owner access required', 'school admin cannot change seats');

select set_config('request.jwt.claim.sub', 'a1000000-0000-0000-0000-000000000004', true);
select throws_ok($$ select public.get_platform_admin_overview() $$, '42501', 'Platform owner access required', 'teacher is denied');
select throws_ok($$ select public.platform_owner_update_school_access('a2000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000001', 5, current_date - 1, current_date + 365, 'free', null, null) $$, '42501', 'Platform owner access required', 'teacher cannot change seats');

select set_config('request.jwt.claim.sub', 'a1000000-0000-0000-0000-000000000005', true);
select throws_ok($$ select public.get_platform_admin_overview() $$, '42501', 'Platform owner access required', 'parent is denied');

select set_config('request.jwt.claim.sub', 'a1000000-0000-0000-0000-000000000007', true);
select throws_ok($$ select public.get_platform_admin_overview() $$, '42501', 'Platform owner access required', 'student is denied');

select set_config('request.jwt.claim.sub', 'a1000000-0000-0000-0000-000000000006', true);
select ok(not public.is_platform_owner(), 'revoked Platform Owner is denied');

select set_config('request.jwt.claim.sub', '', true);
select ok(not public.is_platform_owner(), 'forged unauthenticated URL has no Platform Owner access');

select set_config('request.jwt.claim.sub', 'a1000000-0000-0000-0000-000000000001', true);
select lives_ok($$ select public.platform_owner_update_school_access('a2000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000001', 6, current_date - 1, current_date + 365, 'free', 'PA1 test', 'Approved capacity increase') $$, 'Platform Owner changes the seat entitlement');
select is((public.get_platform_admin_school_detail('a2000000-0000-0000-0000-000000000001')->'licence'->>'seatLimit')::integer, 6, 'seat entitlement is updated');
select throws_ok($$ select public.platform_owner_update_school_access('a2000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000001', 1, current_date - 1, current_date + 365, 'free', null, null) $$, 'P0001', 'Cannot reduce this school''s seat entitlement to 1. 2 active students currently use school access.', 'unsafe seat reduction is blocked');
select ok(
  exists (
    select 1
    from jsonb_array_elements(public.get_platform_admin_audit(50)) entry
    where entry->>'action' = 'seat_limit_changed'
  ),
  'seat change creates an audit record'
);
select is((public.get_platform_admin_school_detail('a2000000-0000-0000-0000-000000000001')->'home'->>'schoolOnly')::integer, 1, 'school-only access is segmented canonically');
select is((public.get_platform_admin_school_detail('a2000000-0000-0000-0000-000000000001')->'home'->>'schoolAndHome')::integer, 1, 'school-and-home access is segmented canonically');
select is((public.get_platform_admin_school_detail('a2000000-0000-0000-0000-000000000001')->'home'->>'parentLinkedNoHome')::integer, 1, 'parent linking without home access is reported separately');
select is((public.get_platform_admin_overview()->'students'->>'homeOnly')::integer, 1, 'home-only access is segmented canonically');
select is((public.get_platform_admin_overview()->'students'->>'inactive')::integer, 2, 'inactive and historical students are segmented canonically');
select is(
  (public.get_platform_admin_overview()->'students'->>'total')::integer,
  (public.get_platform_admin_overview()->'students'->>'schoolOnly')::integer
    + (public.get_platform_admin_overview()->'students'->>'schoolAndHome')::integer
    + (public.get_platform_admin_overview()->'students'->>'homeOnly')::integer
    + (public.get_platform_admin_overview()->'students'->>'inactive')::integer,
  'canonical students are counted once across access segments'
);
select is((public.get_platform_admin_overview()->'students'->>'freeHome')::integer, 2, 'free billing classification does not block home access');

set local role postgres;
select throws_ok($$ update public.platform_admin_audit_log set reason = 'changed' $$, '42501', 'Platform audit records are immutable', 'audit records cannot be updated');
set local role authenticated;
select set_config('request.jwt.claim.sub', 'a1000000-0000-0000-0000-000000000001', true);
select is((public.get_platform_admin_school_detail('a2000000-0000-0000-0000-000000000001')->'home'->>'parentLinkedNoHome')::integer, 1, 'parent linking does not fabricate home access');

select * from finish();
rollback;
