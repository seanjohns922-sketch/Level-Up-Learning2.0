# Realtime recovery regression — 28 October 2026

Status: reproduced locally; unresolved. Do not treat the previous throughput and
completion checks as proof of event-snapshot recovery or increase the capacity
claim on their basis.

The local fixture has 5,000 historical events per class. The application helper
`fetchLiveClassEvents` performs an ascending class event read without pagination.
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

The command intentionally exits nonzero while the recovery assertions fail. It is
not included in critical QA as a passing check. Results contain no credentials or
student identifiers. Test events remain in the isolated local database.

Impact: the class event snapshot can omit recent activity. The dashboard also
uses current-activity rows and canonical attempts, so this does not establish
that every live card is stale or that student saves are lost. Its event-derived
current-attempt calculations cannot safely rely on a truncated history.

Next fix: define a complete, bounded current-attempt event read per student and
preserve canonical saved-score/history semantics. Inspect both dashboard consumers
before choosing pagination or server aggregation. Merely reversing the sort to
return the newest 1,000 class events can still drop quieter students or truncate
an attempt; removing the response cap transfers an ever-growing history on every
refresh. Validate with more than 1,000 events, mixed active/quiet students, attempt
boundaries, and the existing role/retry tests before rollout.
