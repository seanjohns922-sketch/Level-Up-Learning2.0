# All-level learning audit — 1 November 2026

This audit found and repaired correctness, skipped-activity, diagram and layout defects, including in Prep–6. It is a technical and sampled content audit, not a claim that every random question or every authenticated student journey has been manually certified.

Level 8 Measurement is excluded at the user's request. Its authored content, diagrams and lessons were not changed. Standard repository release checks still run as configured. Work was isolated from concurrent audio and Level 8 editing in the main checkout.

## Lesson coverage

[The coverage ledger](all-level-learning-audit-coverage.csv) has one row per lesson: **1,218 lessons** across the in-scope realms. A row records the actual check performed, not a blanket pedagogical sign-off.

| Level | Number | Measurement | Space | Statistics | Pattern | Chance | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Prep | 36 | 24 | 24 | — | — | — | 84 |
| 1 | 36 | 24 | 24 | 18 | — | — | 102 |
| 2 | 36 | 24 | 24 | 18 | — | — | 102 |
| 3 | 36 | 24 | 24 | 18 | 24 | 18 | 144 |
| 4 | 36 | 24 | 24 | 18 | 24 | 18 | 144 |
| 5 | 36 | 24 | 24 | 18 | 24 | 18 | 144 |
| 6 | 36 | 24 | 24 | 18 | 24 | 18 | 144 |
| 7 | 36 | 36 | 30 | 30 | 36 | 24 | 192 |
| 8 | 36 | excluded | 36 | 30 | 30 | 30 | 162 |

Prep–6: 864 lesson generators, 225 task kinds, three seeded runs of 73,860 generated questions (**221,580 total**). Checks cover renderer acceptance, finite data, primitive choice uniqueness and answer availability, with **17,295 independent mathematical assertions** on supported families. These independently calculate arithmetic, comparison, fraction equivalence, parity, money and model answers; other families are not mathematically certified by this count.

Prep–7: 3,413 representative rendered scenes, including all three Level 7 roles and two seeds per role. Both 390px and 1280px browser layouts were checked for horizontal overflow and SVG text outside their bounds. Production components and CSS were used; speech controls were stubbed. Screenshots of flagged and sampled cards were inspected. This is not an interactive walkthrough of all 3,413 cards.

Level 8: retain the [previous lesson/form review](level8-other-realms-visual-audit.md), covering all five included realms. The regression rerun passed 827 forms, 33,080 data/render checks and 162 teaching examples; 439 forms supply mathematical visuals. Measurement remains excluded.

## Defects repaired

| Location | Before | Correction |
| --- | --- | --- |
| Prep Number, week 5 comparison rotation | A “less” prompt could mark the larger group correct. | Prompt, target and correct group use the same comparison direction. |
| Prep Number, week 12 revision/application rotations | A cloned question could receive a new displayed target while retaining the old answer/options. | Preserve the source quantity, diagram and answer together. |
| Level 2 Number, week 12 fraction pictures | A half could appear twice, but only one matching picture was accepted. | The extra picture now represents two parts, distinct from the one-part target. |
| Levels 4–6 Number, equivalent-fraction families | Different representations of the correct fraction could be classified as distractors; an equivalent pair could be labelled “no”. | Compare mathematical values by cross multiplication when constructing distractors. |
| Number fraction-point identification | B = 2/3 and C = 4/6 overlapped, while only B was accepted. | Use a distinct incorrect point, 4/5. |
| Level 2 Measurement, weeks 5, 6 and mixed review | Valid fraction/turn questions were absent from the safety allow-list and could be skipped. | Validate and accept the supported task family. |
| Level 2 Measurement turns | Arc began 90 degrees away from its start arm and did not reverse for anticlockwise turns. | Align the arc with the start arm and mirror its sweep for anticlockwise turns. |
| Level 6 Chance model debugger | Randomly assigned machine IDs occasionally collided, causing valid activities to be rejected. | Give each machine a unique suffix within its question. |
| Level 7 Number, week 1 lesson 1 | “Use an area model” supplied no model. | Add a proportionate partitioned square and diagram narration without the answer. |
| Pattern Peaks closing feedback | “Balance equations” could resolve to a mass/balance-scale tip. | Use algebra-specific coaching, including the teacher insight path identified by lesson ID. |
| Number closing feedback | “Unit fractions” could resolve to length measuring. | Resolve this Number topic to fraction coaching. |
| Early Measurement mobile cards | Objects could extend outside their cards. | Use a common unit scale across related objects and rods, stack narrow comparisons, and crop transparent image margins. |
| Arrays, receipts and written methods on mobile | Wide workings could overflow or hide columns. | Fit written-method cells more closely on narrow screens; keep larger geometry/tables accessible in a contained horizontal scroll area. |
| Level 7 Pattern diagram/answer split | Four answer columns could be squeezed into the narrow side panel. | Stack longer answers beside the diagram. |

Existing saved attempts and historical scores were not rewritten. A previously saved question can retain its old payload until the student starts a fresh question/lesson.

## Flow, feedback and insights

The shared engines present a coach review before reflection or a custom completion card. The real React test exercises Prep–8 PracticeRunner completion and the timed Year2LessonEngine, verifies the coach-to-completion transition, and checks that completion fires once. It also exercises fraction-turn marking and the corrected coaching routing. Network writes, audible speech and animation effects are outside that test.

The review contains practised skills, strengths/encouragement, a focus where sufficient weak-topic evidence exists, a coach tip and next-step copy when supplied. Some tips remain broad topic-level guidance rather than a diagnosis of a particular misconception. Completing a lesson with little or no answer evidence is not evidence of mastery; teacher insight confidence must be read alongside the number of responses.

The route/source checks cover lesson starts and help, answer controls, held wrong-answer feedback, mistake review, weekly quiz retries/navigation, completion/rewards and realm progression. Teacher insight tests check summary construction and routing. They do not prove production database writes or the teacher dashboard's eventual display for a real student session.

## Difficulty and presentation review

A coarse topic/range check against the [Victorian Curriculum Mathematics Version 2.0 achievement standards](https://f10.vcaa.vic.edu.au/learning-areas/mathematics/curriculum) supports the intended progression: Prep counting/collections, Level 1 numbers to 120, Level 2 to 1,000 and unit fractions, Level 3 larger numbers and additive strategies, Level 4 decimals and practical calculation, Level 5 related-denominator fractions and percentage connections, Level 6 integers and decimal operations, Level 7 powers/roots and rational operations, and Level 8 irrational numbers and exponent laws. This is a topic-level comparison, not a complete descriptor-by-descriptor accreditation. The [official scope-and-sequence guidance](https://f10.vcaa.vic.edu.au/learning-areas/mathematics/scope-and-sequence) also calls for reading level descriptions alongside the charts.

Level 7's existing reading-budget check passed 11,520 samples. Lower-level guide checks cover all 780 lessons in Levels 1–6. Prep uses native teaching activities. A mathematically suitable topic can still have excessive reading, memory or interaction demands for an individual learner. Those judgements need representative students and teacher review; automated counts cannot establish them.

## Validation

- 26 existing audit/release suites passed before and after the fixes.
- 17/17 critical checks passed.
- Three Prep–6 generated-question seeds passed after repair.
- Real React completion/marking/coaching checks passed.
- Level 7 readability and the five included Level 8 realms' visual regression passed.
- Type checking, QA lint and the full production build passed. The final browser rerun found zero horizontal-overflow or SVG-text-bound warnings across 3,413 cards at both tested widths.

Reproduce the expanded generator audit with `npm run qa:g6-question-integrity`; set `AUDIT_SEED`, `AUDIT_OUTPUT` and optional `AUDIT_SNAPSHOTS` for alternate seeds and evidence. Run `NODE_ENV=test node scripts/lesson-completion-flow-test.mjs` for completion checks. `scripts/level7-question-inventory.mjs` writes the Level 7 sample inventory. `scripts/lesson-render-audit.mjs` accepts `AUDIT_SNAPSHOTS` and `AUDIT_RENDER_OUTPUT` for component render checks. Browser geometry checks used an isolated Chrome session with the compiled application styles; no student progress was written.

## Remaining live checks before wider rollout

1. Complete a real student lesson in each engine/realm; reload mid-question and during wrong-answer feedback; verify saved progress and the next activity.
2. Check that the resulting evidence and insights reach the correct teacher/student account, without cross-realm leakage.
3. Listen to narration on the intended iPad/Chromebook devices, including diagram labels and mathematical notation. Check keyboard/touch and focus behaviour there.
4. Have teachers sample early, middle and final weeks at each level for reading load, challenge progression and the usefulness of feedback. Increase independent maths validators for currently unsupported task families.
5. The deferred [security follow-up](SECURITY_FOLLOW_UP.md) remains a separate rollout gate; this audit does not change production security settings.

The automatic approval review rejected a broader coaching-routing edit because it could affect excluded Level 8 Measurement. That edit was not applied. The implemented coaching corrections are confined to Number and Pattern lessons.
