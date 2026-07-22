begin;

-- Timed lessons are intentionally open-ended: students answer as many
-- generated questions as they can before the timer expires. A previous repair
-- incorrectly normalized valid lesson attempts to ten questions. The original
-- values were retained in summary, so restore them without altering attempts
-- that do not carry that audit marker.
update public.student_lesson_attempts
set
  total_questions = greatest(
    0,
    (summary #>> '{telemetry_repair,original_total_questions}')::integer
  ),
  correct_count = least(
    greatest(0, (summary #>> '{telemetry_repair,original_total_questions}')::integer),
    greatest(0, (summary #>> '{telemetry_repair,original_correct_count}')::integer)
  ),
  accuracy_percent = case
    when (summary #>> '{telemetry_repair,original_total_questions}')::integer > 0 then
      round(
        least(
          greatest(0, (summary #>> '{telemetry_repair,original_total_questions}')::integer),
          greatest(0, (summary #>> '{telemetry_repair,original_correct_count}')::integer)
        )::numeric * 100
        / (summary #>> '{telemetry_repair,original_total_questions}')::integer
      )::integer
    else 0
  end,
  summary = jsonb_set(
    summary,
    '{telemetry_repair}',
    (summary->'telemetry_repair') || jsonb_build_object(
      'restored_at', now(),
      'restoration_reason', 'timed_lessons_are_unbounded'
    )
  )
where summary #>> '{telemetry_repair,original_total_questions}' ~ '^[0-9]+$'
  and summary #>> '{telemetry_repair,original_correct_count}' ~ '^[0-9]+$'
  and summary #>> '{telemetry_repair,restored_at}' is null;

-- Live activity is a current-session projection, not progression truth. Repair
-- any affected snapshot from the newest restored canonical attempt only so the
-- teacher's live view does not continue to display the obsolete ten-question
-- normalization.
with latest_restored_attempt as (
  select distinct on (sla.student_id)
    sla.student_id,
    sla.lesson_id,
    sla.total_questions,
    sla.correct_count,
    sla.accuracy_percent,
    sla.completed_at
  from public.student_lesson_attempts sla
  where sla.summary #>> '{telemetry_repair,restored_at}' is not null
  order by sla.student_id, sla.completed_at desc
)
update public.live_student_activity activity
set
  questions_answered = restored.total_questions,
  correct_count = restored.correct_count,
  accuracy_percent = restored.accuracy_percent,
  updated_at = greatest(activity.updated_at, restored.completed_at)
from latest_restored_attempt restored
where activity.student_id = restored.student_id
  and activity.current_lesson = restored.lesson_id;

commit;
