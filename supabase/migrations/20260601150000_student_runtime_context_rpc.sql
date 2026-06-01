CREATE OR REPLACE FUNCTION public.get_student_runtime_context(
  p_student_id UUID
)
RETURNS TABLE (
  class_id UUID,
  school_year_level TEXT,
  has_seen_intro BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    s.class_id,
    s.school_year_level,
    s.has_seen_intro
  FROM public.students s
  WHERE s.id = p_student_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_runtime_context(UUID) TO anon, authenticated;
