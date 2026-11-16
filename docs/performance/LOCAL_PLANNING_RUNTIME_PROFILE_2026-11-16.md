# Local planning and runtime checks — 16 November 2026

Neither experiment closes the 500-student burst gate. No product or production
configuration changed. These short local tests cannot certify 10,000 simultaneous users.

## SQL planning and WAL timing

Temporarily enabled track_io_timing, track_wal_io_timing and
pg_stat_statements.track_planning on the isolated database. The profiler now
captures actual settings, plan counts, average plan time and database-wide WAL
timing deltas. It does not reset statistics or export query text/arguments.

The baseline pool-10 burst completed 5,000 requests with no failures, verified
500 students' presence and 1,000 exact activity increments. Login p95 was
2,363 ms and p99 3,523 ms: unchanged thresholds failed.

Login SQL: 500 calls, 60 plans, average planning 0.239 ms per plan and execution
0.645 ms per call. Other measured student RPC plans averaged below 0.2 ms.
Measured planning does not explain the end-to-end delay by itself. Planning
instrumentation can add overhead; this is not a controlled tuning comparison.

Database-wide WAL deltas: 2,640 writes / 86.369 ms and 2,627 syncs / 2,453.356 ms.
These include 100,000 historical-event fixture upserts and background work; they
cannot attribute individual login delays to disk sync. Statement timings also
exclude some transaction and network costs. The 69 roughly one-second activity
samples can miss short waits. Incomplete COMMIT coverage is not proof of zero cost.

All three temporary settings were reset and verified off with default source in
the experiment's finally block. An initial postgres-role permission denial made
no change; local supabase_admin performed the diagnostic settings changes without
altering grants. Aggregate evidence: planning-profile-summary-2026-11-16.json.
Private run/restoration logs: /Users/seanjohns/reliq-audits/2026-11-16/planning-profile/.

## API scheduling hypothesis

Tested a fresh local PostgREST v14.8 container with GHCRTS=-N2, database pool 10
and temporary Server-Timing headers. The original container had no GHCRTS override.
The documented GHC runtime flag is a hypothesis test, not an application fix:
https://docs.postgrest.org/en/stable/explanations/install.html#docker-resource-constraints
(The current documentation describes a newer PostgREST release.)

A 61-second, zero-ramp burst of 500 students completed 5,000 requests, with no
failures, 500 verified presence records and 1,000 exact activity increments.
Login p95 was 1,591 ms / p99 1,887 ms; the p95 threshold remains below 1,000 ms,
so the gate failed. Other endpoint p95 values were 401–767 ms.

This one fresh-container run is not a reversed or repeated controlled comparison.
Cache state, local resource variation and changed diagnostics prevent a causal
claim of improvement. Do not promote this setting to production on this evidence.
Aggregate evidence: runtime-profile-summary-2026-11-16.json.
Private orchestration/logs: /Users/seanjohns/reliq-audits/2026-11-16/runtime-profile/.

## Restoration and validation

Removed the experimental container, restored the original REST container and
its automatic network addressing, and passed the local readiness/schema preflight.
The restored baseline smoke passed all 25 student journeys / 175 requests with
exact activity writes. Profiler syntax, targeted QA ESLint and diff checks passed.
No application files, lesson content, visuals, schema or permissions changed.
No release build was required for diagnostic script and documentation changes.
Changes are local only; nothing deployed.

## Remaining work

The mixed 500-student/20-teacher gate remains open. Do not increase to 1,000 or
claim 10,000-user capacity. Before further tuning, capture request-correlated API
transaction/connection timing or compare the same workload directly against the
local API and through the gateway with equivalent authentication. Avoid more
uncontrolled parameter guesses. Production-equivalent staged tests, canonical
completion/retries, realtime, browser checks and a long soak are still required.
