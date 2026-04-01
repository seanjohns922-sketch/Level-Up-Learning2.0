# Weekly Quiz Contract

This is a system rule for all levels.

## Standard Weekly Quiz

- Total questions: `15`
- Lesson split:
  - `5` from Lesson 1
  - `5` from Lesson 2
  - `5` from Lesson 3

## Builder Rules

- Use the shared weekly quiz builder.
- Preserve lesson origin on every quiz question.
- Do not silently substitute questions from another lesson.
- If a lesson cannot provide its required `5` questions, fail clearly with year/week/lesson details.

## quizSafe Rule

- `quizSafe !== false`: lesson may be included in the standard weekly quiz.
- `quizSafe === false`: lesson must be excluded from the standard weekly quiz.
- If any lesson in a standard quiz week is marked `quizSafe: false`, the standard builder must fail clearly instead of backfilling from another lesson.

## Custom Quiz Weeks

Some weeks may intentionally not use the standard weekly quiz flow.

These weeks must be explicitly blocked by config and handled separately.

Example:
- Year 4 Week 12 does not use the standard weekly quiz path.

## Scope

This contract applies to:

- Level 0 / Prep
- Level 1
- Level 2
- Level 3
- Level 4
- future levels and strands

## Source of Truth

Lesson content belongs in the year program files.
Quiz inclusion/exclusion belongs in lesson config via `quizSafe`.
Quiz assembly logic belongs only in the shared weekly quiz builder.
