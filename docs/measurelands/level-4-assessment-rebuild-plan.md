# Measurelands Level 4 Assessment Rebuild

Status: Phase 4 candidate bank authored and responsive QA passed. Production release remains blocked pending educator review and representative pilot calibration. The assessment engine and platform architecture remain frozen.

## Curriculum Contract

Each independently authored 20-item form contains:

| Descriptor | Focus | Pre | Post |
| --- | --- | ---: | ---: |
| AC9M4M01 | Partial units and scaled/digital instrument readings | 6 | 6 |
| AC9M4M02 | Perimeter and area measurement and approximation | 5 | 5 |
| AC9M4M03 | Duration, time conversion and am/pm problems | 5 | 5 |
| AC9M4M04 | Acute, obtuse, straight, reflex and revolution angles | 4 | 4 |

Money and volume are excluded. Measurelands assesses physical measurement concepts only.

## Form Design

The Pre-Test contains 6 easy, 10 moderate, 3 challenging and 1 very challenging item. Its cognitive mix is 1 recall, 4 understanding, 10 application, 4 reasoning and 1 transfer item.

The Post-Test contains 3 easy, 10 moderate, 5 challenging and 2 very challenging items. Its cognitive mix is 3 understanding, 9 application, 6 reasoning and 2 transfer items.

Both forms contain exactly 17 generated responses and 3 selected responses. Selected responses are limited to scale interpretation and named-angle concepts where distractors provide diagnostic evidence.

## Educator Review

Review all 40 candidates in `docs/measurelands/level-4-educator-review-sheet.csv`. Regenerate the sheet with `npm run generate:measurelands-level4-review` whenever candidate content changes.

## Release Gate

The live resolver remains unchanged. Release requires educator approval, responsive rendered QA and representative pilot calibration demonstrating adjacent-level separation and reliable target-level mastery at the 85% pass threshold.
