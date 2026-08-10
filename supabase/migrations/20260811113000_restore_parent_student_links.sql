-- Repair production environments where the account-linking migration is
-- recorded but its canonical parent/student link table is absent.

create table if not exists public.parent_student_links (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  relationship text not null default 'guardian',
  status text not null default 'active',
  linked_at timestamptz not null default now(),
  unique (parent_user_id, student_id)
);

create index if not exists parent_student_links_parent_user_id_idx
  on public.parent_student_links (parent_user_id);

create index if not exists parent_student_links_student_id_idx
  on public.parent_student_links (student_id);

alter table public.parent_student_links enable row level security;

drop policy if exists "Parents can read own student links"
  on public.parent_student_links;
create policy "Parents can read own student links"
  on public.parent_student_links
  for select
  to authenticated
  using (parent_user_id = auth.uid());

drop policy if exists "Teachers can read parent links for class students"
  on public.parent_student_links;
create policy "Teachers can read parent links for class students"
  on public.parent_student_links
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.class_enrollments enrollment
      join public.classes class on class.id = enrollment.class_id
      where enrollment.student_id = parent_student_links.student_id
        and class.teacher_id = auth.uid()
    )
  );

grant select on public.parent_student_links to authenticated;
