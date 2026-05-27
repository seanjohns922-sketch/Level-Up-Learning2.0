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
  existing_attempts JSONB := '{}'::JSONB;
  previous_entry JSONB := '{}'::JSONB;
  previous_attempts JSONB := '[]'::JSONB;
  updated_attempts JSONB := '{}'::JSONB;
  existing_status TEXT := NULL;
  next_status TEXT := 'active';
BEGIN
  SELECT
    COALESCE(lesson_attempts, '{}'::jsonb),
    status
  INTO
    existing_attempts,
    existing_status
  FROM public.progress_snapshot
  WHERE student_id = p_student_id AND year = p_year;

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
      'lesson_attempts', updated_attempts
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_lesson_progress(UUID, TEXT, INTEGER, TEXT, JSONB) TO anon, authenticated;
