# Starpath Level 1: five redesigned review forms

## Scope and sources

Pre-Test, Post-Test, Start, Mid and End each contain 20 questions (100 version-5 items). Review route: `/demo-review/starpath-level1`. This is a protected content review, with page-local answers. The existing student assessment/diagnostic banks, sessions, scoring history and placement are not migrated by this change.

Checked the supplied `mathematics-curriculum-content-f-6-v9 (4).pdf`, page 16:

- AC9M1SP01: make, compare and classify familiar shapes; recognise shapes and objects in the environment and identify similarities and differences.
- AC9M1SP02: give and follow directions to move people and objects within a space.

Reviewed Level 1 weeks 1–8, especially `week1Lessons.ts`, `week4WorldObjects.ts`, `world-objects.ts`, `route-tasks.ts`, the lesson index, and the shape/path lesson renderers. Reused the established ShapeVisual, SceneObjectVisual and PositionObjectVisual artwork. Irregular quadrilaterals use controlled vector geometry. Lesson hints, corrective feedback and success animations are not part of the assessment.

Physical sorting by touch, construction with actual blocks, oral explanations and contextual cultural activities still need classroom observation. These digital forms sample the descriptors; they do not claim to replace every elaboration. Difficulty labels describe intended demand, not empirical calibration.

## Matched blueprint

| Question | Evidence | Week |
|---|---|---|
| 1 | Recognise a familiar shape in a changed orientation | 1 |
| 2 | Select all four-sided shapes, including an irregular quadrilateral | 1 |
| 3 | Explain the difference between a circle and an oval | 1 |
| 4 | Classify by shape properties despite colour and size changes | 2 |
| 5 | Select shapes satisfying both colour and shape criteria | 2 |
| 6 | Describe a specified part of an everyday object | 4 |
| 7 | Identify an odd shape and select a geometric reason | 4 |
| 8 | Construct any valid triangle | 5 |
| 9 | Construct a square or rectangle; accept valid rotations | 5 |
| 10 | Compare a rectangle with an irregular quadrilateral | 5 |
| 11 | Follow two directional instructions | 6 |
| 12 | Follow three instructions in order | 6 |
| 13 | Interpret a left/right turn from an explicitly stated facing | 6 |
| 14 | Record an ordered route from a diagram | 6 |
| 15 | Give directions to reach a destination | 6 |
| 16 | Identify the incorrect step in directions for a pictured route | 7 |
| 17 | Select an ordered direction sequence reaching a destination | 7 |
| 18 | Give a route avoiding an obstacle | 7 |
| 19 | Give a route visiting a landmark before the destination | 8 |
| 20 | Combine a waypoint and obstacle constraint | 8 |

## Form variation and interaction

The five forms vary shape geometry, orientation, size, colour, object context, answer order, map orientation, landmarks and direction sequences. Whole-scene rotations/reflections preserve the number of route steps and constraints. The fifth form reflects its turn instruction consistently. Geometry remains the source of scoring; a shape is not defined by its orientation. Square/rectangle naming avoids competing valid choices.

All forms use the approved compact Ground presentation, realm theme, numbered navigation, read-aloud and direct Next behaviour. There is no extra Done step. A changed response is recorded immediately when it is non-empty (and its required reason is selected). I don’t know records a skip and advances; the last question finishes the review. Review navigation permits visiting unanswered items, matching Number and Measurement review. Back and number jumps preserve each form’s own responses. Correctness is available only in collapsed review details.

Routes accept any valid solution satisfying the stated conditions. They reject off-map moves, crossing rocks, missing a waypoint, reaching the destination before the waypoint, and extra movement after arrival. Recording a particular pictured route requires that exact order. Empty answers are never correct. Map narration describes only the visible start, landmarks, obstacles and pictured route; it does not supply an unshown solution.

## Verification

`npm run qa:starpath-level1-five-forms` validates the 100-item blueprint, unique versioned IDs, form variation, correct/distractor responses, invalid and rotated constructions, multiple valid routes, route order, bounds, obstacles and waypoints. Included in prebuild release checks.

Browser verification covered all 100 items at laptop and phone widths: correct responses and 20/20 totals in every form, numbered navigation, no Done control, no horizontal overflow, and rejection of unauthenticated access. Longer questions can scroll vertically on short laptop screens; maps retain readable 70-pixel cells. Reviewed rendered shape, object, turn, route and obstacle examples. An unsupported rock asset was caught in visual review and replaced with an explicit rock illustration. TypeScript, ESLint and the complete prebuild checks passed.
