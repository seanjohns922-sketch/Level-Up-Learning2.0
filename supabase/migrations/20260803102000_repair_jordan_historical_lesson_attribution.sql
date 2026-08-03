begin;

-- Jordan advanced through the Year 1 and Year 2 pre-tests into Year 3, so a
-- Year 1 lesson completion is not part of his valid pathway. This attempt was
-- recorded before student completion writes were bound to a server-issued
-- student session. Preserve the row for audit, but remove it from canonical
-- completion and educator reporting.
update public.student_lesson_attempts attempt
set
  completed = false,
  summary = coalesce(attempt.summary, '{}'::jsonb) || jsonb_build_object(
    'integrity_repair', jsonb_build_object(
      'reason', 'historical_misattributed_student_session',
      'original_completed', true,
      'repaired_at', now(),
      'repair_migration', '20260803102000_repair_jordan_historical_lesson_attribution'
    )
  )
from public.students student
where student.id = attempt.student_id
  and lower(regexp_replace(trim(coalesce(student.display_name, '')), '\s+', ' ', 'g')) = 'jordan clark'
  and attempt.realm_id = 'number'
  and attempt.working_level = 'Year 1'
  and attempt.week = 1
  and attempt.lesson = 3
  and attempt.correct_count = 17
  and attempt.total_questions = 17
  and attempt.completed
  and attempt.completed_at < timestamptz '2026-07-17 21:30:00+10'
  and exists (
    select 1
    from public.student_realm_progress progress
    where progress.student_id = student.id
      and progress.realm_id = 'number'
      and progress.working_level = 'Year 3'
      and progress.is_current
  )
  and exists (
    select 1
    from public.student_realm_assessments assessment
    where assessment.student_id = student.id
      and assessment.realm_id = 'number'
      and assessment.working_level = 'Year 1'
      and assessment.assessment_type = 'pretest'
      and assessment.passed
  )
  and exists (
    select 1
    from public.student_realm_assessments assessment
    where assessment.student_id = student.id
      and assessment.realm_id = 'number'
      and assessment.working_level = 'Year 2'
      and assessment.assessment_type = 'pretest'
      and assessment.passed
  );

commit;
