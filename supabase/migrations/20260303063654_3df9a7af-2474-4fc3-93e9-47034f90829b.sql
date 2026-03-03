
-- Drop the overly permissive policy we just added
DROP POLICY IF EXISTS "Anyone can lookup student by qr_token" ON public.students;

-- Create a secure RPC for QR token lookup (no auth required, returns limited data)
CREATE OR REPLACE FUNCTION public.lookup_student_by_qr(token TEXT)
RETURNS TABLE(student_id UUID, display_name TEXT, class_name TEXT, user_id UUID)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.display_name, c.name as class_name, s.user_id
  FROM public.students s
  JOIN public.classes c ON c.id = s.class_id
  WHERE s.qr_token = token
  LIMIT 1;
$$;

-- Create RPC to verify student PIN (returns user_id if match, null otherwise)
CREATE OR REPLACE FUNCTION public.verify_student_pin(token TEXT, pin_input TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.user_id
  FROM public.students s
  WHERE s.qr_token = token AND s.pin = pin_input
  LIMIT 1;
$$;

-- Create RPC to regenerate a student's QR token (teacher only)
CREATE OR REPLACE FUNCTION public.regenerate_student_qr(student_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_token TEXT; tid UUID;
BEGIN
  SELECT public.get_teacher_id() INTO tid;
  IF tid IS NULL THEN RAISE EXCEPTION 'Not a teacher'; END IF;
  
  -- Verify teacher owns this student's class
  IF NOT EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    WHERE s.id = student_uuid AND c.teacher_id = tid
  ) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  
  new_token := encode(gen_random_bytes(16), 'hex');
  UPDATE public.students SET qr_token = new_token WHERE id = student_uuid;
  RETURN new_token;
END;
$$;
