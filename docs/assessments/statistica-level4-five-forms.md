# Statistica Level 4 five-form review

Five matched forms (Pre-Test, Post-Test, Start, Mid, End), 20 questions each. Available at `/demo-review/statistica-level4`. This is a review bank with local component-state responses; existing student banks and saved attempts are unchanged.

## Curriculum and lessons

Checked against the supplied Australian Curriculum v9 F–6 curriculum document and `data/activities/statistica/level4.ts`. Inspected the lesson pictograph component and reused its whole/half-symbol convention with the approved shared object artwork.

| Code | Slots | Evidence |
| --- | --- | --- |
| AC9M4ST01 | 1–7 | Record supplied categorical observations; construct many-to-one pictographs and scaled column graphs; read keys/half symbols and intermediate scale marks; repair a display and interpret differences |
| AC9M4ST02 | 8–14 | Compare concentration and spread in discrete numerical distributions; evaluate display suitability; identify information lost by reporting totals or peaks alone; justify comparisons |
| AC9M4ST03 | 15–20 | Plan collection, record survey and observational data digitally, display results, interpret findings and limit conclusions to the observed period |

Lesson alignment: weeks 1–2 keys and pictographs; week 3 scaled column graphs; week 4 shape/concentration; week 5 variation; week 6 investigation. The assessment samples investigation stages using supplied data: it does not claim that students have independently collected real-world data. Full investigation performance also requires the weekly lessons.

## Difficulty progression

See [frequency progression](statistica-frequency-progression.md). Level 4 records 20 observations, constructs frequencies up to 65 and reads scales labelled by tens with intermediate marks at five. Pictographs use keys of five and ten; half symbols appear in reading tasks. Compared distributions contain 60 observations per group, with equal totals and common value ranges so the student must inspect their shapes.

Typing is available for frequency and symbol-count construction to avoid excessive tapping. The pictograph input is explicitly the number of pictures, not the underlying frequency. Scales stay fixed as the student edits. Four choices use plausible key, scale, subtraction or inference errors. All forms match skill, numerical demand and question mode while varying contexts, category roles and answer positions.

## Review and validation

Top question navigation, Back/Next, separate I don't know, automatic local response recording, and teacher-only expandable expected answers follow the existing realms. Read-aloud describes visible source evidence: pictograph narration states symbols and the key rather than calculated totals. Shared realm tokens style controls and states.

Automated coverage: 100-item data/scoring audit, all three codes and matched forms, source frequencies, half-symbol/key consistency, graph scales and distribution totals; lesson-bank audit; repository prebuild checks; TypeScript and targeted lint. Browser validation exercises all 100 responses, five completed scores, question navigation, skip, four choices, desktop/mobile overflow and visual checks.
