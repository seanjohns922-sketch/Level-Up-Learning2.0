# Local student burst profiling — 16 November 2026

## Findings

Two further 500-student, student-only simultaneous bursts ran for 60 seconds on
the isolated local stack. Both failed unchanged latency gates, but had no failed
requests, all 500 persisted presence checks and 1,000 exact activity increments.
No app, schema, access grants or production service was changed.

First run:
- Login request p95 2,115 ms; gateway upstream p95 2,010 ms; proxy overhead p95 1 ms.
- Client event-loop delay p99 12 ms, maximum 63 ms; utilization approximately 5.1%.
- 500 measured login SQL calls averaged 0.415 ms execution; other measured RPCs
  averaged 1.6–1.8 ms execution. These are aggregate SQL execution deltas, not
  end-to-end transaction timings and do not include every supporting statement.
- 69 roughly one-second database samples: maximum 27 connections, 2 active,
  0 sampled lock waits, 1 sampled I/O wait, longest sampled active query 38.5 ms.
  Sampling may miss short peaks and waits. Sampler overhead is not benchmarked.

Second run with temporary PostgREST Server-Timing enabled:
- Login p95 1,665 ms, upstream p95 1,581 ms, transaction stage p95 1,479 ms.
- JWT, parse, plan and response p95 rounded to 0 ms; sub-millisecond timings are
  rounded, not literally free. Context transaction-stage p95 was 1,591 ms.
- Client event-loop p99 remained 12 ms, maximum 108 ms.

The evidence locates the delay primarily in the API transaction stage rather
than frontend work, JWT verification or the login SQL itself. Waiting for a
connection/transaction and runtime scheduling remain candidates. **The underlying
cause is not yet proven.** The PostgREST plan header is its own request-planning
stage; it must not be interpreted as exhaustive PostgreSQL SQL planning time.

The local PostgREST effective config reports db-pool=10, prepared statements=true,
server-timing-enabled=false by default. Docker reports 8 CPUs. No explicit REST
container CPU quota was configured. These are local settings, not production facts.

## Diagnostic safety and implementation

Capacity runner now captures numeric gateway/server timings plus client event-loop
statistics; raw headers, tokens and request bodies are never logged. Existing
workloads, gates, scenarios and local-only URL guard remain unchanged.
New profile-local-database.mjs captures aggregate pg_stat_statements deltas by
allowlisted RPC name and active/wait counts. It does not reset shared statistics
or record query text. SQL-name matching is aggregate and may include overlapping
local activity; this run's call deltas matched the measured workload counts.

The second run temporarily set authenticator's pgrst.server_timing_enabled=true
in the isolated local DB after asserting there was no prior override. A finally
block reset the setting and notified PostgREST to reload. Post-run SQL confirmed
zero matching overrides. No grants, RLS policies, tables or student data were
changed by this toggle. This follows the official reloadable setting:
https://docs.postgrest.org/en/v12/references/configuration.html#server-timing-enabled

Aggregate JSON evidence is alongside this report. Original logs are under
/Users/seanjohns/reliq-audits/2026-11-16/burst-profile/.
Syntax, targeted QA ESLint and diff checks passed. Changes are test tooling and
documentation only, so no application release build was run.

## Next controlled experiment

Measure transaction/pool waiting more directly or compare the same burst with a
reversible local pool configuration, retaining and restoring the baseline. Do not
increase production connections blindly: a larger pool can harm database capacity.
Only implement an app/schema change if evidence identifies its cause. Then rerun
the original mixed 500-student gate. It remains failed; no 1,000-user stage or
cloud capacity certification follows from these profiles.
