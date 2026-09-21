# Starpath Level 7 assessment review

Five review forms: Pre-Test, Post-Test, Start, Mid and End. Each contains 30 questions (150 versioned items), with a shared skill sequence and comparable task demands. Four options are provided for every choice question. Multi-select questions explicitly request every applicable family.

## Curriculum source and scope

Checked against the local Australian Curriculum v9 Years 7–10 document, `mathematics-curriculum-content-7-10-v9.docx` in Downloads, Year 7 Space. The requested PDF was not found locally; this is the available Word edition. All four Year 7 Space content descriptions are represented:

| Code | Questions | Evidence |
| --- | --- | --- |
| AC9M7SP01 | 1–8 | Cube nets and opposite faces; footprints, front/side profiles, height plans and isometric models; reconstructing cube totals; reasoning about representation limitations and choice. |
| AC9M7SP02 | 9–16 | Triangle side/angle classification and possible side lengths; inclusive quadrilateral families; square, parallelogram, rhombus and kite properties; regularity and family relationships. |
| AC9M7SP03 | 17–23 | Whole-shape translations, reflections in both axes, a quarter-turn about a specified non-origin point, signed translation vectors, successive parallel reflections and equivalent two-reflection programs. |
| AC9M7SP04 | 24–30 | Trace, complete, debug and compare classification algorithms; run a polygon sorter; construct a three-decision classification tree; identify a counterexample. |

The allocation is 8 / 8 / 7 / 7; only seven questions use Cartesian diagrams. This is descriptor coverage, not a claim that every optional elaboration is separately assessed. The structured decision-tree construction samples algorithm design, but does not replace open-ended classroom creation and explanation.

The checked-in weekly Starpath lesson components currently stop at Level 6. Level 7 lesson alignment cannot yet be claimed. Existing cube-net geometry from Level 5 and cube artwork from Level 3 are reused; polygon and coordinate graphics preserve controlled mathematical geometry.

## Assessment and presentation decisions

- Definitions are explicit where categories can overlap: squares belong to rectangle and rhombus families; the trapezium item uses exactly one parallel pair. The triangle algorithm comparison explicitly uses disjoint output categories.
- Close distractors reflect likely errors in folding, hidden cubes, side/angle conditions, triangle inequality and decision rules.
- Form variants change nets, cube models, triangle lengths, coordinate locations, rotation centres and polygon orientation. The underlying skill sequence stays fixed.
- Interactive responses include full transformed shapes, signed vectors, reflection programs, classification and decision-tree completion. Either valid order of the two perpendicular-axis reflections is accepted.
- Read-aloud covers prompts, diagram facts, options and interaction instructions. It does not state hidden answers.
- Shared Starpath theme, question-number navigation, Back/Next, skip and review details follow the existing review screens. Responses remain local to this review page and isolated by item/form.

## Access and release

Review route: `/demo-review/starpath-level7`. The central review panel links all five forms for Year 7 Space. The route uses the existing server-side Starpath demo access guard. No student login, session, RPC, database, placement or live-assessment release changes are included.

## Verification

`npm run qa:starpath-level7-five-forms` checks all 150 items, counts, code allocation, four distinct options, expected/wrong/blank responses, cube-net validity, profile/count calculations, triangle inequalities, coordinate bounds, transformation calculations, both reflection orders, sorting/decision errors and form variation. TypeScript, targeted lint and browser review complement this data audit.

Validation completed: the full prebuild regression suite, TypeScript and targeted ESLint pass. Browser automation entered and checked correct responses for all 150 items at desktop and phone widths with no runtime errors or horizontal overflow. Separate interaction checks cover Back/Next persistence, form isolation, skip/edit, keyboard point selection, both reflection orders, Undo/Reset and finishing a form. Visual inspection corrected label placement, compact profile choices and read-aloud icon sizing.

All five main review-panel entry points and the return link were checked. Final representative screens were verified at 1366, 768 and 390 pixels wide; a tablet breakpoint correction keeps choices and audio controls within the card.
