# Pattern Peaks Level 6 — five forms for review

20 questions each in Pre-Test, Post-Test, Start, Mid and End. Review route: `/demo-review/pattern-level6`. Live student banks and results are unchanged.

## Curriculum and lessons

Checked the owner's Mathematics curriculum content F–6 v9 PDF, page 65, and `data/programs/patternPeaks.ts` Level 6 weeks 1–8.

| Code | Items per form | Assessment evidence |
| --- | --- | --- |
| AC9M6A01 | 7 | Visually growing structures, later stages and general rules; additive decimals; backwards sequences; fractional multiplicative growth |
| AC9M6A02 | 7 | Brackets, operation order, unknowns inside brackets, equivalent expressions and multiple valid pairs of natural numbers |
| AC9M6A03 | 6 | Ordered function machines, branching decisions, rules producing number sets, growth comparisons and construction of a two-step algorithm |

Inspected the existing GrowingPatternVisual and FunctionMachineCardVisual lesson components. The assessment adapts their stage and machine representations to the shared realm theme. Growing diagrams preserve rows/columns rather than wrapping counters arbitrarily; read-aloud describes only visible stages. Numbers rotate by slot across forms, avoiding a uniform increase from Pre-Test to End. Arithmetic remains manageable while relationships and operation order provide the increased demand.

## Responses and checks

Four distinct options for multiple-choice. Decimal answers accept equivalent decimal formatting. Pair questions accept every valid pair within the stated bounds. Algorithm tasks score the rule across inputs, accepting equivalent steps rather than one preset sequence.

`qa:pattern-peaks-level6-five-forms` independently checks all 100 answers, the 7/7/6 code allocation, option counts, decimal handling, exhaustive candidate pairs and two-step algorithms. Full browser checks cover five complete forms, review links, skip/back, read-aloud controls and mobile overflow. Shared scoring changes are checked against earlier banks through prebuild.
