# Measurelands Level 6 Assessment Rebuild Plan

Status: Phase 3 candidate bank authored and educator-approved. Production release remains blocked pending representative pilot calibration. The assessment engine and platform architecture are frozen.

## Curriculum Contract

The pre-test and post-test each contain 20 independently authored items:

| Descriptor | Focus | Pre | Post |
| --- | --- | ---: | ---: |
| AC9M6M01 | Metric conversion and decimal representations in context | 5 | 5 |
| AC9M6M02 | Establish and apply the rectangle area formula | 5 | 5 |
| AC9M6M03 | Timetables, itineraries and journey duration | 5 | 5 |
| AC9M6M04 | Straight-line, point and vertically opposite angle relationships | 5 | 5 |

The detailed intentions, success criteria, misconceptions and archetypes remain in the approved blueprint. Circle measurement and volume are excluded because they are not part of this approved Level 6 Measurelands descriptor set.

## Form Design

The pre-test targets 4 easy, 10 moderate, 4 challenging and 2 very challenging items. Its cognitive mix is 3 understanding, 9 application, 6 reasoning and 2 transfer items. Exactly 19 responses are generated and 1 is selected.

The post-test targets 1 easy, 9 moderate, 6 challenging and 4 very challenging items. Its cognitive mix is 1 understanding, 8 application, 7 reasoning and 4 transfer items. Exactly 19 responses are generated and 1 is selected.

The post-test must include at least 2 transfer tasks, 2 reasoning tasks requiring justification and 2 misconception-diagnosis tasks. These are minimum task features within the stronger exact cognitive mix, not 6 necessarily separate questions.

## Educator Review

The 40-row candidate review sheet is `docs/measurelands/level-6-educator-review-sheet.csv`. It records canonical item metadata and expected answers, followed by blank verdict, wording, visual, curriculum and recommended-action fields for educator review. Regenerate it with `npm run generate:measurelands-level6-review` whenever candidate content changes.

## Build Sequence

1. Completed: wrote the 40-row item specification matrix before prompts.
2. Completed: required multi-step evidence for timetable, area-design and angle-chain transfer items.
3. Completed: assigned every row curriculum lesson mapping, canonical misconception tags, transfer/reasoning flags and response-mode metadata.
4. Completed: authored independent payloads without importing lesson or weekly-quiz generators.
5. Completed: verified calculations, units, timetable constraints, diagrams and exact-response behavior.
6. Completed: responsive rendered QA passed at 1440 px and 390 px, and production remains isolated.
7. In progress: educator review is approved; conduct a representative student pilot and populate observed item statistics.
8. Pending: approve both forms together, then switch the Level 6 resolver in one versioned release.

Pilot evidence must test both target-level mastery and adjacent-level separation. Release remains blocked until genuine Level 5 students have less than a 50% probability of passing the Level 6 Post-Test at 85%, while genuinely mastered Level 6 students consistently meet or exceed 85%.

## Release Gate

No Level 6 item may be sourced from a lesson registry or weekly-quiz contribution. The live resolver remains unchanged until all 40 items and both forms pass review. Routing, saving, progression, replay, reporting, rewards, placement and database schemas are out of scope.
