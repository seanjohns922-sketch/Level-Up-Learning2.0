# Main integration verification — 16 November 2026

Integrated main 981f1e8e into the diagnostics branch at 8dcca96e without conflicts.
All application, component, library and dependency files are identical to that
main revision; its 3D-world changes are preserved. The integration adds local
capacity diagnostics, their evidence and the realm-lock read-volatility migration.
Experimental pool, GHC runtime, gateway-routing and database profiling settings
remain local experiments and were restored. No hosted database was modified.

## Passed checks

- Node 24.13.0, matching .nvmrc major version.
- qa:critical: 17/17.
- lint:qa and syntax / QA ESLint for every changed script.
- typecheck.
- Application lint: zero errors, 323 warnings (not suppressed).
- qa:realm-locks using disposable local PostgreSQL.
- Actual local HTTP realm-lock check: teacher lock, valid anon student session,
  own read, missing/cross-student rejection, refused student teacher-write and
  restoration of the prior lock state.
- npm run build, including all prebuild release/content checks and webpack build.
- Clean diff checks; no application-source differences from latest main.

The initial restricted build failed to fetch existing Google Fonts because DNS
was unavailable. The network-enabled build passed without source changes. An
initial database-test command used the fixture checkout, which lacked that npm
script; reran successfully from the release checkout. No failing assertion was
removed or weakened.

Private logs: /Users/seanjohns/reliq-audits/2026-11-16/main-release/.

## Database release note

20261116170000_student_realm_lock_read_volatility.sql changes only
get_student_realm_locks(uuid) from STABLE to VOLATILE and reloads the PostgREST
schema cache. The guarded read refreshes the validated session timestamp, so a
PostgREST read-only transaction must not be used. Function body, ownership,
grants, RLS and identity checks are unchanged; installation does not edit student
or lock records. Reverting to STABLE would reintroduce the HTTP failure.

Committing/pushing this file does not apply it to the hosted database. No database
migration deployment is configured in the inspected quality workflow. Hosted
application of this migration and deployment success are separate from these
local release checks.

## Capacity remains unverified

This release does not certify the current 500-student mixed-load gate or the
10,000 simultaneous-user target. Burst latency remains inconsistent; see
TEN_THOUSAND_CONCURRENT.md. Local integrity checks passed, but further pool and
transaction timing, mixed-load, realtime and long-soak work remains.
