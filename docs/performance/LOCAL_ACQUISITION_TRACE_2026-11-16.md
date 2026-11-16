# Exact local pool acquisition trace — 16 November 2026

## Method and boundaries

Built a diagnostic-only PostgREST 14.8 from upstream commit
`9f722e0799a1c496149cac7db6993415b4591a4b`, with two small source changes:
`App.hs` labels the student login RPC, and `AppState.hs` wraps `SQL.use`.
A monotonic timestamp immediately before `SQL.use` is compared with a timestamp
at the first instruction of the acquired Hasql session. A third timestamp follows
`SQL.use` returning. This separates acquisition from connection use/release.
Acquisition includes connection establishment and runtime scheduling up to the
session callback; it is not exclusively time in a queue. Connection use includes
transaction execution and release, not just SQL execution.

Only fixed labels and numeric timestamps/durations are retained. No SQL text,
request arguments, student identifiers, session tokens or credentials are exported.
The 500 login events must be present exactly once in the captured workload; smoke
traffic occurs before capture. Client percentiles and API span percentiles are
independent distributions and cannot be subtracted to identify remaining stages.
There is no individual request correlation between the two sources.

The public source reference is:
https://github.com/PostgREST/postgrest/tree/v14.8

The build uses native Linux ARM64, Ubuntu 24.04, GHC 9.4.7 and Cabal 3.16.1.0.
The Cabal executable was verified against the official release SHA256SUMS; package
index signature verification remained enabled. Build artifacts and the complete
source diff are preserved privately at
`/Users/seanjohns/reliq-audits/postgrest-acquisition/`.

This custom toolchain/dependency resolution is not binary-identical to Supabase's
image. Per-use logging adds overhead, even though it occurs after releasing the
connection. Compare these runs only as instrumented local experiments; do not
attribute differences from earlier official-image runs to the source patch or
pool size. No diagnostic image is intended for deployment.

Diagnostic binary SHA256:
`94e636706cc9d6d8c1df981d8b29d3528f35267901b0835282a9e215dc0c6b60`.
Source patch SHA256:
`c8f5ff720680421647edc8c8a35c153ccb2cce7b8322bdd49440fdcfc1d1ea06`.

## Workload

Three fresh disposable APIs, in pool-size order 10 / 30 / 10. Each receives the
same 25-student smoke followed by 500 simultaneous synthetic students for 60 seconds
through the local gateway. Each workload exercises real anon student-session
authorisation with 100,000 historical events pre-seeded; teachers are provisioned
but do not generate concurrent traffic in this isolation test. No ramp or latency
threshold relaxation. The compiler is stopped before workloads run.

## Results

| Run | Login p95 ms | Login p99 ms | Acquisition p95 ms | Connection use p95 ms | Gate |
| --- | ---: | ---: | ---: | ---: | --- |
| pool10 | 1004 | 1151 | 415.285 | 18.491 | Fail |
| pool30 | 637 | 681 | 43.401 | 35.306 | Pass |
| pool10-repeat | 1051 | 1093 | 345.637 | 20.345 | Fail |

Every run completed 5,000 requests with zero failures, verified 500 presence
records and exactly 1,000 activity increments. Every API supplied exactly 500
login acquisition events. Aggregate evidence is in
`acquisition-trace-summary-2026-11-16.json`.

The 10 / 30 / 10 sequence supports acquisition waiting as a material contributor
in this custom runtime. The larger pool reduced waiting while connection-use
p95 increased, consistent with moving more work into the database concurrently.
One pool-30 pass is not proof of a stable tuning solution. Earlier official-image
comparisons were inconsistent; this build is not performance-equivalent to that
image. The first baseline missed the strict one-second p95 target by 4 ms; the
repeat missed by 51 ms. Neither has been rounded into a pass.

Next: validate the candidate on the official runtime with repeated controlled
comparisons and the mixed student/teacher workload. Preserve the existing
latency and integrity gates. Do not increase production pools or advance to
1,000 students solely on this diagnostic result.


## Verification and limits

Each runner restored the original API in a finally block. Final preflight passed,
including official runtime identity, automatic addressing, REST readiness and
gateway capacity. Restored 25-student / 175-request smoke passed with exact writes.
Node 24 syntax and targeted QA ESLint checks passed for the runner change;
`git diff --check` passed. No release build is required for the timestamp-only
diagnostic script change. Diagnostic compiler containers are stopped and disposable
API clones removed; originals and build artifacts are retained for recovery.

No application source, lessons, visuals, database schema, grants or hosted settings
changed. The sole runner change records the workload start timestamp in its report.
These results do not establish 500-student mixed-load readiness or 10,000-user
capacity. Browser rendering, realtime delivery, full teacher snapshots, canonical
lesson/assessment completion, a long soak and cloud resource parity remain outside
this particular test. Earlier official-image pool-size comparisons were inconsistent.
