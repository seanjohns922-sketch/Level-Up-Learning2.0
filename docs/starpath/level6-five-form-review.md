# Starpath Level 6: five assessment forms

Status: review bank, version 6.0.0. Five matched forms (Pre-Test, Post-Test, Start, Mid, End), each with 20 questions. The review route does not write student attempts or replace the existing live bank.

## Curriculum and lesson coverage

Source: supplied Australian Curriculum v9 F–6 Mathematics PDF, Year 6 Space, PDF page 67. The three content descriptions are mapped below. This is coverage of those descriptions, not a claim that every optional elaboration is separately assessed.

| Content description | Questions per form | Existing lesson connection |
| --- | --- | --- |
| AC9M6SP01: parallel cross-sections and their relationship to right prisms | 1–6 (6) | Weeks 1–2: predict, compare and reconstruct solids from sections; distinguish prisms from cones, pyramids and cylinders |
| AC9M6SP02: four-quadrant Cartesian positions and coordinate changes | 7–12 (6) | Weeks 3–4: signed coordinates, axis positions, movement across axes and missing vertices |
| AC9M6SP03: combinations of transformations to create tessellations and geometric patterns | 13–20 (8) | Week 5 transformation chains; Weeks 6–7 tessellations and rules; Week 8 mixed application |

Only eight questions use Cartesian diagrams: questions 7–13 and 20. The remaining twelve use solids, cross-sections, motifs or tiling. Transformations are assessed through construction and reasoning as well as recognition.

## Matched forms and difficulty

Each form follows the same skill sequence with varied solids, coordinates, arrangements, operations and distractor positions. Early questions establish recognition and interpretation; later questions require multiple steps, construction and justification. Coordinates remain within the existing lesson range of −4 to 4.

Construction tasks include plotting points, building a transformed triangle, rotating six triangles to complete a tessellation patch, and writing a two-command transformation program. Scoring accepts any valid two-command program and any vertex order for a correctly constructed triangle. Duplicate vertices, incomplete shapes and malformed coordinate strings are rejected.

Right-prism reasoning explicitly distinguishes constant polygonal sections from the constant circular sections of a cylinder. The tiling questions include angle reasoning, identifying gaps, and combining half-turns with translations.

## Presentation and interaction

The bank uses the shared Starpath theme, lesson cross-section artwork and lesson tessellation geometry. Question-number navigation, Back, Next and “I don’t know” follow the existing review pattern. Answers remain editable and isolated between forms. No separate Done step is added. Diagram narration and question audio are provided without revealing answers.

The shared parallelogram tiling renderer was corrected so adjoining rows align and the illustrated angles are 60° and 120°. The legacy Level 6 audit now accepts the existing valid answers expressed as side counts; legacy assessment content was not changed.

## Validation

- New audit: 100 questions; 6/6/8 descriptor allocation; all quadrants and axes; independent transformation matrices; all 16 two-command combinations; tessellation rotations; blank, duplicate and malformed responses; form variation.
- Existing Level 6 audit: 24 lessons, 576 generated tasks, 105 weekly quiz questions and 40 existing assessment questions.
- Browser sweep: all 100 expected answers through the rendered controls; desktop and mobile horizontal overflow checks; no runtime errors.
- Separate browser checks: Back/Next answer persistence, form isolation, skip and subsequent editing, keyboard plotting and motif variants.
- Full repository prebuild audit suite, TypeScript and targeted lint checks.

Review entry: `/demo-review/starpath-level6`. Existing server-side Starpath access checks remain in place. Authentication and student data persistence were not changed.
