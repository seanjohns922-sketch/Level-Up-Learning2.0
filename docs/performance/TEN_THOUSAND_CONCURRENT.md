# 10,000 simultaneous users: acceptance work

Reviewed 16 November 2026 against `627cc7d4`. Target: 10,000 simultaneously
active students, plus teacher traffic. This is not a claim of supported capacity.

## Live Class tab reuse — 19 November

The teacher dashboard keeps its single selected-class Live Class panel mounted
while other top-level tabs are shown. Its retained event reader avoids a fresh
history bootstrap on every return. Inactive-panel guards pause polling, focus-
triggered reads and drawer timeline reads. The existing private subscription stays
connected to record insert/invalidation hints without triggering hidden reads.
Returning requests an immediate reconciliation while existing rows remain visible;
in-flight reads can finish, and failures retain the prior data as before.

Class changes remount by class ID, disposing the old reader, timers and subscription.
Leaving the dashboard also disposes them. No browser storage or shared/global cache
is introduced. This retains Live Class filters and drawer selection when changing
tabs; diagnostic, curriculum and Students panels retain their existing lifecycle.
No scoring, data persistence, access policy or display calculation changes apply.

`qa:teacher-live-tab` mounts the actual panel in React/JSDOM and checks reader
retention, no hidden focus/realtime reloads, immediate return refresh, disposal,
no hidden new-class preload, and no old student displayed after a class change.
It runs in the 20-check critical suite. The existing scheduler/reconnect regression
also exercises the updated active-tab guard. Browser layout, realtime network
behaviour and measured end-to-end tab-switch latency remain unverified; this is
not a claim that all dashboard lag is resolved. Keeping one hidden panel costs
memory and one live subscription while the dashboard remains open.

## Teacher Students interaction work — 19 November

`StrandStudentsPanel` now memoizes per-student canonical snapshots and derived
row values separately from sorting. Opening details, sorting or changing only the
loading flag reuses those values. Changes to progress, roster, live activity,
realm, year or source availability invalidate the calculations. The dashboard
also retains the filtered roster array while its inputs are unchanged. No saved
values, snapshot rules, layout, sort comparators or access permissions changed.

`qa:teacher-student-render` mounts the actual component in React/JSDOM, instruments
the real snapshot builder and verifies sorting and expansion add no snapshot
calculations. It checks new saved weeks appear immediately, unavailable sources
are displayed as unavailable and Number progress does not leak into Measurement
when switching realms. The new check belongs to `qa:critical` (19 checks).

This removes confirmed redundant calculation; it is not a measured browser frame-
time improvement. Top-level tab switches still unmount/remount panels and can reload
history. That remains a separate investigation; do not claim all dashboard lag is
fixed. No database migration is required.

## Production-reader load baseline — 19 November

The local `dashboard-mixed` capacity scenario now uses the application's shared
`fetchLiveClassAttempts` reader for lessons, quizzes and assessments instead of
single capped queries. Final exact counts independently check completeness and
unique IDs for each history. Logical helper successes without an HTTP `status`
are recorded as 200; API errors remain failures. The report identifies this as
`production-attempt-pagination-v2` and explicitly describes its closed-loop pacing.

Two sequential 60-second runs used 100 distinct synthetic students and four ordinary
teachers, with the production incremental event reader and 30-second dashboard
refreshes. These are API protocol rehearsals, not actual browser sessions.

| Local setup | Dashboard p95 | Login p95 | Request failures | Preliminary gate |
| --- | ---: | ---: | ---: | --- |
| No students(class_id) index | 2,522 ms | 771 ms | 0 | Failed |
| Temporary equivalent of existing class index | 979 ms | 373 ms | 0 | Passed |

Both runs verified all 100 students' persisted activity, 201 activity writes and
201 new events reaching teachers exactly once. Each class returned 1,609–1,630
lessons, 516–523 quizzes and 1,032–1,046 assessments, matching independent counts.
The indexed run had event-loop p99 delay of 11 ms and about 2.3% utilization.
Only 12 dashboard refreshes were measured per run; p95 is effectively the maximum
at this sample size. Sequential runs also differ in cache warmth and event history.
This comparison does not establish a controlled performance improvement or capacity.

The class index is **already existing migration work**, not a new deployment change.
Its hosted presence remains independently unverified. The local temporary index was
removed and the gateway configuration restored, both verified after testing.
Synthetic activity/event fixtures remain in the isolated local database. No product,
permission, migration, scoring or display changes were made in this step.

Evidence: `capacity-pagination-100-unindexed-2026-11-19.json` and
`capacity-pagination-100-indexed-2026-11-19.json`. Syntax, targeted ESLint,
`qa:live-class-attempt-read` and `qa:staging-config` passed. No production build was
needed for this test-runner/documentation-only change.

Next gate: repeat a longer 100-student run with the existing-index equivalent,
then progress to 250 and 500 only while integrity and latency targets pass.
Canonical completions/retries, realtime subscriptions, browser/device rendering,
fixed arrival-rate overload, production-like hosting and long soaks remain separate
requirements. This short pass does not supersede earlier failed 500-student tests
and is not evidence for 10,000 concurrent users.

## Canonical class history pagination — 19 November

The placement compatibility loader now pages its existing lesson/quiz RPCs and
assessment/teacher-override table reads. Every page keeps the selected roster and
realm filters and existing permissions. The UUID paging algorithm is shared with
Live Class and diagnostic reports; no schema, grants, migration or student-side
endpoint changes are included. A failed page rejects the load without returning
partial history. Canonical progression calculations are unchanged.

Regression coverage checks all four sources with 1,207 records under a 137-row
server cap, detailed fields, empty rosters and later-page errors. Local authenticated
API verification (`scripts/staging/class-realm-history-local.mjs`) matched independent
table reads for two synthetic teachers: 1,630/1,622 lessons, 523/520 quizzes and
1,046/1,040 assessments. All eight foreign-class reads returned empty. Local override
fixtures were empty; populated override pagination is covered by the mock regression.
Run the local script with the TypeScript alias loader and the existing local fixture
working directory. No schema or fixture writes are performed (teacher logins create
auth sessions). Browser flows, concurrent writes and hosted capacity are not covered.
Complete history can increase requests; this is a correctness fix, not proof of
10,000-user throughput. The existing compact progress-summary read and student-side
history queries are unchanged.

## Live Class attempt-history pagination — 19 November

Follow-up: `WholeMathsDiagnosticPanel` also uses this reader for its class-wide
realm pre/post-test checkpoints, replacing its single capped request. It retains
the existing checkpoint calculations and success-only state update; a failed page
does not replace the previous history with a partial result. Class changes cancel
further pages. The individual printable report now opts into question results on
the same paged reader, scoped to one student. Routine class refreshes do not fetch
these detailed answers. Closing the report window cancels further pages; a failed
read displays a retry message rather than generating an incomplete report. Tests
cover detailed answers across 1,207 rows, summary projections without answers and
later-page report failures. Complete history requires more
requests than a capped response; this is a correctness fix, not a throughput claim.

`LiveClassPanel` now uses `fetchLiveClassAttempts` for its lesson, weekly quiz and
assessment history. Previously, each source used one unpaginated query and could
silently stop at the API row limit. The shared reader retains the same projections,
student scope and completed-lesson filter, with an extra UUID for pagination.
Every page uses the original table RLS; there is no new RPC, authorisation helper,
grant, migration or database write.

The reader fixes an upper UUID before paging, advances strictly by ID, and does
not treat short pages as end-of-history (a server may enforce a smaller cap).
It stops at the upper ID or an empty page. An access error, transport failure,
malformed/non-advancing page or cancelled class selection returns no partial data.
The panel's existing all-three-success guard retains the previous completed
attempt state when any source fails. The normal refresh reconciles concurrent
inserts/updates; this is not a transactionally frozen database snapshot.

The new `qa:live-class-attempt-read` regression is included in `qa:critical`.
It covers 1,207 rows with a 137-row server cap for all three tables, empty scopes,
completed-only filtering, fixed upper bounds, new/deleted rows, cancellation,
later-page access/transport failures and malformed/foreign rows. The critical
suite passed 18/18, along with typecheck, lint:qa and targeted ESLint. The full
`npm run build`, including all prebuild audits, compilation, TypeScript and static
page generation, passed. No browser visual check was performed for this data-only
change.

The production helper was also exercised through real local authenticated HTTP
requests for 20 synthetic teachers. All 60 result sets matched the independent
paginated direct-RLS reads. The first class returned 1,630 lessons, 523 quizzes and
1,046 assessments. All 20 foreign-class checks returned no rows. Evidence:
`docs/performance/live-class-attempt-pagination-2026-11-19.json`; runner:
`scripts/staging/live-class-attempts-local.mjs`. No fixture or schema writes were
needed for this check.

This closes the row-limit gap, not the remaining throughput work. Reading complete
history can cost more requests than the former truncated read. Browser rendering,
hosted performance and 10,000-user capacity have not been verified by this change.

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

## Dashboard browser check — 19 November 2026

Checked review commit `5bd8707d` in native Chrome against an isolated development
app on port 3100 and the synthetic Supabase database on port 56521. No hosted
school data was used. The class contained 26 synthetic students.

- Desktop: opened Live Class, selected Not started, switched through Students
  and Diagnostic, then returned. The filter and its single matching student
  remained. Clearing the filter restored all 26 rows. A student's detail drawer
  opened with score and recent activity, then closed successfully.
- Chrome's iPad Mini emulation (768 × 1024): inspected Live Class, Students and
  Diagnostic. Live Class summary cards wrapped and tab controls remained usable.
  Students has a remaining narrow-layout issue: the unwrapped pathway badge
  crowds the progress column. Review the six-column grid before claiming tablet
  layout sign-off. This check did not change the UI or curriculum.
- The local fixture database lacked the existing
  `20261118120000_compact_live_class_event_reads.sql` migration. The initial
  compact request returned 404 and the existing missing-RPC fallback loaded the
  data. Applied that existing read-only migration locally, refreshed the API
  schema cache and reloaded. Chrome Network then showed successful HTTP 200
  compact event fetches. The two functions remain installed in the local test
  database; no hosted migration was applied and none was newly authored.
- Reran the actual-component Live Class lifecycle test and all 20 critical QA
  checks successfully. Class isolation and immediate refresh on return are
  covered by those automated tests; this browser session used only one class
  and did not inject a new student completion while the tab was hidden.

This was development-mode functional/layout verification, not a controlled
cold/warm latency benchmark, physical iPad/Safari test or production-build load
test. Diagnostic's synthetic rows had no diagnostic scores; their pending state
does not validate populated diagnostic reports. No merge or deployment occurred.
Next: verify browser freshness with a new synthetic completion, then repeat
sustained capacity gates with schema parity.

### Portrait pathway badge fix — 20 November 2026

Removed the pathway badge's forced single-line text and constrained it to its
existing grid column (`max-w-full`, normal wrapping and word breaking). No grid
columns, data calculations, status wording, scoring or progression changed.
In Chrome iPad Mini emulation (768 × 1024), Not placed and Level complete now
wrap within their badges without overlapping year progress. At normal desktop
width, those same badges remain single-line and the six-column layout is intact.
This was checked with the synthetic class only; physical iPad/Safari remains
untested. The school-home preview control also crowds the class header at narrow
width in the ordinary teacher route; that separate existing layout needs review.

All 20 critical checks, QA lint, typecheck and the full production build passed.
Component ESLint had no errors and one existing unused-import warning.
Build log: `/Users/seanjohns/reliq-audits/2026-11-20/student-pathway-wrap-build.log`.
This is a CSS-only fix and does not require a database migration.

### Completion freshness regression coverage — 20 November 2026

Extended `scripts/teacher-live-tab-test.mjs` to supply a synthetic canonical
lesson completion while the actual React panel is inactive. Returning displays
the saved 8/10 score, 80% accuracy and scored-completion tooltip. A subsequent
attempt updates to 9/10 and 90% on return without any realtime notification.
Switching classes removes the previous student's score. The existing retained
reader, inactive read pause and disposal assertions remain.

The first completion-status assertion expected a Completed dot, but inspection
confirmed the existing UI intentionally prioritises Active now for recent
activity. The test checks the scored-completion tooltip instead; no application
behaviour was changed. All 20 critical checks, QA lint and typecheck passed; the
focused test passed again after adding the missed-notification scenario.

This is a test-only change using mocked service responses and real React effects
in JSDOM. It does not replace the pending real-browser/database freshness check,
prove network timing or establish concurrent-user capacity. No production build
was rerun because no shipped application code changed. No migration is required.

### Browser completion freshness verified — 20 November 2026

Ran the current safe checkout in the isolated development app on port 3100,
with the existing synthetic Supabase stack on port 56521. Docker had stopped;
restarted its existing containers, restored the documented local gateway setting,
and passed the runtime/schema preflight. No hosted service or migration changed.

In native Chrome, Synthetic Student1 initially showed attempt 35, 9/10 and 90%
in the 26-student class. Switched to Students, then used an actual anon student
session and `complete_realm_lesson` to save a 7/10 completion. Retried the same
completion key and independently read back exactly one new canonical attempt
(36). No explicit live-activity event was sent by the test script.

Returned to Live Class without reloading. The retained row initially showed the
previous result while the asynchronous refresh ran, then updated to attempt 36,
7/10 and 70%; today's accuracy also became 70%. Opening the student's drawer
showed Lesson 1 complete, final score 7/10, final accuracy 70% and Completed lesson.
The temporary student session was removed; the synthetic completion remains in
the local fixture history. Closed the test window and stopped the local app.

Reproduction script and machine-readable save evidence are in the private audit
directory `/Users/seanjohns/reliq-audits/2026-11-20/browser-freshness-save.mjs`
and `browser-freshness-save.json`. This checks real database-to-browser freshness
for one desktop class, not physical iPad/Safari, latency targets or capacity.
No shipped application code changed. Next: repeat the sustained 100-student
capacity gate with schema parity, integrity checks and resource monitoring.

### Compact dashboard load precheck — 20 November 2026

Pushed the browser-freshness coverage as `b861af9c`. Before the sustained run,
found the capacity runner still requested full event history. Added opt-in
`SCALE_EVENT_MODE=compact` for `dashboard-mixed`; the existing default `full`
mode remains the full-history stress scenario. Reports have distinct filenames
and record the mode. Compact RPC failures fail the test instead of silently
accepting a full-history fallback, and a run must actually exercise that RPC.
New synthetic answer events include lesson context so compact reads should retain
them. Both modes still verify every emitted event once, class/student isolation,
exact persisted activity writes and complete canonical attempt counts.

Ran two 60-second prechecks (about 63 seconds including reconciliation), each
with 100 synthetic students, four ordinary teachers, 20,000 seeded history events,
and existing history-heavy lesson/quiz/assessment attempts. Both had zero failed
operations, all 100 presence checks and 200 exact activity writes verified, and
all four teacher history/event checks passed. Neither passed the latency gate.

- First run overlapped QA on the Mac: dashboard refresh p95 3,554 ms.
- Repeat after QA finished, with HTTP profiling: dashboard refresh p95 2,348 ms;
  lesson history 2,348 ms, assessment history 2,330 ms, quiz history 1,884 ms,
  initial compact events 1,627 ms. Student endpoints were below 1,000 ms p95.
  The generator event-loop p99 was 12 ms, maximum 47 ms, utilization about 3%.
  These small dashboard sample counts are diagnostic, not stable capacity estimates.

Aggregate resource monitoring began before both workloads. Private reports,
HTTP timings and samples are preserved under
`/Users/seanjohns/reliq-audits/2026-11-20/compact-precheck-*` and
`compact-repeat-*`. This is a local protocol test with periodic dashboard reads;
it excludes concurrent canonical completions, realtime delivery and browser
rendering. Selected runtime/schema preflight passed, but full production schema
and cloud-resource parity are not established. Synthetic writes/sessions remain
in the isolated fixture database as with the existing capacity runner.

All 20 critical checks, QA lint, typecheck and targeted runner lint passed.
No shipped app code, migration or production data changed; no build was needed.
The 30-minute test was deliberately not started after the latency precheck failed.
Next: profile complete attempt-history reads and their pagination before changing
the app, then repeat this gate without losing historical results or access checks.

### Local class-index parity and page-size experiment — 20 November 2026

Index inspection found the synthetic database lacked the previously prepared
`20261117090000_index_student_current_class.sql`. Applied that existing index
migration locally and retained it for future rehearsals. No hosted change was
made; the user's earlier hosted application remains unverified here. Updated
preflight to require a valid, ready, unfiltered `students_class_id_idx` on the
expected table/column, so future comparisons cannot silently omit this index.
This is selected schema parity, not a complete production-schema comparison.

The identical 60-second compact workload with the index preserved all 100 student
presence checks, 200 activity writes and teacher histories with zero failures.
Dashboard refresh p95 fell from 2,348 to 1,180 ms; lesson history was 1,180 ms,
assessment history 953 ms, quiz history 1,024 ms and initial compact events
1,097 ms. The preliminary latency gate still failed. These are single local
samples with evolving synthetic event history, not a guaranteed production gain.
Representative first-page EXPLAIN ANALYZE reads under the authenticated synthetic
teacher role used the class index and took 14.337/10.134/9.285 ms for lesson,
quiz and assessment histories respectively. Inspection transactions rolled back.

Added `scripts/staging/attempt-page-size-local.mjs`, a read-only experiment using
the production reader with only its 500-row limit intercepted to request 1,000.
Four teachers, three alternating-order pairs each, returned identical complete
rows and values with correct scopes. Across those 12 reads per mode, HTTP request
count fell from 144 to 96; mean elapsed time was 415 vs 229 ms, maximum 1,107 vs
591 ms. This static comparison does not establish performance under concurrent
writes or synchronized load. The shipped 500-row page size is unchanged.

Targeted lint, local preflight, complete-history equality and diff checks passed.
No shipped code changed, so no production build was rerun. Audit artifacts are
`/Users/seanjohns/reliq-audits/2026-11-20/indexed-*`, including resource samples,
HTTP profiles, authenticated plans and page-size results. Next: compare page
sizes under the same mixed workload before deciding on an application change;
then rerun the short gate before the sustained test.

### Mixed-load history page comparison — 20 November 2026

Pushed the prior index-parity guard and static comparison as `918e149e`.
Added an explicit local-only `SCALE_ATTEMPT_PAGE_SIZE` (500 or 1000) and shared
test adapter so both sizes use the production reader, projections, UUID bounds
and existing table RLS. Reports label the size and use separate output filenames.

Consecutive 60-second compact-dashboard runs used 100 synthetic students and
four teachers with resource monitoring. At 500 rows, dashboard refresh p95 was
1,532 ms with 204 teacher HTTP requests. At 1000 rows it was 879 ms with 156
teacher HTTP requests; the latter passed the short preliminary latency gate.
Both verified all 100 students, 200 exact activity writes, complete attempt
counts, emitted events and scope checks, with no failed requests. The 500-row run
preceded the 1000-row run; these small samples and evolving local event history
do not isolate all warm-cache/system effects or certify sustained capacity.

Applied 1000-row pages to summary reads in `lib/live-class-attempts.ts`.
Detailed answer reports retain 500-row pages. The bounded UUID pagination,
lower-server-cap handling, cancellation, access filters and all-or-nothing error
behaviour are unchanged. Regression checks cover both server caps, failure after
a full large page, and retaining the smaller detailed-answer payload bound.
The local dashboard runner now defaults to the shipped 1000-row summary size;
500 remains available for comparisons. No migration is required.

Private paired reports and resources are in
`/Users/seanjohns/reliq-audits/2026-11-20/page-size-pair-*`; HTTP profiles and logs
use `page-size-500-*` and `page-size-1000-*`. Canonical completion/retry under
concurrent load, realtime delivery, physical-device rendering and the 30-minute
sustained gate remain separate outstanding checks.

Validation for the summary-page change: all 20 critical checks, QA lint, targeted
staging-script lint, typecheck and the full production build passed. Reran the
history reader check after adding the detailed-page bound assertion. The first
sandbox build failed DNS access to Google Fonts and was stopped; the complete
network-enabled build passed. Logs are `history-page-size-build.log` and
`history-page-size-build-network.log` in the same private audit directory.

### Preview build-memory repair — 20 November 2026

Vercel preview `aa8d0fcc` failed during webpack compilation with SIGKILL and an
explicit out-of-memory report. Main already contained the narrowly scoped cache
fix `8bf6e08e`; the review branch had not incorporated it. Cherry-picked that
existing commit as `83af2b13`, preserving its author and leaving unrelated main
changes untouched. Production webpack caching is disabled; development retains
its cache. No application behaviour, schema, permissions or data changes apply.

The actual Next config loader verified both cache branches and that TypeScript
build errors are not ignored. ESLint and whitespace checks passed. Vercel ran
the full `npm run build` including prebuild audits: compilation succeeded in
70 seconds, TypeScript and all 177 static pages completed, and the preview was
Ready after 6 minutes 17 seconds. Deployment:
`https://vercel.com/level-up-learning/level-up-learning-app/DnR66bacXADpavfdne3Qk8rbphJM`.
Chrome loaded the preview login screen. Authenticated school workflows were not
retested in that preview. The nonfatal `/admin/home` cookie-based static-render
message remains in the build log; it did not prevent deployment.

The review branch remains separate from main. No paid build-machine upgrade or
migration was needed. Build success is not a concurrency benchmark.

### Thirty-minute compact dashboard checkpoint — 20 November 2026

The 100-student/four-teacher run at `aa8d0fcc` finished after 1,801 seconds.
It used 1,000-row summary pages, the actual compact event reader, six dashboard
sources, existing local class index and 30-second closed-loop activity cycles.
No request or integrity assertion failed: all 100 persisted presence records,
6,000 exact activity increments and 6,000 new events were verified. Every teacher
received its 1,500 events exactly once. All three attempt histories matched
independent exact database counts, with no duplicates or foreign-class rows.

**Overall latency gate failed; do not advance the capacity claim.** Initial event
loading p95 was 1,022 ms against the unchanged strict sub-1,000 ms target. There
were only four initial loads, so this percentile is their maximum. Across 243
dashboard refreshes, p95 was 851 ms, p99 2,732 ms and maximum 4,394 ms. Login p95
was 573 ms; heartbeat and activity-write p95 were both 43 ms. Zero failed requests
does not erase the initial-load miss or the slower tail.

The HTTP profile narrows the initial miss: the event head table request took up
to 800 ms to headers; compact-page requests took at most 216 ms. Subsequent
read-only EXPLAINs under each synthetic teacher's authenticated role used the
existing class/created index and executed in 1.3–5.7 ms. These quiet database
plans do not reproduce concurrent HTTP latency. Do not add an index or change
pool settings on this evidence alone. Next: profile repeated synchronized
100-student starts and distinguish queueing/API delay from query execution
before advancing to 250. Keep the same thresholds and complete-history checks.

Aggregate evidence is `sustained-100-summary-2026-11-20.json`; private full
reports, HTTP profile, resource samples and logs are in
`/Users/seanjohns/reliq-audits/2026-11-20/sustained-100/`. The generator's event-loop
p99 delay was 12 ms and utilization about 1.6%. Resource sampling reported no
errors. Browser activity/read-only investigation continued on this Mac; no local
production build overlapped. This is not an isolated cloud capacity measurement.

Canonical completion/retry traffic, realtime subscriptions, rendering/device
performance and production-equivalent hosting remain excluded. This completes
the 30-minute activity run, not a longer soak or 10,000-user certification. The
raw runner's static `long soak` exclusion is retained in the private original;
the aggregate report distinguishes the completed duration from longer tests.
No application, schema, permissions, curriculum or student data changed in this
checkpoint. Documentation/aggregate evidence only; JSON and diff checks passed.

### Repeated startup-burst comparison — 20 November 2026

Pushed the sustained findings as `50c61255`, then ran four 60-second local
100-student/four-teacher workloads in order: simultaneous, 30-second login ramp,
30-second ramp, simultaneous. Preflight passed. The reader, four fixture classes,
1,000-row summary pages, permissions and integrity checks were unchanged.

| Run | Login ramp | Login p95 | Initial events p95 | Dashboard p95 | Gate |
| --- | --- | ---: | ---: | ---: | --- |
| 1 | None | 434 ms | 1,045 ms | 1,045 ms | Fail |
| 2 | 30 seconds | 18 ms | 282 ms | 283 ms | Pass |
| 3 | 30 seconds | 12 ms | 345 ms | 646 ms | Pass |
| 4 | None | 628 ms | 1,088 ms | 1,160 ms | Fail |

All four runs verified all 100 students, every expected new event, full attempt
counts and exact activity totals, with zero failed requests/assertions. Verified
activity increments were respectively 201, 199, 199 and 200. Closed-loop pacing
and the fixed deadline mean ramped students have less active time; these are not
identical total-traffic workloads. Initial percentiles still have only four
samples each. Warm caches and evolving synthetic history remain limitations.

The reverse-order repeat supports startup contention as the next investigation,
not random loss of student data or evidence for an unindexed full-table scan.
It does not isolate database execution from API/connection waiting. Do not add
artificial student login delays, loosen the latency gate, tune production pools,
or advance to 250 based on the ramped passes. Next: profile the simultaneous
startup overlap across the API/connection boundary using the existing guarded
local diagnostic tools. No application or database changes were made here.

Aggregate: `startup-pair-summary-2026-11-20.json`. Complete private reports and
HTTP profiles: `/Users/seanjohns/reliq-audits/2026-11-20/startup-pair/`.
All child runs completed; exit code 1 on simultaneous runs records the expected
latency-gate failures. The comparison stopped on any correctness/transport
failure (none occurred). Aggregate JSON assertions and diff checks passed.

### Mixed-startup database trace — 20 November 2026

The next 60-second simultaneous-start run added the existing transaction and
50-ms connection samplers (75-second collection windows). All 100 students,
200 activity increments and 200 new events passed the existing integrity checks;
there were no failed requests. The latency gate failed: initial events p95
1,984 ms, whole dashboard 1,986 ms and student login 711 ms. Observer overhead
and host variation mean this is not evidence of a regression from the unprofiled
startup pairs. No production or local runtime settings changed.

The largest individual teacher SQL entry was compact event paging: 27 calls,
1,594.7 ms aggregate execution, 59.1 ms average. Several attempt-table statements
also contributed measurable execution time. Among 1,501 connection snapshots,
maximum observed transaction age was 116.65 ms and no blocking PID was observed.
Sampled states included idle-in-transaction/ClientRead and WAL waits. Samples
miss short operations, and observed age is not the complete transaction lifetime.
Planning and I/O timing were off; their zero counters must not be treated as
evidence of no planning or disk cost. Aggregate SQL averages cannot be subtracted
from independent client p95s to calculate waiting time.

This narrows but does not resolve the startup bottleneck. Earlier exact acquisition
instrumentation covered student-only traffic on a custom runtime, not this mixed
official-runtime workload. Reuse that work deliberately; repeating undifferentiated
load tests or increasing a production pool would not establish the missing causal
link. Next targeted work is request-correlated acquisition/connection-use timing
for teacher head/page reads alongside student login, and profiling compact paging
without changing its complete-history semantics. Keep the 250-student gate closed.

Aggregate: `startup-trace-summary-2026-11-20.json`. Private source reports:
`/Users/seanjohns/reliq-audits/2026-11-20/startup-trace/`. Both samplers and the
workload exited; the workload's exit 1 denotes the latency-gate failure. The
aggregate consistency and whitespace checks passed. No application source,
schema, permission, lesson or visual changes; no migration is needed.

Retain run configuration, application/schema versions, generator measurements,
latency distributions, errors, integrity results, realtime lag, database/resource
graphs and metered usage. Report the maximum tested passing load, not an estimate
extrapolated from a small rehearsal. Security readiness remains a separate gate.

### Mixed acquisition probe — 23 November 2026

Docker recovered after the local engine stall. Its restart regenerated the gateway
configuration; the existing local tuning script restored 4,096 worker connections.
Readiness and a 25-student/175-request smoke passed before testing.

Extended the existing custom PostgREST 14.8 probe with fixed teacher endpoint
labels, preserving completion labels. A pool-10 run used 100 synthetic students,
four teachers, compact events and 1,000-row attempt pages for 61 seconds. All 100
students, 200 activity increments, 200 new events and complete attempt histories
passed; zero failed requests. The latency gate still failed: dashboard refresh
p95 1,345 ms, initial events 1,344 ms and student login 832 ms.

Measured acquisition versus connection-use p95, respectively:

| Endpoint group | Count | Acquisition | Connection use |
| --- | ---: | ---: | ---: |
| Student login | 100 | 718 ms | 32 ms |
| Teacher event head | 12 | 628 ms | 34 ms |
| Teacher compact event page | 28 | 230 ms | 144 ms |
| Teacher lesson history | 40 | 521 ms | 145 ms |

This directly observes substantial acquisition delay in this instrumented local
run. It does not justify changing production pool sizes. Acquisition includes
connection establishment and scheduling; connection use includes transaction and
release. Groups cover the workload window including final verification reads,
not only initial dashboard requests. They have fixed labels, not unique request
IDs: do not subtract independent percentiles or claim exact HTTP correlation.
The custom runtime and logging overhead prevent comparison as an official-runtime
speed improvement. Compact paging also has measurable connection-use cost.

The original API was restored automatically; readiness and a further 25-student,
175-request smoke passed. No app, schema, content, visual or production changes;
no migration. Keep the 250-student gate closed. Next: profile compact-page query
execution under its actual teacher role and review avoidable dashboard request
concurrency while preserving complete history and existing access checks.

Aggregate: `mixed-acquisition-summary-2026-11-23.json`. Private orchestration,
binary and raw numeric traces: `/Users/seanjohns/reliq-audits/2026-11-23/mixed-acquisition/`.

### Compact event row reuse experiment — 23 November 2026

The query-body plan showed 2,110 primary-key row lookups after selecting events
already present in the materialized scope. A candidate retains the table composite
and returns it directly. It changes no stored data, filters, ordering, cursors,
access checks or grants. All 409 SQL/JS equivalence cases and the existing
teacher/support/principal/admin/legacy/revocation/anonymous matrix passed inside
rollback transactions. Complete ordered paginated results had identical digests.

Alternating complete-read SQL timings were original 156/158/193 ms versus candidate
106/117/133 ms. Buffer hits fell from 61,668 to 11,028. These are warm single-class
query measurements, not dashboard or production speed claims.

The subsequent official-runtime mixed pair (100 students/four teachers, compact
pages, page size 1,000, simultaneous starts) did not establish an overall benefit:
original dashboard p95 1,275 ms, candidate 1,406 ms; login p95 581/590 ms. Both
runs had zero failures and verified all 100 students, 200 activity increments and
200 events, but failed the latency gate. One ordered pair cannot establish a
regression either; cache/history and host scheduling vary.

**Decision: do not ship this as a migration.** Preserve the experiment at
`supabase/manual/compact-row-reuse/candidate.sql`; it is outside the migration
runner. Reproduce rollback-only parity using the existing local fixture cwd:
`node --experimental-strip-types --experimental-loader <repo>/scripts/typescript-alias-loader.mjs <repo>/scripts/staging/compact-events-local.mjs --row-reuse`.
No browser/app code changed, so an app build does not validate this SQL experiment.

The diagnostic's first restore command missed a SQL separator. Its transaction
failed; a corrected restore then succeeded and the original function definition
matched exactly. Readiness and the 25-student/175-request smoke passed afterward.
No production changes, no migration to apply. Next controlled experiment should
bound overlapping teacher reads without dropping any source or delaying student
logins; keep the 250-student gate closed.

Aggregate: `compact-row-reuse-summary-2026-11-23.json`. Private raw plans and
workload reports: `/Users/seanjohns/reliq-audits/2026-11-23/compact-plan/`.

### Bounded teacher-read experiment — 23 November 2026

Added a local-harness-only `SCALE_DASHBOARD_CONCURRENCY=3|6` option (default 6).
Every teacher still reads all six sources, including complete paginated attempt
history and compact events; result order and integrity checks are unchanged.
Student logins have no artificial delay. Whole-dashboard latency includes queue
wait; per-source timings begin when each source is dispatched and exclude it.

Four 60-second official-runtime runs used 100 students/four teachers, compact
events and 1,000-row attempt pages in reversed-pair order:

| Round | Reads per teacher | Login p95 | Dashboard p95 | Verified writes | Gate |
| --- | ---: | ---: | ---: | ---: | --- |
| 1 | 6 | 577 ms | 1,515 ms | 200 | Fail |
| 2 | 3 | 362 ms | 1,233 ms | 200 | Fail |
| 3 | 3 | 450 ms | 1,389 ms | 204 | Fail |
| 4 | 6 | 518 ms | 1,249 ms | 200 | Fail |

All runs verified all 100 students, expected events, complete histories and exact
activity totals, with no failed requests or correctness assertions. Differences
in write totals reflect the closed-loop scheduling/deadline; these are not fixed
arrival-rate workloads. Caches and synthetic event history evolve between runs.

Decision: keep application concurrency unchanged. Lower concurrency helped login
in these runs, but dashboard performance was inconsistent and no run passed the
latency gate. Keep the experimental scheduler in staging tools only. Next: compare
local connection capacity on the official API runtime, measuring database resource
pressure as well as end-to-end latency; no production pool change is justified.

Three scheduler tests passed (bounded dispatch and ordered results, failure
propagation/stopping queued work, empty/invalid input). Run them with
`node --test scripts/staging/read-concurrency.test.mjs`. Syntax, aggregate integrity
assertions and whitespace checks passed. Post-run local preflight passed. No app,
visual, content, schema or production changes; no migration or app build required
for this test-tool-only change. The 250-student gate remains closed.

Aggregate: `read-concurrency-summary-2026-11-23.json`. Private profiles, reports and
source snapshots: `/Users/seanjohns/reliq-audits/2026-11-23/read-concurrency/`.

### Official-runtime pool comparison stopped on timeouts — 23 November 2026

Compared temporary stateless API containers using the exact existing official
PostgREST 14.8 image, with pool sizes planned as 10/20/20/10. Each run kept the
100-student/four-teacher simultaneous-start workload, six concurrent teacher
sources, compact events and 1,000-row attempt pages. No schema, role, data-access
or production settings changed. A 50-ms-target connection sampler and streaming
Docker resource collector were present in each measured run.

| Round | Pool | Login p95 | Dashboard p95 | Integrity outcome |
| --- | ---: | ---: | ---: | --- |
| 1 | 10 | 771 ms | 2,749 ms | 100 journeys; 200 writes/events verified |
| 2 | 20 | 1,650 ms | 6,076 ms | 100 journeys; 200 writes/events verified |
| 3 | 20 | 1,601 ms | 18,454 ms including failures | 31 journeys verified; test stopped |
| 4 | 10 | Not run | Not run | Stopped after round 3 failures |

The third report contains 84 failed recorded operations and 73 journey failures
(69 students/four teachers). Operation records include overlapping logical
source/refresh timings, so 84 is not a distinct HTTP-failure count. Errors included
PostgREST acquisition timeouts, statement cancellations and client timeouts. Only
62 activity increments were verified; do not assert integrity of all attempted
writes or reuse this run as a passing data baseline. No production students were
involved. All three latency gates failed; the experiment halted on correctness/
request failure instead of continuing the final repeat.

Observed PostgREST connection maxima were 11/21/21 (including a non-workload
connection), with active maxima 10/19/20. Maximum sampled transaction ages rose
from 634 ms to 4,732 ms and 11,309 ms; blocked observations were 0/0/3. Connection
samples span each workload window but miss short waits and acquisition waiting.
Docker memory maxima were about 341/460/417 MiB for the database. CPU counters
sometimes exceeded the nominal eight-CPU allocation, reaching above 2,500%; these
are uncalibrated/inconsistent resource readings, not proof of a particular CPU
saturation percentage. Missing `--` counters are recorded as unavailable, not zero.
Profiler overhead, shared-host variation, growing history and the missing final
reverse control prevent attributing the entire deterioration to pool size.

Decision: do not increase the production pool or advance beyond the 100-student
gate. Reconcile the failed local fixture/workload state and validate resource
measurement before further capacity claims. Then evaluate the existing shared
attempt-scope prototype against the complete workload and permission/fallback
matrix; its earlier SQL-only speedup is not yet an application improvement.

An initial measurement attempt stopped because Docker's streamed JSON contained
terminal escape prefixes. After verifying the corrected parser, the measured
comparison above ran. Both exits restored the exact original container ID, image
and environment, and automatic network addressing. Final preflight and the
25-student/175-request smoke passed. No application changes or migration. The
smoke validates recovery for its fixture, not every incomplete workload journey.

Aggregate consistency/coverage checks and whitespace checks passed. This is local
diagnostic documentation only; no app build required. Aggregate:
`official-pool-summary-2026-11-23.json`. Private scripts and samples:
`/Users/seanjohns/reliq-audits/2026-11-23/official-pool/`.

### Local recovery after interrupted pool test — 23 November 2026

The original API passed preflight. A sequential check of all four synthetic
classes passed 100 student logins, runtime class checks, daily-activity reads and
live-activity reads (400 HTTP requests, zero failures). No learning activity or
event writes were requested; login creates/refreshes local sessions. Historical
heartbeat freshness was intentionally not asserted. An initial probe expected a
student_id field that this daily-activity RPC does not return; its documented SQL
contract returns class_id. The corrected probe checks that class and nonnegative
numeric activity. The initial failed probe is preserved with private evidence.

Read-only inspection of the latest capacity_run in the failed round's time window
found 62 events for 31 students, two per student, with no duplicate sequences,
sequence gaps or records outside the four-class fixture. These agree with the
31 completed journeys. This does not establish exact daily-activity increments
for the 69 incomplete student journeys: the earlier harness did not persist their
before-values and request acknowledgement ledger. No rows were deleted or reset.
Current readability has recovered; historical write integrity remains unproven
for those incomplete journeys.

Direct cgroup v2 readings show both DB and API can use CPUs 0–7, with no per-container
CPU quota and no recorded quota throttling. Over a roughly ten-second idle interval,
each consumed about 0.0034 CPU cores on average (0.042% of eight CPUs), measured
from usage_usec deltas divided by host monotonic elapsed time. Individual sampling
calls took 81–100 ms; that overhead and timing uncertainty are recorded. This is a
plausible independent measurement at idle, not a calibration under pressure or an
explanation of the prior >2,500% Docker stream readings. Retain direct counters
alongside streamed stats in a future controlled run before drawing CPU conclusions.

Next: persist per-synthetic-student activity baselines and acknowledgement counts
in the load harness so a timed-out run can be reconciled, then evaluate the shared
attempt-scope prototype. Do not increase the pool or claim the 100-student latency
gate (or 10,000-user capacity) has passed.

Aggregate assertions and whitespace checks passed. Diagnostic documentation only;
no application changes, migration, production setting change or app build.
Aggregate: `local-recovery-summary-2026-11-23.json`. Private probe scripts and raw
results: `/Users/seanjohns/reliq-audits/2026-11-23/recovery/`.

### Interrupted-run activity journal — 23 November 2026

The local capacity harness now creates an exclusive, per-run JSONL journal before
starting journeys. It records synthetic student ordinals in fixture order, initial
activity totals, write intent before dispatch, acknowledgement after success,
final readback totals and verified completion. Activity and event writes are
separate operations; event sequence and run ID match the existing event payload.
The final report names the journal and run ID. Credentials, real identifiers and
request bodies are not written to the journal.

An intent without acknowledgement is **unknown**, not proof of failure: a timeout
or failed acknowledgement append can occur after the server commits. There are no
automatic retries. If intent persistence fails, the request is not dispatched.
Each append is synchronous to preserve ordering on process interruption, but is
not fsynced and does not promise survival of power loss; retain complete JSONL
lines and treat a damaged/truncated tail as incomplete evidence. Disk writes add
observer overhead, so future timings need a fresh baseline with the same journal.
Reconciliation still requires a quiescent fixture and a later database read; this
journal does not retroactively repair older runs or track presence writes.

Focused tests cover timeout-after-possible-commit, intent visibility before
request dispatch, independent event/activity acknowledgements, existing-file
protection, and disk failures before and after dispatch. All five journal and
read-concurrency tests passed, plus harness syntax and whitespace checks. No full
capacity run was repeated for this instrumentation change, and no new performance
claim is made. No application or schema change; no app build required.
The default ESLint configuration ignores these staging scripts; its invocation
reported three ignored-file warnings and is not counted as a lint pass.

### Journal-backed default baseline — 23 November 2026

Ran the unchanged official local API with its default pool and the journal-enabled
harness at commit 8596a16b: 100 synthetic students, four teachers, six-source
compact dashboard refreshes, page size 1000, simultaneous login and a 60-second
closed-loop workload (61 seconds elapsed). Local preflight passed before and after.
No container settings, application code or schema changed.

All 100 student journeys completed. There were zero failed recorded operations
and zero journey failures. Independent read-only SQL reconciliation against the
journal found 100 baselines, 200 acknowledged activity increments, 200 acknowledged
events and no unacknowledged intents. Every student's stored activity delta was
exactly 30 seconds per acknowledged write. Every stored event sequence matched its
acknowledgements. This validates the journal integration on a successful run; the
previous timeout and disk-failure unit tests remain the evidence for those paths.

The latency gate still failed (expected harness exit code 1): login p95 1,005 ms,
whole dashboard refresh 1,857 ms, initial events 1,856 ms, lesson attempts 1,683 ms,
quiz attempts 1,235 ms and assessments 1,729 ms. Incremental events were 408 ms.
Do not treat a complete, correct workload as a latency pass or increase scale.

Direct cgroup CPU counters sampled roughly every two seconds produced plausible
interval peaks of 2.45 cores for DB and 2.15 for API, each with CPUs 0–7 available
and no quota-throttling delta. Thirty samples per container included preparation;
whole-window means were 0.146 and 0.099 cores respectively. These averages include
closed-loop sleep periods and cannot rule out brief saturation. Sampling calls
cost up to 97 ms. No streamed Docker stats or SQL connection sampler was used, so
this is a fresh instrumented baseline, not an improvement comparison with older
runs or an explanation of their anomalous counters.

Next: evaluate the existing shared authorised attempt-scope prototype with actual
API-role access, pagination, unsupported-scope fallback and revocation checks
before considering any application integration. No production change or migration.
Raw private evidence and orchestration/reconciliation scripts:
`/Users/seanjohns/reliq-audits/2026-11-23/journal-baseline/`. Redacted aggregate:
`journal-baseline-summary-2026-11-23.json`. Aggregate reconciliation and whitespace
checks passed; documentation-only commit, no app build required.

### Attempt-scope permission compatibility — 23 November 2026

Extended the rollback-only SQL prototype to compare row IDs as well as every
existing summary column, and added six cases isolating legacy class ownership,
individual assignment, partial assignment, revocation and restoration. All 153
cases passed under the authenticated database role. Existing application history
reader QA also passed API-cap pagination, fixed upper bounds, cancellation,
malformed/failed pages and concurrent-write recovery. No application edit.

The first new assertion incorrectly expected legacy ownership alone to expose
attempts after class-staff access was disabled. Inspection of the live local RLS
showed that the legacy attempt policy joins students, whose own SELECT policy
still checks student access. Direct reads returned zero rows across all three
tables. The assertion was corrected to require denial, not removed; the initial
failed result is retained privately. No policy was changed to satisfy a test.

An individual assignment exposed 78 lesson, 21 quiz and 42 assessment rows,
identical in the candidate and existing reads. Revocation removed access; restoring
the assignment restored those results. A scope containing that student plus an
unassigned student yielded the same permitted rows under existing RLS, whereas the
candidate explicitly returned unsupported with no data. A future client must use
whole-scope original reads in that case, not render an empty or partial candidate
result. This test verifies SQL response semantics; it does not implement client
fallback or test revocation between HTTP pages.

All temporary ownership, class/school membership and individual-assignment edits
were confirmed rolled back. Temporary functions exist only within their database
sessions. This run's combined SQL mean was 49.697 ms direct versus 37.368 ms
candidate, substantially less separation than the earlier probe; do not extrapolate
old speedups or equate these SQL timings to full-dashboard improvements.

The existing HTTP prototype still lacks the production reader's fixed upper UUID
bounds and needs the new assignment/revocation cases and explicit fallback handling.
Keep it out of the app until these pass, then measure the complete mixed workload.
No migration or production changes. Node syntax, affected reader QA, SQL parity,
rollback verification and whitespace checks passed; no app build for test-only
changes. Aggregate: `scoped-compatibility-summary-2026-11-23.json`. Full private
results: `/Users/seanjohns/reliq-audits/2026-11-23/scoped-compatibility/`.

### Bounded attempt HTTP reader and fallback — 24 November 2026

Updated only the local HTTP experiment. The temporary endpoint now establishes
three upper UUID bounds on its first page, applies those bounds on subsequent
pages, validates cursor/bound array shapes and rechecks the entire authorised scope
on every request. The local reader checks stable bounds, scope and advancing IDs,
continues through short nonempty pages, and rejects malformed/error responses.
An explicit unsupported response discards all accumulated candidate rows and reads
the whole requested scope through the original table RLS. Arbitrary API/transport
errors never trigger fallback. The direct comparison also uses fixed upper bounds.
These bounds do not provide a frozen database snapshot during concurrent edits.

Nine focused journal/concurrency/reader tests passed. Reader cases include a later
unsupported page, changed bounds, duplicate/non-advancing cursors, foreign rows and
transport/permission errors. Existing production history-reader QA passed without
application edits. The authenticated local HTTP experiment passed anonymous denial,
invalid inputs, empty/duplicate scopes, mixed-school fallback preserving permitted
records, 37-row pagination and full result equality. Three alternating-order rounds
at concurrency 1/4/20 compared 150 complete snapshots across both readers.

| Concurrent teachers | Direct attempt reads p95 | Prototype p95 |
| --- | ---: | ---: |
| 1 | 905 ms | 175 ms |
| 4 | 1,094 ms | 186 ms |
| 20 | 3,762 ms | 445 ms |

At concurrency 20, the 60 snapshots per mode used 480 direct requests versus 144
prototype requests. These are static synthetic attempt histories only, not the
complete dashboard, student-write contention, browser performance or 10,000-user
capacity. No comparison with older experiment timings is claimed.

Local preflight passed. The temporary function was removed in finally and confirmed
absent. No production, application, permanent schema or fixture permission changes.
Syntax, affected QA, focused tests, result parity and diff checks passed; no app
build for local diagnostic-only changes. Results:
`bounded-attempt-http-2026-11-24.json`; private copy:
`/Users/seanjohns/reliq-audits/2026-11-24/bounded-attempt-http/`.

Remaining integration gates: actual HTTP individual-assignment/revocation between
pages (later-page fallback currently has a mocked test), concurrent-write behaviour
of this prototype, cancellation, and the complete mixed dashboard workload. Do not
connect this experimental reader to the app until those are checked.

### Actual HTTP access revocation and cancellation — 24 November 2026

Added `scripts/staging/scoped-attempt-revocation-local.mjs`, guarded by the existing
loopback-only local configuration. It authenticates a synthetic teacher, reads a
real first page, changes synthetic permissions, then requests the next page through
the real API. This closes the earlier mocked-only later-page fallback gap.

- Revoking school membership after the first page caused the next request to
  return unsupported with no candidate data. Whole-scope original-RLS fallback
  returned zero rows; no earlier candidate records escaped.
- Restoring membership restored the complete original histories.
- With class staffing disabled and two individual assignments active, candidate
  results matched original histories. Revoking one assignment after the first
  page caused fallback to retain exactly the other student's 75 lesson, 21 quiz
  and 42 assessment rows. Pre-revocation data for the removed student was discarded.

The script refuses to replace existing individual assignments or an existing
endpoint. It restores the prechecked active memberships, removes only its own
random-ID assignments, removes the temporary endpoint in finally and verifies the
restored state. These permission edits must be committed briefly to be visible to
independent HTTP requests; this is a **local synthetic test**, not a rollback-only
SQL test or production change. Do not interrupt the process during cleanup. The
final run confirmed all restoration checks and local preflight passed afterward.

The experimental reader now accepts an optional cancellation predicate, checked
before and after pages and after fallback. Three tests prove cancellation before
dispatch, during a page and during fallback returns no results. It does not abort
an already-issued network request; it prevents its result being returned. All 12
focused reader/journal/concurrency tests passed, plus existing application history
reader QA, Node syntax and whitespace checks. No app code or migration changed,
so no application build was needed. Committed aggregate:
`attempt-revocation-http-2026-11-24.json`; private evidence:
`/Users/seanjohns/reliq-audits/2026-11-24/attempt-revocation/`.

Next gates remain concurrent-write behaviour and the complete mixed dashboard
workload with the candidate enabled only in the local harness. These access tests
are not a new capacity measurement or approval to deploy the prototype.

### Read-only HTTP boundaries; concurrent insert check blocked — 24 November 2026

The earlier four commits were pushed to the existing review branch through
06b9a57d, with no main merge. Preparation for a concurrent assessment-insert test
found assessment triggers that update learning-cycle metadata and derived live
progression. Automatic approval review rejected the proposed test because trigger
side effects might exceed its restoration scope and explicit approval was absent.
The insertion test did not execute. Its unrun draft is preserved privately at
`/Users/seanjohns/reliq-audits/2026-11-24/attempt-boundaries/concurrent-insert-NOT-RUN.mjs`.
Do not treat that draft as verified or run it without resolving the approval block.

Completed a safer read-only fixture test instead:
`scripts/staging/scoped-attempt-boundaries-local.mjs`. It requests one-row pages
through explicit upper bounds on all three attempt tables, proves that the API
returns no rows beyond those bounds despite more existing records, and verifies
that a fresh refresh returns the complete original RLS histories (78 lessons,
21 quizzes, 42 assessments). This tests boundary enforcement, **not concurrent
inserts, updates or deletes**. No learning or permission records were modified.

The first attempt hit PGRST202 because the temporary endpoint's schema reload had
not completed. Added a ten-second setup-only readiness check that retries only
schema-cache absence; all other errors fail immediately. The final run passed,
the temporary endpoint was confirmed removed, and local preflight passed. Syntax
and whitespace checks passed. No production/application/migration changes or app
build. Aggregate: `attempt-boundaries-http-2026-11-24.json`.

Concurrent-write behaviour remains unverified. Resolve the rejected write test's
approval/safety issue before claiming that gate passed. Full mixed-dashboard
measurement and production integration remain outstanding.

### Mixed dashboard with activity writes — 24 November 2026

Added an opt-in `SCALE_ATTEMPT_MODE=scoped` to the local capacity harness; default
remains the production reader. Each refresh shares one bounded three-table
prototype request sequence among its three attempt sources. The other dashboard
sources, student sessions, presence, daily activity and event writes are unchanged.
The prototype's final histories are compared row-for-row with the production
reader, in addition to the existing exact-count and duplicate checks.

`scripts/staging/scoped-activity-comparison-local.mjs` ran one direct/scoped pair:
100 students, four teachers, 60-second closed-loop activity workload in each mode.
It installs only the temporary attempt read endpoint and removes it after child
workloads finish. It does not run the older canonical-completion mixed harness,
insert assessments or lesson attempts, or bypass the rejected insert experiment.
Attempt histories remain static throughout this test.

| Metric (p95) | Direct | Prototype |
| --- | ---: | ---: |
| Whole dashboard refresh | 2,666 ms | 1,535 ms |
| Student login | 1,045 ms | 557 ms |
| Initial event history | 2,248 ms | 1,534 ms |
| Incremental event read | 2,358 ms | 596 ms |

Both runs had zero failed recorded operations and zero journey failures. Each
verified 100 student journeys, 200 activity increments and 200 new events. The
journal/readback check found exactly the expected increments and no unacknowledged
intents for all students in each run. This uses the per-run captured API readbacks,
not retrospective first-run database totals after the second run's writes.
Prototype histories matched every projected production row across all four classes.
Its three attempt-source timings share one promise and are not independent work.

Both latency gates failed. This is one sequential pair without reversed order;
cache/host variation, growing event history and the prototype's 500-row-per-table
pages versus direct 1000-row pages prevent a causal speedup claim. The candidate
RPC is labelled `other` in the existing redacted HTTP profiler; whole-refresh
latencies are measured independently. No 10,000-user claim or deployment approval.

Twelve focused tests, production attempt-reader QA, staging-isolation QA, syntax,
whitespace and journal checks passed. Temporary endpoint removal was verified.
No production/app changes or migration, so no app build. Evidence:
`scoped-activity-comparison-2026-11-24.json`; private logs and journals:
`/Users/seanjohns/reliq-audits/2026-11-24/scoped-activity/`.

Next: repeat in reversed order before deciding whether to pursue integration.
Concurrent assessment/lesson-attempt inserts remain unverified; the automatic
approval rejection of that separate fixture mutation still applies.

### Reversed mixed-dashboard comparison — 24 November 2026

Added validated `SCALE_COMPARISON_ORDER=direct,scoped|scoped,direct` to the local
orchestrator and ran the reversed pair with the same default API settings and
100-student/four-teacher activity-only workload. No assessment/lesson inserts.

| Run order | Reader | Dashboard p95 | Login p95 | Latency gate |
| --- | --- | ---: | ---: | --- |
| Earlier pair, first | Direct | 2,666 ms | 1,045 ms | Failed |
| Earlier pair, second | Prototype | 1,535 ms | 557 ms | Failed |
| Reversed pair, first | Prototype | 1,499 ms | 648 ms | Failed |
| Reversed pair, second | Direct | 1,121 ms | 428 ms | Failed |

The apparent prototype advantage did not hold in reverse order. The direct reader
was faster in the second pair; do not integrate or claim a consistent speedup.
Cache/host/order effects remain plausible explanations, not established causes.
Neither reader passed the latency gate. In the latest direct run, initial event
history was 1,119 ms while attempt sources were 532/707/925 ms, so initial event
history is a useful next profiling target before adding application complexity.
Do not increase scale on these results.

Each reversed round completed all 100 student journeys without failed operations
or journey failures. Each wrote and acknowledged 201 activity increments and 201
events. The extra iteration is allowed by the existing closed-loop deadline, not
a retry or duplicate: all journal intents were acknowledged, captured readback
deltas matched 30 seconds per write, and event sequence checks passed. Prototype
attempt histories matched every projected production row. This is captured
per-run API readback verification, not a separate post-run database-total audit.

Temporary endpoint removal and local preflight passed. Order-option syntax,
whitespace and aggregate journal checks passed; no app changes, migration or build.
Evidence: `scoped-activity-reverse-2026-11-24.json`; private logs and journals:
`/Users/seanjohns/reliq-audits/2026-11-24/scoped-activity-reverse/`.

Decision: retain the current application reader and keep the prototype experimental.
Next, profile initial event-history work under a stable local baseline. The separate
assessment-insert test remains unrun following automatic approval review's rejection;
this experiment does not resolve that gate or prove 10,000-user capacity.

### 25 November: isolate initial event-history reads

Added `scripts/staging/event-chain-profile-local.mjs`, which uses the production
`fetchLiveClassEvents` reader against four existing synthetic local teachers.
Run from the fixture checkout with Node 24 and `--experimental-strip-types`.
The runner permits only local authentication, the event head GET, and the compact
page RPC. It does not seed fixtures, alter schema, or write learning data.

Across three alternating sequential/concurrent rounds, all 24 full snapshots
returned identical ordered rows for each teacher: 2,824–2,829 rows, one head and
six compact pages each. Duplicate and class/student scope checks passed, with no
fallback requests. Syntax validation passed. Application code was unchanged, so
an application build was not run.

The first sequential read took 1,394 ms; retain this result rather than hiding it
in a warmed average. In rounds two and three, sequential snapshots ranged from
191–218 ms (median 201), and four concurrent snapshots from 227–245 ms (median
236). These are complete event-history reads without the other dashboard sources
or student activity writes. Authentication happened before timing.

Re-analysis of the four previous mixed-workload traces shows seven event requests
per teacher in every case. Their summed response-header waits ranged from
878–2,191 ms. Some chains were dominated by the head request; others by subsequent
pages. These sums exclude response-body processing and gaps between requests;
upstream timing includes API/connection queuing and is not SQL execution time.
The samples and redacted historical aggregates are recorded in
`event-chain-profile-2026-11-25.json`.

Interpretation: a warm event chain alone does not reproduce the mixed dashboard
slowdown. Warm-up, competing requests and workload interactions warrant controlled
investigation; this comparison does not isolate their individual causes. The
historical mixed runs used different fixture counts and a timing proxy, whereas
this isolated run measures direct fetch headers, so the numbers are observational,
not a speedup claim. Keep the current production reader and full history. Next,
isolate the interaction between event reads and other dashboard read sources
using read-only, alternating-order workloads before changing request scheduling.
No migration, production setting, or 10,000-user capacity claim results from this
profile.

### 25 November: read-only dashboard source interactions

Extended the event-chain profiler with `--interactions`, using production attempt
readers and the same live/daily activity queries as the local dashboard workload.
Use `--experimental-strip-types --experimental-loader` with the absolute path to
`scripts/typescript-alias-loader.mjs`. The seven combinations are events alone,
events plus each of the five other sources, and all six sources together. Four
teachers run each combination concurrently; a second round reverses the order.
Companion reads launch immediately before event reads, so this is a source
interaction probe, not an exact reproduction of UI scheduling.

All 56 snapshots passed: stable complete ordered event data, no duplicate or
out-of-class event rows, identical repeated companion results, successful HTTP
responses, and no event fallback. Each event snapshot still used seven requests;
the full six-source snapshot used 17. Syntax and diff checks passed. No application
code, schema, or learning data was changed; no release build was needed.

Median event-chain times in the forward/reverse rounds were:

| Companion source | Forward | Reverse |
| --- | ---: | ---: |
| None | 605 ms | 369 ms |
| Lesson attempts | 443 ms | 458 ms |
| Quiz attempts | 405 ms | 391 ms |
| Assessments | 392 ms | 449 ms |
| Live activity | 349 ms | 445 ms |
| Daily activity | 599 ms | 419 ms |
| All five | 963 ms | 1,471 ms |

The all-source burst was slower in both orders; no individual companion reproduced
its full delay. This supports investigating combined request contention, without
identifying a specific SQL statement or establishing causality. Warm-up/order/host
variation remain visible. Student writes, browser rendering and hosted conditions
are absent. Do not present this as a production improvement or capacity pass.

Keep production behaviour unchanged. The next diagnostic should compare controlled
source scheduling with this same read-only workload, retaining complete results
and measuring the total dashboard duration as well as event duration. The earlier
mixed-workload 3-versus-6 concurrency experiment already failed to establish a
reliable win; do not ship a scheduling change based on this isolation test alone.
Aggregates are in `event-chain-interactions-2026-11-25.json`; full local request
timings remain in the private fixture directory.
