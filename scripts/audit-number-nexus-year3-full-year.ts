import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { YEAR1_WEEKLY_QUIZZES } from "../app/config/lesson-config";
import { buildLessonActivityPool, generateQuestion } from "../data/activities/year2/lessonEngine";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";
import { buildYear3NumberNexusWeeklyQuiz } from "../data/quizzes/year3NumberNexus";
import { YEAR3_PROGRAM } from "../data/programs/year3";
import { isLessonQuestionSafe } from "../lib/task-safety";

const expectedWeekCodes: Record<number, readonly string[]> = {
  1: ["AC9M3N01"],
  2: ["AC9M3N05"],
  3: ["AC9M3N03"],
  4: ["AC9M3N03"],
  5: ["AC9M3N03"],
  6: ["AC9M3N03", "AC9M3N05", "AC9M3N06"],
  7: ["AC9M3N04"],
  8: ["AC9M3N04"],
  9: ["AC9M3N06", "AC9M3M06"],
  10: ["AC9M3N07"],
  11: ["AC9M3N02"],
  12: ["AC9M3N02"],
};

let generated = 0;
let quizItems = 0;
const generatedModes = new Set<string>();
const fractionDenominators = new Set<number>();
const quizIds = new Set<string>();

assert.equal(YEAR3_PROGRAM.length, 12, "Level 3 must contain exactly 12 weeks.");
for (const week of YEAR3_PROGRAM) {
  assert.equal(week.lessons.length, 3, `Week ${week.week} must contain 3 lessons.`);
  assert.deepEqual([...week.curriculum].sort(), [...expectedWeekCodes[week.week]!].sort(), `Week ${week.week} curriculum metadata is incorrect.`);
  assert(week.curriculum.every((code) => !code.startsWith("AC9M3A")), `Week ${week.week} contains Algebra owned by Pattern Peaks.`);

  for (const lesson of week.lessons) {
    assert(lesson.curriculum.every((code) => week.curriculum.includes(code)), `${lesson.id} is outside its week curriculum.`);
    const pool = buildLessonActivityPool(3, lesson);
    assert.equal(pool.violations.length, 0, `${lesson.id}: ${pool.violations.map((item) => item.message).join(" | ")}`);
    assert(pool.activities.length >= 3, `${lesson.id} must provide at least 3 activities.`);
    for (const activity of pool.activities) {
      for (let sample = 0; sample < 12; sample += 1) {
        const question = generateQuestion(3, lesson, activity);
        assert(isLessonQuestionSafe(activity, question), `${lesson.id} generated an unsafe ${activity.activityType} question.`);
        assert("prompt" in question && question.prompt.trim().length > 0, `${lesson.id} generated a blank prompt.`);
        if ("mode" in question && typeof question.mode === "string") generatedModes.add(question.mode);
        if (week.week === 1 && "target" in question && typeof question.target === "number") {
          assert(question.target > 10_000, `${lesson.id} generated ${question.target}, which is not beyond 10 000.`);
        }
        if (lesson.id === "y3-w1-l2" && activity.activityType === "typed_response" && question.kind === "typed_response") {
          assert.match(question.prompt, /^Regroup 1 hundred as 10 tens in [\d,]+\. How many tens now\?$/);
          assert.equal(question.helper, undefined, `${lesson.id} reveals the regrouping calculation before the student answers.`);
        }
        if (week.week === 9 && question.kind === "mixed_word_problem") {
          assert(question.visual, `${lesson.id} generated a money task without a visual.`);
          assert.equal(question.showStrategyClue, false, `${lesson.id} reveals a strategy clue.`);
        }
        if ((week.week === 11 || week.week === 12) && "denominator" in question && typeof question.denominator === "number") {
          fractionDenominators.add(question.denominator);
        }
        generated += 1;
      }
    }
  }
}

assert(generatedModes.has("quantity_estimation"), "Week 2 does not estimate a collection.");
assert(generatedModes.has("money_equivalence"), "Week 9 does not represent dollar-cent equivalence.");
assert(generatedModes.has("algorithm_follow") && generatedModes.has("algorithm_decision") && generatedModes.has("algorithm_create"), "Week 10 does not cover all algorithm modes.");

for (let week = 1; week <= 12; week += 1) {
  const quiz = buildYear3NumberNexusWeeklyQuiz(week);
  const config = YEAR1_WEEKLY_QUIZZES.find((item) => item.week === week);
  const programWeek = YEAR3_PROGRAM[week - 1]!;
  assert(config, `Week ${week} quiz config is missing.`);
  assert.equal(config.totalQuestions, 15, `Week ${week} must configure 15 quiz questions.`);
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
    assert(!item.descriptorCodes.some((code) => code.startsWith("AC9M3A")), `${item.id} assesses Algebra owned by Pattern Peaks.`);
    assert(item.prompt.trim(), `${item.id} has a blank prompt.`);
    if (item.kind === "mcq") {
      assert(item.options && item.options.length >= 3, `${item.id} has too few options.`);
      assert.equal(new Set(item.options).size, item.options.length, `${item.id} has duplicate options.`);
      assert(Number.isInteger(item.correctIndex) && item.correctIndex! >= 0 && item.correctIndex! < item.options.length, `${item.id} has an invalid answer index.`);
    } else {
      assert(item.correctValue && Number.isFinite(Number(item.correctValue)), `${item.id} has an invalid constructed answer.`);
    }
    quizItems += 1;
  }

  if (week === 2) assert(quiz.slice(0, 5).every((item) => item.visual?.type === "dots"), "Week 2 collection-estimation quiz items require collection visuals.");
  if (week === 1) {
    const numeralWritingItems = quiz.filter((item) => item.lessonTag === 1);
    assert(numeralWritingItems.every((item) => item.kind === "typed"), "Week 1 Lesson 1 must require independently written numerals.");
    assert(numeralWritingItems.every((item) => !/\d/.test(item.prompt)), "Week 1 Lesson 1 must show the complete number in words without numeral clues.");
  }
  if (week === 9) assert(quiz.some((item) => item.visual?.type === "money"), "Week 9 quiz omits Australian money visuals.");
  if (week === 10) assert(quiz.some((item) => item.prompt.includes("If the input is even")), "Week 10 quiz omits decision algorithms.");
  if (week === 11 || week === 12) assert(quiz.some((item) => item.visual?.type === "fraction"), `Week ${week} quiz omits fraction visuals.`);
}

const blueprint = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.find((item) => item.level === 3);
assert(blueprint, "Level 3 assessment blueprint is missing.");
assert(blueprint.descriptors.every((item) => item.curriculumMapping.implementationStatus === "aligned"), "Level 3 blueprint still contains a curriculum gap.");
assert.equal(blueprint.releaseBlocked, true, "Assessment generation must remain blocked until the independent bank phase.");
assert.equal(blueprint.crossRealmCoverage?.[0]?.implementationStatus, "owned-by-pattern-peaks", "The Algebra boundary is not finalised.");

const sessionSource = fs.readFileSync(path.join(process.cwd(), "app/session/page.tsx"), "utf8");
const engineSource = fs.readFileSync(path.join(process.cwd(), "components/lesson/Year2LessonEngine.tsx"), "utf8");
const globalStyles = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");
const assessmentShellSource = fs.readFileSync(path.join(process.cwd(), "components/assessment/AssessmentShell.tsx"), "utf8");
const assessmentQuestionSource = fs.readFileSync(path.join(process.cwd(), "components/assessment/AssessmentQuestionCard.tsx"), "utf8");
assert(sessionSource.includes("buildYear3NumberNexusWeeklyQuiz"), "Level 3 quiz route does not use the independent bank.");
assert(sessionSource.includes("isLevelThreeNumberQuiz"), "Level 3 quiz route does not use modern presentation.");
assert(sessionSource.includes('isFinalQuizWeek ? "Continue to Post-Test"'), "Final-week quiz does not use the Post-Test action.");
assert(!sessionSource.includes("Math.min(12, Number(week) + 1)"), "Final-week quiz can attempt to unlock Week 13.");
assert(engineSource.includes("number-nexus-level-three"), "Level 3 lesson engine does not expose modern presentation scope.");
assert(globalStyles.includes(".number-nexus-level-three .rounded-2xl"), "Level 3 legacy cards are not normalised to the modern radius system.");
assert(assessmentShellSource.includes('year === "Year 3"'), "Level 3 assessments do not use the modern Number Nexus shell.");
assert(assessmentQuestionSource.includes('question.id?.startsWith("y3-a-")'), "Level 3 Pre-Test items do not use modern response controls.");
assert(assessmentQuestionSource.includes('question.id?.startsWith("y3-b-")'), "Level 3 Post-Test items do not use modern response controls.");
assert(assessmentQuestionSource.includes('aria-label="Clear fraction order"'), "Level 3 fraction ordering has not been modernised.");

console.log("Level 3 Number Nexus full-year audit passed.");
console.log("Curriculum: 12/12 weeks and 36/36 lessons aligned; Algebra owned by Pattern Peaks.");
console.log(`Lesson experience: ${generated}/${generated} generated questions valid.`);
console.log(`Weekly quizzes: 12/12 routes and ${quizItems}/180 questions valid; exact 5-5-5; 80% pass threshold.`);
console.log("Assessment blueprint: curriculum-ready; independent Pre/Post bank intentionally remains blocked for the next phase.");
