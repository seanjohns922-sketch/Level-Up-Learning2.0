# Live screen recording privacy review

8 October 2026. **Release finding: screen capture suspended in this patch.** This
is a targeted review, not a completed platform security audit.

## Evidence

The previous root layout mounted StudentScreenRecorder on every route. An active
student identity in localStorage started rrweb capture; the component polled for
identity changes once a second. It did not restrict capture to lesson routes or
require an active teacher-view request. The recorder sent a full DOM snapshot at
subscription and every ten seconds, and buffered interaction events every 500 ms.
The configured sampling included input, mouse movement and scroll events.

Both recorder and teacher viewer used `screen-${studentId}` Realtime Broadcast
channels without private-channel configuration. No Realtime message access policies
were found in the repository migrations. The custom `x-student-session` fetch
header used by student RPCs does not establish a verified WebSocket viewer boundary.

A production probe created two independent anonymous clients on one fresh random
`screen-audit-<UUID>` topic, sent a synthetic marker with an empty events array,
and observed it at the other client. No adult/student credentials, student IDs,
real screen topics, DOM snapshots or student records were used. Send status was
`ok`; receipt was true. Both clients removed channels and disconnected in finally.
No database/session fixture was created. This confirms anonymous public-channel
transport, not that an actual pupil's screen was accessed during this audit.

[Supabase Realtime authorization documentation](https://supabase.com/docs/guides/realtime/authorization)
describes private channels and policies on realtime.messages. Ordinary application
table RLS does not by itself protect public Broadcast traffic.

## Capture and retention findings

- The recorder had no explicit input-masking, text-masking or blocked-region policy.
  Library defaults must not be treated as a product privacy specification. Password
  and sensitive text behaviour has not been verified in a rendered browser.
- This was DOM/event capture within the app tab, not desktop video recording.
- The inspected implementation used in-memory buffers and Realtime Broadcast; no
  application storage upload or persisted recording table was found in this path.
  Provider retention/logging and any independent exports remain unverified.
- Asynchronous rrweb loading was not cancelled on unmount; a pending import could
  start capture after cleanup. Repeated subscriptions also lacked a clear single
  recorder lifecycle. Neither was independently browser-reproduced this round.
- The recorder logged student identifiers to the browser console.

## Containment in this patch

The global recorder mount is removed. The recorder component and compatibility
function are inert and contain no recorder, timer or transport code. The teacher
viewer displays a temporary-unavailability notice and does not subscribe or replay.
Scores, activity events, placement, ordinary dashboard reporting and lesson saving
are unchanged. A prebuild/critical regression check protects this suspension.

This takes effect when the new application is deployed and a student loads it.
Already-open old clients can continue running their old bundle until refreshed or
closed. This patch does not claim to revoke those clients or alter Supabase project
settings. A targeted old-client containment decision remains urgent; do not disable
all project Realtime channels without inventorying other consumers.

## Requirements before restoring the feature

1. Decide whether live DOM sharing is necessary, what its purpose is, and what
   students/parents/teachers must be told. Specify allowed routes and captured fields.
2. Design authenticated transport for the actual student-session architecture.
   Verify publisher identity and teacher membership server-side, deny cross-student,
   cross-class and cross-school subscriptions/publishing, and support expiry/revocation.
   Changing a channel to private without testing student identity is insufficient.
3. Explicitly mask/block sensitive fields and regions. Verify rendered snapshots,
   incremental events, navigation, login/account screens and custom inputs.
4. Start only within the approved scope; stop on logout, route/identity change,
   permission revocation and unmount, including pending imports/reconnects.
5. Specify storage/provider retention and access/deletion policy. Verify deployed
   configuration and controls; don't infer these from the lack of a local table.
6. Test missing/expired sessions and every relevant role using disposable fixtures.
   Record results and cleanup. Only then replace the suspension regression with
   access-control and privacy regressions and restore the feature.

## Rollback

The suspension changes no database schema or student progress. If the release has
an unrelated regression, revert that regression while retaining these inert screen
entry points. Do not restore the public broadcasting implementation as a rollback.
