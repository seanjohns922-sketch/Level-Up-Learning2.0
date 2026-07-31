# Realmies Phase R2 Implementation

## Status

R2 now provides secure Realmies storage and read/write commands. The
architecture correction in `20260731103000_correct_realmies_to_discovery_model.sql`
changes the reward source from post-test Legend evolution cards to canonical
learning discoveries.

## Retained infrastructure

- secure catalogue reads
- student-scoped ownership
- immutable unlock receipts
- favourites
- six display slots
- teacher summaries
- parent linked-child summaries
- product telemetry
- row-level security and RPC-only mutations

## Replaced behavior

- Retired: post-test Realmie grants
- Retired: post-test Realmie backfill
- Retired: Numbot, Meazurex and Geospin Realmie rows
- Added: 15 supporting Realmies
- Added: discovery rules and canonical evaluator
- Added: lesson and weekly-quiz save triggers
- Added: rerunnable evidence backfill
- Added: architecture correction report

## Deployment

Apply migrations in timestamp order. The correction migration:

1. preserves historical ownership and receipts;
2. retires every catalogue row outside the approved 15;
3. seeds the approved catalogue and discovery rules;
4. asserts the exact 4/4/4/3 distribution;
5. removes post-test grant functions;
6. rebuilds student, teacher and parent projections;
7. runs the canonical backfill;
8. records a correction report.

Run:

```bash
npm run qa:realmies-r2
npm run qa:realmies-r3-assets
```

The R3 asset audit is expected to report that artwork is pending until the new
15-render pack is supplied. Missing production artwork is not replaced with
Legend card art.
