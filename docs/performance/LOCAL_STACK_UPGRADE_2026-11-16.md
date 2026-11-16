# Full local test-stack upgrade

No production database, hosted environment or paid resource was changed.

## Preserved rollback

The original local database was stopped and its volume copied while offline.
The running `supabase_db_reliq-scale-local` now uses verified Supabase image
`17.6.1.156` with cloned volume `reliq-scale-local-fixed-20261116`. Its SQL port
56522 is bound to loopback. Existing local Auth, REST, Realtime, Storage, gateway
and metadata services were resumed against it with their existing configuration.

The original container is retained as
`supabase_db_reliq-scale-local-backup-20261116`, stopped and disconnected from the
test network. Its original volume `supabase_db_reliq-scale-local` is unchanged.
Private container configuration, a logical dump and the replacement script are
in `/Users/seanjohns/reliq-audits/2026-11-16/runtime-upgrade/`. Do not commit them:
they include local credentials and synthetic auth records.

Rollback requires stopping the local services and replacement database,
disconnecting/renaming the replacement, restoring the original container name,
reconnecting the original to `supabase_network_reliq-scale-local` with aliases
`db` and `db.supabase.internal`, and restarting it and the services. That restores
the earlier local schema/runtime, so newly added synthetic results would be lost.
Do not remove either volume during rollback. This is not a production procedure.

## Schema and HTTP correction

The same 11 November migrations rehearsed in isolation were applied locally.
The obsolete schedule-add/remove pair was omitted because cron was absent; the
manual migration revokes the retired worker. Before/after fingerprints preserved
existing identities, schools/classes, learning records and Explorer Codes.

HTTP verification then found an independent application defect:
`get_student_realm_locks` was STABLE, so PostgREST ran it read-only, while its
`assert_student_read` guard updates the session timestamp. The request failed
with HTTP 405 / SQLSTATE 25006. Migration
`20261116170000_student_realm_lock_read_volatility.sql` marks only this function
VOLATILE and reloads PostgREST's schema. Its body, grants, ownership and RLS are
unchanged. This follows the existing expedition-reader fix. Reverting to STABLE
restores the failure. This new migration is applied **locally only**.

## Validation and retained failure

- 25-student HTTP login/activity smoke passed (175 requests, exact writes).
- The first completion burst after restart failed with transport errors. The
  gateway logged `512 worker_connections are not enough`; restarting regenerated
  its configuration and discarded the previous local tuning. The failed result
  is retained as `completion-before-gateway.json` in the private audit directory.
- Restoring the documented 4,096 setting and repeating the unchanged test twice
  passed. Final run: 100 student journeys, 2,200 normal RPC requests, 600 expected
  student access denials, 100 teacher score checks, 100 realtime events, no
  failures; maximum observed realtime latency 818 ms.
- The new HTTP realm-lock regression passed teacher write/read, actual anon
  issued-session read, missing/cross-student denial, teacher-writer refusal and
  service survival after denial. It restores the original fixture lock state.
- The isolated realm-lock database suite passed with the new migration.
- All 17 critical checks, QA lint, targeted script lint, TypeScript and the
  production build passed. The build initially warned of exhausted disk space;
  clearing only the earlier audit checkout's rebuildable Next.js cache freed
  space and the build completed. Project files and database backups were retained.

The previous 30-minute capacity pass predates this runtime/schema upgrade. Do not
describe it as a 30-minute pass of the upgraded stack. No 500+ user or cloud test
has been performed. Browser and asset/storage parity are not established here.

## Before the next local load test

Run from the fixture checkout containing `.local-archive/scale-local/status.env`:

```sh
node /path/to/current/checkout/scripts/staging/tune-local-gateway.mjs
node /path/to/current/checkout/scripts/staging/preflight-local.mjs
node /path/to/current/checkout/scripts/staging/realm-locks-local.mjs
```

The preflight checks the verified image, gateway limit, selected schema objects
and manual-rollover guard. It is not a complete schema comparison. Re-run it after
any restart. Do not use `supabase start` to recreate containers until its image
selection is checked: the older CLI may recreate the defective image. Preserve
the existing containers and use the documented Docker service restart meanwhile.
Reproduction-only `reliq-parity-*` containers were stopped after verification.
