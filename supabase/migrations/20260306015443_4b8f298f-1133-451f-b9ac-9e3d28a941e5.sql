-- Remove teacher-profile dependency from class ownership checks
DROP POLICY IF EXISTS "Teachers can insert own classes" ON public.classes;
CREATE POLICY "Teachers can insert own classes"
ON public.classes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can update own classes" ON public.classes;
CREATE POLICY "Teachers can update own classes"
ON public.classes
FOR UPDATE
TO authenticated
USING (auth.uid() = teacher_id);

-- Keep teacher reads independent from teachers table
DROP POLICY IF EXISTS "Teachers can read class students" ON public.students;
CREATE POLICY "Teachers can read class students"
ON public.students
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.classes c
    WHERE c.id = students.class_id
      AND c.teacher_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Teachers can update class students" ON public.students;
CREATE POLICY "Teachers can update class students"
ON public.students
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.classes c
    WHERE c.id = students.class_id
      AND c.teacher_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Teachers can read student progress" ON public.progress;
CREATE POLICY "Teachers can read student progress"
ON public.progress
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    WHERE s.id = progress.student_id
      AND c.teacher_id = auth.uid()
  )
);

-- Optional hardening for class codes used by join flow
CREATE UNIQUE INDEX IF NOT EXISTS classes_class_code_unique
ON public.classes (class_code);