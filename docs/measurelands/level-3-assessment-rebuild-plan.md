# Measurelands Level 3 Assessment Rebuild

Status: Phase 4 candidate bank authored and responsive rendered QA passed. Production release remains blocked pending educator review and representative pilot calibration. The assessment engine and platform architecture remain frozen.

## Curriculum Contract

Each independently authored 20-item form contains:

| Descriptor | Focus | Pre | Post |
| --- | --- | ---: | ---: |
| AC9M3M01 | Metric unit selection and benchmark estimation | 4 | 4 |
| AC9M3M02 | Labelled rulers, scales and jugs; measurement comparison | 6 | 6 |
| AC9M3M03 | Days, hours, minutes and seconds; duration estimation and comparison | 3 | 3 |
| AC9M3M04 | Analog/digital relationships and nearest-minute time | 4 | 4 |
| AC9M3M05 | Angles as turns and comparison with a right angle | 3 | 3 |

Money is intentionally owned by Number Nexus. Perimeter, area, temperature and degree measurement are excluded from this Level 3 Measurelands bank.

## Form Design

The Pre-Test contains 7 easy, 9 moderate, 3 challenging and 1 very challenging item. Its cognitive mix is 1 recall, 5 understanding, 10 application, 3 reasoning and 1 transfer item.

The Post-Test contains 4 easy, 10 moderate, 4 challenging and 2 very challenging items. Its cognitive mix is 4 understanding, 10 application, 4 reasoning and 2 transfer items.

Both forms contain exactly 16 generated responses and 4 selected responses. Selected responses are limited to one metric-unit decision and three angle concepts where distractors provide diagnostic evidence.

## Educator Review

Review all 40 candidates in `docs/measurelands/level-3-educator-review-sheet.csv`. Regenerate it with `npm run generate:measurelands-level3-review` whenever candidate content changes.

## Release Gate

The live resolver remains unchanged. Desktop and 390 px mobile rendered QA passed for all 40 candidates. Release requires educator approval and representative pilot calibration at the 85% pass threshold.
