CREATE OR REPLACE FUNCTION public.backfill_number_progress_snapshot_to_realm_tables()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  progress_row RECORD;
  lesson_entry RECORD;
  lesson_attempt RECORD;
  completed_lesson_entry JSONB;
  quiz_entry RECORD;
  quiz_attempt RECORD;
  posttest_entry JSONB;
  posttest_attempt JSONB;
  inferred_posttest_percent INTEGER;
BEGIN
  FOR progress_row IN
    SELECT
      ps.*,
      s.class_id,
      s.school_year_level,
      lower(replace(ps.year, ' ', '')) || '-number' AS program_key
    FROM public.progress_snapshot ps
    JOIN public.students s ON s.id = ps.student_id
    WHERE ps.year IS NOT NULL
  LOOP
    PERFORM public.save_student_realm_progress(
      progress_row.student_id,
      progress_row.class_id,
      'number',
      progress_row.program_key,
      progress_row.school_year_level,
      progress_row.year,
      jsonb_build_object(
        'is_current', TRUE,
        'status', COALESCE(progress_row.status, 'ASSIGNED_PROGRAM'),
        'current_week', progress_row.week,
        'assigned_week', progress_row.assigned_week,
        'placement_complete', COALESCE(progress_row.placement_complete, FALSE),
        'pretest_score', progress_row.pretest_score,
        'required_weeks', COALESCE(progress_row.required_weeks, '[]'::jsonb),
        'optional_weeks', COALESCE(progress_row.optional_weeks, '[]'::jsonb),
        'unlocked_legends', COALESCE(progress_row.unlocked_legends, '[]'::jsonb)
      )
    );

    IF progress_row.pretest_score IS NOT NULL THEN
      INSERT INTO public.student_realm_assessments (
        student_id,
        class_id,
        realm_id,
        program_key,
        school_year_level,
        working_level,
        assessment_type,
        score_percent,
        completed_at
      )
      SELECT
        progress_row.student_id,
        progress_row.class_id,
        'number',
        progress_row.program_key,
        progress_row.school_year_level,
        progress_row.year,
        'pretest',
        progress_row.pretest_score,
        COALESCE(progress_row.updated_at, now())
      WHERE NOT EXISTS (
        SELECT 1
        FROM public.student_realm_assessments sra
        WHERE sra.student_id = progress_row.student_id
          AND sra.realm_id = 'number'
          AND sra.working_level = progress_row.year
          AND sra.assessment_type = 'pretest'
          AND sra.score_percent = progress_row.pretest_score
      );
    END IF;

    FOR lesson_entry IN
      SELECT key AS lesson_id, value AS lesson_data
      FROM jsonb_each(COALESCE(progress_row.lesson_attempts, '{}'::jsonb))
    LOOP
      IF jsonb_typeof(COALESCE(lesson_entry.lesson_data->'attempts', '[]'::jsonb)) = 'array' THEN
        FOR lesson_attempt IN
          SELECT value AS attempt_data, ordinality
          FROM jsonb_array_elements(COALESCE(lesson_entry.lesson_data->'attempts', '[]'::jsonb)) WITH ORDINALITY
        LOOP
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
          )
          SELECT
            progress_row.student_id,
            progress_row.class_id,
            'number',
            progress_row.program_key,
            progress_row.school_year_level,
            progress_row.year,
            COALESCE((regexp_match(lesson_entry.lesson_id, '-w([0-9]+)-l([0-9]+)$'))[1]::INTEGER, progress_row.week, 1),
            COALESCE((regexp_match(lesson_entry.lesson_id, '-w([0-9]+)-l([0-9]+)$'))[2]::INTEGER, 1),
            lesson_entry.lesson_id,
            COALESCE(lesson_attempt.attempt_data->>'topic_focus', lesson_attempt.attempt_data->>'focus'),
            lesson_attempt.ordinality::INTEGER,
            COALESCE(NULLIF(lesson_attempt.attempt_data->>'correct_count', '')::INTEGER, NULLIF(lesson_attempt.attempt_data->>'correctAnswers', '')::INTEGER, 0),
            COALESCE(NULLIF(lesson_attempt.attempt_data->>'total_questions', '')::INTEGER, NULLIF(lesson_attempt.attempt_data->>'questionsAnswered', '')::INTEGER, 0),
            COALESCE(
              NULLIF(lesson_attempt.attempt_data->>'accuracy_percent', '')::INTEGER,
              NULLIF(lesson_attempt.attempt_data->>'accuracy', '')::INTEGER,
              CASE
                WHEN COALESCE(NULLIF(lesson_attempt.attempt_data->>'total_questions', '')::INTEGER, NULLIF(lesson_attempt.attempt_data->>'questionsAnswered', '')::INTEGER, 0) > 0
                  THEN ROUND(
                    COALESCE(NULLIF(lesson_attempt.attempt_data->>'correct_count', '')::INTEGER, NULLIF(lesson_attempt.attempt_data->>'correctAnswers', '')::INTEGER, 0)::NUMERIC
                    * 100
                    / COALESCE(NULLIF(lesson_attempt.attempt_data->>'total_questions', '')::INTEGER, NULLIF(lesson_attempt.attempt_data->>'questionsAnswered', '')::INTEGER, 1)
                  )::INTEGER
                ELSE 0
              END
            ),
            NULLIF(lesson_attempt.attempt_data->>'time_spent_seconds', '')::INTEGER,
            TRUE,
            COALESCE(NULLIF(lesson_attempt.attempt_data->>'completed_at', '')::TIMESTAMPTZ, progress_row.updated_at, now()),
            lesson_attempt.attempt_data,
            COALESCE(lesson_attempt.attempt_data->'insight', '{}'::jsonb)
          WHERE NOT EXISTS (
            SELECT 1
            FROM public.student_lesson_attempts sla
            WHERE sla.student_id = progress_row.student_id
              AND sla.realm_id = 'number'
              AND sla.working_level = progress_row.year
              AND sla.lesson_id = lesson_entry.lesson_id
              AND sla.attempt_no = lesson_attempt.ordinality::INTEGER
          );
        END LOOP;
      END IF;
    END LOOP;

    FOR completed_lesson_entry IN
      SELECT value
      FROM jsonb_array_elements(COALESCE(progress_row.completed_lesson_ids, '[]'::jsonb))
    LOOP
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
      )
      SELECT
        progress_row.student_id,
        progress_row.class_id,
        'number',
        progress_row.program_key,
        progress_row.school_year_level,
        progress_row.year,
        COALESCE((regexp_match(trim(both '"' from completed_lesson_entry::TEXT), '-w([0-9]+)-l([0-9]+)$'))[1]::INTEGER, progress_row.week, 1),
        COALESCE((regexp_match(trim(both '"' from completed_lesson_entry::TEXT), '-w([0-9]+)-l([0-9]+)$'))[2]::INTEGER, 1),
        trim(both '"' from completed_lesson_entry::TEXT),
        NULL,
        1,
        0,
        0,
        0,
        NULL,
        TRUE,
        COALESCE(progress_row.updated_at, now()),
        jsonb_build_object('backfilled_from', 'completed_lesson_ids'),
        '{}'::jsonb
      WHERE trim(both '"' from completed_lesson_entry::TEXT) <> ''
        AND NOT EXISTS (
          SELECT 1
          FROM public.student_lesson_attempts sla
          WHERE sla.student_id = progress_row.student_id
            AND sla.realm_id = 'number'
            AND sla.working_level = progress_row.year
            AND sla.lesson_id = trim(both '"' from completed_lesson_entry::TEXT)
        );
    END LOOP;

    FOR quiz_entry IN
      SELECT key AS week_key, value AS quiz_data
      FROM jsonb_each(COALESCE(progress_row.quiz_scores, '{}'::jsonb))
      WHERE key <> 'posttest'
    LOOP
      IF jsonb_typeof(COALESCE(quiz_entry.quiz_data->'attempts', '[]'::jsonb)) = 'array' THEN
        FOR quiz_attempt IN
          SELECT value AS attempt_data, ordinality
          FROM jsonb_array_elements(COALESCE(quiz_entry.quiz_data->'attempts', '[]'::jsonb)) WITH ORDINALITY
        LOOP
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
          )
          SELECT
            progress_row.student_id,
            progress_row.class_id,
            'number',
            progress_row.program_key,
            progress_row.school_year_level,
            progress_row.year,
            quiz_entry.week_key::INTEGER,
            'y' || COALESCE((regexp_match(progress_row.program_key, '^year([0-9]+)-number$'))[1], '0') || '-number-w' || quiz_entry.week_key || '-quiz',
            quiz_attempt.ordinality::INTEGER,
            COALESCE(NULLIF(quiz_attempt.attempt_data->>'correct_count', '')::INTEGER, NULLIF(quiz_attempt.attempt_data->>'correct', '')::INTEGER, NULLIF(quiz_attempt.attempt_data->>'score', '')::INTEGER, 0),
            COALESCE(NULLIF(quiz_attempt.attempt_data->>'total_questions', '')::INTEGER, NULLIF(quiz_attempt.attempt_data->>'total', '')::INTEGER, 0),
            COALESCE(NULLIF(quiz_attempt.attempt_data->>'accuracy_percent', '')::INTEGER, NULLIF(quiz_attempt.attempt_data->>'percent', '')::INTEGER, NULLIF(quiz_attempt.attempt_data->>'accuracy', '')::INTEGER, 0),
            COALESCE(NULLIF(quiz_attempt.attempt_data->>'passed', '')::BOOLEAN, COALESCE(NULLIF(quiz_attempt.attempt_data->>'percent', '')::INTEGER, 0) >= 80),
            COALESCE(NULLIF(quiz_attempt.attempt_data->>'completedAt', '')::TIMESTAMPTZ, progress_row.updated_at, now()),
            COALESCE(quiz_attempt.attempt_data->'lessonBreakdown', '{}'::jsonb),
            quiz_attempt.attempt_data,
            COALESCE(quiz_attempt.attempt_data->'insight', '{}'::jsonb)
          WHERE quiz_entry.week_key ~ '^[0-9]+$'
            AND NOT EXISTS (
              SELECT 1
              FROM public.student_weekly_quiz_attempts swqa
              WHERE swqa.student_id = progress_row.student_id
                AND swqa.realm_id = 'number'
                AND swqa.working_level = progress_row.year
                AND swqa.week = quiz_entry.week_key::INTEGER
                AND swqa.attempt_no = quiz_attempt.ordinality::INTEGER
            );
        END LOOP;
      END IF;
    END LOOP;

    posttest_entry := COALESCE(progress_row.quiz_scores->'posttest', '{}'::jsonb);
    IF jsonb_typeof(COALESCE(posttest_entry->'attempts', '[]'::jsonb)) = 'array' THEN
      FOR posttest_attempt IN
        SELECT value
        FROM jsonb_array_elements(COALESCE(posttest_entry->'attempts', '[]'::jsonb))
      LOOP
        inferred_posttest_percent := COALESCE(
          NULLIF(posttest_attempt->>'score_percent', '')::INTEGER,
          NULLIF(posttest_attempt->>'percent', '')::INTEGER,
          CASE
            WHEN COALESCE(NULLIF(posttest_attempt->>'total', '')::INTEGER, 0) > 0
              THEN ROUND(
                COALESCE(NULLIF(posttest_attempt->>'score', '')::INTEGER, NULLIF(posttest_attempt->>'correct', '')::INTEGER, 0)::NUMERIC
                * 100
                / COALESCE(NULLIF(posttest_attempt->>'total', '')::INTEGER, 1)
              )::INTEGER
            ELSE NULL
          END
        );

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
        )
        SELECT
          progress_row.student_id,
          progress_row.class_id,
          'number',
          progress_row.program_key,
          progress_row.school_year_level,
          progress_row.year,
          'posttest',
          COALESCE(NULLIF(posttest_attempt->>'correct_count', '')::INTEGER, NULLIF(posttest_attempt->>'correct', '')::INTEGER, NULLIF(posttest_attempt->>'score', '')::INTEGER),
          COALESCE(NULLIF(posttest_attempt->>'total_questions', '')::INTEGER, NULLIF(posttest_attempt->>'total', '')::INTEGER),
          COALESCE(inferred_posttest_percent, 0),
          NULLIF(posttest_attempt->>'passed', '')::BOOLEAN,
          COALESCE(posttest_attempt->'profile', '{}'::jsonb),
          COALESCE(posttest_attempt->'questionResults', '[]'::jsonb),
          COALESCE(NULLIF(posttest_attempt->>'completedAt', '')::TIMESTAMPTZ, progress_row.updated_at, now())
        WHERE inferred_posttest_percent IS NOT NULL
          AND NOT EXISTS (
            SELECT 1
            FROM public.student_realm_assessments sra
            WHERE sra.student_id = progress_row.student_id
              AND sra.realm_id = 'number'
              AND sra.working_level = progress_row.year
              AND sra.assessment_type = 'posttest'
              AND sra.score_percent = inferred_posttest_percent
              AND sra.completed_at = COALESCE(NULLIF(posttest_attempt->>'completedAt', '')::TIMESTAMPTZ, progress_row.updated_at, now())
          );

        UPDATE public.student_realm_progress
        SET posttest_score = COALESCE(inferred_posttest_percent, posttest_score),
            posttest_completed_at = COALESCE(NULLIF(posttest_attempt->>'completedAt', '')::TIMESTAMPTZ, progress_row.updated_at, posttest_completed_at),
            updated_at = now()
        WHERE student_id = progress_row.student_id
          AND realm_id = 'number'
          AND working_level = progress_row.year;
      END LOOP;
    END IF;
  END LOOP;
END;
$$;
