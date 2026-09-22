# Starpath Level 8 assessment review

Five matched forms (Pre-Test, Post-Test, Start, Mid, End), 30 questions each, 150 isolated v8 items. Every multiple-choice question has four distinct alternatives. Review responses remain local and do not write student attempts.

## Curriculum reference

Source: the local `mathematics-curriculum-content-7-10-v9.docx`, Year 8 Space. This is the available Word edition of the Years 7–10 curriculum previously requested as a PDF.

| Description | Questions | Assessed evidence |
| --- | --- | --- |
| AC9M8SP01: congruence and similarity conditions, including transformations | 1–8 | SSS, included-angle SAS, angle-only similarity, RHS, ambiguous SSA, corresponding lengths, rectangle proportions and reflection invariants. |
| AC9M8SP02: quadrilateral properties using congruent triangles and angles; solve with reasoning | 9–16 | Adjacent angles, bisecting/equal diagonals, rhombus angle bisectors, kite symmetry, angle sums, an ASA argument for parallelogram opposite sides, and a counterexample to an equal-diagonals claim. |
| AC9M8SP03: positions in three dimensions, including 3D coordinates and digital tools | 17–23 | Read and place 3D points, rotate the view, change all three coordinates, compare vertical columns and 2D projections, locate a cuboid corner and follow a two-step route. |
| AC9M8SP04: design, create and test congruence/similarity algorithms; explain operation | 24–30 | Trace, complete, repair, apply and construct classification decisions; test an equal-perimeter rule with a counterexample; compare equivalent similarity tests. |

Allocation: 8 / 8 / 7 / 7. Only seven items use coordinate diagrams, and these assess Year 8 three-dimensional position rather than repeating Year 7 Cartesian plotting.

This covers all four content descriptions, not every optional elaboration. Decision-tree construction is a structured sample of algorithm design; open-ended design and written proof remain valuable classroom evidence.

## Difficulty and representations

- Distractors use closely related conditions: included versus non-included angles, similarity versus congruence, equal diagonals versus bisection, full versus half diagonals, coordinate-order/height mistakes and flawed algorithm rules.
- Forms vary side lengths, angles, ratios, coordinates, models, orientation and option order. They retain comparable demands and a common skill sequence.
- Triangle side and angle geometry is calculated, including both valid SSA constructions. Diagonal intersections are calculated from the vertices rather than placed by eye.
- Three-dimensional axes are numbered 0–4, with floor grids and projection lines. Rotating the view preserves coordinates. Placement uses a z selector and keyboard-accessible floor intersections.
- Existing Starpath weekly content/artwork was inspected (lesson shell, Level 6 lesson/assessment geometry, coordinate and shape cards). Weekly lesson files stop at Level 6. These new advanced diagrams build on the existing code-based polygon presentation; lower-level nets and solid recognition artwork do not accurately represent the new angle/ratio/3D-coordinate evidence. No Level 8 weekly-lesson alignment is claimed.
- Shared Starpath theme, read-aloud, question navigation, Back/Next, skip, review details and form isolation follow the established review screens.

## Review and release

Route: `/demo-review/starpath-level8`. All five forms are available through the central review panel’s Level 8 Space selection. The existing server-side demo access guard remains in place. No student login, RPC, placement or live-assessment release changes are included.

## Checks

`npm run qa:starpath-level8-five-forms` validates 150 items, code allocation, unique choices, correct/wrong/blank scoring, actual polygon side/angle geometry, similarity ratios, SSA ambiguity, quadrilateral calculations, 3D bounds and movements, sorter outputs, decision alternatives and matched-form variation. Browser checks additionally exercise the actual input controls and layouts.

Verification completed: the full prebuild audit suite, TypeScript checking, targeted ESLint and whitespace checks passed. Browser testing verified correct responses for all 150 items. Final browser checks covered all five review links, desktop/tablet/mobile layouts, keyboard placement, all four 3D camera views, Back/Next answer persistence, form isolation, reset, skip and completion, with no runtime errors or horizontal overflow.

## Plain-language revision

Congruence questions now lead with “same shape and size”. Relevant questions define congruent and similar visibly and in question read-aloud. Answer choices describe the measured sides/angles rather than requiring SSS/SAS/ASA/RHS abbreviations. Recognition captions name the triangles without identifying the test. Later classification and algorithm wording uses matching sides, shape, size and explained scale factors. Geometry, answer IDs, curriculum allocation and scoring are unchanged.
