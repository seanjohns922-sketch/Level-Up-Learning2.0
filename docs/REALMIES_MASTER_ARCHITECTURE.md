# Realmies Master Architecture

## Product boundary

Realmies are discoverable supporting creatures earned through canonical learning
activity. They are separate from:

- Cards and the Hall of Legends
- Gems
- pets
- avatars and wardrobe items
- XP, progression and assessment rewards

Numbot, Meazurex, Geospin and Datara are main Legends. They must never appear in
the Realmies catalogue, ownership totals, favourites, displays or unlock
celebrations.

## Canonical catalogue

The active standard collection contains exactly 15 Realmies:

| Collection | Realmies |
| --- | --- |
| Number Nexus | Bitling, CarryBot, Codekeeper, Neon Sentinel |
| Measurelands | Gaugekin, Ruleroot, Compass Keeper, Golden Surveyor |
| Starpath | Orbitling, Prism Scout, Constellation Keeper, Aurora Guardian |
| Beyond the Fog | Fogling, Mist Mischief, Shadow of Forgetfulness |

Only rows satisfying all three conditions count toward collection totals:

```text
is_active = true
is_collectible = true
variant_type = standard
```

Starpath is `coming_soon` in student collection availability. Number Nexus,
Measurelands and Beyond the Fog are live. This availability flag affects
presentation only; it does not weaken canonical ownership or evidence rules.

## Discovery evidence

Realmies are granted only by the server after canonical writes:

- first unique completed lesson in a realm
- 10 unique completed lessons in a realm
- 50 unique completed lessons in a realm
- 5 unique passed weekly quizzes in a realm at 80% or above
- 3 unique completed lessons across all realms
- a 7-day canonical learning streak
- a 30-day canonical learning streak
- an explicitly configured special event

Unique lessons are keyed by student, realm, working level, week and lesson.
Unique quizzes are keyed by student, realm, working level and week.

Demo activity, review-only activity, teacher advancement and live telemetry are
not discovery evidence. Repeating the same lesson or quiz cannot farm Realmies.

## Write path

```text
Canonical lesson or weekly quiz save
  -> deferred database trigger
  -> discovery evaluator
  -> idempotent ownership insert
  -> immutable unlock receipt
```

The evaluator is `SECURITY DEFINER`, is not executable by clients and derives
all counts from canonical attempt tables. Browser state and telemetry never
grant ownership.

The evaluator may also run through a protected backfill command. Backfill is
rerunnable and creates the same ownership outcome as live canonical evidence.

## Data model

- `realmie_catalogue`: identity, collection, rarity, lore and asset metadata
- `realmie_discovery_rules`: server-owned eligibility rules
- `student_realmies`: canonical ownership
- `realmie_unlock_receipts`: immutable discovery audit trail
- `student_realmie_favourites`: one student-selected favourite
- `student_realmie_display_slots`: up to six display selections
- `realmie_product_events`: product analytics, never progression evidence
- `realmie_architecture_correction_reports`: correction/backfill audit output

Historical Legend-based rows remain in the catalogue as non-collectible retired
records so old ownership and receipts retain referential and audit integrity.

## Read model

Student reads expose only active collectible catalogue items and their own
ownership, favourite and display state.

Teacher summaries expose:

- total discovered
- total active standard
- counts by collection
- latest discovery
- favourite Realmie
- collections started

Parent summaries expose the same read-only fields for an actively linked child.

## Invariants

- Exactly 15 active collectible standard Realmies exist.
- Distribution is Number 4, Measurement 4, Space 4 and Global 3.
- No active collectible has category `legend` or `pet`.
- Numbot, Meazurex, Geospin and Datara are never collectible Realmies.
- Post-tests do not grant Realmies.
- Realmie evaluation does not alter XP, Gems, Cards or progression.
- Historical retired ownership and receipts are never deleted.
- Main Legends remain unchanged in the Hall of Legends.

## UI release boundary

The earlier Legend-based My Realmies interface is withdrawn. The polished
collection UI must not return until the 15 production renders are approved.
When released, it will provide realm shelves, locked silhouettes, detail views,
favourites, six display slots and discovery celebrations without changing this
server architecture.
