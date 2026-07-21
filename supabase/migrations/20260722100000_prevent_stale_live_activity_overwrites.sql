begin;

-- Student telemetry is sent asynchronously. An older request can finish after
-- a newer quiz/lesson event, so only let snapshots move forward in event time.
create or replace function public.upsert_live_student_activity(
  p_student_id uuid,
  p_class_id uuid,
  p_data jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.live_student_activity (
    student_id, class_id, session_id,
    current_level, current_strand, current_week,
    current_lesson, current_lesson_title,
    current_activity_id, current_activity_label,
    current_question_id, current_question_text, current_question_type,
    current_question_options, current_step_label,
    progress_percent, progress_label,
    latest_event_type, latest_answer_correct,
    latest_selected_answer, latest_correct_answer, last_event_text,
    time_on_current_question, current_question_attempts,
    questions_answered, correct_count, accuracy_percent,
    current_lesson_status, completed_at, lesson_started_at,
    session_incorrect_count, consecutive_incorrect_count, session_hint_count,
    attempt_number, skill_tag, misconception_tag,
    ai_status, ai_issue, ai_likely_gap, ai_suggested_action,
    last_active_at, updated_at
  ) values (
    p_student_id, p_class_id,
    (p_data->>'session_id')::uuid,
    p_data->>'current_level', p_data->>'current_strand',
    (p_data->>'current_week')::integer,
    p_data->>'current_lesson', p_data->>'current_lesson_title',
    p_data->>'current_activity_id', p_data->>'current_activity_label',
    p_data->>'current_question_id', p_data->>'current_question_text',
    p_data->>'current_question_type',
    coalesce(p_data->'current_question_options', '[]'::jsonb),
    p_data->>'current_step_label',
    (p_data->>'progress_percent')::integer,
    p_data->>'progress_label',
    p_data->>'latest_event_type',
    (p_data->>'latest_answer_correct')::boolean,
    p_data->>'latest_selected_answer', p_data->>'latest_correct_answer',
    p_data->>'last_event_text',
    coalesce((p_data->>'time_on_current_question')::integer, 0),
    coalesce((p_data->>'current_question_attempts')::integer, 0),
    coalesce((p_data->>'questions_answered')::integer, 0),
    coalesce((p_data->>'correct_count')::integer, 0),
    coalesce((p_data->>'accuracy_percent')::integer, 0),
    coalesce(p_data->>'current_lesson_status', 'active'),
    (p_data->>'completed_at')::timestamptz,
    (p_data->>'lesson_started_at')::timestamptz,
    coalesce((p_data->>'session_incorrect_count')::integer, 0),
    coalesce((p_data->>'consecutive_incorrect_count')::integer, 0),
    coalesce((p_data->>'session_hint_count')::integer, 0),
    (p_data->>'attempt_number')::integer,
    p_data->>'skill_tag', p_data->>'misconception_tag',
    p_data->>'ai_status', p_data->>'ai_issue',
    p_data->>'ai_likely_gap', p_data->>'ai_suggested_action',
    coalesce((p_data->>'last_active_at')::timestamptz, now()),
    now()
  )
  on conflict (class_id, student_id) do update set
    session_id = excluded.session_id,
    current_level = excluded.current_level,
    current_strand = excluded.current_strand,
    current_week = excluded.current_week,
    current_lesson = excluded.current_lesson,
    current_lesson_title = excluded.current_lesson_title,
    current_activity_id = excluded.current_activity_id,
    current_activity_label = excluded.current_activity_label,
    current_question_id = excluded.current_question_id,
    current_question_text = excluded.current_question_text,
    current_question_type = excluded.current_question_type,
    current_question_options = excluded.current_question_options,
    current_step_label = excluded.current_step_label,
    progress_percent = excluded.progress_percent,
    progress_label = excluded.progress_label,
    latest_event_type = excluded.latest_event_type,
    latest_answer_correct = excluded.latest_answer_correct,
    latest_selected_answer = excluded.latest_selected_answer,
    latest_correct_answer = excluded.latest_correct_answer,
    last_event_text = excluded.last_event_text,
    time_on_current_question = excluded.time_on_current_question,
    current_question_attempts = excluded.current_question_attempts,
    questions_answered = excluded.questions_answered,
    correct_count = excluded.correct_count,
    accuracy_percent = excluded.accuracy_percent,
    current_lesson_status = excluded.current_lesson_status,
    completed_at = excluded.completed_at,
    lesson_started_at = excluded.lesson_started_at,
    session_incorrect_count = excluded.session_incorrect_count,
    consecutive_incorrect_count = excluded.consecutive_incorrect_count,
    session_hint_count = excluded.session_hint_count,
    attempt_number = excluded.attempt_number,
    skill_tag = excluded.skill_tag,
    misconception_tag = excluded.misconception_tag,
    ai_status = excluded.ai_status,
    ai_issue = excluded.ai_issue,
    ai_likely_gap = excluded.ai_likely_gap,
    ai_suggested_action = excluded.ai_suggested_action,
    last_active_at = excluded.last_active_at,
    updated_at = now()
  where excluded.last_active_at >= coalesce(
    public.live_student_activity.last_active_at,
    '-infinity'::timestamptz
  );
end;
$$;

-- Repair the location columns from the newest recorded learning event. Event
-- rows are append-only, so they are a safer source than a stale live snapshot.
with latest_event as (
  select distinct on (e.class_id, e.student_id)
    e.class_id,
    e.student_id,
    e.event_type,
    e.created_at,
    e.payload
  from public.live_activity_events e
  where nullif(e.payload->>'week', '') is not null
    and nullif(e.payload->>'lessonId', '') is not null
  order by e.class_id, e.student_id, e.created_at desc
)
update public.live_student_activity activity
set
  current_level = coalesce(nullif(latest.payload->>'level', ''), activity.current_level),
  current_strand = coalesce(nullif(latest.payload->>'strand', ''), activity.current_strand),
  current_week = coalesce((latest.payload->>'week')::integer, activity.current_week),
  current_lesson = coalesce(nullif(latest.payload->>'lessonId', ''), activity.current_lesson),
  current_lesson_title = coalesce(nullif(latest.payload->>'lessonTitle', ''), activity.current_lesson_title),
  latest_event_type = latest.event_type,
  last_active_at = greatest(activity.last_active_at, latest.created_at),
  updated_at = greatest(activity.updated_at, latest.created_at)
from latest_event latest
where activity.class_id = latest.class_id
  and activity.student_id = latest.student_id;

commit;
