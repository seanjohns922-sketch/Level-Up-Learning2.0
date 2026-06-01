CREATE OR REPLACE FUNCTION public.get_student_runtime_context(
  p_student_id UUID
)
RETURNS TABLE (
  class_id UUID,
  school_year_level TEXT,
  has_seen_intro BOOLEAN,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT
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
    s.last_name
  FROM public.students s
  WHERE s.id = p_student_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_runtime_context(UUID) TO anon, authenticated;
