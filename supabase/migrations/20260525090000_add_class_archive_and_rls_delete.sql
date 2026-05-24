-- Add soft-delete support to classes
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Allow teachers to delete their own classes
DROP POLICY IF EXISTS "Teachers can delete own classes" ON public.classes;
CREATE POLICY "Teachers can delete own classes"
ON public.classes
FOR DELETE
TO authenticated
USING (public.teacher_belongs_to_auth(teacher_id));

-- Allow teachers to update (archive) their own classes
DROP POLICY IF EXISTS "Teachers can update own classes" ON public.classes;
CREATE POLICY "Teachers can update own classes"
ON public.classes
FOR UPDATE
TO authenticated
USING (public.teacher_belongs_to_auth(teacher_id))
WITH CHECK (public.teacher_belongs_to_auth(teacher_id));
