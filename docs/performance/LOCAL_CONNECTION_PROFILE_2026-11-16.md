# Local connection-state profiling — 16 November 2026

Two unchanged 500-student, zero-ramp, student-only bursts produced inconsistent
latency: login p95 676 ms (gate passed) then 2,175 ms (gate failed). Both completed
5,000 requests without failures, verified all 500 presence records and exactly
1,000 activity increments. This does not close the mixed-load gate or certify
10,000 concurrent users.

## Method

Original local PostgREST container and default pool/runtime settings. No restart,
configuration change or statistics reset. The new local-only profiler runs one
persistent psql session and samples PostgREST connection states every 50 ms using
bounded watch iterations. A separate sampler reads internal pool metrics every
250 ms. Both collect for 75 seconds including fixture preparation and background
activity. Each connection sampler collected 1,501 snapshots. Raw queries, JWTs,
student identifiers and credentials are not exported. Private raw evidence is in
/Users/seanjohns/reliq-audits/2026-11-16/connection-profile/ and
/Users/seanjohns/reliq-audits/2026-11-16/connection-profile-repeat/.

## Findings and limits

| Measurement | First run | Repeat |
| --- | ---: | ---: |
| Login p95 | 676 ms | 2,175 ms |
| Observed distinct database transactions | 663 | 690 |
| Largest observed transaction age | 45.906 ms | 53.872 ms |
| Peak outstanding pool requests | 490 | 489 |
| Additional pool acquisition timeouts | 0 | 0 |

Many sampled open transactions were idle while waiting for client input; others
were executing or waiting on WAL write/sync. These are state observations, not
per-request durations or a percentage of all request time. Short transactions
are under-sampled and the maximum observed age of a transaction is only a lower
bound on its lifetime. Samples include fixture preparation and background work.
The outstanding pool metric includes requests already in service, so it must not
be presented as the exact number waiting for a connection. No acquisition-timeout
increase does not mean there was no acquisition delay. The observer itself adds
some load, and host resources were not controlled for a causal experiment.

Short observed database transactions alongside large outstanding request counts
support investigating pool/connection lifecycle and API/database round trips.
They do not prove the root cause or quantify per-request acquisition time. The
latest profiler is sampled connection evidence, not the promised eventual exact
pool-acquisition trace. Do not change production pool sizing or durability on this
evidence. A passing run followed by failure is not a capacity fix.

Aggregate evidence: connection-profile-summary-2026-11-16.json.

## Verification and follow-up

Syntax, targeted QA ESLint and diff checks passed. Both actual local workload
runs exercised the profiler successfully. The runner retained the ordinary-role
access checks and exact activity assertions. No application, migration, lesson,
visual or hosted configuration changes were made; no release build is required
for this local diagnostic script. Existing local preflight passed before both
runs. No temporary runtime configuration requires restoration.

Next: instrument actual pool-acquisition and release boundaries, or use a
controlled staging runtime that exposes those traces, before further tuning.
The current local evidence cannot separate scheduling, connection round trips,
connection lifecycle and shared-machine resource variation. Do not advance the
load gate to 1,000 users yet.
