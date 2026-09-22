# Statistica Level 3 — five matched review forms

Demo route: `/demo-review/statistica-level3`. Pre-Test, Post-Test, Start, Mid and End have 20 questions each (100 total). The central Demo Review selector opens each form. This revision is for manual review; it does not write student attempts or change placement/release gates.

## Curriculum and lesson coverage

Checked against the supplied *Mathematics curriculum content F–6 v9* document and the existing 18 Level 3 lessons in `data/activities/statistica/level3.ts`.

| Code | Slots | Evidence |
| --- | --- | --- |
| AC9M3ST01 | 1–7 | Categorical versus discrete numerical questions, observation records, numerical datasets, digital records, frequency tables, duplicated-record correction |
| AC9M3ST03 | 8–14 | Choosing a bounded investigation question, selecting relevant numerical data, recording supplied responses, constructing a display, interpreting results, spotting irrelevant records, reporting within the observed group |
| AC9M3ST02 | 15–20 | Categorical and numerical column graphs, zero frequencies, comparing displays, scaled frequency differences, describing a numerical distribution, evidence-based contextual claims |

Week references follow the existing lessons: data types and questions in Weeks 1–2, records/tables in Week 3, graphs in Week 4, interpretation in Week 5 and guided investigation in Week 6. The bank samples individual stages of guided investigations using supplied records. It does not claim students independently conducted fieldwork; the weekly lessons retain that role.

## Progression and matched demand

- All multiple-choice questions have four distinct options; “I don’t know” is separate.
- Numerical values are whole-number counts 0–4. The horizontal axis labels the measured count; the vertical axis labels the number of children.
- Numerical graph construction retains all five value positions, including one zero frequency. Zero as a data value is also distinguished from zero frequency.
- Eight records in digital-list tasks; 18 observations in numerical frequency-table tasks. Categorical graph construction uses frequencies up to 12; numerical construction includes a zero frequency and reaches nine.
- Larger graph-reading tasks use labelled scales in fives, with exact tick-aligned frequencies up to 25. Paired dot/column displays and construction tasks retain unit scales.
- Five forms match skills, representation type, count complexity and intended difficulty while rotating familiar contexts, frequencies, record order and choice positions.
- Reuses the approved object artwork, question-number navigation, direct response recording, Back/Next, read-aloud and responsive card layout.

Frequency progression for future levels: see [the progression policy](statistica-frequency-progression.md).

## Validation

`qa:statistica-level3-five-forms` verifies all 100 questions, code balance, source totals, unique options, zero-frequency treatment, scales, matched demand, and correct/wrong/partial/blank scoring. Included in prebuild. The existing Level 3 lesson audit independently checks all 18 lessons and 576 generated tasks.

Browser checks cover all five forms and scores, response retention, skipping, mobile overflow, graph values and numerical axis labels. Shared renderer changes are also checked against the approved Level 2 bank.
