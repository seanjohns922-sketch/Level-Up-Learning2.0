# Realm Lesson Adapter - Deferred Decision

## Status

Deferred until the Pattern Peaks lesson audit is complete.

Do not refactor Pattern Peaks or begin this architecture work while its lesson
content is still being audited.

## Decision

Future realms should share platform infrastructure without inheriting another
realm's presentation or content.

Shared infrastructure remains responsible for:

- timing, scoring and XP;
- save and resume;
- voiceovers and accessibility;
- feedback and mistake review;
- lesson completion; and
- teacher analytics.

Each realm must own:

- routes and lesson shell;
- curriculum and lesson data;
- question generation;
- activity components and visuals;
- theme tokens and terminology;
- celebrations and animations; and
- quizzes and assessments.

## Proposed Follow-Up

After the Pattern Peaks lesson audit, introduce a typed realm definition consumed
by the shared lesson infrastructure. The shared engine should not contain
hardcoded Number Nexus, Measurelands, Starpath, Statistica or Pattern Peaks
branding.

The adapter should provide, at minimum:

```ts
type RealmLessonDefinition = {
  id: string;
  theme: RealmTheme;
  terminology: RealmTerminology;
  questionGenerator: LessonQuestionGenerator;
  activityRenderer: RealmActivityRenderer;
  celebrations: RealmCelebrationTheme;
};
```

## Acceptance Criteria

- Adding a realm does not require editing another realm's presentation branch.
- Shared scoring, accessibility and persistence fixes apply to every realm.
- Each realm has an isolation audit covering branding, terminology and theme.
- Number Nexus remains visually and behaviourally unchanged by realm additions.
- Pattern Peaks is migrated only after its lesson audit is signed off.
