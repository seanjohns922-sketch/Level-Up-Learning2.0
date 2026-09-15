# Blueprint review — 15 September 2026

## Outcome

The blueprint set now contains 35 realm/level specifications, 700 explicit skill slots and 175 planned forms. Each form in a level references the same 20 skill contracts and therefore the same descriptor allocation, response mix, expected difficulty and cognitive-demand profile. All 138 program-assessed ACARA F–6 codes have an owner; Foundation Statistics is the one deliberate exclusion from the 139-code source catalogue.

This completes the blueprint drafting stage. It does not certify the released question banks or constitute empirical calibration. It also does not mean that 20 items exhaustively establish mastery of every aspect of every descriptor.

## Source check and substantive changes

The supplied PDF's SHA-256 matches the recorded canonical source. Descriptor scopes were checked against its Foundation–Year 6 content descriptions, with source page numbers retained in the allocation inventory. Existing allocations are retained, but the required question evidence is now explicit rather than inferred from an attached curriculum code.

- Prep includes Number, Measurement and Space only. Foundation Algebra is integrated in Number; Foundation Statistics is excluded without recording zero achievement or making it a progression gate.
- Number includes explicit upper-range and representation requirements, regrouping equivalence, the named fraction families, remainder interpretation, practical models, algorithm execution/construction and explanation. Year 5 division includes both whole-group and splittable fraction/decimal interpretations.
- Calculator prohibitions are explicit for the descriptors that specify mental/without-calculator work. Where the source permits suitable digital calculation tools, all five forms must provide equal access while retaining required strategy/model/check evidence.
- Measurement requires readable measurement evidence, not just a story containing measurements. Requirements distinguish informal units, labelled scales, unlabelled subdivisions, direct comparison, calendar conventions, clock boundaries, angle estimation versus exact measurement, and actual angle construction.
- Level 5 Measurement specifies all four descriptor groups, including irregular area/perimeter, suitable precision, midday/midnight and a visible protractor. Estimation intervals and construction tolerance must be instantiated and checked when examples are authored.
- Space separates cell-based grid references from intersection coordinates, separates Year 5 first-quadrant coordinate work from Year 6 four-quadrant work, and requires actual creation where the curriculum says construct/create. Nets, cuts and transformation diagrams must provide sufficient visible evidence.
- Statistics separates acquisition/recording, graph construction, interpretation, critique and investigation stages. Year 3 investigation remains guided. Year 5 line-graph slots assess interpretation rather than replacing that descriptor with graph construction. Nominal/ordinal/discrete/continuous distinctions follow their level scopes.
- Pattern includes inverse operations, number properties and algorithms. Levels 3–5 do not replace the required fact-family/equation evidence with generic sequence puzzles.
- Chance Level 4 explicitly includes independent/dependent events under P01. Level 5 focuses on outcomes, equal/unequal likelihood and observed frequencies, without making formal probability calculations compulsory. Level 6 includes numerical probabilities, simulations and observed/expected variation; larger samples do not guarantee monotonically smaller absolute deviations or exact agreement.

## Blueprint checks completed

- 35 supported levels; Prep restricted to its three specified domains.
- 20 unique slots per level; 700 globally unique slot identities.
- Every slot belongs to a valid allocated descriptor at its own year level.
- Descriptor allocations total 20 and match the authored slot counts.
- All five form specifications have identical slot IDs and matching response, cognition and expected-difficulty profiles, each summing to 20.
- Every slot has a representation specification, scoring requirements, equivalence constraints and tool/access policy.
- Explicit explanation/justification tasks cannot use a bare numeric response.
- Regression assertions cover the known Level 4/5 Chance boundary, Level 5 line-graph scope and without-calculator descriptors.
- TypeScript passes. The design modules pass lint. The readiness gate deliberately refuses release because the new forms and required review evidence do not yet exist.

## Limits that must remain visible

The task-family rubric is a common floor, not a substitute for an answer key. Each concrete item still needs exact values, valid alternatives, accepted notation, tolerances, independent solutions, error cases and a mathematical-demand fingerprint. Matched constraints such as “same regrouping” must be instantiated with actual values in the five-form authoring matrix before a question can pass.

A selected reason is constrained evidence, not a freely composed explanation. Bounded on-screen investigations sample stages; they do not demonstrate independent fieldwork or complete investigation competence. Construction/algorithm rubrics must accept all valid solutions and cannot depend on matching one arbitrary picture or instruction string.

When multiple subparts are essential to one slot, the authoring matrix must state them explicitly and apply the same component count and whole-item scoring across all forms. Do not hide additional tasks in a post-test. Check the resulting workload and reading load on the rendered screens before owner review.

## Next implementation stage

1. Create the five-form authoring matrix for each blueprint, with different examples and fixed mathematical-demand fingerprints. Do not create “new” forms by copying questions and changing IDs.
2. Implement needed representations and task interactions, then independently solve every item and test correct and plausible incorrect responses.
3. Preserve historical question snapshots and pin versions for resumed attempts; keep diagnostic and realm reporting comparisons purpose-, level-, cycle- and version-compatible.
4. Audit every finished question in pre/post/diagnostic presentation on desktop, tablet and mobile, including read-aloud, input, first submission, saving, resume and reporting.
5. Only then request the owner's final child-view review. No new assessment deployment is authorised by a passing blueprint structure check alone.

All 35 current levels still reuse realm pre/post questions in Start/Mid/End. That is reported as 35 explicit form-reuse findings, not disguised as five independent forms already being live. No production assessment, student result, progression setting or database migration was changed in this blueprint stage.
