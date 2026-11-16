# Isolating the local 500-student latency failure

16 November 2026. Three sequential local-only runs; no application or production
changes. Existing runtime/schema/gateway preflight passed. Same 500 synthetic
students, 20 school/class groups, 100,000 historical events and existing latency
thresholds. Each run lasted approximately 60 seconds (original mixed run 121).

| Scenario | Login p95 / p99 | Teacher history p95 / p99 | Gate |
| --- | --- | --- | --- |
| Earlier mixed burst, 500 students + 20 teachers | 2,465 / 3,286 ms | 293 / 5,752 ms | Fail |
| Student-only simultaneous burst | 2,853 / 3,870 ms | No teacher workload | Fail |
| Teacher-only, 20 full-history readers | No student workload | 287 / 317 ms | Pass for this isolated scenario |
| Student-only logins evenly spread over 30 seconds | 6 / 7 ms | No teacher workload | Pass for this isolated scenario |

All three runs had zero request/journey failures. Student burst verified 500
presence records and 1,000 exact activity increments. Ramped run verified 500
presence records and 1,002 increments. Teacher-only verified 575 full snapshots,
with 6,354 snapshot HTTP requests. Each scenario still checks ordinary-teacher
cross-school denial before load; teacher authentication in student-only scenarios
is preparation, excluded from measured operations.

## Interpretation

Heavy teacher reads are not required to reproduce the slowdown. Spreading student
arrivals avoids it in this local environment. This is evidence of burst sensitivity,
not proof of a particular database query or infrastructure bottleneck. No artificial
login delay was added to the product, and no acceptance threshold was relaxed.
The simultaneous mixed-load gate remains failed; do not advance to 1,000 yet.

These short sequential runs are not replicated controlled benchmarks. Local cache,
client event-loop/connection scheduling, API queuing, database and shared Docker
resources remain possible contributors. The ramp has all students started only
halfway through the test and has no concurrent teacher workload; it cannot replace
the mixed bell-time test. The common test deadline also generates a burst of final
verification reads (ramp daily-activity read p95 777 ms).

Current LiveClassPanel uses createLiveClassEventReader and 30-second scheduling;
this runner's full-history-every-two-seconds reads remain an explicitly heavier
stress case. No UI reader was changed. Canonical completion/retries, realtime,
full dashboard queries, browser/3D performance, sustained load and managed-cloud
resources remain outside these runs.

## Runner changes and checks

SCALE_SCENARIO accepts mixed (default), students-only or teachers-only.
SCALE_LOGIN_RAMP_SECONDS accepts integer 0–30 (default 0); teacher-only rejects
nonzero values. Separate output filenames preserve the original mixed failure.
Defaults still exercise the original unmodified burst scenario. Local URL and
identity guards remain; no remote target option was added.

Syntax, explicit QA ESLint and diff checks passed. Five invalid scenario/ramp
configurations were rejected before traffic. No release build is necessary for
these test-only changes. Aggregate JSON files are alongside this report; private
logs are under /Users/seanjohns/reliq-audits/2026-11-16/capacity-isolation/.

## Next

Instrument the original simultaneous student burst with client scheduling and
higher-frequency API/database measurements; distinguish queueing from execution
time before making an app/schema change. Retain the failed mixed-load evidence
and rerun that exact gate after any verified fix. No new cloud costs or deployment
are required for the current local investigation.
