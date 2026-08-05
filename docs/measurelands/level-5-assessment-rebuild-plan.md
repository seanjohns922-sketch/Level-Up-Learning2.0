# Measurelands Level 5 Assessment Rebuild Plan

Status: Phase 2 candidate content authored. Automated blueprint/content audit passes 137/137. Production release remains blocked. The assessment engine and platform architecture are frozen.

## Candidate Review Status

- Authored: 20 independent pre-test items and 20 independent post-test items.
- Curriculum correction: all AC9M5M03 items assess 12-hour/24-hour comparison or conversion; Year 6 timetable planning is excluded and enforced by audit.
- Response independence: each form contains exactly 18 typed/manipulated responses and 2 selected responses.
- Rendered QA: passed for representative typed, selected, perimeter-keypad and protractor-construction interactions at desktop and a true 390 px emulated viewport. All tested mobile pages reported a 390 px document scroll width.
- Release: blocked pending educator review and representative student pilot calibration.

The candidates are not registered in the production item-bank resolver. The current legacy Level 5 forms remain live until every release gate passes.

## Curriculum Contract

The pre-test and post-test each contain 20 independently authored items:

| Descriptor | Focus | Pre | Post |
| --- | --- | ---: | ---: |
| AC9M5M01 | Metric unit choice, mixed units and fit-for-purpose precision | 4 | 4 |
| AC9M5M02 | Practical perimeter and area of regular and irregular shapes | 6 | 6 |
| AC9M5M03 | 12-hour and 24-hour comparison and conversion | 4 | 4 |
| AC9M5M04 | Estimate, construct and measure angles with tools | 6 | 6 |

The detailed intentions, success criteria, misconceptions and archetypes remain in the approved blueprint.

## Form Design

The pre-test targets 5 easy, 10 moderate, 4 challenging and 1 very challenging item. Its cognitive mix is 4 understanding, 10 application, 5 reasoning and 1 transfer item. Exactly 18 responses are constructed or manipulated and no more than 2 are selected.

The post-test targets 2 easy, 10 moderate, 5 challenging and 3 very challenging items. Its cognitive mix is 2 understanding, 9 application, 6 reasoning and 3 transfer items. Exactly 18 responses are constructed or manipulated and no more than 2 are selected.

The post-test must include at least 2 transfer tasks, 2 reasoning tasks requiring justification and 2 misconception-diagnosis tasks. These are minimum task features within the stronger exact cognitive mix, not 6 necessarily separate questions.

## Build Sequence

1. Write a 40-row item specification matrix before writing prompts.
2. Assign every row a descriptor, curriculum lesson mapping, intention, criterion, canonical misconception tag, demand, difficulty, transfer/reasoning flags, response mode, context and structure.
3. Review the matrix against the exact form standards.
4. Author independent renderer and scoring payloads without importing lesson registries.
5. Run structural, curriculum, mathematical-answer, visual and replay audits.
6. Conduct educator review and a student pilot; populate observed item statistics.
7. Approve both forms together, then switch the Level 5 resolver in one versioned release.

Pilot evidence must test both target-level mastery and adjacent-level separation. Release remains blocked until genuine Level 4 students have less than a 50% probability of passing the Level 5 Post-Test at 85%, while genuinely mastered Level 5 students consistently meet or exceed 85%.

## Release Gate

No Level 5 item may be sourced from `getY5MeasurelandsLessonQuizContribution`. The live resolver remains unchanged until all 40 items and both forms pass review. Routing, saving, progression, replay, reporting, rewards, placement and database schemas are out of scope.
