# Local 500-student rehearsal — 16 November 2026

## Outcome

Performance gate **failed**; activity integrity passed. This is a local Mac/Docker
protocol test, not a production capacity certification. No application UI,
production database, grants or schema changed in this step.

- 500 distinct students across 20 synthetic schools/classes; 20 ordinary teachers.
- 100,000 deterministic historical events; simultaneous student login burst.
- 121 seconds; 8,122 recorded operations, including 1,100 logical teacher snapshots.
- 12,155 snapshot HTTP requests: 19,177 measured HTTP requests overall.
- Zero failed requests or journeys; 500 presence checks and 2,001 exact activity increments verified.
- 20 cross-school teacher requests rejected before measured load.
- Login p95/p99: 2,465/3,286 ms. Runtime context: 2,616/3,570 ms.
- Activity-write p95/p99: 1,010/2,087 ms. Teacher snapshots: 293/5,752 ms.
- Gate remains p95 <1,000 ms, p99 <3,000 ms for every measured endpoint.

The unchanged assertions correctly returned exit status 1. No larger stage was run.
Aggregate evidence: `capacity-local-500-2026-11-16.json`.
Private logs and resource samples: `/Users/seanjohns/reliq-audits/2026-11-16/capacity-500/`.
Do not commit account files, tokens or database dumps.

## Environment and validation

Docker was stopped at the start. Restarted existing services, restored the local
gateway's 4,096 connections, then passed runtime/schema preflight. Database image
is 17.6.1.156. Six resource samples had no sampling errors; all observed database
connection counts were 27. First sampled REST CPU was 434.67% (multiple CPU cores).
Sparse samples do not establish the bottleneck or prove peak connection headroom.

Seeder now accepts groups 2–20. Runner accepts SCALE_GROUP_COUNT=4–20, defaults to
4, verifies 25 students per group and distinct student/teacher/school/class IDs,
and writes capacity-N-result.json. Local URL restrictions remain unchanged.
All 16 new groups passed login, session-denial and persisted-activity smoke tests.
Syntax, targeted QA ESLint, diff whitespace, and 11 invalid configuration checks
passed. Initial default ESLint ignored these scripts; explicit QA config was used
and Node runtime globals declared. No app build was needed for test-only edits.

Run from the original checkout, where private local configuration resides, using
scripts from the review worktree:

```sh
node /Users/seanjohns/reliq-worktrees/safe-local-development/scripts/staging/preflight-local.mjs
SCALE_GROUP_COUNT=20 SCALE_DURATION_SECONDS=120 node --experimental-strip-types /Users/seanjohns/reliq-worktrees/safe-local-development/scripts/staging/capacity-local.mjs
```

## Next investigation and limits

Separate bell-time student load from historical teacher reads to attribute latency,
then add a separately labelled current-UI incremental teacher scenario. Preserve
this full-history-every-two-seconds stress scenario and its failed evidence. The
current product uses incremental reads with a different refresh schedule.

This run excludes canonical lesson/assessment saves and retry integrity, full
teacher dashboard reads, realtime delivery, browser/3D/iPad performance, long soak
and managed-cloud resources. Earlier completion checks covered 100, not 500,
students. No claim of supporting 500 or 10,000 live users follows from this result.
