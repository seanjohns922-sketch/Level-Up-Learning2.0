-- Allow teachers to delete students from their own classes
CREATE POLICY "Teachers can delete class students"
ON public.students
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.classes c
    WHERE c.id = students.class_id
      AND public.teacher_belongs_to_auth(c.teacher_id)
  )
);
