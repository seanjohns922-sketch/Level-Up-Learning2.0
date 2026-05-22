-- Fix infinite recursion between classes and students RLS policies.
--
-- The cycle:
--   SELECT classes → "Students can read own class" → SELECT students
--   SELECT students → "Teachers can read class students" → SELECT classes
--   → infinite loop
--
-- Fix 1: Drop "Students can read own class" on classes — it's redundant
--   because "Anyone can lookup class by code" (using true) already covers it.
--
-- Fix 2: Replace "Teachers can read class students" on students with a version
--   that uses a SECURITY DEFINER helper to read classes without triggering RLS,
--   breaking the cycle.

-- Step 1: remove the redundant policy that starts the cycle
drop policy if exists "Students can read own class" on public.classes;

-- Step 2: SECURITY DEFINER helper — reads classes bypassing RLS
create or replace function public.get_class_teacher_id(p_class_id uuid)
returns uuid
language sql
stable
security definer
as $$
  select teacher_id from public.classes where id = p_class_id;
$$;

-- Step 3: rewrite the students policy to use the helper (no recursion)
drop policy if exists "Teachers can read class students" on public.students;

create policy "Teachers can read class students"
on public.students
for select
to authenticated
using (
  public.teacher_belongs_to_auth(public.get_class_teacher_id(students.class_id))
);
