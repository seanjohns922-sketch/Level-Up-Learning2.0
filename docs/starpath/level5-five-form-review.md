# Starpath Level 5 — five assessment review forms

Pre-Test, Post-Test, Start, Mid and End each have 20 questions (100 total). The protected `/demo-review/starpath-level5` route stores answers in page state for review. Existing student banks, saved attempts, placement and login RPCs are unchanged.

## Curriculum and lesson evidence

Checked the user's `mathematics-curriculum-content-f-6-v9 (4).pdf`, page 55, and the Level 5 lesson index plus net, solid, coordinate and transformation activity data/renderers. Coverage per form:

- **AC9M5SP01 — seven questions:** connect objects to nets, predict valid cube nets, track opposite faces, explain overlapping faces, complete and digitally fold a net, design a different net and compare prism/pyramid nets. Exact face dimensions and layouts reuse the lesson's hinged-solid data. Cube net classification uses the lesson folding engine and is independently checked with 3D face frames.
- **AC9M5SP02 — six questions:** read and plot ordered pairs, construct numbered axes, correct reversed coordinates, follow movements and plan a shortest route via a checkpoint. Coordinates identify line intersections, starting at zero, in the first quadrant. Grid references from Level 4 are not substituted for coordinates.
- **AC9M5SP03 — seven questions:** perform and describe whole-shape translations, reflect and rotate whole triangles, explain invariant side lengths/angles, identify line and half-turn symmetry and combine reflection with translation. Reuses the lesson geometry helpers with controlled polygon vertices. No negative coordinates or algebraic transformation rules are required.

Weekly progression: weeks 1–3 nets, week 4 coordinates, week 5 movement, week 6 translations, week 7 reflection/rotation and week 8 combined reasoning. Early recognition tasks provide entry points; spatial construction, opposite faces, constrained routes and combined transformations add challenge. All forms retain the same blueprint and whole-shape vertex counts. Contexts, net layouts, face labels, orientation, coordinates and answer ordering vary. Intended difficulty is not empirically calibrated.

Making a net digitally provides evidence of spatial reasoning; physical cutting/folding, packaging investigations and culturally situated classroom investigations remain complementary evidence. Not every curriculum elaboration is separately tested.

## Interaction and validation

Shared Starpath theme, 1–20 question navigation, direct Next/Back/skip, per-form answers, read-aloud and editable constructions. Given net squares stay fixed. Construction accepts any valid alternative cube net that includes the anchor and differs from the example up to rotation/reflection. Whole-shape answers accept vertices in any order, rejecting duplicates and missing vertices. Paths must visit the checkpoint before first arrival at the finish and meet the specified shortest length. The net-completion item explicitly assesses construction and inspection: students add a face, fold their own net, inspect it and may revise it. Editing the net resets its folded state; the final construction must be folded before submission. Other net items do not offer a folding preview.

The audit checks 100 unique items, descriptor counts, variation, independent net folding/opposite-face geometry, alternative net construction, first-quadrant bounds, axes, routes and independently computed transformations. The independent folding check covers all 216 fixed six-square arrangements and finds the eleven distinct cube nets. Initial-release validation: all 100 browser answers passed (five 20/20 totals), with desktop/mobile overflow and runtime-error checks. Keyboard plotting, locked net faces, Reset, Next/Back restoration and skipping also passed. TypeScript, targeted ESLint and the full prebuild suite passed.

## Balance and lesson improvements

Three transformation items (15, 18, 19) now use plain shape diagrams without coordinate axes: describing a slide, invariant lengths/angles and symmetry. Ten rather than thirteen questions use coordinate grids; only six primarily assess coordinates. All five forms retain 7/6/7 descriptor allocation.

Week 4 now includes entering every tick label on both axes, between origin identification and coordinate reading. Weeks 6–7 progress from a marked point to constructing a whole triangle image for translation, reflection and rotation. These are digital spatial tasks; physical assembly remains useful complementary evidence.

Rebalance validation: all 100 individual answers passed in headless Chrome, with desktop and mobile overflow checks and no page errors. Axis entry and all three whole-triangle lesson tasks passed keyboard interaction and scoring checks. TypeScript, targeted ESLint, the Level 5 lesson and five-form audits, and the full prebuild suite passed. The folding preview now sits beside the construction grid.
