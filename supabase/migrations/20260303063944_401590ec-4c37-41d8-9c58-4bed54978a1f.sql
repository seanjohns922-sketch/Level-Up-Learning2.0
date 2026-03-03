
-- Enhanced verify_student_pin that returns enough data to construct synthetic email
DROP FUNCTION IF EXISTS public.verify_student_pin(TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.verify_student_pin(token TEXT, pin_input TEXT)
RETURNS TABLE(user_id UUID, display_name TEXT, class_code TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.user_id, s.display_name, c.class_code
  FROM public.students s
  JOIN public.classes c ON c.id = s.class_id
  WHERE s.qr_token = token AND s.pin = pin_input
  LIMIT 1;
$$;
