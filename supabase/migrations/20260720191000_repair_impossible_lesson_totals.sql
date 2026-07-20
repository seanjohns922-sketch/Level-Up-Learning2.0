begin;

-- Shared Number Nexus and Measurelands lessons are bounded to ten scored
-- challenges. Older timed sessions had no question ceiling and could
-- accumulate implausible totals.
-- Preserve the source values in summary before normalizing teacher-facing data.
update public.student_lesson_attempts
set
  summary = coalesce(summary, '{}'::jsonb) || jsonb_build_object(
    'telemetry_repair', jsonb_build_object(
      'reason', 'legacy_unbounded_timed_lesson',
      'original_total_questions', total_questions,
      'original_correct_count', correct_count,
      'repaired_at', now()
    )
  ),
  total_questions = 10,
  correct_count = least(10, greatest(0, round(accuracy_percent::numeric * 10 / 100)::integer)),
  accuracy_percent = greatest(0, least(100, accuracy_percent))
where total_questions > 10;

-- Keep the denormalized live row consistent with canonical attempts. The event
-- timeline remains untouched for audit purposes.
update public.live_student_activity
set
  questions_answered = 10,
  correct_count = least(10, greatest(0, round(accuracy_percent::numeric * 10 / 100)::integer)),
  accuracy_percent = greatest(0, least(100, accuracy_percent)),
  updated_at = now()
where questions_answered > 10
  and coalesce(current_lesson, '') ~* '-l[0-9]+$'
  and coalesce(current_lesson, '') !~* 'quiz'
  and coalesce(current_lesson_title, '') !~* 'quiz';

commit;
