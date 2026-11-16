# Pool recheck and direct metrics — 16 November 2026

## Outcome

The earlier larger-pool speed improvement did not reproduce. Retain baseline;
there is no demonstrated production tuning fix and no reason to advance load.

| Run order/scenario | Pool | Login p95 | Gate |
| --- | --- | --- | --- |
| Original pair, first | 10 | 2,131 ms | Fail |
| Original pair, second | 30 | 1,414 ms | Fail |
| Reverse pair, first | 30 | 2,192 ms | Fail |
| Reverse pair, second | 10 | 1,844 ms | Fail |
| Internal metrics run | 30 | 2,119 ms | Fail |

All three new runs verified 500 presence records and 1,000 exact activity
increments each, with zero request or journey failures. Each used the same
student-only, zero-ramp 60-second workload and fresh API instance. The mixed
500-student/20-teacher acceptance gate remains open. No 1,000-user run occurred.

## Direct metrics and interpretation

293 internal metrics samples were collected at approximately 250 ms intervals,
with zero sampling errors. Configured pool max was 30. Reported pool waiting
peaked at 425, reported available ranged from -1 to 30, and pool timeouts stayed 0.
These show a large volume of outstanding pool work during the burst, but the
metrics must not be treated as exact queue length or exact free connections.

The PostgREST v14.8 implementation increments the waiting gauge before SQL.use
and decrements after the session completes, so it includes requests in service
as well as ones waiting. The transient negative availability was preserved,
not clamped or hidden. Sampling and asynchronous observations limit interpretation.
Sources reviewed:
- https://raw.githubusercontent.com/PostgREST/postgrest/v14.8/src/PostgREST/AppState.hs
- https://raw.githubusercontent.com/PostgREST/postgrest/v14.8/src/PostgREST/Metrics.hs
- https://docs.postgrest.org/en/v14/references/observability.html

Pool size alone is not a reproducible solution on this machine. Prior fast SQL
execution measurements and transaction-stage latency still motivate investigation
of connection handling, transaction overhead and API/runtime scheduling. No
specific root cause beyond burst-related API delay is yet established.

Architecture was checked: API image arm64, Docker aarch64 and Node host arm64.
There is no API image/host architecture mismatch explaining these tests.

## Restoration and checks

Original local REST container identity was restored after both experiments;
pool=10, server timing disabled, running and no published host ports. The original
container already has PGRST_ADMIN_SERVER_PORT=3001 internally; earlier commentary
that implied this diagnostic port was new was incorrect. The temporary clone
used that same internal endpoint. No new externally reachable endpoint was added.
Baseline configuration and original container were retained, not reconstructed.

Runtime/schema/gateway preflight passed and the restored baseline passed the
25-student, 175-request login/persisted-activity smoke. No production changes,
app UI edits, schema changes, permission changes or paid infrastructure occurred.
This evidence-only change needs no application build. Diff checks passed.

Aggregate results: pool-reverse-and-metrics-2026-11-16.json. Full private run logs,
resource samples and orchestration are under the pool-reverse/ and pool-metrics/
folders in /Users/seanjohns/reliq-audits/2026-11-16/. No credentials were printed
or included in repository artifacts.

## Next investigation

Stop treating a larger pool as the candidate fix. Measure supporting transaction
statements and transaction/connection lifecycle timing alongside pool counters
on the unchanged baseline. Profile a separate current-UI teacher workload later;
retain the original stress scenario. Production capacity remains unverified and
will require a production-equivalent environment, not local Mac timings alone.
