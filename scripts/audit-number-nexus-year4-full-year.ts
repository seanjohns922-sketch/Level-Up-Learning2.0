import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { YEAR1_WEEKLY_QUIZZES } from "../app/config/lesson-config";
import { buildLessonActivityPool, generateQuestion } from "../data/activities/year2/lessonEngine";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";
import { buildYear4NumberNexusWeeklyQuiz } from "../data/quizzes/year4NumberNexus";
import { YEAR4_PROGRAM } from "../data/programs/year4";
import { isLessonQuestionSafe } from "../lib/task-safety";

const expectedWeekCodes: Record<number, readonly string[]> = {
  1: ["AC9M4N01"],
  2: ["AC9M4N01"],
  3: ["AC9M4N02"],
  4: ["AC9M4N05"],
  5: ["AC9M4N06"],
  6: ["AC9M4N06"],
  7: ["AC9M4N07"],
  8: ["AC9M4N08"],
  9: ["AC9M4N03"],
  10: ["AC9M4N04"],
  11: ["AC9M4N09"],
  12: ["AC9M4N03", "AC9M4N04", "AC9M4N05", "AC9M4N06", "AC9M4N07", "AC9M4N08", "AC9M4N09"],
};

const generatedModes = new Set<string>();
const quizIds = new Set<string>();
let generated = 0;
let quizItems = 0;

assert.equal(YEAR4_PROGRAM.length, 12, "Level 4 must contain exactly 12 weeks.");
for (const week of YEAR4_PROGRAM) {
  assert.equal(week.lessons.length, 3, `Week ${week.week} must contain exactly 3 lessons.`);
  assert.deepEqual([...week.curriculum].sort(), [...expectedWeekCodes[week.week]!].sort(), `Week ${week.week} curriculum metadata is incorrect.`);
  assert(week.curriculum.every((code) => code.startsWith("AC9M4N")), `Week ${week.week} contains content outside Year 4 Number.`);

  for (const lesson of week.lessons) {
    assert(lesson.curriculum.every((code) => week.curriculum.includes(code)), `${lesson.id} is outside its week curriculum.`);
    const pool = buildLessonActivityPool(4, lesson);
    assert.equal(pool.violations.length, 0, `${lesson.id}: ${pool.violations.map((item) => item.message).join(" | ")}`);
    assert(pool.activities.length >= 3, `${lesson.id} must provide at least 3 activities.`);
    for (const activity of pool.activities) {
      for (let sample = 0; sample < 8; sample += 1) {
        const question = generateQuestion(4, lesson, activity);
        assert(isLessonQuestionSafe(activity, question), `${lesson.id} generated an unsafe ${activity.activityType} question.`);
        assert("prompt" in question && question.prompt.trim().length > 0, `${lesson.id} generated a blank prompt.`);
        if ("mode" in question && typeof question.mode === "string") generatedModes.add(question.mode);
        if (week.week === 11 && question.kind === "skip_count") {
          assert(question.algorithmSteps?.length === 3, `${lesson.id} did not generate a complete algorithm.`);
          assert(question.algorithmPattern?.length === 4, `${lesson.id} did not generate four outputs.`);
        }
        generated += 1;
      }
    }
  }
}

assert(generatedModes.has("algorithm_follow"), "Week 11 does not generate algorithm-follow tasks.");
assert(generatedModes.has("algorithm_create"), "Week 11 does not generate algorithm-creation tasks.");

for (let week = 1; week <= 12; week += 1) {
  const quiz = buildYear4NumberNexusWeeklyQuiz(week);
  const config = YEAR1_WEEKLY_QUIZZES.find((item) => item.week === week);
  const programWeek = YEAR4_PROGRAM[week - 1]!;
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
    assert(item.descriptorCodes.every((code) => code.startsWith("AC9M4N")), `${item.id} contains out-of-realm content.`);
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

assert.throws(() => buildYear4NumberNexusWeeklyQuiz(13), /week from 1 to 12/, "The quiz bank accepts a non-existent Week 13.");

const blueprint = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.find((item) => item.level === 4);
assert(blueprint, "Level 4 assessment blueprint is missing.");
assert(blueprint.descriptors.every((item) => item.curriculumMapping.implementationStatus === "aligned"), "Level 4 blueprint still contains a curriculum gap.");
assert.equal(blueprint.releaseBlocked, true, "Independent assessment generation must remain blocked until the next phase.");
assert.equal(blueprint.crossRealmCoverage?.[0]?.implementationStatus, "owned-by-pattern-peaks", "Level 4 Algebra ownership is not finalised.");

const sessionSource = fs.readFileSync(path.join(process.cwd(), "app/session/page.tsx"), "utf8");
const engineSource = fs.readFileSync(path.join(process.cwd(), "components/lesson/Year2LessonEngine.tsx"), "utf8");
const globalStyles = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");
assert(sessionSource.includes("buildYear4NumberNexusWeeklyQuiz(Number(week))"), "Level 4 does not use the independent quiz bank.");
assert(sessionSource.includes("isLevelFourNumberQuiz"), "Level 4 quiz does not use modern presentation.");
assert(sessionSource.includes('isFinalQuizWeek ? "Continue to Post-Test"'), "Final-week quiz does not route to the Post-Test.");
assert(!sessionSource.includes("Math.min(12, Number(week) + 1)"), "Final-week quiz can attempt to unlock Week 13.");
assert(engineSource.includes("number-nexus-level-four"), "Level 4 lessons do not expose modern presentation scope.");
assert(globalStyles.includes(".number-nexus-level-four .rounded-2xl"), "Level 4 legacy cards are not normalised to the modern radius system.");

console.log("Level 4 Number Nexus full-year audit passed.");
console.log("Curriculum: 12/12 weeks and 36/36 lessons aligned to AC9M4N01-AC9M4N09; Algebra owned by Pattern Peaks.");
console.log(`Lesson experience: ${generated}/${generated} generated questions valid.`);
console.log(`Weekly quizzes: 12/12 routes and ${quizItems}/180 questions valid; exact 5-5-5; 80% pass threshold; no Week 13.`);
console.log("Assessment blueprint: curriculum-ready; independent Pre/Post validation runs in the dedicated bank audit.");
