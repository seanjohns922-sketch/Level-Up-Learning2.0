CREATE OR REPLACE FUNCTION public.generate_class_code()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE code TEXT; exists_check BOOLEAN;
BEGIN
  LOOP
    code := upper(substr(md5(random()::text), 1, 5));
    SELECT EXISTS(SELECT 1 FROM public.classes WHERE class_code = code) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN code;
END; $function$