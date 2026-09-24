# Chance Hollow assessment release — 24 September 2026

The reviewed Levels 3–8 are frozen as version 1: 700 questions across 30 forms. Levels 3–6 contain 20 questions per form; Levels 7–8 contain 30. Five forms cover pre-test, post-test and start/mid/end diagnostics.

Level 7 coverage was rechecked against AC9M7P01–02: single-stage sample spaces, theoretical probabilities, predicted and observed frequencies, repeated digital trials and interpretation of variation. Level 8 covers AC9M8P01–03: complements, two-event sample spaces/probabilities and repeated compound simulations. Tree completion, two-way table completion and Venn classification supplement the completed-diagram interpretation tasks. Simulation questions record generated results; adjacent questions assess estimates, predictions and conclusions.

Reviewed and live assessments share one question component. Structured responses retain choices, completion fields and generated trials for scoring and teacher replay. No client-supplied correctness flag is accepted by the release scorer.

New diagnostic cycles use the released bank; existing academic-year cycles remain pinned. Existing pre-test drafts and post-test baselines retain their original bank. Upper-level pre/post attempts save through a student-authorised extension endpoint without assigning nonexistent Year 7–8 weekly programs. Those weekly lessons remain separate future work.

The release migration extends probability diagnostics through Level 8 and fixes progression checkpoint limits for the six already-supported diagnostic strands. It preserves access guards and explicitly grants the new student RPCs to anon/authenticated. Synthetic student fixtures verify login, save/resume, completion, duplicate protection, history, missing-session rejection and cross-student rejection, then roll back.

Release order: publish the web support, confirm it is available, then apply the database migration and repeat the rolled-back student-role checks. No existing student results are migrated or rewritten.
