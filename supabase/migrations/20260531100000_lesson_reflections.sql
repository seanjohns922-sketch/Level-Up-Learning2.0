-- Lesson reflection responses submitted by students after each lesson
create table if not exists public.lesson_reflections (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null,
  lesson_id         text not null,
  lesson_title      text,
  level             text,
  week              int,
  confidence        int not null check (confidence between 1 and 4),
  -- 1=Really hard  2=A bit tricky  3=Got it  4=Too easy
  hardest_part      text,
  -- Only present when confidence <= 2
  lesson_accuracy   int,
  questions_answered int,
  created_at        timestamptz not null default now()
);

alter table public.lesson_reflections enable row level security;

-- SECURITY DEFINER RPC so the student client can insert without direct table access
create or replace function public.save_lesson_reflection(
  p_student_id        uuid,
  p_lesson_id         text,
  p_lesson_title      text,
  p_level             text,
  p_week              int,
  p_confidence        int,
  p_hardest_part      text,
  p_lesson_accuracy   int,
  p_questions_answered int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.lesson_reflections (
    student_id, lesson_id, lesson_title, level, week,
    confidence, hardest_part, lesson_accuracy, questions_answered
  ) values (
    p_student_id, p_lesson_id, p_lesson_title, p_level, p_week,
    p_confidence, p_hardest_part, p_lesson_accuracy, p_questions_answered
  );
end;
$$;
