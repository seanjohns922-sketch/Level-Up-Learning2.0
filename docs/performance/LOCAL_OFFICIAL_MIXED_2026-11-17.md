# Official-runtime mixed pool comparison — 17 November 2026

## Scope

Follow-up to `LOCAL_ACQUISITION_TRACE_2026-11-16.md`. Use the original official
`public.ecr.aws/supabase/postgrest:v14.8` image, not the custom diagnostic binary.
Four fresh disposable local API containers in pool order 10 / 30 / 30 / 10,
with original runtime environment and only `PGRST_DB_POOL` explicitly selected.
No tracing hook, diagnostic logging, server-timing override or GHC runtime tuning.
Original API restored after every run; no hosted resources or production changes.

Each run first passes the 25-student smoke, then sends a zero-ramp burst of 500
synthetic students alongside 20 ordinary authenticated teachers for 60 seconds.
The same 100,000 synthetic historical events are provisioned outside the measured
workload. Cross-school event access must return 403 before starting load. Actual
student requests use anon plus validated student-session headers. Expected daily
activity increments and persisted presence are verified after every journey.

The unchanged gate requires every endpoint p95 < 1,000 ms, p99 < 3,000 ms,
request failure ratio <= 0.001, and zero journey/integrity failures. A teacher
snapshot is a logical multi-page operation; `snapshotHttpRequests` records the
underlying HTTP count separately. Teacher authentication is recorded before the
simultaneous student/snapshot burst, not as concurrent sign-in load.

## Results

| Run | Student login p95 ms | Teacher history p95 ms | Verified increments | Overall gate |
| --- | ---: | ---: | ---: | --- |
| pool10-first | 806 | 1245 | 1000 | Fail |
| pool30-first | 880 | 466 | 1002 | Fail |
| pool30-repeat | 2036 | 165 | 1000 | Fail |
| pool10-repeat | 1977 | 210 | 1000 | Fail |

All four runs had zero failed requests, zero journey failures and 500 verified
student presence records. Activity totals matched the exact number of increments
performed in each journey. One run performed two extra increments because of
workload timing; all 1,002 were verified, rather than assuming a fixed 1,000.

The first pool-10 run missed the live-activity update and teacher snapshot
thresholds. The first pool-30 run missed context and live-activity update
thresholds; the repeated pool-30 run missed login and context thresholds.
The final baseline also failed; all endpoint distributions are in the JSON.


## Interpretation and next step

The larger pool did not produce a passing mixed-load result in either run.
Student login p95 varied from 806 to 2,036 ms across the sequence, while teacher
history p95 improved in later runs at both pool sizes. This does not isolate pool
size as the cause of those differences. Fresh API containers do not reset shared
database/OS caches or host scheduling. Do not promote the diagnostic-build pass
into an official-runtime tuning recommendation.

Keep the mixed-load gate open and retain the baseline production settings.
The next bounded implementation is a separate representative dashboard scenario,
with the actual incremental event reader and associated dashboard reads; keep
this complete-history stress scenario as a regression test. No larger user-count
claim is justified by these results.

This is a deliberately heavy complete-event-history refresh scenario. The current
`LiveClassPanel` uses `createLiveClassEventReader` for incremental reads between
full reconciliations and separately reads live activity, lesson/quiz/assessment
results and daily activity. This test repeatedly calls `fetchLiveClassEvents`
for a complete history; it does not emulate the entire current dashboard.
Preserve this stress case rather than silently relabelling it as ordinary usage.
A separate representative dashboard workload should cover the real reader and
all its associated reads, plus realtime/reconnect and completion correctness.
Local results do not establish production-equivalent resources or 10,000-user
capacity, and no settings should be promoted based on this test alone.

## Evidence and restoration

Aggregate reports: `official-mixed-pool-summary-2026-11-17.json`.
Private runner, per-run smoke checks and logs:
`/Users/seanjohns/reliq-audits/2026-11-17/official-mixed/`.

After the final run, original-runtime preflight and the restored 25-student /
175-request smoke passed. Each disposable API was removed and the original API
restored with automatic network addressing. Aggregate checks confirmed all four
reports used 500 students / 20 teachers and passed activity/presence integrity.
Private orchestration syntax and repository diff whitespace checks passed.

Only performance documentation and aggregate evidence changed in this follow-up;
no application or diagnostic-runner source changed. A release build was therefore
not needed. No schema, grant, data model, lesson or visual changes, and no hosted
deployment or tuning occurred.
