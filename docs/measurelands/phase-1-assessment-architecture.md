# Measurelands Assessment Rebuild: Phase 1 Architecture

## Scope

Phase 1 established metadata, validation and reporting contracts around the approved engine. The architecture is now frozen. Subsequent work is limited to assessment content and blueprint implementation; it must not rewrite Measurelands lessons, progression, weekly quizzes or platform systems.

The approved source of curriculum truth is `data/assessments/measurelandsAssessmentBlueprint.ts`. Money is intentionally excluded from Year 3 Measurelands and remains a cross-realm Number Nexus coverage obligation. Measurelands assesses physical measurement concepts only.

## Current Compliance Result

There are 13 live Measurelands forms: Ground post-test plus Year 1–6 pre-tests and post-tests. All 13 currently build from lesson or weekly-quiz `PracticeTask` interactions. They satisfy existing count and curriculum-allocation audits but fail the new independent-pool rule.

The migration register therefore marks all 13 forms:

- live status: `legacy_lesson_reuse`;
- replacement status: `blueprint_approved_bank_not_authored`;
- production release gate: `blocked`.

This is an explicit baseline, not a production regression introduced by Phase 1. The empty independent-bank registry is deliberately not connected to `data/assessments/api.ts`.

## Architecture

`assessmentItemStandard.ts` defines the platform-level item, quality metadata, statistics and response-evidence contracts. `measurelandsAssessmentArchitecture.ts` projects the approved Measurelands blueprints into 13 exact form standards and validates candidate banks. `measurelandsMisconceptions.ts` provides stable misconception IDs. `assessmentReporting.ts` aggregates canonical response evidence without changing current teacher UI or database schema.

The existing `student_realm_assessments.question_results` JSONB column can retain versioned item evidence. A schema migration is not required to begin authored-bank work. Delivery pages must later emit schema-version 2 evidence while retaining replay compatibility for historical schema-version 1 snapshots.

## Validation Rules

Each candidate form must pass:

- exactly 20 unique items and an 85% pass threshold;
- exact descriptor, difficulty and cognitive-category allocations;
- selected-response maximum and constructed/manipulated minimum;
- assessment-authored origin and matching pre-test or post-test pool;
- curriculum, misconception, context, structure, renderer, scoring and statistics metadata;
- accessible first four items and later placement of very challenging items;
- no runs of three descriptor or correct-answer positions;
- no consecutive context reuse;
- disjoint pre/post IDs, contexts and assessment interaction structures.

The existing blueprint's `accessible` band maps to canonical `easy`. A controlled portion of each form's approved `challenging` and `reasoning` allocations is explicitly labelled `very_challenging` and `transfer`; totals remain unchanged.

## Phase Sequence

1. Phase 1: architecture, compliance baseline, validators, reporting contract and rebuild plans.
2. Phase 2: author, review, render and pilot the Level 5 independent banks.
3. Phase 3: author, review, render and pilot the Level 6 independent banks.
4. Phase 4: migrate Ground and Levels 1–4.

Production resolvers stay on legacy forms until a complete level pair passes every release gate. A partial bank must never be served.

## Known Risks

- The current replay snapshot schema does not carry the new quality dimensions; the future delivery integration must add schema-version 2 evidence without losing historical replay.
- Authored difficulty and transfer labels require curriculum review, then pilot data. They are not psychometric claims.
- Shared renderer use can accidentally become shared interaction reuse. Bank review must compare serialized payloads, not only IDs and prompt text.
- Teacher insight screens do not yet render descriptor, reasoning or transfer summaries. The aggregation contract exists, but UI integration belongs to a later phase.
