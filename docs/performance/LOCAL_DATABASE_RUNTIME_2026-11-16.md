# Local database permission-denial crash: resolved in isolation

**Follow-up:** the complete local service stack has now been upgraded and passed
HTTP checks. See `LOCAL_STACK_UPGRADE_2026-11-16.md`; the older environment-status
section below records the isolated rehearsal stage.

## Diagnosis

The local stack used `public.ecr.aws/supabase/postgres:17.6.1.106` (ARM64).
The exact upgraded synthetic database was restored into a separate container,
`reliq-parity-crash-20261116`, with `--network none` and no published ports.
The application access test reproduced the PostgreSQL signal-11 crash there.

Phase markers established that teacher writes/reads, student login, own-lock
reads and missing/cross-student session denials passed. The crash occurred when
`anon` invoked `teacher_set_realm_locks`, for which it correctly has no EXECUTE
permission. This is an ACL rejection before the teacher function can run.

Supabase documents this exact image defect in
[postgres issue 2112](https://github.com/supabase/postgres/issues/2112), traced by
the maintainer to the supautils permission-error hint hook. This evidence does
not establish whether any hosted database has the same installed component;
hosted component updates may differ from Docker tags.

## Verified correction

A second independent, network-disabled container, `reliq-parity-fixed-20261116`,
uses `public.ecr.aws/supabase/postgres:17.6.1.156`, downloaded at manifest digest
`sha256:ca7871b587ca2c401ac0f325df6249c9aa0d25647ded34631158efc51176767f`.
It restored the **same** upgraded dump. No application function, grant or RLS
policy was changed to obtain a pass.

Checks passed twice on the corrected image:

- Real invocation of revoked functions as anon and authenticated returns a
  catchable insufficient-privilege error rather than crashing.
- The class teacher writes and reads a test realm lock.
- An anon student obtains a real session and reads their own lock.
- Missing and cross-student sessions are rejected.
- The student's teacher-only write is rejected—the previously crashing check.
- Realm-lock RLS remains enabled; the automatic rollover worker is revoked from
  service_role. The student still has no teacher-function EXECUTE privilege.
- Test transactions roll back; the realm-lock table is empty afterwards.

No signal-11 error appeared in the inspected corrected-container logs. These are
SQL role/session tests, not REST, browser or capacity certification.

## Repeatable runtime preflight

The test can crash an affected database. Run only against a disposable container
named `reliq-parity-*`, with networking disabled, no published ports and no host
bind mounts; the script enforces these conditions.

```sh
node scripts/staging/runtime-permission-probe.mjs reliq-parity-fixed-20261116
```

It executes the actual denied calls and rolls back the probe function. Do not
replace these calls with weaker catalog-only checks, grant access to avoid the
failure, or direct this probe at a shared/hosted environment.

## Environment status and next step

The original REST-connected `reliq-scale-local` environment remains unchanged on
the older image. The corrected copy contains the rehearsed November schema but
has no attached Auth/REST/Storage services. Before the next capacity stage, build
or migrate a full local test stack onto the validated runtime and repeat the
HTTP student-session, completion/retry and realtime checks. Preserve the private
backup and the existing stack until that replacement passes.

Original schema restore required local Supabase owner roles and a deferred
GraphQL-wrapper ACL, which was restored after its function. The subsequent
upgraded dump restored cleanly in each isolated container once the Realtime and
Functions owner roles were created with source-matching attributes.

Private scripts and logs are in
`/Users/seanjohns/reliq-audits/2026-11-16/schema-parity/`. Database dumps contain
synthetic auth records and must remain private. No production database, paid
infrastructure, lesson content or application access rules changed.
