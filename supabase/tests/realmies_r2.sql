begin;

create extension if not exists pgtap with schema extensions;
select plan(56);

select is(
  (
    select count(*)::integer
    from public.realmie_catalogue
    where is_active and category = 'legend' and variant_type = 'standard'
  ),
  18,
  'catalogue contains exactly 18 active standard Legend Realmies'
);
select is(
  (select count(distinct realmie_key)::integer from public.realmie_catalogue),
  (select count(*)::integer from public.realmie_catalogue),
  'Realmie keys are globally unique'
);
select is(
  (
    select count(*)::integer
    from public.realmie_catalogue
    where active_for_standard_completion
      and realm_id in ('number', 'measurement', 'space')
      and evolution_level between 1 and 6
  ),
  18,
  'all 18 canonical realm and level mappings exist'
);
select is(
  (select count(*)::integer from public.realmie_catalogue where character_key = 'datara'),
  0,
  'Datara is not seeded'
);
select is(
  (select count(*)::integer from public.realmie_catalogue where category = 'pet'),
  0,
  'Pet Realmies are not seeded'
);
select is(
  (
    select count(*)::integer
    from public.realmie_catalogue
    where is_active
      and asset_path is null
      and silhouette_asset_path is null
      and metadata->>'asset_status' = 'missing'
  ),
  18,
  'missing R3 artwork is explicit and non-fatal'
);
select ok(
  not has_table_privilege('anon', 'public.student_realmies', 'INSERT'),
  'anon cannot directly insert ownership'
);
select ok(
  not has_table_privilege('authenticated', 'public.student_realmies', 'INSERT'),
  'authenticated users cannot directly insert ownership'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.grant_standard_realmie_for_canonical_posttest(uuid,text,text,uuid,uuid,boolean)',
    'EXECUTE'
  ),
  'teachers and authenticated clients cannot execute the grant evaluator'
);

insert into auth.users (id, email, aud, role)
values
  ('91000000-0000-0000-0000-000000000001', 'realmie-student-a@example.test', 'authenticated', 'authenticated'),
  ('91000000-0000-0000-0000-000000000002', 'realmie-student-b@example.test', 'authenticated', 'authenticated'),
  ('91000000-0000-0000-0000-000000000003', 'realmie-student-c@example.test', 'authenticated', 'authenticated'),
  ('91000000-0000-0000-0000-000000000004', 'realmie-student-d@example.test', 'authenticated', 'authenticated'),
  ('91000000-0000-0000-0000-000000000005', 'realmie-student-e@example.test', 'authenticated', 'authenticated'),
  ('91000000-0000-0000-0000-000000000006', 'realmie-outsider@example.test', 'authenticated', 'authenticated'),
  ('91000000-0000-0000-0000-000000000007', 'realmie-teacher@example.test', 'authenticated', 'authenticated'),
  ('91000000-0000-0000-0000-000000000008', 'realmie-parent@example.test', 'authenticated', 'authenticated'),
  ('91000000-0000-0000-0000-000000000009', 'realmie-student-f@example.test', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into public.schools (id, name, school_code, status, created_by)
values
  ('91500000-0000-0000-0000-000000000001', 'Realmies School A', 'R2SCHA', 'active', '91000000-0000-0000-0000-000000000007'),
  ('91500000-0000-0000-0000-000000000002', 'Realmies School B', 'R2SCHB', 'active', '91000000-0000-0000-0000-000000000006');

insert into public.school_memberships (school_id, user_id, role, status)
values
  ('91500000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000007', 'teacher', 'active'),
  ('91500000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000006', 'teacher', 'active');

insert into public.classes (id, name, class_code, teacher_id, school_id)
values
  ('92000000-0000-0000-0000-000000000001', 'Realmies Test Class', 'R2REALM', '91000000-0000-0000-0000-000000000007', '91500000-0000-0000-0000-000000000001'),
  ('92000000-0000-0000-0000-000000000002', 'Realmies Other School Class', 'R2OUTS', '91000000-0000-0000-0000-000000000006', '91500000-0000-0000-0000-000000000002');

insert into public.class_staff_memberships (
  class_id, school_id, user_id, role, status
)
values
  ('92000000-0000-0000-0000-000000000001', '91500000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000007', 'lead_teacher', 'active'),
  ('92000000-0000-0000-0000-000000000002', '91500000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000006', 'lead_teacher', 'active');

insert into public.students (
  id, display_name, class_id, school_id,
  school_year_level, working_level, year_level
)
values
  ('93000000-0000-0000-0000-000000000001', 'Realmie Student A', '92000000-0000-0000-0000-000000000001', '91500000-0000-0000-0000-000000000001', 'Year 1', 'Year 1', 'Year 1'),
  ('93000000-0000-0000-0000-000000000002', 'Realmie Student B', '92000000-0000-0000-0000-000000000001', '91500000-0000-0000-0000-000000000001', 'Year 2', 'Year 2', 'Year 2'),
  ('93000000-0000-0000-0000-000000000003', 'Realmie Student C', '92000000-0000-0000-0000-000000000001', '91500000-0000-0000-0000-000000000001', 'Year 2', 'Year 2', 'Year 2'),
  ('93000000-0000-0000-0000-000000000004', 'Realmie Student D', '92000000-0000-0000-0000-000000000001', '91500000-0000-0000-0000-000000000001', 'Year 3', 'Year 3', 'Year 3'),
  ('93000000-0000-0000-0000-000000000005', 'Realmie Student E', '92000000-0000-0000-0000-000000000001', '91500000-0000-0000-0000-000000000001', 'Year 4', 'Year 4', 'Year 4'),
  ('93000000-0000-0000-0000-000000000006', 'Realmie Student F', '92000000-0000-0000-0000-000000000002', '91500000-0000-0000-0000-000000000002', 'Year 1', 'Year 1', 'Year 1');

insert into public.student_access_sessions(student_id, token_hash, expires_at)
values
  ('93000000-0000-0000-0000-000000000001', encode(extensions.digest('realmie-token-a', 'sha256'), 'hex'), now() + interval '1 hour'),
  ('93000000-0000-0000-0000-000000000002', encode(extensions.digest('realmie-token-b', 'sha256'), 'hex'), now() + interval '1 hour'),
  ('93000000-0000-0000-0000-000000000003', encode(extensions.digest('realmie-token-c', 'sha256'), 'hex'), now() + interval '1 hour'),
  ('93000000-0000-0000-0000-000000000004', encode(extensions.digest('realmie-token-d', 'sha256'), 'hex'), now() + interval '1 hour'),
  ('93000000-0000-0000-0000-000000000005', encode(extensions.digest('realmie-token-e', 'sha256'), 'hex'), now() + interval '1 hour'),
  ('93000000-0000-0000-0000-000000000006', encode(extensions.digest('realmie-token-f', 'sha256'), 'hex'), now() + interval '1 hour');

insert into public.class_enrollments (
  student_id, class_id, school_id, status, is_primary
)
select student.id, student.class_id, student.school_id, 'active', true
from public.students student
where student.id between
  '93000000-0000-0000-0000-000000000001'
  and '93000000-0000-0000-0000-000000000006';

insert into public.student_realm_progress (
  student_id, class_id, realm_id, program_key, school_year_level,
  working_level, is_current, status, current_week, assigned_week,
  placement_complete, posttest_score, posttest_completed_at
)
values
  ('93000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000001', 'number', 'year1-number', 'Year 1', 'Year 1', true, 'PASSED', 12, 12, true, 85, now()),
  ('93000000-0000-0000-0000-000000000002', '92000000-0000-0000-0000-000000000001', 'number', 'year2-number', 'Year 2', 'Year 2', true, 'ASSIGNED_PROGRAM', 12, 12, true, 84, now()),
  ('93000000-0000-0000-0000-000000000003', '92000000-0000-0000-0000-000000000001', 'measurement', 'year2-measurelands', 'Year 2', 'Year 2', true, 'PASSED', 8, 8, true, 91, now()),
  ('93000000-0000-0000-0000-000000000004', '92000000-0000-0000-0000-000000000001', 'space', 'year3-starpath', 'Year 3', 'Year 3', true, 'ASSIGNED_PROGRAM', 8, 8, true, 84, now()),
  ('93000000-0000-0000-0000-000000000004', '92000000-0000-0000-0000-000000000001', 'number', 'year7-number', 'Year 7', 'Year 7', true, 'PASSED', 12, 12, true, 90, now());

insert into public.student_realm_assessments (
  id, student_id, class_id, realm_id, program_key, school_year_level,
  working_level, assessment_type, correct_count, total_questions,
  score_percent, passed, completed_at
)
values
  ('94000000-0000-0000-0000-000000000001', '93000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000001', 'number', 'year1-number', 'Year 1', 'Year 1', 'posttest', 17, 20, 85, true, now()),
  ('94000000-0000-0000-0000-000000000002', '93000000-0000-0000-0000-000000000002', '92000000-0000-0000-0000-000000000001', 'number', 'year2-number', 'Year 2', 'Year 2', 'posttest', 16, 20, 84, false, now()),
  ('94000000-0000-0000-0000-000000000003', '93000000-0000-0000-0000-000000000003', '92000000-0000-0000-0000-000000000001', 'measurement', 'year2-measurelands', 'Year 2', 'Year 2', 'posttest', 18, 20, 91, true, now()),
  ('94000000-0000-0000-0000-000000000004', '93000000-0000-0000-0000-000000000004', '92000000-0000-0000-0000-000000000001', 'space', 'year3-starpath', 'Year 3', 'Year 3', 'posttest', 16, 20, 84, false, now()),
  ('94000000-0000-0000-0000-000000000005', '93000000-0000-0000-0000-000000000004', '92000000-0000-0000-0000-000000000001', 'number', 'year7-number', 'Year 7', 'Year 7', 'posttest', 18, 20, 90, true, now()),
  ('94000000-0000-0000-0000-000000000006', '93000000-0000-0000-0000-000000000003', '92000000-0000-0000-0000-000000000001', 'measurement', 'year2-measurelands', 'Year 2', 'Year 2', 'pretest', 18, 20, 90, true, now());

insert into public.student_weekly_quiz_attempts (
  id, student_id, class_id, realm_id, program_key, school_year_level,
  working_level, week, quiz_id, attempt_no, correct_count,
  total_questions, accuracy_percent, passed
)
values (
  '94000000-0000-0000-0000-000000000007',
  '93000000-0000-0000-0000-000000000003',
  '92000000-0000-0000-0000-000000000001',
  'measurement',
  'year2-measurelands',
  'Year 2',
  'Year 2',
  1,
  'year2-measurement-w1-quiz',
  1,
  15,
  15,
  100,
  true
);

select is(
  public.grant_standard_realmie_for_canonical_posttest(
    '93000000-0000-0000-0000-000000000001', 'number', 'Year 1',
    '94000000-0000-0000-0000-000000000001',
    '95000000-0000-0000-0000-000000000001', false
  )->>'granted',
  'true',
  '85 percent passed post-test grants the matching Realmie'
);
select is(
  (select count(*)::integer from public.student_realmies where student_id = '93000000-0000-0000-0000-000000000001'),
  1,
  'eligible student receives one ownership row'
);
select is(
  (select count(*)::integer from public.realmie_unlock_receipts where student_id = '93000000-0000-0000-0000-000000000001'),
  1,
  'eligible student receives one immutable receipt'
);
select is(
  public.grant_standard_realmie_for_canonical_posttest(
    '93000000-0000-0000-0000-000000000001', 'number', 'Year 1',
    '94000000-0000-0000-0000-000000000001',
    '95000000-0000-0000-0000-000000000001', false
  )->>'already_owned',
  'true',
  'retry returns existing ownership'
);
select is(
  (select count(*)::integer from public.student_realmies where student_id = '93000000-0000-0000-0000-000000000001'),
  1,
  'retry does not duplicate ownership'
);
select is(
  (select count(*)::integer from public.realmie_unlock_receipts where student_id = '93000000-0000-0000-0000-000000000001'),
  1,
  'retry does not duplicate receipts'
);
select is(
  public.grant_standard_realmie_for_canonical_posttest(
    '93000000-0000-0000-0000-000000000002', 'number', 'Year 2',
    '94000000-0000-0000-0000-000000000002',
    '95000000-0000-0000-0000-000000000002', false
  )->>'granted',
  'false',
  '84 percent post-test does not grant'
);
select is(
  (select count(*)::integer from public.student_realmies where student_id = '93000000-0000-0000-0000-000000000002'),
  0,
  'below-threshold student has no ownership'
);
select throws_ok(
  $$ select public.grant_standard_realmie_for_canonical_posttest(
    '93000000-0000-0000-0000-000000000003', 'measurement', 'Year 2',
    '94000000-0000-0000-0000-000000000006',
    '95000000-0000-0000-0000-000000000003', false
  ) $$,
  'Canonical passed post-test was not found',
  'pre-test cannot grant a standard Realmie'
);
select throws_ok(
  $$ select public.grant_standard_realmie_for_canonical_posttest(
    '93000000-0000-0000-0000-000000000003', 'measurement', 'Year 2',
    '94000000-0000-0000-0000-000000000007',
    '95000000-0000-0000-0000-000000000006', false
  ) $$,
  'Canonical passed post-test was not found',
  'weekly quiz cannot grant a standard Realmie'
);
select throws_ok(
  $$ select public.grant_standard_realmie_for_canonical_posttest(
    '93000000-0000-0000-0000-000000000001', 'measurement', 'Year 1',
    '94000000-0000-0000-0000-000000000001',
    '95000000-0000-0000-0000-000000000004', false
  ) $$,
  'Canonical passed post-test was not found',
  'wrong realm cannot grant'
);
select throws_ok(
  $$ select public.grant_standard_realmie_for_canonical_posttest(
    '93000000-0000-0000-0000-000000000004', 'number', 'Year 7',
    '94000000-0000-0000-0000-000000000005',
    '95000000-0000-0000-0000-000000000005', false
  ) $$,
  'Unknown Realmie completion mapping for realm number and level Year 7',
  'unknown level fails closed'
);

select is(
  (public.backfill_standard_realmies_internal()->>'realmies_granted')::integer,
  1,
  'historical backfill grants the one remaining eligible completion'
);
select is(
  (select count(*)::integer from public.student_realmies where student_id = '93000000-0000-0000-0000-000000000003'),
  1,
  'eligible historical completion is owned'
);
select is(
  (select count(*)::integer from public.student_realmies where student_id = '93000000-0000-0000-0000-000000000004'),
  0,
  'incomplete and 84 percent historical levels do not backfill'
);
select is(
  (public.backfill_standard_realmies_internal()->>'realmies_granted')::integer,
  0,
  'backfill rerun creates no ownership duplicates'
);
select is(
  (select count(*)::integer from public.student_realmies),
  2,
  'backfill leaves exactly the two eligible ownership rows'
);
select is(
  (select count(*)::integer from public.realmie_unlock_receipts),
  2,
  'backfill leaves exactly one receipt per owned Realmie'
);
select is(
  (select count(*)::integer from public.student_economy_transactions where student_id = '93000000-0000-0000-0000-000000000003'),
  0,
  'backfill does not change XP'
);
select is(
  (select count(*)::integer from public.student_gems where student_id = '93000000-0000-0000-0000-000000000003'),
  0,
  'backfill does not award Gems'
);
select is(
  (
    select unlocked_legends
    from public.student_realm_progress
    where student_id = '93000000-0000-0000-0000-000000000003'
      and realm_id = 'measurement'
      and working_level = 'Year 2'
  ),
  '[]'::jsonb,
  'backfill does not alter Hall of Legends state'
);
select is(
  (
    select jsonb_build_object(
      'status', status,
      'current_week', current_week,
      'posttest_score', posttest_score
    )
    from public.student_realm_progress
    where student_id = '93000000-0000-0000-0000-000000000003'
      and realm_id = 'measurement'
      and working_level = 'Year 2'
  ),
  '{"status":"PASSED","current_week":8,"posttest_score":91}'::jsonb,
  'backfill leaves canonical progression unchanged'
);

select set_config(
  'realmies.test.student_a_owned_id',
  (select realmie_id::text from public.student_realmies where student_id = '93000000-0000-0000-0000-000000000001'),
  true
);
select set_config(
  'realmies.test.student_c_owned_id',
  (select realmie_id::text from public.student_realmies where student_id = '93000000-0000-0000-0000-000000000003'),
  true
);
select set_config(
  'realmies.test.unowned_id',
  (select id::text from public.realmie_catalogue where realmie_key = 'number-nexus-numbot-builder-standard'),
  true
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '91000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-student-session":"realmie-token-a"}', true);

select is(
  jsonb_array_length(public.get_student_realmies_secure(
    '93000000-0000-0000-0000-000000000001'
  )->'catalogue'),
  18,
  'student reads the reviewed catalogue projection'
);
select ok(
  public.set_student_realmie_favourite_secure(
    '93000000-0000-0000-0000-000000000001',
    current_setting('realmies.test.student_a_owned_id')::uuid,
    true
  ),
  'student can favourite an owned Realmie'
);
select public.set_student_realmie_favourite_secure(
  '93000000-0000-0000-0000-000000000001',
  current_setting('realmies.test.student_a_owned_id')::uuid,
  true
);
reset role;
select is(
  (select count(*)::integer from public.student_realmie_favourites where student_id = '93000000-0000-0000-0000-000000000001'),
  1,
  'favourite writes are idempotent'
);
set local role authenticated;
select set_config('request.jwt.claim.sub', '91000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-student-session":"realmie-token-a"}', true);
select throws_ok(
  $$ select public.set_student_realmie_favourite_secure(
    '93000000-0000-0000-0000-000000000001',
    current_setting('realmies.test.unowned_id')::uuid,
    true
  ) $$,
  '42501',
  'Only owned Realmies can be favourited',
  'unowned Realmie cannot be favourited'
);
select lives_ok(
  $$ select public.set_student_realmie_display_slot_secure(
    '93000000-0000-0000-0000-000000000001',
    1,
    current_setting('realmies.test.student_a_owned_id')::uuid
  ) $$,
  'student can place an owned Realmie in a display slot'
);
select public.set_student_realmie_display_slot_secure(
  '93000000-0000-0000-0000-000000000001',
  2,
  current_setting('realmies.test.student_a_owned_id')::uuid
);
reset role;
select is(
  (select count(*)::integer from public.student_realmie_display_slots where student_id = '93000000-0000-0000-0000-000000000001'),
  1,
  'same Realmie cannot occupy two slots'
);
select is(
  (select slot_number from public.student_realmie_display_slots where student_id = '93000000-0000-0000-0000-000000000001'),
  2,
  'display order persists after moving a Realmie'
);
set local role authenticated;
select set_config('request.jwt.claim.sub', '91000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-student-session":"realmie-token-a"}', true);
select throws_ok(
  $$ select public.set_student_realmie_display_slot_secure(
    '93000000-0000-0000-0000-000000000001',
    7,
    current_setting('realmies.test.student_a_owned_id')::uuid
  ) $$,
  'Realmie display slot must be between 1 and 6',
  'display is limited to six slots'
);
select throws_ok(
  $$ select public.set_student_realmie_display_slot_secure(
    '93000000-0000-0000-0000-000000000001',
    1,
    current_setting('realmies.test.unowned_id')::uuid
  ) $$,
  '42501',
  'Only owned Realmies can be displayed',
  'unowned Realmie cannot be displayed'
);
select throws_ok(
  $$ select public.get_student_realmies_secure(
    '93000000-0000-0000-0000-000000000002'
  ) $$,
  '42501',
  'Student session is invalid or does not own this record',
  'student cannot read another collection'
);
select throws_ok(
  $$ select public.set_student_realmie_favourite_secure(
    '93000000-0000-0000-0000-000000000003',
    current_setting('realmies.test.student_c_owned_id')::uuid,
    true
  ) $$,
  '42501',
  'Student session is invalid or does not own this record',
  'student cannot update another favourite'
);

select set_config('request.jwt.claim.sub', '91000000-0000-0000-0000-000000000008', true);
select set_config('request.headers', '{}', true);
select throws_ok(
  $$ select public.set_student_realmie_favourite_secure(
    '93000000-0000-0000-0000-000000000001',
    current_setting('realmies.test.student_a_owned_id')::uuid,
    true
  ) $$,
  '42501',
  'Realmies student access denied',
  'parent cannot write Realmie state'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '91000000-0000-0000-0000-000000000007', true);
select set_config('request.headers', '{}', true);
select is(
  (public.get_teacher_student_realmie_summary_secure(
    '93000000-0000-0000-0000-000000000001'
  )->>'total_collected')::integer,
  1,
  'assigned teacher can read the limited Realmie summary'
);
select throws_ok(
  $$ select public.get_teacher_student_realmie_summary_secure(
    '93000000-0000-0000-0000-000000000006'
  ) $$,
  '42501',
  'Not authorised to view this student',
  'teacher cannot read a cross-school Realmie summary'
);

reset role;
update public.realmie_catalogue
set is_active = false, active_for_standard_completion = false
where realm_id = 'number' and evolution_level = 4 and variant_type = 'standard';

set local role authenticated;
select set_config('request.jwt.claim.sub', '91000000-0000-0000-0000-000000000005', true);
select set_config('request.headers', '{"x-student-session":"realmie-token-e"}', true);
select throws_ok(
  $$ select public.complete_realm_assessment(
    '93000000-0000-0000-0000-000000000005',
    '92000000-0000-0000-0000-000000000001',
    'number', 'year4-number', 'Year 4', 'Year 4', 'posttest',
    '95000000-0000-0000-0000-000000000010',
    '{"correct_count":17,"total_questions":20,"score_percent":85,"passed":true}'::jsonb,
    '{"status":"PASSED","placement_complete":true,"posttest_score":85,"posttest_completed_at":"2026-07-31T00:00:00Z","current_week":12,"assigned_week":12}'::jsonb
  ) $$,
  'Active standard Realmie mapping is missing for realm number and level Year 4',
  'forced Realmie failure aborts assessment completion'
);
reset role;
select is(
  (select count(*)::integer from public.student_realm_assessments where student_id = '93000000-0000-0000-0000-000000000005'),
  0,
  'forced Realmie failure rolls back assessment attempt'
);
select is(
  (select count(*)::integer from public.student_completion_receipts where student_id = '93000000-0000-0000-0000-000000000005'),
  0,
  'forced Realmie failure rolls back completion receipt'
);
select is(
  (select count(*)::integer from public.student_realmies where student_id = '93000000-0000-0000-0000-000000000005'),
  0,
  'forced Realmie failure leaves no ownership'
);

update public.realmie_catalogue
set is_active = true, active_for_standard_completion = true
where realm_id = 'number' and evolution_level = 4 and variant_type = 'standard';

set local role authenticated;
select set_config('request.jwt.claim.sub', '91000000-0000-0000-0000-000000000005', true);
select set_config('request.headers', '{"x-student-session":"realmie-token-e"}', true);
select ok(
  public.complete_realm_assessment(
    '93000000-0000-0000-0000-000000000005',
    '92000000-0000-0000-0000-000000000001',
    'number', 'year4-number', 'Year 4', 'Year 4', 'posttest',
    '95000000-0000-0000-0000-000000000010',
    '{"correct_count":17,"total_questions":20,"score_percent":85,"passed":true}'::jsonb,
    '{"status":"PASSED","placement_complete":true,"posttest_score":85,"posttest_completed_at":"2026-07-31T00:00:00Z","current_week":12,"assigned_week":12}'::jsonb
  ),
  'successful retry commits assessment and Realmie atomically'
);
reset role;
select is(
  (select count(*)::integer from public.student_realm_assessments where student_id = '93000000-0000-0000-0000-000000000005'),
  1,
  'successful retry has one canonical assessment'
);
select is(
  (select count(*)::integer from public.realmie_unlock_receipts where student_id = '93000000-0000-0000-0000-000000000005'),
  1,
  'successful retry has one Realmie receipt'
);
select is(
  (select count(*)::integer from public.student_realmies where student_id = '93000000-0000-0000-0000-000000000005'),
  1,
  'successful retry has one ownership row'
);
set local role authenticated;
select set_config('request.jwt.claim.sub', '91000000-0000-0000-0000-000000000005', true);
select set_config('request.headers', '{"x-student-session":"realmie-token-e"}', true);
select isnt(
  public.record_realmie_product_event_secure(
    '93000000-0000-0000-0000-000000000005',
    'realmies_room_opened', null, null, 'my_realmies', 'test-session',
    '{"student_name":"must-not-persist","student_answer":"must-not-persist","rarity":"epic"}'
  ),
  null::uuid,
  'reviewed telemetry command records a minimal event'
);
select throws_ok(
  $$ select public.record_realmie_product_event_secure(
    '93000000-0000-0000-0000-000000000005',
    'realmie_unlocked_by_client', null, null, 'my_realmies', null, '{}'
  ) $$,
  'Unsupported Realmies telemetry event',
  'telemetry cannot invent unlock events'
);
reset role;
select is(
  (
    select context ? 'student_name'
    from public.realmie_product_events
    where student_id = '93000000-0000-0000-0000-000000000005'
    order by created_at desc
    limit 1
  ),
  false,
  'telemetry context excludes direct student identity'
);

select * from finish();
rollback;
