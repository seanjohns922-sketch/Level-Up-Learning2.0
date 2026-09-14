# Starpath pre/post assessment review

Review date: 14 September 2026. Scope: Ground post-test and both forms for Levels 1–6, 13 forms / 260 item positions. This is a review of the banks selected by the current repository's assessment API, their generated task payloads, and the relevant scoring/rendering code. It is not an empirical calibration study, a full browser test of every item, or verification of the bank version used for historical student scores. No assessment or progression code was changed.

**Judgement: the concern is justified. Several assessments can award high scores without sufficient independent evidence of the full year-level Space content.** There are useful tasks and broadly correct topic allocations, but repetition, answer cues, weak alternatives and some scoring defects make the current scores unsafe to interpret as comprehensive mastery. Children may also be strong in Space; this review cannot estimate how much of their performance is genuine proficiency versus test design.

## Curriculum basis

The supplied *Australian Curriculum: Mathematics – Curriculum content F–6, Version 9.0* was read and the relevant pages visually inspected: Foundation p.9; Year 1 p.16; Year 2 p.25; Year 3 p.34; Year 4 pp.44–45; Year 5 p.55; Year 6 p.67. Ground corresponds to Foundation and Levels 1–6 to Years 1–6.

The content descriptions are the alignment target. Elaborations illustrate the intended breadth and demand; they are not a mandatory checklist requiring every example in a 20-question test. [ACARA explains this distinction](https://www.australiancurriculum.edu.au/help/learning-areas/about-the-curriculum-content-elements).

The important progression is from recognising and making familiar shapes and describing positions, through classifying by spatial properties and creating representations, to geometric reasoning about nets, coordinate systems, transformations and cross-sections. Making questions longer or importing higher-year content would not repair weak assessment of these skills.

## Level-by-level findings

### Ground / Foundation — suitable entry content, weak upper-end evidence

**Curriculum:** AC9MFSP01 includes sorting, naming and creating familiar shapes, recognising shapes within objects and giving reasons. AC9MFSP02 concerns describing position relative to people and objects.

There is no Ground pre-test. The 20-item post-test has ten items mapped to each descriptor. Shape recognition, environmental shape matching and simple relative positions are appropriate. Keep these accessible tasks.

The supposed harder items are not consistently harder. Post Q9, tagged challenging/reasoning, asks the child to put one rectangle below a fixed square on a two-cell board. Only one cell is available. That supplies almost no evidence of independent reasoning. Several shape-creation items are prescribed arrangements rather than choices about which shapes to use. Q5 selects a supplied reason instead of generating one.

A separate fairness defect exists in Q19: “beside Geospin” accepts only the right-hand adjacent cell, although the left-hand adjacent cell also satisfies the wording. The renderer compares exact stored positions. Q10 similarly gives broad positional conditions but accepts one exact layout.

**Recommendation:** retain introductory items; replace forced placements with small genuine choices, add a visual classification plus reason and a simple picture-building task, and accept all arrangements that satisfy the stated conditions. Do not raise Foundation difficulty by adding reading load.

### Level 1 — accessible, but too repetitive and with a confirmed scoring defect

**Curriculum:** AC9M1SP01 requires making, comparing and classifying familiar shapes and identifying similarities/differences in environmental shapes and objects. AC9M1SP02 requires giving and following directions.

Both forms allocate 12 shape/object questions and eight direction questions. Each begins with six selected-response items; the remainder includes construction, repair, object matching and routes. Basic route authoring is useful, and post Q20 adds an appropriate checkpoint and obstacle condition.

The first several post questions closely resemble the pre questions: triangle side count, square naming, round shapes, round everyday objects and four-sided grouping. Changing colours or nouns gives limited evidence of transfer. Post Q12 is tagged reasoning but is another obvious outline-matching task.

**Confirmed scoring defect:** pre Q10 and post Q10 ask for a turned square. The assessment construction validator checks only a simple polygon with the requested vertex count unless the prompt contains “parallel”. It does not check equal sides or right angles. Executing the actual extracted validator accepted a non-square quadrilateral for both questions. The stored post-Q10 reference points also form a non-square rhombus. Correcting only the points would not repair the permissive validator.

**Recommendation:** repair square validation first. Use different orientations and non-prototypical familiar shapes; require a classification decision rather than repeated obvious naming; retain simple routes and add a small number of independent route repairs. Make pre and post comparable in demand without repeating the same item sequence.

### Level 2 — reasonable base, insufficient property reasoning and form independence

**Curriculum:** AC9M2SP01 emphasises comparing/classifying using sides and terms including opposite, parallel, curved and straight. AC9M2SP02 concerns locating positions in 2D representations and following pathways.

Each form has six selected shape-feature questions, four shape construction/repair questions, three map-location questions, two follow-route questions, two route-authoring questions, two missions and one debug question. The missions are a useful stronger component, and the assessment construction mode uses an open point grid rather than displaying a tracing outline.

Too many shape questions still ask obvious recognition: curved oval, circle boundary, triangle versus hexagon, or basic side count. There is limited direct evidence that children distinguish opposite from parallel, classify unfamiliar orientations, or compare non-obvious quadrilaterals. The construction UI explicitly supplies the required number of corners, so those items do not independently establish knowledge of side count.

Pre and post use the same MAP_A and MAP_B landmark layouts. Post Q11 calls the map “unfamiliar” even though the layout appears in the pre-test. Mission variants are better than simply rewording a location prompt, but overall independence is weak.

**Recommendation:** keep mission tasks and blank-grid construction; replace several recognition/location items with identifying side pairs, diagnosing an incorrect classification and applying properties to unfamiliar shapes. Give post-test maps genuinely different layouts. This is a targeted strengthening, not a need for Year 3 content.

### Level 3 — high priority: too narrow, repetitive and weak on making/explaining

**Curriculum:** AC9M3SP01 explicitly includes making objects and explaining why their features suit their uses. AC9M3SP02 includes interpreting and creating 2D representations with landmarks positioned relative to one another.

Each form contains eight object questions, eight map-creation questions and four routes. Thus 60% of the score comes from maps/routes, and 40% comes from one repeated map-creation format.

All eight map questions use four landmarks and three above/below/left/right constraints. A programmatic comparison confirmed the same eight relationship patterns in pre and post after landmark names are normalised. These are legitimate spatial tasks, but repeated success on this format is weak evidence of broad Year 3 mastery. Several items labelled reasoning or transfer are straightforward route construction without additional constraints.

Object questions compare, select and classify; none requires making an object. Choosing a cylinder for a roller is useful, but does not require the child to explain why its spatial features suit that use. The first four items also place the correct statement or object first; the relevant renderer preserves that order.

**Recommendation:** replace several repeated maps with interpreting a plan/top view, diagnosing and repairing a representation, and creating a map with a meaningful key. Add an object-construction task and a feature-to-use explanation, preferably allowing short oral or visual evidence rather than lengthy writing. Balance answer positions.

### Level 4 — promising content, undermined by assessment hints

**Curriculum:** AC9M4SP01 concerns representing/approximating composite shapes and objects; SP02 creating/interpreting grid-reference systems; SP03 recognising symmetry and creating symmetrical patterns.

Both forms use a sensible 7/6/7 descriptor allocation. Composite comparison with reasons, grid-reference responses and line/rotational symmetry are useful foundations.

However, the shared symmetry renderer draws ghost tiles showing where missing partners belong and highlights incorrect tiles in repair questions. It receives no assessment-mode switch to remove those aids. Six symmetry items in each form are construction/completion/repair modes, so much of the apparent construction demand can be reduced to following the shown positions. Post Q14 asks for the smallest matching turn while the card displays the configured 90° or 180° turn label and its read-aloud states that angle.

The seven composite questions choose among representations; six also select a supplied reason. They do not independently build a composite representation. Some evidence is too explicit: “Front heights: 1, 3, 2” largely resolves the three-view choice on its own. These can be useful interpretation items, but should not be counted as independent construction merely because there are multiple clicks. The six reason questions always put the correct reason first.

**Recommendation:** remove ghost answers and mismatch highlighting for assessment, and keep deliberate digital testing only where the question is explicitly assessing investigation. Add a genuine composite-building/approximation task, strengthen the evidence alternatives and neutralise the smallest-turn question. Do not discard the whole level: its content is stronger than the scaffolding currently allows it to demonstrate.

### Level 5 — high priority: over-cued and narrower than the curriculum

**Curriculum:** AC9M5SP01 connects objects to nets and building from nets with spatial/geometric reasoning; SP02 includes constructing a coordinate system; SP03 includes performing transformations and identifying invariants/symmetry.

The allocation is 7 nets / 6 coordinates / 7 transformations. But the net questions are exclusively about cubes. The supplied curriculum illustrates a range of prisms and pyramids; the broader “objects and nets” capability is not well sampled by cube-only questions.

The pre-test has 15 answer-selection tasks and five route/point-response tasks. Post has 14 selection tasks, five route/point-response tasks and one cube-net construction. Metadata labels only two questions in each form selected-response, overstating the evidence of construction. Neither form requires constructing a coordinate system, and transformations are mainly classified or applied to one point rather than an entire shape.

**Direct answer cue:** pre Q4 and post Q7 ask how many faces touch a marked cube face. Their read-aloud says every cube face shares an edge with four others, while “4 faces” is an option. Post Q7 is labelled transfer, but the answer is given. Folding controls are also available before several predictions, so those measure assisted observation more than unaided visualisation.

There are fairness issues too. Pre Q16 displays an unlabelled square arrangement and keys rotation, although a translation produces the same visible final square; post Q15 similarly keys reflection when translation gives the same unlabelled image. Point correspondence or a specified transformation is needed to make the intended answer unique. Some rewritten prompts also omit essential movement information that survives only in the read-aloud.

**Recommendation:** fix audio/prompt consistency and ambiguous transformations; use cube, non-cube prism and pyramid nets; ask children to construct axes/coordinates and transform a complete asymmetric figure; retain some tool-supported net construction but commit a prediction before showing a fold where prediction is the skill being assessed.

### Level 6 — high priority: weak independence and insufficient creation

**Curriculum:** AC9M6SP01 compares parallel cross-sections and relates them to right prisms; SP02 locates points in all quadrants and describes coordinate changes; SP03 uses combinations of transformations to create tessellations and other patterns.

The allocation is 6 cross-sections / 6 Cartesian / 8 transformations-tessellation items. Each form has **17 selected-response items and three point-placement items**. There is no actual tessellation creation.

The first six pre/post questions use identical prompts, objects and answers. Four generated task payloads are exactly identical; two merely alter distractors. Post labels increase the apparent difficulty without a corresponding change to the spatial problem. Q11 also repeats the same axis-crossing task.

The cross-section renderer shows the resulting slice before a “predict before slicing” response, including a “same size” label for constant sections. Audio provides explanations and methods. The six selected objects cover rectangular/hexagonal prisms, a square pyramid, cone and cylinder, but do not include a triangular prism. The focus is horizontal cuts; there is little independent comparison of different cut directions.

Cartesian questions use a small integer grid and relatively simple movements. Post Q9, tagged challenging/reasoning, asks which quadrant contains a point. That is a useful foundational check, not strong evidence of higher-demand Year 6 reasoning. Tessellation alternatives include “looks nice”, “different colours” and “lots of tiles”, making several “reasoning/transfer” questions answerable by basic terminology. The audio assertion that a tessellation needs identical copies is too broad: mixed-tile tessellations are possible. Any resizing question needs to specify the arrangement and what stays fixed.

**Recommendation:** rewrite genuinely separate forms, preserve foundational coordinate checks but include richer coordinate changes/axis cases, require a transformation chain and creation of a tessellation, and strengthen cross-section prediction/inference without giving away the conclusion. Use plausible geometric alternatives. Specify rotation centres and mirror lines wherever a transformation chain requires them.

## What this means for the diagnostic

`lib/whole-maths-diagnostic-questions.ts` resolves the same pre/post banks through the assessment API: Start uses pre, Mid uses post, and End combines alternating pre/post positions, then orders the selected questions. Therefore these weaknesses can carry directly into the planned Space diagnostic. Randomising item order does not remove answer cues, repair scoring, broaden coverage or create independent forms.

A score of 85% currently means 17 correct item positions. It cannot establish full curriculum mastery when the evidence is repetitive or scaffolded. Keep the threshold unchanged during this review; raising it would hide the design problem. First repair item validity, then use pilot response data and educator judgement to evaluate classification and threshold decisions. A post-test should show independent achievement of the same construct measured at entry; making it arbitrarily harder also compromises a simple pre/post growth comparison.

## Recommended order of work

1. Repair false-positive/false-negative scoring and ambiguous mathematics: square validation, broad positional prompts with single-location keys, unlabelled symmetric transformation alternatives.
2. Make assessment audio neutral and complete; remove answer-location previews, wrong-tile highlights and answer-bearing labels. Preserve read-aloud accessibility and useful neutral visual tools.
3. Replace repetition with missing curriculum actions, prioritising Levels 3, 5 and 6. Repair Level 4 aids at the same time.
4. Build equivalent but independent pre/post forms with varied layouts, objects, contexts and answer positions. Retain accessible entry items; difficulty should come from spatial reasoning, not language or unfamiliar controls.
5. Pilot the revised forms and review item success rates, completion times, distractor choices, first versus repeated attempts and performance by prior attainment. The current item statistics are explicitly uncalibrated with sampleSize 0; authored labels are intentions, not measured difficulty.

**Release judgement:** I would not finalise diagnostic Space placement using these banks unchanged. This is a content/implementation judgement, not a claim that existing students' high scores are invalid or that every assessment item is poor.

## Evidence and reproducibility

- Active form selection: `data/assessments/api.ts`; Ground delegation in `data/activities/starpath/ground/groundPostTest.ts`; Starpath post route redirects to the common post-test.
- Banks: `data/assessments/groundStarpathIndependentPosttest.ts` and `level1StarpathIndependentAssessments.ts` through `level6StarpathIndependentAssessments.ts`.
- Scoring defect: `components/starpath/StarpathShapeWorkshopCard.tsx`, `assessmentConstructionIsCorrect`. Reproduced by executing the extracted TypeScript function against both Level 1 square questions with vertices (row,column) `(0,2),(1,4),(4,3),(3,0)`; both returned true for a non-square.
- Ground exact-position marking: `components/starpath/StarpathGroundAssessmentCard.tsx`, `samePlacements`.
- Answer previews: `components/starpath/StarpathSymmetryCard.tsx`, `ghosts`, `mismatched`, and displayed turn label; `components/starpath/StarpathCrossSectionCard.tsx`, `SectionShape` and constant-section label.
- Answer-bearing audio: `data/activities/starpath/level5/netTasks.ts`, `countTask`; `components/TaskRenderer.tsx` uses task speakText in the read-aloud boundary. L4–6 bank wrappers preserve teaching speakText.
- Form comparisons and task counts were computed from all 260 exported items using the repository's TypeScript loader; counts reflect actual generated task modes rather than declared metadata alone.
- Existing blueprint documents include useful intentions but were not treated as proof of implemented independence, response mode or difficulty.

See [the complete item inventory](assessment-item-inventory-2026-09-14.md) for every form's question IDs, prompts, task types and declared cognitive/difficulty tags. These tags are reproduced for traceability, not endorsed by this review.
