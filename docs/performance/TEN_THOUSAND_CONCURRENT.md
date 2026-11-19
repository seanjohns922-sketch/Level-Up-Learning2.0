# 10,000 simultaneous users: acceptance work

Reviewed 16 November 2026 against `627cc7d4`. Target: 10,000 simultaneously
active students, plus teacher traffic. This is not a claim of supported capacity.

## Incremental refresh validation and existing-index status — 19 November

**The class index is existing work, not a newly discovered production fix.**
Migration `20261117090000_index_student_current_class.sql` was committed in
`f49898ae`. The 17 November ramp report records the owner's statement that it had
been applied; the hosted catalog has not been independently verified. Recent
unindexed baselines intentionally used local fixtures with the index removed.
Do not present the indexed/unindexed difference as a new deployed improvement,
create a duplicate migration, or ask the owner to reapply it without checking.

`scripts/staging/incremental-dashboard-local.mjs` now exercises the actual shared
`createLiveClassEventReader` against local HTTP data for 20 synthetic teachers.
It checks initial loading, unchanged history, 20 students' new completions and
events at the next 30-second refresh, then explicit cache invalidation/recovery.
The same phases run without and with a temporary equivalent of the existing
class index. Each completion is submitted twice with one completion key.

| Phase | Unindexed local baseline p95 | Existing-index equivalent p95 |
| --- | ---: | ---: |
| Initial read | 2,550 ms | 467 ms |
| Unchanged history | 2,250 ms | 401 ms |
| New results at next refresh | 2,471 ms | 589 ms |
| Invalidated/recovery read | 2,498 ms | 559 ms |

All 40 completions across the two modes were saved exactly once with correct
scores. Every teacher saw the new canonical attempt and event, with no foreign
student rows or duplicate cached events. Quiet refreshes issued exactly one event
head request per teacher (20 total); other phases used 40 event requests each.
The indexed phases passed the one-second p95 / three-second maximum gate for
this workload. Temporary functions and index were verified removed.

This is **not** a browser or WebSocket rehearsal. Read and invalidate triggers
are controlled, the quiet-head check is immediate, and writes finish before the
next 30-second refresh. It does not exercise the UI's full coalescing/timer wiring
or writes during pagination. The existing event-read and refresh QA suites also
passed, covering burst coalescing, late events, failed deltas and invalidation
races. Node syntax, targeted ESLint and diff checks passed; production code was
not changed and no production build was needed.

The attempt reads here are fully paginated. The current `LiveClassPanel` still
issues unpaginated attempt queries, so this rehearsal does not establish complete
history in the shipped UI. That row-limit gap is the next implementation target:
reuse ordinary RLS reads with pagination and preserve visible results on a failed
page, rather than introducing the scoped authorisation prototype. Keep the
earlier mixed-write stress failures open; 10,000-user capacity is not proven.
Evidence: `docs/performance/incremental-dashboard-2026-11-19.json`.

## Mixed-load query profile and class index experiment — 19 November

The review branch now includes redacted query categories and blocker counts in
the 50 ms connection sampler, plus a separate category for the scoped-attempt
probe in the SQL profiler. A 90-second local profile alongside the same workload
captured 1,801 connection samples. Most active samples concerned the three
attempt tables (1,237 of 1,400 active connection observations). There were two
transaction-ID lock observations, only one with a reported blocker. The maximum
sampled active query age was 373 ms. These observations make widespread lock
contention a weaker explanation for this run; sampling cannot rule it out.

Authenticated SQL execution averaged 202 ms for lesson attempt reads, 212 ms for
quiz attempts and 130 ms for assessment reads. Compact event pages averaged 43 ms;
student lesson completion SQL averaged 5.6 ms. Planning/I/O timing collection was
off. SQL averages exclude API queueing and cannot be subtracted from HTTP p95 to
calculate pool wait. The profiled workload failed on a dropped local connection
after 99 completed submission pairs; all 60 dashboard snapshots finished, at
4,209 ms p95. Docker/Postgres start metadata showed no service restart. This
failure remains in the evidence, rather than being described as a passing run.

A separate authenticated `EXPLAIN ANALYZE` of the first lesson-attempt page took
92 ms. Its existing attempt-scope index found 1,608 rows quickly, while the nested
legacy permission subplan spent about 87 ms scanning the students table (26 rows
kept, 477 filtered). Plan structure/timings are recorded without SQL or IDs.

`scripts/staging/indexed-dashboard-mixed-local.mjs` then temporarily created a
`students(class_id)` index, ran the same complete mixed workload, and dropped the
index in `finally`. It changes no access policy, grant, function body or student
identity. This is a local experiment, not a migration or application integration.

| Read mode with temporary index | Dashboard p95, rounds 1 / 2 | Completion/retry pair p95, rounds 1 / 2 |
| --- | ---: | ---: |
| Existing direct attempts + compact events | 1,321 / 1,215 ms | 949 / 809 ms |
| Scoped attempt prototype + compact events | 1,357 / 1,419 ms | 880 / 838 ms |

All 400 correct completions, 400 live events and 800 expected denials passed;
post-write attempt reads matched direct RLS. The index and temporary functions
were confirmed removed. Compared with the earlier unprofiled direct results of
4,749 / 5,669 ms p95, this is a promising simpler optimisation. It does **not** meet
the one-second latency gate, and the scoped prototype did not improve on direct
reads in this indexed run. Do not introduce the more complex API solely on the
earlier SQL-only speedup. Next, confirm the index on staging with representative
data and assess the real incremental dashboard refresh path before deciding
which changes to release. Index build time/storage and student/class write costs
also need checking before production adoption.

Evidence: `docs/performance/mixed-query-profile-2026-11-19.json`. Profiling adds
overhead; index results were collected without profilers. Fixtures retain prior
synthetic completions, so these are local diagnostic comparisons, not a controlled
hosted capacity test. Syntax, targeted ESLint and diff checks passed. No production
change, migration, application build or 10,000-user claim is included.

## Mixed dashboard and student completion rehearsal — 19 November

`scripts/staging/scoped-dashboard-mixed-local.mjs` tests all six dashboard read
sources alongside 100 synthetic students across 20 classes. Each student sends
a lesson completion twice with the same completion key, followed by a live event.
Missing-session and cross-student writes must fail explicitly with `42501`.
Login happens before measured traffic. Twenty teachers each perform three fresh
HTTP snapshots per mode, with two rounds alternating direct/scoped attempt reads.
Both modes use compact events. This is an intentionally concentrated refresh
workload, not a recreation of the panel's 30-second timer, incremental event cache
or realtime rendering. The direct comparison retrieves all paginated attempts,
whereas the current panel still uses unpaginated attempt queries.

The first complete run verified 400 saved completions with correct scores, despite
800 completion submissions, and 800 expected access denials. Each mode overlapped
student traffic. After writes drained, all three complete attempt sets matched
direct RLS on a fresh read. This confirms recovery after writes settle, not an
atomic snapshot while writes are in flight.

| Mode | Round 1 dashboard p95 | Round 2 dashboard p95 | Completion/retry pair p95 |
| --- | ---: | ---: | ---: |
| Direct attempts + compact events | 4,749 ms | 5,669 ms | 2,800 / 3,588 ms |
| Scoped attempts + compact events | 1,569 ms | 2,069 ms | 880 / 1,274 ms |

**The latency gate failed.** A subsequent instrumented run also failed in the
first direct-read round with `PGRST003`, rather than the expected access-denial
response. This is a connection-pool acquisition timeout, as documented by
[PostgREST](https://docs.postgrest.org/en/stable/references/connection_pool.html).
It must not be counted as a successful permission check or hidden by a retry.
The completed run and failed repeat are both preserved in
`docs/performance/scoped-dashboard-mixed-2026-11-19.json`.

A further diagnostic repeat also timed out in the first direct round. Only 21
dashboard snapshots completed: their source p95 times were 14,391 ms for attempts,
13,072 ms for events, 8,085 ms for daily activity and 3,004 ms for presence. These
are survivor-only samples, not successful workload percentiles. Seventy duplicate
submission pairs completed before failure. These timings include API queueing;
they do not identify a slow SQL statement or prove lock contention. Both failed
repeats stopped before the scoped round, so neither measures scoped-mode failure.
Next, collect SQL execution and wait-state evidence during this exact workload
before choosing a query change or connection-pool setting. Do not increase
timeouts to turn this failure into a pass.

The runner shares the preceding probe's SQL and pagination code through an
import-safe entry point. It drains requests before cleanup, removes the temporary
read functions, and retains only local synthetic completions/events/sessions for
later rehearsals. No production data, application behavior, grants or migration
changed. Node syntax, targeted ESLint and diff checks pass. A production build was
not rerun for these test-only changes. This does not prove 10,000-user capacity.

## Paginated attempt API experiment — 19 November

`scripts/staging/scoped-attempts-http-local.mjs` extends the SQL experiment below
through the actual local PostgREST API. It temporarily installs a uniquely named
read function, authenticates 20 synthetic teachers, and removes the function in
`finally`. It refuses to overwrite an existing function. No migration, application
integration, production data or production permission changes are included.

The function checks the complete student scope on every request and returns at
most 500 rows per attempt table. Three UUID cursors paginate the fixed projections.
The direct-RLS comparison also paginates all results: neither side silently stops
at the API's row limit. The first class contained 1,569 lesson, 523 quiz and 1,046
assessment rows. A separate 37-row-page test took 43 requests and matched the
complete direct results without duplicates. Duplicate and empty scopes passed.
Anonymous execute was denied; mixed-school, null and unknown-student scopes
returned only `supported:false`; invalid bounds and cursor shape were rejected.

Three alternating-order rounds at each concurrency level matched every complete
result set (150 snapshots across both modes):

| Concurrent teachers | Direct reads p95 | Scoped reads p95 |
| --- | ---: | ---: |
| 1 | 446 ms | 144 ms |
| 4 | 1,042 ms | 197 ms |
| 20 | 2,427 ms | 426 ms |

At 20 teachers, the 60 snapshots used 348 direct requests versus 144 scoped
requests. Maximum snapshot latency was 2,541 ms versus 494 ms. Evidence:
`docs/performance/scoped-attempts-http-2026-11-19.json`. Node syntax, targeted
ESLint and diff whitespace checks passed. The temporary function was confirmed
absent after cleanup; fixture records were not changed.

These are the three attempt sources only, with static fixtures on one local
machine. They do not measure a full dashboard, student writes, browser rendering,
hosted latency or 10,000-user capacity. UUID pagination does not provide a frozen
snapshot under concurrent inserts or updates. Before application integration,
test the complete dashboard with compact events and student writes, and extend
HTTP coverage to legacy access, individual assignments and access revocation
between pages. An unsupported response must discard accumulated candidate data
and use the original RLS reads for the whole scope; an arbitrary error must not
trigger fallback. That production client behavior is not implemented by this
experiment.

## Shared authorised attempt scope prototype — 19 November

`scripts/staging/scoped-attempts-local.mjs` tests a local SQL prototype that checks
`can_view_student_learning` once for each requested student, then reuses that
authorised list for the lesson, quiz and assessment reads. It returns only the
columns requested by the existing dashboard. All functions live in `pg_temp`;
membership experiments run inside rollback transactions. There is no public API,
application change, migration or production permission change.

The prototype supports only explicit lists of at most 500 IDs. It deduplicates IDs
and supports an empty list. If any requested student is missing or unauthorised,
or an element is null, it returns `supported:false` with **no data**. That is an
explicit compatibility signal: a future client would use the original RLS reads
for the whole request, preserving legacy access semantics. It must never treat an
unsupported scope as an empty successful dashboard. Missing authentication is an
error; anonymous execute is revoked. Arbitrary errors must not trigger fallback.

The final rollback-only run passed 147 cases:

- 80 own-class comparisons across 20 synthetic teachers, with baseline/candidate
  order alternated equally. All three complete projected result sets matched.
- 20 mixed-school scopes declined without returning data; 20 empty and 20
  duplicated-ID cases retained the existing query semantics.
- Support, principal, school-admin and platform-admin cross-school reads matched
  direct RLS. Revoked membership, null elements and unknown students declined.
- Additional assertions rejected null/oversized lists and missing identity, and
  verified that anonymous execute was not granted.

Mean time for the **combined three SQL reads**, including deterministic JSON
aggregation, was 259.974 ms for direct RLS versus 28.316 ms for the prototype
(about 9.2x faster). An initial 124-case run measured 257.209 versus 28.009 ms.
These are sequential local SQL measurements, **not concurrent HTTP latency or a
production capacity result**. Both sides return the same projected rows; the
prototype avoids repeated per-attempt authorisation work.

Next: validate the compatibility fallback with actual API roles, legacy ownership,
individual assignments and assignment revocation; resolve transport pagination
(JSON arrays do not inherit PostgREST's row limit); measure the complete six-source
dashboard under concurrent teacher and student load. Keep production unchanged
until those checks pass. This prototype is not a migration ready to apply.

Summary: `docs/performance/scoped-attempts-probe-2026-11-19.json`. Full local evidence:
`/Users/seanjohns/reliq-audits/2026-11-19/scoped-attempts/scoped-attempts-result.json`.
Run the absolute script path with Node 24 from the checkout containing the isolated
local fixtures. Targeted ESLint, Node syntax and whitespace checks passed.

## Compact workload database profile — 19 November

The existing local transaction profiler now labels compact-event RPC statements
separately. A profiled repeat of the six-source benchmark preserved activity,
scores and student scope, removed its 55,000 temporary events/functions, and again
missed the latency gate: 20-teacher compact p95 1,687 ms versus full 2,217 ms.
Timing varies between local runs; this is not a new production speed claim.

Authenticated statement execution averages across the whole run:

| Source | Calls | Mean SQL execution (ms) |
| --- | ---: | ---: |
| Lesson attempts | 150 | 209.950 |
| Quiz attempts | 150 | 208.690 |
| Assessments | 150 | 216.213 |
| Compact event page | 75 | 60.756 |
| Full event page | 1,350 | 3.384 |
| Presence | 150 | 9.497 |
| Event head | 150 | 9.328 |
| Daily activity | 150 | 1.155 |

These are aggregate SQL averages across both modes and all concurrency stages,
not p95s or per-request traces. They must not be subtracted from HTTP p95 to infer
pool wait. Planning and I/O timing collection were off. Attempt-query execution
is substantial, while HTTP also includes waiting/transport; exact pool acquisition
has not been isolated by this run. Prior larger-pool experiments were mixed, so
there is still no evidence here to change production connection settings.

A rollback-only experiment rewrote the three legacy teacher policies from a
correlated `EXISTS` to an equivalent student-ID `IN` subquery, retaining the same
teacher ownership predicate and leaving all school-staff policies intact. Across
20 synthetic teachers and three tables, all 60 visible-row digests matched.
Mean sequential query execution barely changed: lessons 82.54 to 80.53 ms,
quizzes 78.99 to 78.91 ms, assessments 81.69 to 79.27 ms. **Candidate rejected**;
all original policy definitions were verified restored. This was not a complete
role/revocation matrix and is not approved for a migration.

Next candidate: evaluate student authorisation once per requested student scope,
then reuse that scope across the attempt reads. Before any release, prove parity
for teacher, support, principal, admin, legacy and revoked access, including
cross-school denials, and measure the whole concurrent HTTP workload. Avoid
repeated policy rearrangements without a changed query plan or measured benefit.

Sanitized evidence: `docs/performance/compact-dashboard-profile-2026-11-19.json`.
Private reproducible probe and raw numeric evidence:
`/Users/seanjohns/reliq-audits/2026-11-19/dashboard-profile/`.
No application source, database migration, production policy or hosted setting
changed. The only tooling change is the profiler's compact-RPC label.

## Concurrent compact dashboard reads — 19 November

Added `scripts/staging/compact-dashboard-load-local.mjs`. It compares six dashboard
read sources at 1, 4 and 20 concurrent teachers (25 students per class), with three
alternating full/compact rounds. The isolated local API contains 500 synthetic
students; these students are **not concurrently writing** during this test.
55,000 temporary events model ten attempts per student, each with a start and ten
answers. The runner checks that the compact path exists, preserves the latest
eleven events per student, keeps all canonical evidence and class boundaries, and
produces identical activity/performance with the actual UI reducers. It does not
render the browser or reproduce every panel query.

Final measured snapshot p95 (milliseconds):

| Concurrent teachers | Full history | Compact | Under 1 second |
| --- | ---: | ---: | --- |
| 1 | 203 | 142 | Yes |
| 4 | 541 | 430 | Yes |
| 20 | 3,394 | 2,048 | **No** |

Across the 60 snapshots in each 20-teacher mode, event payloads fell from
169,693,608 to 7,228,560 serialized UTF-8 bytes (95.7%); HTTP requests fell from
1,440 to 420. All 150 snapshots passed equivalence and data-scope assertions.
The runner deliberately exits non-zero because the 20-teacher latency gate fails.
An earlier realistic-event run also missed the gate (compact p95 2,197 ms).

Per-source HTTP timings in the final compact run were presence 1,492 ms, events
1,936 ms, lessons 1,948 ms, quizzes 1,960 ms, assessments 1,881 ms and daily activity
1,746 ms. This suggests shared concurrency pressure rather than an event-only
bottleneck; these timings include queueing/transport and do not identify its cause.
Next: profile query plans and API/connection wait under this exact workload before
changing pooling or consolidating requests. Larger classes, concurrent student
writes, hosted hardware and 10,000-user capacity remain unverified.

Results: `docs/performance/compact-dashboard-load-2026-11-19.json`. Reproduce with
Node 24 by running the absolute path to the new script from the checkout containing
the isolated `.local-archive/scale-local` fixtures. It rejects hosted URLs and
pre-existing compact functions, removes only randomly marked test events, drops
temporary functions, and verifies restoration in `finally`. Cleanup passed.
Targeted ESLint (`--no-ignore`) and Node syntax checks passed. This change contains
only test tooling and evidence: no application change, new migration or deployment.

## Compact Live Class read implemented — 18 November

The panel now opts into `get_live_class_compact_event_page_secure`. Migration
`20261118120000_compact_live_class_event_reads.sql` adds two read-only functions;
it changes no tables, historical events, RLS policies or student progression.
The endpoint requires an authenticated user and the existing `can_view_class`
authorisation. Its private payload-predicate helper has no client execute grant.

The SQL implementation uses a safe superset of the earlier two-stage probe:
retain each student's latest attempt **for every activity key**, plus their latest
meaningful activity event. Keep all matching events when no start exists. This
preserves stale-row and legacy-title fallbacks without coupling SQL to the resolved
UI row. Exact payload types and JS millisecond tie ordering are preserved.
The UI calculations are unchanged. Other event readers and latest-15 timelines
continue to request full history.

The existing bounded keyset reader still retrieves every selected page. Its cache
tracks the scanned upper cursor even when that event is omitted by selection.
New starts append a tail that the existing reducers interpret; old attempts can
remain in the cache until reconciliation without affecting the latest-attempt
result. Realtime mutations, late inserts and reconnections invalidate the cache;
the five-minute complete refresh also repairs missed changes. A missing new RPC
falls back to the previous secure page endpoint. Denials and timeouts never fall
back or publish partial data.

Validation in the isolated local database/API:

- 409 actual SQL selections matched the production activity/performance reducers:
  36,410 input rows versus 8,315 returned rows across the synthetic cases.
- Role/revocation matrix passed, with actual HTTP denials for anonymous and
  unauthorised callers. Empty filters, malformed cursors and numeric/string
  predicate edge cases passed.
- Real API/client comparison: 1,345 rows / 375,194 serialized bytes became
  11 rows / 3,073 bytes, with identical displayed activity and performance.
- Five alternating sequential reads: full 201/200/207/201/200 ms; compact
  195/197/198/202/207 ms. This demonstrates a payload reduction, **not a latency
  improvement**. SQL still examines history and recomputes selection per page;
  larger-class/concurrent measurements remain necessary.
- Reader tests cover complete pagination, omitted newest events, empty selection,
  late inserts, missing-migration fallback and fail-closed errors. Existing
  invalidation, periodic repair and in-flight race tests also pass.

Release verification: 17/17 critical checks, QA lint, targeted test-script lint,
standalone typecheck and the full production build (including prebuild audits)
passed. No visual styles, learning content or progression rules changed.

Reproduce SQL/API checks from the checkout containing the isolated local fixture
configuration, using the absolute path to `scripts/staging/compact-events-local.mjs`
with `node --experimental-strip-types`. The runner rejects non-local API settings,
rolls back SQL fixtures, and removes temporary API functions/events in `finally`.
No hosted migration has been applied. For rollback, drop the compact endpoint
before its helper; the app will use the previous secure endpoint. Browser visual
inspection and 10,000-user capacity have not been established by these checks.

## Compact event-selection probe — 18 November

Added `scripts/live-class-projection-test.mjs`, a design probe that executes the
actual `LiveClassPanel` activity and performance reducers extracted with the
TypeScript parser. It does not change the production reader or database.
Run with `node --experimental-strip-types scripts/live-class-projection-test.mjs`.

The candidate is a two-stage read: retain the latest meaningful activity event,
resolve the current activity using unchanged presence/canonical-attempt/daily
rules, then select matching events from the latest lesson/quiz start onward.
Retain the meaningful event even when it falls outside that selected attempt.
Preserve original ordering and timestamp ties. If there is no matching start,
retain every matching event. The full-history and candidate reducers must produce
identical resolved activity rows and performance summaries.

409 comparisons pass, including 400 deterministic generated mixtures, retries,
duplicate answers, same-title quizzes with distinct IDs, timestamp ties, backdated
ordering, missing metadata/start events, canonical completion superseding telemetry,
row fallback, daily-only activity, cross-student rows and pagination boundaries.
A reviewed 100-repeat fixture selects 11 of 1,100 events with unchanged 5/10 score.
Serialized fixture size falls from 213,701 to 2,138 bytes. This is potential payload
reduction in one synthetic case, not measured HTTP or browser improvement.
Missing-start history retains 1,000 answers; a long single attempt retains 1,201
events. Therefore a fixed latest-N limit would still be incorrect. Complete keyset
pagination remains necessary even for the compact read.

Targeted QA lint, the executable probe and whitespace checks passed. No migration,
application code, role boundaries or hosted settings changed; no release build
is needed for this test-only checkpoint. The probe currently receives full history
in memory, so the live dashboard has no request/payload reduction from it yet.

Implementation gate: translate both selections into authenticated, class-scoped
reads and compare database results against these reducers. Preserve the exact
payload-type/string/number predicates and tie ordering used by the UI. Fix a
snapshot upper cursor across the two stages; test concurrent new starts, late
commits, deletion/update, role revocation, empty students, rollout fallback and
API row caps. Do not fall back on permission errors. Avoid reusing the existing
incremental-history cache without addressing changes to the selected attempt.
Only switch the panel after SQL/API permission tests and representative local
payload/latency measurements pass. These fixture comparisons do not prove
arbitrary production equivalence or 10,000-user capacity.

## Standard API completion pool comparison — 18 November

Repeated the completion workload on the exact same standard Supabase PostgREST
v14.8 image ID at pool sizes 10 / 30 / 10. Each disposable API inherited the
original configuration with only `PGRST_DB_POOL` overridden. No custom binary,
timing hook or tracing headers were enabled. Each received the same 25-student
smoke before the 500-student / 20-teacher workload.

| Pool / run | Login p95 ms | Lesson save p95 ms | Quiz save p95 ms | Assessment save p95 ms | Gate |
| --- | ---: | ---: | ---: | ---: | --- |
| 10 | 2,288 | 2,047 | 2,712 | 2,107 | Fail |
| 30 | 2,212 | 1,050 | 1,931 | 1,847 | Fail |
| 10 restored | 3,717 | 2,033 | 2,720 | 2,600 | Fail |

Each run verified all 500 completion journeys, canonical teacher results and
realtime events. All 11,000 measured RPC requests succeeded; all 3,000 expected
access denials passed. Duplicate requests did not duplicate attempts or rewards.
The original strict p95/p99 and event-delivery gates were unchanged.

Pool 30 improved completion timings in this sequence, especially lessons and
quizzes; those timings increased again at 10. Login timings did not improve
materially against the first baseline, and all secure before/after student-read
p95 values were worse at 30 than in that first run. This supports a limited
completion-workload benefit, not a sufficient or universal remedy. Do not promote
the setting to hosted Supabase: every run still failed overall, local variation
is substantial, and retakes grow synthetic history. Earlier inconsistent mixed-
dashboard comparisons remain relevant contrary evidence. No additional blind
pool-size sweeps are warranted by this checkpoint.

The original API container and automatic networking were restored after every
run. Temporary local class index and four private-channel policies were removed
and their absence verified. Final local preflight and 25-student / 175-request
smoke passed. Report validation checked the identical image ID, all expected
counts and restoration logs. Only documentation/evidence changed in this checkout;
no application build, migration or production setting change is required.

Evidence: `completion-official-pools-2026-11-18.json`. Private runner and complete
logs: `/Users/seanjohns/reliq-audits/2026-11-18/completion-official/`.
This is not a cloud-capacity, browser or long-soak test. The workload excludes
concurrent six-source dashboard refreshes. 10,000-user capacity remains unproven.

Next code investigation: a compact current-attempt event read for Live Class,
with equivalence tests against the existing full-history reconstruction before
replacing it. Preserve fallback behaviour, repeat attempts, late events, score
semantics and all role boundaries. This targets independently measured dashboard
request volume; it must not be presented as a proven fix for student-only bursts.

## Completion acquisition comparison — 18 November

Four custom-runtime traced runs at pool sizes 10 / 10 / 30 / 10 all preserved
500 completion journeys, retries, XP and teacher results, but all failed latency.
Increasing to 30 reduced acquisition waiting; returning to 10 increased it again.
Connection-use time increased at 30 and HTTP latency still failed, so this is a
measured contributor rather than a released fix. No hosted setting changed.
Next: verify this completion-specific comparison on the official API runtime;
do not assume the custom diagnostic binary predicts hosted performance.
See `LOCAL_COMPLETION_ACQUISITION_2026-11-18.md` and its JSON evidence for counts,
limits, restoration and the passing final smoke. No migration is required.

## Completion SQL profile — 18 November

One instrumented 500-student / 20-teacher completion burst preserved all 500
journeys, canonical teacher results and realtime events. All 11,000 measured
requests succeeded; 3,000 expected access denials were verified. Concurrent
retries saved each attempt once and did not duplicate XP. The latency gate still
failed: login p95 5,162 ms, lesson saves 1,937 ms, quiz saves 2,896 ms and assessment
saves 2,386 ms. Realtime maximum was 4,646 ms. These worse timings are not a
controlled regression comparison: profiler overhead, accumulated synthetic
history and local resource variation differ from earlier runs.

The aggregate transaction profiler now distinguishes all three completion RPCs,
their secure student reads and canonical teacher progress. SQL execution averages
were 5.083 / 5.587 / 5.649 ms for lesson / quiz / assessment saves, respectively,
across the exact 3,000 / 1,000 / 2,000 calls. Login SQL averaged 1.197 ms over 500
calls. This supports investigating request handling/acquisition rather than
rewriting completion rules. It does not identify per-request waiting time:
averages and HTTP percentiles cannot be subtracted, and SQL timings exclude
network, pool waits and some transaction overhead. No new index or pool tuning
is justified by this run alone.

There were 68 approximately one-second activity samples: four saw WAL-related
waits and none saw heavyweight lock waits. Short waits may be missed. Planning
and I/O timing remained disabled. No statement text, credentials or student IDs
are exported. Report: `completion-profile-2026-11-18.json`; private orchestration
and raw aggregates: `/Users/seanjohns/reliq-audits/2026-11-18/completion-profile/`.

The temporary local class index and four private-channel policies were removed
and absence verified, restoring the original isolated setup. The subsequent
preflight and 25-student / 175-request smoke passed. Profiler syntax, targeted
QA lint and diff checks passed. Only diagnostic labels and documentation changed;
no application build or migration is required, and no hosted settings changed.

Next: correlate completion requests with API acquisition/use timing, using the
existing local diagnostic approach, before selecting a remedy. The earlier
instrumented acquisition trace covered logins only. Full-history dashboard reads
remain a separate request-volume candidate; preserving current-attempt semantics
requires a tested projection, not an arbitrary history limit. Keep the 500-user
gate open and do not advance to 10,000-user claims.

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
