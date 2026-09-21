# Starpath Level 4 — five assessment review forms

Pre-Test, Post-Test, Start, Mid and End have 20 matched questions each, 100 total. Protected route: `/demo-review/starpath-level4`. Answers are page-local during review. Existing student banks, results, placement and login/session RPCs are unchanged.

## Curriculum and lessons

Checked the supplied `mathematics-curriculum-content-f-6-v9 (4).pdf`, pages 44–45, and all eight Level 4 lesson weeks. Coverage:

- **AC9M4SP01 (7 questions):** represent and approximate composite shapes and objects with familiar components. Identify components, recompose a rectangular part from triangles, build a cube approximation, interpret composite solids and explain a simplified representation.
- **AC9M4SP02 (7 questions):** create and interpret grid reference systems and pathways. Read/type references, locate squares, place landmarks at references, label a grid, trace directions, author a route via a checkpoint, and interpret a route log.
- **AC9M4SP03 (6 questions):** recognise line/rotational symmetry and create symmetrical patterns. Test line symmetry, complete horizontal/vertical and diagonal reflections, test quarter/half turns, complete rotation patterns, and create a design satisfying symmetry and colour constraints.

Reviewed the lesson composite figure/object SVGs, grid reference/route code and symmetry activities before implementation. Reuses the lesson's recognisable rockets, boats, trees, cars, butterflies and composite equipment; controlled cube geometry comes from the approved Level 3 renderer. Grid reference formatting uses the shared lesson helper. Reflection and rotation geometry is checked independently in the audit.

Forms vary their figures, cube arrangements, objects, map contexts, landmarks, directions, orientations, target references, symmetry axes, turns, seed patterns and colours. The matched blueprint is 7/7/6 across the three descriptors. Intended difficulty is not empirically calibrated. Physical investigations and culturally situated classroom activities complement these digital questions; not every elaboration is separately assessed.

## Interaction

Shared Starpath theme, numbered question navigation and direct Next/Back/skip behaviour. Read-aloud controls cover wording, choices, diagram information and controls. No Done step or immediate correctness feedback. Students can adjust cube heights, change grid answers, reposition landmarks, undo routes, recolour/erase added symmetry tiles and reset designs. Given symmetry tiles remain fixed.

Grid references identify squares, not coordinate intersections: letters run left to right; row numbers increase from bottom to top. Column-first formatting accepts lowercase and whitespace, but not reversed references. Routes accept different valid paths with a checkpoint before first arrival at the destination and no closed/out-of-bounds squares. Symmetry includes colour matching. Creative designs accept different valid patterns with at least six tiles and both colours, rather than a fixed target picture.

## Validation

The `qa:starpath-level4-five-forms` prebuild audit checks 100 unique items, matched descriptor coverage, actual component sets, counts, cube heights, grid references, placement, route alternatives, independent reflection/rotation geometry, creative alternatives, wrong colours, duplicate tiles, empty answers and distractors. Browser checks cover all 100 correct answers, five 20/20 totals, desktop/mobile layout, protected anonymous access, and absence of runtime errors. TypeScript, targeted ESLint and the full prebuild suite are checked before release.

## Difficulty refinement — 21 September 2026

Question 3 asks how two triangular pieces can recompose a rectangular part. Questions 6 and 7 compare spatial arrangements and ways to simplify a recognisable object. All forms now test half-turn recognition, quarter-turn completion (six added tiles) and creation of a vertical-line-symmetrical design with at least six tiles and both colours. This matches intended task demands; equivalent difficulty still needs student response evidence.
