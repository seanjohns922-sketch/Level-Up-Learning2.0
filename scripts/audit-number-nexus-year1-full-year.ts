import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { YEAR1_WEEKLY_QUIZZES } from "../app/config/lesson-config";
import { generateWeek1Task, resetWeek1TaskSessionState } from "../data/activities/year1/week1";
import { generateWeek2Task, resetWeek2TaskSessionState } from "../data/activities/year1/week2";
import { generateWeek3Task, resetWeek3TaskSessionState } from "../data/activities/year1/week3";
import { generateWeek4Task, resetWeek4TaskSessionState } from "../data/activities/year1/week4";
import { generateWeek5Task } from "../data/activities/year1/week5";
import { generateWeek6Task } from "../data/activities/year1/week6";
import { generateWeek7Task } from "../data/activities/year1/week7";
import { generateWeek8Task } from "../data/activities/year1/week8";
import { generateWeek9Task } from "../data/activities/year1/week9";
import { generateWeek10Task } from "../data/activities/year1/week10";
import { generateWeek11Task, resetWeek11TaskSessionState } from "../data/activities/year1/week11";
import { generateWeek12Task } from "../data/activities/year1/week12";
import type { Difficulty, PracticeTask } from "../data/activities/year1/practice-task";
import { getPosttestForYearLabel, getPretestForYearLabel } from "../data/assessments/api";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";
import { buildYear1NumberNexusWeeklyQuiz } from "../data/quizzes/year1NumberNexus";
import { buildYear1Week11PatternQuizItems } from "../data/quizzes/year1Week11Patterns";
import { YEAR1_PROGRAM } from "../data/programs/year1";
import { ASSESSMENT_THRESHOLDS } from "../lib/assessment-rules";
import { isPracticeTaskSafe } from "../lib/task-safety";

type Generator = (lessonId: string, difficulty: Difficulty) => PracticeTask;

const generators: Array<{ generate: Generator; reset?: () => void }> = [
  { generate: generateWeek1Task, reset: resetWeek1TaskSessionState },
  { generate: generateWeek2Task, reset: resetWeek2TaskSessionState },
  { generate: generateWeek3Task, reset: resetWeek3TaskSessionState },
  { generate: ((lessonId, difficulty) => generateWeek4Task(lessonId, undefined, difficulty)), reset: resetWeek4TaskSessionState },
  { generate: (lessonId, difficulty) => generateWeek5Task(lessonId, undefined, difficulty) },
  { generate: (lessonId, difficulty) => generateWeek6Task(lessonId, undefined, difficulty) },
  { generate: (lessonId, difficulty) => generateWeek7Task(lessonId, undefined, difficulty) },
  { generate: generateWeek8Task },
  { generate: generateWeek9Task },
  { generate: generateWeek10Task },
  { generate: generateWeek11Task, reset: resetWeek11TaskSessionState },
  { generate: generateWeek12Task },
];

const expectedWeekCodes: Record<number, readonly string[]> = {
  1: ["AC9M1N01"],
  2: ["AC9M1N01"],
  3: ["AC9M1N02"],
  4: ["AC9M1N03", "AC9M1A01"],
  5: ["AC9M1N04"],
  6: ["AC9M1N04"],
  7: ["AC9M1N04", "AC9M1N05"],
  8: ["AC9M1N05"],
  9: ["AC9M1N06"],
  10: ["AC9M1N03", "AC9M1N06", "AC9M1A01"],
  11: ["AC9M1A02"],
  12: ["ALL"],
};

const allowedCodes = new Set([
  "AC9M1N01", "AC9M1N02", "AC9M1N03", "AC9M1N04",
  "AC9M1N05", "AC9M1N06", "AC9M1A01", "AC9M1A02", "ALL",
]);
let lessonSamples = 0;
let curriculumChecks = 0;
let quizChecks = 0;

assert.equal(YEAR1_PROGRAM.length, 12, "Level 1 must contain exactly 12 weeks.");
for (const week of YEAR1_PROGRAM) {
  assert.deepEqual([...week.curriculum].sort(), [...expectedWeekCodes[week.week]!].sort(), `Week ${week.week} curriculum metadata is incorrect.`);
  assert.equal(week.lessons.length, 3, `Week ${week.week} must contain three lessons.`);
  assert(week.curriculum.every((code) => allowedCodes.has(code)), `Week ${week.week} contains a descriptor outside Level 1 Number and Algebra.`);
  for (const lesson of week.lessons) {
    assert(lesson.curriculum.length > 0, `Week ${week.week} Lesson ${lesson.lesson} has no curriculum metadata.`);
    assert(lesson.curriculum.every((code) => allowedCodes.has(code)), `Week ${week.week} Lesson ${lesson.lesson} has out-of-realm metadata.`);
    if (!week.curriculum.includes("ALL")) {
      assert(lesson.curriculum.every((code) => week.curriculum.includes(code)), `Week ${week.week} Lesson ${lesson.lesson} is outside its week curriculum.`);
    }
    curriculumChecks += 1;
  }
}

for (let week = 1; week <= 12; week += 1) {
  const entry = generators[week - 1]!;
  entry.reset?.();
  for (let lesson = 1; lesson <= 3; lesson += 1) {
    const kinds = new Set<string>();
    for (const difficulty of ["easy", "medium", "hard"] as const) {
      for (let sample = 0; sample < 20; sample += 1) {
        const task = entry.generate(`y1-w${week}-l${lesson}`, difficulty);
        assert(task && typeof task.kind === "string" && task.kind.length > 0, `Week ${week} Lesson ${lesson} produced an invalid task.`);
        assert(isPracticeTaskSafe(task), `Week ${week} Lesson ${lesson} produced a task rejected by the production safety gate: ${task.kind}.`);
        kinds.add(task.kind);
        lessonSamples += 1;
      }
    }
    assert(kinds.size > 0, `Week ${week} Lesson ${lesson} produced no task variety.`);
  }
}

const quizIds = new Set<string>();
for (let week = 1; week <= 12; week += 1) {
  const quiz = week === 11 ? buildYear1Week11PatternQuizItems() : buildYear1NumberNexusWeeklyQuiz(week);
  const config = YEAR1_WEEKLY_QUIZZES.find((item) => item.week === week);
  assert(config, `Week ${week} quiz config is missing.`);
  assert.equal(config.totalQuestions, 15, `Week ${week} must configure 15 questions.`);
  assert.equal(config.questionsPerLesson, 5, `Week ${week} must configure five questions per lesson.`);
  assert.equal(config.passPercent, 80, `Week ${week} pass threshold must remain 80%.`);
  assert.equal(quiz.length, 15, `Week ${week} did not build 15 questions.`);
  for (const lesson of [1, 2, 3] as const) {
    assert.equal(quiz.filter((item) => item.lessonTag === lesson).length, 5, `Week ${week} Lesson ${lesson} did not contribute five questions.`);
  }
  for (const item of quiz) {
    assert(!quizIds.has(item.id), `Duplicate Level 1 quiz ID: ${item.id}`);
    quizIds.add(item.id);
    assert(item.prompt.trim().length > 0, `${item.id} has no prompt.`);
    quizChecks += 1;
  }

  const lessonItems = (lesson: 1 | 2 | 3) => quiz.filter((item) => item.lessonTag === lesson);
  const visualType = (item: (typeof quiz)[number]) => (item as { visual?: { type?: string } }).visual?.type;
  const itemKind = (item: (typeof quiz)[number]) => (item as { kind?: string }).kind;
  if (week === 1) {
    assert.equal(lessonItems(3).filter((item) => itemKind(item) === "typed").length, 2, "Week 1 Lesson 3 must assess independently writing numerals as well as ordering them.");
  }
  if (week === 2) {
    assert.equal(lessonItems(3).filter((item) => visualType(item) === "number_line").length, 3, "Week 2 Lesson 3 must include three number-line questions.");
    assert.equal(lessonItems(3).filter((item) => visualType(item) === "number_chart").length, 2, "Week 2 Lesson 3 must include two number-chart questions.");
  }
  if (week === 3) {
    assert(lessonItems(1).every((item) => visualType(item) === "place_value"), "Week 3 Lesson 1 must assess base-ten materials visually.");
    assert(lessonItems(3).every((item) => visualType(item) === "place_value"), "Week 3 Lesson 3 must assess base-ten construction visually.");
    assert.equal(lessonItems(2).filter((item) => item.prompt.toLowerCase().includes("flexible")).length, 2, "Week 3 Lesson 2 must include two flexible partition questions.");
  }
  if (week === 5) {
    assert(lessonItems(1).every((item) => visualType(item) === "collection_change"), "Week 5 Lesson 1 must model joining collections.");
    assert(lessonItems(2).every((item) => visualType(item) === "part_whole"), "Week 5 Lesson 2 must use part-whole models.");
  }
  if (week === 6) {
    assert(lessonItems(1).every((item) => visualType(item) === "collection_change"), "Week 6 Lesson 1 must model removing from a collection.");
    assert(lessonItems(2).every((item) => visualType(item) === "part_whole"), "Week 6 Lesson 2 must use part-whole models.");
  }
  if (week === 7) {
    assert(lessonItems(3).every((item) => visualType(item) === "money"), "Week 7 Lesson 3 must retain the taught money representation.");
  }
  if (week === 8) {
    assert(lessonItems(1).every((item) => visualType(item) === "collection_change"), "Week 8 Lesson 1 must assess additive situation models.");
    assert(lessonItems(2).every((item) => visualType(item) === "part_whole"), "Week 8 Lesson 2 must assess part-whole diagrams.");
    assert(lessonItems(3).every((item) => visualType(item) === "money"), "Week 8 Lesson 3 must retain the taught money representation.");
  }
  if (week === 9 || week === 10) {
    assert(quiz.every((item) => visualType(item) === "rows"), `Week ${week} must assess sharing and grouping with visible equal-group models.`);
  }
  if (week === 11) {
    assert(quiz.every((item) => "sequence" in item && Array.isArray(item.sequence) && item.sequence.length >= 2), "Week 11 must assess patterns with visible repeating sequences.");
  }
}

const blueprint = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.find((item) => item.level === 1);
const pretest = getPretestForYearLabel("Year 1", "number");
const posttest = getPosttestForYearLabel("Year 1", "number")?.questions ?? [];
assert(blueprint?.descriptors.every((item) => item.curriculumMapping.implementationStatus === "aligned"), "Level 1 assessment blueprint is not aligned.");
assert.equal(pretest.length, 20, "Level 1 production Pre-Test must contain 20 questions.");
assert.equal(posttest.length, 20, "Level 1 production Post-Test must contain 20 questions.");
assert([...pretest, ...posttest].every((item) => item.strand === "Number and Algebra"), "A Level 1 assessment contains out-of-realm content.");
assert.equal(ASSESSMENT_THRESHOLDS.posttestPassPercent, 85, "Level 1 Post-Test threshold changed from 85%.");

const presentationFiles = [
  "components/PracticeRunner.tsx",
  "components/MatchThePair.tsx",
  "components/CountObjects.tsx",
  "components/FillTheJar.tsx",
  "components/CountAndCircle.tsx",
  "components/TypeTheNumber.tsx",
  "components/NumberLadder.tsx",
  "components/NumberLineTap.tsx",
  "components/NumberLineJump.tsx",
  "components/NumberChartFill.tsx",
  ...fs.readdirSync(path.join(process.cwd(), "components/placevalue")).filter((file) => file.endsWith(".tsx")).map((file) => `components/placevalue/${file}`),
  ...Array.from({ length: 9 }, (_, index) => index + 4).flatMap((week) =>
    fs.readdirSync(path.join(process.cwd(), `components/week${week}`)).filter((file) => file.endsWith(".tsx")).map((file) => `components/week${week}/${file}`)
  ),
];
const presentationSource = presentationFiles.map((file) => fs.readFileSync(path.join(process.cwd(), file), "utf8")).join("\n");
assert(!/rounded-\[(?:12|14|16|18|20|22|24|28)px\]|rounded-2xl|rounded-3xl/.test(presentationSource), "A live Level 1 activity uses legacy oversized corner radii.");
assert(!/bg-gradient-to-(?:br|r)/.test(presentationSource), "A live Level 1 activity uses the retired gradient-heavy card treatment.");
assert(!/[🤖🚀🛸🪐⭐💎🏁✨]/u.test(presentationSource), "A live Level 1 activity uses platform-dependent interface emoji.");

const sessionSource = fs.readFileSync(path.join(process.cwd(), "app/session/page.tsx"), "utf8");
assert(sessionSource.includes("saveNumberWeeklyQuizAttempt(") && sessionSource.includes("questionResults: replayQuestionResults"), "Level 1 quizzes do not use canonical attempt saving and replay snapshots.");
assert(sessionSource.includes("getRecommendedAssignedWeek(") && sessionSource.includes("p.requiredWeeks"), "Level 1 progression does not honour targeted weeks.");
assert(sessionSource.includes('isFinalQuizWeek ? "Continue to Post-Test"'), "The final Level 1 quiz does not present the Post-Test action.");
assert(!sessionSource.includes("Math.min(12, Number(week) + 1)"), "The final Level 1 quiz still attempts to unlock a non-existent week.");

console.log("Level 1 Number Nexus full-year audit passed.");
console.log(`Curriculum: 12/12 weeks, ${curriculumChecks}/36 lessons aligned.`);
console.log(`Lesson generation: ${lessonSamples}/${lessonSamples} sampled tasks valid across easy, medium and hard.`);
console.log(`Weekly quizzes: 12/12 routes, ${quizChecks}/180 questions valid, exact 5-5-5, 80% pass threshold.`);
console.log(`Assessments: ${pretest.length}/20 Pre-Test and ${posttest.length}/20 Post-Test questions valid, 85% Post-Test threshold.`);
