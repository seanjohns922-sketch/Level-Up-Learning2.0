import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { generateWeek11Task, resetWeek11TaskSessionState } from "../data/activities/year1/week11";
import type { PracticeTask } from "../data/activities/year1/practice-task";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";
import { buildYear1Week11PatternQuizItems } from "../data/quizzes/year1Week11Patterns";
import { PROGRAMS_BY_YEAR } from "../data/programs";
import { ASSESSMENT_THRESHOLDS } from "../lib/assessment-rules";
import { isPracticeTaskSafe } from "../lib/task-safety";

type PatternTask = Extract<PracticeTask, { kind: "repeatingPattern" }>;
const year1 = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.find((blueprint) => blueprint.level === 1);
assert(year1);
assert(year1.descriptors.every((descriptor) => descriptor.curriculumMapping.implementationStatus === "aligned"), "Year 1 still has a curriculum blocker.");

const week11 = PROGRAMS_BY_YEAR["Year 1"]?.find((week) => week.week === 11);
assert(week11);
assert.deepEqual(week11.curriculum, ["AC9M1A02"]);
assert(week11.lessons.every((lesson) => lesson.curriculum.includes("AC9M1A02")), "Every Week 11 lesson must carry AC9M1A02.");
assert(week11.lessons.every((lesson) => !lesson.curriculum.includes("AC9M1N04")), "Week 11 must not retain stale arithmetic metadata.");
assert(PROGRAMS_BY_YEAR["Year 1"]?.find((week) => week.week === 12)?.lessons.some((lesson) => lesson.curriculum.includes("AC9M1A02")), "Week 12 must carry explicit repeating-pattern review metadata.");

resetWeek11TaskSessionState();
const modesByLesson = new Map<number, Set<string>>();
const lessonPrompts = new Set<string>();
for (const lesson of [1, 2, 3]) {
  for (const difficulty of ["easy", "medium", "hard"] as const) {
    for (let index = 0; index < 30; index += 1) {
      const task = generateWeek11Task(`y1-w11-l${lesson}`, difficulty);
      assert.equal(task.kind, "repeatingPattern");
      assert(isPracticeTaskSafe(task), "Pattern task is blocked by the shared task-safety gate.");
      const patternTask = task as PatternTask;
      lessonPrompts.add(patternTask.prompt);
      const modes = modesByLesson.get(lesson) ?? new Set<string>();
      modes.add(patternTask.mode);
      modesByLesson.set(lesson, modes);
      if (patternTask.mode === "identify_unit") {
        assert(patternTask.sequence.length >= patternTask.answerUnit.length * 2);
        assert.equal(patternTask.unitOptions.filter((option) => option.join("|") === patternTask.answerUnit.join("|")).length, 1);
        assert.equal(new Set(patternTask.unitOptions.map((option) => option.join("|"))).size, patternTask.unitOptions.length);
      } else if (patternTask.mode === "continue") {
        assert(patternTask.answer.length >= 1 && patternTask.answer.length <= 2);
        assert(patternTask.answer.every((token) => patternTask.palette.includes(token)));
      } else {
        assert(patternTask.repeats >= 2);
        assert(patternTask.repeatUnit.length >= 2);
        assert(patternTask.repeatUnit.every((token) => patternTask.palette.includes(token)));
      }
    }
  }
}
assert.deepEqual([...modesByLesson.get(1) ?? []], ["identify_unit"]);
assert.deepEqual([...modesByLesson.get(2) ?? []], ["continue"]);
assert.deepEqual([...modesByLesson.get(3) ?? []], ["create"]);

const quiz = buildYear1Week11PatternQuizItems();
assert.equal(ASSESSMENT_THRESHOLDS.weeklyQuizPassPercent, 80);
assert.equal(quiz.length, 15);
assert.equal(new Set(quiz.map((item) => item.id)).size, 15);
assert.equal(new Set(quiz.map((item) => item.prompt)).size, 15);
for (const lessonTag of [1, 2, 3] as const) assert.equal(quiz.filter((item) => item.lessonTag === lessonTag).length, 5);
for (const item of quiz) {
  assert(item.sequence.length >= 2);
  assert(item.options.length >= 3);
  assert.equal(new Set(item.options).size, item.options.length);
  assert.equal(item.options.filter((option) => option === item.answer).length, 1);
  assert(!lessonPrompts.has(item.prompt), `${item.id} reuses lesson-native wording.`);
}

const sessionSource = fs.readFileSync(path.join(process.cwd(), "app/session/page.tsx"), "utf8");
const assessmentApi = fs.readFileSync(path.join(process.cwd(), "data/assessments/api.ts"), "utf8");
assert(sessionSource.includes('year === "Year 1" && Number(week) === 11'));
assert(sessionSource.includes("buildYear1Week11PatternQuizQuestions"));
assert(!assessmentApi.includes("year1Week11Patterns"), "Weekly quiz bank leaked into the assessment resolver.");

console.log("Number Nexus Year 1 Curriculum Completion passed: AC9M1A02 is taught through identify, continue and create lessons; the independent Week 11 quiz contains 15 valid questions in a 5-5-5 split. Assessment generation remains blocked pending phase approval.");
