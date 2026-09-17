# Starpath Level 3 — five matched review forms

## Scope

Pre-Test, Post-Test, Start, Mid and End each contain 20 new version-5 questions: 100 in total. The protected `/demo-review/starpath-level3` route uses page-local answers. Existing student assessment banks, saved attempts, placement and login/session RPCs are unchanged during review.

## Curriculum and lesson alignment

Checked the supplied `mathematics-curriculum-content-f-6-v9 (4).pdf`, page 34:

- **AC9M3SP01:** make, compare and classify objects, identify key features and explain suitability for a purpose.
- **AC9M3SP02:** interpret and create two-dimensional representations of familiar environments, locating landmarks relative to each other.

Reviewed the Level 3 lesson index, object catalogue, model-building activities, viewpoint tasks and map-creation activities. Reuses the lesson's cube, rectangular prism, sphere, cone and cylinder SVGs. The assessment pyramid distinguishes hidden edges, correcting the lesson drawing's exposed back-face effect. Cube assemblies use controlled isometric geometry. Maps reuse the approved labelled landmark symbols and pathway renderer; new creation tasks follow the lessons' constraint-based approach. Plan/front diagrams show the same room with different visible information.

| Questions | Skill | Descriptor |
|---|---|---|
| 1–3 | Name a 3D object; count all flat faces and vertices | SP01 |
| 4–5 | Classify curved surfaces; compare object features | SP01 |
| 6 | Choose an object for a purpose and justify using its features | SP01 |
| 7 | Distinguish pyramid and cone surfaces | SP01 |
| 8 | Count cubes in a solid model, including hidden cubes | SP01 |
| 9 | Construct a rectangular prism by building columns | SP01 |
| 10 | Compare cube models with equal heights and different bases | SP01 |
| 11–12 | Interpret a map key and an explorer's viewpoint | SP02 |
| 13–14 | Interpret and compare plan and front representations | SP02 |
| 15–16 | Create maps meeting two and three positional clues | SP02 |
| 17–18 | Combine positional clues and change viewpoint | SP02 |
| 19 | Plan a route via a landmark, avoiding a closure | SP02 |
| 20 | Create a map satisfying four linked conditions | SP02 |

Ten questions per descriptor. Forms vary objects, quantities, model dimensions, purposes, answer ordering, map contexts, orientation, viewpoint and constraints. Familiar contexts include school grounds, parks, a camp and a community room. Intended difficulty progresses from recognition to construction and reasoning; it is not empirically calibrated. Practical physical construction and local/Country/Place investigations remain complementary classroom evidence, not fully assessed by these digital forms.

## Interaction and validation

Uses the shared Starpath theme and approved form tabs, 1–20 question navigation, direct Next, Back and I don't know behaviour. There is no Done step. Read-aloud controls cover prompts, visible diagram information, choices, model controls and map clues. Naming tasks do not label the pictured object with its answer. Model columns can be increased or decreased; map landmarks can be repositioned or cleared. Incorrect responses stay editable without exposing correctness until review details are opened.

Map construction accepts every non-overlapping, in-bounds layout satisfying the clues; it does not require one fixed arrangement. Directly above/below means the same column; directly left/right means the same row. The automated audit enumerates every possible placement for these tasks, accepting 780 valid layouts across the forms and rejecting all invalid ones. Other checks cover object properties, cube counts, viewpoints, correct/distractor scoring, empty responses, matched curriculum coverage and form variation.

All 100 items passed Chrome interactions and scoring (five 20/20 review totals), with protected-access, desktop/mobile horizontal overflow and runtime-error checks. Larger tasks stack on narrow screens. TypeScript, targeted ESLint and the complete prebuild audit suite were also checked. The prebuild suite ran in an isolated checkout to avoid unrelated in-progress parent-dashboard edits in the shared workspace.
