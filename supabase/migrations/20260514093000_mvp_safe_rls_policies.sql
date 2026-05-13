begin;

alter table public.classes enable row level security;
alter table public.events enable row level security;
alter table public.progress_snapshot enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;

drop policy if exists "Anyone can lookup class by code" on public.classes;

drop policy if exists "Teachers can read own classes" on public.classes;
drop policy if exists "Teachers can insert own classes" on public.classes;
drop policy if exists "Teachers can update own classes" on public.classes;
drop policy if exists "Students can read own class" on public.classes;

drop policy if exists "Students can insert own data" on public.students;
drop policy if exists "Students can read own data" on public.students;
drop policy if exists "Students can update own data" on public.students;
drop policy if exists "Teachers can read class students" on public.students;
drop policy if exists "Teachers can update class students" on public.students;

drop policy if exists "Teachers can insert own data" on public.teachers;
drop policy if exists "Teachers can read own data" on public.teachers;
drop policy if exists "Teachers can update own data" on public.teachers;

drop policy if exists "Students can insert own progress_snapshot" on public.progress_snapshot;
drop policy if exists "Students can read own progress_snapshot" on public.progress_snapshot;
drop policy if exists "Students can update own progress_snapshot" on public.progress_snapshot;
drop policy if exists "Teachers can read student progress_snapshot" on public.progress_snapshot;

drop policy if exists "Teachers can read class events" on public.events;
drop policy if exists "Students can insert own events" on public.events;
drop policy if exists "Students can read own events" on public.events;

create or replace function public.teacher_belongs_to_auth(teacher_row_id uuid)
returns boolean
language sql
stable
as $$
  select
    teacher_row_id = auth.uid()
    or exists (
      select 1
      from public.teachers t
      where t.id = teacher_row_id
        and coalesce(
          nullif(to_jsonb(t)->>'user_id', '')::uuid,
          t.id
        ) = auth.uid()
    );
$$;

create or replace function public.student_belongs_to_auth(student_row public.students)
returns boolean
language sql
stable
as $$
  select coalesce(
    nullif(to_jsonb(student_row)->>'user_id', '')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  ) = auth.uid();
$$;

create policy "Teachers can read own classes"
on public.classes
for select
to authenticated
using (
  public.teacher_belongs_to_auth(teacher_id)
);

create policy "Teachers can insert own classes"
on public.classes
for insert
to authenticated
with check (
  public.teacher_belongs_to_auth(teacher_id)
);

create policy "Teachers can update own classes"
on public.classes
for update
to authenticated
using (
  public.teacher_belongs_to_auth(teacher_id)
)
with check (
  public.teacher_belongs_to_auth(teacher_id)
);

create policy "Students can read own class"
on public.classes
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.class_id = classes.id
      and public.student_belongs_to_auth(s)
  )
);

create policy "Students can insert own data"
on public.students
for insert
to authenticated
with check (
  public.student_belongs_to_auth(students)
);

create policy "Students can read own data"
on public.students
for select
to authenticated
using (
  public.student_belongs_to_auth(students)
);

create policy "Students can update own data"
on public.students
for update
to authenticated
using (
  public.student_belongs_to_auth(students)
)
with check (
  public.student_belongs_to_auth(students)
);

create policy "Teachers can read class students"
on public.students
for select
to authenticated
using (
  exists (
    select 1
    from public.classes c
    where c.id = students.class_id
      and public.teacher_belongs_to_auth(c.teacher_id)
  )
);

create policy "Teachers can update class students"
on public.students
for update
to authenticated
using (
  exists (
    select 1
    from public.classes c
    where c.id = students.class_id
      and public.teacher_belongs_to_auth(c.teacher_id)
  )
)
with check (
  exists (
    select 1
    from public.classes c
    where c.id = students.class_id
      and public.teacher_belongs_to_auth(c.teacher_id)
  )
);

create policy "Teachers can insert own data"
on public.teachers
for insert
to authenticated
with check (
  coalesce(
    nullif(to_jsonb(teachers)->>'user_id', '')::uuid,
    id
  ) = auth.uid()
);

create policy "Teachers can read own data"
on public.teachers
for select
to authenticated
using (
  coalesce(
    nullif(to_jsonb(teachers)->>'user_id', '')::uuid,
    id
  ) = auth.uid()
);

create policy "Teachers can update own data"
on public.teachers
for update
to authenticated
using (
  coalesce(
    nullif(to_jsonb(teachers)->>'user_id', '')::uuid,
    id
  ) = auth.uid()
)
with check (
  coalesce(
    nullif(to_jsonb(teachers)->>'user_id', '')::uuid,
    id
  ) = auth.uid()
);

create policy "Students can insert own progress_snapshot"
on public.progress_snapshot
for insert
to authenticated
with check (
  exists (
    select 1
    from public.students s
    where s.id = progress_snapshot.student_id
      and public.student_belongs_to_auth(s)
  )
);

create policy "Students can read own progress_snapshot"
on public.progress_snapshot
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = progress_snapshot.student_id
      and public.student_belongs_to_auth(s)
  )
);

create policy "Students can update own progress_snapshot"
on public.progress_snapshot
for update
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = progress_snapshot.student_id
      and public.student_belongs_to_auth(s)
  )
)
with check (
  exists (
    select 1
    from public.students s
    where s.id = progress_snapshot.student_id
      and public.student_belongs_to_auth(s)
  )
);

create policy "Teachers can read student progress_snapshot"
on public.progress_snapshot
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    join public.classes c on c.id = s.class_id
    where s.id = progress_snapshot.student_id
      and public.teacher_belongs_to_auth(c.teacher_id)
  )
);

create policy "Teachers can read class events"
on public.events
for select
to authenticated
using (
  exists (
    select 1
    from public.classes c
    where c.id = events.class_id
      and public.teacher_belongs_to_auth(c.teacher_id)
  )
);

create policy "Students can read own events"
on public.events
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = events.student_id
      and public.student_belongs_to_auth(s)
  )
);

create policy "Students can insert own events"
on public.events
for insert
to authenticated
with check (
  exists (
    select 1
    from public.students s
    where s.id = events.student_id
      and s.class_id = events.class_id
      and public.student_belongs_to_auth(s)
  )
);

commit;
