-- Teacher-configurable brain-break frequency.
-- Class-wide default + per-student override (null = inherit). Delivered to the
-- (anonymous) student app through the existing get_student_runtime_context RPC.

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS brain_break_frequency TEXT;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS brain_break_frequency TEXT;

-- Extend the runtime context RPC so the student app gets its own override AND
-- the class default in one call. Resolution (student → class → "normal") is done
-- client-side.
DROP FUNCTION IF EXISTS public.get_student_runtime_context(UUID);

CREATE OR REPLACE FUNCTION public.get_student_runtime_context(
  p_student_id UUID
)
RETURNS TABLE (
  class_id UUID,
  school_year_level TEXT,
  has_seen_intro BOOLEAN,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  brain_break_frequency TEXT,
  class_brain_break_frequency TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    s.class_id,
    s.school_year_level,
    s.has_seen_intro,
    s.display_name,
    s.first_name,
    s.last_name,
    s.brain_break_frequency,
    c.brain_break_frequency AS class_brain_break_frequency
  FROM public.students s
  LEFT JOIN public.classes c ON c.id = s.class_id
  WHERE s.id = p_student_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_runtime_context(UUID) TO anon, authenticated;
