# Starpath database integration verification — 14 September 2026

## Result

**109 isolated PostgreSQL checks and seven live rollback-only SQL checks passed. Database authentication is restored and both migrations are verified, including the corrected reporting function. The application branch is pushed; `main` is unchanged. Existing student data was not changed.**

The suite executes the repository's canonical table definitions and assessment/progress functions in a dedicated Supabase PostgreSQL 17 container with networking disabled. It seeds synthetic students before applying the two new Starpath migrations, then executes saves and read RPCs. Each run creates and drops its own test database.

Verified:

- Migration application preserves existing progress, lesson, quiz and assessment rows exactly.
- An existing Ground learner reloads at week 5 with placement complete and rewards retained.
- New Ground placement requires its baseline; even a 95% baseline remains Ground with all eight weeks assigned.
- Assessment save/reload preserves question evidence, comparison metadata and separate pre/post history.
- Duplicate completion retries create one attempt; a failed progress write rolls back both the assessment and completion receipt.
- Incorrect class context and an access-guard failure prevent completion writes.
- Explicit teacher pretest reset preserves Starpath historical attempts, completed week, post-score and rewards while reopening placement.
- Starpath saves/resets leave the fixture's Number progress and rewards unchanged.
- Complete school analytics returns the original compatible Starpath baseline, excludes incompatible versions, and retains lesson/quiz activity and students.
- The complete Number analytics payload matches the previous implementation, apart from generated time and explanatory methodology.
- Old and revised completion functions produce identical higher-level progress rows for pre/post tests across all six realms at scores 40, 49, 50, 70, 84, 85 and 95 (84 comparisons).

## Correction found during verification

The proposed school analytics migration initially selected the first baseline for every realm. It now applies that change only to Space. Other realms retain the existing latest-pre/latest-post calculation. A database regression check compares the complete Number reporting payload against the previous function.

A pre-existing canonical-progression audit checked for teacher-override text in the old dashboard location. Its assertion now checks the actual StrandStudentsPanel, including the separate teacher-override data and label. Product behaviour was unchanged by that audit correction.

## Additional local checks

Passed: canonical progression (23 checks), completion rewards, student session isolation, teacher canonical snapshot, teacher live-realm integration, school analytics, teacher school insights, Starpath rebuild and whitespace validation. TypeScript and the production build passed in the preceding implementation verification; subsequent product changes in this verification were limited to the SQL analytics migration.

## Limits and production blocker

The fixture uses simplified class/cohort tables and synthetic identity helpers. It does **not** prove production RLS, deployed-schema parity, student login, browser interaction, transport failures, concurrent requests or live reporting. SQL reload tests are not a browser end-to-end test. Assessment difficulty also remains uncalibrated.

The configured Supabase connection rejected `SUPABASE_DB_PASSWORD` with password authentication failure. Update that value in `.env.supabase.local` without sharing it in chat. Once access is restored, inspect deployed schema/migration parity, then validate against a disposable test environment or approved synthetic account, including actual authenticated save, reload and teacher reporting. Do not test by modifying children's records.

Both migrations remain unapplied by this session:

1. `20260914160000_starpath_ground_baseline.sql`
2. `20260914161000_starpath_comparable_growth.sql`

## Reproduce isolated checks

Use a dedicated container; the runner refuses containers without the required name prefix and disabled networking:

```sh
docker run --detach --name starpath-integration-20260914 --network none \
  -e POSTGRES_PASSWORD=starpath-isolated-test-only \
  public.ecr.aws/supabase/postgres:17.6.1.155
# Wait until pg_isready reports accepting connections.
docker exec starpath-integration-20260914 pg_isready
python3 scripts/starpath-database-integration.py
# Remove only this dedicated test container when finished.
docker rm -f starpath-integration-20260914
```

Tests live in `supabase/tests/starpath_rebuild/`; the runner extracts the current pre-migration functions rather than maintaining independent copies of persistence logic.

## Live verification follow-up — 14 September 2026

The reset database password now authenticates successfully. The deployed Ground completion and teacher-reset function bodies match the reviewed migration. The manually applied reporting function was the earlier revision; the reviewed Space-only correction was applied in a guarded transaction, preserving all other realms' existing growth calculation. No student rows were changed by this function replacement.

Seven live SQL checks passed using a synthetic Home student, real student-session authorization and the deployed RPCs: baseline save, duplicate retry, authenticated Ground/full-pathway reload, response geometry and metadata preservation, post-test save, separate attempt retrieval, and both scores/current-week retrieval. All synthetic identity and activity writes were inside one transaction ending in ROLLBACK. A subsequent independent read confirmed zero synthetic accounts and zero synthetic completion receipts remained.

The live test is `supabase/tests/starpath_rebuild/live-smoke.sql`. It validates real database authorization and SQL save/read behaviour within a transaction; it does not claim a committed cross-session or browser end-to-end test, or a live school-teacher reporting test. School analytics execution and cross-realm parity remain covered by the 109 isolated PostgreSQL checks. `main` remains unchanged; the application rebuild is on `codex/starpath-assessment-rebuild`.
