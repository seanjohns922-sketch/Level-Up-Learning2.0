begin;

-- Timed lessons run for nine minutes and do not have a question limit. Repair
-- only historical rows whose saved attempt summary proves that more than ten
-- questions were answered. A genuine ten-question session remains unchanged.
with recoverable as (
  select
    attempt.id,
    greatest(
      attempt.total_questions,
      case
        when attempt.summary #>> '{telemetry_repair,original_total_questions}' ~ '^[0-9]+$'
          then (attempt.summary #>> '{telemetry_repair,original_total_questions}')::integer
        else 0
      end,
      case
        when attempt.summary->>'totalQuestions' ~ '^[0-9]+$'
          then (attempt.summary->>'totalQuestions')::integer
        else 0
      end,
      case
        when attempt.summary->>'questionsAnswered' ~ '^[0-9]+$'
          then (attempt.summary->>'questionsAnswered')::integer
        else 0
      end
    ) as recovered_total,
    greatest(
      attempt.correct_count,
      case
        when attempt.summary #>> '{telemetry_repair,original_correct_count}' ~ '^[0-9]+$'
          then (attempt.summary #>> '{telemetry_repair,original_correct_count}')::integer
        else 0
      end,
      case
        when attempt.summary->>'correctCount' ~ '^[0-9]+$'
          then (attempt.summary->>'correctCount')::integer
        else 0
      end,
      case
        when attempt.summary->>'correctAnswers' ~ '^[0-9]+$'
          then (attempt.summary->>'correctAnswers')::integer
        else 0
      end
    ) as recovered_correct
  from public.student_lesson_attempts attempt
  where attempt.total_questions = 10
    and attempt.realm_id in ('number', 'measurement', 'space')
),
repaired as (
  update public.student_lesson_attempts attempt
  set
    total_questions = recoverable.recovered_total,
    correct_count = least(recoverable.recovered_total, recoverable.recovered_correct),
    accuracy_percent = round(
      least(recoverable.recovered_total, recoverable.recovered_correct)::numeric
      * 100
      / recoverable.recovered_total
    )::integer,
    summary = attempt.summary || jsonb_build_object(
      'uncapped_total_repair',
      jsonb_build_object(
        'previous_total_questions', attempt.total_questions,
        'recovered_total_questions', recoverable.recovered_total,
        'recovered_correct_count', least(recoverable.recovered_total, recoverable.recovered_correct),
        'repaired_at', now(),
        'source', 'saved_attempt_summary'
      )
    )
  from recoverable
  where attempt.id = recoverable.id
    and recoverable.recovered_total > 10
  returning
    attempt.student_id,
    attempt.lesson_id,
    attempt.total_questions,
    attempt.correct_count,
    attempt.accuracy_percent,
    attempt.completed_at
),
latest_repaired as (
  select distinct on (student_id)
    student_id,
    lesson_id,
    total_questions,
    correct_count,
    accuracy_percent,
    completed_at
  from repaired
  order by student_id, completed_at desc
)
update public.live_student_activity activity
set
  questions_answered = repaired.total_questions,
  correct_count = repaired.correct_count,
  accuracy_percent = repaired.accuracy_percent,
  updated_at = greatest(activity.updated_at, repaired.completed_at)
from latest_repaired repaired
where activity.student_id = repaired.student_id
  and activity.current_lesson = repaired.lesson_id;

commit;
