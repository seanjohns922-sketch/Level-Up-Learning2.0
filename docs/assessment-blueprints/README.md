# Assessment blueprint rebuild

Status: all 35 blueprints drafted and structurally checked, with 700 explicit skill slots. This specification does not approve or release new assessments. The new design modules are not imported by student assessment routes. Existing scores, placement, diagnostics and progression remain unchanged during authoring.

## Scope and sequence

There are 35 realm/level blueprints and five forms for each: realm pre-test, realm post-test, diagnostic Start, diagnostic Mid and diagnostic End. That means 175 forms of 20 questions when the rebuild is complete, not five different curricula.

- Prep: Number, Measurement and Space. Foundation Algebra remains integrated in Number. Foundation Statistics (AC9MFST01) is deliberately outside the assessed program scope; do not add a Prep Statistica test or make it a progression prerequisite.
- Levels 1–2: Number (including the assigned Algebra content), Measurement, Space and Statistics.
- Levels 3–6: all six existing realms. Original ACARA strand ownership must survive cross-realm placement of a descriptor.
- No Level 7–8 work in this rebuild.

Work proceeds in this order: curriculum blueprint → all five forms authored/revised → content and rendered-screen audit/corrections → owner child-view review → targeted corrections and release. Earlier manual findings are inputs to the specifications, not a request for another premature manual review.

## One blueprint, five independent forms

Every form must use the same descriptor allocation, subskills, mathematical demands, response mechanics, tool access and scoring rules. The post-test or End test must not deliberately be harder. Distinct question IDs are necessary but insufficient: changing names, colours or order alone does not create independent evidence.

Corresponding questions preserve the number range, regrouping pattern, decimal places, fraction relationships, number of logical steps, quantity of relevant/irrelevant information, scale resolution and precision. Different examples must be independently solved and checked. Distractors represent comparable misconceptions. Changes to these properties require explicit equivalence review.

A blueprint gives a target difficulty profile. Empirical difficulty and discrimination remain unknown until sufficient student responses are available. Expected difficulty and cognitive demand are separate fields; neither is inferred from word count.

## Curriculum evidence

The canonical source is the supplied Australian Curriculum Mathematics F–6 v9 PDF; its SHA-256 and descriptor pages are recorded in the repository. The allocation inventory covers every descriptor assigned to this program. A code attached to a question does not demonstrate coverage of every verb in that descriptor.

For each descriptor, specify the observable evidence needed. For example:

- **Construct:** the child produces a shape, graph, angle, pattern or algorithm. Merely selecting a completed example is insufficient construction evidence.
- **Explain/reason:** save the explanation or selected reason alongside the answer. A numeric answer alone is insufficient reasoning evidence.
- **Measure:** show a usable instrument or a valid direct-comparison setup. A word problem about a measurement is not automatically a measurement task.
- **Investigate/model:** distinguish choosing from supplied data from formulating a question, collecting data or building a model. A 20-question form samples these processes; do not report full independent investigation mastery without that evidence.
- **Subitise:** quantity accuracy alone does not establish the strategy used. Display conditions and observational limitations must be documented.

Shared descriptors must not be double-weighted in a whole-program result. Unassessed skills must be labelled not assessed, not zero. A Prep three-domain report must not claim complete six-strand curriculum coverage.

## Presentation and accessibility

A visual is required whenever the mathematical evidence depends on it: lengths, balance comparisons, capacity comparisons, scales, clocks, geometry, graphs, coordinates, patterns and construction tasks. A picture is optional for symbolic work where it adds no relevant evidence. An explicit rationale is required for intentionally text-only items.

Visuals must provide every required label/unit/tick, show the intended angle or boundary, preserve scale when scale matters and avoid supplying an answer, intermediate step or strategy. Record whether diagrams are to scale. Do not replace a measurement or construction demand with reading a printed final value.

Use the shortest wording that preserves the full mathematical task. Fifteen words is a review prompt, not an absolute limit. Instructions and reason choices need neutral read-aloud; reading must not disclose a hidden answer or method. Familiarity with one household routine, culture or hobby must not determine an unrelated mathematical answer.

Review the actual question in all three student contexts (pre, post and diagnostic) on desktop, tablet and mobile. Verify labels, contrast, clipping, touch targets, audio, construction controls, keyboard entry and completion controls. A non-null visual payload, screenshot file or passing build is not evidence that this review occurred.

## Scoring and reporting contract

The authoring target is 20 equally weighted items per form. Composite items must define required parts and whether the current whole-item scoring is retained. Any future partial credit requires an explicit denominator and reporting/version change; do not introduce it silently.

Specify accepted number formats, equivalent fractions, mixed units, time notation and construction/estimation tolerances before implementing the scorer. Independently solve every authored example. Deliberately test plausible wrong answers, boundary values and incorrect reasons paired with correct numbers.

An attempt must pin blueprint/form/item/scorer versions, item order, question snapshot and submitted evidence. Resume must preserve the pinned items after a release. Duplicate save requests must not duplicate attempts or rewards. Historical scores are immutable unless a separately documented correction process is approved.

Report same-level percentage-point growth separately from a change of assessed level. Compare only compatible forms from the appropriate purpose and cycle/checkpoint. Show baseline, endpoint, denominator, date and missing evidence. If adaptive diagnostics move a child to another level, do not subtract those different-level raw percentages as though they were the same test.

The existing real diagnostic persistence path must remain intact. Demo preview uses the same form resolver and renderers, without saving student results. Database roundtrip tests use synthetic learners in an isolated test environment.

## Current artifacts and checks

- `coverage.md`: all 35 descriptor allocation drafts, source pages and assigned scope.
- `readiness.md`: current differences and unresolved authoring work. This is intentionally not a green release report.
- `design-inventory.json`: machine-readable blueprint inventory and findings.
- `current-form-inventory.json`: snapshot of current item identities/prompts across the five entry points, exposing repeated items.
- `data/assessments/design/assessmentContract.ts`: shared form, evidence and data requirements.
- `data/assessments/design/prep.ts`: 60 explicitly authored Prep skill slots.
- `data/assessments/design/measurementLevel5.ts`: 20 explicitly authored Level 5 Measurement skill slots.
- `data/assessments/design/{number,measurement,space,statistics,pattern,chance}.ts`: the remaining 620 authored slots.
- `slotAuthoring.ts`: shared representation and scoring requirements for the named task families.
- `curriculumScope.ts`: source-scope corrections and calculator rules.
- `authored-skill-slots.md`: readable specifications for all 700 slots.
- `blueprint-review.md`: completed blueprint checks, decisions and implementation boundaries.

`npm run qa:assessment-design` checks design structure and regenerates the inventories. `npm run qa:assessment-design-readiness` additionally fails while design findings or required release evidence remain. It is deliberately separate from the currently deployed application's build gate while this replacement is being authored.

## Outstanding work

All 35 levels now have 20 explicit skill-slot contracts, matched profiles across their five forms, and a review against the supplied curriculum descriptor scopes. No replacement forms have been authored or rendered yet. All 35 released levels still reuse pre/post items in the diagnostic checkpoints. Saving/version/reporting requirements above describe the target and require implementation verification; they are not a claim that every field is already persisted today.

Do not ask the owner to begin the final manual review until those stages are complete. Do not push this specification as though it were a completed assessment release.
