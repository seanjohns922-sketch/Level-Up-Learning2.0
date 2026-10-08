# Screen sharing retirement

Screen recording and live screen sharing are permanently removed from the application.
Live Class activity, questions, accuracy, completion, support indicators and teacher
reporting remain. **Production containment is pending approval and verification.**
This branch must not be deployed independently of its server rollout plan.

## Removed application paths

- Deleted `components/StudentScreenRecorder.tsx`, `lib/screen-recorder.ts` and
  `components/teacher/StudentScreenViewer.tsx`; the global mount was already removed.
- Removed the Live Screen tab and its state/import from `LiveStudentDrawer.tsx`.
- Removed `rrweb` and its now-unused dependency subtree from npm manifests/lockfile.
- Kept educational assessment replay: `AssessmentReplay.tsx` renders saved question
  attempts, not recorded DOM or screen video. It remains part of teacher reporting.
- Live Class retains its four Postgres Changes subscriptions, polling, activity
  data and permissions. Its channel now requests private access to support the
  approved private-only server rollout. No student progression/XP logic changes.

## Known transport and data inventory

The old implementation broadcast DOM snapshots and interactions directly to
Supabase public `screen-${studentId}` topics using `screen_events`. No dedicated
recording API, recording table, storage upload or persistence utility was found
in the repository. Channels are runtime topics, not database rows to delete.
`rrweb` was not used by another feature.

The 8 October review confirmed anonymous public transport with synthetic messages.
A later read-only anonymous join on a new random audit topic also succeeded.
Neither check accessed a student's screen. Current production settings, externally
added policies, historical exports and provider logs/retention are not inventoried.
Do not interpret absence of an application table as proof that no recordings exist.

Run `supabase/manual/screen-sharing-retirement/inventory.sql` with approved
administrator access. It reads policy/table/function/bucket metadata and candidate
object counts, not student payloads. Review candidate matches manually; names such
as assessment replay and source_screen are not proof of recordings. Also inventory
provider logs, storage lifecycle settings, browser exports, third-party consumers
and backups. Record counts, owners and retention, without copying child data.

## Prepared server changes requiring approval

`supabase/manual/screen-sharing-retirement/prepare.sql` is deliberately outside
automatic migrations. It has **not been executed in Supabase or production**. Its SQL and row-policy
behaviour passed in a disposable PostgreSQL 17 container with a controlled
`can_view_class` permission stub, including a deliberately broad legacy policy.
This does not verify Supabase WebSocket joins, caching or actual school permissions.

1. Deny `screen-*` private topics with a restrictive policy, even if another
   permissive policy exists.
2. Deny browser inserts to Realtime messages (Broadcast/Presence publishing).
   Remaining repository features write learning telemetry through validated RPCs,
   not Broadcast. Confirm there are no outside consumers before applying.
3. Permit authenticated private `live-class-<UUID>` channel joins only when
   `can_view_class` authorises that class. Existing learning-table RLS is unchanged.
4. In Supabase Realtime Settings, leave the service **enabled** and turn
   **Allow public access to channels OFF**. SQL alone cannot stop public channels.

Supabase documents that settings changes disconnect connected clients and that
private-only mode rejects clients without `config.private: true`. Verify this
against a connected synthetic old client before considering old sessions contained.
See [settings](https://supabase.com/docs/guides/realtime/settings) and
[authorization](https://supabase.com/docs/guides/realtime/authorization).

## Rollout and acceptance

First exercise this sequence in staging with synthetic student and teacher data:

1. Inventory policies/consumers and review the SQL; record existing policy definitions.
2. Connect a pre-removal synthetic screen client before the change. Do not record
   real student content. Verify a private authorised Live Class subscription too.
3. Apply the prepared policies. Deploy this branch's client to the staging target.
4. Turn public access off. Verify the pre-existing public connection is disconnected,
   cannot rejoin, and cannot send or receive after reconnect. Test Broadcast REST
   and private `screen-*` joins as anon and authenticated, not just WebSockets.
5. Verify teacher A receives only authorised class events, teacher B from another
   school and revoked teachers are denied, and student/parent access is denied.
6. Verify student lesson start, answers, accuracy, completion, support state and
   teacher refresh still work, including sign-in renewal/reconnect and 30-second
   polling. Verify no duplicate attempts, scores or XP; refresh all teacher tabs.
7. Repeat acceptance evidence after the approved production rollout. Refresh/close
   old student tabs too: server denial stops transmission, but cannot uninstall
   rrweb already loaded into a browser's memory.

Apply policies before deploying this client so private joins are authorised.
Old teacher versions use public channels and must refresh after the setting change;
there may be a brief reconnect interruption. Do not approve completion until the
server and old-session checks pass. Supabase staging transport and actual-role tests are still outstanding; no
production settings, policies, sessions or data were changed in this branch.

If a rollout problem occurs, keep public access off and keep recording removed.
Repair the narrow authorised Live Class policy/client; preserve its polling fallback.
Do not roll back to public recording, restore old recorders or disable all Realtime.

## Recording deletion and retention proposal

No recording dataset has yet been identified for deletion. Do not delete generic
live activity, student attempts, assessment replays, accuracy/progress records,
Supabase system tables or buckets on a name match.

For any positively identified recordings, prepare a manifest of exact bucket/object
IDs or table rows, counts, owner, purpose and retention obligations. Obtain approval
for that exact scope before deletion. Avoid downloading recordings or making an
extra backup merely for this work. Remove access promptly; then delete approved
active objects through the Storage API (not SQL metadata deletion) and approved
rows transactionally. Record deletion counts and verification, without payloads.
Review vendor copies/logs and backup expiry separately; agree a retention deadline
and prevent restore procedures from republishing retired content. Retain a minimal
non-content audit record of authorisation and deletion. No deletion is performed here.

## Regression protection

`qa:screen-recording-safety` now scans application source/public scripts and npm
manifests for retired capture paths, dependencies and controls, requires deleted
entry points to stay absent, and exercises the actual Live Student drawer's
activity/support/accuracy/completion and close behaviour. It also checks the four
Live Class subscriptions and polling remain. It runs in prebuild and critical QA.
These are source and shallow-render regressions, not proof of server enforcement;
the old-client and role tests above remain necessary.

## Local validation

TypeScript, focused application lint, QA infrastructure lint, critical QA (10/10),
security-source QA (4/4), the complete prebuild suite and production build passed.
Full application lint still reports the existing 65 errors and 320 warnings; no
rules were weakened. The disposable policy fixture/assertion SQL is included next
to prepare.sql, is labelled local-only, and was run with ON_ERROR_STOP. The container
was removed afterward. No Supabase data or settings were touched.
