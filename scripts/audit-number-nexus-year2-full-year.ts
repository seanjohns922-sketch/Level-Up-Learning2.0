import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { YEAR1_WEEKLY_QUIZZES } from "../app/config/lesson-config";
import {
  buildYear2LessonActivityPool,
  generateYear2Question,
  getLessonQuestionFingerprint,
} from "../data/activities/year2/lessonEngine";
import { getPosttestForYearLabel, getPretestForYearLabel } from "../data/assessments/api";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";
import { buildYear2NumberNexusWeeklyQuiz } from "../data/quizzes/year2NumberNexus";
import { year2Number } from "../data/programs/year2Number";
import { ASSESSMENT_THRESHOLDS } from "../lib/assessment-rules";
import { isLessonQuestionSafe } from "../lib/task-safety";

const expectedWeekCodes: Record<number, readonly string[]> = {
  1: ["AC9M2N01"],
  2: ["AC9M2N02"],
  3: ["AC9M2N01", "AC9M2N02"],
  4: ["AC9M2A02"],
  5: ["AC9M2N04"],
  6: ["AC9M2N04"],
  7: ["AC9M2N04", "AC9M2A02"],
  8: ["AC9M2A01", "AC9M2A03", "AC9M2N05"],
  9: ["AC9M2N05"],
  10: ["AC9M2N05", "AC9M2A03"],
  11: ["AC9M2N06"],
  12: ["AC9M2N03"],
};
const allowedCodes = new Set(Object.values(expectedWeekCodes).flat());
let curriculumChecks = 0;
let generatedQuestions = 0;
let quizChecks = 0;
const weekEightPatternModes = new Set<string>();
const weekEightCreationRepresentations = new Set<string>();
const weekElevenOperations = new Set<string>();
const weekTwelveHalvingTargets = new Set<number>();

assert.equal(year2Number.length, 12, "Level 2 must contain exactly 12 weeks.");
for (const week of year2Number) {
  assert.deepEqual([...week.curriculum].sort(), [...expectedWeekCodes[week.week]!].sort(), `Week ${week.week} curriculum metadata is incorrect.`);
  assert.equal(week.lessons.length, 3, `Week ${week.week} must contain three lessons.`);
  assert(week.curriculum.every((code) => allowedCodes.has(code)), `Week ${week.week} contains an out-of-realm descriptor.`);

  for (const lesson of week.lessons) {
    assert(lesson.curriculum.length > 0, `${lesson.id} has no curriculum metadata.`);
    assert(lesson.curriculum.every((code) => week.curriculum.includes(code)), `${lesson.id} is outside its week curriculum.`);
    const pool = buildYear2LessonActivityPool(lesson);
    assert.equal(pool.violations.length, 0, `${lesson.id} has policy violations: ${pool.violations.map((item) => item.message).join(" | ")}`);
    assert(pool.activities.length >= 3, `${lesson.id} must provide at least three lesson activities.`);

    const lessonFingerprints = new Set<string>();
    for (const activity of pool.activities) {
      for (let sample = 0; sample < 30; sample += 1) {
        let question: ReturnType<typeof generateYear2Question>;
        try {
          question = generateYear2Question(lesson, activity);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`${lesson.id} ${activity.activityType} sample ${sample + 1}: ${message}`);
        }
        assert(isLessonQuestionSafe(activity, question), `${lesson.id} generated an unsafe ${activity.activityType} question.`);
        assert("prompt" in question && question.prompt.trim().length > 0, `${lesson.id} generated a question without a prompt.`);
        if (lesson.week === 8 && question.kind === "skip_count") {
          weekEightPatternModes.add(question.mode);
          if (question.mode === "create" && question.representation) {
            weekEightCreationRepresentations.add(question.representation);
            assert.equal(question.expectedSequence?.length, 3, `${lesson.id} does not require construction of 3 new pattern terms.`);
          }
        }
        if (lesson.week === 12 && question.kind === "area_model_select" && question.mode === "repeated_halving") {
          weekTwelveHalvingTargets.add(question.halvingTarget ?? question.denominator);
          assert(question.connectionAnswer, `${lesson.id} repeated-halving task has no fraction connection answer.`);
          assert(question.connectionOptions?.includes(question.connectionAnswer), `${lesson.id} repeated-halving task omits its correct connection option.`);
        }
        if (lesson.week === 11 && question.kind === "mixed_word_problem" && question.correctOperation) {
          weekElevenOperations.add(question.correctOperation);
          assert(question.operationChoices?.includes(question.correctOperation), `${lesson.id} does not ask students to choose the required operation.`);
          assert.equal(question.showStrategyClue, false, `${lesson.id} reveals its strategy before the student answers.`);
        }
        lessonFingerprints.add(getLessonQuestionFingerprint(activity, question).fingerprint);
        generatedQuestions += 1;
      }
    }
    assert(lessonFingerprints.size >= 3, `${lesson.id} does not generate enough question variation.`);
    curriculumChecks += 1;
  }
}
assert(weekEightPatternModes.has("forward") && weekEightPatternModes.has("backward") && weekEightPatternModes.has("missing") && weekEightPatternModes.has("create"), "Week 8 does not cover increasing, decreasing, missing-element and creation modes.");
assert.deepEqual([...weekEightCreationRepresentations].sort(), ["numbers", "objects", "shapes"], "Week 8 does not require pattern creation using numbers, shapes and objects.");
assert(weekElevenOperations.has("+") && weekElevenOperations.has("-") && weekElevenOperations.has("x"), "Week 11 does not model additive and multiplicative money situations.");
assert.deepEqual([...weekTwelveHalvingTargets].sort((a, b) => a - b), [4, 8], "Week 12 does not construct both quarters and eighths through repeated halving.");

const quizIds = new Set<string>();
for (let week = 1; week <= 12; week += 1) {
  const quiz = buildYear2NumberNexusWeeklyQuiz(week);
  const config = YEAR1_WEEKLY_QUIZZES.find((item) => item.week === week);
  const programWeek = year2Number.find((item) => item.week === week)!;
  assert(config, `Week ${week} quiz config is missing.`);
  assert.equal(config.totalQuestions, 15);
  assert.equal(config.questionsPerLesson, 5);
  assert.equal(config.passPercent, 80);
  assert.equal(quiz.length, 15, `Week ${week} did not build 15 questions.`);

  for (const lessonTag of [1, 2, 3] as const) {
    const lesson = programWeek.lessons.find((item) => item.lesson === lessonTag)!;
    const lessonCodes = new Set<string>(lesson.curriculum);
    const lessonQuestions = quiz.filter((item) => item.lessonTag === lessonTag);
    assert.equal(lessonQuestions.length, 5, `Week ${week} Lesson ${lessonTag} did not contribute five questions.`);
    for (const item of lessonQuestions) {
      assert(item.descriptorCodes.every((code) => lessonCodes.has(code)), `${item.id} is not aligned with ${lesson.id}.`);
    }
  }

  for (const item of quiz) {
    assert(!quizIds.has(item.id), `Duplicate Level 2 quiz ID: ${item.id}`);
    quizIds.add(item.id);
    assert(item.prompt.trim().length > 0, `${item.id} has no prompt.`);
    if (item.kind === "mcq" || item.kind === "audio") {
      assert(item.options && item.options.length >= 3, `${item.id} has too few options.`);
      assert.equal(new Set(item.options).size, item.options.length, `${item.id} has duplicate options.`);
      assert(Number.isInteger(item.correctIndex) && item.correctIndex! >= 0 && item.correctIndex! < item.options.length, `${item.id} has an invalid answer index.`);
    } else {
      assert(item.correctValue && Number.isFinite(Number(item.correctValue)), `${item.id} has an invalid constructed answer.`);
    }
    quizChecks += 1;
  }

  if (week === 8) {
    const weekEightSkills = new Set(quiz.map((item) => item.skillId));
    for (const skill of ["skip-by-2", "missing-by-2", "double", "inverse-double", "forward-by-5", "backward-by-5", "missing-by-5", "create-number-increase", "create-number-decrease", "create-shape-increase", "create-object-decrease", "identify-object-rule"]) {
      assert(weekEightSkills.has(skill), `Week 8 quiz omits taught skill: ${skill}.`);
    }
    assert.equal(quiz.filter((item) => item.skillId === "inverse-double").length, 1, "Week 8 Lesson 1 overweights the single inverse-link activity.");
    assert.equal(quiz.filter((item) => item.visual?.type === "additive_pattern" && item.visual.token === "shape").length, 1, "Week 8 quiz omits the taught shape representation.");
    assert.equal(quiz.filter((item) => item.visual?.type === "additive_pattern" && item.visual.token === "object").length, 2, "Week 8 quiz omits the taught object representation.");
  }
  if (week === 3) {
    assert(quiz.every((item) => item.visual?.type === "number_line"), "Week 3 quiz must preserve the taught number-line representation in all 15 questions.");
    assert(quiz.every((item) => !item.prompt.includes("on a line ending at")), "Week 3 quiz still verbalises a missing number line.");
  }
  if (week === 4) {
    assert(quiz.filter((item) => item.lessonTag === 2).every((item) => item.prompt.includes("pattern")), "Week 4 Lesson 2 quiz does not assess the taught parity patterns.");
  }
  if (week === 5) {
    assert(quiz.filter((item) => item.lessonTag === 1).every((item) => item.visual?.type === "jump_line"), "Week 5 Lesson 1 quiz drops the taught open number line.");
  }
  if (week === 6) {
    assert(quiz.filter((item) => item.lessonTag === 1).every((item) => item.visual?.type === "jump_line"), "Week 6 Lesson 1 quiz drops the taught open number line.");
  }
  if (week === 7) {
    assert(quiz.filter((item) => item.lessonTag === 3 && item.kind === "mcq").length >= 2, "Week 7 Lesson 3 quiz omits explicit inverse checks.");
  }
  if (week === 9 || week === 10) {
    assert(quiz.every((item) => item.visual?.type === "rows"), `Week ${week} quiz drops the taught group and array models.`);
    assert(quiz.every((item) => item.visual?.type !== "rows" || [2, 5, 10].includes(item.visual.rows.length) || [2, 5, 10].includes(item.visual.rows[0] ?? 0)), `Week ${week} quiz uses a group structure outside the taught 2s, 5s and 10s facts.`);
  }
  if (week === 11) {
    assert(quiz.every((item) => item.visual?.type === "money"), "Week 11 quiz questions must use the Australian money visual.");
    assert(quiz.every((item) => !item.prompt.toLowerCase().includes("cents")), "Week 11 quiz does not match the whole-dollar lesson contract.");
    assert(quiz.some((item) => item.prompt.includes("You buy")), "Week 11 quiz does not assess a multiplicative money situation.");
  }
  if (week === 12) {
    assert(quiz.every((item) => item.visual?.type === "fraction"), "Week 12 quiz drops the taught fraction pictures.");
    assert(!quiz.some((item) => item.prompt.includes("same amount")), "Week 12 quiz assesses unsupported equivalent fractions.");
    assert(quiz.some((item) => item.prompt.includes("Halve all 4 quarters")), "Week 12 quiz does not assess construction of eighths through repeated halving.");
    assert(quiz.some((item) => item.prompt.includes("after every quarter is halved") && item.options?.includes("One eighth is half of one quarter.")), "Week 12 quiz does not assess the halves-quarters-eighths connection.");
  }
}

const blueprint = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.find((item) => item.level === 2);
const pretest = getPretestForYearLabel("Year 2", "number");
const posttest = getPosttestForYearLabel("Year 2", "number")?.questions ?? [];
assert(blueprint?.descriptors.every((item) => item.curriculumMapping.implementationStatus === "aligned"), "Level 2 assessment blueprint is not aligned.");
const patternBlueprint = blueprint?.descriptors.find((item) => item.code === "AC9M2A01");
const fractionBlueprint = blueprint?.descriptors.find((item) => item.code === "AC9M2N03");
assert(patternBlueprint?.description.includes("create additive patterns") && patternBlueprint.description.includes("numbers, shapes and objects"), "AC9M2A01 blueprint omits required creation or representations from the canonical PDF.");
assert(fractionBlueprint?.description.includes("through repeated halving"), "AC9M2N03 blueprint omits repeated halving from the canonical PDF.");
assert.equal(pretest.length, 20, "Level 2 production Pre-Test must contain 20 questions.");
assert.equal(posttest.length, 20, "Level 2 production Post-Test must contain 20 questions.");
assert([...pretest, ...posttest].every((item) => item.strand === "Number and Algebra"), "A Level 2 assessment contains out-of-realm content.");
assert.equal(ASSESSMENT_THRESHOLDS.posttestPassPercent, 85, "Level 2 Post-Test threshold changed from 85%.");

const engineSource = fs.readFileSync(path.join(process.cwd(), "components/lesson/Year2LessonEngine.tsx"), "utf8");
const globalStyles = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");
const assessmentSource = fs.readFileSync(path.join(process.cwd(), "components/assessment/NumberNexusYear2AssessmentVisual.tsx"), "utf8");
const sessionSource = fs.readFileSync(path.join(process.cwd(), "app/session/page.tsx"), "utf8");
const curriculumSourceRule = fs.readFileSync(path.join(process.cwd(), "docs/CURRICULUM_SOURCE_OF_TRUTH.md"), "utf8");
assert(curriculumSourceRule.includes("Australian Curriculum: Mathematics - Curriculum content F-6, Version 9.0 (ACARA)"), "The canonical ACARA PDF source rule is missing.");
assert(curriculumSourceRule.includes("mathematics-curriculum-content-f-6-v9 (4).pdf"), "The project owner's canonical curriculum PDF is not recorded.");
assert(engineSource.includes('data-number-nexus-level={isModernNumber ? String(levelNumber) : undefined}') && engineSource.includes("const isModernNumber = isLevelTwoNumber || isLevelThreeNumber"), "Level 2 lessons do not expose the modern presentation scope.");
assert(engineSource.includes('background: "#f8fbfc"'), "Level 2 lessons do not use the modern solid workspace surface.");
assert(globalStyles.includes(".number-nexus-level-two .rounded-2xl") && globalStyles.includes("border-radius: 0.5rem !important"), "Level 2 legacy activity cards are not normalized to the modern radius system.");
assert(assessmentSource.includes("number_y2_") || assessmentSource.includes("renderCoins"), "Level 2 assessment visuals are not available.");
assert(sessionSource.includes("isLevelTwoNumberQuiz") && sessionSource.includes('currentQuiz?.visual?.type === "money"'), "Level 2 weekly quizzes do not use the modern money presentation.");

assert(sessionSource.includes("saveNumberWeeklyQuizAttempt(") && sessionSource.includes("questionResults: replayQuestionResults"), "Level 2 quizzes do not use canonical saving and replay snapshots.");
assert(sessionSource.includes("getRecommendedAssignedWeek(") && sessionSource.includes("p.requiredWeeks"), "Level 2 progression does not honour targeted weeks.");
assert(sessionSource.includes('isFinalQuizWeek ? "Continue to Post-Test"'), "The final Level 2 quiz does not present the Post-Test action.");
assert(!sessionSource.includes("Math.min(12, Number(week) + 1)"), "The final Level 2 quiz still attempts to unlock a non-existent week.");

console.log("Level 2 Number Nexus full-year audit passed.");
console.log(`Curriculum: 12/12 weeks, ${curriculumChecks}/36 lessons aligned.`);
console.log(`Lesson experience: ${generatedQuestions}/${generatedQuestions} generated questions valid across every configured activity.`);
console.log(`Weekly quizzes: 12/12 routes, ${quizChecks}/180 questions aligned, exact 5-5-5, 80% pass threshold.`);
console.log(`Assessments: ${pretest.length}/20 Pre-Test and ${posttest.length}/20 Post-Test questions valid, 85% Post-Test threshold.`);
