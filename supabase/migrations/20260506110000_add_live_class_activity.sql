create table if not exists public.live_class_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  teacher_id uuid references auth.users(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  status text not null default 'active' check (status in ('active', 'ended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.live_student_activity (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.live_class_sessions(id) on delete set null,
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  current_level text,
  current_strand text,
  current_week integer,
  current_lesson text,
  current_lesson_title text,
  current_activity_id text,
  current_activity_label text,
  current_question_id text,
  current_question_text text,
  current_question_type text,
  current_question_options jsonb not null default '[]'::jsonb,
  current_step_label text,
  progress_percent integer,
  progress_label text,
  latest_event_type text,
  latest_answer_correct boolean,
  latest_selected_answer text,
  latest_correct_answer text,
  last_event_text text,
  time_on_current_question integer not null default 0,
  current_question_attempts integer not null default 0,
  session_incorrect_count integer not null default 0,
  consecutive_incorrect_count integer not null default 0,
  session_hint_count integer not null default 0,
  attempt_number integer,
  skill_tag text,
  misconception_tag text,
  ai_status text,
  ai_issue text,
  ai_likely_gap text,
  ai_suggested_action text,
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(class_id, student_id)
);

create table if not exists public.live_activity_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.live_class_sessions(id) on delete set null,
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists live_class_sessions_class_status_idx
  on public.live_class_sessions (class_id, status, started_at desc);

create index if not exists live_student_activity_class_status_idx
  on public.live_student_activity (class_id, ai_status, last_active_at desc);

create index if not exists live_student_activity_student_idx
  on public.live_student_activity (student_id, updated_at desc);

create index if not exists live_activity_events_class_created_idx
  on public.live_activity_events (class_id, created_at desc);

create index if not exists live_activity_events_student_created_idx
  on public.live_activity_events (student_id, created_at desc);

alter table public.live_class_sessions enable row level security;
alter table public.live_student_activity enable row level security;
alter table public.live_activity_events enable row level security;

drop policy if exists "Teachers can read live class sessions" on public.live_class_sessions;
create policy "Teachers can read live class sessions"
on public.live_class_sessions
for select
using (
  exists (
    select 1
    from public.classes c
    where c.id = live_class_sessions.class_id
      and c.teacher_id = public.get_teacher_id()
  )
);

drop policy if exists "Teachers can manage own live class sessions" on public.live_class_sessions;
create policy "Teachers can manage own live class sessions"
on public.live_class_sessions
for all
using (
  exists (
    select 1
    from public.classes c
    where c.id = live_class_sessions.class_id
      and c.teacher_id = public.get_teacher_id()
  )
)
with check (
  exists (
    select 1
    from public.classes c
    where c.id = live_class_sessions.class_id
      and c.teacher_id = public.get_teacher_id()
  )
);

drop policy if exists "Teachers can read live student activity" on public.live_student_activity;
create policy "Teachers can read live student activity"
on public.live_student_activity
for select
using (
  exists (
    select 1
    from public.classes c
    where c.id = live_student_activity.class_id
      and c.teacher_id = public.get_teacher_id()
  )
);

drop policy if exists "Students can read live student activity" on public.live_student_activity;
create policy "Students can read live student activity"
on public.live_student_activity
for select
using (
  exists (
    select 1
    from public.students s
    where s.id = live_student_activity.student_id
      and s.class_id = live_student_activity.class_id
  )
);

drop policy if exists "Students can write live student activity" on public.live_student_activity;
create policy "Students can insert live student activity"
on public.live_student_activity
for insert
with check (
  exists (
    select 1
    from public.students s
    where s.id = live_student_activity.student_id
      and s.class_id = live_student_activity.class_id
  )
);

drop policy if exists "Students can update live student activity" on public.live_student_activity;
create policy "Students can update live student activity"
on public.live_student_activity
for update
using (
  exists (
    select 1
    from public.students s
    where s.id = live_student_activity.student_id
      and s.class_id = live_student_activity.class_id
  )
)
with check (
  exists (
    select 1
    from public.students s
    where s.id = live_student_activity.student_id
      and s.class_id = live_student_activity.class_id
  )
);

drop policy if exists "Teachers can read live activity events" on public.live_activity_events;
create policy "Teachers can read live activity events"
on public.live_activity_events
for select
using (
  exists (
    select 1
    from public.classes c
    where c.id = live_activity_events.class_id
      and c.teacher_id = public.get_teacher_id()
  )
);

drop policy if exists "Students can insert live activity events" on public.live_activity_events;
create policy "Students can insert live activity events"
on public.live_activity_events
for insert
with check (
  exists (
    select 1
    from public.students s
    where s.id = live_activity_events.student_id
      and s.class_id = live_activity_events.class_id
  )
);
