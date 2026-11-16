# Local recovery and supporting SQL profile — 16 November 2026

## Recovery

Docker stopped before the first workload; that failed attempt produced no capacity
result. On restart, the original REST container could not start because earlier
pool-experiment restoration had pinned its previous address. Auth received that
address during Docker startup. This was a test-orchestration restoration error,
not an application or production failure.

Restored automatic address allocation on the original REST network attachment,
preserving its rest alias. Also corrected all three private pool experiment scripts'
finally blocks to reconnect without a fixed address. Gateway tuning was reapplied.
The old preflight could pass while REST was stopped; it now requires database,
REST, auth and gateway containers to be running, REST's correct alias and automatic
addressing, and a successful authenticated anon HTTP request to the REST root.
It correctly rejected HTTP 503 during startup and passed once REST was ready.

The worktree's dependency symlink also pointed into a temporary folder that had
been cleared. Repointed only that symlink to existing original-checkout dependencies;
Supabase JS 2.98.0 and ESLint 9.39.2 matched this worktree's lockfile. No dependency
upgrades or lockfile changes. Cancelled npx's attempted fallback installation;
ran the installed ESLint executable directly. The original checkout was not edited.

Restored-stack smoke passed 25 student journeys and 175 requests with exact activity
writes. These repairs affect only the local test environment and its safeguards.

## Successful profiled run

Unchanged 500-student student-only burst, zero ramp, original pool of 10:
- No failed requests; all 500 persisted presence checks and 1,000 exact increments passed.
- Login p95 2,066 ms: unchanged latency gate still fails.
- 500 login SQL calls averaged 0.483 ms execution.
- 5,000 student session-configuration calls averaged 0.0226 ms execution.
- Student context/activity/presence statements averaged about 1.47–1.80 ms.
- 69 samples of backend state and wait events were captured.

Supporting session-command execution does not account for the end-to-end delay.
This does not eliminate PostgreSQL planning, commit/WAL/network time, connection
lifecycle or API scheduling: planning/I/O timing are disabled and statement timing
is not full transaction timing. COMMIT samples did not cover every student request,
so they cannot certify negligible commit cost. No code or configuration tuning fix
is established. The mixed 500-user gate and production capacity remain unverified.

The new profiler exports statement identifiers, categories and aggregate counters,
never SQL text, argument values or tokens. Fixture provisioning is collected too:
the service-role 200-call set_config-containing statement is the fixture phase,
not student session setup. The follow-up explicit workload-role field separates
student anon and service-role preparation; aggregate evidence here selects the
verified anon role. Numeric role IDs are specific to this isolated database.

Private evidence: /Users/seanjohns/reliq-audits/2026-11-16/transaction-profile/.
Summary: transaction-profile-summary-2026-11-16.json. Initial failed attempts remain
in their logs; the successful load-final/monitor-final pair is the measured run.
Syntax, targeted QA ESLint and diff checks passed. No release build is needed for
local-only diagnostic scripts. No production data, schema, access grants, lessons
or visuals changed. Nothing deployed.

## Next

The next useful measurement is SQL planning and transaction completion timing,
with any temporary local instrumentation restored afterward. Keep the baseline
pool and existing thresholds; do not replace the burst test with staggered arrivals
or extrapolate from local results to cloud capacity.
