# Level Up Learning Assessment Framework

The purpose of a Level Up Learning assessment is not to measure whether a student remembers the lesson. It is to determine whether the student can independently transfer, apply and reason with the curriculum after learning has occurred.

Status: Framework V1. The assessment architecture is frozen. Current work is limited to assessment content and approved blueprint implementation.

This framework governs Number Nexus, Measurelands, Starpath, Statistica, Pattern Peaks, Chance Hollow, future Mathematics realms and future Literacy realms. Curriculum content changes by realm; assessment philosophy and quality gates do not.

## Assessment Philosophy

Lessons teach. Weekly quizzes check recent learning. Pre-tests diagnose independent entry knowledge. Post-tests demonstrate independent mastery and transfer.

A student who has memorised lesson procedures should not pass a Post-Test. A student who genuinely understands the level should be able to demonstrate that understanding in unfamiliar contexts.

## Assessment Principle: Independent Response

Pre-Tests and Post-Tests measure independent mastery. Wherever practical, students generate the mathematical answer rather than recognise it from a list of options.

Constructed responses are the default. They include typed numbers, measured values, calculations, short explanations and interactive constructions in which the student produces or builds the answer.

Multiple-choice responses are permitted only when selection is the strongest way to assess a misconception, strategy choice, conceptual distinction or interpretation. They must not be used merely because they are easier to build or score.

Selected explanations, comparisons and misconception choices still count as selected responses. Cognitive demand does not convert a recognition interaction into a constructed response.

| Level | Constructed or manipulated minimum | Selected-response maximum |
| --- | ---: | ---: |
| Ground | 10 of 20 (50%) | 10 of 20 (50%) |
| Level 1 | 12 of 20 (60%) | 8 of 20 (40%) |
| Level 2 | 14 of 20 (70%) | 6 of 20 (30%) |
| Level 3 | 16 of 20 (80%) | 4 of 20 (20%) |
| Level 4 | 17 of 20 (85%) | 3 of 20 (15%) |
| Level 5 | 18 of 20 (90%) | 2 of 20 (10%) |
| Level 6 | 19 of 20 (95%) | 1 of 20 (5%) |

These quotas apply independently to each Pre-Test and Post-Test form.

## Non-Negotiable Scope

The assessment engine is approved. Assessment-content work must not redesign:

- assessment routing;
- assessment saving or canonical snapshots;
- canonical progression;
- replay;
- teacher dashboards or student insights;
- adaptive placement;
- XP, Gems, Cards or Realmies;
- the assessment database schema.

Pre-tests and post-tests remain 20 questions with an 85% pass threshold. Weekly quizzes remain 15 questions with a 5-5-5 lesson distribution and an 80% pass threshold. Existing canonical systems remain authoritative.

## Independent Item Rule

Every curriculum outcome has three independent bank families:

| Bank | Purpose | Contract |
| --- | --- | --- |
| Lesson Bank | Teaching and guided practice | Used only in lessons |
| Weekly Quiz Bank | Recent-learning checks | Used only in 15-question weekly quizzes |
| Assessment Bank | Independent diagnosis and mastery | Contains separate Pre-Test and Post-Test forms; never used in lessons or quizzes |

Questions may assess the same curriculum outcome. They must not reuse wording, contexts, distractors, generated task instances, interaction payloads or visual scaffolding across bank families. Shared renderer components are permitted because they provide input capability, not question content.

Every assessment item has `assessment_authored` provenance and a pre-test or post-test source pool. Curriculum lesson mapping records where the outcome is taught; it never means the item originated in a lesson bank.

## Blueprint Authority

The approved realm blueprint is the source of truth. A form must not build when any of these fail:

- question count or curriculum mapping;
- descriptor allocation or coverage;
- difficulty profile;
- reasoning or transfer quota;
- misconception coverage;
- response-type minimum;
- context or interaction-structure limits;
- independent-bank provenance;
- pre-test and post-test separation.

Blueprints define descriptor, learning intentions, success criteria, allocation, demand, response mix, misconceptions, curriculum mapping and item archetypes before questions are authored.

## Cognitive Demand

Every item is explicitly classified as one of:

1. Recall: recognise or retrieve a fact, label or convention.
2. Understanding: interpret, represent, compare or explain meaning.
3. Application: select and use knowledge in a familiar problem.
4. Reasoning: justify, evaluate, diagnose or connect evidence.
5. Transfer: apply learning independently in an unfamiliar situation.

Procedural repetition appears in a Post-Test only when deliberately allocated as Recall or Understanding. Increased cognitive demand must not be simulated by larger numbers or additional calculation alone.

## Level 5 And 6 Tasks

Every Level 5 and Level 6 Post-Test contains at least:

- 2 transfer tasks;
- 2 reasoning tasks requiring justification;
- 2 misconception-diagnosis tasks.

Suitable transfer contexts include planning, design, decision-making, comparison and evaluation. These minimums operate alongside the stronger exact quotas in each approved realm blueprint.

## Canonical Item Metadata

Every assessment item stores, without runtime inference:

- curriculum descriptor code or codes;
- curriculum week and lesson mapping;
- cognitive category;
- Easy, Moderate, Challenging or Very Challenging difficulty;
- transfer flag and reasoning flag;
- response mode;
- one or more canonical misconception tags;
- misconception-diagnosis flag;
- stable context and interaction-structure keys;
- versioned renderer and scoring payloads;
- expected and observed item statistics.

## Misconception Library

Each realm maintains a canonical misconception library with stable IDs, labels, descriptions and descriptor mappings. Assessment items reference IDs, not free-text variants.

Measurelands includes, among others:

- perimeter versus area;
- capacity versus volume;
- linear versus square units;
- elapsed-time base-ten subtraction;
- metric conversion direction;
- mixed-unit comparison;
- protractor baseline and wrong-scale selection;
- ruler starting point;
- scale interval value;
- timetable waiting time.

Incorrect options represent believable tagged misconceptions. Filler options such as “same,” “cannot tell,” impossible values or obviously unrelated units are not acceptable unless the mathematical task genuinely makes that response valid.

## Assessment Experience

Assessment scaffolding provides information but never teaches a method. Read-aloud support reads or restates the question without revealing formulas, conversions, intermediate results, reasoning or strategies.

Pre-test and post-test forms assess the same curriculum at the same intended year-level demand. They use different items, contexts, values, visuals and interaction payloads. Post-tests may contain more reasoning and transfer evidence while remaining calibrated to the same level construct.

## Calibration

Authored difficulty is an explicit design classification, not an observed statistic. New items remain `uncalibrated` until sufficient student evidence exists.

The metadata supports future calculation of:

- item difficulty;
- item discrimination;
- distractor effectiveness and response frequency;
- misconception frequency;
- adjacent-level separation.

Calibration samples must include genuine students working at the target level and one level below. Simulation and content review are useful quality gates but cannot establish real pass probability.

## Success Criteria

Content migration is complete only when evidence demonstrates:

- a genuine student working one level below has less than a 50% probability of achieving 85% on the next level's Post-Test;
- students who have genuinely mastered the level consistently achieve at least 85%;
- Pre-Tests diagnose entry knowledge without familiarity inflation;
- Post-Tests measure independent mastery and transfer rather than lesson recall;
- teacher reporting accurately reflects descriptor mastery, misconceptions and reasoning evidence.

Until representative pilot data exists, these criteria remain unverified release gates and must not be reported as achieved.

## Reporting

Canonical response evidence supports descriptor mastery, misconception frequency, reasoning performance, transfer performance, response frequency and future item calibration. Existing teacher and student reporting systems consume this evidence; assessment-content phases do not redesign those systems.

Teacher reports must distinguish low evidence from low mastery. Item statistics use assessment attempts only and must not be blended with lesson or weekly-quiz attempts.

## Release Gate

An assessment bank cannot become live until:

1. Its blueprint is approved.
2. Every item passes metadata, misconception, response, ordering and provenance validation.
3. Exact descriptor, difficulty, reasoning and transfer allocations pass.
4. Pre-test and post-test overlap checks pass.
5. Mathematical, curriculum, distractor and visual reviews pass.
6. Existing routing, persistence, progression, replay, placement, reporting and rewards regressions pass unchanged.
7. Pilot evidence and calibration status are visible, including unresolved adjacent-level separation risk.

Replacing a bank is a versioned content release. Historical attempts retain their original item snapshots and versions.
