-- ─────────────────────────────────────────────────────────────────────────────
-- Repair: live student cards showed 0 / 0 during class.
--
-- Root cause: two migrations define public.upsert_live_student_activity —
--   * 20260525090001 (student_write_rpcs)  — WITHOUT the score columns
--   * 20260527101500 (completion_sync)      — WITH questions_answered / correct_count
-- Migrations were applied by hand via the SQL editor, so if 20260525090001 was
-- (re)applied after 20260527101500 the score-less version won, and the upsert
-- silently stopped persisting questions_answered / correct_count / accuracy_percent.
-- Presence kept working (those columns were still written), but the score totals
-- stayed at their column default of 0 → the live card read 0 / 0.
--
-- This migration is idempotent and re-asserts the CORRECT state regardless of the
-- order anything was applied in, then backfills existing rows from the event log
-- (which DID capture every answer with its correctness) so trial data is recovered.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Make sure the score columns exist.
ALTER TABLE public.live_student_activity
  ADD COLUMN IF NOT EXISTS questions_answered INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS correct_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS accuracy_percent INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_lesson_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 2. Re-create the upsert with the score columns so it is the authoritative
--    definition no matter what order earlier migrations were applied in.
CREATE OR REPLACE FUNCTION public.upsert_live_student_activity(
  p_student_id  UUID,
  p_class_id    UUID,
  p_data        JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.live_student_activity (
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
    current_lesson_status, completed_at,
    session_incorrect_count, consecutive_incorrect_count, session_hint_count,
    attempt_number, skill_tag, misconception_tag,
    ai_status, ai_issue, ai_likely_gap, ai_suggested_action,
    last_active_at, updated_at
  ) VALUES (
    p_student_id, p_class_id,
    (p_data->>'session_id')::UUID,
    p_data->>'current_level', p_data->>'current_strand',
    (p_data->>'current_week')::INTEGER,
    p_data->>'current_lesson', p_data->>'current_lesson_title',
    p_data->>'current_activity_id', p_data->>'current_activity_label',
    p_data->>'current_question_id', p_data->>'current_question_text',
    p_data->>'current_question_type',
    COALESCE((p_data->'current_question_options')::JSONB, '[]'::JSONB),
    p_data->>'current_step_label',
    (p_data->>'progress_percent')::INTEGER,
    p_data->>'progress_label',
    p_data->>'latest_event_type',
    (p_data->>'latest_answer_correct')::BOOLEAN,
    p_data->>'latest_selected_answer', p_data->>'latest_correct_answer',
    p_data->>'last_event_text',
    COALESCE((p_data->>'time_on_current_question')::INTEGER, 0),
    COALESCE((p_data->>'current_question_attempts')::INTEGER, 0),
    COALESCE((p_data->>'questions_answered')::INTEGER, 0),
    COALESCE((p_data->>'correct_count')::INTEGER, 0),
    COALESCE((p_data->>'accuracy_percent')::INTEGER, 0),
    COALESCE(p_data->>'current_lesson_status', 'active'),
    (p_data->>'completed_at')::TIMESTAMPTZ,
    COALESCE((p_data->>'session_incorrect_count')::INTEGER, 0),
    COALESCE((p_data->>'consecutive_incorrect_count')::INTEGER, 0),
    COALESCE((p_data->>'session_hint_count')::INTEGER, 0),
    (p_data->>'attempt_number')::INTEGER,
    p_data->>'skill_tag', p_data->>'misconception_tag',
    p_data->>'ai_status', p_data->>'ai_issue',
    p_data->>'ai_likely_gap', p_data->>'ai_suggested_action',
    COALESCE((p_data->>'last_active_at')::TIMESTAMPTZ, now()),
    now()
  )
  ON CONFLICT (class_id, student_id) DO UPDATE SET
    session_id                 = EXCLUDED.session_id,
    current_level              = EXCLUDED.current_level,
    current_strand             = EXCLUDED.current_strand,
    current_week               = EXCLUDED.current_week,
    current_lesson             = EXCLUDED.current_lesson,
    current_lesson_title       = EXCLUDED.current_lesson_title,
    current_activity_id        = EXCLUDED.current_activity_id,
    current_activity_label     = EXCLUDED.current_activity_label,
    current_question_id        = EXCLUDED.current_question_id,
    current_question_text      = EXCLUDED.current_question_text,
    current_question_type      = EXCLUDED.current_question_type,
    current_question_options   = EXCLUDED.current_question_options,
    current_step_label         = EXCLUDED.current_step_label,
    progress_percent           = EXCLUDED.progress_percent,
    progress_label             = EXCLUDED.progress_label,
    latest_event_type          = EXCLUDED.latest_event_type,
    latest_answer_correct      = EXCLUDED.latest_answer_correct,
    latest_selected_answer     = EXCLUDED.latest_selected_answer,
    latest_correct_answer      = EXCLUDED.latest_correct_answer,
    last_event_text            = EXCLUDED.last_event_text,
    time_on_current_question   = EXCLUDED.time_on_current_question,
    current_question_attempts  = EXCLUDED.current_question_attempts,
    questions_answered         = EXCLUDED.questions_answered,
    correct_count              = EXCLUDED.correct_count,
    accuracy_percent           = EXCLUDED.accuracy_percent,
    current_lesson_status      = EXCLUDED.current_lesson_status,
    completed_at               = EXCLUDED.completed_at,
    session_incorrect_count    = EXCLUDED.session_incorrect_count,
    consecutive_incorrect_count= EXCLUDED.consecutive_incorrect_count,
    session_hint_count         = EXCLUDED.session_hint_count,
    attempt_number             = EXCLUDED.attempt_number,
    skill_tag                  = EXCLUDED.skill_tag,
    misconception_tag          = EXCLUDED.misconception_tag,
    ai_status                  = EXCLUDED.ai_status,
    ai_issue                   = EXCLUDED.ai_issue,
    ai_likely_gap              = EXCLUDED.ai_likely_gap,
    ai_suggested_action        = EXCLUDED.ai_suggested_action,
    last_active_at             = EXCLUDED.last_active_at,
    updated_at                 = now();
END;
$$;

-- 3. Recover trial data: rebuild questions_answered / correct_count / accuracy
--    for the row's CURRENT lesson by counting the answer events that were logged
--    (only where it increases the stored count, so we never clobber good data).
WITH starts AS (
  SELECT a.student_id, a.class_id, MAX(e.created_at) AS started_at
  FROM public.live_student_activity a
  JOIN public.live_activity_events e
    ON e.student_id = a.student_id
   AND e.class_id   = a.class_id
   AND e.event_type IN ('lesson_started', 'quiz_started')
   AND a.current_lesson IS NOT NULL
   AND (e.payload->>'lessonId') = a.current_lesson
  GROUP BY a.student_id, a.class_id
),
agg AS (
  SELECT
    a.student_id,
    a.class_id,
    COUNT(*) FILTER (WHERE e.event_type IN ('answer_correct', 'answer_incorrect')) AS answered,
    COUNT(*) FILTER (WHERE e.event_type = 'answer_correct') AS correct
  FROM public.live_student_activity a
  LEFT JOIN starts s
    ON s.student_id = a.student_id AND s.class_id = a.class_id
  JOIN public.live_activity_events e
    ON e.student_id = a.student_id
   AND e.class_id   = a.class_id
   AND a.current_lesson IS NOT NULL
   AND (e.payload->>'lessonId') = a.current_lesson
   AND (s.started_at IS NULL OR e.created_at >= s.started_at)
  GROUP BY a.student_id, a.class_id
)
UPDATE public.live_student_activity a
SET
  questions_answered = agg.answered,
  correct_count      = agg.correct,
  accuracy_percent   = CASE WHEN agg.answered > 0
                            THEN round(100.0 * agg.correct / agg.answered)
                            ELSE 0 END
FROM agg
WHERE a.student_id = agg.student_id
  AND a.class_id   = agg.class_id
  AND agg.answered > a.questions_answered;
