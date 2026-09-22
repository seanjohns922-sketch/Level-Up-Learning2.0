# Statistica Level 2 — five matched review forms

Review route: `/demo-review/statistica-level2`. Pre-Test, Post-Test, Start, Mid and End each contain 20 questions (100 total). The central Demo Review selector opens the matching form. This bank is review-only: responses remain in component state and do not write student attempts or change placement.

## Curriculum and lesson alignment

Checked against the supplied *Mathematics curriculum content F–6 v9* document and `data/activities/statistica/level2.ts` (all 18 lessons). The two Year 2 Statistics content descriptions are covered:

| Code | Assessment evidence | Existing lessons |
| --- | --- | --- |
| AC9M2ST01 — acquire categorical data through surveys, observation, experiment and digital tools; sort and display using lists/tables | Q1–10: suitable survey categories, numbered survey records, observed collections, recorded replacement-draw results, digital lists, sorting, frequency tables and repair | Weeks 1–2 and 6 |
| AC9M2ST02 — create and compare graphical representations, describing common/distinctive features | Q11–20: create picture/column graphs, convert tables, compare displays, read differences, explain unit scale, repair columns and recognise reordered data | Weeks 3–6 |

The assessments sample recording and interpreting supplied survey/experiment results. They do not replace the lessons' real data-collection experiences.

## Demand and presentation

- Four distinct choices for each multiple-choice question, plus the separate “I don’t know” control.
- Four familiar categories in every task; improved Level 1 object illustrations reused.
- Eight records for list entry; 15 observations for sorting, tally and raw-data displays. Table-to-graph tasks use frequencies up to 10.
- Read/compare graphs have counts from 5 to 15. Every picture represents one answer; reading axes use a fixed 0–16 unit scale, and construction axes remain 0–12.
- Five forms share the same skill sequence, response format, count complexity and difficulty. Contexts, category order, source order and answer order vary; the counter experiment retains colour categories.
- Actual picture placement for sorting. Frequency tables and column graphs use labelled plus/minus controls; no extra Done step.
- Question-number navigation, Back/Next, Finish/Submit, skip and read-aloud match the existing review flow.
- Paired graphs use the full card width, with four compact answer choices beneath. Narrow screens stack the graphs.

Frequency progression for future levels: see [the progression policy](statistica-frequency-progression.md).

## Validation

`qa:statistica-level2-five-forms` checks all 100 items for code coverage, matched demand, unique choices, source totals, graph ordering, repairs, correct/wrong/partial/blank responses. Included in prebuild. Run the existing Level 1 audit as a regression check because both levels share the card renderer.

Browser review covers all five forms, correct scoring, navigation, skipping, responsive overflow and the new graph/table interactions. The existing lesson audit validates 18 lessons and 576 generated tasks independently of this review bank.
