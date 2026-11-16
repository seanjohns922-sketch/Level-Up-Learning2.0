# Initial dashboard request and permission profile — 17 November 2026

## Outcome

The profiled 500-student / 20-teacher run preserved all 1,001 expected activity
increments and new events, with zero request or journey failures. All 616 teacher
HTTP requests were captured under recognized fixed route labels. The workload
still failed latency: student login p95 2,516 ms, initial event load p95 5,312 ms,
and incremental event read p95 391 ms. No production settings changed.

## What the trace isolates

`SCALE_PROFILE_DASHBOARD=1` now enables an optional local-only header trace for
`dashboard-mixed`. It records a synthetic teacher ordinal, initial/incremental
phase, allowlisted route name, status and numeric timing fields. No URL filters,
SQL text, payloads, identities, credentials or tokens are exported. The trace is
saved separately as `dashboard-http-profile.json`; profiling is off by default.
The aggregate database profiler now distinguishes the dashboard read categories
and authenticated teacher role from student and fixture activity.

For every initial event-history chain, at least 99.41% of its measured span was
inside fetch-to-response-headers intervals. The largest total gap between those
requests was 29.067 ms. Gateway upstream timings accounted for at least 93.85%
of each chain's span. These bounds end at the final page's response headers;
they exclude final body parsing. They locate the main delay upstream of the
client's between-page work, but do not isolate exact pool acquisition.

| Initial teacher request | Header p95 ms | Gateway upstream p95 ms |
| --- | ---: | ---: |
| Event-history head lookup | 2,300 | 2,205 |
| Event page RPC | 1,095 | 1,089 |
| Lesson attempts | 3,311 | 3,197 |
| Quiz attempts | 2,612 | 2,529 |
| Assessments | 2,559 | 2,456 |

Database statement execution averages over the entire run were 5.622 ms per event
page, 1.335 ms per history-head query, 34.399 ms for lesson attempts, 39.058 ms for
quiz attempts and 32.763 ms for assessments. These are shared aggregate deltas,
not request-correlated or initial-only measurements. Planning/I/O timing collection
was disabled; zero planning or I/O counters must not be interpreted as zero cost.
The trace and sequential page chain explain why short database execution averages
can coexist with multi-second initial loads. More precise teacher acquisition
tracing would be needed to allocate the remaining upstream time exactly.

## Read-only query plans and reversible policy experiment

Representative authenticated SELECT plans used the original synthetic class and
its existing 744 lesson attempts, 248 quizzes and 496 assessments. Plans were
collected outside the burst. Exported plans omit filters, SQL and user IDs; node
costs include child nodes and must not be summed.

Attempt reads used their student-scope indexes, but their legacy teacher-policy
subqueries scanned visible classes and students under nested access checks. That
subplan accounted for most of the 80–89 ms initial execution. The event-head query
used the class/created index and completed in about 1.35 ms.

Each attempt table also has the newer school-staff policy using
`can_view_student_learning(student_id)`. To test a narrow hypothesis, a local
transaction removed only the older permissive teacher SELECT policies, measured
the same authenticated SELECTs, then rolled back. No grants, data or functions
changed. Removing permissive policies did not broaden access. All three original
policies were verified present afterward.

| Query | Original ms | Legacy policy removed temporarily ms | Original restored ms |
| --- | ---: | ---: | ---: |
| Lesson attempts | 89.097 | 357.519 | 81.134 |
| Quiz attempts | 79.831 | 111.989 | 80.223 |
| Assessments | 79.791 | 229.195 | 80.041 |

All variants returned the same row counts for this teacher. Removing the old
policy worsened performance because the remaining per-student permission path
became more expensive. This is not a full role-equivalence test and does not
justify deleting policies. The original configuration was restored automatically
by transaction rollback, including on connection failure.

## Next bounded work

Investigate evaluating authorized student scope once per dashboard request,
preserving the exact existing teacher/admin and school boundaries. Any candidate
must be checked across positive and negative role cases before a migration or
application release is proposed. Keep the original policies meanwhile. This
profile identifies a concrete cost but does not establish a validated fix or
10,000-user capacity. The six-source periodic scenario still excludes realtime
scheduling/reconnects and contains uneven completion fixtures across classes.

## Verification and artifacts

Node 24 syntax, targeted QA ESLint and diff whitespace checks passed. Final local
preflight and the 25-student / 175-request smoke passed after rollback. No API
image, pool setting or database configuration was changed. No application source,
lessons or visuals changed; no release build was needed for these diagnostic edits.

Aggregate timing and sanitized plans:
`dashboard-initial-profile-summary-2026-11-17.json`.
Private runner and raw numeric timing evidence:
`/Users/seanjohns/reliq-audits/2026-11-17/dashboard-profile/`.
