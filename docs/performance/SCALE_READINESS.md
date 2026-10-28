# Capacity preparation — 28 October 2026

Status: initial code inspection and dashboard evidence, not capacity certification.
No production load test, database migration or hosting upgrade was performed.

## Observed baseline

- Vercel project `level-up-learning-app` is on Pro. Its production Functions view
  showed 357 invocations in the displayed 12-hour window (01:42–13:42). This is a
  small sample. Student Supabase requests run directly from the browser, so this
  Vercel number does not represent total application/database traffic.
- Supabase organization displays Pro and the linked branch displays production.
  Database compute size, CPU, memory, I/O, pool limits and peak database request
  rates are not yet verified. The native dashboard interface exposed a navigation
  overlay rather than the compute/resource details.
- No existing load-test suite was found in the repository.
- Student tracking runs every 30 seconds while visible, focused and recently
  active. A school student can issue a presence RPC plus a daily-activity RPC each
  cycle: approximately 667 RPCs/second at 10,000 continuously active students,
  before answers, progress reads/writes or teacher traffic. This is an arithmetic
  workload estimate, not an observed request rate or measured capacity ceiling.
- Each LiveClassPanel snapshot has six reads. Four realtime subscriptions, focus,
  visibility and a 30-second fallback can all request snapshots. Before this patch,
  requests could overlap and each event could launch another six reads.
- The event/attempt queries fetch historical data without explicit pagination/date
  bounds in several paths. Data growth and server response caps require a separate
  correctness-aware query review; arbitrary limits would hide student evidence.

## Initial application change

LiveClassPanel now shares a refresh scheduler across realtime, focus, visibility
and polling. Only one read batch per mounted class view can run at once; starts are at least two seconds
apart. Events during a read retain one follow-up refresh. Hidden tabs skip reads,
and becoming visible requests fresh data. Class changes/unmount cancel queued
work; existing response guards prevent old-class results from being published.
The 30-second fallback, canonical queries, subscriptions and permissions remain.

This reduces redundant snapshots without dropping learning writes. It does not
solve historical query size, other dashboard polling, student RPC cost, browser
rendering or database capacity. Rollback is an application-code revert.

## Isolated capacity test

Use a dedicated staging application and separate Supabase database with the same
schema, indexes, RLS, function settings, compute class and region as production.
Ensure preview environment variables point to staging, not production. Seed only
synthetic schools, teachers and students. Use actual authenticated teacher roles
and validated student-session headers, never service-role traffic as the workload.
Service access may provision isolated fixtures but must not bypass workload checks.
Keep mail, analytics and external integrations isolated. Do not create a paid
project or upgrade compute until its concrete cost is approved.

Two scenarios must be reported separately:

1. 10,000 daily students: estimate concurrency from session length and school hours.
   At one 30-minute session each over six hours, the average is about 833 concurrent
   students. Bell-time peaks will be higher; measure or test a conservative peak.
2. 10,000 simultaneous students: a separate explicit stress target, not inferred
   from daily usage or a successful homepage request test.

Start with 25 concurrent synthetic students and one teacher, then ramp through
100, 500, 1,000, 2,500, 5,000 and 10,000 students only while prior stages pass.
Use realistic think time and a teacher per 25 students. Exercise synchronized
login, world startup, diagnostic resume, lesson answers, quiz/pre/post completion,
progress reload, heartbeat traffic, live dashboards and class switching. Include
sustained traffic for at least 30 minutes, a bell-time login burst and a longer soak
at the intended operating load. Generate distinct identities and idempotency keys;
replay identical submissions only in an explicit retry-integrity scenario.

Proposed release gates (confirm against expected classroom experience):

- At least 99.9% successful expected requests, no lost/duplicated canonical saves,
  no cross-student/class data, and no false success acknowledgements.
- Login and canonical save p95 under 1 second and p99 under 3 seconds; report
  endpoint distributions separately, not just one blended average.
- Teacher progress reflects successful saves within five seconds under normal
  realtime delivery; verify fallback recovery after a disconnected subscription.
- Database CPU, I/O, memory, connections and queueing have measured headroom at
  the chosen operating load. Establish the maximum tested passing load rather
  than guessing a safe user count from CPU alone.
- Browser page/interaction performance measured separately on representative iPads;
  protocol load generators do not measure WebGL rendering or layout shifts.

Stop increasing load when gates fail. Retain latency/error distributions, query
plans, database resource graphs, connection peaks, rate-limit responses, realtime
lag and canonical before/after assertions. Compare actual metered resource use
with current vendor pricing to estimate cost per school-day and peak compute.

## Remaining evidence

An isolated local environment and synthetic accounts are now prepared; see the setup below. A production-equivalent cloud load-test destination remains unverified.
The read-only `scripts/sql/scale-readiness-baseline.sql` collects database size,
connection state, table estimates and query timing counters without student rows
or SQL text. It was executed read-only against production. The CLI returned the final query-counter result; database-size/cache statistics were also collected separately. Inspect high-cost query
plans and deployed indexes before choosing further changes. Do not reset production
statistics. Compare timed snapshots, because cumulative counters are not rates.

The deferred security follow-up remains a separate prerequisite for wider rollout:
see `docs/SECURITY_FOLLOW_UP.md`. This capacity pass does not complete that audit.


## Verified database evidence and local setup

Read-only production inspection found a 285 MB database, 47 MB of indexes and
212 MB of tables. Cache-hit ratios rounded to 1.00 over roughly 78 days since
statistics reset. These cumulative ratios do not establish current peak headroom.
The costliest recorded query shape referenced `live_activity_events`: roughly
13,900 calls at 2.30 seconds mean execution time. Another event-query shape averaged
1.25 seconds. Several assessment/attempt reads averaged 0.24–0.96 seconds. Query
plans, bounded history retrieval and RLS cost are the next investigation; no
production query, index or policy was modified in this pass.

The existing cloud `level-up-staging` project was found through the CLI. Exact
aggregate counts were zero students, schools and auth users; database size 19 MB.
Its migration history is empty and current-schema parity is unknown. No schema or
fixture writes were made to that cloud project. Its link metadata is isolated under
`.local-archive/scale-staging`; the repository production link is unchanged.

A separate local Supabase project `reliq-scale-local` now runs on API port 56521
and database port 56522. It contains a schema-only snapshot of production's public
schema, plus the pg_trgm extension dependency, with no production table data.
The snapshot is stored privately at `.local-archive/scale-local/schema.sql`.
Auth/storage configuration, realtime publication membership and catalogue/voice
assets are not a complete clone; these must be aligned before full journey tests.
The local fixture adds one school, one class, one ordinary teacher and 25 synthetic
students. A further synthetic student was created by the application API smoke.
Provisioning privileges are removed from the teacher before workload checks.

The app is available at `http://127.0.0.1:3100/login`. It runs from a separate
ignored source/build directory; the normal app's `.env.local`, build and generated
route types remain unchanged. Both browser and server database callers now share
explicit configuration. Staging mode rejects missing settings or the production
Supabase host. Public voice URLs are pointed at local storage for this app.

Local-only credentials are in `.local-archive/scale-local/synthetic-accounts.json`
(mode 0600). Do not commit credentials or copy them into a cloud deployment.

To resume this prepared environment from the repository:

```sh
npx --yes supabase@2.92.1 start --workdir .local-archive/scale-local --exclude studio,imgproxy,logflare,vector,supavisor,edge-runtime
npx --yes supabase@2.92.1 status --workdir .local-archive/scale-local --output env > .local-archive/scale-local/status.env
chmod 600 .local-archive/scale-local/status.env
npm run staging:seed
npm run staging:app
# In another terminal:
npm run staging:smoke
```

Use the installed Supabase CLI (2.92.1 was used for the local stack). These commands
resume existing local volumes; they do not reconstruct an empty database. For a
fresh installation, initialize a separate local project with the documented ports,
restore only the schema snapshot inside a transaction, enable pg_trgm locally, and
then run the fixture. Never run a reset against the linked production project.
The fixture and smoke scripts reject any API hostname other than loopback and any
port other than 56521. The application launcher also applies that guard.
Stop the app with Ctrl+C and stop this database with
`npx --yes supabase@2.92.1 stop --workdir .local-archive/scale-local` (retain its volumes).

### Validation

- Production build including prebuild checks, typecheck, affected component lint,
  lint:qa, PA4 audit (159 checks), and critical QA (15 checks) passed.
- New scheduler tests cover event bursts, slow reads, retained trailing refreshes,
  failed requests, cleanup, all four realtime subscriptions and visibility/focus.
- Staging configuration tests cover production defaults, non-production URL-without-key rejection,
  rejecting production in staging mode and shared browser/server imports.
- Local login HTTP 200 and a real authenticated teacher command through Next.js
  verified the app uses the isolated database.
- Real anon student login, valid context, rejected cross-student/missing sessions,
  presence, persisted activity and ordinary teacher reads passed.
- A 25-student concurrent local smoke issued 150 RPCs, with zero failures and
  individual activity writes verified. Endpoint p95 was 43–76 ms in this short
  local run. This is not a cloud benchmark, sustained test or 10,000-user result.
- One initial harness run failed to parse a successful empty RPC response; the
  parser was corrected and the complete smoke then passed. No app behaviour or
  test acceptance criteria were weakened.

The next capacity stage needs realistic historical fixture volumes, actual lesson
and assessment completion/retry checks, live realtime delivery, teacher fan-out,
bell-time bursts and a cloud environment matching production resources. Do not
extrapolate the small local smoke result to a supported production user count.

## 100-student local checkpoint — 28 October 2026

The next protocol rehearsal passed on the isolated local stack: 100 distinct
students across four synthetic schools/classes, four ordinary teachers, and
5,000 synthetic historical events per class. The event-read migration was already
installed locally. No production traffic or cloud changes were made.

A synchronized student login burst was followed by 120 seconds of presence and
activity writes every 30 seconds, with each teacher requesting class events every
two seconds. The run recorded 1,440 expected requests, zero HTTP failures, zero
journey assertion failures, and all 400 activity writes read back with the exact
expected per-student increase. Cross-school teacher requests were denied before
the run; returned event rows were checked for class/student scope throughout.

| Endpoint | Requests | p95 | p99 |
| --- | ---: | ---: | ---: |
| Student login | 100 | 414 ms | 440 ms |
| Runtime context | 100 | 269 ms | 281 ms |
| Teacher event read | 236 | 51 ms | 185 ms |
| Daily activity read | 200 | 150 ms | 217 ms |
| Presence update | 400 | 100 ms | 187 ms |
| Daily activity write | 400 | 73 ms | 142 ms |

Four teacher logins also passed (maximum 114 ms). Machine-readable aggregate
results are in `capacity-local-100-2026-10-28.json`; no identities or credentials
are included. A single during-run resource sample showed local PostgreSQL using
168.2 MiB and 0.24% CPU; another sample showed 27 total connections and one active
connection including the observer. These are point samples, not peak/headroom
measurements, and must not be extrapolated to production.

Repeat after preparing the original local fixture and installing the local
event-read migration:

```sh
SCALE_FIXTURE_GROUP=2 node scripts/staging/seed-local.mjs
SCALE_FIXTURE_GROUP=3 node scripts/staging/seed-local.mjs
SCALE_FIXTURE_GROUP=4 node scripts/staging/seed-local.mjs
node scripts/staging/capacity-local.mjs
```

Fixtures use separate private credential files and deterministic history IDs so
repeat provisioning does not duplicate events. Run only one workload against
these fixtures at a time; concurrent runs would invalidate exact activity-delta
assertions. Synthetic events/accounts/activity remain in the isolated database
for repeat tests. The original 25-student fixture and smoke command remain usable.
`SCALE_DURATION_SECONDS` can set a duration from 60 to 1,800 seconds; the result
above used the default 120 seconds, **not** a 30-minute sustained test.

This checkpoint covers protocol login/context, activity persistence and the
optimized event feed. It excludes canonical lesson/assessment completion and
retry integrity, the other five dashboard reads, realtime propagation, browser
rendering and production-equivalent resources. Complete those workload paths and
resource monitoring before increasing load or claiming 10,000-user readiness.
The existing cloud staging project's schema/configuration/compute parity remains
unverified. The deferred security follow-up remains outstanding for wider rollout.

Validation for this test-only change: JavaScript syntax checks, `lint:qa`, fixture
provisioning/permission smoke and the actual two-minute rehearsal passed. No
production application code changed; a new app build was not required.
