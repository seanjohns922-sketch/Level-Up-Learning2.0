# Ground Starpath assessment redesign

Status: all five redesigned forms are implemented for protected review, 17 September 2026. Sean approved the six representative examples. The new bank contains 100 version-4 items; existing student banks remain unchanged pending content review.

## Source and scope

Checked the supplied `mathematics-curriculum-content-f-6-v9 (4).pdf`, Foundation Space, page 9, and the Ground lessons for weeks 1–8. The two descriptors are AC9MFSP01 (sort, name, create familiar shapes; recognise and describe shapes in objects, giving reasons) and AC9MFSP02 (describe relative position/location in familiar spaces).

The lesson artwork is useful; lesson hints, model answers and corrective feedback are not appropriate diagnostic defaults. The prototype reuses the existing shape and position renderers, with assessment-specific interactions. A selected-response reason is limited evidence of explaining; no automated score can establish all oral, physical or open-ended curriculum experiences.

## Proposed 20-question blueprint for each form

| Slot | Evidence | Interaction |
|---|---|---|
| 1 | Recognise a named familiar shape | Choose an unlabelled shape; no target example |
| 2 | Recognise another named shape in a different orientation | Choose; no colour cue |
| 3 | Name a shown shape | Spoken/read-aloud word options |
| 4 | Recognise a familiar shape in an everyday object | Identify a clearly marked part, not an ambiguous silhouette |
| 5 | Sort by shape despite colour/size changes | Select all matching shapes |
| 6 | Describe why a group belongs together | Select a property-based reason |
| 7 | Distinguish a shape from a non-example | Select an outlier and a reason |
| 8 | Compare familiar shapes using a visible property | Select a description |
| 9 | Create a triangle | Join dots; accept any valid triangle |
| 10 | Create a square or rectangle | Join dots; validate geometry, not exact vertices |
| 11 | Compose a familiar shape from pieces | Move/turn two pieces; accept equivalent arrangements |
| 12 | Choose shapes for a familiar picture and explain a choice | Meaningful picture context; no ghost answer |
| 13 | Describe above/below relative to a named object | Scene and spoken word choices |
| 14 | Describe beside relative to a named person/object | Scene with clear reference |
| 15 | Describe inside/outside | Clear container boundary |
| 16 | Describe under/on top of | Recognisable familiar objects |
| 17 | Describe in front/behind | Unambiguous depth and occlusion, not screen coordinates |
| 18 | Follow one location instruction | Place object; accept all valid locations |
| 19 | Identify an object from two compatible position clues | Small scene with named references |
| 20 | Describe a changed position in a familiar scene | Before/after scene; no advanced map/grid terminology |

Slots 5–6 can use separate scenes to avoid coaching between items. The order can interleave strands for student variety. Describing positions must remain directly assessed rather than replaced entirely by placement.

## Five matched forms: 100 authored items

Pre-test, Post-test, Start, Mid and End each retain 20 questions and the same skill/demand blueprint. Change objects, shape geometry/orientation, placement, answer order and familiar contexts—not just colours. Match reading load, number of choices, number of pieces and reasoning steps. Audit every authored item rather than assume generator variation is sufficient. Ground remains the diagnostic entry level.

No reference picture for a naming task. Shape options have neutral identifiers in accessibility text; audio must not name the correct shape. Avoid competing square/rectangle choices when both satisfy the request. Colour must not predict the answer. Construction accepts valid alternatives; placement accepts both sides for “beside”. Feedback during an assessment acknowledges recording without teaching the answer.

## Review examples

`/demo-review/starpath-ground-redesign`, protected by the existing Starpath demo gate:

1. Rectangle recognition with three same-colour shapes and no reference.
2. Select triangles across colours/orientations/sizes, then select a reason.
3. Draw any triangle on a compact dot board; Undo, Clear and explicit Done.
4. Combine two equal right triangles into a square; drag or select/arrow/turn controls.
5. Describe moon location relative to a rocket.
6. Place explorer beside rocket; left and right both valid.

The examples use page-local state only. No assessment bank imports, Supabase writes, login/session changes or result migration. Reviewer scoring is collapsed and opt-in. These six examples are not a completed five-form release.

## Release status and validation

The full review is now at `/demo-review/starpath-ground`. The six original examples remain at `/demo-review/starpath-ground-redesign` for comparison. The full review shares an assessment-only card and pure scorers rather than lesson teaching controls.

Implemented all 100 items with 12 shape questions and 8 position questions per form. Added explicit version-4 IDs, shuffled correct-answer positions within each form, five authored context configurations, property-based construction scoring, and response restoration when navigating between questions/forms. Above/below accepts all spaces on the relevant row; beside accepts both sides. Squares are accepted as rectangles in construction, consistent with their mathematical definition. Naming questions avoid competing square/rectangle choices.

Validation performed:
- All 100 questions rendered and answered correctly through Chrome; single prompts, nearby read-aloud controls, neutral recording feedback, no horizontal overflow and no student-data writes.
- All 100 layouts checked at 1366×768 and 390×844. The lowest desktop navigation row ends at 757 px. Mobile content stacks and may scroll vertically.
- Pure scoring tests reject distractors, extra selections, incorrect reasons, collinear triangles, crossed quadrilaterals, non-square rectangles for square tasks, and misaligned composition pieces. They accept rotated constructions, all square-composition orientations and valid alternative placements.
- Picture-piece IDs checked against actual lesson artwork; missing parts are omitted, with no ghost target. Basket overlap, tabletop contact and fence occlusion were visually checked and corrected.
- `npm run qa:starpath-ground-redesign` is included in the prebuild release checks. TypeScript, ESLint and the existing prebuild audits pass.

This is a content-review release, not a student-bank migration. The diagnostic version-3 bank, student login/RPC permissions, result persistence and placement logic are unchanged. The audit explicitly verifies that existing diagnostics still resolve to their original questions. A subsequent student rollout must version the new bank and preserve existing attempts; review-only browser tests do not claim to validate a new student endpoint.

Physical position tasks and open-ended picture explanations remain useful teacher observations alongside the diagnostic. Difficulty labels are intended difficulty, not empirical calibration.
