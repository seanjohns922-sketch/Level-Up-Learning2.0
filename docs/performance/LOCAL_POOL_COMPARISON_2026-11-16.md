# Local API pool comparison — 16 November 2026

## Result

A larger local API pool improved the short student-only burst but did not pass
the unchanged latency gate. Do not deploy this as a proven capacity fix.

| Local API pool | Login p95 | Result | Peak sampled DB connections |
| --- | --- | --- | --- |
| 10 | 2,131 ms | Fail | 26 |
| 30 | 1,414 ms | Fail | 46 |

Both runs used 500 distinct synthetic students, zero ramp, no teacher workload,
60-second activity windows, identical API image/PostgREST 14.8 and server timing
enabled. Both verified all 500 presence records and 1,000 exact activity increments,
with no failed requests or journeys. The 30-pool login p99 was 1,442 ms, but login
and runtime-context p95 (1,241 ms) still exceeded the one-second target. Login p95
improved about 34%; this is one sequential pair, not a replicated causal estimate.

Increasing the pool reduced transaction-stage delay and increased observed DB
connections. This supports connection concurrency as a contributor, but does not
establish it as the only cause or justify the same setting in managed production.
Database/cache warm-up, runtime scheduling and local resource contention remain
possible confounders. Pool 30 was tested second. Neither run is the full mixed-load
acceptance scenario, and neither proves 500/10,000-user production capacity.

## Method and restoration

The pool parameter requires an API restart; official reference:
https://docs.postgrest.org/en/v14/references/configuration.html#db-pool

Retained the original local REST container, then created a fresh temporary clone
for each pool size. Clones used the same image, configuration, internal IP and rest
network alias; only explicit pool size and identical diagnostic timing settings
were added. No host ports or mounts were added. Credentials remained in memory
when copying Docker configuration and were not printed or committed. Each clone
was stopped and removed after its run. Original container was restored in finally.

An initial guard expected a different alias and stopped before any mutation; the
actual rest alias was inspected and the guard corrected before running tests.

Restoration checks confirmed the original container identity, running state,
original internal address, db-pool=10 and server-timing-enabled=false. Existing
runtime/schema/gateway preflight passed. Restored-stack smoke passed all 25 student
journeys and 175 requests, including exact persisted activity increments.

Only synthetic local data was written by workloads. No app files, grants/RLS,
production settings or student-facing behaviour changed. No release build was
needed for this evidence-only step. Aggregate results and database summaries are
in pool-comparison-2026-11-16.json. Private orchestration script and full logs are
under /Users/seanjohns/reliq-audits/2026-11-16/pool-comparison/.

## Next gate

Keep the 10-connection baseline. Before selecting an infrastructure change,
repeat/reverse the comparison and measure the remaining API scheduling/connection
acquisition delay. Then test the original mixed 500-student/20-teacher scenario
with any verified candidate. Do not advance to 1,000 or change production pool
limits based on this pair. Production-equivalent resource sizing is still pending.
