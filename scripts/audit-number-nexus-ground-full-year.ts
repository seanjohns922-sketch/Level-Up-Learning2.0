import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { YEAR1_WEEKLY_QUIZZES } from "../app/config/lesson-config";
import { generatePrepWeek1Task, resetPrepWeek1TaskSessionState } from "../data/activities/prep/week1";
import { generatePrepWeek2Task, resetPrepWeek2TaskSessionState } from "../data/activities/prep/week2";
import { generatePrepWeek3Task, resetPrepWeek3TaskSessionState } from "../data/activities/prep/week3";
import { generatePrepWeek4Task, resetPrepWeek4TaskSessionState } from "../data/activities/prep/week4";
import { generatePrepWeek5Task, resetPrepWeek5TaskSessionState } from "../data/activities/prep/week5";
import { generatePrepWeek6Task, resetPrepWeek6TaskSessionState } from "../data/activities/prep/week6";
import { generatePrepWeek7Task, resetPrepWeek7TaskSessionState } from "../data/activities/prep/week7";
import { generatePrepWeek8Task, resetPrepWeek8TaskSessionState } from "../data/activities/prep/week8";
import { generatePrepWeek9Task, resetPrepWeek9TaskSessionState } from "../data/activities/prep/week9";
import { generatePrepWeek10Task, resetPrepWeek10TaskSessionState } from "../data/activities/prep/week10";
import { generatePrepWeek11Task, resetPrepWeek11TaskSessionState } from "../data/activities/prep/week11";
import { generatePrepWeek12Task, resetPrepWeek12TaskSessionState } from "../data/activities/prep/week12";
import { getPosttestForYearLabel } from "../data/assessments/api";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";
import { buildPrepNumberNexusWeeklyQuiz } from "../data/quizzes/prepNumberNexus";
import { PREP_PROGRAM } from "../data/programs/prep";
import { ASSESSMENT_THRESHOLDS } from "../lib/assessment-rules";

type Generator = (lessonId: string, difficulty: "hard") => { kind: string; prompt: string; mode?: string };

const generators: Array<{ generate: Generator; reset: () => void }> = [
  { generate: generatePrepWeek1Task as Generator, reset: resetPrepWeek1TaskSessionState },
  { generate: generatePrepWeek2Task as Generator, reset: resetPrepWeek2TaskSessionState },
  { generate: generatePrepWeek3Task as Generator, reset: resetPrepWeek3TaskSessionState },
  { generate: generatePrepWeek4Task as Generator, reset: resetPrepWeek4TaskSessionState },
  { generate: generatePrepWeek5Task as Generator, reset: resetPrepWeek5TaskSessionState },
  { generate: generatePrepWeek6Task as Generator, reset: resetPrepWeek6TaskSessionState },
  { generate: generatePrepWeek7Task as Generator, reset: resetPrepWeek7TaskSessionState },
  { generate: generatePrepWeek8Task as Generator, reset: resetPrepWeek8TaskSessionState },
  { generate: generatePrepWeek9Task as Generator, reset: resetPrepWeek9TaskSessionState },
  { generate: generatePrepWeek10Task as Generator, reset: resetPrepWeek10TaskSessionState },
  { generate: generatePrepWeek11Task as Generator, reset: resetPrepWeek11TaskSessionState },
  { generate: generatePrepWeek12Task as Generator, reset: resetPrepWeek12TaskSessionState },
];

const expectedWeekCodes: Record<number, readonly string[]> = {
  1: ["AC9MFN01"],
  2: ["AC9MFN01", "AC9MFN03"],
  3: ["AC9MFN01"],
  4: ["AC9MFN02", "AC9MFN03"],
  5: ["AC9MFN03"],
  6: ["AC9MFN04"],
  7: ["AC9MFN01", "AC9MFN03"],
  8: ["AC9MFN01"],
  9: ["AC9MFN05"],
  10: ["AC9MFN06"],
  11: ["AC9MFA01"],
  12: ["AC9MFN01", "AC9MFN03", "AC9MFN04", "AC9MFN05", "AC9MFN06", "AC9MFA01"],
};

const allowedCodes = new Set(Object.values(expectedWeekCodes).flat());
const ids = new Set<string>();
let curriculumChecks = 0;
let lessonSamples = 0;
let quizChecks = 0;

assert.equal(PREP_PROGRAM.length, 12, "Ground must contain exactly 12 weeks.");
for (const week of PREP_PROGRAM) {
  assert.deepEqual([...week.curriculum].sort(), [...expectedWeekCodes[week.week]!].sort(), `Week ${week.week} curriculum metadata is incorrect.`);
  assert.equal(week.lessons.length, 3, `Week ${week.week} must contain three lessons.`);
  assert(week.curriculum.every((code) => allowedCodes.has(code)), `Week ${week.week} contains a descriptor outside Ground Number and Algebra.`);
  for (const lesson of week.lessons) {
    assert(lesson.curriculum.length > 0, `Week ${week.week} Lesson ${lesson.lesson} has no curriculum metadata.`);
    assert(lesson.curriculum.every((code) => week.curriculum.includes(code)), `Week ${week.week} Lesson ${lesson.lesson} is outside its week curriculum.`);
    curriculumChecks += 1;
  }
}

for (let week = 1; week <= 12; week += 1) {
  const entry = generators[week - 1]!;
  entry.reset();
  for (let lesson = 1; lesson <= 3; lesson += 1) {
    for (let sample = 0; sample < 20; sample += 1) {
      const task = entry.generate(`y0-w${week}-l${lesson}`, "hard");
      assert(task && typeof task.kind === "string" && task.kind.length > 0, `Week ${week} Lesson ${lesson} produced an invalid task.`);
      assert(typeof task.prompt === "string" && task.prompt.trim().length > 0, `Week ${week} Lesson ${lesson} produced a task without a prompt.`);
      lessonSamples += 1;
    }
  }
}

resetPrepWeek11TaskSessionState();
for (const lesson of [1, 2, 3] as const) {
  const expectedMode = lesson === 1 ? "identify_pattern" : lesson === 2 ? "continue_pattern" : "create_pattern";
  for (let sample = 0; sample < 12; sample += 1) {
    const task = generatePrepWeek11Task(`y0-w11-l${lesson}`, "hard");
    assert("mode" in task, `Week 11 Lesson ${lesson} did not create a pattern task.`);
    assert.equal(task.mode, expectedMode, `Week 11 Lesson ${lesson} misses the recognise-continue-create progression.`);
  }
}

for (let week = 1; week <= 12; week += 1) {
  const config = YEAR1_WEEKLY_QUIZZES.find((item) => item.week === week);
  const quiz = buildPrepNumberNexusWeeklyQuiz(week);
  assert(config, `Week ${week} quiz configuration is missing.`);
  assert.equal(config.totalQuestions, 15, `Week ${week} must configure 15 questions.`);
  assert.equal(config.questionsPerLesson, 5, `Week ${week} must configure five questions per lesson.`);
  assert.equal(config.passPercent, 80, `Week ${week} pass threshold must remain 80%.`);
  assert.equal(quiz.length, 15, `Week ${week} did not build exactly 15 questions.`);

  for (const lesson of [1, 2, 3] as const) {
    const lessonQuestions = quiz.filter((item) => item.lessonTag === lesson);
    const lessonMetadata = PREP_PROGRAM[week - 1]!.lessons.find((item) => item.lesson === lesson)!;
    assert.equal(lessonQuestions.length, 5, `Week ${week} Lesson ${lesson} did not contribute five questions.`);
    for (const item of lessonQuestions) {
      assert(!ids.has(item.id), `Duplicate Ground quiz ID: ${item.id}`);
      ids.add(item.id);
      assert(item.prompt.trim().length > 0 && item.prompt.trim().split(/\s+/).length <= 12, `${item.id} has an unsuitable Ground prompt.`);
      const lessonCodes = new Set<string>(lessonMetadata.curriculum);
      assert(item.descriptorCodes.length > 0 && item.descriptorCodes.every((code) => lessonCodes.has(code)), `${item.id} is not aligned to the lesson curriculum.`);
      if (item.kind === "typed") {
        assert(item.correctValue !== undefined && Number.isFinite(Number(item.correctValue)), `${item.id} has an invalid constructed answer.`);
      } else {
        assert(item.options && item.options.length >= 2, `${item.id} has too few options.`);
        assert.equal(new Set(item.options).size, item.options.length, `${item.id} has duplicate options.`);
        assert(Number.isInteger(item.correctIndex) && item.correctIndex! >= 0 && item.correctIndex! < item.options.length, `${item.id} has an invalid correct option.`);
      }
      quizChecks += 1;
    }
  }
}

const bankSource = fs.readFileSync(path.join(process.cwd(), "data/quizzes/prepNumberNexus.ts"), "utf8");
const visualSource = fs.readFileSync(path.join(process.cwd(), "components/quiz/GroundNumberNexusQuizVisual.tsx"), "utf8");
const sessionSource = fs.readFileSync(path.join(process.cwd(), "app/session/page.tsx"), "utf8");
assert(!/activities\/prep|programs\/prep|generatePrepWeek/.test(bankSource), "Ground weekly bank reuses lesson-native content.");
assert(sessionSource.includes('if (!isMeasurementRealm && year === "Prep")') && sessionSource.includes("buildPrepNumberNexusWeeklyQuiz(Number(week))"), "Ground production quiz routes do not use the independent bank.");
assert(sessionSource.includes("saveNumberWeeklyQuizAttempt(") && sessionSource.includes("questionResults: replayQuestionResults"), "Ground weekly quizzes do not use canonical attempt saving and replay snapshots.");
assert(sessionSource.includes("getRecommendedAssignedWeek(") && sessionSource.includes("p.requiredWeeks"), "Ground weekly progression does not honour the next required targeted week.");
assert(sessionSource.includes('isFinalQuizWeek ? "Continue to Post-Test"'), "The final Ground quiz does not present the Post-Test action.");
assert(sessionSource.includes("`/posttest?year=${encodeURIComponent(year)}${realmParam}`"), "The final Ground quiz does not route to the Post-Test.");
assert(!sessionSource.includes("Math.min(12, Number(week) + 1)"), "The final Ground quiz still attempts to unlock a non-existent week.");
assert(!visualSource.includes("rounded-2xl") && !visualSource.includes("rounded-3xl"), "Ground quiz visuals use legacy excessive rounding.");
assert(visualSource.includes("Star") && visualSource.includes("Bot") && visualSource.includes("Gem"), "Ground quiz visuals are missing the modern token system.");

const blueprint = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.find((item) => item.level === 0);
const posttest = getPosttestForYearLabel("Prep", "number")?.questions ?? [];
assert(blueprint?.descriptors.every((item) => item.curriculumMapping.implementationStatus === "aligned"), "Ground assessment blueprint is not aligned.");
assert.equal(posttest.length, 20, "Ground production Post-Test must contain 20 questions.");
assert(posttest.every((item) => item.strand === "Number and Algebra"), "Ground Post-Test contains out-of-realm content.");
assert(posttest.every((item) => typeof item.visual === "object" && item.visual !== null), "Every Ground Post-Test item must have a necessary visual.");
assert.equal(ASSESSMENT_THRESHOLDS.posttestPassPercent, 85, "Ground Post-Test threshold changed from 85%.");

console.log("Ground Number Nexus full-year audit passed.");
console.log(`Curriculum: 12/12 weeks, ${curriculumChecks}/36 lessons aligned.`);
console.log(`Lesson generation: ${lessonSamples}/${lessonSamples} sampled tasks valid.`);
console.log(`Weekly quizzes: 12/12 routes, ${quizChecks}/180 questions valid, exact 5-5-5, 80% pass threshold.`);
console.log(`Post-Test: ${posttest.length}/20 production questions valid, Number and Algebra only, 85% pass threshold.`);
