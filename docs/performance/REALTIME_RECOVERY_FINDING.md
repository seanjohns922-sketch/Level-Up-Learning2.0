# Realtime recovery regression — 28 October 2026

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
