# Statistica Level 1 assessment review

100 new items: 20 in each of Pre-Test, Post-Test, Start, Mid and End.
Review route: `/demo-review/statistica-level1`. Linked from central Demo Review.
This is an isolated review bank. It does not replace live student banks, write student results, or change login, placement or weekly lessons.

## Curriculum and lessons

Source: supplied ACARA Mathematics F–6 v9 document, Year 1 Statistics, codes AC9M1ST01 and AC9M1ST02 (PDF catalogue page 17; text checked in the supplied matching DOCX).

| Code | Questions | Evidence |
|---|---|---|
| AC9M1ST01 | 1–10 | Relevant question/categories; record observations with counters, pictures, lists, tallies and symbols; sort observed data; repair missing/duplicate records; digital response entry. |
| AC9M1ST02 | 11–20 | Create one-to-one object/picture displays; most/fewest including zero; count and compare frequencies; recognise ties; repair a display; interpret and discuss findings within the observed group. |

Cross-checked `data/activities/statistica/level1.ts`: six weeks / 18 lessons cover collecting/sorting, recording, one-to-one displays, comparisons, interpretation, and mini investigations. Each item stores its related lesson week. Acquisition tasks assess recording of supplied observations, not independent real-world survey collection.

Early tasks use six to nine visible responses for recording tasks; tally crosses the five-mark boundary; a later frequency task uses counts up to 11. Every form has the same counts/demand per skill, with different familiar contexts and category roles. Four options for selection tasks, with neighbouring-count, reversal, duplicate and unsupported-claim distractors. Correct option positions vary. No scaled pictographs, mean/median or probability.

## Presentation and response behaviour

Uses fuller object illustrations adapted from the existing lesson DataIcon subjects and Statistica getRealmTheme tokens. Short prompts, named categories, visible sources, one-to-one key, adjustable counters/tallies/pictures and six-row editable lists. Question 7 uses direct picture selection and placement into four visible groups, not dropdowns. Each placed picture can be selected and moved again, with no correctness hints. All options and evidence panels have read-aloud controls. Source narration excludes hidden answers. No correctness feedback before opening review details. Question numbers, Back/Next, automatic advance on “I don’t know”, and per-form response retention match existing review behaviour.

## Checks

- `npm run qa:statistica-level1-five-forms`: 100 items, source counts, independent expected answers, curriculum balance, matched form demands, blank/correct/incorrect response scoring.
- `npm run qa:statistica-level1`: existing 18 lessons / 576 generated activities.
- `npm run qa:statistica-assessments`: existing independent and weekly banks.
- TypeScript and targeted ESLint.
- Browser: answer all 100, five 20/20 totals, record retention, skip, navigation, desktop/mobile layout and read-aloud presence. Manually inspect screenshots, including the category labels of a targeted frequency graph.

## Review revision, 23 September 2026

Four meaningful options on every multiple-choice question across all five forms. Category-choice questions show four real categories in their data; recording tasks retain three groups to avoid adding unnecessary work. Larger full-object artwork covers all 20 fruit, pet, toy, travel and colour subjects in this bank. The shared lesson renderer is unchanged.
