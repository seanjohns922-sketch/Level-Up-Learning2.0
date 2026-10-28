# Class-scoped event reads

Migration: `20261028150000_optimize_live_class_event_reads.sql`.

The authenticated RPC checks the existing `can_view_class` permission once before
reading events for that class. This removes repeated permission evaluation per
row. It changes no tables, indexes, RLS policies or stored student data. Execute is
revoked from PUBLIC and anon, and granted to authenticated. The security-definer
function pins its search path and always applies the class filter. Its permission
check matches the current table policy; review this function whenever event-table
policies change.

Both dashboard callers preserve their student/event filters and ascending order.
The student timeline preserves its latest-15 limit. Dashboard reads retain the
existing API response cap; no new history cutoff is introduced. Missing RPC
(PGRST202) falls back to the original RLS-protected query during rollout. Access
denials, timeouts and other errors do not fall back.

## Verification

Run `npm run qa:live-class-event-read` for client rollout/error-handling checks.
With the isolated local stack and synthetic fixtures prepared, run:

```
node scripts/staging/live-event-read-test.mjs
```

This runner permits only the local API at port 56521 and the named local Docker
container. It installs the migration locally, then rolls back all test data and
membership changes. SQL comparisons use 5,000 synthetic events and test ordinary
teacher, assigned support staff, principal, school admin, platform admin and
legacy-owner access, revoked access, unrelated classes, missing identity, filters,
ordering and limits. Real HTTP requests verify teacher success, unrelated-class
403/42501 and anonymous 401/42501 (403 is also accepted).

Creating the function and testing an anonymous EXECUTE denial in the same SQL
transaction crashed the local Supabase PostgreSQL backend. The final runner
installs the migration in a separate transaction and tests anonymous denial via
the actual API, which passes. The underlying local backend crash is not diagnosed;
no grants or denial assertions were relaxed. Production was unaffected.

A local authenticated benchmark on 50,000 synthetic events with an outer
1,000-row limit measured 109.503 ms for the original query and 22.920 ms for the
RPC. This is a single local comparison, not a production latency or capacity
claim. The RPC still materializes all matching history before the outer limit;
the benchmark used temporary disk buffers. Larger histories and concurrent load
must be measured before claiming readiness for 10,000 users. A future bounded
read needs an explicit product decision about historical dashboard semantics.

## Rollout and rollback

Apply the migration through the normal reviewed database release process, then
deploy the app (either order is supported by the fallback). Neither production
migration nor deployment was performed as part of the local verification.
Verify teacher dashboards and timelines after release and compare new query
statistics over a fresh observation window, rather than lifetime averages.

To roll back, revert the app change, then run `rollback.sql` and reload PostgREST's
schema cache. No data restoration is required. Do not run a blanket database push
that includes unrelated pending migrations.

## Complete snapshots follow-up

`20261028170000_page_live_class_events.sql` adds authenticated keyset pages with
mandatory upper timestamp/ID and optional complete lower cursor, ordered by timestamp
and ID, capped at 500 per page. The application fixes its upper cursor first and
continues until reaching that row or an empty page, even if the API returns fewer
than 500 rows. This removes the oldest-1,000 truncation in class snapshots while
preserving all history and explicit latest-15 timelines. Missing-function fallback
uses equivalent RLS table pages; access errors do not trigger fallback.

Run `node --experimental-strip-types scripts/staging/event-pages-local.mjs` for
actual API tied-timestamp/quiet-student/fallback parity, and
`node --experimental-strip-types scripts/staging/reconnect-local.mjs` for the
recovery regression. The access runner now installs both migrations locally.
Use `rollback-pages.sql` for the new function only. These pages still transfer full
history across multiple requests; they do not solve long-term history growth.
