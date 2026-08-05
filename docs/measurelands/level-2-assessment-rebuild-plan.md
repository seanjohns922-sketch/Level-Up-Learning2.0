# Measurelands Level 2 Assessment Rebuild

Status: Phase 4 candidate bank authored and responsive rendered QA passed. Production release remains blocked pending educator review and representative pilot calibration. The assessment engine and platform architecture remain frozen.

## Curriculum Contract

Each independently authored 20-item form contains:

| Descriptor | Focus | Pre | Post |
| --- | --- | ---: | ---: |
| AC9M2M01 | Uniform informal units, fair comparisons and smaller units for accuracy | 6 | 6 |
| AC9M2M02 | Equal halves, quarters and eighths in measurement contexts | 3 | 3 |
| AC9M2M03 | Calendar dates and the number of days between events | 4 | 4 |
| AC9M2M04 | Analog time to the hour, half-hour and quarter-hour | 4 | 4 |
| AC9M2M05 | Quarter, half, three-quarter and full turns | 3 | 3 |

Metric instruments and units, money, perimeter, area, temperature and degree measurement are excluded from this Level 2 Measurelands bank.

## Form Design

The Pre-Test contains 8 easy, 9 moderate and 3 challenging items. Its cognitive mix is 2 recall, 6 understanding, 9 application and 3 reasoning items.

The Post-Test contains 5 easy, 10 moderate, 4 challenging and 1 very challenging item. Its cognitive mix is 1 recall, 4 understanding, 10 application, 4 reasoning and 1 transfer item.

Both forms contain exactly 14 generated responses and 6 selected responses. Selected responses are reserved for unit-plan, equal-part, clock-misconception and turn reasoning where distractors provide diagnostic evidence.

## Educator Review

Review all 40 candidates in `docs/measurelands/level-2-educator-review-sheet.csv`. Regenerate it with `npm run generate:measurelands-level2-review` whenever candidate content changes.

## Release Gate

The live resolver remains unchanged. Desktop and 390 px mobile rendered QA passed for all 40 candidates. Release requires educator approval and representative pilot calibration at the 85% pass threshold.
