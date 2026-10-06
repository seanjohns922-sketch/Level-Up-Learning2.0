begin;

-- PostgREST runs STABLE RPCs in a read-only transaction. Student access
-- validation refreshes the session's last-used timestamp, so these guarded
-- readers must be VOLATILE even though their result queries are read-only.
-- Keep their bodies, student ownership guards and EXECUTE grants unchanged.
alter function public.get_student_realm_levels_secure(uuid) volatile;
alter function public.get_student_expedition_placements_secure(uuid) volatile;

commit;
