# Recent migration audit — 25 September 2026

Scope: repository migrations added from 18–25 September, checked against the linked Supabase project `dqncplrxjxvjqbmwcyia`. Initially a read-only audit; the user subsequently authorised the history-only repair described below.

## Result

No missing SQL effects identified among the seven recent migrations. Three migration-history entries were initially absent despite matching live effects; these have now been repaired.

| Version | Migration | Live state | History |
| --- | --- | --- | --- |
| 20260918090000 | Parent dashboard activity and report | Both function bodies match; authenticated access enabled, anonymous denied | Recorded after verification |
| 20260918120000 | Home all realms and cross-realm unlock | All five function bodies match; explicit role grants match | Recorded after verification |
| 20260922190000 | Starpath full release | Verified | Recorded |
| 20260923190000 | Statistica full release | Verified | Recorded |
| 20260923210000 | Pattern Peaks full release | Verified | Recorded |
| 20260924180000 | Chance Hollow full release | Verified | Recorded |
| 20260925090000 | World collection expansion | All 12 catalogue rows match every inserted column, including metadata, prices and availability | Recorded after verification |

## Evidence and limits

- Compared 28 current function bodies with the latest applicable local definition, removing whitespace only for hash comparison: all matched. Shared functions were compared with their final successor migration, not superseded definitions.
- Inspected function execution grants and security-definer flags, plus returned search-path configurations.
- All four release-version columns default to 1; all eight release triggers are enabled.
- Diagnostic measured-level/draft-index constraints cover all six strands through Level 8. Live maths progression checkpoint, official and predicted level constraints allow 0–8.
- The two 18 September files contain function declarations and role grants only outside their transaction wrappers; no separate unverified data backfill.
- All 12 reward catalogue rows exist and exactly match the collection expansion migration.
- This is deployed-schema/catalogue verification, not a new student-session integration test or a reconciliation of older history gaps.

## Authorised history repair completed

Used Supabase `migration repair --status applied` for exactly `20260918090000`, `20260918120000` and `20260925090000`. No migration SQL was replayed.

Before/after verification confirms exactly those three history rows were added, the four existing recent history rows are unchanged, and all seven recent migrations are now recorded. Checked function bodies and privileges, release defaults, constraints, triggers and all 12 reward catalogue rows are unchanged. Older migration-history gaps from the 15 September audit remain outside this repair.

The earlier statement that the world collection migration was still unapplied is corrected by the live verification.
