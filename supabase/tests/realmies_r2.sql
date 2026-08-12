begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(25);

set local role postgres;

select is(
  (
    select count(*)::integer
    from public.realmie_catalogue
    where is_active
      and is_collectible
      and variant_type = 'standard'
  ),
  15,
  'exactly 15 active collectible standard Realmies'
);

select is(
  (
    select jsonb_object_agg(realm_id, item_count order by realm_id)
    from (
      select realm_id, count(*)::integer as item_count
      from public.realmie_catalogue
      where is_active and is_collectible and variant_type = 'standard'
      group by realm_id
    ) counts
  ),
  '{"global":3,"measurement":4,"number":4,"space":4}'::jsonb,
  'active collection distribution is 4 number 4 measurement 4 space and 3 global'
);

select is(
  (
    select count(*)::integer
    from public.realmie_catalogue
    where is_active
      and is_collectible
      and (
        category in ('legend', 'pet')
        or lower(character_key) in ('numbot', 'meazurex', 'geospin', 'datara')
      )
  ),
  0,
  'main Legends are not collectible Realmies'
);

select ok(
  (
    select count(*) >= 18
    from public.realmie_catalogue
    where category = 'legend'
      and not is_active
      and not is_collectible
      and retired_at is not null
  ),
  'legacy Legend catalogue rows are retained as retired history'
);

select is(
  (
    select count(*)::integer
    from public.realmie_discovery_rules rule
    join public.realmie_catalogue catalogue on catalogue.id = rule.realmie_id
    where rule.is_active
      and catalogue.is_active
      and catalogue.is_collectible
  ),
  15,
  'each active Realmie has one active discovery rule'
);

select is(
  (
    select count(*)::integer
    from public.realmie_discovery_rules
    where is_active
      and rule_type = 'first_realm_lesson_completed'
  ),
  3,
  'first lesson discovery exists for each learning realm'
);

select is(
  (
    select count(*)::integer
    from public.realmie_discovery_rules
    where is_active
      and rule_type = 'realm_lessons_completed_count'
      and threshold in (10, 50)
  ),
  6,
  'ten and fifty lesson milestones exist for each learning realm'
);

select is(
  (
    select count(*)::integer
    from public.realmie_discovery_rules
    where is_active
      and rule_type = 'realm_weekly_quizzes_passed_count'
      and threshold = 5
      and (rule_payload->>'minimum_accuracy')::integer = 80
  ),
  3,
  'five passed weekly quiz discoveries require 80 percent'
);

select is(
  (
    select count(*)::integer
    from public.realmie_discovery_rules
    where is_active
      and rule_type = 'global_lessons_completed_count'
      and threshold = 3
  ),
  1,
  'Fogling uses three unique lessons globally'
);

select is(
  (
    select count(*)::integer
    from public.realmie_discovery_rules
    where is_active
      and rule_type = 'canonical_learning_streak'
      and threshold in (7, 30)
  ),
  2,
  'canonical streak discoveries use seven and thirty days'
);

select ok(
  not public.realmie_attempt_is_canonical('{"demo_mode":true}'::jsonb),
  'demo attempts are excluded from discovery'
);

select ok(
  not public.realmie_attempt_is_canonical('{"review_mode":true}'::jsonb),
  'review attempts are excluded from discovery'
);

select ok(
  not public.realmie_attempt_is_canonical('{"teacher_advanced":true}'::jsonb),
  'teacher-advanced records are excluded from discovery'
);

select ok(
  public.realmie_attempt_is_canonical('{}'::jsonb),
  'ordinary canonical attempt summaries remain eligible'
);

select ok(
  to_regprocedure(
    'public.grant_standard_realmie_for_canonical_posttest(uuid,text,text,uuid,uuid,boolean)'
  ) is null,
  'post-tests do not grant Realmies'
);

select ok(
  to_regprocedure('public.backfill_standard_realmies_internal()') is null,
  'legacy post-test Realmie backfill is removed'
);

select unalike(
  pg_get_functiondef(
    'public.complete_realm_assessment(uuid,uuid,text,text,text,text,text,uuid,jsonb,jsonb)'::regprocedure
  ),
  '%realmie%',
  'assessment completion has no Realmie side effect'
);

select alike(
  pg_get_functiondef(
    'public.complete_realm_assessment(uuid,uuid,text,text,text,text,text,uuid,jsonb,jsonb)'::regprocedure
  ),
  '%pg_advisory_xact_lock%',
  'assessment concurrency lock remains intact'
);

select ok(
  (
    select bool_and(
      trigger.tgdeferrable
      and trigger.tginitdeferred
    )
    from pg_trigger trigger
    where trigger.tgname in (
      'trg_evaluate_realmie_lesson_discoveries',
      'trg_evaluate_realmie_quiz_discoveries'
    )
  ),
  'canonical discovery triggers are deferred'
);

select is(
  (
    select count(*)::integer
    from information_schema.role_routine_grants
    where routine_schema = 'public'
      and routine_name in (
        'evaluate_realmie_discoveries_internal',
        'backfill_realmie_discoveries_internal',
        'realmie_attempt_is_canonical'
      )
      and grantee in ('anon', 'authenticated', 'PUBLIC')
  ),
  0,
  'internal discovery functions are not client executable'
);

create temporary table realmie_test_snapshot as
select
  (select count(*) from public.student_realmies) as ownership_count,
  (select count(*) from public.realmie_unlock_receipts) as receipt_count,
  (select count(*) from public.student_realm_progress) as progress_count,
  (select count(*) from public.student_lesson_attempts) as lesson_count,
  (select count(*) from public.student_weekly_quiz_attempts) as quiz_count,
  (select count(*) from public.student_realm_assessments) as assessment_count;

select lives_ok(
  $$ select public.backfill_realmie_discoveries_internal() $$,
  'discovery backfill completes'
);

update realmie_test_snapshot
set
  ownership_count = (select count(*) from public.student_realmies),
  receipt_count = (select count(*) from public.realmie_unlock_receipts);

select lives_ok(
  $$ select public.backfill_realmie_discoveries_internal() $$,
  'backfill is idempotent'
);

select is(
  (select count(*) from public.student_realm_progress),
  (select progress_count from realmie_test_snapshot),
  'backfill does not alter progression'
);

select is(
  (select count(*) from public.student_realmies),
  (select ownership_count from realmie_test_snapshot),
  'rerunning backfill creates no duplicate ownership'
);

select is(
  (
    select count(*)::integer
    from public.realmie_architecture_correction_reports
    where correction_key = '20260731-remove-legends-and-enable-discovery'
  ),
  1,
  'architecture correction report is recorded'
);

select * from finish();
rollback;
