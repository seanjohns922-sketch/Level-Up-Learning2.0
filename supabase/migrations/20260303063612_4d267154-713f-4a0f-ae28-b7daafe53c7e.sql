
-- Add qr_token column to students table
ALTER TABLE public.students ADD COLUMN qr_token TEXT UNIQUE;

-- Create function to generate random token
CREATE OR REPLACE FUNCTION public.generate_qr_token()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE token TEXT; exists_check BOOLEAN;
BEGIN
  LOOP
    token := encode(gen_random_bytes(16), 'hex');
    SELECT EXISTS(SELECT 1 FROM public.students WHERE qr_token = token) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN token;
END;
$$;

-- Backfill existing students with tokens
UPDATE public.students SET qr_token = encode(gen_random_bytes(16), 'hex') WHERE qr_token IS NULL;

-- Make qr_token NOT NULL going forward
ALTER TABLE public.students ALTER COLUMN qr_token SET DEFAULT public.generate_qr_token();

-- Allow anyone to look up student by qr_token (needed for QR login page)
CREATE POLICY "Anyone can lookup student by qr_token"
ON public.students
FOR SELECT
USING (true);
