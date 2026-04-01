# Level Up Learning MVP

Maths learning platform built with Next.js.

## Development

Run the app locally:

```bash
npm run dev
```

Other useful commands:

```bash
npm run lint
npm run qa:year2-smoke
npm run qa:level-aware-regression
```

## Level Design Docs

Use these before building a new maths level:

- [Level Setup Checklist](/Users/seanjohns/level-up-learning-mvp/docs/level-setup-checklist.md)
- [Level Setup Template](/Users/seanjohns/level-up-learning-mvp/docs/level-setup-template.md)
- [Year 4 Engine Bank Spec](/Users/seanjohns/level-up-learning-mvp/docs/year4-engine-bank-spec.md)
- [Weekly Quiz Contract](/Users/seanjohns/level-up-learning-mvp/docs/weekly-quiz-contract.md)

Working rule:
- do not write the full level schedule until the checklist steps 1 to 7 are complete
- do not wire assessments until lesson intent and activity policy are locked
- do not ship a level until pre-build QA and post-build smoke QA are complete

## Current Engine Direction

The lesson engine is moving toward explicit level-aware generation and validation:

```ts
getDifficultyProfile(level, week)
getAllowedModes(level, activityType)
validateLessonActivityIntent(level, lesson, activity)
generateQuestion(level, lesson, activity)
```

Goal:
- generation, validation, lesson config, and assessments stay aligned across levels
- no stale Year 2 defaults leaking into Year 3 or later levels
