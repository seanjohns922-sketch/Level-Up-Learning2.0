# Measurelands Level 1 Assessment Rebuild

Status: Phase 4 candidate bank authored and responsive rendered QA passed. Production release remains blocked pending educator review and representative pilot calibration. The assessment engine and platform architecture remain frozen.

## Curriculum Contract

| Descriptor | Focus | Pre | Post |
| --- | --- | ---: | ---: |
| AC9M1M01 | Direct and indirect comparison and ordering by length, mass, capacity and duration | 8 | 8 |
| AC9M1M02 | Informal length measurement with uniform units placed end to end | 5 | 5 |
| AC9M1M03 | Duration and event sequence using years, months, weeks, days and hours | 7 | 7 |

Calendar-interval counting, analog-clock reading, metric instruments and units, money, perimeter, area, temperature and angle measurement are excluded from this Level 1 bank.

## Form Design

The Pre-Test contains 10 easy, 8 moderate and 2 challenging items. Its cognitive mix is 3 recall, 7 understanding, 8 application and 2 reasoning items.

The Post-Test contains 6 easy, 9 moderate, 4 challenging and 1 very challenging item. Its cognitive mix is 1 recall, 5 understanding, 9 application, 4 reasoning and 1 transfer item.

Both forms contain exactly 12 generated responses and 8 selected responses. Selected responses are reserved for attribute, fair-measurement, duration-unit and misconception decisions where distractors provide diagnostic evidence.

## Educator Review

Review all 40 candidates in `docs/measurelands/level-1-educator-review-sheet.csv`. Regenerate it with `npm run generate:measurelands-level1-review` whenever candidate content changes.

## Release Gate

The live resolver remains unchanged. Desktop and 390 px mobile rendered QA passed for all 40 candidates. Release requires educator approval and representative pilot calibration at the 85% pass threshold.
