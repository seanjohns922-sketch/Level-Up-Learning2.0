# Request-correlated local database timing — 16 November 2026

The traced 500-student burst failed latency (login p95 2,747 ms / p99 3,596 ms)
but passed all integrity checks: 5,000 successful responses, 500 verified presence
records and exactly 1,000 activity increments. All 5,000 measured responses
carried timing markers. Successful statuses include both 200 and 204.

## Instrumentation

A temporary, SECURITY INVOKER pre-request function in a dedicated local-only
schema added response headers with transaction_timestamp() and clock_timestamp().
The latter was captured immediately before the main RPC query. No query text,
request arguments, user IDs, session tokens or credentials were exported. Only
anon/authenticated/service_role could execute the hook; PUBLIC execute was revoked.
No existing access checks, RPC bodies or data grants changed. The schema was not
added to exposed API schemas. This was not a production migration.

The original API had no pre-request hook. A disposable clone enabled the hook and
Server-Timing with the baseline pool of 10 and default GHC runtime. The usual
cross-school denials and real anon student-session flow remained in place. The
runner enables capture only with SCALE_TRACE_DATABASE=1, requires trace headers
on measured REST requests, and writes private request-trace.json with endpoint
names and numeric timings only. Defaults do not enable tracing.

The hook's position is documented in PostgREST's transaction lifecycle:
https://docs.postgrest.org/en/v14/references/transactions.html#pre-request
Transaction start is downstream of connection acquisition. It is NOT an exact
pool-acquisition boundary: client scheduling, transport, gateway processing,
API scheduling and BEGIN delivery are also before this marker.

## Clock calibration and findings

Ten bounded database clock reads before and after the run gave overlapping
host/database offset intervals. Assuming stable offset during the run, their
combined interval was -7.603 to +45.602 ms; estimates use its midpoint, with
approximately +/-26.603 ms uncertainty for cross-clock differences. The direct
transaction-start to hook difference uses the same database clock.

Login timings (500 requests):

| Stage | Median | p95 |
| --- | ---: | ---: |
| Complete request | 860.677 ms | 2,747.228 ms |
| Client send to database transaction start | 828.161 ms | 2,714.606 ms |
| Transaction start to pre-request hook | 0.764 ms | 13.981 ms |
| Pre-request hook to response headers | 39.587 ms | 103.942 ms |

Percentiles are independently calculated and must not be added together. The
last stage includes the main query, commit, API response handling and transport;
it is not pure SQL execution. Very small or negative estimates for fast requests
can arise from clock uncertainty and must not be clamped into evidence of no cost.

Of 219 logins taking at least one second, every one spent at least 90.66% of its
elapsed time before the database transaction start, even using the conservative
clock-offset bound. The slowest request took 4,565.920 ms; its estimated pre-
transaction interval was 4,537.144 ms. This materially narrows where the delay
occurs but does not, by itself, distinguish pool acquisition from API scheduling.
The hook itself adds overhead. This is one instrumented local run, not a
production capacity result or a validated tuning fix.

Aggregate evidence: request-trace-summary-2026-11-16.json.
Private orchestration, hook SQL, raw timestamps and clock samples:
/Users/seanjohns/reliq-audits/2026-11-16/request-trace/.

## Cleanup and verification

The finally block restored the original REST container with automatic addressing
and removed the temporary function and schema. A subsequent database check found
zero matching schemas. Local preflight and the restored 25-student / 175-request
smoke passed with exact writes. Profiler syntax, targeted QA ESLint and diff checks
passed. No application code or hosted settings changed; no release build was
needed for this local diagnostic update. No deployment performed.

The next step is exact API pool acquisition/release instrumentation, or a
controlled runtime exposing those spans. Existing pool-size experiments were
inconsistent, so do not recommend a production pool increase yet. Keep the
500-student mixed-load gate open and do not advance to 1,000 users on this evidence.
