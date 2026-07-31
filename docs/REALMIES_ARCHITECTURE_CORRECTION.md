# Realmies Architecture Correction

## Reason

The original R2 implementation incorrectly treated six Numbot, six Meazurex
and six Geospin evolution cards as Realmies. Those characters belong only to
Cards and the Hall of Legends.

## Correction

Migration `20260731103000_correct_realmies_to_discovery_model.sql`:

- marks all Legend Realmie catalogue rows inactive and non-collectible;
- preserves their ownership and unlock receipts;
- removes retired items from favourites, display slots and collection totals;
- disables discovery rules attached to retired rows;
- removes standard post-test Realmie grants and the old backfill;
- seeds 15 supporting creatures and their discovery rules;
- evaluates only canonical lesson, quiz and streak evidence;
- backfills qualifying ownership idempotently;
- writes a machine-readable correction report.

## Historical data

No historical ownership or receipt is deleted. Retired rows retain stable IDs
for foreign keys and audit. They are intentionally absent from all active
student, teacher and parent projections.

## Assessment safety

The replacement assessment completion function preserves its advisory
transaction lock and all existing scoring, progression and assessment behavior.
Only the Realmie post-test side effect is removed.

## Unchanged systems

- Hall of Legends
- Cards
- Gems
- XP
- student progression
- lesson and quiz scoring
- teacher overrides

## UI correction

The premature Legend-based My Realmies implementation remains removed. The
corrected route, navigation and My Home call to action now use the finished
supporting-creature assets for Number Nexus and Measurelands. Starpath is shown
only as Coming Soon and Fog remains hidden.
