CREATE OR REPLACE FUNCTION public.normalize_progress_year_label(p_label TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  cleaned TEXT := NULLIF(BTRIM(p_label), '');
  level_number INTEGER;
BEGIN
  IF cleaned IS NULL THEN
    RETURN NULL;
  END IF;

  IF cleaned ILIKE 'prep' OR cleaned ILIKE 'ground level' OR cleaned ILIKE 'ground' THEN
    RETURN 'Prep';
  END IF;

  IF cleaned ~* '^year\s+[0-6]$' THEN
    RETURN INITCAP(cleaned);
  END IF;

  IF cleaned ~* '^level\s+[1-6]$' THEN
    level_number := regexp_replace(cleaned, '\D', '', 'g')::INTEGER;
    RETURN FORMAT('Year %s', level_number);
  END IF;

  RETURN cleaned;
END;
$$;

CREATE OR REPLACE FUNCTION public.backfill_progress_snapshot_from_live_events(
  p_student_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completion_event RECORD;
  normalized_year TEXT;
  existing_scores JSONB := '{}'::JSONB;
  existing_attempts JSONB := '{}'::JSONB;
  existing_completed_ids JSONB := '[]'::JSONB;
  existing_status TEXT := NULL;
  existing_week INTEGER := NULL;
  lesson_id TEXT;
  lesson_attempt JSONB;
  previous_entry JSONB := '{}'::JSONB;
  previous_attempts JSONB := '[]'::JSONB;
  updated_attempts JSONB := '{}'::JSONB;
  updated_completed_ids JSONB := '[]'::JSONB;
  questions_answered INTEGER;
  correct_count INTEGER;
  accuracy_percent INTEGER;
  completed_at TIMESTAMPTZ;
  next_status TEXT := 'active';
BEGIN
  FOR completion_event IN
    SELECT
      e.student_id,
      e.created_at,
      e.payload
    FROM public.live_activity_events e
    WHERE e.event_type = 'lesson_completed'
      AND (p_student_id IS NULL OR e.student_id = p_student_id)
    ORDER BY e.created_at
  LOOP
    normalized_year := public.normalize_progress_year_label(completion_event.payload->>'level');
    lesson_id := NULLIF(BTRIM(completion_event.payload->>'lessonId'), '');

    IF normalized_year IS NULL OR lesson_id IS NULL THEN
      CONTINUE;
    END IF;

    questions_answered := NULLIF(completion_event.payload->>'questionsAnswered', '')::INTEGER;
    correct_count := NULLIF(completion_event.payload->>'correctCount', '')::INTEGER;
    accuracy_percent := NULLIF(completion_event.payload->>'accuracyPercent', '')::INTEGER;
    completed_at := COALESCE(
      NULLIF(completion_event.payload->>'completedAt', '')::TIMESTAMPTZ,
      completion_event.created_at
    );

    lesson_attempt := jsonb_build_object(
      'at', completed_at,
      'lessonId', lesson_id,
      'title', COALESCE(NULLIF(BTRIM(completion_event.payload->>'lessonTitle'), ''), lesson_id),
      'questionsAnswered', questions_answered,
      'correctAnswers', correct_count,
      'accuracy', accuracy_percent,
      'timeSpentSeconds', NULL,
      'topicSummaries', '[]'::JSONB,
      'strengths', '[]'::JSONB,
      'areasToImprove', '[]'::JSONB,
      'struggledQuestionTypes', '[]'::JSONB,
      'insight', NULL
    );

    SELECT
      COALESCE(ps.quiz_scores, '{}'::JSONB),
      COALESCE(ps.lesson_attempts, '{}'::JSONB),
      COALESCE(ps.completed_lesson_ids, '[]'::JSONB),
      ps.status,
      ps.week
    INTO
      existing_scores,
      existing_attempts,
      existing_completed_ids,
      existing_status,
      existing_week
    FROM public.progress_snapshot ps
    WHERE ps.student_id = completion_event.student_id
      AND ps.year = normalized_year;

    previous_entry := COALESCE(existing_attempts -> lesson_id, '{}'::JSONB);
    previous_attempts := COALESCE(previous_entry -> 'attempts', '[]'::JSONB);

    IF NOT (existing_completed_ids @> jsonb_build_array(lesson_id)) THEN
      updated_completed_ids := existing_completed_ids || jsonb_build_array(lesson_id);
    ELSE
      updated_completed_ids := existing_completed_ids;
    END IF;

    updated_attempts := jsonb_set(
      existing_attempts,
      ARRAY[lesson_id],
      jsonb_build_object(
        'latestSummary', lesson_attempt,
        'latestInsight', 'null'::jsonb,
        'attempts',
        CASE
          WHEN previous_attempts @> jsonb_build_array(lesson_attempt) THEN previous_attempts
          ELSE previous_attempts || jsonb_build_array(lesson_attempt)
        END
      ),
      TRUE
    );

    IF existing_status IN ('PASSED', 'ASSIGNED_PROGRAM') THEN
      next_status := existing_status;
    ELSE
      next_status := 'active';
    END IF;

    INSERT INTO public.progress_snapshot (
      student_id,
      year,
      week,
      status,
      completed_lesson_ids,
      lesson_attempts,
      quiz_scores
    )
    VALUES (
      completion_event.student_id,
      normalized_year,
      COALESCE(existing_week, NULLIF(completion_event.payload->>'week', '')::INTEGER, 1),
      next_status,
      updated_completed_ids,
      updated_attempts,
      existing_scores
    )
    ON CONFLICT (student_id, year) DO UPDATE SET
      week = GREATEST(
        COALESCE(public.progress_snapshot.week, 1),
        COALESCE(EXCLUDED.week, public.progress_snapshot.week, 1)
      ),
      status = CASE
        WHEN public.progress_snapshot.status IN ('PASSED', 'ASSIGNED_PROGRAM')
          THEN public.progress_snapshot.status
        ELSE EXCLUDED.status
      END,
      completed_lesson_ids = EXCLUDED.completed_lesson_ids,
      lesson_attempts = EXCLUDED.lesson_attempts,
      updated_at = NOW();
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.backfill_progress_snapshot_from_live_events(UUID) TO anon, authenticated;

SELECT public.backfill_progress_snapshot_from_live_events(NULL);
