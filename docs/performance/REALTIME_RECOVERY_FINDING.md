# Realtime recovery regression — 28 October 2026

## Application readiness reconciliation — 18 November

LiveClassPanel now invalidates its event snapshot and requests a prompt refresh
when Postgres Changes reports system status `ok`, once per ready connection.
Channel SUBSCRIBED alone is not database-stream readiness. A late SUBSCRIBED
acknowledgement does not invalidate a snapshot already started at readiness.
Hidden tabs defer this refresh until visible. The shared coalescer's explicit
recovery option bypasses the timer, but never overlaps an in-flight read;
ordinary event bursts retain their existing intervals. No schema, permissions,
student saves or screen-sharing functionality changed.

The executable panel-wiring test covers readiness during an in-flight initial
read, an already queued timer, duplicate/unrelated readiness messages, reconnect,
late channel acknowledgement, hidden/visible transitions, normal rate limits and
cleanup. The existing event-reader tests separately cover complete snapshots,
invalidations, pagination, deduplication and isolation.

The 18 November local controlled-subscription diagnostic still fails its raw
`initialDelivery` check: SUBSCRIBED at 385 ms, saved marker response at 424 ms,
Postgres readiness at 1,517 ms. All nine other recovery checks pass, with the
initial marker recovered in the snapshot. This diagnostic does not run the panel
scheduler and is deliberately not reclassified as a pass. Local temporary
policies were restored. This fix reconciles saved activity; it does not guarantee
delivery of notifications emitted before stream readiness. Browser/device and
concurrent-load verification of this new hook remain outstanding.

Validation: all 17 critical checks, QA lint, targeted test lint, typecheck and the
full npm build (including prebuild audits) passed. No migration is required.

## Automatic socket recovery and startup gap — 17 November

`SCALE_RECONNECT_MODE=socket` now routes only the synthetic teacher WebSocket
through a loopback TCP proxy. It closes the connection, refuses reconnections
during the fault and restores forwarding while leaving the same channel mounted.
No explicit reconnect/subscribe call is made after the fault; SDK retry/backoff
defaults are unchanged. Student saves and teacher REST polling remain direct.
Proxy bytes and handshake URLs are never inspected or logged. Its listener and
sockets are closed in cleanup. Default controlled-subscription mode remains.

Three warm instrumented runs passed all twelve checks. Automatic private rejoin
took 6,579 / 6,546 / 6,608 ms after forwarding was restored, within the test's
explicit 15-second rejoin bound. Offline polling recovered one marker, rejoin
reconciliation recovered another, and every marker appeared exactly once in
class-isolated snapshots over more than 5,900 events. Live delivery retains its
separate five-second deadline. These results do not establish a browser SLA or
whole-device network-loss recovery: REST stayed available and polling was called
directly rather than through the component scheduler.

The initial socket run missed its first notification but passed all recovery
checks. Instrumentation was added for relative channel transition, database-stream
system status and marker send/response times, without identities or credentials.
A fresh local Realtime-service start reproduced the notification gap after a
successful fresh container health check:

| Signal | Milliseconds from test start |
| --- | ---: |
| Channel SUBSCRIBED | 256 |
| Early marker request / successful response | 257 / 294 |
| Postgres Changes system `ok` | 1,464 |
| Post-readiness marker request / successful response | 5,310 / 5,371 |

The early notification missed its five-second deadline; the post-readiness marker
arrived. Both were present in the subsequent complete snapshot. Automatic rejoin
after the later fault took 6,533 ms and recovered all offline markers. This is
concrete evidence of a local startup notification gap between channel join and
database-stream readiness, not lost persisted learning data. It does not prove
the cause of every earlier intermittent notification miss. This run still fails
the initial-delivery gate; its failure is not discarded or reclassified as a pass.

One preceding cold-start attempt ran before service readiness and failed its
join before student writes; that setup failure is retained separately. The final
default subscription-mode regression passed. All seven outcomes are preserved
in `socket-reconnect-2026-11-17.json`. Private orchestration/logs:
`/Users/seanjohns/reliq-audits/2026-11-17/socket-reconnect/`.

Only local test code changed. The local Realtime container was restarted for the
cold-start checks, then verified healthy. Prepared private-channel policies were
temporarily applied and removed; original policy absence was verified. Hosted
settings, application code, lessons and visuals are unchanged. Synthetic markers
remain locally. Syntax, targeted QA ESLint, invalid-mode guard, event-reader and
dashboard-loading tests, final preflight, 175-request smoke and diff checks passed.
No release build was needed for these diagnostic-only changes.

Next targeted application work: reconcile a snapshot when the database stream
becomes ready, preserving coalesced refreshes, polling and private permissions.
Test the startup gap against that behavior before calling it fixed. Do not assume
SUBSCRIBED alone means events saved during startup were delivered. The separate
500-student latency failures and 10,000-user gate remain open.

## Current private-channel and incremental-reader check — 17 November

The runner now uses `createLiveClassEventReader` and the same private
`live-class-<UUID>` topic as LiveClassPanel. Its insert and rejoin hooks mirror
the component's reader invalidation. A validated student session writes markers;
an ordinary authenticated teacher reads them, with no service-role workload.

It verifies a multi-page initial snapshot, removal of the subscription, recovery
of a missed event through the existing reader's incremental polling, and recovery
of another unpolled event after private rejoin invalidates the snapshot. The
final snapshot must contain each marker exactly once, only the selected class's
students, and no duplicate IDs. A further unchanged read must preserve the data
reference. Latest-15 timeline verification remains; the obsolete direct-table
comparison is removed from this current test, while historical evidence below
is retained. No application code changed.

The first run missed its initial notification within the unchanged five-second
deadline and failed before reaching recovery checks. Two unchanged repeats
passed. Reporting was then improved to record channel statuses and continue
testing polling even if a delivery deadline is missed; any missed delivery
still fails the report. Both final-version runs passed all nine checks, with
initial histories of 5,935 and 5,939 events and expected SUBSCRIBED/CLOSED/rejoin
status sequences. Preserve the initial failure: its cause has not been isolated,
and later passes do not establish universally reliable realtime delivery.

The prepared policies in `supabase/manual/screen-sharing-retirement/prepare.sql`
were temporarily applied to the isolated local database for each test batch,
then removed and their original absence verified. They are prerequisites for
private joins; no hosted configuration was changed. Synthetic test events remain
locally. This remains controlled unsubscribe/rejoin, not automatic socket retry,
physical network loss, a browser timer test or concurrent reconnect load.

Syntax, targeted QA ESLint, event-reader regression tests, teacher-dashboard
loading tests, and diff checks passed. Restored local preflight and smoke checks
are recorded with this work. No release build is required for this diagnostic-only
change. Evidence includes the failed first run and all four later passes in
`private-reconnect-2026-11-17.json`; private orchestration/logs are in
`/Users/seanjohns/reliq-audits/2026-11-17/private-reconnect/`.

Next: observe subscription startup readiness and automatic transport recovery
in a controlled browser/staging test. Do not relax delivery timeouts or remove
polling to make this check appear reliable.

## Historical truncation finding

Status: fixed and verified locally by paginated event reads (28 October 2026). The original failing result below is retained as evidence. Do not treat the previous throughput and
completion checks as proof of event-snapshot recovery or increase the capacity
claim on their basis.

The local fixture had 5,000 historical events per class. At the time of the
original failure, `fetchLiveClassEvents` performed an ascending class event read without pagination.
The API returns the oldest 1,000 matching rows. New events persist and appear in
the latest-15 student timeline, but are omitted from the class snapshot used by
polling and realtime-triggered refreshes. The original direct table query has the
same issue; the class-scoped permission optimization did not introduce it.

The regression runner uses ordinary teacher authentication, a validated student
session and the actual application helper. It verifies:

1. An event is delivered while the subscription is active.
2. The subscription is removed, then another event is saved.
3. The fallback class query should recover the missed event (currently fails).
4. The student's latest-15 timeline confirms that event exists (passes).
5. A new subscription receives a new event (passes).
6. The class refresh should include the new event (currently fails).

This is controlled subscription removal/recreation, not an operating-system
network outage or automatic WebSocket reconnection test. It calls the fallback
query directly rather than driving the component's 30-second timer. Those broader
browser-level cases remain untested.

Run against the existing local fixtures and event publication:

```sh
node --experimental-strip-types scripts/staging/reconnect-local.mjs
```

The command exits nonzero if recovery assertions fail. It now passes against the paginated application helper; it remains a local integration check outside critical QA. Results contain no credentials or
student identifiers. Test events remain in the isolated local database.

Impact: the class event snapshot can omit recent activity. The dashboard also
uses current-activity rows and canonical attempts, so this does not establish
that every live card is stale or that student saves are lost. Its event-derived
current-attempt calculations cannot safely rely on a truncated history.

Further scale optimisation: define a complete, bounded current-attempt event read per student and
preserve canonical saved-score/history semantics. Inspect both dashboard consumers
before choosing pagination or server aggregation. Merely reversing the sort to
return the newest 1,000 class events can still drop quieter students or truncate
an attempt; removing the response cap transfers an ever-growing history on every
refresh. Validate with more than 1,000 events, mixed active/quiet students, attempt
boundaries, and the existing role/retry tests before rollout.
