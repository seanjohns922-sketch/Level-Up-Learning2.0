# Current-class index candidate — 17 November 2026

## Smallest change

Migration `20261117090000_index_student_current_class.sql` adds one non-unique
B-tree index, `public.students_class_id_idx`, on `students(class_id)`. Current
repository migrations and the local catalog had no equivalent leading-class
index. No application code, business logic, access helper, grant, RLS policy or
student row changes. This avoids introducing a second authorization system to
address a lookup-cost problem.

Index creation requires a table lock and adds storage/write-maintenance cost.
The migration uses a five-second lock timeout and sixty-second statement timeout
inside a transaction, failing rather than blocking writers indefinitely. Apply
in a quiet window after checking the target catalog for an equivalent existing
index; the hosted catalog has not been inspected. Deployment of application code
alone does not apply this SQL. Rollback removes this index; permissions and data
remain unchanged. No production application is performed by this work.

## Why it helps

The original attempt-history permission subplan scanned roughly 503 students to
find the teacher's 26 visible class students. The indexed plan instead selected
those students through a bitmap index scan before evaluating their access rules.
All existing permission checks remained active. This removes avoidable scanning
without relying on policy deletion, changed grants or duplicated role rules.

Representative authenticated reads returned the same 744 lesson, 248 quiz and
496 assessment rows in both plans. The original restored baseline from the prior
profile took 81.134 / 80.223 / 80.041 ms; the transaction-only index test took
16.223 / 9.179 / 9.119 ms respectively. Event-head timing was essentially unchanged
(1.219 versus 1.298 ms). Plans were measured outside load and are not production
benchmarks. The diagnostic index was rolled back after each plan.

## Mixed workload comparison

The migration was then applied to the isolated local database for a fresh
500-student / 20-teacher six-source dashboard run, after an unchanged baseline.
Original official PostgREST 14.8 and pool settings were preserved.

| p95 latency | Original | With index |
| --- | ---: | ---: |
| Student login | 2,461 ms | 2,420 ms |
| Lesson-attempt read | 1,994 ms | 2,472 ms |
| Initial event load | 5,611 ms | 4,997 ms |
| Incremental event read | 412 ms | 131 ms |

Both runs preserved exactly 1,000 activity increments and 1,000 new events,
verified all 500 student presence records and had zero request/journey failures.
Both failed the unchanged latency gate. This single sequential pair does not
prove an overall speedup: some endpoints improved and one worsened. The concrete
query-plan improvement is narrower than whole-platform capacity readiness.
Local run-to-run variability, simultaneous sign-ins and API waiting remain.

## Maintainability and release status

The candidate is one short migration with its purpose, bounded lock behavior
and rollback documented. No new front-end branch, permission helper or caching
layer is introduced. Keep this candidate separate from any later runtime tuning.
Before broader rollout, recheck the target catalog and repeat mixed-load evidence;
10,000 simultaneous users remain unverified.

Validation passed: `qa:critical`, `lint:qa`, `typecheck`, and the full prebuild /
production build. The migration applied successfully to the local database and
its index definition was verified. The comparison runner removed it in a finally
block and verified absence; the original local preflight and 175-request smoke
passed afterward. All production policies remain untouched. Diff whitespace
checks passed. The migration is prepared in code, not applied to production.

Evidence: `student-class-index-summary-2026-11-17.json`.
Private orchestration, complete reports and check logs:
`/Users/seanjohns/reliq-audits/2026-11-17/student-class-index/`.
