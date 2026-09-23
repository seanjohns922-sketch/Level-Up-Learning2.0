# Pattern Peaks Level 3 — five assessment forms

Pattern Peaks begins at **Level 3**. The mistaken Level 1 review route/bank/audit is removed. Main demo review still offers Pattern Peaks Levels 3–6; all five Level 3 assessment buttons now open `/demo-review/pattern-level3`.

Pre-Test, Post-Test, Start, Mid and End each contain 20 new review questions (100 total). Existing live assessment banks, saved attempts, weekly lessons and login permissions remain unchanged until content approval/release.

## Curriculum and lesson evidence

Verified the owner's `mathematics-curriculum-content-f-6-v9 (4).pdf`, pages 30–31 (Australian Curriculum Version 9.0). Each code receives five questions per form:

| Code | Required skill | Assessment slots | Existing Pattern Peaks lessons |
| --- | --- | --- | --- |
| AC9M3A01 | Recognise and explain addition/subtraction as inverse operations; apply to partition numbers and find unknown values | 2, 6, 10, 14, 18: inverse explanation, unknown addend/subtrahend, open partition, equivalent expressions | Weeks 4–6 |
| AC9M3A02 | Extend facts to 20 into efficient mental strategies for larger numbers, without a calculator | 3, 7, 11, 16, 19: scaled facts, bridging 100, compensation and subtracting 9 | Week 7 |
| AC9M3A03 | Recall and demonstrate multiplication facts for 3, 4, 5, 10; derive related division facts | 4, 8, 12, 13, 17: array, division, missing factor and connected facts | Weeks 4, 6, 7 |
| AC9M3N07 | Follow and create algorithms involving steps and decisions; describe emerging patterns | 1, 5, 9, 15, 20: doubling, halving, odd/even branch, describing change, constructing a two-step algorithm | Weeks 1, 2, 8 |

The Number algorithms code is intentionally shared with the existing Pattern Peaks lesson ownership. Assessment 20 requires students to construct operations in order; its scorer accepts all valid two-step programs, not only an expected string. Assessment 14 accepts all positive integer partitions of the given total.

Inspected `data/programs/patternPeaks.ts`, `PatternPeaksQuestionCard`, and lesson visual renderers `ExpressionFlowVisual`, `DecisionPathCardVisual`, `PatternSequenceStripVisual`, `ArrayVisual` and `GrowingPatternVisual`. The assessment uses those established representations (number cards, arrays, steps and decisions). A compact assessment renderer avoids the lesson array's displayed product and uses the realm theme rather than the lesson renderer's fixed cyan panels. No new raster art is required: counters are explicitly named and drawn as counters.

## Presentation and verification

Four alternatives on each multiple-choice item; most items require children to produce an answer. No Done button: answers record as entered, with Back/Next, I don't know, 20 numbered navigation buttons and Undo/Clear for algorithm building. Nearby shared read-aloud controls cover prompts, instructions, model labels, choices, both answer boxes and the current algorithm. Narration does not reveal hidden outputs.

`qa:pattern-peaks-level3-five-forms` independently works all 100 questions, checks allocation and option uniqueness, rejects malformed/incomplete answers and exhaustively verifies all 16 operation pairs for each algorithm task. It runs in prebuild. Browser verification covers all five scores, numeric/choice/construction interactions, skip and answer restoration, all five main-review links, mobile overflow and visual inspection. TypeScript, targeted lint and the full prebuild suite are also checked.
