# Student-name matching correction

The previous preview removed uppercase letters before lowercasing. For example,
Jack Smith and Mack Smith both became `ack mith`, while all-uppercase names
became empty strings. The new migration lowercases first, retains international
letters with POSIX alnum, and excludes empty normalized keys from matching.
Names are still only possible identity matches; global review is intentionally
retained for home learners and transfers. School context now uses IDs.

Apply `supabase/migrations/20261028090000_fix_student_name_matching.sql` through
the normal database release process. Deploy the accompanying SchoolHomeClient
change. Either deployment order is compatible, but both are needed for the full
fix. No records, table schemas, RLS policies or grants are changed. Existing
pending review requests are not deleted or approved; re-upload to run the fixed
comparison. The UI never preselects creation of a separate identity.

Before applying, save the live function definition and confirm it matches the
repository baseline. `rollback.sql` restores that baseline (and its known bug);
if production differs, restore the saved live definition instead. Revert the UI
commit separately. Do not run rollback as part of normal deployment.

Regression test: in a fresh disposable PostgreSQL 17 database, run
`psql -v ON_ERROR_STOP=1 -f supabase/manual/student-name-matching/test.sql`.
The fixture uses synthetic records and rolls back everything. It verifies
capital initials, all caps, genuine matches, punctuation, international names,
empty keys, legacy names, inactive identities, school-ID context, pending review
metadata, authenticated role access and denied missing/cross-school access.

Validated locally on 28 October 2026: disposable PostgreSQL 17 regression fixture,
PA4 audit (159 checks), critical QA (13 checks), lint:qa, changed component ESLint,
typecheck and the complete prebuild suite passed. Sandboxed compilation stalled;
`npx next build` outside the sandbox passed compilation, types and page generation.
No live migration or signed-in production upload was performed during this fix.
