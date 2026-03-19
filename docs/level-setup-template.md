# Level Setup Template

Use this template with [level-setup-checklist.md](/Users/seanjohns/level-up-learning-mvp/docs/level-setup-checklist.md) before building any new maths level.

---

## Level Summary

- Level:
- Year label:
- Strand:
- Owner:
- Status:
- Date started:

---

## 1. Level Scope Contract

- Curriculum codes:
- In scope:
- Out of scope:
- Number range:
- Required knowledge:
- Notes:

---

## 2. Difficulty Profile

```ts
export const LEVEL_DIFFICULTY_PROFILE = {
  numberRange: { min: 0, max: 0 },
  placeValueDepth: [],
  numberLine: {
    min: 0,
    max: 0,
    stepOptions: [],
  },
  roundingTargets: [],
  factRange: { min: 0, max: 0 },
  multiplicationTables: [],
  divisionTables: [],
  allowRegrouping: false,
  writtenMethodsExpected: false,
  mentalMathsFriendly: true,
};
```

Notes:
- 

---

## 3. Activity Policy Map

```ts
export const LEVEL_ACTIVITY_POLICY = {
  place_value_builder: {
    allowedModes: [],
    blockedModes: [],
    requiresVisual: false,
    maxDifficulty: {},
  },
  partition_expand: {
    allowedModes: [],
    blockedModes: [],
    requiresVisual: false,
    maxDifficulty: {},
  },
  number_line: {
    allowedModes: [],
    blockedModes: [],
    requiresVisual: false,
    maxDifficulty: {},
  },
  addition_strategy: {
    allowedModes: [],
    blockedModes: [],
    requiresVisual: false,
    maxDifficulty: {},
  },
  subtraction_strategy: {
    allowedModes: [],
    blockedModes: [],
    requiresVisual: false,
    maxDifficulty: {},
  },
  equal_groups: {
    allowedModes: [],
    blockedModes: [],
    requiresVisual: false,
    maxDifficulty: {},
  },
  arrays: {
    allowedModes: [],
    blockedModes: [],
    requiresVisual: false,
    maxDifficulty: {},
  },
  division_groups: {
    allowedModes: [],
    blockedModes: [],
    requiresVisual: false,
    maxDifficulty: {},
  },
  fact_family: {
    allowedModes: [],
    blockedModes: [],
    requiresVisual: false,
    maxDifficulty: {},
  },
  mixed_word_problem: {
    allowedModes: [],
    blockedModes: [],
    requiresVisual: false,
    maxDifficulty: {},
  },
  fractions: {
    allowedModes: [],
    blockedModes: [],
    requiresVisual: false,
    maxDifficulty: {},
  },
  review_quiz: {
    allowedModes: [],
    blockedModes: [],
    requiresVisual: false,
    maxDifficulty: {},
  },
};
```

Notes:
- 

---

## 4. Lesson Intent Rules

```ts
export const LEVEL_LESSON_INTENT_RULES = [
  {
    focusMatch: [],
    allowedActivityTypes: [],
    allowedModesByType: {},
    blockedActivityTypes: [],
  },
];
```

Lesson intent notes:
- 

Fallback rules:
- no generic fallback that changes the taught skill
- no cross-lesson contamination
- no cross-week contamination

---

## 5. Generator / Validator Alignment

Current plan:
- `getDifficultyProfile(level, week)`:
- `getAllowedModes(level, activityType)`:
- `validateLessonActivityIntent(level, lesson, activity)`:
- `generateQuestion(level, lesson, activity)`:

Checks:
- generator uses active level profile:
- validator uses active level profile:
- invalid activities filtered before runtime:
- unsupported modes rejected early:

---

## 6. Assessment Blueprint

### Pre-Test
- Structure:
- Skills covered:
- Number of items:

### Weekly Quiz
- Structure:
- Skills covered:
- Number of items:

### Practice Lessons
- Structure:
- Input types:
- Feedback style:

### Post-Test
- Structure:
- Skills covered:
- Number of items:

Assessment rules:
- one clear correct answer per item
- weekly quiz only tests taught content
- pre/post assess the same skill blueprint
- post-test focuses on fluency and accuracy

---

## 7. Renderer Expectations

Practice lessons:
- 

Weekly quizzes:
- 

Post-tests:
- 

Activity rendering rules:
- visuals required:
- typed response allowed:
- multiple choice allowed:
- drag/drop needed:
- number line interactions needed:
- scaffolded steps needed:
- instant feedback needed:

---

## 8. 12-Week Schedule

Only complete this section after sections 1 to 7 are locked.

### Week 1
- Topic:
- Lesson 1:
- Lesson 2:
- Lesson 3:

### Week 2
- Topic:
- Lesson 1:
- Lesson 2:
- Lesson 3:

### Week 3
- Topic:
- Lesson 1:
- Lesson 2:
- Lesson 3:

### Week 4
- Topic:
- Lesson 1:
- Lesson 2:
- Lesson 3:

### Week 5
- Topic:
- Lesson 1:
- Lesson 2:
- Lesson 3:

### Week 6
- Topic:
- Lesson 1:
- Lesson 2:
- Lesson 3:

### Week 7
- Topic:
- Lesson 1:
- Lesson 2:
- Lesson 3:

### Week 8
- Topic:
- Lesson 1:
- Lesson 2:
- Lesson 3:

### Week 9
- Topic:
- Lesson 1:
- Lesson 2:
- Lesson 3:

### Week 10
- Topic:
- Lesson 1:
- Lesson 2:
- Lesson 3:

### Week 11
- Topic:
- Lesson 1:
- Lesson 2:
- Lesson 3:

### Week 12
- Topic:
- Lesson 1:
- Lesson 2:
- Lesson 3:

Lesson row standard:
- fluency
- core concept
- reasoning
- application where appropriate

---

## 9. Pre-Build QA

- Scope contract checked:
- Difficulty profile checked:
- Activity policy checked:
- Lesson intent checked:
- Assessment blueprint checked:
- Fallback leakage checked:
- Status:

---

## 10. Post-Build Smoke QA

- Early week spot-check:
- Middle week spot-check:
- Late week spot-check:
- Policy crash check:
- Mode leakage check:
- Progress and reset check:
- Status:

---

## Implementation Notes

- Risks:
- Open questions:
- Follow-up refactors:
- Dependencies:
