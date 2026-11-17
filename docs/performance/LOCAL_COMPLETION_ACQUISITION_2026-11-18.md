# Completion connection-acquisition trace — 18 November 2026

Four isolated runs used 500 synthetic students and 20 ordinary teachers, with
pool sizes 10, 10, 30, then 10. Each run preserved every saved attempt, exact XP,
canonical teacher result and all 500 realtime events. All 11,000 measured RPC
requests succeeded and all 3,000 deliberate access denials were verified per run.
All four failed the unchanged latency gate. Nothing was deployed or tuned on
hosted Supabase.

## HTTP response timings

All values are p95 milliseconds, measured by the existing completion runner.

| Run | Login | Lesson save | Quiz save | Assessment save | Gate |
| --- | ---: | ---: | ---: | ---: | --- |
| pool10 | 3907 | 1757 | 1877 | 2181 | Fail |
| pool10-repeat | 3088 | 1815 | 2082 | 2093 | Fail |
| pool30 | 1851 | 1508 | 1176 | 1248 | Fail |
| pool10-restored | 3293 | 2213 | 2324 | 1994 | Fail |

## Method

Extended the existing local PostgREST 14.8 diagnostic build with fixed labels for
lesson, quiz and assessment completion routes. Acquisition spans begin immediately
before Hasql pool use and end at the first instruction in the acquired session.
Connection-use spans end after pool use returns, including transaction and release
work. Acquisition includes connection establishment and runtime scheduling; it is
not solely queue time. No SQL, payload, identity or credentials are logged.

Every run must contain exactly 500 login, 6,000 lesson, 1,000 quiz and 2,000
assessment timing records. Lesson records include 3,000 deliberate denied calls
as well as 3,000 save/retry calls; they cannot be equated to the successful-save
HTTP distribution. Quiz and assessment counts include concurrent idempotent
retries. Fixed labels do not correlate individual client requests with API spans,
so independent HTTP/API percentiles must not be subtracted.

The binary was rebuilt offline from the cached upstream 14.8 source and compiler,
then the compiler stopped before testing. The diagnostic image is not identical
to Supabase's official binary. Logging and custom dependencies add uncertainty;
these results cannot establish a production capacity or direct speed comparison
against the official-image run. Binary and patch hashes are in the JSON report.

## Findings

For the 10 / 30 / restored-10 comparison, acquisition p95 was:

- Login: 1,252 / 143 / 726 ms.
- Lesson (including denials): 675 / 168 / 747 ms.
- Quiz: 517 / 115 / 942 ms.
- Assessment: 368 / 55 / 351 ms.

Connection-use p95 increased with pool 30: quiz use, for example, was roughly
32 / 68 / 41 ms across those same runs. Increasing concurrency has a cost as
well as reducing acquisition waiting. Every labelled API pool span at least one
second in the pool-10 runs spent at least 90.9% of that span in acquisition.
Pool 30 had no such one-second labelled pool spans, but end-to-end requests still
failed latency. This does not allocate the remaining HTTP time to a specific
stage: ingress, authentication, scheduling, output handling and transport are
not individually traced here.

The reversible comparison supports acquisition waiting as a contributor for
completion workloads in this custom local runtime. It does not justify changing
hosted pool settings. There is appreciable run-to-run variation even at pool 10,
and retakes accumulate synthetic history. The next bounded step is the same
completion comparison on the official image before recommending any setting.
Earlier official-image mixed-load pool experiments were inconsistent; retain
that contrary evidence. Full-history dashboard request volume remains a separate
candidate requiring correctness-preserving design.

## Restoration and validation

After each run the original local API container, automatic networking, original
absence of the temporary class index, and absence of the four temporary private-
channel policies were restored and verified. No production credentials or school
data were used. Synthetic completion fixtures remain isolated locally.

Final local preflight and the 25-student / 175-request smoke passed. Diagnostic
source compiled, the orchestration completed all count assertions, and exported
reports were checked for all integrity results. Only documentation/evidence is
changed in the application repository; no application build or migration is
required for this checkpoint. Browser/offline and 10,000-user validation remain
open.

Evidence: `completion-acquisition-2026-11-18.json`. Private source patch, compiler
log, runtime image recipe, runner, raw numeric timings and summarizer are under
`/Users/seanjohns/reliq-audits/2026-11-18/completion-acquisition/`.
