-- Repair students whose onboarding was bypassed by teacher-assigned working levels.
-- These rows were seeded as ASSIGNED_PROGRAM + placement_complete=true before the
-- student had actually seen the intro or completed a pre-test.

BEGIN;

WITH affected AS (
  SELECT
    ps.student_id,
    ps.year
  FROM public.progress_snapshot ps
  WHERE ps.status = 'ASSIGNED_PROGRAM'
    AND ps.placement_complete = TRUE
    AND ps.pretest_score IS NULL
    AND COALESCE(ps.week, 1) = 1
    AND COALESCE(ps.assigned_week, 1) = 1
    AND COALESCE(ps.required_weeks, '[]'::jsonb) = '[]'::jsonb
    AND COALESCE(ps.optional_weeks, '[]'::jsonb) = '[]'::jsonb
    AND COALESCE(ps.unlocked_legends, '[]'::jsonb) = '[]'::jsonb
    AND COALESCE(ps.completed_lesson_ids, '[]'::jsonb) = '[]'::jsonb
    AND COALESCE(ps.quiz_scores, '{}'::jsonb) = '{}'::jsonb
    AND COALESCE(ps.lesson_attempts, '{}'::jsonb) = '{}'::jsonb
)
UPDATE public.students s
SET has_seen_intro = FALSE
WHERE s.id IN (SELECT DISTINCT student_id FROM affected);

WITH affected AS (
  SELECT
    ps.student_id,
    ps.year
  FROM public.progress_snapshot ps
  WHERE ps.status = 'ASSIGNED_PROGRAM'
    AND ps.placement_complete = TRUE
    AND ps.pretest_score IS NULL
    AND COALESCE(ps.week, 1) = 1
    AND COALESCE(ps.assigned_week, 1) = 1
    AND COALESCE(ps.required_weeks, '[]'::jsonb) = '[]'::jsonb
    AND COALESCE(ps.optional_weeks, '[]'::jsonb) = '[]'::jsonb
    AND COALESCE(ps.unlocked_legends, '[]'::jsonb) = '[]'::jsonb
    AND COALESCE(ps.completed_lesson_ids, '[]'::jsonb) = '[]'::jsonb
    AND COALESCE(ps.quiz_scores, '{}'::jsonb) = '{}'::jsonb
    AND COALESCE(ps.lesson_attempts, '{}'::jsonb) = '{}'::jsonb
)
DELETE FROM public.progress p
USING affected a
WHERE p.student_id = a.student_id
  AND p.year = a.year;

WITH affected AS (
  SELECT
    ps.student_id,
    ps.year
  FROM public.progress_snapshot ps
  WHERE ps.status = 'ASSIGNED_PROGRAM'
    AND ps.placement_complete = TRUE
    AND ps.pretest_score IS NULL
    AND COALESCE(ps.week, 1) = 1
    AND COALESCE(ps.assigned_week, 1) = 1
    AND COALESCE(ps.required_weeks, '[]'::jsonb) = '[]'::jsonb
    AND COALESCE(ps.optional_weeks, '[]'::jsonb) = '[]'::jsonb
    AND COALESCE(ps.unlocked_legends, '[]'::jsonb) = '[]'::jsonb
    AND COALESCE(ps.completed_lesson_ids, '[]'::jsonb) = '[]'::jsonb
    AND COALESCE(ps.quiz_scores, '{}'::jsonb) = '{}'::jsonb
    AND COALESCE(ps.lesson_attempts, '{}'::jsonb) = '{}'::jsonb
)
DELETE FROM public.progress_snapshot ps
USING affected a
WHERE ps.student_id = a.student_id
  AND ps.year = a.year;

COMMIT;
