# Pattern Peaks Level 7 — five forms for review

30 questions each in Pre-Test, Post-Test, Start, Mid and End (150 total). Demo route `/demo-review/pattern-level7`, also linked from the main review panel. Student assessment banks, diagnostic placement, logins and saved results are unchanged.

## Source and coverage

Read the Algebra / Year 7 table in the owner's `mathematics-curriculum-content-7-10-v9.docx`. The existing Pattern Peaks weekly program currently ends at Year 6. These are curriculum-mapped review assessments, not a claim that Year 7 weekly lessons already exist. Week/lesson actions for Year 7 remain unavailable until that content is built.

Each form interleaves five items for each descriptor:

| Code | Slots | Evidence |
| --- | --- | --- |
| AC9M7A01 | 1, 7, 13, 19, 25 | Variables in practical formulas, substitution, interpreting quantities and units |
| AC9M7A02 | 2, 8, 14, 20, 26 | Form expressions from words, costs, brackets, perimeter and per-item discounts |
| AC9M7A03 | 3, 9, 15, 21, 27 | Natural-number linear solutions; bracketed equations; verifying by substitution; unknown on both sides |
| AC9M7A04 | 4, 10, 16, 22, 28 | Authentic census graph; horizontal segments; relative slopes; decreasing distance; limits of observations |
| AC9M7A05 | 5, 11, 17, 23, 29 | Tables from a rule; visual growth; plotting multiple ordered pairs; graph/rule matching; reverse pattern reasoning |
| AC9M7A06 | 6, 12, 18, 24, 30 | Interactive volume/distance formulas; systematic variation of one or two variables; keeping output constant; finding a required input |

Number sets rotate independently by slot across forms. All multiple-choice items have four distinct options. Prompts are short, and formulas/graphs supply evidence separately. Graph questions share the same authentic census dataset across forms, while illustrative travel examples and other numerical tasks vary; these are parallel forms, not five independent data collections.

## Graph provenance

Australian Census usual-residence counts: 21,507,717 (2011), 23,401,892 (2016), 25,422,788 (2021). Plotted as 21.5, 23.4 and 25.4 million with rounding clearly disclosed. Connecting lines do not assert observed annual counts. Sources:

- [ABS 2011 Australia QuickStats](https://abs.gov.au/census/find-census-data/quickstats/2011/0)
- [ABS 2016 Australia QuickStats](https://abs.gov.au/census/find-census-data/quickstats/2016/0)
- [ABS Population: Census 2021](https://www.abs.gov.au/statistics/people/population/population-census/2021)

Travel graphs explicitly say illustrative; they are not represented as collected measurements.

## Interaction and validation

Inspected the existing CartesianGridVisual, InputOutputTableVisual and prior growing-pattern displays. New graph rendering uses the shared realm styles and labelled axes; all diagram data has nearby narration. Plotting supports pointer, keyboard and coordinate-entry controls, and scores an unordered set of three points. Formula labs calculate from entered values and retain visible experiment history. Students must record the original settings and requested comparison before their answer counts as complete.

`qa:pattern-peaks-level7-five-forms` independently checks all 150 worked responses, 5-per-code coverage, four-option counts and selected mathematical distractor uniqueness, graph bounds, plotted-point validation, experiment outputs and readiness, and review links. Included in prebuild. Browser checks cover all forms, mobile layouts, graph plotting, lab inputs, skip/back, completion counts and main-panel links. Level 6 is rerun as a regression for the shared display/scorer.

## Guided comparisons

Questions 6, 12, 18, 24 and 30 now use an original/change comparison across all five forms. Volume tasks show labelled boxes at a shared scale; distance tasks show speed × time. The original result is provided. Only relevant inputs are editable, and Calculate records the original plus the student's trial. The same required comparison and answer checks still apply. Question 24 presets the doubled length without revealing the required width; question 30 keeps its target volume in the question heading. The general Year 8 linear graph lab is unchanged.
