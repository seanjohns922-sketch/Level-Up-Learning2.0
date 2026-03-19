# Level Setup Checklist

Use this checklist before building any new maths level.

Purpose:
- make each level consistent
- avoid Year 2 / Year 3 policy mismatches
- ensure generator, validator, lesson rows, and assessments align before lesson coding begins

## 1. Curriculum Scope

Confirm the exact curriculum coverage for the level.

Checklist:
- list the curriculum content codes being targeted
- define what is in scope
- define what is out of scope
- set the maximum number range for the level
- set the required operations, facts, fractions, measurement, and reasoning expectations

Output:
- a short level scope contract

Suggested template:

```md
## Level Scope Contract
- Level: Year X
- Curriculum codes: ...
- In scope: ...
- Out of scope: ...
- Number range: ...
- Required knowledge: ...
```

## 2. Difficulty Contract

Define the difficulty profile before building lessons.

Checklist:
- max and min number range
- place value depth
- number line ranges and step sizes
- allowed rounding targets
- fact ranges
- multiplication and division tables included
- whether regrouping or carrying is allowed
- whether written methods are expected
- whether tasks should stay mental-maths friendly

Output:
- a year-aware difficulty profile for the level

Suggested template:

```ts
type DifficultyProfile = {
  numberRange: { min: number; max: number };
  placeValueDepth: string[];
  numberLine: { min: number; max: number; stepOptions: number[] };
  roundingTargets: number[];
  factRange: { min: number; max: number };
  tables: number[];
  allowRegrouping: boolean;
  writtenMethodsExpected: boolean;
  mentalMathsFriendly: boolean;
};
```

## 3. Allowed Activity Types

Define which activity types are allowed for the level.

Examples:
- `place_value_builder`
- `partition_expand`
- `number_line`
- `addition_strategy`
- `subtraction_strategy`
- `equal_groups`
- `arrays`
- `division_groups`
- `fact_family`
- `mixed_word_problem`
- `fractions`
- `review_quiz`

For each activity type, define:
- allowed modes
- blocked modes
- required visual rules
- maximum difficulty

Output:
- an activity policy map for the level

Suggested template:

```ts
type ActivityPolicy = {
  allowedModes?: string[];
  blockedModes?: string[];
  requiresVisual?: boolean;
  maxDifficulty?: Record<string, number>;
  blockedFocusKeywords?: string[];
};

type ActivityPolicyMap = Record<string, ActivityPolicy>;
```

## 4. Lesson Intent Rules

Define how lesson focus maps to generation before writing lessons.

Rules:
- each lesson focus must only generate aligned question types
- no generic fallback that changes the skill being taught
- no cross-lesson or cross-week contamination
- if lesson focus is `near doubles`, only near doubles should generate
- if lesson focus is `round to nearest 100`, do not allow unrelated generic number line or addition questions

Output:
- lesson-to-activity intent mapping rules

Suggested template:

```ts
type LessonIntentRule = {
  focusMatch: string[];
  allowedActivityTypes: string[];
  allowedModesByType?: Record<string, string[]>;
  blockedActivityTypes?: string[];
};
```

## 5. Generator / Validator Alignment

Confirm generation and validation use the same rules.

Checklist:
- generator uses the same year-aware difficulty profile as validator
- policy enforcement is based on active level or year, not a default Year 2 assumption
- unsupported modes are rejected early
- invalid activities are filtered out before runtime, not mid-session

Output:
- a consistent generation and validation path

Required design rule:

```ts
getDifficultyProfile(level, week)
getAllowedModes(level, activityType)
validateLessonActivityIntent(level, lesson, activity)
generateQuestion(level, lesson, activity)
```

## 6. Assessment Contract

Define assessments before coding lessons.

Checklist:
- pre-test structure
- post-test structure
- weekly quiz structure
- practice lesson structure

Rules:
- pre and post tests must assess the same skill blueprint
- post-test should test fluency and accuracy, not open-ended explanation
- weekly quiz should track taught content only
- no rogue questions outside lesson scope
- one clear correct answer per assessment item

Output:
- a locked assessment blueprint for the level

Suggested template:

```md
## Assessment Blueprint
- Pre-test: ...
- Weekly quiz: ...
- Practice lessons: ...
- Post-test: ...
- Skill coverage rules: ...
```

## 7. UI / Rendering Expectations

Define renderer needs before wiring content.

Checklist:
- which activities require visuals
- which activities use typed response
- which activities use multiple choice
- which activities need drag and drop
- which activities need number line interactions
- which activities need step-by-step scaffold
- which activities require instant feedback

Also define:
- what appears in practice lessons
- what appears in quizzes
- what appears in post-tests

Output:
- renderer expectations for the level

Suggested template:

```md
## Renderer Expectations
- Practice lessons: ...
- Weekly quizzes: ...
- Post-tests: ...
- Visual requirements: ...
- Input mode rules: ...
```

## 8. Level Schedule

Only after steps 1 to 7 are complete:
- write the 12-week schedule
- write lesson titles
- write lesson focus lines
- assign activity arrays
- ensure every lesson has fluency, core concept, reasoning, and application where appropriate

Output:
- full level schedule

Minimum lesson row standard:
- fluency
- core concept
- reasoning
- application where appropriate

## 9. Pre-Build QA Check

Before marking the level ready for implementation:
- confirm all lesson rows match the scope contract
- confirm all activity modes are valid for the level
- confirm all assessment items match taught skills
- confirm no stale Year 2 or other-level policy assumptions remain
- confirm no generic fallback can override lesson intent

Output:
- level ready for implementation

Suggested sign-off:

```md
## Pre-Build QA
- Scope contract checked
- Difficulty profile checked
- Activity policy checked
- Lesson intent checked
- Assessment blueprint checked
- Fallback leakage checked
- Status: Ready for implementation
```

## 10. Post-Build Smoke QA

After the level is wired:
- spot-check early, middle, and late weeks
- check one lesson per major topic
- confirm no policy crashes
- confirm no invalid mode leakage
- confirm progress, scoring, and lesson transitions reset cleanly

Output:
- level ready for manual QA

Suggested sign-off:

```md
## Post-Build Smoke QA
- Early week spot-check: pass/fail
- Middle week spot-check: pass/fail
- Late week spot-check: pass/fail
- Policy crash check: pass/fail
- Mode leakage check: pass/fail
- Progress and reset check: pass/fail
- Status: Ready for manual QA
```

## Working Rule

Do not write the full level schedule until steps 1 to 7 are complete.

Do not wire assessments until the lesson intent rules and activity policy map are locked.

Do not ship a level until steps 9 and 10 are complete.

## Long-Term Architecture Target

Refactor the engine so policy selection, difficulty profile, and validation are explicitly level-aware.

Preferred architecture:

```ts
getDifficultyProfile(level, week)
getAllowedModes(level, activityType)
validateLessonActivityIntent(level, lesson, activity)
generateQuestion(level, lesson, activity)
```

Goal:
- every new level starts with this checklist before writing the schedule
- generation, validation, lessons, and assessment stay aligned from the start
