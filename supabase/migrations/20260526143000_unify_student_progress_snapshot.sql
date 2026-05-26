-- Unify student progression persistence behind SECURITY DEFINER RPCs.
-- Teacher dashboards read progress_snapshot; student flows must write the same source of truth.

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS has_seen_intro BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.progress_snapshot
  ADD COLUMN IF NOT EXISTS placement_complete BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS assigned_week INTEGER,
  ADD COLUMN IF NOT EXISTS required_weeks JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS optional_weeks JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS unlocked_legends JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS completed_lesson_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS quiz_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS lesson_attempts JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION public.mark_student_intro_seen(
  p_student_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.students
  SET has_seen_intro = TRUE
  WHERE id = p_student_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_student_intro_seen(UUID) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.save_student_progress_state(
  p_student_id UUID,
  p_year TEXT,
  p_data JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_pretest_score INTEGER := NULLIF(p_data->>'pretest_score', '')::INTEGER;
  next_status TEXT := p_data->>'status';
  next_week INTEGER := NULLIF(p_data->>'week', '')::INTEGER;
  next_placement_complete BOOLEAN := NULLIF(p_data->>'placement_complete', '')::BOOLEAN;
  next_assigned_week INTEGER := NULLIF(p_data->>'assigned_week', '')::INTEGER;
  next_required_weeks JSONB := p_data->'required_weeks';
  next_optional_weeks JSONB := p_data->'optional_weeks';
  next_unlocked_legends JSONB := p_data->'unlocked_legends';
  next_completed_lesson_ids JSONB := p_data->'completed_lesson_ids';
  next_quiz_scores JSONB := p_data->'quiz_scores';
  next_lesson_attempts JSONB := p_data->'lesson_attempts';
BEGIN
  INSERT INTO public.progress_snapshot (
    student_id,
    year,
    pretest_score,
    status,
    week,
    placement_complete,
    assigned_week,
    required_weeks,
    optional_weeks,
    unlocked_legends,
    completed_lesson_ids,
    quiz_scores,
    lesson_attempts,
    updated_at
  ) VALUES (
    p_student_id,
    p_year,
    next_pretest_score,
    COALESCE(next_status, 'active'),
    next_week,
    COALESCE(next_placement_complete, FALSE),
    next_assigned_week,
    COALESCE(next_required_weeks, '[]'::jsonb),
    COALESCE(next_optional_weeks, '[]'::jsonb),
    COALESCE(next_unlocked_legends, '[]'::jsonb),
    COALESCE(next_completed_lesson_ids, '[]'::jsonb),
    COALESCE(next_quiz_scores, '{}'::jsonb),
    COALESCE(next_lesson_attempts, '{}'::jsonb),
    now()
  )
  ON CONFLICT (student_id, year) DO UPDATE SET
    pretest_score = COALESCE(next_pretest_score, public.progress_snapshot.pretest_score),
    status = COALESCE(next_status, public.progress_snapshot.status),
    week = COALESCE(next_week, public.progress_snapshot.week),
    placement_complete = COALESCE(next_placement_complete, public.progress_snapshot.placement_complete),
    assigned_week = COALESCE(next_assigned_week, public.progress_snapshot.assigned_week),
    required_weeks = COALESCE(next_required_weeks, public.progress_snapshot.required_weeks),
    optional_weeks = COALESCE(next_optional_weeks, public.progress_snapshot.optional_weeks),
    unlocked_legends = COALESCE(next_unlocked_legends, public.progress_snapshot.unlocked_legends),
    completed_lesson_ids = COALESCE(next_completed_lesson_ids, public.progress_snapshot.completed_lesson_ids),
    quiz_scores = COALESCE(next_quiz_scores, public.progress_snapshot.quiz_scores),
    lesson_attempts = COALESCE(next_lesson_attempts, public.progress_snapshot.lesson_attempts),
    updated_at = now();

  INSERT INTO public.progress (student_id, year, pretest_score, status, week)
  VALUES (p_student_id, p_year, next_pretest_score, COALESCE(next_status, 'ASSIGNED_PROGRAM'), next_week)
  ON CONFLICT (student_id, year) DO UPDATE SET
    pretest_score = COALESCE(next_pretest_score, public.progress.pretest_score),
    status = COALESCE(next_status, public.progress.status),
    week = COALESCE(next_week, public.progress.week),
    updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_student_progress_state(UUID, TEXT, JSONB) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.save_lesson_progress(
  p_student_id UUID,
  p_year TEXT,
  p_week INTEGER,
  p_lesson_id TEXT,
  p_attempt JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_ids JSONB := '[]'::JSONB;
  existing_attempts JSONB := '{}'::JSONB;
  updated_ids JSONB := '[]'::JSONB;
  previous_entry JSONB := '{}'::JSONB;
  previous_attempts JSONB := '[]'::JSONB;
  updated_attempts JSONB := '{}'::JSONB;
  existing_status TEXT := NULL;
  next_status TEXT := 'active';
BEGIN
  SELECT
    COALESCE(completed_lesson_ids, '[]'::jsonb),
    COALESCE(lesson_attempts, '{}'::jsonb),
    status
  INTO
    existing_ids,
    existing_attempts,
    existing_status
  FROM public.progress_snapshot
  WHERE student_id = p_student_id AND year = p_year;

  IF NOT (existing_ids @> jsonb_build_array(p_lesson_id)) THEN
    updated_ids := existing_ids || jsonb_build_array(p_lesson_id);
  ELSE
    updated_ids := existing_ids;
  END IF;

  previous_entry := COALESCE(existing_attempts -> p_lesson_id, '{}'::jsonb);
  previous_attempts := COALESCE(previous_entry -> 'attempts', '[]'::jsonb);
  updated_attempts := jsonb_set(
    existing_attempts,
    ARRAY[p_lesson_id],
    jsonb_build_object(
      'latestSummary', p_attempt,
      'latestInsight', COALESCE(p_attempt->'insight', 'null'::jsonb),
      'attempts', previous_attempts || jsonb_build_array(p_attempt)
    ),
    TRUE
  );

  IF existing_status IN ('PASSED', 'ASSIGNED_PROGRAM') THEN
    next_status := existing_status;
  END IF;

  PERFORM public.save_student_progress_state(
    p_student_id,
    p_year,
    jsonb_build_object(
      'status', next_status,
      'week', p_week,
      'completed_lesson_ids', updated_ids,
      'lesson_attempts', updated_attempts
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_lesson_progress(UUID, TEXT, INTEGER, TEXT, JSONB) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.save_weekly_quiz_progress(
  p_student_id UUID,
  p_year TEXT,
  p_week INTEGER,
  p_attempt JSONB DEFAULT '{}'::JSONB,
  p_next_week INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  week_key TEXT := p_week::TEXT;
  existing_scores JSONB := '{}'::JSONB;
  existing_status TEXT := NULL;
  previous_week JSONB := '{}'::JSONB;
  previous_attempts JSONB := '[]'::JSONB;
  updated_week JSONB := '{}'::JSONB;
  updated_scores JSONB := '{}'::JSONB;
  next_status TEXT := 'active';
BEGIN
  SELECT COALESCE(quiz_scores, '{}'::jsonb), status
  INTO existing_scores, existing_status
  FROM public.progress_snapshot
  WHERE student_id = p_student_id AND year = p_year;

  previous_week := COALESCE(existing_scores -> week_key, '{}'::jsonb);
  previous_attempts := COALESCE(previous_week -> 'attempts', '[]'::jsonb);

  updated_week := jsonb_build_object(
    'score', COALESCE((p_attempt->>'score')::INTEGER, 0),
    'total', COALESCE((p_attempt->>'total')::INTEGER, 0),
    'percent', COALESCE((p_attempt->>'percent')::INTEGER, 0),
    'passRate', COALESCE((p_attempt->>'passRate')::INTEGER, 0),
    'passed', COALESCE((p_attempt->>'passed')::BOOLEAN, FALSE),
    'lessonBreakdown', COALESCE(p_attempt->'lessonBreakdown', '[]'::jsonb),
    'questionResults', COALESCE(p_attempt->'questionResults', '[]'::jsonb),
    'latestInsight', COALESCE(p_attempt->'insight', 'null'::jsonb),
    'attempts', previous_attempts || jsonb_build_array(p_attempt)
  );

  updated_scores := jsonb_set(existing_scores, ARRAY[week_key], updated_week, TRUE);

  IF existing_status IN ('PASSED', 'ASSIGNED_PROGRAM') THEN
    next_status := existing_status;
  END IF;

  PERFORM public.save_student_progress_state(
    p_student_id,
    p_year,
    jsonb_build_object(
      'status', next_status,
      'week', COALESCE(p_next_week, p_week),
      'quiz_scores', updated_scores
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_weekly_quiz_progress(UUID, TEXT, INTEGER, JSONB, INTEGER) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.save_posttest_progress(
  p_student_id UUID,
  p_year TEXT,
  p_latest JSONB DEFAULT '{}'::JSONB,
  p_status TEXT DEFAULT 'ASSIGNED_PROGRAM',
  p_week INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_scores JSONB := '{}'::JSONB;
  previous_posttest JSONB := '{}'::JSONB;
  previous_attempts JSONB := '[]'::JSONB;
  updated_scores JSONB := '{}'::JSONB;
BEGIN
  SELECT COALESCE(quiz_scores, '{}'::jsonb)
  INTO existing_scores
  FROM public.progress_snapshot
  WHERE student_id = p_student_id AND year = p_year;

  previous_posttest := COALESCE(existing_scores -> 'posttest', '{}'::jsonb);
  previous_attempts := COALESCE(previous_posttest -> 'attempts', '[]'::jsonb);

  updated_scores := jsonb_set(
    existing_scores,
    ARRAY['posttest'],
    jsonb_build_object(
      'latest', p_latest,
      'attempts', previous_attempts || jsonb_build_array(p_latest)
    ),
    TRUE
  );

  PERFORM public.save_student_progress_state(
    p_student_id,
    p_year,
    jsonb_build_object(
      'status', COALESCE(p_status, 'ASSIGNED_PROGRAM'),
      'week', p_week,
      'quiz_scores', updated_scores
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_posttest_progress(UUID, TEXT, JSONB, TEXT, INTEGER) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_student_progress_snapshot(
  p_student_id UUID
)
RETURNS TABLE(
  year TEXT,
  pretest_score INTEGER,
  status TEXT,
  week INTEGER,
  placement_complete BOOLEAN,
  assigned_week INTEGER,
  required_weeks JSONB,
  optional_weeks JSONB,
  unlocked_legends JSONB,
  completed_lesson_ids JSONB,
  quiz_scores JSONB,
  lesson_attempts JSONB,
  has_seen_intro BOOLEAN,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ps.year,
    ps.pretest_score,
    ps.status,
    ps.week,
    ps.placement_complete,
    ps.assigned_week,
    ps.required_weeks,
    ps.optional_weeks,
    ps.unlocked_legends,
    ps.completed_lesson_ids,
    ps.quiz_scores,
    ps.lesson_attempts,
    s.has_seen_intro,
    ps.updated_at
  FROM public.students s
  LEFT JOIN public.progress_snapshot ps
    ON ps.student_id = s.id
  WHERE s.id = p_student_id
  ORDER BY ps.updated_at DESC NULLS LAST, ps.year;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_progress_snapshot(UUID) TO anon, authenticated;
