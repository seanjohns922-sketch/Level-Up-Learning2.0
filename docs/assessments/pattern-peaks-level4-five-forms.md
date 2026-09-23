# Pattern Peaks Level 4 — five-form review

Five forms × 20 questions = 100 new items. Pre-Test, Post-Test, Start, Mid and End open from the main demo review at `/demo-review/pattern-level4`. Pattern Peaks continues to start at Level 3. This is content review; no existing student assessment, diagnostic bank, result, login permission or weekly program is changed.

## Curriculum evidence

Verified page 42 of the owner's `mathematics-curriculum-content-f-6-v9 (4).pdf` (ACARA Version 9.0):

- **AC9M4A01:** find unknown values in numerical equations involving addition and subtraction, using number/operation properties. Ten items per form (odd slots) cover missing addends, missing starting values and amounts subtracted, equivalent sums/differences, regrouping, preserving equality after a change, whole-part relationships, repairing an inverse strategy and constructing equivalent expressions.
- **AC9M4A02:** recall and demonstrate proficiency with multiplication facts up to 10 × 10 and related division facts; extend/apply them to mental strategies for larger numbers without a calculator. Ten items per form (even slots) cover harder facts, arrays, related division, nines from tens, doubling threes, splitting sevens, place-value scaling, connected facts and larger mental products.

Checked `data/programs/patternPeaks.ts` Level 4 weeks 1–8, the Pattern Peaks lesson/quiz generator and the lesson array/balance/expression renderers. Weeks 1–4 provide the equation work; weeks 5–7 provide facts and strategies. The review keeps these representations and uses the shared Pattern Peaks theme. Assessment arrays omit the lesson renderer's displayed product; balance and whole-part models show only question evidence. Colour distinguishes the 5+2 split, with explicit text labels and narration. The whole-part diagram is labelled not to scale.

## Progression and interaction

Compared with Level 3: larger two-/three-digit equations, unknowns in different positions, equality between expressions on both sides, multiplication facts using factors up to 10, and products beyond the basic fact range through mental strategies. Twenty slots maintain a matched skill order across five forms with changed operands, array dimensions and target products.

Five multiple-choice items per form have four distinct alternatives. Most items require a produced numerical answer. The final equation-construction task accepts every valid pair in the stated 1–99 range rather than a single keyed response. Short prompts, numbered navigation, nearby read-aloud, automatic recording and Back/Next follow Level 3.

## Checks

`qa:pattern-peaks-level4-five-forms` independently solves all 100 items, checks 10 items per code, unique choice strings and mathematical answers, alternate valid equations and invalid/range rejection. Included in prebuild. TypeScript and targeted lint checked. Browser tests exercise all five complete forms, all five main-review links, two-answer and open-response questions, skip/Back, audio coverage, mobile overflow and visual inspection. Level 3's complete browser test is rerun because the renderer is now shared. Existing live banks remain untouched.

## Number difficulty review — 23 September 2026

Operand variants rotate independently by question across the five forms, rather than rising with form order. Every form retains the same skill sequence, support and response requirements. This balances number exposure; comparable student difficulty will still need educator review and response evidence.

The three-digit additive equations, facts within 10 × 10 and later extensions through mental strategies are retained. The change is to their distribution across forms, not an across-the-board reduction in demand.
