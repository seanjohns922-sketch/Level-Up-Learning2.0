-- Create progress table (stores pretest/program outcomes per student per year)
CREATE TABLE IF NOT EXISTS public.progress (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID        NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  year        TEXT        NOT NULL,
  pretest_score INTEGER,
  status      TEXT        NOT NULL DEFAULT 'ASSIGNED_PROGRAM',
  week        INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, year)
);

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Teacher can read their students' progress
DROP POLICY IF EXISTS "Teachers can read student progress" ON public.progress;
CREATE POLICY "Teachers can read student progress"
ON public.progress FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    WHERE s.id = progress.student_id
      AND public.teacher_belongs_to_auth(c.teacher_id)
  )
);

-- SECURITY DEFINER RPCs (bypass RLS - students have no auth session)

-- Save pretest result
CREATE OR REPLACE FUNCTION public.save_pretest_progress(
  p_student_id  UUID,
  p_year        TEXT,
  p_score       INTEGER,
  p_status      TEXT,
  p_week        INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.progress (student_id, year, pretest_score, status, week)
  VALUES (p_student_id, p_year, p_score, p_status, p_week)
  ON CONFLICT (student_id, year) DO UPDATE SET
    pretest_score = EXCLUDED.pretest_score,
    status        = EXCLUDED.status,
    week          = EXCLUDED.week,
    updated_at    = now();
END;
$$;

-- Read existing live activity row (needed for client-side merge logic)
CREATE OR REPLACE FUNCTION public.get_live_student_activity(
  p_student_id  UUID,
  p_class_id    UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE result JSONB;
BEGIN
  SELECT to_jsonb(t) INTO result
  FROM public.live_student_activity t
  WHERE t.student_id = p_student_id
    AND t.class_id   = p_class_id;
  RETURN result;
END;
$$;

-- Upsert live student activity row
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

-- Insert live activity event
CREATE OR REPLACE FUNCTION public.insert_live_activity_event(
  p_student_id  UUID,
  p_class_id    UUID,
  p_session_id  UUID    DEFAULT NULL,
  p_event_type  TEXT    DEFAULT NULL,
  p_payload     JSONB   DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.live_activity_events
    (student_id, class_id, session_id, event_type, payload)
  VALUES
    (p_student_id, p_class_id, p_session_id, p_event_type, p_payload);
END;
$$;
