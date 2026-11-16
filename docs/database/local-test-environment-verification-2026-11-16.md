# Existing local test environment: 16 November 2026

Verified against application checkout `627cc7d4`. This was a local verification,
not a production test or approval of every school journey.

## Existing setup confirmed

The original checkout already contains `.local-archive/scale-local/`, including
the private schema-only snapshot, local connection settings and synthetic account
fixtures. The `reliq-scale-local` Supabase containers were running. Do not commit
the connection settings or account files. Restart instructions and historical
configuration limits are in `../performance/SCALE_READINESS.md`.

The current `scripts/staging/smoke-load.mjs` was run with the original checkout as
its working directory. Its endpoint guard permits only localhost port 56521.
All 25 fictional students logged in, resolved their own runtime context, updated
presence/activity and read back an exact 30-second activity increase. All 175
requests passed. Results are saved locally in
`.local-archive/scale-local/smoke-result.json`. Login p95 was 1,236 ms; the other
endpoint p95 values were 143–283 ms. These are local observations, not a cloud
capacity benchmark. No production records were accessed or changed.

## Current school workflow checks

The following existing tests passed against disposable PostgreSQL containers with
networking disabled and fictional fixture records:

- `npm run qa:school-year-db`: mixed calendar-year cohorts, retention and
  corrections, Prep–8, leavers, stale/repeated/concurrent requests and unchanged
  learning/class data.
- `npm run qa:school-current-year`: current-year switch/undo, fresh schools,
  licence checks, school boundaries and audit entries.
- `npm run qa:remove-empty-class`: empty duplicates can be removed; current
  students, previous enrolments and saved work prevent removal.
- `node scripts/school-transfer-regression.mjs`: valid and repeated transfers
  preserve identity; archived/inactive or incorrect destination classes are
  rejected, including a concurrent archive.

These fixtures test selected migrations and use minimal supporting schemas;
they do not prove that the older local Supabase snapshot has those migrations.

The local UI/API regression suite `qa:school-year-manual` also passed, as did
the source audits `qa:archived-student-roster` and `qa:canonical-progression`
(23 checks). Source audits are not browser or live-database verification.

## Remaining work

1. Compare the private October schema snapshot with newer migrations, then
   prepare a reproducible local-only upgrade/bootstrap procedure. Do not blindly
   replay historical migrations or reset an existing environment.
2. Confirm auth, storage, realtime and catalogue configuration for complete
   browser journeys; the original setup documented gaps in these areas.
3. Run browser journeys for adding students, class management, archiving,
   rollover and actual lesson-result saving after schema parity is established.
   Today's activity smoke did not submit lesson or assessment results.

The working local environment does not need rebuilding simply because a fresh
checkout cannot provision it. Preserve its volumes while closing the portability
and parity gaps.
