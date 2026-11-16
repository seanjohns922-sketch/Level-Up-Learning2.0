# Local gateway versus direct API — 16 November 2026

## Method

Four sequential, zero-ramp 500-student bursts in gateway / direct / direct /
gateway order. Each uses a fresh PostgREST v14.8 container, pool 10, default GHC
runtime and Server-Timing enabled. Each workload lasts at least 60 seconds;
fixture preparation is outside measured workload time. Database state is shared,
so reverse order reduces but does not eliminate cache/resource confounding.

Both routes use the same synthetic students, anon JWT and validated
x-student-session header. Each performs the existing cross-school access-denial
check using ordinary teachers before the measured load. Service credentials are
used only for deterministic fixture preparation. Teacher password authentication
continues through the original loopback gateway in both cases.

SCALE_REST_ROUTE=direct is allowed only for students-only runs and uses the fixed
http://127.0.0.1:56523 endpoint. It cannot accept a remote URL. The temporary REST
container publishes port 3000 only on host 127.0.0.1:56523. The gateway continues
to route to that same container via its rest alias. Direct mode removes only the
/rest/v1 URL prefix; the application authentication headers are retained. The
teacher SDK path is not switched, so direct mode explicitly excludes teacher load.
Direct mode includes REST fixture provisioning and cross-school checks as well as
student requests. Output filenames include -direct to avoid overwriting gateway
results, and every report records restRoute. Defaults remain unchanged.

This compares the complete gateway route with Docker's direct published-port
route, not an isolated measurement of gateway CPU. It cannot certify managed-cloud
capacity, security at the public edge, browser performance or canonical completions.
The same sub-second p95 and sub-three-second p99 thresholds remain in place.

Private orchestration and per-run logs:
/Users/seanjohns/reliq-audits/2026-11-16/gateway-comparison/.

## Results

| Run | Login p95 | Login p99 | Whole-run latency gate |
| --- | ---: | ---: | --- |
| Gateway first | 1,808 ms | 2,351 ms | Fail |
| Direct first | 1,902 ms | 2,799 ms | Fail |
| Direct repeat | 886 ms | 1,001 ms | Pass |
| Gateway repeat | 2,233 ms | 2,985 ms | Fail |

Each run completed 5,000 requests with zero failures, verified all 500 presence
records and exactly 1,000 activity increments. Each retained the 20 pre-load
cross-school denial assertions. Aggregate evidence: gateway-comparison-2026-11-16.json.

Bypassing the gateway did not reliably remove the delay. One direct run passed,
but its repeat varied substantially; no reliable production tuning recommendation
or single bottleneck is established. In the first pair, server transaction p95
was 1,589 ms through the gateway and 1,594 ms direct. Those are stage percentiles,
not a decomposition of one request. This remains consistent with time spent
inside the API transaction stage, which is broader than SQL execution alone.

The current mixed-load gate is still open. Do not increase to 1,000 users or
claim 10,000-user capacity from the one passing student-only run. The next useful
investigation is per-request pool-acquisition versus transaction-lifetime timing,
with repeatable resource measurements, rather than changing the public gateway.

## Restoration and checks

Removed the temporary published-port container and restored the original local
REST container with automatic network addressing. The local preflight passed,
and the restored-stack 25-student / 175-request smoke passed with exact activity
writes. Syntax, targeted QA ESLint and diff checks passed. Invalid route names
and direct mixed-load configurations were rejected before fixture operations.
No remote URL override, application code, schema, grants or public gateway
configuration was introduced. No release build was needed for diagnostic-only
changes. This work is on the separate review branch; main is unchanged.
