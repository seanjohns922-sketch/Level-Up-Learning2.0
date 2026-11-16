-- Current-class lookups also support the existing teacher-access policy joins.
-- Index only: no changes to student data, grants, RLS or permission functions.
-- Use a quiet deployment window; fail rather than wait indefinitely for writers.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

create index if not exists students_class_id_idx
  on public.students (class_id);

commit;

-- Rollback: drop index if exists public.students_class_id_idx;
