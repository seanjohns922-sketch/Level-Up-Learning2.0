# Level Build Standard

The engineering + curriculum contract every **level** must satisfy before it ships —
across every strand (Number, Measurement, Space, Algebra, Statistics, Probability)
and every level (Ground / Prep → Level 6 / Year 6).

This is the checklist that turns Level Up Learning from "a collection of lessons"
into a scalable platform: one shared engine, realm-separated data, identical
student experience per realm. Reference implementations: **Measurelands Level 3
(fully built)** and **Level 4 (architecture scaffold)**.

Automated enforcement: `npm run qa:level-integrity`
(`scripts/level-integrity-audit.mjs`). Run it before every level commit.

---

## 1. Program shell
- 8 weeks × 3 lessons.
- Registered in `data/programs/<realm><Year>.ts` and resolved through
  `getCurriculumPlan(year, genreId)` in `data/programs/genres.ts`.
- Genre marked available for the level (`availableLevels` in `genres.ts`).
- Exposes a `*_META` block (realm, strand, levelLabel, legend, curriculum).

## 2. Registry
- One registry at `data/activities/<realm><Year>/registry.ts` mirroring the
  Level 3 shape.
- Standard API: `is<NS>LessonId`, `resolve<NS>LessonTask`,
  `get<NS>PractisedSkills`, `get<NS>LessonMeta`, `reset<NS>LessonSessionState`.
- Each entry carries: prefix, week, lessonNumber, title, generate, reset,
  practisedSkills, completionTitle, unlockMessage, returnRoute,
  quizContributionBuilder, (coach tip where applicable).

## 3. Lesson IDs
- Pattern `y{n}-<strand>-w{week}-l{lesson}` (e.g. `y4-measurement-w1-l1`).
- Unique within the level; never collide with Number Nexus (`y{n}-w{week}-l{lesson}`).

## 4. Realm routing
- `realm_id` preserved end-to-end: program → lesson → session → completion → return route.
- `buildLessonRoute` / `buildLessonId` (`lib/lesson-routing.ts`) namespace by realm.
- A missing/unbuilt lesson shows a **clear realm-specific state** — never a
  silent fall back to Number Nexus content.

## 5. Teacher dashboard
- Attempts save with `realm_id` + realm program key
  (`<year>-<realm>` via `saveRealmLessonAttempt`).
- Level data appears under the correct **strand**, never grouped under Number.

## 6. Student insights
- Lesson progress, quiz results, completion, practised skills all visible under
  the strand; no collision with the Number realm at the same year.

## 7. Weekly quizzes
- Weeks 1–7 each build a 15-question quiz (5 per lesson from
  `quizContributionBuilder`), dispatched in `app/session/page.tsx`.
- One correct answer per question; stable IDs; saved with `realm_id`.
- Measurement quiz path **must not** fall through to the Number structured quiz.

## 8. Week 8 post-test
- Week 8 has **no weekly quiz**.
- Week 8 Lesson 3 unlock message signals the post-test; the program page renders
  the post-test on the last week automatically.

## 9. Fullscreen audit
- One screen, one challenge, no scrolling: Question → Interaction → Answers → Feedback.
- Active/interactive tasks (not MCQ worksheets); object visuals match their labels;
  realistic values.

## 10. Coach tips
- Per-lesson coach/skill tips wired in `lib/skill-coaching.ts` where the level uses them.

## 11. Architecture validation
- `npm run qa:level-integrity` passes (registry ↔ program aligned, unique realm-safe
  IDs, realm_id preserved, Week 8 post-test, save/resume realm-aware).
- Scaffold levels: placeholder lessons are **non-runnable** — a "Coming Soon"
  screen with no XP, save, completion, unlocks, teacher data or quiz progression
  until a real generator replaces the placeholder.

## 12. Build passes
- `npx tsc --noEmit` clean.
- `npx next build --webpack` compiles successfully.

---

### Legacy exceptions
Prep and Level 1 Measurelands predate parts of this standard (Prep ships 8 weekly
quizzes incl. Week 8; Level 1 ends "All lessons complete"). The audit records
these as **notes**, not failures. Everything from **Level 2 onward** meets the full
standard, and every **new** level/strand must.
