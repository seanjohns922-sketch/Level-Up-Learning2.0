# Number Nexus Level 3 — five-form review

Status: review only, in isolated branch `codex/number-level3-five-forms`. Route: `/demo-review/number-level-3`. The normal student banks, diagnostic placement, persistence and teacher reports are unchanged. No database migration is required for this review. After owner review, activation needs a separate versioned release that retains historical baselines and in-progress diagnostics.

## Source and approach

Audited against the supplied **Australian Curriculum Mathematics F–6 v9 PDF**, Year 3 Number and Algebra, printed pages 28–31; money descriptor AC9M3M06 on page 33. The current repaired Level 3 post-test is the benchmark (`buildLevel3PosttestFormB`). It has 16 items without a visual payload; the shared widget supplies some fraction visuals for the remaining items.

The revised post-test retains the mathematical examples/answers for Q1–Q16 and the one-fifth target in Q17. Wording is shorter where information is now clearly labelled in a diagram. Pre, Start, Mid and End use different examples at corresponding slots. Every form has 20 items, the same formats and codes, and the same intended demand: 4 accessible, 12 moderate and 4 challenging. Difficulty is an author judgement, not statistical equating.

## Blueprint and difficulty checks

| Slot | Code | Evidence and controlled demand |
|---|---|---|
| 1 | AC9M3N01 | Read a five-column place-value chart beyond 10,000; five nonzero digits. |
| 2 | AC9M3N01 | Order four similar five-digit numerals, including a zero placeholder. |
| 3 | AC9M3N05 | Round a four-digit number to the nearest hundred; all offsets 40–43, below midpoint. |
| 4 | AC9M3N05 | Estimate a total by rounding two three-digit collections to hundreds; first rounds down, second up. |
| 5 | AC9M3N03; secondary AC9M3A02 | Two-digit addition of 19; one carry, total below 100. Compensation is possible, but strategy use is not scored. |
| 6 | AC9M3N03; secondary AC9M3A02 | Near-double two-digit addition; one carry, total below 100. |
| 7 | AC9M3N03 | Subtract a high-nineties number from 101–105; count-on distance 5–6. |
| 8 | AC9M3N03; secondary AC9M3A01 | Find a difference across 100; difference 36–37. Inverse calculation is possible but explanation is not observed. |
| 9 | AC9M3M06 | Convert dollars and 40 cents to cents, with Australian denomination diagrams. |
| 10 | AC9M3M06 | Represent mixed dollars/20-cent coins using an equivalent number of 10-cent coins. |
| 11 | AC9M3N06 | Increase then decrease: three-digit plus two-digit minus two-digit. Both steps require two regroupings under a column method. |
| 12 | AC9M3N06 | Two decreases from a three-digit ticket total; both subtraction steps require two regroupings. |
| 13 | AC9M3N04 | Five equal groups with 4–9 in each; five labelled bags, not a huge countable array. |
| 14 | AC9M3N04 | Match a four-row array to its multiplication sentence; four plausible response options. |
| 15 | AC9M3A03; secondary AC9M3N04 | Missing factor in a ×5 fact, factor 6–10. |
| 16 | AC9M3N07 | Follow a branching algorithm: even start, halve, then add 3. Same branch/step count in every form. |
| 17 | AC9M3N02 | Select a unit fraction model from five equal-length strips split into 2, 3, 4, 5 and 10 equal parts. Targets vary; all models appear in every form. |
| 18 | AC9M3N02 | Find the additional tenths required to complete a whole; 3–8 tenths supplied. |
| 19 | AC9M3N02 | Order three distinct internal multiples of one-tenth; no 0/1 endpoints or mixed denominators. |
| 20 | AC9M3N02 | Place a multiple of one-tenth on the same 0–1 line; internal points only. |

Q18 replaces the older “which picture shows the whole?” item because that did not directly sample combining same-denominator fractions to complete a whole. Q19/Q20 use tenths in every form so five different examples can retain the same denominator and response format. These are explicit content changes for owner review, not a claim that historical scores can be directly compared.

## Visual and usability decisions

Keep Number Nexus's dark teal shell with lighter, high-contrast mathematical panels. Use place-value columns, clean equation displays, labelled collection/story panels, Australian coin denominations, bag diagrams, arrays, a decision diagram, equal-length fraction strips and an interactive number line. No decorative collectible cards or changes to lesson artwork.

Visuals show supplied facts, not a completed calculation or highlighted correct choice. Equation questions retain symbolic displays; redundant pictures would dilute the mental-calculation evidence. The rounding interval gives endpoints but does not locate the number or highlight an answer. Coins are clearly labelled schematic denominations, not photographic replicas.

Read-aloud includes diagram quantities and instructions, including both branches of the algorithm. Review details and solutions stay collapsed. Form switches retain the same slot for comparison; all 20 slots are accessible in author review. Exit returns to Number Level 3 in Demo Review. Responses remain in component memory only. On narrow phones, the number line scrolls horizontally to retain usable targets; arrays use smaller spacing. Child-view inspection on the intended tablets remains the owner's review step.

## Coverage limits to keep reporting honest

All seven Number descriptors are sampled, plus the money descriptor taught in Number Nexus and selected Algebra links. A 20-question test cannot establish every action in every descriptor. These forms do not directly observe a child's chosen calculation strategy, explanation, self-created algorithm, estimation of an unlabelled collection, or their full proficiency with all ×3/×4/×5/×10 facts. Unit-fraction targets differ within an accessible family and need student evidence to confirm comparable empirical difficulty. Report question/skill evidence and matched-form growth, not blanket mastery of every descriptor.

## Checks

The Level 3 audit uses 100 independently worked keys, rejects incorrect/blank responses, verifies unique form examples, checks codes/formats/difficulty by slot, and checks carries and borrows in multi-step tasks. It also verifies fraction and money parameters, prompt length, protected routing and absence of student writes. Run:

`node --no-warnings --experimental-strip-types --experimental-loader ./scripts/typescript-alias-loader.mjs scripts/audit-year3-number-five-forms.ts`

The generated inventory contains every prompt, option, answer, visual parameter and curriculum mapping. The existing release gates, TypeScript, lint and production build are checked separately. No automated Chrome tour is needed for this pass.

Validation completed: all 100 question cards server-render without invalid quantities; all 23 existing release gates pass; TypeScript and lint pass; isolated production build passes using webpack with the existing local configuration. No credentials were copied into the checkout. The local review server uses port 3003.
