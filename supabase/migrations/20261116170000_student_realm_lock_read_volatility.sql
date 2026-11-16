begin;

-- PostgREST runs STABLE RPCs in a read-only transaction. assert_student_read
-- refreshes the validated student's session timestamp, so this guarded reader
-- must allow writes even though the realm-lock result query is read-only.
-- Preserve the function body, ownership, grants, RLS and student-access guards.
-- No student or lock records are changed by installation.
-- Rollback: ALTER FUNCTION public.get_student_realm_locks(uuid) STABLE;
-- That rollback restores the HTTP read-only-transaction failure.
alter function public.get_student_realm_locks(uuid) volatile;

notify pgrst, 'reload schema';
commit;
