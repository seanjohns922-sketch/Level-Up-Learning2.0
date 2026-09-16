# Student diagnostic lookup release check

School and home student logins use the Supabase anon API role with a validated
`x-student-session` header. New student diagnostic RPCs must explicitly grant
EXECUTE to both anon and authenticated, while retaining the underlying
`assert_student_access` / `assert_student_write` guard.

16 September 2026 incident: the Ground and Level 1 Measurement wrapper RPCs
omitted anon. Login reached the assessment check and was denied EXECUTE before
its session guard could run. Corrected in migration
`20260916140000_restore_student_diagnostic_lookup_access.sql`, applied live.

Verification: both wrappers executed under anon with transaction-scoped valid
sessions for all 263 active students. Missing and cross-student sessions were
rejected. All test sessions and lookup-side changes were rolled back; no student
progress or results changed. Migration permissions are now a prebuild audit.

For future releases, dry-run the migration and call the new endpoint under the
actual student API role with a valid session; a postgres-role test alone does not
verify EXECUTE grants. Also test missing/cross-student tokens and roll back fixtures.
