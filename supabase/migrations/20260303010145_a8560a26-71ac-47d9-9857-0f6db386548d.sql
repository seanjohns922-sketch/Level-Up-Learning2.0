
-- Drop all existing RESTRICTIVE policies and recreate as PERMISSIVE

-- classes
DROP POLICY IF EXISTS "Anyone can lookup class by code" ON public.classes;
DROP POLICY IF EXISTS "Teachers can insert own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can update own classes" ON public.classes;

CREATE POLICY "Anyone can lookup class by code" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Teachers can insert own classes" ON public.classes FOR INSERT WITH CHECK (teacher_id = public.get_teacher_id());
CREATE POLICY "Teachers can update own classes" ON public.classes FOR UPDATE USING (teacher_id = public.get_teacher_id());

-- students
DROP POLICY IF EXISTS "Students can insert own data" ON public.students;
DROP POLICY IF EXISTS "Students can read own data" ON public.students;
DROP POLICY IF EXISTS "Teachers can read class students" ON public.students;

CREATE POLICY "Students can insert own data" ON public.students FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students can read own data" ON public.students FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Teachers can read class students" ON public.students FOR SELECT USING (
  EXISTS (SELECT 1 FROM classes c WHERE c.id = students.class_id AND c.teacher_id = public.get_teacher_id())
);

-- progress
DROP POLICY IF EXISTS "Students can insert own progress" ON public.progress;
DROP POLICY IF EXISTS "Students can read own progress" ON public.progress;
DROP POLICY IF EXISTS "Students can update own progress" ON public.progress;
DROP POLICY IF EXISTS "Teachers can read student progress" ON public.progress;

CREATE POLICY "Students can insert own progress" ON public.progress FOR INSERT WITH CHECK (student_id = public.get_student_id());
CREATE POLICY "Students can read own progress" ON public.progress FOR SELECT USING (student_id = public.get_student_id());
CREATE POLICY "Students can update own progress" ON public.progress FOR UPDATE USING (student_id = public.get_student_id());
CREATE POLICY "Teachers can read student progress" ON public.progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM students s JOIN classes c ON c.id = s.class_id WHERE s.id = progress.student_id AND c.teacher_id = public.get_teacher_id())
);

-- teachers
DROP POLICY IF EXISTS "Teachers can insert own data" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can read own data" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can update own data" ON public.teachers;

CREATE POLICY "Teachers can insert own data" ON public.teachers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Teachers can read own data" ON public.teachers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Teachers can update own data" ON public.teachers FOR UPDATE USING (auth.uid() = user_id);

-- user_roles
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;

CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
