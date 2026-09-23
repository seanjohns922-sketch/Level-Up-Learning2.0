# Pattern Peaks Level 5 — five forms for review

100 questions: 20 each in Pre-Test, Post-Test, Start, Mid and End. Available at `/demo-review/pattern-level5` and from the Pattern Peaks Level 5 demo panel. This bank is for educator review; it does not replace live student assessments or write attempts.

## Curriculum and lesson alignment

Checked against the owner's *Mathematics curriculum content F–6 v9* PDF, pages 52–53, and the existing Level 5 seeds in `data/programs/patternPeaks.ts`.

| Code | Questions per form | Evidence |
| --- | --- | --- |
| AC9M5A01 | 6 | Multiplication/division inverse relationships, related facts, scaled fact families and explanations |
| AC9M5A02 | 8 | Unknown factors, dividends and divisors; equivalent products; associative/distributive reasoning; connected equations; constructing factor pairs |
| AC9M5N10 | 6 | Divisibility decisions, highest common factor, lowest common multiple, describing multiples, digital experimentation and creating a two-decision rule |

Lesson references follow weeks 1–2 (inverse relationships), 3 (unknown values), 4 (equivalent expressions), 5 (properties), 6 (distribution), 7 (factors/multiples/algorithms) and 8 (connected investigation). HCF and LCM are drawn from N10 elaborations rather than treated as separate content codes.

## Interaction and difficulty

All multiple-choice questions have four options. Numerical tasks extend beyond simple times-table recall. Equivalent-product tasks accept any valid factor pair in the stated range. Divisibility selection requires the exact matching set. The number tester calculates quotient and remainder for chosen numbers before a claim is selected. The final builder accepts any pair of available tests whose common multiples are exactly those requested, including equivalent rules.

Models include factor families, split areas, equal-product balances, input/output tables and decision pathways. Read-aloud describes the visible evidence without supplying missing answers. Numbered navigation, Back/Next and automatic recording follow the existing review interface.

## Validation

`npm run qa:pattern-peaks-level5-five-forms` independently checks all 100 worked answers and curriculum allocations, four distinct options, every candidate subset, factor pairs throughout and beyond the permitted range, all available two-test combinations, tester readiness and review links. Browser verification covers all five completed forms, responsive layouts, skip/back and entry links. Shared Level 3/4 checks guard the existing forms.

## Number difficulty review — 23 September 2026

Operand variants rotate independently by question across the five forms, rather than rising with form order. Every form retains the same skill sequence, support and response requirements. This balances number exposure; comparable student difficulty will still need educator review and response evidence.

Early unknown factors use single-digit multipliers (6–9) and two-digit solutions (16–24). Early unknown dividends use a single-digit divisor and totals 144–168. Fact-family models retain supplied evidence because the skill is relating multiplication and division. Later items retain equivalent-product reasoning, distribution, connected equations, multiple valid factor pairs and two-decision algorithms. Large unsupported two-digit divisors no longer dominate the opening items.
