begin;

-- The authenticated SELECT policy on student_progress_overrides evaluates this
-- helper for each row. PostgreSQL requires the querying role to have EXECUTE
-- permission even though the function itself is SECURITY DEFINER.
-- Keep table writes RPC-only while allowing the policy predicate to run.
grant execute on function public.can_manage_student_progress(uuid)
  to authenticated;

commit;
