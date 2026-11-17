# 10,000 simultaneous users: acceptance work

Reviewed 16 November 2026 against `627cc7d4`. Target: 10,000 simultaneously
active students, plus teacher traffic. This is not a claim of supported capacity.

## Application startup reconciliation — 18 November

The live panel now reconciles its saved event snapshot when the database stream
reports readiness. Controlled execution of the actual panel wiring verifies
immediate, non-overlapping recovery, visibility handling, duplicate readiness and
normal refresh throttling. See `REALTIME_RECOVERY_FINDING.md` for implementation
and the separate local diagnostic, which still reproduces the raw notification
gap while recovering all saved markers. No migration or hosted settings change.
Browser and concurrent-load verification remain open. Next performance work is
the unresolved 500-student simultaneous-start/save latency gate; 10,000-user
capacity is not established.

## Automatic transport recovery and startup finding — 17 November

The recovery runner now has a loopback-only socket-fault mode. Three warm runs
automatically rejoined the same private channel in roughly 6.5–6.6 seconds after
restoration, with complete, duplicate-free snapshot recovery. A healthy fresh
local service reproduced the earlier notification issue: an event saved after
channel join but before Postgres Changes readiness missed live delivery, while
the post-readiness event arrived. The persisted event was recovered by snapshot.
The failed initial-delivery gate is retained; this is a diagnosed local startup
gap, not a released fix. One premature-service-start join failure is also recorded.

No production code or hosted settings changed. Next: verify readiness-triggered
snapshot reconciliation without weakening the existing refresh limits or polling.
See `REALTIME_RECOVERY_FINDING.md` and `socket-reconnect-2026-11-17.json` for all
seven outcomes, exact timestamps, restoration and testing limits. Physical browser
network loss, concurrent reconnects and hosted capacity are still unverified.

## Private reconnect recovery checkpoint — 17 November

The existing recovery test now exercises the current incremental reader and
private teacher topic. It verifies missed-event polling, rejoin reconciliation,
class/student isolation and duplicate-free snapshots over more than 5,900 events.
One initial notification missed its five-second deadline; its cause remains
unresolved. Two unchanged repeats and two final-reporting runs passed. The test
now records channel statuses and continues polling checks after a notification
miss, while still failing the delivery gate. No timeout was relaxed.

Prepared channel policies were applied and restored locally only. No application
or hosted configuration changed. This is controlled unsubscribe/rejoin, not a
physical network interruption or concurrent reconnect capacity result. See
`REALTIME_RECOVERY_FINDING.md` and `private-reconnect-2026-11-17.json`; the earlier
500-student latency failure and 10,000-user acceptance gates remain open.

## Completion retries and private realtime — 17 November

Extended the existing completion runner to accept `SCALE_GROUP_COUNT=4..20`
(default four), validate distinct fixture identities and use the application's
private `live-class-<UUID>` topic. This avoids a second save/retry implementation.
The 100-student output name remains unchanged; larger runs use a count suffix.

An initial private subscription failed before any student writes because the
isolated local database had no `realtime.messages` policies. Both the existing
`supabase/manual/screen-sharing-retirement/prepare.sql` policies and class index
were temporarily applied locally for these runs, then removed and their original
absence verified. The final runner uses the exact app topic, not the earlier
test-only public topic. No hosted settings were inspected or changed.

| Scenario | Verified students | Expected access denials | Live event p95 / maximum | Whole latency gate |
| --- | ---: | ---: | ---: | --- |
| 100 students / 4 teachers | 100 | 600 | 578 / 831 ms | Pass |
| 500 students / 20 teachers | 500 | 3,000 | 1,557 / 2,590 ms | Fail |
| 500-student retake repeat | 500 | 3,000 | 1,483 / 2,845 ms | Fail |

Every student submits pretest, three ordered lessons, weekly quiz and posttest.
Each completion is sent twice concurrently with the same completion key. Secure
reads verify exactly three new lesson attempts, one quiz attempt, two assessment
attempts, preserved lesson scores and exact daily XP deltas. Retakes are saved
without paying lesson/quiz XP again. Missing-session and cross-student lesson
writes are denied. Each teacher sees the expected canonical pre/post scores and
receives every student's explicit completion marker within the five-second gate.
This checks delivery, not exactly-once WebSocket semantics or the entire Live
Class refresh workflow. The teacher subscription is established before writes.

The two 500-student runs each completed 11,000 expected student RPC requests with
zero failed requests or journeys, plus 3,000 separately counted expected denials.
Teacher setup and final class-progress reads are outside that request count.
Lesson-save p95 was 1,427 / 2,015 ms; quiz-save p95 1,598 / 1,387 ms; assessment-save
p95 1,542 / 1,868 ms. Thus correctness passes but the unchanged p95 < 1 second /
p99 < 3 seconds gate fails. Repeating the same size checks retake correctness;
it does not authorize advancing to 1,000 students.

Only synthetic attempts, receipts, activity and sessions remain in the isolated
database. No app code, historical migration or permission rule was rewritten.
Syntax, targeted QA ESLint, invalid-group guards, completion-reward QA (23/23),
restored local preflight and the 25-student / 175-request smoke passed. No release
build was required for diagnostic-only changes. Evidence:
`completion-private-realtime-2026-11-17.json`; private runners and logs in
`/Users/seanjohns/reliq-audits/2026-11-17/completion-realtime/`.

Next: verify private-channel prerequisites in the approved hosted rollout and
exercise reconnect recovery using the current incremental reader/private topic.
Full containment remains pending as documented in `../SCREEN_SHARING_RETIREMENT.md`.
The standalone completion scenario still excludes simultaneous six-source
dashboard load, browser answering/rendering, other realms, long soaks and cloud
parity. The separate mixed workload's completion exclusion remains accurate.

## Indexed burst resource profile — 17 November

Two further 500-student / 20-teacher bursts used the class index and original
official runtime, adding connection samples every 50 ms, pool metrics every
250 ms, aggregate SQL deltas and container resource samples. The local resource
monitor now accepts a bounded `SCALE_MONITOR_INTERVAL_MS` (1,000–30,000 ms),
retaining its 30-second default. Samples record collection start/end times;
a one-second pause produced roughly three-second spacing because collection
itself takes time. No application source, hosted configuration or migration changed.

| Measurement | First run | Repeat |
| --- | ---: | ---: |
| Login p95 | 1,019 ms | 2,012 ms |
| Initial events p95 | 4,435 ms | 4,731 ms |
| Incremental events p95 | 322 ms | 139 ms |
| Peak outstanding pool requests in first 10 seconds | 588 | 550 |
| Largest observed transaction age in first 10 seconds | 45.874 ms | 42.900 ms |
| Peak sampled API CPU in first 10 seconds | 394.26% | 409.07% |
| Peak sampled database CPU in first 10 seconds | 132.49% | 126.71% |

Both runs failed the unchanged latency gates, with zero failed requests/journeys,
500 verified presence records and exactly 1,000 activity increments/new events
per run. Every new event was observed exactly once. Average login SQL execution
was 0.256 / 0.334 ms; event pages averaged 6.008 / 5.966 ms and authenticated
attempt reads averaged 2.733–4.215 ms. These are whole-profile aggregate SQL
durations, not request-correlated timings; they exclude connection waiting and
some transaction overhead. Planning and I/O timing settings remained disabled.

Outstanding pool requests include work already being served. They are not the
exact number waiting for a connection. Acquisition timeout counters did not
increase. The available-connection gauge briefly reported -1 in the first run;
retain this instrumentation anomaly rather than interpreting it as a physical
connection count. Connection samples include internal API activity and miss short
transactions. Idle/client-input and WAL waits were observed, without attribution
of any individual request's delay to those states.

CPU percentages count one core as 100%; four resource samples fell in each
first-ten-second window on the eight-CPU Docker VM. They do not prove CPU
saturation or spare capacity across the whole host. The load generator's event
loop p99 was 12 ms in both runs, but this alone cannot establish generator capacity.
Profiling adds overhead, so these results are not a controlled speed comparison
against the prior unprofiled runs. The consistent finding is short average SQL
execution alongside a burst of outstanding API requests, not a validated tuning fix.

Next: improve workload coverage for canonical saves/retries and realtime, and
prepare an isolated production-equivalent staging test before further runtime
tuning. Prior pool/runtime experiments already failed to establish a reliable
fix; another local parameter guess is not justified. Paid provisioning needs a
reviewed configuration/cost first. Never load-test the trial schools' production.

The local index was removed in cleanup and its original absence verified.
Restored preflight and the 25-student / 175-request smoke passed. Monitor syntax,
targeted QA ESLint, invalid-interval rejection and diff checks passed; both actual
runs exercised the new interval. No release build was needed for local diagnostic
and documentation changes. Aggregate evidence:
`indexed-burst-resources-2026-11-17.json`. Private runners, logs and numeric traces:
`/Users/seanjohns/reliq-audits/2026-11-17/indexed-burst-resources/`.

## Current dashboard burst versus staggered sign-ins — 17 November

Four isolated local 60-second runs used 500 synthetic students, 20 ordinary
teachers, 100,000 historical events and the production incremental event reader
at `f49898ae`. The new class index was present in every run. Official PostgREST
14.8, its existing pool configuration and eight Docker CPUs were unchanged.
Run order was burst / 30-second ramp / 30-second ramp / burst to check repetition
and reduce simple warm-up/order bias. This extends the earlier staggered test to
the current six-source dashboard workload; it is not a production benchmark.

| Run | Login p95 | Initial events p95 | Incremental events p95 | All endpoint latency gates |
| --- | ---: | ---: | ---: | --- |
| Burst 1 | 2,600 ms | 5,255 ms | 156 ms | Fail |
| 30-second ramp 1 | 6 ms | 726 ms | 182 ms | Pass |
| 30-second ramp 2 | 5 ms | 671 ms | 176 ms | Pass |
| Burst 2 | 2,346 ms | 5,142 ms | 137 ms | Fail |

Each run verified all 500 persisted presence records, zero failed requests or
journeys, exact activity increments and every newly emitted event exactly once.
One ramp emitted 999 increments/events rather than 1,000 because the fixed run
deadline also applies to students who start later; expected counts are measured
per student, not assumed. All gates retained p95 below 1 second and p99 below
3 seconds for every measured endpoint. No assertion or threshold was relaxed.

The repeated difference identifies simultaneous-start congestion as a remaining
problem in this local workload. It does not prove where all upstream waiting
occurs or that cloud capacity is sufficient. Do not insert artificial login
delays into the application to make a test pass. Next, measure resource headroom
and request waiting during the burst with the class index in place; any batching
or runtime candidate needs an unchanged-workload comparison and isolation checks.

Limitations: short runs, one laptop, no browser rendering or realtime delivery,
uneven historical completion fixtures and no canonical completion/retry workload.
These passing staggered runs do not supersede the failing simultaneous-start
gate or establish 10,000-user readiness. The application already coalesces live
refreshes; another refresh-control layer is not justified by this evidence.

Only diagnostic evidence and documentation changed. The temporary local index
was removed after the comparison, restoring its original local state. Restored
preflight and the 25-student / 175-request smoke passed. Existing event-reader and
dashboard-loading regression tests passed. No application build was repeated
for documentation-only changes, and no new hosted migration is required.
Aggregate evidence: `dashboard-ramp-summary-2026-11-17.json`. Private runner,
logs and per-request numeric traces:
`/Users/seanjohns/reliq-audits/2026-11-17/dashboard-ramp/`.

## Small index candidate — 17 November

A missing `students(class_id)` index caused the existing permission subplan to
scan roughly 503 students instead of selecting its 26 class students first.
A single-index migration is prepared; permissions and application code are
unchanged. Representative attempt-query execution fell from about 80 ms to
9–16 ms with identical results. A 500-student baseline/candidate pair preserved
all activity but both failed latency, so this is a targeted query improvement,
not a scaling sign-off. Local index experiments were rolled back. The owner
subsequently reported applying this migration to hosted Supabase; that application
has not been independently verified here. See
`LOCAL_STUDENT_CLASS_INDEX_2026-11-17.md`.

## Initial dashboard profile — 17 November

A profiled 500-student run preserved all 1,001 events/increments but still failed
latency. At least 99.41% of each initial event chain was inside response-header
waiting intervals; gateway upstream accounted for at least 93.85%. Attempt-history
permission subplans cost about 80 ms in representative authenticated query plans.
Temporarily removing the legacy permissive policies made those reads slower;
transactions rolled back and originals were verified. Investigate shared access-
scope evaluation with full role-equivalence checks, not policy deletion or pool
tuning. See `LOCAL_DASHBOARD_INITIAL_PROFILE_2026-11-17.md`.

## Incremental dashboard scenario — 17 November

Added a separate six-source periodic dashboard workload using the production
incremental event reader alongside secure student event writes. The 100-student
run and two 500-student runs preserved all activity and delivered all 2,200 new
events exactly once. All three failed latency. At 500, initial event p95 was
7,261 / 5,371 ms versus 585 / 437 ms for later incremental reads. Profile the
initial dashboard overlap next; realtime delivery and five-minute reconciliation
remain untested in this scenario. Canonical attempt fixtures are uneven across
classes, so completion-history volume coverage is limited. See
`LOCAL_INCREMENTAL_DASHBOARD_2026-11-17.md`. Production settings are unchanged.

## Official-runtime mixed validation — 17 November

Four fresh official PostgREST 14.8 local runs (pools 10 / 30 / 30 / 10) combined
500 students with 20 teachers. Every integrity check passed, but all four failed
the unchanged latency gate. The custom-runtime improvement therefore does not
justify production pool tuning. This workload repeatedly reloads full event
histories; add a separate scenario for the actual incremental dashboard plus
its associated reads, retaining this stress case. Original local API restored
and smoke passed. See `LOCAL_OFFICIAL_MIXED_2026-11-17.md`.

## Exact acquisition follow-up

A custom local PostgREST 14.8 build measured connection handoff directly. In a
10 / 30 / 10 pool sequence, login p95 was 1,004 / 637 / 1,051 ms and acquisition
p95 was 415 / 43 / 346 ms. All 15,000 requests and expected activity checks passed;
only the pool-30 run passed latency. This supports acquisition waiting as a
contributor in this diagnostic runtime, but the custom build differs from the
official image and earlier official-image comparisons were inconsistent. No
production tuning or 10,000-user capacity claim follows. Original API restored;
preflight and smoke passed. See `LOCAL_ACQUISITION_TRACE_2026-11-16.md`.

## Request-correlated timing follow-up

A temporary local response-header trace captured all 5,000 successful workload
responses. Login p95 was 2,747 ms; every login taking at least one second spent
at least 90.66% before the database transaction began, under the calibrated stable-
clock assumption. This localizes the delay before database execution but does
not isolate exact pool acquisition. Original API restored, hook removed and
smoke passed. See `LOCAL_REQUEST_TRACE_2026-11-16.md`.

## Higher-frequency connection profile

Two identical local student bursts gave login p95 676 ms (pass) and 2,175 ms
(fail). Both preserved all tested activity. 50 ms connection samples observed
short database transactions and pool counters reached roughly 490 outstanding
requests, including work in service. This narrows the next investigation but is
not per-request acquisition timing or a proven fix. See
`LOCAL_CONNECTION_PROFILE_2026-11-16.md`. Mixed-load capacity remains unverified.

## Gateway comparison follow-up

Four matched local bursts (gateway/direct/direct/gateway) preserved all activity.
Gateway login p95 was 1,808 and 2,233 ms; direct was 1,902 and 886 ms. Only the
second direct run passed. Bypassing the gateway does not reliably remove the
latency, and local variability remains material. Original container restored;
preflight and smoke passed. See `LOCAL_GATEWAY_COMPARISON_2026-11-16.md`.

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
