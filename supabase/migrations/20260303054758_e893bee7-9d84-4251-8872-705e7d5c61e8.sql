-- Allow teachers to update students in their classes (needed for PIN reset)
CREATE POLICY "Teachers can update class students"
ON public.students
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM classes c
    WHERE c.id = students.class_id AND c.teacher_id = get_teacher_id()
  )
);
