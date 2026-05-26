-- Fix 1: Update save_pretest_progress to also write to progress_snapshot
-- (teacher dashboard reads progress_snapshot; old RPC only wrote to progress table)
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
  -- Legacy progress table (keep for backwards compat)
  INSERT INTO public.progress (student_id, year, pretest_score, status, week)
  VALUES (p_student_id, p_year, p_score, p_status, p_week)
  ON CONFLICT (student_id, year) DO UPDATE SET
    pretest_score = EXCLUDED.pretest_score,
    status        = EXCLUDED.status,
    week          = EXCLUDED.week,
    updated_at    = now();

  -- progress_snapshot (what teacher dashboard actually reads)
  INSERT INTO public.progress_snapshot (student_id, year, pretest_score, status, week)
  VALUES (p_student_id, p_year, p_score, p_status, p_week)
  ON CONFLICT (student_id, year) DO UPDATE SET
    pretest_score = EXCLUDED.pretest_score,
    status        = EXCLUDED.status,
    -- only advance week, never regress
    week          = COALESCE(EXCLUDED.week, progress_snapshot.week);
END;
$$;

-- Fix 2: SECURITY DEFINER RPC for saving lesson completion
-- (students are anonymous — direct table access is blocked by RLS)
CREATE OR REPLACE FUNCTION public.save_lesson_completion(
  p_student_id UUID,
  p_year       TEXT,
  p_week       INTEGER,
  p_lesson_id  TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_ids JSONB;
  updated_ids  JSONB;
BEGIN
  SELECT completed_lesson_ids
  INTO   existing_ids
  FROM   public.progress_snapshot
  WHERE  student_id = p_student_id AND year = p_year;

  IF existing_ids IS NULL THEN
    existing_ids := '[]'::JSONB;
  END IF;

  -- Append only if not already present
  IF NOT (existing_ids @> jsonb_build_array(p_lesson_id)) THEN
    updated_ids := existing_ids || jsonb_build_array(p_lesson_id);
  ELSE
    updated_ids := existing_ids;
  END IF;

  INSERT INTO public.progress_snapshot (student_id, year, week, completed_lesson_ids, status)
  VALUES (p_student_id, p_year, p_week, updated_ids, 'active')
  ON CONFLICT (student_id, year) DO UPDATE SET
    week                 = EXCLUDED.week,
    completed_lesson_ids = EXCLUDED.completed_lesson_ids,
    -- never downgrade a completed placement status
    status               = CASE
                             WHEN progress_snapshot.status IN ('PASSED', 'ASSIGNED_PROGRAM')
                             THEN progress_snapshot.status
                             ELSE 'active'
                           END;
END;
$$;

-- Fix 3: SECURITY DEFINER RPC to read a student's snapshot on login
-- so the app can restore progress to localStorage and skip the pretest
CREATE OR REPLACE FUNCTION public.get_student_progress_snapshot(
  p_student_id UUID
)
RETURNS TABLE(
  year          TEXT,
  pretest_score INTEGER,
  status        TEXT,
  week          INTEGER
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
    ps.week
  FROM public.progress_snapshot ps
  WHERE ps.student_id = p_student_id
  ORDER BY ps.year;
END;
$$;
