# Teacher dashboard loading investigation — 1 November 2026

Production inspection found the dashboard running deployment
`3iJkNx7x1BDJqnEjN9PAtBia8Nyx` (commit `7a148f0`). Three later deployments had
failed. The previously prepared dashboard loading fix was still local.

Chrome Network showed repeated 500-row `get_live_class_event_page_secure`
responses, commonly around 470 KB decoded each. During inspection the retained
network log grew to 3,066 requests, 149 MB transferred and 1,299 MB decoded;
Chrome subsequently labelled the tab crashed. These are cumulative observations,
not one page-load measurement or a production capacity benchmark.

Two consumers downloaded whole event history: the dashboard parent, for an
unused KPI, and Live Class, which awaited that history before publishing its
current activity data. Polling/focus/realtime refreshes repeated this work.

## Changes

- Remove the unused parent event-history request. Coalesce overlapping parent
  refreshes and guard class switches and explicit edits against stale responses.
- Publish roster, canonical progress and live activity independently. Display a
  loading state rather than treating pending progress as "Not placed".
- Give Live Class history its own scheduler, at most once per 30 seconds, so its
  initial historical scan cannot block current activity and completed attempts.
- Keep an in-memory event reader scoped to the mounted class. Refresh from the
  last successful cursor; an unchanged head requires no history page and reuses
  the same array reference. Failed deltas do not advance the cursor.
- Reconcile full history on reconnect, update/delete notifications, observed
  backdated inserts, and every five minutes to repair missed notifications.
  Invalidation during a read cannot publish a partial tail. Unmount stops further
  page requests. No student data is persisted in a new browser cache.
- Preserve existing secure RPCs, RLS, canonical progress and the limited drawer
  timeline. No migration or production data changes.

## Validation and limits

Regression checks cover independent progress loading, coalescing, stale class
responses, complete keyset paging including timestamp ties and server caps,
failed deltas, unchanged heads, reconnect/mutation invalidation, late inserts,
periodic reconciliation and cleanup. Production timing must be checked after
release; local QA is not evidence of production response time.

The first historical scan and periodic reconciliation still read full history.
A future compact server-side current-attempt projection would remove that work
entirely. Canonical progress also still performs multiple reads across six
realms. These changes address the observed loading dependency and repeated
history downloads; they do not certify a student concurrency limit.

Rollback: revert the dashboard performance commit and redeploy. No database
rollback is required.
