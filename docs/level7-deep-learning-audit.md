# Level 7 follow-up learning audit — 1 November 2026

A deeper content and behaviour review following the all-level audit. All 192 Level 7 lessons were sampled across fluency, reasoning and application. This review deliberately leaves diagram styling to the concurrent visual review. Level 8 Measurement is excluded from changes.

## Coverage and findings

| Realm | Weeks | Lessons | Generated variants |
| --- | ---: | ---: | ---: |
| Number | 12 | 36 | 2,700 |
| Measurement | 12 | 36 | 2,700 |
| Space | 10 | 30 | 2,250 |
| Pattern | 12 | 36 | 2,700 |
| Statistics | 10 | 30 | 2,250 |
| Chance | 8 | 24 | 1,800 |
| Total | 64 | 192 | 14,400 |

Each lesson has 25 seeds for each of its three roles. All generated variants have nonempty prompts/explanations, distinct choice text and the authored answer among the choices. For 11,428 variants where the typed contract preserves the original answer text, exactly one choice satisfies that contract. This catches ambiguous marking; it does not independently prove the generator's answer.

An additional 466 mathematical assertions independently calculate selected answers from visible givens: squares, square roots, root bounds, graph rates, spreadsheet speeds, statistical means/medians/modes/ranges/frequencies, spinner probabilities, complements and expected frequencies. These are selected families, not all Level 7 mathematics. Source review also inspected generator construction and the marking/answer-unit contract.

### Corrections

- **Pattern, week 7 lesson 3, application:** the question asks for a rate, but inferred answer units could show just `km` or `L`, or omit the unit. The generator now supplies the complete rate: `km per minute`, `L per minute`, `°C per hour` or `% per hour`, matching the graph context.
- **Pattern, week 11 lesson 1, reasoning:** the fixed-speed question asks for `km/h`; the answer field previously inferred `km`. It now explicitly uses `km/h`.

These were answer-label and narration defects; the numerical answers were already correct. Tests verify the full units in the answer field and its read-aloud text, accept a correct answer entered with that unit, and reject an incorrect value. The Pattern resume-content revision advances from 5 to 6 so stale generated snapshots are refreshed. Historical results are not rewritten.

No lesson ordering, curriculum topic, question difficulty, numerical answer, diagram component or visual styling was changed.

## Flow, guidance and difficulty

The six five-form assessment suites passed. The release checks cover all six realms' week lengths, weekly 80% progression gate, teacher advancement, final-week transition to post-test and routing. Quiz retry/attempt checks passed. The shared real React completion test still reaches coach feedback and the completion card once; server persistence and audible playback are mocked there.

The upper-guide suite passed its worked-example, rendered-guidance, read-aloud-text and continuation checks. The Level 7 readability suite checks 11,520 variants against prompt and choice reading budgets. Source sampling retains the fluency → reasoning → application progression. No difficulty change was justified by this pass; reading budgets and generated tests do not replace a teacher/student judgement of challenge.

## Verification and reproduction

- `node scripts/level7-deep-content-test.mjs`
- `node scripts/level7-answer-test.mjs`
- `node scripts/level7-answer-input-test.mjs`
- `node scripts/level7-readability-test.mjs`
- `npm run qa:level7-live-release` and `npm run qa:level7-quiz-attempts`
- Six Level 7 five-form suites: Number, Measurement, Starpath, Statistica, Pattern Peaks and Chance.
- `npm run qa:upper-skill-guides`
- `NODE_ENV=test node scripts/lesson-completion-flow-test.mjs`

Release validation passed: 17/17 `qa:critical` checks, `lint:qa`, `typecheck`, all configured prebuild checks and the production build. The isolated build first rejected an external dependency symlink; dependencies were copied into the checkout. A restricted-sandbox compilation stalled and was stopped; the compiler completed successfully outside that sandbox. No production configuration was changed.

## Limits

This is a sampled code/content audit, not a fresh manual walkthrough of every screen. The earlier [all-level audit](all-level-learning-audit.md) records the rendered-scene checks and [lesson coverage ledger](all-level-learning-audit-coverage.csv). Claude's concurrent styling work is outside this isolated checkout and has not been certified here. Authenticated student progress/resume, arrival of teacher insights, audible narration and intended-device interaction remain live checks. No blanket school-launch sign-off is implied.
