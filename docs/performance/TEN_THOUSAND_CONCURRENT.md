# 10,000 simultaneous users: acceptance work

Reviewed 16 November 2026 against `627cc7d4`. Target: 10,000 simultaneously
active students, plus teacher traffic. This is not a claim of supported capacity.

## Planning and API scheduling follow-up

Measured login planning averaged 0.239 ms; the instrumented baseline still failed
(login p95 2,363 ms). A separate local GHCRTS=-N2 experiment also failed the gate
(login p95 1,591 ms). Both verified all tested activity writes with no request
failures. This is not a proven tuning fix. Original settings/container restored,
preflight and smoke passed. See `LOCAL_PLANNING_RUNTIME_PROFILE_2026-11-16.md`.

## Supporting SQL and local restart recovery

The resumed baseline burst verified all activity but failed latency again (login
p95 2,066 ms). Student session configuration averaged 0.0226 ms, so its measured
SQL execution does not explain the delay. Planning/transaction timing remains
incomplete. Local API automatic addressing and stronger HTTP preflight repaired
a test-orchestration restart fault. See `LOCAL_TRANSACTION_PROFILE_2026-11-16.md`.

## Pool recheck: improvement did not reproduce

Reversing the order gave login p95 2,192 ms at pool 30 versus 1,844 ms at pool 10;
both failed. A third pool-30 run with internal metrics also failed (2,119 ms).
All activity checks passed. Metrics showed outstanding pool work, but their
semantics do not provide exact queue length. Original local settings restored
and smoke passed. See `LOCAL_POOL_RECHECK_2026-11-16.md`. Do not promote the earlier
34% one-pair improvement into a production tuning recommendation.

## Pool comparison follow-up

Fresh local API instances with pools of 10 and 30 produced login p95 of 2,131 ms
and 1,414 ms respectively. Both preserved all tested activity but failed the
unchanged student-only gate. Original pool/container restored and smoke passed.
See `LOCAL_POOL_COMPARISON_2026-11-16.md`; no production tuning is approved by this
single sequential comparison and the mixed 500-student gate remains open.

## Profiling follow-up

Two more local student bursts preserved write integrity but failed latency gates.
Gateway/server headers locate most delay in the API transaction stage; login SQL
averaged 0.415 ms, client event-loop p99 was 12 ms. Pool/transaction waiting is a
candidate, not a proven root cause. See `LOCAL_BURST_PROFILE_2026-11-16.md`.
Temporary local timing diagnostics were reset; no production changes occurred.

## Isolation follow-up

Student-only simultaneous load also failed (login p95 2,853 ms), while teacher-only
load passed. Spreading 500 student logins over 30 seconds passed (login p95 6 ms).
All tested activity persisted correctly. This identifies burst sensitivity, not
the underlying queueing/resource cause; it does not close the mixed-load gate.
See `LOCAL_500_ISOLATION_2026-11-16.md`. No product delay or production change was made.

## Latest mixed-load checkpoint: 500-student performance gate failed

The upgraded local stack completed a 121-second rehearsal with 500 distinct
students, 20 ordinary teachers and 100,000 historical events. No requests failed;
all 500 persisted presence checks and 2,001 exact activity increments passed.
However, login p95 was 2,465 ms / p99 3,286 ms and teacher snapshot p99 was
5,752 ms. The unchanged latency gate failed. Do not proceed to 1,000 users yet.
See `LOCAL_500_REHEARSAL_2026-11-16.md` and
`capacity-local-500-2026-11-16.json`. No production changes were made.

## Earlier checkpoints: sustained gate and schema rehearsal

**Later update:** the crash was isolated and resolved using Supabase image
`17.6.1.156`, and the complete local stack has now been upgraded and passed HTTP
checks. See `LOCAL_STACK_UPGRADE_2026-11-16.md`. The later 500-student local result is recorded above; no cloud load test has run.

The clean 1,800-second local run passed with 100 students, four teachers, all 100
presence checks and 6,001 verified activity increments. There were no unexpected
request failures. The concurrent completion/retry burst verified 100 journeys,
600 expected access denials and 100 teacher realtime events (maximum 777 ms).
The local gateway was set to 4,096 connections before the run and was unchanged
throughout. Resource monitoring collected 58 samples without sampling errors;
the highest sampled connection count was 36. This is not a measured cloud limit.
Results: `soak-100-2026-11-16.json`, `soak-completion-2026-11-16.json`.

The later schema rehearsal used checkout `f7238ead`, which adds visual changes
but no migrations after the earlier reviewed release. A private backup of the
synthetic database was restored into `reliq_capacity_review_20261116` in the local
container. Restore required the existing Supabase admin role and restoring the
GraphQL wrapper before its deferred ACL; the ACL was preserved, not removed.

All 11 November migrations excluding the historical schedule add/remove pair
installed successfully in that copy. No cron extension or job was present; the
manual migration revokes the retired worker. Fingerprints confirmed unchanged
existing students, schools, classes, progression, lesson/quiz/assessment records
and Explorer Codes (excluding newly added calendar metadata).

**The upgraded copy is not approved for load testing.** A teacher-role realm-lock
write/read passed, but the following anon student-role block caused a PostgreSQL
signal-11 crash. The exact failing statement within that block and root cause
remain undiagnosed. Since both databases share a PostgreSQL process, the original
local services briefly reconnected during recovery. The transaction rolled back;
the rehearsal's realm-lock table was verified empty. A subsequent original-stack
25-student smoke passed. No production connection or change occurred.

Next: reproduce this failure in a separate disposable container, distinguish
restore/extension/runtime issues from application SQL, and pass role checks before
upgrading the REST-connected local database or provisioning cloud load tests.
Private restore scripts, backup, migration fingerprints and recovery smoke are
under `/Users/seanjohns/reliq-audits/2026-11-16/schema-parity/`; do not commit the
database dump or local fixture credentials. Production parity, REST/browser parity,
larger load stages and cloud cost approval remain outstanding.

## Established evidence and limits

- An isolated local Supabase stack and synthetic accounts already exist.
- October short runs exercised 100 students and four teachers; the original
  30-minute run failed. Passing short retests did not close that sustained gate.
- A local gateway connection limit was diagnosed in October. Its temporary
  tuning must be verified before any repeat; container recreation can lose it.
- The original local capacity runner had 100 identities, activity writes
  and repeated complete event reads. Increasing a duration variable does not
  turn it into a 10,000-student test. It now supports 4–20 groups (100–500 identities), defaulting to 100.
- The application now uses an incremental event reader and separate 30-second
  event refresh scheduling. The existing runner's complete event snapshot every
  two seconds is a stress scenario, not an exact model of the current UI.
- The local schema snapshot is from October. Verify newer migrations and service
  configuration before describing it as matching the deployed application.

## Workload to preserve

### Current local checkpoint

The 16 November two-minute rehearsal passed with 100 students, four teachers and
20,000 synthetic historical events. All 100 persisted presence checks and 401
activity increments were verified, with no request or journey failures. Student
login p95 was 276 ms, activity-write p95 120 ms and complete event snapshot p95
218 ms. The runner recorded 1,634 operations including 228 logical snapshots;
those snapshots generated 2,565 HTTP requests, for 3,971 HTTP requests overall.
See `capacity-local-100-2026-11-16.json` for endpoint distributions and exclusions.
No explicit `worker_connections` setting appeared in the inspected local gateway
configuration; it was not changed during this run. A short passing run does not
close the earlier sustained failure or establish managed-cloud capacity.

With the current 30-second activity interval, 10,000 continuously active school
students can generate approximately 667 presence/activity RPCs per second before
answer events, login, progress reads or canonical saves. This is arithmetic, not
a benchmark. At one teacher per 25 students, include 400 teacher sessions.

Use distinct identities across multiple schools/classes, actual anon student
sessions and ordinary authenticated teachers. Include bell-time logins, world
startup, diagnostic resume, lessons, quiz/assessment submission, reload, retries,
disconnect/reconnect and teacher dashboards. Provisioning privileges must never
be used for measured student/teacher traffic.

Measure separate scenarios for realistic staggered classroom activity,
synchronized bursts and history-heavy classes. Include realistic older attempts
and events, not only newly empty accounts. Measure desktop/iPad rendering and
asset loading separately from protocol/database capacity.

## Ordered acceptance gates

1. Establish current local schema/service parity and retain a reproducible setup.
2. Complete a clean 30-minute 100-student repeat with fixed configuration, exact
   persisted-write checks and aggregate resource monitoring from the start.
3. Align the workload runner with current app reads; add completion/retry and
   teacher realtime assertions. Retain the full-history stress scenario separately.
4. Prepare a separate cloud environment matching intended production resources,
   region, schema, indexes and permissions. Confirm costs before paid provisioning
   or upgrades. Never direct a stress test at the trial schools' production system.
5. Increase through 500, 1,000, 2,500, 5,000 and 10,000 students, stopping when a
   gate fails. Verify load-generator capacity so a laptop limit is not mistaken
   for a service limit. Follow with a sustained run and longer soak at target load.

Use the proposed gates in `SCALE_READINESS.md`: at least 99.9% expected-request
success, login/save p95 below one second and p99 below three seconds, zero lost
or duplicate canonical saves, no identity leakage, verified teacher freshness
and measured resource headroom. Report each endpoint separately. Explicit denial
tests must pass but must not be miscounted as unexpected workload failures.

Retain run configuration, application/schema versions, generator measurements,
latency distributions, errors, integrity results, realtime lag, database/resource
graphs and metered usage. Report the maximum tested passing load, not an estimate
extrapolated from a small rehearsal. Security readiness remains a separate gate.
