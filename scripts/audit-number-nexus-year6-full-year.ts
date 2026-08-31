import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { YEAR1_WEEKLY_QUIZZES } from "../app/config/lesson-config";
import {
  buildLessonActivityPool,
  generateQuestion,
  getLevelForLesson,
  YEAR6_EQUIVALENT_VISUAL_STRICT_TEMPLATES,
} from "../data/activities/year2/lessonEngine";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";
import { getYear6WeeklyQuiz } from "../data/quizzes/year6";
import { YEAR6_PROGRAM } from "../data/programs/year6";
import { hasRequiredRelationshipVisual } from "../lib/relationship-visual";
import { isLessonQuestionSafe } from "../lib/task-safety";

const expectedWeekCodes: Record<number, readonly string[]> = {
  1: ["AC9M6N04", "AC9M6N08"],
  2: ["AC9M6N02"],
  3: ["AC9M6N06", "AC9M6N08"],
  4: ["AC9M6N01"],
  5: ["AC9M6N03"],
  6: ["AC9M6N05"],
  7: ["AC9M6N07"],
  8: ["AC9M6N07", "AC9M6N08", "AC9M6N09"],
  9: ["AC9M6N03", "AC9M6N04", "AC9M6N07", "AC9M6N08"],
  10: ["AC9M6N01"],
  11: ["AC9M6N07", "AC9M6N08", "AC9M6N09"],
  12: ["AC9M6N01", "AC9M6N02", "AC9M6N03", "AC9M6N04", "AC9M6N05", "AC9M6N06", "AC9M6N07", "AC9M6N08", "AC9M6N09"],
};

const forbiddenAlgebra = /\b(?:algebra|function machine|substitution|solve the equation|unknown value|bracket equation|input-output rule|nth term)\b/i;
const descriptorSet = new Set<string>();
const quizIds = new Set<string>();
let generated = 0;
let quizItems = 0;

assert.equal(YEAR6_PROGRAM.length, 12, "Level 6 must contain exactly 12 weeks.");
for (const template of YEAR6_EQUIVALENT_VISUAL_STRICT_TEMPLATES) {
  const mathematicallyEquivalent =
    template.left.numerator * template.right.denominator ===
    template.right.numerator * template.left.denominator;
  assert.equal(
    mathematicallyEquivalent,
    template.barsEquivalent,
    `Equivalent-fraction visual is mathematically inconsistent: ${template.prompt}`,
  );
  if (!template.prompt.startsWith("A student says")) {
    assert.equal(
      template.answer,
      mathematicallyEquivalent ? "yes" : "no",
      `Equivalent-fraction answer key is incorrect: ${template.prompt}`,
    );
  }
}
for (const week of YEAR6_PROGRAM) {
  assert.equal(week.lessons.length, 3, `Week ${week.week} must contain exactly 3 lessons.`);
  assert.deepEqual([...week.curriculum].sort(), [...expectedWeekCodes[week.week]!].sort(), `Week ${week.week} curriculum metadata is incorrect.`);
  assert(week.curriculum.every((code) => /^AC9M6N0[1-9]$/.test(code)), `Week ${week.week} contains content outside Year 6 Number.`);

  for (const code of week.curriculum) descriptorSet.add(code);
  for (const lesson of week.lessons) {
    assert(lesson.curriculum.every((code) => week.curriculum.includes(code)), `${lesson.id} is outside its week curriculum.`);
    assert(lesson.curriculum.every((code) => /^AC9M6N0[1-9]$/.test(code)), `${lesson.id} contains Algebra or another realm.`);
    assert(!forbiddenAlgebra.test(`${lesson.title} ${lesson.activityIdeas.join(" ")}`), `${lesson.id} contains Algebra language.`);
    const engineLevel = getLevelForLesson(lesson);
    assert.equal(engineLevel, 5, `${lesson.id} does not use the supported upper-primary generator contract.`);
    const pool = buildLessonActivityPool(engineLevel, lesson);
    assert.equal(pool.violations.length, 0, `${lesson.id}: ${pool.violations.map((item) => item.message).join(" | ")}`);
    assert(pool.activities.length >= 3, `${lesson.id} must provide at least 3 activities.`);

    for (const activity of pool.activities) {
      for (let sample = 0; sample < 8; sample += 1) {
        let question: ReturnType<typeof generateQuestion>;
        try {
          question = generateQuestion(engineLevel, lesson, activity);
        } catch (error) {
          const mode = typeof activity.config?.mode === "string" ? activity.config.mode : "unknown";
          throw new Error(`${lesson.id} failed to generate mode ${mode}: ${error instanceof Error ? error.message : String(error)}`);
        }
        assert(isLessonQuestionSafe(activity, question), `${lesson.id} generated an unsafe ${activity.activityType} question.`);
        assert("prompt" in question && question.prompt.trim().length > 0, `${lesson.id} generated a blank prompt.`);
        assert(!forbiddenAlgebra.test(question.prompt), `${lesson.id} generated Algebra content: ${question.prompt}`);
        if (question.kind === "multiple_choice" || question.kind === "typed_response") {
          assert(hasRequiredRelationshipVisual(question.prompt, question.visual?.type, question.kind), `${lesson.id} generated a question rejected by the live relationship-visual gate: ${question.prompt}`);
        }
        assert((question.prompt.match(/\?/g) ?? []).length <= 1, `${lesson.id} generated more than one question in a prompt: ${question.prompt}`);
        assert(question.prompt.trim().split(/\s+/).length <= 34, `${lesson.id} generated an overly long prompt: ${question.prompt}`);
        if (question.kind === "multiple_choice") {
          assert(question.options.length >= 2, `${lesson.id} generated too few answer options.`);
          assert.equal(new Set(question.options).size, question.options.length, `${lesson.id} generated duplicate answer options.`);
          assert(question.options.includes(question.answer), `${lesson.id} generated an answer missing from its options.`);
        }
        generated += 1;
      }
    }
  }
}

assert.deepEqual([...descriptorSet].sort(), Array.from({ length: 9 }, (_, index) => `AC9M6N0${index + 1}`), "Level 6 does not cover every official Year 6 Number descriptor.");

for (let week = 1; week <= 12; week += 1) {
  const quiz = getYear6WeeklyQuiz(week);
  const config = YEAR1_WEEKLY_QUIZZES.find((item) => item.week === week);
  const programWeek = YEAR6_PROGRAM[week - 1]!;
  assert(quiz, `Week ${week} quiz is missing.`);
  assert(config, `Week ${week} quiz config is missing.`);
  assert.equal(config.totalQuestions, 15, `Week ${week} must configure 15 questions.`);
  assert.equal(config.questionsPerLesson, 5, `Week ${week} must configure a 5-5-5 split.`);
  assert.equal(config.passPercent, 80, `Week ${week} pass threshold must be 80%.`);
  assert.equal(quiz.questions.length, 15, `Week ${week} did not build 15 questions.`);
  assert.equal(quiz.lesson1Title, programWeek.lessons[0]!.title, `Week ${week} Lesson 1 quiz title is stale.`);
  assert.equal(quiz.lesson2Title, programWeek.lessons[1]!.title, `Week ${week} Lesson 2 quiz title is stale.`);
  assert.equal(quiz.lesson3Title, programWeek.lessons[2]!.title, `Week ${week} Lesson 3 quiz title is stale.`);

  for (const lessonTag of [1, 2, 3] as const) {
    assert.equal(quiz.questions.filter((item) => item.lessonTag === lessonTag).length, 5, `Week ${week} Lesson ${lessonTag} did not contribute 5 questions.`);
  }
  for (const item of quiz.questions) {
    assert(!quizIds.has(item.id), `Duplicate quiz ID: ${item.id}`);
    quizIds.add(item.id);
    assert(item.questionText.trim(), `${item.id} has a blank prompt.`);
    assert(item.questionText.trim().split(/\s+/).length <= 28, `${item.id} is too wordy: ${item.questionText}`);
    assert(!forbiddenAlgebra.test(item.questionText), `${item.id} contains Algebra content.`);
    if (item.answerType === "multipleChoice") {
      assert(item.options && item.options.length >= 2, `${item.id} has too few options.`);
      assert.equal(new Set(item.options).size, item.options.length, `${item.id} has duplicate options.`);
      assert(item.options.includes(item.correctAnswer), `${item.id} answer is not in its options.`);
    } else if (item.answerType === "ordering") {
      assert(item.values && item.correctOrder && item.values.length === item.correctOrder.length, `${item.id} has an invalid ordering answer.`);
    } else {
      assert(item.correctAnswer.trim(), `${item.id} has an invalid constructed answer.`);
    }
    quizItems += 1;
  }
}

assert.equal(getYear6WeeklyQuiz(13), null, "The quiz bank accepts a non-existent Week 13.");
const blueprint = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.find((item) => item.level === 6);
assert(blueprint, "Level 6 assessment blueprint is missing.");
assert.equal(blueprint.descriptors.length, 9, "Level 6 blueprint must contain AC9M6N01-AC9M6N09.");
assert(blueprint.descriptors.every((item) => item.curriculumMapping.implementationStatus === "aligned"), "Level 6 blueprint contains a curriculum gap.");
assert.equal(blueprint.crossRealmCoverage?.[0]?.implementationStatus, "owned-by-pattern-peaks", "Level 6 Algebra ownership is not finalised.");
assert.equal(blueprint.releaseBlocked, true, "Assessment release must remain blocked until its independent bank is approved.");

const sessionSource = fs.readFileSync(path.join(process.cwd(), "app/session/page.tsx"), "utf8");
assert(sessionSource.includes("getYear6WeeklyQuiz(weekNumber)"), "Level 6 does not use its explicit weekly quiz bank.");
assert(sessionSource.includes("isLevelSixNumberQuiz"), "Level 6 weekly quizzes do not use modern presentation.");
assert(sessionSource.includes('isFinalQuizWeek ? "Continue to Post-Test"'), "Final-week quiz does not route to the Post-Test.");
assert(!sessionSource.includes("Math.min(12, Number(week) + 1)"), "Final-week quiz can attempt to unlock Week 13.");

console.log("Level 6 Number Nexus full-year audit passed.");
console.log("Curriculum: 12/12 weeks and 36/36 lessons aligned to AC9M6N01-AC9M6N09; Algebra owned by Pattern Peaks.");
console.log(`Lesson experience: ${generated}/${generated} generated questions valid.`);
console.log(`Weekly quizzes: 12/12 routes and ${quizItems}/180 questions valid; exact 5-5-5; 80% pass threshold; no Week 13.`);
console.log("Presentation: Level 6 lessons and weekly quizzes use the modern Number Nexus scope.");
console.log("Assessment blueprint: curriculum-ready; independent Pre/Post generation remains blocked pending implementation and educator approval.");
