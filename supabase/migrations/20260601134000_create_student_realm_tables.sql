CREATE TABLE IF NOT EXISTS public.student_realm_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NULL REFERENCES public.classes(id) ON DELETE SET NULL,
  realm_id TEXT NOT NULL,
  program_key TEXT NOT NULL,
  school_year_level TEXT NULL,
  working_level TEXT NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'ASSIGNED_PROGRAM',
  current_week INTEGER NULL,
  assigned_week INTEGER NULL,
  placement_complete BOOLEAN NOT NULL DEFAULT FALSE,
  pretest_score INTEGER NULL,
  pretest_completed_at TIMESTAMPTZ NULL,
  posttest_score INTEGER NULL,
  posttest_completed_at TIMESTAMPTZ NULL,
  required_weeks JSONB NOT NULL DEFAULT '[]'::jsonb,
  optional_weeks JSONB NOT NULL DEFAULT '[]'::jsonb,
  unlocked_legends JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, realm_id, working_level)
);

CREATE TABLE IF NOT EXISTS public.student_lesson_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NULL REFERENCES public.classes(id) ON DELETE SET NULL,
  realm_id TEXT NOT NULL,
  program_key TEXT NOT NULL,
  school_year_level TEXT NULL,
  working_level TEXT NOT NULL,
  week INTEGER NOT NULL,
  lesson INTEGER NOT NULL,
  lesson_id TEXT NOT NULL,
  topic_focus TEXT NULL,
  attempt_no INTEGER NOT NULL DEFAULT 1,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  accuracy_percent INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NULL,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  insight JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_weekly_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NULL REFERENCES public.classes(id) ON DELETE SET NULL,
  realm_id TEXT NOT NULL,
  program_key TEXT NOT NULL,
  school_year_level TEXT NULL,
  working_level TEXT NOT NULL,
  week INTEGER NOT NULL,
  quiz_id TEXT NOT NULL,
  attempt_no INTEGER NOT NULL DEFAULT 1,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  accuracy_percent INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lesson_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  insight JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_realm_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NULL REFERENCES public.classes(id) ON DELETE SET NULL,
  realm_id TEXT NOT NULL,
  program_key TEXT NOT NULL,
  school_year_level TEXT NULL,
  working_level TEXT NOT NULL,
  assessment_type TEXT NOT NULL,
  correct_count INTEGER NULL,
  total_questions INTEGER NULL,
  score_percent INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN NULL,
  placement_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  question_results JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_realm_progress_student_realm_current
  ON public.student_realm_progress(student_id, realm_id)
  WHERE is_current = TRUE;

CREATE INDEX IF NOT EXISTS idx_student_realm_progress_class_realm
  ON public.student_realm_progress(class_id, realm_id);

CREATE INDEX IF NOT EXISTS idx_student_realm_progress_student_realm_updated
  ON public.student_realm_progress(student_id, realm_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_lesson_attempts_student_scope
  ON public.student_lesson_attempts(student_id, realm_id, working_level, week, lesson, attempt_no);

CREATE INDEX IF NOT EXISTS idx_student_lesson_attempts_class_scope
  ON public.student_lesson_attempts(class_id, realm_id, working_level);

CREATE INDEX IF NOT EXISTS idx_student_lesson_attempts_lesson_id
  ON public.student_lesson_attempts(lesson_id);

CREATE INDEX IF NOT EXISTS idx_student_weekly_quiz_attempts_student_scope
  ON public.student_weekly_quiz_attempts(student_id, realm_id, working_level, week, attempt_no);

CREATE INDEX IF NOT EXISTS idx_student_weekly_quiz_attempts_class_scope
  ON public.student_weekly_quiz_attempts(class_id, realm_id, working_level);

CREATE INDEX IF NOT EXISTS idx_student_weekly_quiz_attempts_quiz_id
  ON public.student_weekly_quiz_attempts(quiz_id);

CREATE INDEX IF NOT EXISTS idx_student_realm_assessments_student_scope
  ON public.student_realm_assessments(student_id, realm_id, working_level, assessment_type, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_realm_assessments_class_scope
  ON public.student_realm_assessments(class_id, realm_id, working_level);

CREATE OR REPLACE FUNCTION public.touch_student_realm_progress_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_student_realm_progress_updated_at ON public.student_realm_progress;

CREATE TRIGGER trg_student_realm_progress_updated_at
BEFORE UPDATE ON public.student_realm_progress
FOR EACH ROW
EXECUTE FUNCTION public.touch_student_realm_progress_updated_at();

ALTER TABLE public.student_realm_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_lesson_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_weekly_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_realm_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can read student_realm_progress" ON public.student_realm_progress;
CREATE POLICY "Teachers can read student_realm_progress"
ON public.student_realm_progress FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    WHERE s.id = student_realm_progress.student_id
      AND public.teacher_belongs_to_auth(c.teacher_id)
  )
);

DROP POLICY IF EXISTS "Teachers can read student_lesson_attempts" ON public.student_lesson_attempts;
CREATE POLICY "Teachers can read student_lesson_attempts"
ON public.student_lesson_attempts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    WHERE s.id = student_lesson_attempts.student_id
      AND public.teacher_belongs_to_auth(c.teacher_id)
  )
);

DROP POLICY IF EXISTS "Teachers can read student_weekly_quiz_attempts" ON public.student_weekly_quiz_attempts;
CREATE POLICY "Teachers can read student_weekly_quiz_attempts"
ON public.student_weekly_quiz_attempts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    WHERE s.id = student_weekly_quiz_attempts.student_id
      AND public.teacher_belongs_to_auth(c.teacher_id)
  )
);

DROP POLICY IF EXISTS "Teachers can read student_realm_assessments" ON public.student_realm_assessments;
CREATE POLICY "Teachers can read student_realm_assessments"
ON public.student_realm_assessments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    WHERE s.id = student_realm_assessments.student_id
      AND public.teacher_belongs_to_auth(c.teacher_id)
  )
);
