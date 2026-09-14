# Assessment audit repairs — 14 September 2026

Scope: 70 existing forms, 1,400 questions, across 35 pre/post pairs. Statistica starts at Level 1 and continues through Level 6; there is no Ground Statistica assessment. Curriculum reference: the supplied Australian Curriculum Mathematics F–6 Version 9 PDF, with source page identifiers recorded in `data/assessments/australianCurriculumV9Catalogue.ts`.

## Repairs implemented

- Repaired equivalent-fraction and mixed-number scoring while retaining strict missing-numerator scoring. Added explicit tolerances for angle estimates; exact protractor readings remain exact.
- Corrected invalid curriculum identifiers and Number Level 3 mappings. Rebuilt Pattern Level 5 fact-family questions and aligned its first two teaching weeks with multiplication/division relationships, retaining lesson and week identities.
- Rebuilt mismatched pre/post tasks so each pair has matching descriptor allocations, planned difficulty, cognition and response-mode profiles. Expanded Number boundary coverage and replaced the canonical Level 6 bank. Rebuilt Measurement pairs with actual comparison diagrams, informal unit measurement and graduated protractors.
- Added numerical answers with required reasons and constrained algorithm construction. Removed inflated cognition labels where tasks only involve selecting or applying an answer.
- Removed assessment answer cues, solved narration and corrective retries from the affected native tasks. First submissions now determine those assessment results. Chance expected-count tasks assess mathematical predictions rather than whether random results happen to match them.
- Preserved submitted response values for affected native tasks, including composite answers, graph construction, routes and selections. Saved evidence includes the scorer version. Existing legacy response formats remain readable.
- Replaced repeated Starpath items and versioned banks whose content or assessment scoring changed. Regular Number Level 6 teacher previews now use the canonical bank and retain resumable responses.
- Added history-preserving reset/read functions and server-assigned learning cycles. Growth pairs the original baseline with a later post-test in the same cycle and compatible bank group. A new baseline awaiting a post-test no longer inherits the previous cycle's growth.

## Data and integration boundaries

The new migrations do not delete or re-score historical assessment rows and do not backfill old cycle identifiers. Resetting an assessment preserves history while leaving placement incomplete. Existing progress, lesson identifiers, completion rules and rewards are retained; the identified assessment scoring and Pattern lesson-content corrections are intentional behaviour changes.

Historical results remain available. Old or incompatible forms without a verified comparison group are excluded from comparable-growth calculations, so displayed growth totals can change. Previously deleted records and previously unrecorded response detail cannot be reconstructed by these repairs.

## Verification

- All 1,400 canonical answers pass the shared scorer. Regression checks cover malformed/equivalent fractions, independent Level 6 arithmetic, required reasoning, angle-estimate boundaries, algorithm ordering and learning-cycle pairing.
- All 35 pairs have matching descriptor, planned difficulty, cognition and response-mode counts; runtime exports confirm Statistica has Levels 1–6 only.
- Number, Measurement, Ground, Pattern, Statistica, Chance and Starpath assessment audits passed, including the relevant release and presentation checks.
- Isolated database tests passed for Ground entry/completion and history preservation, plus three higher-level reset assertions and six learning-cycle assertions. Fixtures are synthetic; no production data was changed.
- Final build and browser results are recorded in the release verification section below. Browser evidence uses synthetic teacher-preview sessions and is stored in `evidence/`.

## Interpretation limits

These forms are matched by curriculum and authored task demand, not statistically calibrated on a student cohort. Difficulty ratings remain uncalibrated. A pilot is needed to assess actual item difficulty, discrimination and pre/post equivalence.

Twenty equally weighted questions yield five-percentage-point score steps. Composite tasks retain whole-question binary scoring. Ordered instruction cards provide constrained algorithm-construction evidence; investigations using supplied survey data do not establish that a student can independently conduct an entire real-world investigation. Captured submitted responses are not a recording of every intermediate gesture.

Observed score improvement is assessment growth; it does not by itself establish that the program caused the improvement.

## Release requirements

Read-only production verification on 15 September confirmed that the following three repair migrations are already installed, along with the earlier Ground baseline migration. Their function definitions, trigger and related access/schema checks matched. Application changes are delivered on `codex/ground-baselines`. Migration order:

1. `20260915120000_preserve_all_realm_assessment_history.sql`
2. `20260915130000_assessment_learning_cycles.sql`
3. `20260915140000_version_safe_assessment_growth.sql`

No rerun is required. These manually applied versions are absent from Supabase CLI migration history; reconcile that history before a future CLI migration deployment. Reproducible database test instructions are in `supabase/tests/assessment_repairs/README.md`.

## Final release verification

The final `npm run build -- --webpack` passed, including its prebuild release gates and TypeScript check. `npm run qa:starpath-rebuild` also passed after the Level 3 assessment version change.

Chrome checks against that production build passed for first-submission investigation scoring, neutral dice rules, stored Statistica selections, numerical-answer-plus-reason completion and reload, ordered algorithm completion, mobile fit, informal measurement diagrams and the graduated protractor. A numerical answer without its required reason leaves Next disabled; the complete response enables it. Screenshots of the numerical reasoning panel and protractor were visually reviewed after the contrast and sizing fixes.

No complete synthetic browser attempt was submitted to production. Local database tests and browser preview checks provide complementary coverage; they are not a claim that every possible student interaction has been exhaustively tested.
