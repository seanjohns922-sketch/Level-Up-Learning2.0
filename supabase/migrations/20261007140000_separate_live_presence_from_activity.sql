begin;

-- The telemetry writer already persists this field; older installations lack it.
alter table public.live_student_activity add column if not exists lesson_started_at timestamptz;

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
    coalesce((p_data->>'last_active_at')::timestamptz, now())
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
    last_active_at = greatest(public.live_student_activity.last_active_at, excluded.last_active_at),
    updated_at = excluded.updated_at
  where excluded.updated_at >= coalesce(
    public.live_student_activity.updated_at,
    '-infinity'::timestamptz
  );
end;
$$;


create or replace function public.touch_live_student_presence_secure(
  p_student_id uuid,
  p_class_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);

  if not exists (
    select 1
    from public.students student
    where student.id = p_student_id
      and student.class_id = p_class_id
      and student.archived_at is null
  ) then
    raise exception 'Student context does not match' using errcode = '42501';
  end if;

  update public.live_student_activity
  set
    last_active_at = clock_timestamp()
  where student_id = p_student_id
    and class_id = p_class_id;

  return found;
end;
$$;

revoke all on function public.touch_live_student_presence_secure(uuid, uuid)
  from public;
grant execute on function public.touch_live_student_presence_secure(uuid, uuid)
  to anon, authenticated;



-- Old heartbeats advanced the activity clock even though no learning changed.
-- Reconcile its clock with append-only evidence; the teacher client reconstructs
-- the complete latest activity (including scores) from these same events.
update public.live_student_activity activity
set updated_at = latest.created_at
from (
  select student_id, class_id, max(created_at) as created_at
  from public.live_activity_events
  where payload->>'lessonId' is not null or payload->>'week' is not null
  group by student_id, class_id
) latest
where activity.student_id = latest.student_id and activity.class_id = latest.class_id;
-- Restore the displayed location and result from the newest learning evidence.
with latest as (
 select distinct on (student_id,class_id) student_id,class_id,event_type,payload,created_at
 from public.live_activity_events
 where payload->>'lessonId' is not null
 order by student_id,class_id,created_at desc
)
update public.live_student_activity a set
 current_level=coalesce(e.payload->>'level',a.current_level),
 current_strand=coalesce(e.payload->>'strand',a.current_strand),
 current_week=coalesce((e.payload->>'week')::integer,a.current_week),
 current_lesson=e.payload->>'lessonId',
 current_lesson_title=e.payload->>'lessonTitle',
 latest_event_type=e.event_type,
 questions_answered=coalesce((e.payload->>'questionsAnswered')::integer,0),
 correct_count=coalesce((e.payload->>'correctCount')::integer,0),
 accuracy_percent=coalesce((e.payload->>'accuracyPercent')::integer,0),
 current_lesson_status=coalesce(e.payload->>'currentLessonStatus','active'),
 completed_at=(e.payload->>'completedAt')::timestamptz,
 current_question_id=e.payload->>'questionId',
 current_question_text=e.payload->>'questionText',
 current_question_options=coalesce(e.payload->'questionOptions','[]'::jsonb)
from latest e where a.student_id=e.student_id and a.class_id=e.class_id and a.updated_at=e.created_at;
commit;
