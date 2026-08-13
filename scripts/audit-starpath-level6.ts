/* Audit for Starpath Level 6 Weeks 1-7 (cross-sections SP01, four-quadrant
 * coordinates SP02, combined transformations + tessellations SP03). Generates
 * every lesson's tasks over several rounds and checks each answer against the
 * engines, plus that the registry marks them implemented.
 * Run: npx tsx scripts/audit-starpath-level6.ts
 */
import fs from "node:fs";
import path from "node:path";
import { LEVEL_SIX_LESSON_CONTENT } from "@/data/activities/starpath/level6";
import { getStarpathQuizTasks } from "@/data/activities/starpath/ground/week1Quiz";
import { getCrossObject } from "@/data/activities/starpath/level6/crossSections";
import { CARTESIAN_RANGE, coordLabel, inRange, quadrant, type Point } from "@/data/activities/starpath/level6/cartesian";
import { getTile } from "@/data/activities/starpath/level6/tessellation";
import { inBounds } from "@/data/activities/starpath/level5/transforms";
import { isAssessmentAnswerCorrect } from "@/data/assessments/analysis";
import { getPosttestForLevel, getPosttestForYearLabel, getPretestForLevel, getPretestForYearLabel } from "@/data/assessments/api";
import type { IndependentAssessmentItem } from "@/data/assessments/assessmentItemStandard";
import {
  LEVEL6_STARPATH_INDEPENDENT_POSTTEST_ITEMS,
  LEVEL6_STARPATH_INDEPENDENT_PRETEST_ITEMS,
} from "@/data/assessments/level6StarpathIndependentAssessments";
import type { Question } from "@/data/assessments/posttests";
import { STARPATH_ASSESSMENT_BLUEPRINTS } from "@/data/assessments/starpathAssessmentBlueprint";
import { STARPATH_MISCONCEPTION_LIBRARY } from "@/data/assessments/starpathMisconceptions";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { ASSESSMENT_THRESHOLDS } from "@/lib/assessment-rules";
import { isPracticeTaskSafe } from "@/lib/task-safety";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

let problems = 0;
const check = (cond: boolean, message: string) => { if (!cond) { problems += 1; console.error(`FAIL: ${message}`); } };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type CrossTask = Extract<PracticeTask, { kind: "starpathCrossSection" }>;
type CartTask = Extract<PracticeTask, { kind: "starpathCartesian" }>;
type TransformTask = Extract<PracticeTask, { kind: "starpathTransform" }>;
type TessTask = Extract<PracticeTask, { kind: "starpathTessellation" }>;
type AssessmentTask = Extract<PracticeTask, { kind: "starpathLevel6Assessment" }>;
type Candidate = Question & IndependentAssessmentItem;
const counts = (values: readonly string[]) => values.reduce<Record<string, number>>((result, value) => {
  result[value] = (result[value] ?? 0) + 1;
  return result;
}, {});
const sameCounts = (actual: Record<string, number>, expected: Record<string, number>) =>
  Object.keys({ ...actual, ...expected }).every((key) => (actual[key] ?? 0) === (expected[key] ?? 0));

const CROSS_LESSONS = ["y6-space-w1-l1", "y6-space-w1-l2", "y6-space-w1-l3", "y6-space-w2-l1", "y6-space-w2-l2", "y6-space-w2-l3"];
const CART_LESSONS = ["y6-space-w3-l1", "y6-space-w3-l2", "y6-space-w3-l3", "y6-space-w4-l1", "y6-space-w4-l2", "y6-space-w4-l3"];
const TRANS_LESSONS = ["y6-space-w5-l1", "y6-space-w5-l2", "y6-space-w5-l3"];
const TESS_LESSONS = ["y6-space-w6-l1", "y6-space-w6-l2", "y6-space-w6-l3", "y6-space-w7-l1", "y6-space-w7-l2", "y6-space-w7-l3"];
// W8 integration lessons mix all three strands (each dispatched by kind below).
const INTEGRATE_LESSONS = ["y6-space-w8-l1", "y6-space-w8-l2", "y6-space-w8-l3"];
const WEEKLY_QUIZ_MODES = [
  ["sliceShape", "sliceChange", "predict"],
  ["prism", "constant", "explain"],
  ["read", "quadrant", "reason"],
  ["changeWhich", "crossAxis", "reverse"],
  ["sequence", "order", "chain"],
  ["will", "rule", "explain"],
  ["notice", "vary", "evidence"],
] as const;

let taskCount = 0;

function auditTransform(lessonId: string, t: TransformTask) {
  check(inBounds(t.shape, t.bounds), `${lessonId}: shape off the grid`);
  if (t.image) check(inBounds(t.image, t.bounds), `${lessonId}: image off the grid`);
  if (t.render === "tap") {
    check(Boolean(t.answer) && t.answer!.x >= 0 && t.answer!.y >= 0 && t.answer!.x <= t.bounds.x && t.answer!.y <= t.bounds.y, `${lessonId}: tap answer must be on the grid`);
  } else {
    const ids = new Set((t.options ?? []).map((o) => o.id));
    check(ids.size >= 2, `${lessonId}: options need >= 2`);
    check((t.correctOptionIds ?? []).length === 1 && ids.has((t.correctOptionIds ?? [])[0]!), `${lessonId}: one valid correct answer`);
  }
  check(Boolean(t.feedback?.correct && t.feedback?.wrong), `${lessonId}: feedback required`);
}

function auditTess(lessonId: string, t: TessTask) {
  const tile = getTile(t.tileId);
  const ids = new Set(t.options.map((o) => o.id));
  check(ids.size === t.options.length && ids.size >= 2, `${lessonId}: options unique and >= 2`);
  check(t.correctOptionIds.length === 1 && ids.has(t.correctOptionIds[0]!), `${lessonId}: one valid correct answer`);
  const c = t.correctOptionIds[0];
  if (t.mode === "will") check(c === (tile.tessellates ? "yes" : "no"), `${lessonId}/will: wrong answer for ${tile.id}`);
  else if (t.mode === "rule" || t.mode === "notice") check(c === tile.rule, `${lessonId}/${t.mode}: rule mismatch for ${tile.id}`);
  else if (t.mode === "explain") check(c === "angles", `${lessonId}/explain: wrong answer`);
  else if (t.mode === "vary") check(c === "break", `${lessonId}/vary: wrong answer`);
  else if (t.mode === "evidence") check(c === "nogaps", `${lessonId}/evidence: wrong answer`);
  check(Boolean(t.feedback?.correct && t.feedback?.wrong), `${lessonId}: feedback required`);
}

function auditCross(lessonId: string, t: CrossTask) {
  const obj = getCrossObject(t.objectId);
  check(obj.id === t.objectId, `${lessonId}: unknown objectId ${t.objectId}`);
  const ids = new Set(t.options.map((o) => o.id));
  check(ids.size === t.options.length && ids.size >= 2, `${lessonId}: options must be unique and >= 2`);
  check(t.correctOptionIds.length === 1 && ids.has(t.correctOptionIds[0]!), `${lessonId}: exactly one valid correct answer`);
  const correct = t.options.find((o) => o.id === t.correctOptionIds[0]);
  if (t.mode === "sliceShape" || t.mode === "predict") {
    check(correct?.label === cap(obj.sectionName), `${lessonId}/${t.mode}: section must be ${obj.sectionName} for ${obj.id}`);
  } else if (t.mode === "sliceChange") {
    check(t.correctOptionIds[0] === (obj.constantSection ? "same" : "smaller"), `${lessonId}/sliceChange: wrong answer for ${obj.id}`);
  } else if (t.mode === "prism") {
    check(t.correctOptionIds[0] === (obj.isPrism ? "yes" : "no"), `${lessonId}/prism: wrong answer for ${obj.id}`);
  } else if (t.mode === "constant") {
    check(t.correctOptionIds[0] === (obj.constantSection ? "congruent" : "smaller"), `${lessonId}/constant: wrong answer for ${obj.id}`);
  } else if (t.mode === "explain") {
    check(t.correctOptionIds[0] === (obj.constantSection ? "prismlike" : "apex"), `${lessonId}/explain: wrong answer for ${obj.id}`);
  }
  check(Boolean(t.feedback?.correct && t.feedback?.wrong), `${lessonId}: feedback required`);
}

function auditCart(lessonId: string, t: CartTask) {
  check(t.range === CARTESIAN_RANGE, `${lessonId}: range must be ${CARTESIAN_RANGE}`);
  for (const p of t.points ?? []) check(inRange({ x: p.x, y: p.y }), `${lessonId}: point ${coordLabel(p as Point)} off the grid`);
  if (t.render === "tap") {
    check(Boolean(t.answer) && inRange(t.answer as Point), `${lessonId}: tap answer must be on the grid`);
  } else {
    const ids = new Set((t.options ?? []).map((o) => o.id));
    check(ids.size >= 2, `${lessonId}: options need >= 2`);
    check((t.correctOptionIds ?? []).length === 1 && ids.has((t.correctOptionIds ?? [])[0]!), `${lessonId}: one valid correct answer`);
    if (t.mode === "quadrant" || t.mode === "reason") {
      // The star (if shown) must sit in the quadrant named by the correct id.
      const star = (t.points ?? []).find((p) => p.kind === "star");
      if (star) check((t.correctOptionIds ?? [])[0] === `q${quadrant({ x: star.x, y: star.y })}`, `${lessonId}/${t.mode}: quadrant answer mismatch`);
    }
    if (t.mode === "changeWhich") {
      const rover = (t.points ?? []).find((p) => p.kind === "rover");
      const goal = (t.points ?? []).find((p) => p.kind === "goal");
      if (rover && goal) check((t.correctOptionIds ?? [])[0] === (rover.x !== goal.x ? "across" : "up"), `${lessonId}/changeWhich: axis answer mismatch`);
    }
  }
  check(Boolean(t.feedback?.correct && t.feedback?.wrong), `${lessonId}: feedback required`);
}

function auditIndependentAssessmentTask(label: string, task: AssessmentTask) {
  check(task.feedback.correct === task.feedback.wrong, `${label}: assessment feedback must remain neutral`);
  if (task.mode === "diagnose") {
    const ids = new Set((task.options ?? []).map((option) => option.id));
    check(ids.size === task.options?.length && ids.size >= 2, `${label}: diagnostic options must be unique`);
    check(ids.has(task.correctOptionId ?? ""), `${label}: diagnostic answer must identify a valid option`);
  } else if (task.mode === "crossSectionProfile") {
    check(task.profileAnswer?.length === 3, `${label}: cross-section profile requires three section widths`);
  } else if (task.mode === "coordinatePlot") {
    const range = task.range ?? 4;
    const keys = new Set((task.targetPoints ?? []).map((point) => `${point.x}:${point.y}`));
    check(keys.size === task.targetPoints?.length && keys.size >= 1, `${label}: coordinate targets must be unique`);
    check((task.targetPoints ?? []).every((point) => Math.abs(point.x) <= range && Math.abs(point.y) <= range), `${label}: coordinate target must be on the rendered plane`);
  } else if (task.mode === "transformChain") {
    check((task.operations?.length ?? 0) >= 2, `${label}: transformation chain requires at least two ordered operations`);
  } else {
    check(Boolean(task.ruleAnswer), `${label}: tessellation construction requires a repeat rule`);
  }
}

function auditTask(label: string, task: PracticeTask) {
  check(isPracticeTaskSafe(task), `${label}: task must be supported by production renderer`);
  if (task.kind === "starpathCrossSection") auditCross(label, task as CrossTask);
  else if (task.kind === "starpathCartesian") auditCart(label, task as CartTask);
  else if (task.kind === "starpathTransform") auditTransform(label, task as TransformTask);
  else if (task.kind === "starpathTessellation") auditTess(label, task as TessTask);
  else if (task.kind === "starpathLevel6Assessment") auditIndependentAssessmentTask(label, task as AssessmentTask);
  else check(false, `${label}: unsupported Level 6 task kind ${(task as PracticeTask).kind}`);
}

function auditAssessmentBank(
  kind: "pretest" | "posttest",
  bank: readonly Candidate[],
  expectedDifficulty: Record<string, number>,
  expectedCognitive: Record<string, number>,
) {
  check(bank.length === 20, `Level 6 ${kind} must contain 20 items`);
  check(new Set(bank.map((item) => item.id)).size === 20, `Level 6 ${kind} IDs must be unique`);
  check(new Set(bank.map((item) => item.prompt)).size === 20, `Level 6 ${kind} prompts must be unique`);
  check(new Set(bank.map((item) => item.contextKey)).size === 20, `Level 6 ${kind} contexts must be unique`);
  check(new Set(bank.map((item) => item.structureKey)).size === 20, `Level 6 ${kind} structures must be unique`);
  check(sameCounts(counts(bank.map((item) => item.primaryDescriptorCode)), { AC9M6SP01: 6, AC9M6SP02: 6, AC9M6SP03: 8 }), `Level 6 ${kind} descriptor allocation must be 6/6/8`);
  check(sameCounts(counts(bank.map((item) => item.difficulty)), expectedDifficulty), `Level 6 ${kind} difficulty mix must match blueprint`);
  check(sameCounts(counts(bank.map((item) => item.cognitiveCategory)), expectedCognitive), `Level 6 ${kind} cognitive mix must match blueprint`);
  check(sameCounts(counts(bank.map((item) => item.responseMode)), { selected_response: 17, manipulated_response: 3 }), `Level 6 ${kind} response mix must use the lesson-renderer visual mix`);
  check(sameCounts(counts(bank.map((item) => item.practiceTask?.kind ?? "missing")), { starpathCrossSection: 6, starpathCartesian: 6, starpathTransform: 3, starpathTessellation: 5 }), `Level 6 ${kind} must borrow the proven lesson visual renderers across all strands`);

  const misconceptionById = new Map(STARPATH_MISCONCEPTION_LIBRARY.map((item) => [item.id, item]));
  for (const item of bank) {
    check(item.realm === "space" && item.level === 6 && item.form === kind, `${item.id}: wrong target metadata`);
    check(item.origin === "assessment_authored" && item.sourcePool === kind, `${item.id}: must be independent assessment content`);
    check(item.renderer.type === "starpath_assessment_task" && item.type === "starpathTask", `${item.id}: must launch through Starpath task renderer`);
    check(item.scoring.kind === "interaction" && isAssessmentAnswerCorrect(item, item.correctAnswer), `${item.id}: rejects correct interaction token`);
    check(!isAssessmentAnswerCorrect(item, `incorrect:${item.id}`), `${item.id}: accepts incorrect interaction token`);
    check(item.curriculumCodes?.[0] === item.primaryDescriptorCode && item.descriptorCodes.includes(item.primaryDescriptorCode), `${item.id}: curriculum descriptor metadata mismatch`);
    check(item.misconceptionTags.length > 0 && item.misconceptionTags.every((tag) => misconceptionById.get(tag)?.descriptorCodes.includes(item.primaryDescriptorCode)), `${item.id}: misconception tag outside descriptor`);
    check(Boolean(item.practiceTask && "feedback" in item.practiceTask && item.practiceTask.feedback?.correct === item.practiceTask.feedback?.wrong), `${item.id}: feedback must not reveal correctness`);
    const actualResponseMode = item.practiceTask?.kind === "starpathLevel6Assessment"
      ? item.practiceTask.mode === "diagnose" ? "selected_response" : "manipulated_response"
      : item.practiceTask && "render" in item.practiceTask && item.practiceTask.render === "tap"
        ? "manipulated_response"
        : "selected_response";
    check(item.responseMode === actualResponseMode, `${item.id}: responseMode says ${item.responseMode}, but the rendered interaction is ${actualResponseMode}`);
    if (item.practiceTask) auditTask(item.id, item.practiceTask);
  }
}

for (const lessonId of [...CROSS_LESSONS, ...CART_LESSONS, ...TRANS_LESSONS, ...TESS_LESSONS, ...INTEGRATE_LESSONS]) {
  const content = LEVEL_SIX_LESSON_CONTENT[lessonId];
  check(Boolean(content), `${lessonId}: missing lesson content`);
  if (!content) continue;
  for (let round = 0; round < 8; round += 1) {
    const set = content.createTaskSet();
    for (const activity of set.activities) {
      const task = activity() as PracticeTask;
      if (task.kind === "starpathCrossSection" || task.kind === "starpathCartesian" || task.kind === "starpathTransform" || task.kind === "starpathTessellation") {
        taskCount += 1;
        auditTask(lessonId, task);
      }
    }
  }
}

// Registry: all twenty-four lessons must be flagged implemented.
const program = getStarpathProgram("level-6");
for (let week = 1; week <= 8; week += 1) {
  for (let lesson = 1; lesson <= 3; lesson += 1) {
    const plan = program.weeks[week - 1]?.lessons[lesson - 1];
    check(plan?.status === "implemented", `registry y6-w${week}-l${lesson} should be implemented`);
  }
}
for (let week = 1; week <= 7; week += 1) {
  const quiz = getStarpathQuizTasks("level-6", week);
  check(Boolean(quiz), `Level 6 Week ${week} quiz must resolve through production dispatcher`);
  check(quiz?.length === 15, `Level 6 Week ${week} quiz must contain 15 questions`);
  quiz?.forEach((task, index) => {
    check("target" in task && task.target === index + 1, `Level 6 Week ${week} quiz question ${index + 1} must keep target order`);
    const lessonIndex = Math.floor(index / 5);
    const expectedMode = WEEKLY_QUIZ_MODES[week - 1]?.[lessonIndex];
    check("mode" in task && task.mode === expectedMode, `Level 6 Week ${week} quiz question ${index + 1} must assess Lesson ${lessonIndex + 1} mode ${expectedMode}`);
    auditTask(`Level 6 Week ${week} quiz question ${index + 1}`, task);
  });
}
check(getStarpathQuizTasks("level-6", 8) === null, "Level 6 Week 8 must not resolve a weekly quiz");
check(program.status === "implemented", "Level 6 program must be implemented");
check(program.weeks.every((week) => week.status === "implemented"), "Every Level 6 week must be implemented");
check(program.weeks.slice(0, 7).every((week) => week.quiz?.status === "implemented"), "Level 6 Weeks 1-7 quizzes must be implemented");
check(program.weeks[7]?.quiz === null, "Level 6 Week 8 must use the post-test instead of a weekly quiz");
check(program.assessments.preTest?.status === "implemented", "Level 6 Pre-Test must be implemented");
check(program.assessments.postTest.status === "implemented", "Level 6 Post-Test must be implemented");
check(program.assessments.postTest.unlockAfterLessonId === "y6-space-w8-l3", "Level 6 Post-Test must unlock after the final lesson");

const blueprint = STARPATH_ASSESSMENT_BLUEPRINTS.find((item) => item.level === 6);
check(Boolean(blueprint), "Year 6 Starpath blueprint is missing");
check(blueprint?.descriptors.every((item) => item.curriculumMapping.implementationStatus === "aligned") ?? false, "Year 6 Starpath blueprint must be curriculum-aligned");
auditAssessmentBank("pretest", LEVEL6_STARPATH_INDEPENDENT_PRETEST_ITEMS as readonly Candidate[], { easy: 4, moderate: 10, challenging: 6 }, { recall: 1, understanding: 4, application: 6, reasoning: 6, transfer: 3 });
auditAssessmentBank("posttest", LEVEL6_STARPATH_INDEPENDENT_POSTTEST_ITEMS as readonly Candidate[], { easy: 2, moderate: 8, challenging: 10 }, { understanding: 3, application: 6, reasoning: 7, transfer: 4 });

const expectedPreIds = LEVEL6_STARPATH_INDEPENDENT_PRETEST_ITEMS.map((item) => item.id);
const expectedPostIds = LEVEL6_STARPATH_INDEPENDENT_POSTTEST_ITEMS.map((item) => item.id);
const level6 = 6 as Parameters<typeof getPretestForLevel>[0];
check(JSON.stringify(getPretestForYearLabel("Year 6", "space").map((item) => item.id)) === JSON.stringify(expectedPreIds), "Year 6 Starpath Pre-Test must resolve through year API");
check(JSON.stringify(getPretestForLevel(level6, "space").map((item) => item.id)) === JSON.stringify(expectedPreIds), "Level 6 Starpath Pre-Test must resolve through level API");
check(JSON.stringify((getPosttestForYearLabel("Year 6", "space")?.questions ?? []).map((item) => item.id)) === JSON.stringify(expectedPostIds), "Year 6 Starpath Post-Test must resolve through year API");
check(JSON.stringify((getPosttestForLevel(level6, "space")?.questions ?? []).map((item) => item.id)) === JSON.stringify(expectedPostIds), "Level 6 Starpath Post-Test must resolve through level API");
check(ASSESSMENT_THRESHOLDS.weeklyQuizPassPercent === 80, "Level 6 weekly quiz threshold must remain 80%");
check(ASSESSMENT_THRESHOLDS.pretestPassPercent === 85 && ASSESSMENT_THRESHOLDS.posttestPassPercent === 85, "Level 6 assessment thresholds must remain 85%");

const voyageQuizSource = fs.readFileSync(path.join(process.cwd(), "components/starpath/StarpathVoyageQuiz.tsx"), "utf8");
check(/function changeAnswer\(\)[\s\S]+delete next\[answerKey\][\s\S]+setNonce/.test(voyageQuizSource), "Level 6 weekly quizzes must reopen the current task when an answer is changed");
check(/Answer recorded\. You can change it before finishing the quiz\.[\s\S]+Change answer/.test(voyageQuizSource), "Level 6 weekly quizzes must allow immediate answer changes without revealing correctness");

const bankSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/level6StarpathIndependentAssessments.ts"), "utf8");
check(!bankSource.includes("starpathLevel6Assessment"), "Level 6 assessments must not use the weak bespoke assessment renderer");
check(
  /level6\/crossTasks/.test(bankSource) &&
    /level6\/cartesianTasks/.test(bankSource) &&
    /level6\/transformChainTasks/.test(bankSource) &&
    /level6\/tessellationTasks/.test(bankSource),
  "Level 6 assessments must borrow the proven lesson visual task factories",
);
check(!bankSource.includes("LEVEL_SIX_LESSON_CONTENT") && !/weeklyQuizzes|getStarpathQuizTasks/.test(bankSource), "Level 6 assessment banks must not depend on lesson registries or weekly quiz dispatchers");

if (problems > 0) {
  console.error(`\nStarpath Level 6 audit failed with ${problems} problem(s).`);
  process.exit(1);
}
console.log(`Starpath Level 6 audit passed: 24 lessons, ${taskCount} generated lesson tasks, 105 weekly quiz questions and 40 independent assessment items validated.`);
