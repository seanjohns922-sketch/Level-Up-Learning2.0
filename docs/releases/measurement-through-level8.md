# Measurement release through Level 8 — 17 September 2026

The approved five-form assessments are released from Ground through Level 8: 20 questions per form through Level 6 and 30 per form at Levels 7–8 (45 forms, 1,000 questions). The remaining Level 3, 4, 7 and 8 banks are frozen as v4. Previously released banks remain unchanged.

New pre-tests use the released forms. Existing Level 3–4 drafts and pre-test baselines retain v3 for resume and matched post-tests. Level 5–6 post-test version selection now runs for those levels, rather than only inside the Level 2 branch.

New academic-year diagnostic cycles receive `measurement_release_version=1`, independent start/mid/end forms and a Measurement ceiling of Level 8. Existing cycles retain their original versions and ceiling. Level 7–8 checkpoints require 30 distinct questions; lower levels require 20. Lesson placement remains capped at the existing Level 6 programme, with higher assessment evidence retained separately, matching the Number extension approach. The six-strand primary aggregate continues its existing Level 6 ceiling.

Student Level 7–8 pre/post tests are available through `/measurement-extension`, the world HUD and Measurelands navigation. Saves use validated student sessions, require the complete released question set, preserve replay snapshots, require a pre-test before a post-test and use completion receipts for safe retries. Teacher Measurement panels display the extension attempts and matched growth. The forms remain blueprint-matched and uncalibrated; this release does not claim psychometric equivalence.

Validation:

- `npm run qa:measurement-full-release`: all 1,000 released questions, scoring, skip responses, replay data, comparison groups, old drafts and pinned checkpoints.
- Full production build, including existing assessment, layout and diagnostic-permission audits.
- Transactional production database checks under the actual `anon` role with valid `x-student-session` headers for all 263 active students; missing/cross-student access rejected.
- Level 7–8 pre/post save, retry deduplication, prerequisites, question-set/count validation and result retrieval under `anon`.
- Adaptive 6→7→8 and 8→7 completion, question index 29, protected placement and academic-year version pinning.
- All test sessions, attempts and diagnostic fixtures rolled back before committing the migration. Existing sittings, results, attempts and progress compared before/after and preserved.

The build permission audit requires explicit `anon` and `authenticated` EXECUTE grants on every pending-diagnostic lookup, including the new wrapper. It must continue running for future releases. Runtime release checks must continue exercising validated student sessions, not only privileged database callers.
