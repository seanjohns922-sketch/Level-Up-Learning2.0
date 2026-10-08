# Ground to Level 6 reliability audit

Status on 8 October 2026: automated coverage expanded and confirmed defects fixed. **The complete school release audit remains open.** Generated-question checks and a passing build do not certify every answer, device or signed-in journey.

## Coverage

| Realm | Levels included | Lessons sampled |
| --- | --- | ---: |
| Number Nexus | Ground–6 | 252 |
| Measurelands | Ground–6 | 168 |
| Starpath | Ground–6 | 168 |
| Statistica | 1–6 | 108 |
| Pattern Peaks | 3–6 | 96 |
| Chance Hollow | 3–6 | 72 |
| Total | All currently available G–6 lessons | 864 |

The new generator audit samples every configured Number/Pattern activity, every Space/Statistics/Chance teaching and activity generator, and the Measurement lesson resolvers. It covers easy, medium and hard requests where supported. Seeds 20261008, 20261009 and 42 each generated 73,860 tasks: 221,580 samples across 225 task kinds. These are generated samples, not 221,580 independently authored questions.

Checks cover missing tasks, non-finite numeric data, primitive multiple-choice answer inclusion and duplicate choices. A smaller subset has independent arithmetic checks: direct operations, specified multiplication rounding, missing addends, addition/subtraction strategies and array totals. Every task kind still needs its own independent mathematical oracle and interaction coverage; generic structural validation cannot establish its correctness.

There are 61 new production-component handler cases. They exercise actual component input and submit/click callbacks with controlled hook state, rather than reimplementing the marking. Cases include the photographed 596 question, hidden MAB places, zero, incomplete answers, decimal formatting, equivalent fractions, mixed numbers, ordering, flexible partitions, arithmetic choices and a ruler question. These are shallow tests: effects, browser lifecycle, speech and layout are outside their coverage.

## Defects fixed

- The typed-response submit button depended only on the plain text field. Fractions and other structured controls use separate fields, so correct completed answers could leave the button disabled. Readiness now follows the visible control, including fraction, ordering, conversion and step inputs. Fraction and ordering callbacks also retain the student's entered answer instead of an empty plain-text value.
- An early-years number input treated a blank string as zero. Blank submissions are blocked, and repeated submissions during feedback cannot schedule duplicate completion callbacks.
- Level 4 multiplication estimation omitted a factor of ten and rounded small single-digit factors to zero. It now explicitly asks for rounding two-digit factors to the nearest ten, keeps single-digit factors unchanged, and grades the resulting product.
- Level 1 skip counting clamped already-unique negative distractors to zero, creating duplicate choices. The range is constrained before distractors are generated.
- Level 2 missing-addend choices could duplicate the correct answer. Level 4 division-by-powers choices repeated the dividend, and powers-of-ten comparisons repeated identical expressions. These choices are now distinct.
- The numeric-choice fallback could stall if its next candidate was already in the set. Its fallback candidate now advances independently of set size.

The earlier MAB null-as-zero grading fix remains protected by `qa:number-nexus-mab` and the new input-handler regression.

## Verification

The existing prebuild release suite passed, including assessment scoring, progression, placement, realm release and lesson-guide checks. The new marking and generator checks are now part of prebuild, so their failures block deployment builds.

Chrome verification used a local demo server, without changing real student records:

- Level 4 Week 9 Lesson 1: guide navigation, model selection, equivalent-fraction selection and multiple-choice feedback updated XP and accuracy correctly.
- Fixed production fraction control: incomplete input left the button disabled; 2/4 enabled it and returned `Correct: 2/4` for one half; 2/3 returned `Incorrect: 2/3`.
- Temporary browser test route and local server were removed/stopped after verification.

Four stale assertions were updated after inspecting their production equivalents: canonical placement must respect teacher resets; introduction detection uses the shared helper; modern Number styling includes higher levels; the approved runner CTA does not imply gradient lesson cards.

## Open findings and release conditions

1. **Signed-in persistence and reporting:** still run a controlled student journey through lesson completion, quiz failure/pass, week unlock, reload, sign-out/in, teacher placement/reset and the teacher dashboard. Existing source/logic tests pass; they are not proof of production RPC behaviour. Use the authorised disposable account and preserve/restore any fixture data. Do not run progression tests against ordinary pupils.
2. **Interaction coverage:** the 225 sampled task kinds are not all covered by the 61 handler cases. Extend independent scoring and rendered-interaction tests across each remaining distinct control, including drag/drop, construction, clocks, grids, charts and probability simulations.
3. **Devices and accessibility:** a physical iPad/touch/keyboard pass and comprehensive read-aloud coverage remain open. The sampled fraction-model lesson needs scrolling at a laptop-sized viewport; review model sizing and diagram choice labels. This run did not certify every screen or speech output.
4. **Legacy Starpath audits:** `qa:starpath-level4`, `qa:starpath-level5` and `qa:starpath-level6` fail legacy assessment metadata/ID expectations. The current five-form and full-release checks pass. Reconcile those older scripts with the released assessment architecture; do not change approved live banks just to satisfy retired expectations.
5. **Teacher advancement analytics:** `qa:teacher-progress-overrides` still fails its expectation of separate dashboard summary text for normal completion and teacher advancement. The per-student panel preserves the Advanced badge and canonical override data. Decide how to present the separate dashboard totals, then verify them against controlled records.
6. **Prelaunch security:** the previously deferred checklist remains in [SECURITY_FOLLOW_UP.md](SECURITY_FOLLOW_UP.md). This reliability audit does not change production security settings or complete that separate review.

## Repeat the checks

- `npm run qa:activity-marking`
- `npm run qa:g6-question-integrity` (optional `AUDIT_SEED` and `AUDIT_OUTPUT` for detailed JSON evidence)
- `npm run qa:number-nexus-mab`
- `npm run qa:g6-reliability` runs the wider audit and saves logs/results under `.local-archive/g6-reliability`. It deliberately exits nonzero while the four open legacy/reporting checks remain unresolved.
- `npm run build` runs the deployment prebuild checks and production build.

Do not describe this status as “bug free” or “fully verified”. Close the outstanding coverage and signed-in checks before school launch approval.
