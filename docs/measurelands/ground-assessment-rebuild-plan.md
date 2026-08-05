# Measurelands Ground Assessment Rebuild

Status: Ground Post-Test candidate bank authored and responsive rendered QA passed. Production release remains blocked pending educator review and representative pilot calibration. The assessment engine and platform architecture remain frozen.

## Curriculum Contract

| Descriptor | Focus | Post |
| --- | --- | ---: |
| AC9MFM01 | Direct comparison of length, mass, capacity and duration with communicated evidence | 14 |
| AC9MFM02 | Sequence days and times of day and connect them to familiar events | 6 |

Informal-unit measurement, calendar intervals, analog-clock reading, metric instruments and units, money, perimeter, area, temperature, fractions and angles are excluded from this Ground Post-Test.

## Form Design

The Post-Test contains 8 easy, 8 moderate, 3 challenging and 1 very challenging item. Its cognitive mix is 2 recall, 7 understanding, 7 application, 3 reasoning and 1 transfer item.

The form contains exactly 10 generated responses and 10 selected responses. Generated responses ask children to independently identify numbered objects or sequence positions from given direct evidence. Selected responses are retained where an attribute, explanation or misconception must be interpreted.

## Educator Review

Review all 20 candidates in `docs/measurelands/ground-educator-review-sheet.csv`. Regenerate it with `npm run generate:measurelands-ground-review` whenever candidate content changes.

## Release Gate

The live resolver remains unchanged. Desktop and 390 px mobile rendered QA passed for all 20 candidates. Release requires educator approval and representative pilot calibration at the 85% pass threshold.
