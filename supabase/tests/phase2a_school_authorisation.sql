begin;

create extension if not exists pgtap with schema extensions;
select plan(36);

insert into auth.users (id, email, aud, role)
values
  ('10000000-0000-0000-0000-000000000001', 'admin-a@example.test', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000002', 'principal-a@example.test', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000003', 'teacher-a@example.test', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000004', 'support-a@example.test', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000005', 'teacher-b@example.test', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000006', 'parent@example.test', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000007', 'platform@example.test', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000008', 'revoked@example.test', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000009', 'student@example.test', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into public.platform_roles (user_id, role, status)
values ('10000000-0000-0000-0000-000000000007', 'platform_admin', 'active');

insert into public.schools (id, name, school_code, status)
values
  ('20000000-0000-0000-0000-000000000001', 'School A', 'P2ASCHA', 'active'),
  ('20000000-0000-0000-0000-000000000002', 'School B', 'P2ASCHB', 'active');

insert into public.school_memberships (school_id, user_id, role, status)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'school_admin', 'active'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'principal', 'active'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'teacher', 'active'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'support_staff', 'active'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'teacher', 'active'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'teacher', 'revoked');

insert into public.academic_years (
  id, school_id, name, calendar_year, starts_on, ends_on, status
)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '2026', 2026, '2026-01-01', '2026-12-31', 'active'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '2026', 2026, '2026-01-01', '2026-12-31', 'active');

insert into public.classes (
  id, name, class_code, teacher_id, school_id, academic_year,
  academic_year_id, status
)
values
  ('40000000-0000-0000-0000-000000000001', 'A Homeroom', 'P2ACLASSA', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 2026, '30000000-0000-0000-0000-000000000001', 'active'),
  ('40000000-0000-0000-0000-000000000002', 'A Specialist', 'P2ASPECA', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 2026, '30000000-0000-0000-0000-000000000001', 'active'),
  ('40000000-0000-0000-0000-000000000003', 'B Homeroom', 'P2ACLASSB', '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 2026, '30000000-0000-0000-0000-000000000002', 'active');

insert into public.class_staff_memberships (
  class_id, school_id, user_id, role, status
)
values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'lead_teacher', 'active'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'support_staff', 'active'),
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'teacher', 'active'),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'lead_teacher', 'active');

insert into public.students (id, display_name, school_id, class_id)
values
  ('50000000-0000-0000-0000-000000000001', 'Student A', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000003', 'Student A Support', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000002', 'Student B', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003');

insert into public.class_enrollments (
  student_id, class_id, school_id, academic_year_id, is_primary, status
)
values
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', true, 'active'),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', true, 'active'),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', true, 'active');

insert into public.student_staff_assignments (
  student_id, school_id, user_id, role, status
)
values (
  '50000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000004',
  'support_staff',
  'active'
);

set local role authenticated;

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select ok(public.can_manage_school('20000000-0000-0000-0000-000000000001'), 'school admin manages own school');
select ok(public.can_view_student('50000000-0000-0000-0000-000000000001'), 'school admin views school student');
select ok(public.can_manage_class('40000000-0000-0000-0000-000000000002'), 'school admin manages every school class');
select ok(not public.can_view_school('20000000-0000-0000-0000-000000000002'), 'school admin cannot cross tenant boundary');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select ok(public.can_view_school('20000000-0000-0000-0000-000000000001'), 'principal views school');
select ok(public.can_view_student_learning('50000000-0000-0000-0000-000000000001'), 'principal views school learning');
select ok(not public.can_manage_school('20000000-0000-0000-0000-000000000001'), 'principal does not administer school');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select ok(public.can_view_class('40000000-0000-0000-0000-000000000002'), 'teacher views another active school class');
select ok(public.can_manage_class('40000000-0000-0000-0000-000000000001'), 'teacher manages assigned class');
select ok(not public.can_manage_class('40000000-0000-0000-0000-000000000002'), 'teacher cannot manage unassigned class');
select ok(public.can_override_student_progress('50000000-0000-0000-0000-000000000001'), 'assigned teacher may override student progress');
select ok(not public.can_view_student('50000000-0000-0000-0000-000000000002'), 'teacher cannot view another school student');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000004', true);
select ok(public.can_view_class('40000000-0000-0000-0000-000000000002'), 'support staff views assigned class');
select ok(not public.can_manage_class('40000000-0000-0000-0000-000000000002'), 'support staff cannot manage assigned class');
select ok(not public.can_view_student('50000000-0000-0000-0000-000000000001'), 'support staff cannot view an unassigned student');
select ok(public.can_view_student('50000000-0000-0000-0000-000000000003'), 'support staff views specifically assigned student');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000006', true);
select ok(not public.can_view_school('20000000-0000-0000-0000-000000000001'), 'parent has no school tenancy access');
select ok(not public.can_override_student_progress('50000000-0000-0000-0000-000000000001'), 'parent cannot override progression');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000007', true);
select ok(public.is_platform_admin(), 'platform administrator role is explicit');
select ok(public.can_manage_school('20000000-0000-0000-0000-000000000002'), 'platform administrator can manage a school');
select ok(public.record_school_access('20000000-0000-0000-0000-000000000002', 'phase2a_test') > 0, 'platform school access writes an audit record');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000008', true);
select ok(not public.can_view_class('40000000-0000-0000-0000-000000000001'), 'revoked staff member loses class access');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000009', true);
select ok(not public.can_view_school('20000000-0000-0000-0000-000000000001'), 'student account has no school route access');

select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename = 'progress'
      and policyname in (
        'Parents can update linked progress',
        'Parents can insert linked progress'
      )
  ),
  0,
  'unsafe parent progression write policies are removed'
);

select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename = 'schools'
      and cmd in ('INSERT', 'ALL')
      and roles @> array['authenticated']::name[]
  ),
  0,
  'authenticated users cannot directly create schools'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select is(
  public.get_school_home_snapshot('20000000-0000-0000-0000-000000000001')->'school'->>'name',
  'School A',
  'school administrator receives own school snapshot'
);
select is(
  jsonb_array_length(public.get_school_home_snapshot('20000000-0000-0000-0000-000000000001')->'classes'),
  2,
  'school snapshot lists all active school classes'
);
select is(
  (public.get_school_home_snapshot('20000000-0000-0000-0000-000000000001')->'academicYears'->0->>'activeStudentCount')::integer,
  2,
  'school snapshot counts unique active students for the academic year'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select is(
  public.get_school_home_snapshot('20000000-0000-0000-0000-000000000001')->'permissions'->>'canCreateClass',
  'false',
  'principal class creation remains capability controlled'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select is(
  public.get_school_home_snapshot('20000000-0000-0000-0000-000000000001')->'permissions'->>'canCreateClass',
  'true',
  'teacher can create a class under the current school policy'
);
select is(
  jsonb_array_length(public.get_my_school_contexts()),
  1,
  'school switcher contains only authorised schools'
);
select throws_ok(
  $$ select public.get_school_home_snapshot('20000000-0000-0000-0000-000000000002') $$,
  '42501',
  'School access denied',
  'cross-school snapshot access is denied'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000004', true);
select is(
  (
    select count(*)::integer
    from jsonb_array_elements(
      public.get_school_home_snapshot('20000000-0000-0000-0000-000000000001')->'classes'
    ) class_row
    where (class_row->>'canOpen')::boolean
  ),
  1,
  'support staff can open only canonically assigned class data'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000006', true);
select throws_ok(
  $$ select public.get_school_home_snapshot('20000000-0000-0000-0000-000000000001') $$,
  '42501',
  'School access denied',
  'parent cannot load School Home'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000008', true);
select throws_ok(
  $$ select public.get_school_home_snapshot('20000000-0000-0000-0000-000000000001') $$,
  '42501',
  'School access denied',
  'revoked educator cannot load School Home'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000009', true);
select throws_ok(
  $$ select public.get_school_home_snapshot('20000000-0000-0000-0000-000000000001') $$,
  '42501',
  'School access denied',
  'student cannot load School Home'
);

select * from finish();
rollback;
