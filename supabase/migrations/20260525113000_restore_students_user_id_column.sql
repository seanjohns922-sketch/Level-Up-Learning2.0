alter table if exists public.students
add column if not exists user_id uuid references auth.users(id);

create index if not exists students_user_id_idx on public.students(user_id);
