CREATE OR REPLACE FUNCTION public.get_student_realm_progress(
  p_student_id UUID,
  p_realm_id TEXT DEFAULT NULL
)
RETURNS SETOF public.student_realm_progress
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT srp.*
  FROM public.student_realm_progress srp
  WHERE srp.student_id = p_student_id
    AND (p_realm_id IS NULL OR srp.realm_id = p_realm_id)
  ORDER BY srp.is_current DESC, srp.updated_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_realm_progress(UUID, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_class_realm_progress(
  p_class_id UUID,
  p_realm_id TEXT,
  p_working_level TEXT DEFAULT NULL
)
RETURNS SETOF public.student_realm_progress
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT srp.*
  FROM public.student_realm_progress srp
  WHERE srp.class_id = p_class_id
    AND srp.realm_id = p_realm_id
    AND (p_working_level IS NULL OR srp.working_level = p_working_level)
  ORDER BY srp.updated_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_class_realm_progress(UUID, TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.save_student_realm_progress(
  p_student_id UUID,
  p_class_id UUID,
  p_realm_id TEXT,
  p_program_key TEXT,
  p_school_year_level TEXT,
  p_working_level TEXT,
  p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_is_current BOOLEAN := COALESCE(NULLIF(p_data->>'is_current', '')::BOOLEAN, TRUE);
  next_status TEXT := COALESCE(NULLIF(p_data->>'status', ''), 'ASSIGNED_PROGRAM');
  next_current_week INTEGER := NULLIF(p_data->>'current_week', '')::INTEGER;
  next_assigned_week INTEGER := NULLIF(p_data->>'assigned_week', '')::INTEGER;
  next_placement_complete BOOLEAN := COALESCE(NULLIF(p_data->>'placement_complete', '')::BOOLEAN, FALSE);
  next_pretest_score INTEGER := NULLIF(p_data->>'pretest_score', '')::INTEGER;
  next_pretest_completed_at TIMESTAMPTZ := NULLIF(p_data->>'pretest_completed_at', '')::TIMESTAMPTZ;
  next_posttest_score INTEGER := NULLIF(p_data->>'posttest_score', '')::INTEGER;
  next_posttest_completed_at TIMESTAMPTZ := NULLIF(p_data->>'posttest_completed_at', '')::TIMESTAMPTZ;
  next_required_weeks JSONB := COALESCE(p_data->'required_weeks', '[]'::jsonb);
  next_optional_weeks JSONB := COALESCE(p_data->'optional_weeks', '[]'::jsonb);
  next_unlocked_legends JSONB := COALESCE(p_data->'unlocked_legends', '[]'::jsonb);
BEGIN
  IF next_is_current THEN
    UPDATE public.student_realm_progress
    SET is_current = FALSE
    WHERE student_id = p_student_id
      AND realm_id = p_realm_id
      AND working_level <> p_working_level
      AND is_current = TRUE;
  END IF;

  INSERT INTO public.student_realm_progress (
    student_id,
    class_id,
    realm_id,
    program_key,
    school_year_level,
    working_level,
    is_current,
    status,
    current_week,
    assigned_week,
    placement_complete,
    pretest_score,
    pretest_completed_at,
    posttest_score,
    posttest_completed_at,
    required_weeks,
    optional_weeks,
    unlocked_legends
  ) VALUES (
    p_student_id,
    p_class_id,
    p_realm_id,
    p_program_key,
    p_school_year_level,
    p_working_level,
    next_is_current,
    next_status,
    next_current_week,
    next_assigned_week,
    next_placement_complete,
    next_pretest_score,
    next_pretest_completed_at,
    next_posttest_score,
    next_posttest_completed_at,
    next_required_weeks,
    next_optional_weeks,
    next_unlocked_legends
  )
  ON CONFLICT (student_id, realm_id, working_level) DO UPDATE SET
    class_id = COALESCE(EXCLUDED.class_id, public.student_realm_progress.class_id),
    program_key = COALESCE(EXCLUDED.program_key, public.student_realm_progress.program_key),
    school_year_level = COALESCE(EXCLUDED.school_year_level, public.student_realm_progress.school_year_level),
    is_current = COALESCE(EXCLUDED.is_current, public.student_realm_progress.is_current),
    status = COALESCE(EXCLUDED.status, public.student_realm_progress.status),
    current_week = COALESCE(EXCLUDED.current_week, public.student_realm_progress.current_week),
    assigned_week = COALESCE(EXCLUDED.assigned_week, public.student_realm_progress.assigned_week),
    placement_complete = COALESCE(EXCLUDED.placement_complete, public.student_realm_progress.placement_complete),
    pretest_score = COALESCE(EXCLUDED.pretest_score, public.student_realm_progress.pretest_score),
    pretest_completed_at = COALESCE(EXCLUDED.pretest_completed_at, public.student_realm_progress.pretest_completed_at),
    posttest_score = COALESCE(EXCLUDED.posttest_score, public.student_realm_progress.posttest_score),
    posttest_completed_at = COALESCE(EXCLUDED.posttest_completed_at, public.student_realm_progress.posttest_completed_at),
    required_weeks = COALESCE(EXCLUDED.required_weeks, public.student_realm_progress.required_weeks),
    optional_weeks = COALESCE(EXCLUDED.optional_weeks, public.student_realm_progress.optional_weeks),
    unlocked_legends = COALESCE(EXCLUDED.unlocked_legends, public.student_realm_progress.unlocked_legends),
    updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_student_realm_progress(UUID, UUID, TEXT, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_current_student_realm_level(
  p_student_id UUID,
  p_realm_id TEXT,
  p_working_level TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.student_realm_progress
  SET is_current = (working_level = p_working_level),
      updated_at = now()
  WHERE student_id = p_student_id
    AND realm_id = p_realm_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_current_student_realm_level(UUID, TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.save_realm_lesson_attempt(
  p_student_id UUID,
  p_class_id UUID,
  p_realm_id TEXT,
  p_program_key TEXT,
  p_school_year_level TEXT,
  p_working_level TEXT,
  p_week INTEGER,
  p_lesson INTEGER,
  p_lesson_id TEXT,
  p_attempt JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_attempt_no INTEGER;
  next_correct_count INTEGER := COALESCE(NULLIF(p_attempt->>'correct_count', '')::INTEGER, NULLIF(p_attempt->>'correctAnswers', '')::INTEGER, 0);
  next_total_questions INTEGER := COALESCE(NULLIF(p_attempt->>'total_questions', '')::INTEGER, NULLIF(p_attempt->>'questionsAnswered', '')::INTEGER, 0);
  next_accuracy_percent INTEGER := COALESCE(
    NULLIF(p_attempt->>'accuracy_percent', '')::INTEGER,
    NULLIF(p_attempt->>'accuracy', '')::INTEGER,
    CASE
      WHEN COALESCE(NULLIF(p_attempt->>'total_questions', '')::INTEGER, NULLIF(p_attempt->>'questionsAnswered', '')::INTEGER, 0) > 0
        THEN ROUND(
          COALESCE(NULLIF(p_attempt->>'correct_count', '')::INTEGER, NULLIF(p_attempt->>'correctAnswers', '')::INTEGER, 0)::NUMERIC
          * 100
          / COALESCE(NULLIF(p_attempt->>'total_questions', '')::INTEGER, NULLIF(p_attempt->>'questionsAnswered', '')::INTEGER, 1)
        )::INTEGER
      ELSE 0
    END
  );
  next_time_spent_seconds INTEGER := NULLIF(p_attempt->>'time_spent_seconds', '')::INTEGER;
  next_completed BOOLEAN := COALESCE(NULLIF(p_attempt->>'completed', '')::BOOLEAN, TRUE);
  next_completed_at TIMESTAMPTZ := COALESCE(NULLIF(p_attempt->>'completed_at', '')::TIMESTAMPTZ, now());
  next_topic_focus TEXT := COALESCE(NULLIF(p_attempt->>'topic_focus', ''), NULLIF(p_attempt->>'focus', ''));
  next_summary JSONB := COALESCE(p_attempt, '{}'::jsonb);
  next_insight JSONB := COALESCE(p_attempt->'insight', '{}'::jsonb);
  current_summary public.student_realm_progress%ROWTYPE;
BEGIN
  SELECT COALESCE(MAX(attempt_no), 0) + 1
  INTO next_attempt_no
  FROM public.student_lesson_attempts
  WHERE student_id = p_student_id
    AND realm_id = p_realm_id
    AND working_level = p_working_level
    AND week = p_week
    AND lesson = p_lesson;

  INSERT INTO public.student_lesson_attempts (
    student_id,
    class_id,
    realm_id,
    program_key,
    school_year_level,
    working_level,
    week,
    lesson,
    lesson_id,
    topic_focus,
    attempt_no,
    correct_count,
    total_questions,
    accuracy_percent,
    time_spent_seconds,
    completed,
    completed_at,
    summary,
    insight
  ) VALUES (
    p_student_id,
    p_class_id,
    p_realm_id,
    p_program_key,
    p_school_year_level,
    p_working_level,
    p_week,
    p_lesson,
    p_lesson_id,
    next_topic_focus,
    next_attempt_no,
    next_correct_count,
    next_total_questions,
    next_accuracy_percent,
    next_time_spent_seconds,
    next_completed,
    next_completed_at,
    next_summary,
    next_insight
  );

  SELECT *
  INTO current_summary
  FROM public.student_realm_progress
  WHERE student_id = p_student_id
    AND realm_id = p_realm_id
    AND working_level = p_working_level;

  PERFORM public.save_student_realm_progress(
    p_student_id,
    p_class_id,
    p_realm_id,
    p_program_key,
    p_school_year_level,
    p_working_level,
    jsonb_build_object(
      'status', COALESCE(current_summary.status, 'ASSIGNED_PROGRAM'),
      'current_week', GREATEST(COALESCE(current_summary.current_week, p_week), p_week),
      'assigned_week', COALESCE(current_summary.assigned_week, p_week),
      'placement_complete', COALESCE(current_summary.placement_complete, FALSE),
      'required_weeks', COALESCE(current_summary.required_weeks, '[]'::jsonb),
      'optional_weeks', COALESCE(current_summary.optional_weeks, '[]'::jsonb),
      'unlocked_legends', COALESCE(current_summary.unlocked_legends, '[]'::jsonb)
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_realm_lesson_attempt(UUID, UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, TEXT, JSONB) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_student_realm_lesson_attempts(
  p_student_id UUID,
  p_realm_id TEXT,
  p_working_level TEXT DEFAULT NULL
)
RETURNS SETOF public.student_lesson_attempts
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT sla.*
  FROM public.student_lesson_attempts sla
  WHERE sla.student_id = p_student_id
    AND sla.realm_id = p_realm_id
    AND (p_working_level IS NULL OR sla.working_level = p_working_level)
  ORDER BY sla.completed_at DESC, sla.attempt_no DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_realm_lesson_attempts(UUID, TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_class_realm_lesson_attempts(
  p_class_id UUID,
  p_realm_id TEXT,
  p_working_level TEXT DEFAULT NULL
)
RETURNS SETOF public.student_lesson_attempts
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT sla.*
  FROM public.student_lesson_attempts sla
  WHERE sla.class_id = p_class_id
    AND sla.realm_id = p_realm_id
    AND (p_working_level IS NULL OR sla.working_level = p_working_level)
  ORDER BY sla.completed_at DESC, sla.attempt_no DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_class_realm_lesson_attempts(UUID, TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.save_realm_weekly_quiz_attempt(
  p_student_id UUID,
  p_class_id UUID,
  p_realm_id TEXT,
  p_program_key TEXT,
  p_school_year_level TEXT,
  p_working_level TEXT,
  p_week INTEGER,
  p_quiz_id TEXT,
  p_attempt JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_attempt_no INTEGER;
  next_correct_count INTEGER := COALESCE(NULLIF(p_attempt->>'correct_count', '')::INTEGER, NULLIF(p_attempt->>'correct', '')::INTEGER, NULLIF(p_attempt->>'score', '')::INTEGER, 0);
  next_total_questions INTEGER := COALESCE(NULLIF(p_attempt->>'total_questions', '')::INTEGER, NULLIF(p_attempt->>'total', '')::INTEGER, 0);
  next_accuracy_percent INTEGER := COALESCE(
    NULLIF(p_attempt->>'accuracy_percent', '')::INTEGER,
    NULLIF(p_attempt->>'percent', '')::INTEGER,
    NULLIF(p_attempt->>'accuracy', '')::INTEGER,
    CASE
      WHEN COALESCE(NULLIF(p_attempt->>'total_questions', '')::INTEGER, NULLIF(p_attempt->>'total', '')::INTEGER, 0) > 0
        THEN ROUND(
          COALESCE(NULLIF(p_attempt->>'correct_count', '')::INTEGER, NULLIF(p_attempt->>'correct', '')::INTEGER, NULLIF(p_attempt->>'score', '')::INTEGER, 0)::NUMERIC
          * 100
          / COALESCE(NULLIF(p_attempt->>'total_questions', '')::INTEGER, NULLIF(p_attempt->>'total', '')::INTEGER, 1)
        )::INTEGER
      ELSE 0
    END
  );
  next_passed BOOLEAN := COALESCE(NULLIF(p_attempt->>'passed', '')::BOOLEAN, next_accuracy_percent >= 80);
  next_completed_at TIMESTAMPTZ := COALESCE(NULLIF(p_attempt->>'completed_at', '')::TIMESTAMPTZ, now());
  next_lesson_breakdown JSONB := COALESCE(p_attempt->'lessonBreakdown', '{}'::jsonb);
  next_summary JSONB := COALESCE(p_attempt, '{}'::jsonb);
  next_insight JSONB := COALESCE(p_attempt->'insight', '{}'::jsonb);
  current_summary public.student_realm_progress%ROWTYPE;
BEGIN
  SELECT COALESCE(MAX(attempt_no), 0) + 1
  INTO next_attempt_no
  FROM public.student_weekly_quiz_attempts
  WHERE student_id = p_student_id
    AND realm_id = p_realm_id
    AND working_level = p_working_level
    AND week = p_week;

  INSERT INTO public.student_weekly_quiz_attempts (
    student_id,
    class_id,
    realm_id,
    program_key,
    school_year_level,
    working_level,
    week,
    quiz_id,
    attempt_no,
    correct_count,
    total_questions,
    accuracy_percent,
    passed,
    completed_at,
    lesson_breakdown,
    summary,
    insight
  ) VALUES (
    p_student_id,
    p_class_id,
    p_realm_id,
    p_program_key,
    p_school_year_level,
    p_working_level,
    p_week,
    p_quiz_id,
    next_attempt_no,
    next_correct_count,
    next_total_questions,
    next_accuracy_percent,
    next_passed,
    next_completed_at,
    next_lesson_breakdown,
    next_summary,
    next_insight
  );

  SELECT *
  INTO current_summary
  FROM public.student_realm_progress
  WHERE student_id = p_student_id
    AND realm_id = p_realm_id
    AND working_level = p_working_level;

  PERFORM public.save_student_realm_progress(
    p_student_id,
    p_class_id,
    p_realm_id,
    p_program_key,
    p_school_year_level,
    p_working_level,
    jsonb_build_object(
      'status', COALESCE(current_summary.status, 'ASSIGNED_PROGRAM'),
      'current_week', CASE
        WHEN next_passed THEN GREATEST(COALESCE(current_summary.current_week, p_week), p_week + 1)
        ELSE GREATEST(COALESCE(current_summary.current_week, p_week), p_week)
      END,
      'assigned_week', COALESCE(current_summary.assigned_week, p_week),
      'placement_complete', COALESCE(current_summary.placement_complete, FALSE),
      'required_weeks', COALESCE(current_summary.required_weeks, '[]'::jsonb),
      'optional_weeks', COALESCE(current_summary.optional_weeks, '[]'::jsonb),
      'unlocked_legends', COALESCE(current_summary.unlocked_legends, '[]'::jsonb)
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_realm_weekly_quiz_attempt(UUID, UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, JSONB) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_student_realm_weekly_quiz_attempts(
  p_student_id UUID,
  p_realm_id TEXT,
  p_working_level TEXT DEFAULT NULL
)
RETURNS SETOF public.student_weekly_quiz_attempts
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT swqa.*
  FROM public.student_weekly_quiz_attempts swqa
  WHERE swqa.student_id = p_student_id
    AND swqa.realm_id = p_realm_id
    AND (p_working_level IS NULL OR swqa.working_level = p_working_level)
  ORDER BY swqa.completed_at DESC, swqa.attempt_no DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_realm_weekly_quiz_attempts(UUID, TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_class_realm_weekly_quiz_attempts(
  p_class_id UUID,
  p_realm_id TEXT,
  p_working_level TEXT DEFAULT NULL
)
RETURNS SETOF public.student_weekly_quiz_attempts
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT swqa.*
  FROM public.student_weekly_quiz_attempts swqa
  WHERE swqa.class_id = p_class_id
    AND swqa.realm_id = p_realm_id
    AND (p_working_level IS NULL OR swqa.working_level = p_working_level)
  ORDER BY swqa.completed_at DESC, swqa.attempt_no DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_class_realm_weekly_quiz_attempts(UUID, TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.save_realm_assessment(
  p_student_id UUID,
  p_class_id UUID,
  p_realm_id TEXT,
  p_program_key TEXT,
  p_school_year_level TEXT,
  p_working_level TEXT,
  p_assessment_type TEXT,
  p_attempt JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_correct_count INTEGER := COALESCE(NULLIF(p_attempt->>'correct_count', '')::INTEGER, NULLIF(p_attempt->>'correct', '')::INTEGER, NULLIF(p_attempt->>'score', '')::INTEGER);
  next_total_questions INTEGER := COALESCE(NULLIF(p_attempt->>'total_questions', '')::INTEGER, NULLIF(p_attempt->>'total', '')::INTEGER);
  next_score_percent INTEGER := COALESCE(NULLIF(p_attempt->>'score_percent', '')::INTEGER, NULLIF(p_attempt->>'percent', '')::INTEGER, 0);
  next_passed BOOLEAN := NULLIF(p_attempt->>'passed', '')::BOOLEAN;
  next_placement_result JSONB := COALESCE(p_attempt->'placement_result', p_attempt->'profile', '{}'::jsonb);
  next_question_results JSONB := COALESCE(p_attempt->'question_results', p_attempt->'questionResults', '[]'::jsonb);
  next_completed_at TIMESTAMPTZ := COALESCE(NULLIF(p_attempt->>'completed_at', '')::TIMESTAMPTZ, now());
  current_summary public.student_realm_progress%ROWTYPE;
BEGIN
  INSERT INTO public.student_realm_assessments (
    student_id,
    class_id,
    realm_id,
    program_key,
    school_year_level,
    working_level,
    assessment_type,
    correct_count,
    total_questions,
    score_percent,
    passed,
    placement_result,
    question_results,
    completed_at
  ) VALUES (
    p_student_id,
    p_class_id,
    p_realm_id,
    p_program_key,
    p_school_year_level,
    p_working_level,
    p_assessment_type,
    next_correct_count,
    next_total_questions,
    next_score_percent,
    next_passed,
    next_placement_result,
    next_question_results,
    next_completed_at
  );

  SELECT *
  INTO current_summary
  FROM public.student_realm_progress
  WHERE student_id = p_student_id
    AND realm_id = p_realm_id
    AND working_level = p_working_level;

  PERFORM public.save_student_realm_progress(
    p_student_id,
    p_class_id,
    p_realm_id,
    p_program_key,
    p_school_year_level,
    p_working_level,
    CASE
      WHEN p_assessment_type = 'pretest' THEN jsonb_build_object(
        'status', COALESCE(current_summary.status, 'ASSIGNED_PROGRAM'),
        'placement_complete', COALESCE(current_summary.placement_complete, FALSE),
        'pretest_score', next_score_percent,
        'pretest_completed_at', next_completed_at,
        'current_week', COALESCE(current_summary.current_week, 1),
        'assigned_week', COALESCE(current_summary.assigned_week, 1),
        'required_weeks', COALESCE(current_summary.required_weeks, '[]'::jsonb),
        'optional_weeks', COALESCE(current_summary.optional_weeks, '[]'::jsonb),
        'unlocked_legends', COALESCE(current_summary.unlocked_legends, '[]'::jsonb)
      )
      ELSE jsonb_build_object(
        'status', COALESCE(current_summary.status, 'ASSIGNED_PROGRAM'),
        'placement_complete', COALESCE(current_summary.placement_complete, FALSE),
        'posttest_score', next_score_percent,
        'posttest_completed_at', next_completed_at,
        'current_week', current_summary.current_week,
        'assigned_week', current_summary.assigned_week,
        'required_weeks', COALESCE(current_summary.required_weeks, '[]'::jsonb),
        'optional_weeks', COALESCE(current_summary.optional_weeks, '[]'::jsonb),
        'unlocked_legends', COALESCE(current_summary.unlocked_legends, '[]'::jsonb)
      )
    END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_realm_assessment(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_student_realm_assessments(
  p_student_id UUID,
  p_realm_id TEXT,
  p_working_level TEXT DEFAULT NULL
)
RETURNS SETOF public.student_realm_assessments
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT sra.*
  FROM public.student_realm_assessments sra
  WHERE sra.student_id = p_student_id
    AND sra.realm_id = p_realm_id
    AND (p_working_level IS NULL OR sra.working_level = p_working_level)
  ORDER BY sra.completed_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_realm_assessments(UUID, TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_student_realm_progress_compat(
  p_student_id UUID,
  p_realm_id TEXT
)
RETURNS TABLE (
  student_id UUID,
  class_id UUID,
  realm_id TEXT,
  program_key TEXT,
  school_year_level TEXT,
  working_level TEXT,
  is_current BOOLEAN,
  status TEXT,
  current_week INTEGER,
  assigned_week INTEGER,
  placement_complete BOOLEAN,
  pretest_score INTEGER,
  pretest_completed_at TIMESTAMPTZ,
  posttest_score INTEGER,
  posttest_completed_at TIMESTAMPTZ,
  required_weeks JSONB,
  optional_weeks JSONB,
  unlocked_legends JSONB,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    srp.student_id,
    srp.class_id,
    srp.realm_id,
    srp.program_key,
    srp.school_year_level,
    srp.working_level,
    srp.is_current,
    srp.status,
    srp.current_week,
    srp.assigned_week,
    srp.placement_complete,
    srp.pretest_score,
    srp.pretest_completed_at,
    srp.posttest_score,
    srp.posttest_completed_at,
    srp.required_weeks,
    srp.optional_weeks,
    srp.unlocked_legends,
    srp.updated_at
  FROM public.student_realm_progress srp
  WHERE srp.student_id = p_student_id
    AND srp.realm_id = p_realm_id
  ORDER BY srp.is_current DESC, srp.updated_at DESC;

  IF FOUND THEN
    RETURN;
  END IF;

  IF p_realm_id = 'number' THEN
    RETURN QUERY
    SELECT
      ps.student_id,
      s.class_id,
      'number'::TEXT,
      lower(replace(ps.year, ' ', '')) || '-number' AS program_key,
      s.school_year_level,
      ps.year AS working_level,
      TRUE AS is_current,
      COALESCE(ps.status, 'ASSIGNED_PROGRAM') AS status,
      ps.week AS current_week,
      ps.assigned_week,
      COALESCE(ps.placement_complete, FALSE),
      ps.pretest_score,
      NULL::TIMESTAMPTZ AS pretest_completed_at,
      NULL::INTEGER AS posttest_score,
      NULL::TIMESTAMPTZ AS posttest_completed_at,
      COALESCE(ps.required_weeks, '[]'::jsonb),
      COALESCE(ps.optional_weeks, '[]'::jsonb),
      COALESCE(ps.unlocked_legends, '[]'::jsonb),
      ps.updated_at
    FROM public.progress_snapshot ps
    JOIN public.students s ON s.id = ps.student_id
    WHERE ps.student_id = p_student_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_realm_progress_compat(UUID, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_class_realm_progress_compat(
  p_class_id UUID,
  p_realm_id TEXT,
  p_working_level TEXT DEFAULT NULL
)
RETURNS TABLE (
  student_id UUID,
  class_id UUID,
  realm_id TEXT,
  program_key TEXT,
  school_year_level TEXT,
  working_level TEXT,
  is_current BOOLEAN,
  status TEXT,
  current_week INTEGER,
  assigned_week INTEGER,
  placement_complete BOOLEAN,
  pretest_score INTEGER,
  pretest_completed_at TIMESTAMPTZ,
  posttest_score INTEGER,
  posttest_completed_at TIMESTAMPTZ,
  required_weeks JSONB,
  optional_weeks JSONB,
  unlocked_legends JSONB,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    srp.student_id,
    srp.class_id,
    srp.realm_id,
    srp.program_key,
    srp.school_year_level,
    srp.working_level,
    srp.is_current,
    srp.status,
    srp.current_week,
    srp.assigned_week,
    srp.placement_complete,
    srp.pretest_score,
    srp.pretest_completed_at,
    srp.posttest_score,
    srp.posttest_completed_at,
    srp.required_weeks,
    srp.optional_weeks,
    srp.unlocked_legends,
    srp.updated_at
  FROM public.student_realm_progress srp
  WHERE srp.class_id = p_class_id
    AND srp.realm_id = p_realm_id
    AND (p_working_level IS NULL OR srp.working_level = p_working_level)
  ORDER BY srp.updated_at DESC;

  IF FOUND THEN
    RETURN;
  END IF;

  IF p_realm_id = 'number' THEN
    RETURN QUERY
    SELECT
      ps.student_id,
      s.class_id,
      'number'::TEXT,
      lower(replace(ps.year, ' ', '')) || '-number' AS program_key,
      s.school_year_level,
      ps.year AS working_level,
      TRUE AS is_current,
      COALESCE(ps.status, 'ASSIGNED_PROGRAM') AS status,
      ps.week AS current_week,
      ps.assigned_week,
      COALESCE(ps.placement_complete, FALSE),
      ps.pretest_score,
      NULL::TIMESTAMPTZ AS pretest_completed_at,
      NULL::INTEGER AS posttest_score,
      NULL::TIMESTAMPTZ AS posttest_completed_at,
      COALESCE(ps.required_weeks, '[]'::jsonb),
      COALESCE(ps.optional_weeks, '[]'::jsonb),
      COALESCE(ps.unlocked_legends, '[]'::jsonb),
      ps.updated_at
    FROM public.progress_snapshot ps
    JOIN public.students s ON s.id = ps.student_id
    WHERE s.class_id = p_class_id
      AND (p_working_level IS NULL OR ps.year = p_working_level);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_class_realm_progress_compat(UUID, TEXT, TEXT) TO anon, authenticated;
