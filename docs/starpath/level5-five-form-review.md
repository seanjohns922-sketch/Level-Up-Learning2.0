# Starpath Level 5 — five assessment review forms

Pre-Test, Post-Test, Start, Mid and End each have 20 questions (100 total). The protected `/demo-review/starpath-level5` route stores answers in page state for review. Existing student banks, saved attempts, placement and login RPCs are unchanged.

## Curriculum and lesson evidence

Checked the user's `mathematics-curriculum-content-f-6-v9 (4).pdf`, page 55, and the Level 5 lesson index plus net, solid, coordinate and transformation activity data/renderers. Coverage per form:

- **AC9M5SP01 — seven questions:** connect objects to nets, predict valid cube nets, track opposite faces, explain overlapping faces, complete a net, design a different net and compare prism/pyramid nets. Exact face dimensions and layouts reuse the lesson's hinged-solid data. Cube net classification uses the lesson folding engine and is independently checked with 3D face frames.
- **AC9M5SP02 — six questions:** read and plot ordered pairs, construct numbered axes, correct reversed coordinates, follow movements and plan a shortest route via a checkpoint. Coordinates identify line intersections, starting at zero, in the first quadrant. Grid references from Level 4 are not substituted for coordinates.
- **AC9M5SP03 — seven questions:** perform and describe whole-shape translations, reflect and rotate whole triangles, explain invariant side lengths/angles, identify line and half-turn symmetry and combine reflection with translation. Reuses the lesson geometry helpers with controlled polygon vertices. No negative coordinates or algebraic transformation rules are required.

Weekly progression: weeks 1–3 nets, week 4 coordinates, week 5 movement, week 6 translations, week 7 reflection/rotation and week 8 combined reasoning. Early recognition tasks provide entry points; spatial construction, opposite faces, constrained routes and combined transformations add challenge. All forms retain the same blueprint and whole-shape vertex counts. Contexts, net layouts, face labels, orientation, coordinates and answer ordering vary. Intended difficulty is not empirically calibrated.

Making a net digitally provides evidence of spatial reasoning; physical cutting/folding, packaging investigations and culturally situated classroom investigations remain complementary evidence. Not every curriculum elaboration is separately tested.

## Interaction and validation

Shared Starpath theme, 1–20 question navigation, direct Next/Back/skip, per-form answers, read-aloud and editable constructions. Given net squares stay fixed. Construction accepts any valid alternative cube net that includes the anchor and differs from the example up to rotation/reflection. Whole-shape answers accept vertices in any order, rejecting duplicates and missing vertices. Paths must visit the checkpoint before first arrival at the finish and meet the specified shortest length. No correctness feedback or folding preview reveals an answer during an assessment.

The audit checks 100 unique items, descriptor counts, variation, independent net folding/opposite-face geometry, alternative net construction, first-quadrant bounds, axes, routes and independently computed transformations. The independent folding check covers all 216 fixed six-square arrangements and finds the eleven distinct cube nets. All 100 browser answers passed (five 20/20 totals), with desktop/mobile overflow and runtime-error checks. Keyboard plotting, locked net faces, Reset, Next/Back restoration and skipping also passed. TypeScript, targeted ESLint and the full prebuild suite passed.
