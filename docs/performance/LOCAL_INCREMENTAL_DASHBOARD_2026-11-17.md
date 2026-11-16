# Incremental six-source dashboard rehearsal — 17 November 2026

## Implementation

Added `SCALE_SCENARIO=dashboard-mixed` to the guarded local capacity runner.
Existing mixed/full-history, student-only and teacher-only scenarios remain
available with their prior workload. No application, database schema, grants,
production configuration, lessons or visual assets changed.

The new scenario uses the production `createLiveClassEventReader`, one reader per
teacher/class. Alongside its event read it executes the five read sources and
column selections currently used by `LiveClassPanel`: live student activity,
completed lesson attempts, quiz attempts, realm assessments and today's class
activity. It refreshes after 30 seconds and performs a final read once students
finish. This is a periodic protocol workload, not a browser or realtime simulation.

Students authenticate through the actual anon/session RPC flow, update presence
and daily activity, and insert an answer event through the secure student RPC on
each cycle. Every event has a run marker and per-student sequence number. Final
incremental snapshots must contain every expected event exactly once. Every source
must return successful arrays containing only the selected students/class, history
must remain complete, and final live/daily activity must cover every student.
The existing exact daily-seconds and cross-school event denial checks remain.

Source timings distinguish initial event loads from incremental event reads.
Whole-dashboard refresh timing is also recorded. These logical timings overlap;
the `requests` field is not a sum of distinct HTTP requests in this mode. The
existing `snapshotHttpRequests` counts teacher-client HTTP calls across all six
sources. Reports include per-class refresh counts, new-event counts and final
source row counts (live activity, events, lessons, quizzes, assessments, daily).
No student identifiers, credentials or event payloads are exported in reports.

Run from the checkout holding the isolated local fixtures:

```sh
SCALE_SCENARIO=dashboard-mixed SCALE_GROUP_COUNT=20 SCALE_DURATION_SECONDS=60 \
  node --experimental-strip-types scripts/staging/capacity-local.mjs
```

The local URL guard remains mandatory. Output uses a separate
`capacity-500-dashboard-mixed-result.json`; the full-history report is preserved.

## Results

| Students / run | Teachers | Login p95 ms | Initial events p95 ms | Incremental events p95 ms | Verified new events | Overall gate |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 100 | 4 | 769 | 1371 | 380 | 200 | Fail |
| 500 | 20 | 2922 | 7261 | 585 | 1000 | Fail |
| 500-repeat | 20 | 2567 | 5371 | 437 | 1000 | Fail |

Every run had zero failed requests and zero journey/assertion failures. Every
expected activity increment was preserved and every new event was observed once
by its correct teacher. All six read sources succeeded. Each teacher completed
three refreshes. The strict latency gate failed in all three runs.

The two 500-student runs reproduce expensive initial history loads while later
incremental reads are under the one-second p95 target. This does not isolate a
specific slow query: initial page sequences overlap with login, student writes
and the other five dashboard sources. The next targeted investigation is timing
and query-plan evidence for that initial overlap. Do not increase pool settings
or claim 10,000-user readiness based on faster subsequent refreshes.

Existing canonical attempt fixtures are uneven: the four original classes have
lesson, quiz and assessment evidence; some later fixture classes have zero rows
in those sources. This limits completion-history volume coverage at 500 students.
The reports retain all source row counts so empty reads cannot be mistaken for
large-history validation.

Aggregate evidence: `incremental-dashboard-summary-2026-11-17.json`.
Private complete reports and logs:
`/Users/seanjohns/reliq-audits/2026-11-17/dashboard-mixed/`.


## Limits

The 30-second periodic path is covered. The actual UI additionally reacts to
realtime messages, invalidates its reader for updates/deletes, handles reconnects,
and coalesces refreshes. Those delivery/scheduling paths are not exercised here.
Live-session creation, focused-student timelines and browser focus/visibility
refreshes are also excluded. The 60-second run does not reach the reader's five-minute full reconciliation.
No screen rendering, connection interruptions, delayed/backdated commits, new
canonical lesson/quiz completion or production-equivalent cloud resources are
covered. Completion tables contain pre-existing synthetic evidence; their row
counts are reported and may differ between fixture classes. Loading these rows
is not proof of correctness for a new completion.

The 100-student run is a functional validation, not a readiness approval. The
500-student run continues the already-open diagnostic investigation; it does not
advance a passed capacity gate. Keep the strict p95/p99 criteria unchanged.

## Verification

Node 24 syntax, targeted QA ESLint and diff whitespace checks passed. The new
scenario ran against the actual local database/API at 100 students and twice at
500 students. Final original-runtime preflight and 25-student / 175-request smoke
passed. No API container or pool configuration was changed in these runs.

Only the local diagnostic script and performance documentation changed; no
application build or production deployment was required. Synthetic history and
event fixtures remain isolated locally for repeatable investigation.
