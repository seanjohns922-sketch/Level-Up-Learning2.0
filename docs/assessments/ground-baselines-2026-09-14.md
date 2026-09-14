# Ground baselines — Number Nexus and Measurelands

Implementation follows the approved plan: add the missing Ground entry assessments after the Starpath rebuild, preserving existing learning and higher-level placement rules.

## Content

| Realm | Before | New baseline | Program after baseline |
|---|---|---|---|
| Number Nexus | One placeholder question; Ground entry bypassed it | 20 independently authored examples across AC9MFN01–06 and AC9MFA01 | All 12 weeks |
| Measurelands | No Ground pre-test | 20 independently authored examples across AC9MFM01–02 | All 8 weeks |

The pre/post forms match curriculum allocation, response modes and intended difficulty/cognitive demand. Examples differ in numbers, objects, arrangements or contexts. Existing post-tests were retained exactly. Both forms remain uncalibrated: student piloting is still needed before claiming measured equivalence.

Number uses visual collections, part/whole models, addition/subtraction stories, sharing/grouping, ordering and patterns. Measurelands covers direct comparison of length, mass, capacity and duration, plus weekdays and day parts. Existing answer controls and read-aloud are reused. Every new card was server-rendered with response controls. Subsequent Chrome interaction checks are recorded below.

## Behaviour

- Ground pre-tests are baselines at every score. They never advance a student automatically and always assign the full realm program, client and server side.
- School teacher assignment and reset support the new baselines. Home creation and parent starting-level changes now request a baseline, including the existing Starpath Ground form.
- Existing students are not reset by migration. Teacher-selected full-level entry remains available; old baseline results are never invented.
- Ground onboarding leads to realm selection, where each realm resolves its own baseline or existing program.
- Interrupted Ground tests resume only when saved question IDs match the current form. The old single-question Number draft cannot be scored against the new bank.
- Raw scores, item results, dates and comparison metadata are retained. Growth uses the original baseline and a later post-test in the same realm/level with a matching comparison group. An incompatible/unversioned baseline is flagged rather than treated as comparable.
- Ground history survives parent reopening and teacher reset, including secure history reads. Ground teacher reset also preserves any higher-level assessment history.
- Higher-level Number/Measurement placement and growth calculations remain unchanged. Other realms' question banks are unchanged.

## Verification

- New bank audit: 40 new questions, matched metadata, correct/incorrect scoring, arithmetic derived independently from Number visuals, Foundation aliases, entry routes and chronological/version-safe growth.
- Full JSON hashes of every existing assessment form (excluding the two newly added/replaced Ground pre-tests) match the preceding Starpath branch exactly.
- Number and Measurelands blueprints now include 14 forms each. Measurelands architecture checks passed (170 checks; 14 compliant forms).
- Existing Ground post-test audits, assessment routes, teacher integration, canonical progression and Starpath rebuild passed.
- 38 PostgreSQL assertions passed against an offline schema-only export of the deployed database, using synthetic identities, real session-auth functions and exported permission/policy definitions. The local restore uses its administrator as object owner; this is not a claim of identical hosted infrastructure.
- Database coverage: pre-migration learner preservation; Home and teacher entry; high-score full program; duplicate receipts; original history after parent reopening; teacher reporting; higher-level calculation isolation; incompatible-version exclusion; committed save/read across a fresh connection; pre/post retention; failed-save rollback.
- TypeScript and the final production build (`npm run build -- --webpack`) passed, including the completed blueprint additions.

No production student data was copied into the test database. A subsequent read-only production check on 14 September confirmed that all seven migration function bodies match the reviewed SQL and that the Ground placement constraint is present; Ground entry is enabled for Number, Measurement and Space.

## Release order

This work builds on `codex/starpath-assessment-rebuild`. Apply `supabase/migrations/20260915100000_ground_number_measurement_baselines.sql` before releasing the combined application changes. The migration replaces functions and relaxes the Ground placement constraint; it does not backfill or reset students.

Keep a rollback copy of replaced production functions before applying. If reverting, revert the app and functions together; preserve new assessment history. Do not delete baseline attempts to undo a release.

Tests: `npm run qa:ground-baselines`; SQL fixtures are in `supabase/tests/ground_baselines/`. Run `before.sql`, then the migration, then `after.sql` against an empty isolated copy of the deployed schema. Run `reconnect.sql` in a fresh psql connection afterward. Use `ON_ERROR_STOP=1` and an offline test container; these fixtures create synthetic accounts and must not be run directly in production.

## Browser verification follow-up

Chrome verification uses the built application with a synthetic `demo-preview` student and `teacher_preview=1`. Preview saves do not write to Supabase; authenticated persistence remains covered separately by the database assertions above.

The browser review found two presentation defects and fixed them:

- Setting an undefined `backgroundImage` after the background shorthand cleared the Measurement gradient. The shell now adds the Number grid properties only when needed, retaining other realm backgrounds.
- The fixed Full Screen control intercepted Finish on the Ground Number pattern question at 1024×768. Assessments now place this control in their wrapping header and hide the global floating copy. Other pages retain their existing floating control.

Final rebuilt-app checks passed:

- All 40 answer controls stored the selected/typed/constructed response, including number ordering and clearing/rebuilding a pattern.
- Both 20/20 completions reached their results route without an advancement celebration, and cleared the resume snapshot. This checks the preview UI path, not a production database write.
- Both banks navigated all 20 questions at 1024×768 without horizontal overflow. Reload/resume preserved answers and the original start time; incompatible old-bank drafts were rejected.
- First-question layouts at widths 390 and 1024 had no horizontal overflow and one visible header Full Screen control. Entering/exiting fullscreen worked at 1024; computed Measurement styling retained the gradient.
- No uncaught browser errors occurred in the answer/navigation checks. TypeScript, the production webpack build (including release audits), and the Ground bank audit passed after the fixes.

These changes are presentation fixes only; no additional migration is required.
