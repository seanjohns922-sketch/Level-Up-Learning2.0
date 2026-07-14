-- Teacher placement & reset RPCs — multi-realm teacher dashboard.
--
-- Keeps THREE concepts permanently separate:
--   1. Teacher Placement  → student_realm_placement (teacher intent only)
--   2. Student Progress    → student_realm_progress  (learning engine only)
--   3. Teacher Resets      → explicit, audited RPCs below
--
-- Every teacher RPC is teacher-only (authenticated), verifies the teacher owns
-- the student's class, requires a realm, and writes a teacher_realm_actions
-- audit row. Placement NEVER touches learning state (lessons/quizzes/assessments/
-- legends/XP/streaks) — only the explicit teacher_reset_realm action may.
--
-- NOTE: students authenticate anonymously (class code + PIN, no auth.uid()), so
-- save_student_realm_progress is intentionally left as-is here; closing that
-- anonymous-write path needs a separate student-session-token effort.

-- 1. Teacher intent record (separate from live progress) --------------------
CREATE TABLE IF NOT EXISTS public.student_realm_placement (
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  realm_id TEXT NOT NULL,
  assigned_start_level TEXT NOT NULL,
  assigned_entry_mode TEXT NOT NULL DEFAULT 'pretest',
  placement_source TEXT NOT NULL DEFAULT 'teacher',
  placement_assigned_by UUID NULL,
  placement_assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, realm_id)
);

ALTER TABLE public.student_realm_placement ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can read student_realm_placement" ON public.student_realm_placement;
CREATE POLICY "Teachers can read student_realm_placement"
ON public.student_realm_placement
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    WHERE s.id = student_realm_placement.student_id
      AND public.teacher_belongs_to_auth(c.teacher_id)
  )
);

-- 2. Audit trail ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teacher_realm_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NULL,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  realm_id TEXT NOT NULL,
  action TEXT NOT NULL,
  old_value TEXT NULL,
  new_value TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teacher_realm_actions_student
  ON public.teacher_realm_actions(student_id, realm_id, created_at DESC);

ALTER TABLE public.teacher_realm_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can read teacher_realm_actions" ON public.teacher_realm_actions;
CREATE POLICY "Teachers can read teacher_realm_actions"
ON public.teacher_realm_actions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    WHERE s.id = teacher_realm_actions.student_id
      AND public.teacher_belongs_to_auth(c.teacher_id)
  )
);

-- 3. Ownership guard (teacher owns the student's class) ---------------------
CREATE OR REPLACE FUNCTION public.teacher_owns_student(p_student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    WHERE s.id = p_student_id
      AND public.teacher_belongs_to_auth(c.teacher_id)
  );
$$;

-- program_key mirrors the client (lib/student-progress-sync.ts realmProgramKey):
--   "<level-no-spaces-lower>-<measurelands|number>"
CREATE OR REPLACE FUNCTION public.realm_program_key(p_level TEXT, p_realm_id TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(replace(coalesce(p_level, ''), ' ', ''))
    || '-'
    || CASE WHEN p_realm_id = 'measurement' THEN 'measurelands' ELSE 'number' END;
$$;

-- 4. Change starting level (placement intent) -------------------------------
CREATE OR REPLACE FUNCTION public.teacher_change_starting_level(
  p_student_id UUID,
  p_realm_id TEXT,
  p_assigned_level TEXT,
  p_entry_mode TEXT DEFAULT 'pretest'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_teacher UUID := auth.uid();
  v_entry TEXT := COALESCE(NULLIF(p_entry_mode, ''), 'pretest');
  v_old TEXT;
  v_has_progress BOOLEAN;
BEGIN
  IF p_realm_id IS NULL OR length(trim(p_realm_id)) = 0 THEN
    RAISE EXCEPTION 'realm_id is required';
  END IF;
  IF NOT public.teacher_owns_student(p_student_id) THEN
    RAISE EXCEPTION 'not authorized for this student';
  END IF;

  SELECT assigned_start_level INTO v_old
  FROM public.student_realm_placement
  WHERE student_id = p_student_id AND realm_id = p_realm_id;

  -- Write teacher intent ONLY (never touches live progress).
  INSERT INTO public.student_realm_placement (
    student_id, realm_id, assigned_start_level, assigned_entry_mode,
    placement_source, placement_assigned_by, placement_assigned_at, updated_at
  ) VALUES (
    p_student_id, p_realm_id, p_assigned_level, v_entry,
    'teacher', v_teacher, now(), now()
  )
  ON CONFLICT (student_id, realm_id) DO UPDATE SET
    assigned_start_level = EXCLUDED.assigned_start_level,
    assigned_entry_mode = EXCLUDED.assigned_entry_mode,
    placement_source = 'teacher',
    placement_assigned_by = EXCLUDED.placement_assigned_by,
    placement_assigned_at = now(),
    updated_at = now();

  SELECT EXISTS (
    SELECT 1 FROM public.student_realm_progress
    WHERE student_id = p_student_id AND realm_id = p_realm_id
  ) INTO v_has_progress;

  -- Seed the entry row ONLY when the student has no progress yet. If progress
  -- already exists we record intent only; the UI offers an explicit
  -- "reset & apply" (teacher_reset_realm) rather than silently overwriting.
  IF NOT v_has_progress THEN
    INSERT INTO public.student_realm_progress (
      student_id, realm_id, program_key, working_level, is_current, status,
      current_week, assigned_week, placement_complete
    ) VALUES (
      p_student_id,
      p_realm_id,
      public.realm_program_key(p_assigned_level, p_realm_id),
      p_assigned_level,
      TRUE,
      'ASSIGNED_PROGRAM',
      CASE WHEN v_entry = 'pretest' THEN NULL ELSE 1 END,
      CASE WHEN v_entry = 'pretest' THEN NULL ELSE 1 END,
      CASE WHEN v_entry = 'pretest' THEN FALSE ELSE TRUE END
    )
    ON CONFLICT (student_id, realm_id, working_level) DO NOTHING;
  END IF;

  INSERT INTO public.teacher_realm_actions (teacher_id, student_id, realm_id, action, old_value, new_value)
  VALUES (v_teacher, p_student_id, p_realm_id, 'placement_changed', v_old, p_assigned_level);
END;
$$;

GRANT EXECUTE ON FUNCTION public.teacher_change_starting_level(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- 5. Reset pre-test — clears pre-test + generated pathway; keeps lesson history
CREATE OR REPLACE FUNCTION public.teacher_reset_pretest(
  p_student_id UUID,
  p_realm_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_teacher UUID := auth.uid();
BEGIN
  IF p_realm_id IS NULL OR length(trim(p_realm_id)) = 0 THEN
    RAISE EXCEPTION 'realm_id is required';
  END IF;
  IF NOT public.teacher_owns_student(p_student_id) THEN
    RAISE EXCEPTION 'not authorized for this student';
  END IF;

  UPDATE public.student_realm_progress
  SET pretest_score = NULL,
      pretest_completed_at = NULL,
      required_weeks = '[]'::jsonb,
      optional_weeks = '[]'::jsonb,
      placement_complete = FALSE,
      status = 'ASSIGNED_PROGRAM',
      updated_at = now()
  WHERE student_id = p_student_id
    AND realm_id = p_realm_id
    AND is_current = TRUE;

  DELETE FROM public.student_realm_assessments
  WHERE student_id = p_student_id
    AND realm_id = p_realm_id
    AND assessment_type = 'pretest';

  INSERT INTO public.teacher_realm_actions (teacher_id, student_id, realm_id, action)
  VALUES (v_teacher, p_student_id, p_realm_id, 'pretest_reset');
END;
$$;

GRANT EXECUTE ON FUNCTION public.teacher_reset_pretest(UUID, TEXT) TO authenticated;

-- 6. Reset current week — moves the navigation pointer only ------------------
CREATE OR REPLACE FUNCTION public.teacher_reset_week(
  p_student_id UUID,
  p_realm_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_teacher UUID := auth.uid();
  v_old TEXT;
BEGIN
  IF p_realm_id IS NULL OR length(trim(p_realm_id)) = 0 THEN
    RAISE EXCEPTION 'realm_id is required';
  END IF;
  IF NOT public.teacher_owns_student(p_student_id) THEN
    RAISE EXCEPTION 'not authorized for this student';
  END IF;

  SELECT current_week::TEXT INTO v_old
  FROM public.student_realm_progress
  WHERE student_id = p_student_id AND realm_id = p_realm_id AND is_current = TRUE
  LIMIT 1;

  -- Pointer only; lesson/quiz/assessment records are preserved.
  UPDATE public.student_realm_progress
  SET current_week = 1,
      assigned_week = 1,
      updated_at = now()
  WHERE student_id = p_student_id
    AND realm_id = p_realm_id
    AND is_current = TRUE;

  INSERT INTO public.teacher_realm_actions (teacher_id, student_id, realm_id, action, old_value, new_value)
  VALUES (v_teacher, p_student_id, p_realm_id, 'week_reset', v_old, '1');
END;
$$;

GRANT EXECUTE ON FUNCTION public.teacher_reset_week(UUID, TEXT) TO authenticated;

-- 7. Reset this realm — destructive; other realms untouched -----------------
CREATE OR REPLACE FUNCTION public.teacher_reset_realm(
  p_student_id UUID,
  p_realm_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_teacher UUID := auth.uid();
BEGIN
  IF p_realm_id IS NULL OR length(trim(p_realm_id)) = 0 THEN
    RAISE EXCEPTION 'realm_id is required';
  END IF;
  IF NOT public.teacher_owns_student(p_student_id) THEN
    RAISE EXCEPTION 'not authorized for this student';
  END IF;

  DELETE FROM public.student_lesson_attempts
    WHERE student_id = p_student_id AND realm_id = p_realm_id;
  DELETE FROM public.student_weekly_quiz_attempts
    WHERE student_id = p_student_id AND realm_id = p_realm_id;
  DELETE FROM public.student_realm_assessments
    WHERE student_id = p_student_id AND realm_id = p_realm_id;
  DELETE FROM public.student_realm_progress
    WHERE student_id = p_student_id AND realm_id = p_realm_id;

  INSERT INTO public.teacher_realm_actions (teacher_id, student_id, realm_id, action)
  VALUES (v_teacher, p_student_id, p_realm_id, 'realm_reset');
END;
$$;

GRANT EXECUTE ON FUNCTION public.teacher_reset_realm(UUID, TEXT) TO authenticated;
