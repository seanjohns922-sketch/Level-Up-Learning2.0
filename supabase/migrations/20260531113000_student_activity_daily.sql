CREATE TABLE IF NOT EXISTS public.student_activity_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  activity_date DATE NOT NULL,
  questions_answered INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  quizzes_completed INTEGER NOT NULL DEFAULT 0,
  seconds_active INTEGER NOT NULL DEFAULT 0,
  minutes_active INTEGER GENERATED ALWAYS AS (seconds_active / 60) STORED,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_student_activity_daily_student_date
  ON public.student_activity_daily(student_id, activity_date DESC);

CREATE INDEX IF NOT EXISTS idx_student_activity_daily_class_date
  ON public.student_activity_daily(class_id, activity_date DESC);

CREATE OR REPLACE FUNCTION public.touch_student_activity_daily_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_student_activity_daily_updated_at ON public.student_activity_daily;

CREATE TRIGGER trg_student_activity_daily_updated_at
BEFORE UPDATE ON public.student_activity_daily
FOR EACH ROW
EXECUTE FUNCTION public.touch_student_activity_daily_updated_at();

CREATE OR REPLACE FUNCTION public.upsert_student_activity_daily(
  p_student_id UUID,
  p_class_id UUID DEFAULT NULL,
  p_activity_date DATE DEFAULT (timezone('Australia/Melbourne', now()))::DATE,
  p_questions_answered INTEGER DEFAULT 0,
  p_correct_answers INTEGER DEFAULT 0,
  p_lessons_completed INTEGER DEFAULT 0,
  p_quizzes_completed INTEGER DEFAULT 0,
  p_seconds_active INTEGER DEFAULT 0,
  p_xp_earned INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.student_activity_daily (
    student_id,
    class_id,
    activity_date,
    questions_answered,
    correct_answers,
    lessons_completed,
    quizzes_completed,
    seconds_active,
    xp_earned
  ) VALUES (
    p_student_id,
    p_class_id,
    COALESCE(p_activity_date, (timezone('Australia/Melbourne', now()))::DATE),
    GREATEST(COALESCE(p_questions_answered, 0), 0),
    GREATEST(COALESCE(p_correct_answers, 0), 0),
    GREATEST(COALESCE(p_lessons_completed, 0), 0),
    GREATEST(COALESCE(p_quizzes_completed, 0), 0),
    GREATEST(COALESCE(p_seconds_active, 0), 0),
    GREATEST(COALESCE(p_xp_earned, 0), 0)
  )
  ON CONFLICT (student_id, activity_date) DO UPDATE SET
    class_id = COALESCE(EXCLUDED.class_id, public.student_activity_daily.class_id),
    questions_answered = public.student_activity_daily.questions_answered + EXCLUDED.questions_answered,
    correct_answers = public.student_activity_daily.correct_answers + EXCLUDED.correct_answers,
    lessons_completed = public.student_activity_daily.lessons_completed + EXCLUDED.lessons_completed,
    quizzes_completed = public.student_activity_daily.quizzes_completed + EXCLUDED.quizzes_completed,
    seconds_active = public.student_activity_daily.seconds_active + EXCLUDED.seconds_active,
    xp_earned = public.student_activity_daily.xp_earned + EXCLUDED.xp_earned,
    updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_student_activity_daily(UUID, UUID, DATE, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER)
  TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_student_activity_daily(
  p_student_id UUID
)
RETURNS TABLE(
  activity_date DATE,
  class_id UUID,
  questions_answered INTEGER,
  correct_answers INTEGER,
  lessons_completed INTEGER,
  quizzes_completed INTEGER,
  seconds_active INTEGER,
  minutes_active INTEGER,
  xp_earned INTEGER,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sad.activity_date,
    sad.class_id,
    sad.questions_answered,
    sad.correct_answers,
    sad.lessons_completed,
    sad.quizzes_completed,
    sad.seconds_active,
    sad.minutes_active,
    sad.xp_earned,
    sad.updated_at
  FROM public.student_activity_daily sad
  WHERE sad.student_id = p_student_id
  ORDER BY sad.activity_date DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_activity_daily(UUID) TO anon, authenticated;
