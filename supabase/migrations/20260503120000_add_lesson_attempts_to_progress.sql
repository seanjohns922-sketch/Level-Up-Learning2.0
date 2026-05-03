alter table public.progress_snapshot
add column if not exists lesson_attempts jsonb not null default '{}'::jsonb;
