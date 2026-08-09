import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { YEAR1_WEEKLY_QUIZZES } from "../app/config/lesson-config";
import { buildLessonActivityPool, generateQuestion } from "../data/activities/year2/lessonEngine";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";
import { buildYear5NumberNexusWeeklyQuiz } from "../data/quizzes/year5NumberNexus";
import { YEAR5_PROGRAM } from "../data/programs/year5";
import { isLessonQuestionSafe } from "../lib/task-safety";

const expectedWeekCodes: Record<number, readonly string[]> = {
  1: ["AC9M5N01", "AC9M5N08", "AC9M5N09"],
  2: ["AC9M5N01", "AC9M5N08", "AC9M5N09"],
  3: ["AC9M5N02", "AC9M5N10"],
  4: ["AC9M5N02", "AC9M5N10"],
  5: ["AC9M5N06", "AC9M5N08"],
  6: ["AC9M5N07", "AC9M5N08"],
  7: ["AC9M5N03"],
  8: ["AC9M5N05"],
  9: ["AC9M5N04"],
  10: ["AC9M5N04"],
  11: ["AC9M5N08", "AC9M5N09"],
  12: ["AC9M5N01", "AC9M5N02", "AC9M5N03", "AC9M5N04", "AC9M5N05", "AC9M5N06", "AC9M5N07", "AC9M5N08", "AC9M5N09", "AC9M5N10"],
};

const descriptorSet = new Set<string>();
const quizIds = new Set<string>();
let generated = 0;
let quizItems = 0;

assert.equal(YEAR5_PROGRAM.length, 12, "Level 5 must contain exactly 12 weeks.");
for (const week of YEAR5_PROGRAM) {
  assert.equal(week.lessons.length, 3, `Week ${week.week} must contain exactly 3 lessons.`);
  assert.deepEqual([...week.curriculum].sort(), [...expectedWeekCodes[week.week]!].sort(), `Week ${week.week} curriculum metadata is incorrect.`);
  assert(week.curriculum.every((code) => code.startsWith("AC9M5N")), `Week ${week.week} contains content outside Year 5 Number.`);

  for (const code of week.curriculum) descriptorSet.add(code);
  for (const lesson of week.lessons) {
    assert(lesson.curriculum.every((code) => week.curriculum.includes(code)), `${lesson.id} is outside its week curriculum.`);
    assert(lesson.curriculum.every((code) => code.startsWith("AC9M5N")), `${lesson.id} contains Algebra or another realm.`);
    const pool = buildLessonActivityPool(5, lesson);
    assert.equal(pool.violations.length, 0, `${lesson.id}: ${pool.violations.map((item) => item.message).join(" | ")}`);
    assert(pool.activities.length >= 3, `${lesson.id} must provide at least 3 activities.`);

    for (const activity of pool.activities) {
      for (let sample = 0; sample < 8; sample += 1) {
        const question = generateQuestion(5, lesson, activity);
        assert(isLessonQuestionSafe(activity, question), `${lesson.id} generated an unsafe ${activity.activityType} question.`);
        assert("prompt" in question && question.prompt.trim().length > 0, `${lesson.id} generated a blank prompt.`);
        assert((question.prompt.match(/\?/g) ?? []).length <= 1, `${lesson.id} generated more than one question in a prompt: ${question.prompt}`);
        assert(question.prompt.trim().split(/\s+/).length <= 34, `${lesson.id} generated an overly long prompt: ${question.prompt}`);
        if (question.kind === "multiple_choice") {
          assert(question.options.length >= 2, `${lesson.id} generated too few answer options.`);
          assert.equal(new Set(question.options).size, question.options.length, `${lesson.id} generated duplicate answer options.`);
          assert(question.options.includes(question.answer), `${lesson.id} generated an answer that is missing from its options: ${question.prompt}`);
        }
        if (week.week === 10) {
          assert(!/discount|sale price|percentage of|% of|find \d+% of/i.test(question.prompt), `${lesson.id} leaks Year 6 percentage-of-quantity content: ${question.prompt}`);
        }
        generated += 1;
      }
    }
  }
}

assert.deepEqual(
  [...descriptorSet].sort(),
  Array.from({ length: 10 }, (_, index) => `AC9M5N${String(index + 1).padStart(2, "0")}`),
  "Level 5 does not cover every official Year 5 Number descriptor.",
);

for (let week = 1; week <= 12; week += 1) {
  const quiz = buildYear5NumberNexusWeeklyQuiz(week);
  const config = YEAR1_WEEKLY_QUIZZES.find((item) => item.week === week);
  const programWeek = YEAR5_PROGRAM[week - 1]!;
  assert(config, `Week ${week} quiz config is missing.`);
  assert.equal(config.totalQuestions, 15, `Week ${week} must configure 15 questions.`);
  assert.equal(config.questionsPerLesson, 5, `Week ${week} must configure a 5-5-5 split.`);
  assert.equal(config.passPercent, 80, `Week ${week} pass threshold must be 80%.`);
  assert.equal(quiz.length, 15, `Week ${week} did not build 15 questions.`);

  for (const lessonTag of [1, 2, 3] as const) {
    const lesson = programWeek.lessons[lessonTag - 1]!;
    const items = quiz.filter((item) => item.lessonTag === lessonTag);
    assert.equal(items.length, 5, `Week ${week} Lesson ${lessonTag} did not contribute 5 questions.`);
    for (const item of items) {
      assert(item.descriptorCodes.every((code) => lesson.curriculum.some((lessonCode) => lessonCode === code)), `${item.id} is not aligned with ${lesson.id}.`);
    }
  }

  for (const item of quiz) {
    assert(!quizIds.has(item.id), `Duplicate quiz ID: ${item.id}`);
    quizIds.add(item.id);
    assert(item.prompt.trim(), `${item.id} has a blank prompt.`);
    assert(item.prompt.trim().split(/\s+/).length <= 28, `${item.id} is too wordy: ${item.prompt}`);
    assert(item.descriptorCodes.every((code) => code.startsWith("AC9M5N")), `${item.id} contains out-of-realm content.`);
    if (week === 10) {
      assert(!/discount|sale price|percentage of|% of|find \d+% of/i.test(item.prompt), `${item.id} leaks Year 6 percentage-of-quantity content.`);
    }
    if (item.kind === "mcq") {
      assert(item.options && item.options.length >= 3, `${item.id} has too few options.`);
      assert.equal(new Set(item.options).size, item.options.length, `${item.id} has duplicate options.`);
      assert(Number.isInteger(item.correctIndex) && item.correctIndex! >= 0 && item.correctIndex! < item.options.length, `${item.id} has an invalid answer index.`);
    } else {
      assert(item.correctValue && Number.isFinite(Number(item.correctValue)), `${item.id} has an invalid constructed answer.`);
    }
    quizItems += 1;
  }
}

assert.throws(() => buildYear5NumberNexusWeeklyQuiz(13), /week from 1 to 12/, "The quiz bank accepts a non-existent Week 13.");

const blueprint = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.find((item) => item.level === 5);
assert(blueprint, "Level 5 assessment blueprint is missing.");
assert.equal(blueprint.descriptors.length, 10, "Level 5 blueprint must contain AC9M5N01-AC9M5N10.");
assert(blueprint.descriptors.every((item) => item.curriculumMapping.implementationStatus === "aligned"), "Level 5 blueprint still contains a curriculum gap.");
assert.equal(blueprint.releaseBlocked, true, "Independent assessment generation must remain blocked until the assessment phase.");
assert.equal(blueprint.crossRealmCoverage?.[0]?.implementationStatus, "owned-by-pattern-peaks", "Level 5 Algebra ownership is not finalised.");

const sessionSource = fs.readFileSync(path.join(process.cwd(), "app/session/page.tsx"), "utf8");
const engineSource = fs.readFileSync(path.join(process.cwd(), "components/lesson/Year2LessonEngine.tsx"), "utf8");
const globalStyles = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");
assert(sessionSource.includes("buildYear5NumberNexusWeeklyQuiz(Number(week))"), "Level 5 does not use the independent quiz bank.");
assert(sessionSource.includes("isLevelFiveNumberQuiz"), "Level 5 quizzes do not use modern presentation.");
assert(sessionSource.includes('isFinalQuizWeek ? "Continue to Post-Test"'), "Final-week quiz does not route to the Post-Test.");
assert(!sessionSource.includes("Math.min(12, Number(week) + 1)"), "Final-week quiz can attempt to unlock Week 13.");
assert(engineSource.includes("number-nexus-level-five"), "Level 5 lessons do not expose modern presentation scope.");
assert(globalStyles.includes(".number-nexus-level-five .rounded-2xl"), "Level 5 legacy cards are not normalised to the modern radius system.");

console.log("Level 5 Number Nexus full-year audit passed.");
console.log("Curriculum: 12/12 weeks and 36/36 lessons aligned to AC9M5N01-AC9M5N10; Algebra owned by Pattern Peaks.");
console.log(`Lesson experience: ${generated}/${generated} generated questions valid.`);
console.log(`Weekly quizzes: 12/12 routes and ${quizItems}/180 questions valid; exact 5-5-5; 80% pass threshold; no Week 13.`);
console.log("Presentation: Level 5 lessons and weekly quizzes use the modern Number Nexus scope.");
console.log("Assessment blueprint: curriculum-ready; independent Pre/Post bank remains the next phase.");
