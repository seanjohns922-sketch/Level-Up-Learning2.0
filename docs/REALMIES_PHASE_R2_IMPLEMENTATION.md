# Realmies Phase R2 Implementation

Status: Implemented, pending deployment

Date: 31 July 2026

## Scope

Phase R2 adds the secure data foundation for the standard Legend Realmies. It
does not add student UI, reuse Hall of Legends card artwork, or introduce
villains, variants, event Realmies, Datara or Pet Realmies.

The canonical catalogue contains exactly 18 active standard Realmies:

| Realm | Character | Levels |
| --- | --- | --- |
| `number` | Numbot | Counter, Builder, Processor, Solver, Calculator, Equationator |
| `measurement` | Meazurex | Ticklet, Measurer, Tracker, Balancer, Calibrator, Timewielder |
| `space` | Geospin | Roller, Mapper, Navigator, Shapeshifter, Galaxycrafter, Starweaver |

Each character has one evolution for Years 1-6. Ground Level has no standard
Realmie unlock.

## Database Foundation

`20260731100000_realmies_secure_data_foundation.sql` creates:

- `realmie_catalogue`: stable definitions, unlock metadata and future assets
- `student_realmies`: permanent, unique student ownership
- `realmie_unlock_receipts`: immutable idempotency and audit receipts
- `student_realmie_favourites`: multiple owned favourites
- `student_realmie_display_slots`: six ordered My Home slots
- `student_realmie_backfill_state`: one grouped unseen-backfill notification
- `realmie_product_events`: reviewed, privacy-minimised product telemetry

Ownership and receipts are separate from XP, Gems, Hall of Legends cards, Pets,
inventory and avatar equipment. Foreign keys use restrictive deletion where
historical unlock evidence must remain intact.

## Canonical Unlock Rule

A standard Realmie is granted only when all of these conditions are true:

1. The canonical assessment row is a `posttest`.
2. The row belongs to the same student, realm and working level.
3. `passed` is true and `score_percent >= 85`.
4. The matching canonical `student_realm_progress` row has a completed
   post-test, score at least 85 and status `PASSED`.
5. Exactly one active standard catalogue mapping exists for that realm and
   Year 1-6 level.

Pre-tests, weekly quizzes, lesson completions, Ground Level and unknown mappings
cannot grant a standard Realmie. Unknown or missing mappings fail closed.

## Atomic Completion Integration

`20260731101000_integrate_realmie_posttest_unlocks.sql` integrates the grant
evaluator inside `complete_realm_assessment(...)`.

The transaction writes the completion receipt, canonical assessment, canonical
progress and Realmie ownership together. If Realmie evaluation fails, the
assessment completion rolls back. Retrying with the same completion key returns
the existing canonical result without duplicate ownership or receipts.

Clients cannot call the internal grant evaluator. They submit canonical
assessment completion through the existing command only.

## Historical Backfill

The migration runs `backfill_standard_realmies_internal()` once and emits a
structured PostgreSQL notice containing:

- students examined
- candidate completions
- eligible completions
- Realmies granted
- already owned
- skipped records
- conflicts or invalid mappings

Backfill requires matching canonical passed post-test and passed progress
evidence. It is rerunnable and does not award XP, Gems, Hall of Legends cards or
change progression. Eligible historical unlocks increment one grouped unseen
count instead of creating repeated student notifications.

Invalid historical mappings are isolated, counted and reported without
discarding valid grants from the same backfill run.

## Secure APIs

Student reads:

- `get_active_realmie_catalogue_secure()`
- `get_student_realmies_secure(student_id)`
- `get_student_realmie_display_secure(student_id)`

Student commands:

- `set_student_realmie_favourite_secure(...)`
- `set_student_realmie_display_slot_secure(...)`
- `acknowledge_student_realmie_unlocks_secure(student_id)`
- `record_realmie_product_event_secure(...)`

Educator read:

- `get_teacher_student_realmie_summary_secure(student_id)`

Educators receive a limited collection summary only when canonical school/class
permissions allow them to view that student. They cannot inspect the complete
student collection through the student RPC and cannot grant, remove, favourite
or display Realmies. Parents have no Realmie write command.

## RLS and Permissions

All seven tables have RLS enabled and direct privileges revoked from `public`,
`anon` and `authenticated`. Security-definer functions set
`search_path = public`, validate the active student or educator relationship,
and expose only the minimum required projection.

The grant evaluator and backfill function have no client execution grant.
Cross-student and cross-school access fail with `42501`.

## Telemetry

The event command accepts only:

- `realmies_room_opened`
- `realmie_detail_viewed`
- `realmie_favourited`
- `realmie_display_added`
- `realmie_display_removed`
- `realmie_unlock_viewed`

Unlock events cannot be fabricated by the client. Context is reduced to an
allowlist and excludes direct student identity such as names or email.

## Asset Contract and R3 Blockers

All 18 definitions are active for valid learning completion, but assets are
currently null with `metadata.asset_status = "missing"`. This is intentional
and non-fatal.

R3 requires:

- approved transparent figure art for all 18 Realmies
- one production figure and one silhouette per stable Realmie key
- PNG or WebP files under `/public/realmies/{realm}/`
- filenames matching the stable catalogue key
- silhouette filenames ending in `-silhouette`
- consistent transparent canvas, padding, aspect ratio and visual scale
- accessibility text review for names and lore

Existing Hall of Legends card fronts and backs must not be reused as Realmie
figures.

## Validation

Focused pgTAP coverage is in `supabase/tests/realmies_r2.sql`. It verifies:

- exactly 18 stable mappings and no Datara or Pet rows
- 85% pass and 84% rejection
- pre-test and weekly-quiz rejection
- idempotent ownership and immutable receipts
- atomic rollback and successful retry
- safe rerunnable backfill without XP, Gems, cards or progression mutation
- favourite and six-slot ownership rules
- student, parent, teacher and cross-school permissions
- telemetry allowlist and identity minimisation

The repository contract audit is `npm run qa:realmies-r2`.

## Deployment and Rollback

Deploy the two migrations in timestamp order. Capture the backfill notice from
the deployment log before proceeding to R3.

Because successful ownership represents earned learning history, rollback must
not delete ownership or receipts casually. If application code must be rolled
back:

1. stop exposing future Realmies UI or commands;
2. preserve all R2 tables and receipts;
3. restore the previous `complete_realm_assessment` body only if required;
4. reconcile any post-tests completed during the rollback window by rerunning
   the idempotent backfill after R2 is restored.

Do not compensate by changing assessment scores, progression, XP, Gems or Hall
of Legends state.

## Remaining Risks

- Production backfill counts are unknown until the migration runs against the
  deployed database.
- Approved figure artwork is the blocking dependency for R3.
- Parent read-only access is intentionally deferred.
- Product telemetry reporting and retention policy remain Phase R4 work.
- Future variants require separate unlock rules and must not weaken the
  standard post-test contract.

## Recommended R3 Sequence

1. Approve and register all 18 figure and silhouette assets.
2. Build the collection route from the secure student projection.
3. Add filters, detail view, favourites and six display slots.
4. Integrate the same display projection into My Home.
5. Add live unlock and grouped backfill celebrations.
6. Validate accessibility, mobile/tablet layouts and missing-asset fallbacks.
7. Run production progression, reward, tenancy and collection regression
   suites before release.
