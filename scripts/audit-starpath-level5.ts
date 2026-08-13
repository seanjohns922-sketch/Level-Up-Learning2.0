import fs from "node:fs";
import path from "node:path";
import { LEVEL_FIVE_LESSON_CONTENT } from "@/data/activities/starpath/level5";
import { getStarpathQuizTasks } from "@/data/activities/starpath/ground/week1Quiz";
import { foldNet } from "@/data/activities/starpath/level5/nets";
import { samePoint, shortestSteps, type Point } from "@/data/activities/starpath/level5/coordinates";
import { inBounds, reflectPoint, rotatePoint } from "@/data/activities/starpath/level5/transforms";
import { isAssessmentAnswerCorrect } from "@/data/assessments/analysis";
import { getPosttestForLevel, getPosttestForYearLabel, getPretestForLevel, getPretestForYearLabel } from "@/data/assessments/api";
import type { IndependentAssessmentItem } from "@/data/assessments/assessmentItemStandard";
import {
  LEVEL5_STARPATH_INDEPENDENT_POSTTEST_ITEMS,
  LEVEL5_STARPATH_INDEPENDENT_PRETEST_ITEMS,
} from "@/data/assessments/level5StarpathIndependentAssessments";
import type { Question } from "@/data/assessments/posttests";
import { STARPATH_ASSESSMENT_BLUEPRINTS } from "@/data/assessments/starpathAssessmentBlueprint";
import { STARPATH_MISCONCEPTION_LIBRARY } from "@/data/assessments/starpathMisconceptions";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { ASSESSMENT_THRESHOLDS } from "@/lib/assessment-rules";
import { isPracticeTaskSafe } from "@/lib/task-safety";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

let failures = 0;
const fail = (message: string) => { console.error("FAIL:", message); failures += 1; };
const check = (condition: boolean, message: string) => { if (!condition) fail(message); };

type NetTask = Extract<PracticeTask, { kind: "starpathNet" }>;
type CoordTask = Extract<PracticeTask, { kind: "starpathCoordinate" }>;
type TransformTask = Extract<PracticeTask, { kind: "starpathTransform" }>;
type Candidate = Question & IndependentAssessmentItem;
const key = (cell: { r: number; c: number }) => `${cell.r}:${cell.c}`;
const counts = (values: readonly string[]) => values.reduce<Record<string, number>>((result, value) => {
  result[value] = (result[value] ?? 0) + 1;
  return result;
}, {});

function sameCounts(actual: Record<string, number>, expected: Record<string, number>) {
  return Object.keys({ ...actual, ...expected }).every((key) => (actual[key] ?? 0) === (expected[key] ?? 0));
}

// Can the rover reach the goal within maxSteps, on the grid and off blocked cells?
function routeSolvable(task: CoordTask): boolean {
  if (!task.start || !task.goal) return false;
  const blocked = new Set((task.blocked ?? []).map((c) => `${c.x}:${c.y}`));
  const budget = task.maxSteps ?? task.bounds.x + task.bounds.y;
  const seen = new Set<string>();
  let frontier: Point[] = [task.start];
  seen.add(`${task.start.x}:${task.start.y}`);
  for (let step = 0; step <= budget; step += 1) {
    if (frontier.some((p) => p.x === task.goal!.x && p.y === task.goal!.y)) return true;
    const next: Point[] = [];
    for (const p of frontier) {
      for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const q = { x: p.x + d[0]!, y: p.y + d[1]! };
        const k = `${q.x}:${q.y}`;
        if (q.x < 0 || q.y < 0 || q.x > task.bounds.x || q.y > task.bounds.y || blocked.has(k) || seen.has(k)) continue;
        seen.add(k); next.push(q);
      }
    }
    frontier = next;
  }
  return false;
}

function assertTask(task: PracticeTask, label: string) {
  check(isPracticeTaskSafe(task), `${label}: task must be supported by production renderer`);
  if (task.kind === "starpathCoordinate") {
    const coord = task as CoordTask;
    const within = (p?: Point) => Boolean(p && p.x >= 0 && p.y >= 0 && p.x <= coord.bounds.x && p.y <= coord.bounds.y);
    if (coord.render === "tap") check(within(coord.answer), `${label}: tap answer must be on the grid`);
    if (coord.render === "options") {
      const ids = new Set((coord.options ?? []).map((o) => o.id));
      check(ids.size >= 2 && (coord.correctOptionIds ?? []).length === 1 && ids.has((coord.correctOptionIds ?? [])[0]!), `${label}: coordinate options need one valid answer`);
    }
    if (coord.render === "commands") check(within(coord.start) && within(coord.goal) && routeSolvable(coord), `${label}: coordinate route must be solvable`);
    return;
  }
  if (task.kind === "starpathTransform") {
    const tf = task as TransformTask;
    check(tf.shape.length >= 3 && inBounds(tf.shape, tf.bounds), `${label}: transform shape must be on grid`);
    if (tf.image) check(inBounds(tf.image, tf.bounds), `${label}: transform image must be on grid`);
    if (tf.render === "options") {
      const ids = new Set((tf.options ?? []).map((o) => o.id));
      check(ids.size >= 2 && (tf.correctOptionIds ?? []).length === 1 && ids.has((tf.correctOptionIds ?? [])[0]!), `${label}: transform options need one valid answer`);
    }
    if (tf.render === "tap") check(Boolean(tf.markStart && tf.answer), `${label}: transform tap must name a marked point and answer`);
    return;
  }
  if (task.kind === "starpathNet") {
    const net = task as NetTask;
    check(Boolean(net.feedback?.correct && net.feedback?.wrong), `${label}: net feedback required`);
    if (net.render === "options") check((net.netOptions ?? []).length >= 2 && (net.correctOptionIds ?? []).length > 0, `${label}: net options need valid answers`);
    if (net.render === "build") check(net.buildFaces === 6, `${label}: build net must require six faces`);
    if (net.render === "single" && net.mode !== "trackCell") check((net.textOptions ?? []).length >= 2 && (net.correctOptionIds ?? []).length === 1, `${label}: net single needs one text answer`);
  }
}

function assertAssessmentBank(
  kind: "pretest" | "posttest",
  bank: readonly Candidate[],
  expectedDifficulty: Record<string, number>,
  expectedCognitive: Record<string, number>,
) {
  check(bank.length === 20, `Level 5 ${kind} must contain 20 items`);
  check(new Set(bank.map((item) => item.id)).size === 20, `Level 5 ${kind} IDs must be unique`);
  check(new Set(bank.map((item) => item.prompt)).size === 20, `Level 5 ${kind} prompts must be unique`);
  check(new Set(bank.map((item) => item.contextKey)).size === 20, `Level 5 ${kind} contexts must be unique`);
  check(new Set(bank.map((item) => item.structureKey)).size === 20, `Level 5 ${kind} structures must be unique`);
  check(sameCounts(counts(bank.map((item) => item.primaryDescriptorCode)), { AC9M5SP01: 7, AC9M5SP02: 6, AC9M5SP03: 7 }), `Level 5 ${kind} descriptor allocation must be 7/6/7`);
  check(sameCounts(counts(bank.map((item) => item.difficulty)), expectedDifficulty), `Level 5 ${kind} difficulty mix must match blueprint`);
  check(sameCounts(counts(bank.map((item) => item.cognitiveCategory)), expectedCognitive), `Level 5 ${kind} cognitive mix must match blueprint`);
  check(sameCounts(counts(bank.map((item) => item.responseMode)), { selected_response: 2, manipulated_response: 18 }), `Level 5 ${kind} response mix must be 2 selected and 18 manipulated`);

  const misconceptionById = new Map(STARPATH_MISCONCEPTION_LIBRARY.map((item) => [item.id, item]));
  for (const item of bank) {
    check(item.realm === "space" && item.level === 5 && item.form === kind, `${item.id}: wrong target metadata`);
    check(item.origin === "assessment_authored" && item.sourcePool === kind, `${item.id}: must be independent assessment content`);
    check(item.renderer.type === "starpath_assessment_task" && item.type === "starpathTask", `${item.id}: must launch through Starpath task renderer`);
    check(item.scoring.kind === "interaction" && isAssessmentAnswerCorrect(item, item.correctAnswer), `${item.id}: rejects correct interaction token`);
    check(!isAssessmentAnswerCorrect(item, `incorrect:${item.id}`), `${item.id}: accepts incorrect interaction token`);
    check(item.curriculumCodes?.[0] === item.primaryDescriptorCode && item.descriptorCodes.includes(item.primaryDescriptorCode), `${item.id}: curriculum descriptor metadata mismatch`);
    check(item.misconceptionTags.length > 0 && item.misconceptionTags.every((tag) => misconceptionById.get(tag)?.descriptorCodes.includes(item.primaryDescriptorCode)), `${item.id}: misconception tag outside descriptor`);
    check(Boolean(item.practiceTask && "feedback" in item.practiceTask && item.practiceTask.feedback?.correct === item.practiceTask.feedback?.wrong), `${item.id}: feedback must not reveal correctness`);
    if (item.practiceTask) assertTask(item.practiceTask, item.id);
  }
}

let lessons = 0;
let generators = 0;

for (const [lessonId, content] of Object.entries(LEVEL_FIVE_LESSON_CONTENT)) {
  lessons += 1;
  check(content.teaching.taskKind === "starpathShapeIntro", `${lessonId}: teaching should be starpathShapeIntro`);
  const set = content.createTaskSet();

  const week = Number(lessonId.match(/-w(\d)-/)?.[1] ?? 0);
  const expectVariant = week <= 3 ? "l5Nets" : week <= 5 ? "l5Coord" : week <= 7 ? "l5Trans" : "l5Integrate";
  const intro = set.teaching() as PracticeTask;
  check(intro.kind === "starpathShapeIntro" && (intro as { variant?: string }).variant === expectVariant, `${lessonId}: intro must use the ${expectVariant} teach variant`);

  for (const activity of set.activities) {
    for (let round = 0; round < 4; round += 1) {
      const task = activity() as PracticeTask;
      generators += 1;

      if (task.kind === "starpathCoordinate") {
        const coord = task as CoordTask;
        check(coord.prompt.length > 0 && coord.speakText.length > 0, `${lessonId}: prompt/speakText required`);
        const within = (p?: Point) => Boolean(p && p.x >= 0 && p.y >= 0 && p.x <= coord.bounds.x && p.y <= coord.bounds.y);
        if (coord.render === "tap") {
          check(within(coord.answer), `${lessonId}: tap answer must be on the grid`);
        } else if (coord.render === "options") {
          const ids = new Set((coord.options ?? []).map((o) => o.id));
          check(ids.size >= 2, `${lessonId}: options needed`);
          check((coord.correctOptionIds ?? []).length === 1 && ids.has((coord.correctOptionIds ?? [])[0]!), `${lessonId}: one valid option answer`);
        } else {
          check(within(coord.start) && within(coord.goal), `${lessonId}: commands need start and goal on the grid`);
          check(routeSolvable(coord), `${lessonId}: route must be solvable within maxSteps`);
          if (coord.mode === "route") check(coord.maxSteps === shortestSteps(coord.start!, coord.goal!), `${lessonId}: route maxSteps should be the shortest distance`);
        }
        continue;
      }

      if (task.kind === "starpathTransform") {
        const tf = task as TransformTask;
        check(tf.prompt.length > 0 && tf.speakText.length > 0, `${lessonId}: prompt/speakText required`);
        check(tf.shape.length >= 3 && inBounds(tf.shape, tf.bounds), `${lessonId}: shape must be on the grid`);
        if (tf.image) check(inBounds(tf.image, tf.bounds), `${lessonId}: image must be on the grid`);
        if (tf.render === "tap") {
          check(Boolean(tf.markStart) && Boolean(tf.answer), `${lessonId}: tap needs a marked point and answer`);
          check(inBounds([tf.answer!], tf.bounds), `${lessonId}: answer must be on the grid`);
          check(tf.shape.some((p) => samePoint(p, tf.markStart!)), `${lessonId}: marked point must be part of the shape`);
          if (tf.mode === "reflect" && tf.line) check(samePoint(reflectPoint(tf.markStart!, tf.line), tf.answer!), `${lessonId}: reflect answer must match the engine`);
          if (tf.mode === "rotate" && tf.centre && tf.rotation) check(samePoint(rotatePoint(tf.markStart!, tf.centre, tf.rotation), tf.answer!), `${lessonId}: rotate answer must match the engine`);
          if (tf.mode === "translate") check(!samePoint(tf.markStart!, tf.answer!), `${lessonId}: translate answer must move the point`);
        } else {
          const ids = new Set((tf.options ?? []).map((o) => o.id));
          check(ids.size >= 2 && (tf.correctOptionIds ?? []).length === 1 && ids.has((tf.correctOptionIds ?? [])[0]!), `${lessonId}: one valid option answer`);
        }
        continue;
      }

      if (task.kind !== "starpathNet") { fail(`${lessonId}: expected a Level 5 task, got ${task.kind}`); continue; }
      const net = task as NetTask;
      check(net.prompt.length > 0 && net.speakText.length > 0, `${lessonId}: prompt/speakText required`);
      check(Boolean(net.feedback?.correct && net.feedback?.wrong), `${lessonId}: feedback required`);

      if (net.render === "options") {
        check(Array.isArray(net.netOptions) && net.netOptions.length >= 2, `${lessonId}: options render needs netOptions`);
        const ids = new Set((net.netOptions ?? []).map((option) => option.id));
        check((net.correctOptionIds ?? []).length > 0, `${lessonId}: options need a correct answer`);
        check((net.correctOptionIds ?? []).every((id) => ids.has(id)), `${lessonId}: correctOptionIds must reference options`);
        // selectValid answers must be exactly the nets that fold.
        if (net.mode === "selectValid") {
          const truth = (net.netOptions ?? []).filter((option) => foldNet(option.cells).valid).map((option) => option.id).sort();
          check(JSON.stringify(truth) === JSON.stringify([...(net.correctOptionIds ?? [])].sort()), `${lessonId}: selectValid answer must match real validity`);
        }
      } else if (net.render === "build") {
        check((net.buildFaces ?? 0) === 6, `${lessonId}: build needs six faces`);
      } else if (net.render === "solid") {
        // Authored 3D solid (cuboid / triangular prism / square pyramid): named
        // solid + a single-answer MCQ, no cube-net cells.
        check(Boolean(net.solid), `${lessonId}: solid render needs a solid`);
        const ids = new Set((net.textOptions ?? []).map((option) => option.id));
        check(ids.size >= 2, `${lessonId}: solid MCQ needs options`);
        check((net.correctOptionIds ?? []).length === 1 && ids.has((net.correctOptionIds ?? [])[0]!), `${lessonId}: solid MCQ needs one valid answer`);
      } else {
        // single
        check(Array.isArray(net.cells) && net.cells!.length >= 5, `${lessonId}: single render needs a net`);
        if (net.mode === "trackCell") {
          const keys = new Set((net.cells ?? []).map(key));
          check((net.answerCells ?? []).length > 0 && (net.answerCells ?? []).every((k) => keys.has(k)), `${lessonId}: trackCell answer must be a real cell`);
          check((net.focusKeys ?? []).every((k) => keys.has(k)), `${lessonId}: focus must be a real cell`);
        } else {
          const ids = new Set((net.textOptions ?? []).map((option) => option.id));
          check(ids.size >= 2, `${lessonId}: single MCQ needs options`);
          check((net.correctOptionIds ?? []).length === 1 && ids.has((net.correctOptionIds ?? [])[0]!), `${lessonId}: single MCQ needs one valid answer`);
        }
        if (net.mode === "foldPredict") {
          const folds = foldNet(net.cells ?? []).valid;
          const answeredYes = (net.correctOptionIds ?? [])[0] === "yes";
          check(folds === answeredYes, `${lessonId}: foldPredict answer must match real validity`);
        }
      }
    }
  }
}

// Registry: the nine W1-3 lessons must be flagged implemented.
const program = getStarpathProgram("level-5");
for (let week = 1; week <= 8; week += 1) {
  for (let lesson = 1; lesson <= 3; lesson += 1) {
    const plan = program.weeks[week - 1]?.lessons[lesson - 1];
    check(plan?.status === "implemented", `registry y5-w${week}-l${lesson} should be implemented`);
  }
}

for (let week = 1; week <= 7; week += 1) {
  const quiz = getStarpathQuizTasks("level-5", week);
  check(Boolean(quiz), `Level 5 Week ${week} quiz must resolve through production dispatcher`);
  check(quiz?.length === 15, `Level 5 Week ${week} quiz must contain 15 questions`);
  quiz?.forEach((task, index) => {
    check("target" in task && task.target === index + 1, `Level 5 Week ${week} quiz question ${index + 1} must keep target order`);
    assertTask(task, `Level 5 Week ${week} quiz question ${index + 1}`);
  });
}
check(getStarpathQuizTasks("level-5", 8) === null, "Level 5 Week 8 must not resolve a weekly quiz");
check(program.status === "implemented", "Level 5 program must be implemented");
check(program.weeks.every((week) => week.status === "implemented"), "Every Level 5 week must be implemented");
check(program.weeks.slice(0, 7).every((week) => week.quiz?.status === "implemented"), "Level 5 Weeks 1-7 quizzes must be implemented");
check(program.weeks[7]?.quiz === null, "Level 5 Week 8 must use the post-test instead of a weekly quiz");
check(program.assessments.preTest?.status === "implemented", "Level 5 Pre-Test must be implemented");
check(program.assessments.postTest.status === "implemented", "Level 5 Post-Test must be implemented");
check(program.assessments.postTest.unlockAfterLessonId === "y5-space-w8-l3", "Level 5 Post-Test must unlock after the final lesson");

const blueprint = STARPATH_ASSESSMENT_BLUEPRINTS.find((item) => item.level === 5);
check(Boolean(blueprint), "Year 5 Starpath blueprint is missing");
check(blueprint?.descriptors.every((item) => item.curriculumMapping.implementationStatus === "aligned") ?? false, "Year 5 Starpath blueprint must be curriculum-aligned");
assertAssessmentBank("pretest", LEVEL5_STARPATH_INDEPENDENT_PRETEST_ITEMS as readonly Candidate[], { easy: 5, moderate: 10, challenging: 5 }, { recall: 1, understanding: 5, application: 7, reasoning: 5, transfer: 2 });
assertAssessmentBank("posttest", LEVEL5_STARPATH_INDEPENDENT_POSTTEST_ITEMS as readonly Candidate[], { easy: 3, moderate: 9, challenging: 8 }, { recall: 1, understanding: 3, application: 6, reasoning: 7, transfer: 3 });

const expectedPreIds = LEVEL5_STARPATH_INDEPENDENT_PRETEST_ITEMS.map((item) => item.id);
const expectedPostIds = LEVEL5_STARPATH_INDEPENDENT_POSTTEST_ITEMS.map((item) => item.id);
check(JSON.stringify(getPretestForYearLabel("Year 5", "space").map((item) => item.id)) === JSON.stringify(expectedPreIds), "Year 5 Starpath Pre-Test must resolve through year API");
check(JSON.stringify(getPretestForLevel(5, "space").map((item) => item.id)) === JSON.stringify(expectedPreIds), "Level 5 Starpath Pre-Test must resolve through level API");
check(JSON.stringify((getPosttestForYearLabel("Year 5", "space")?.questions ?? []).map((item) => item.id)) === JSON.stringify(expectedPostIds), "Year 5 Starpath Post-Test must resolve through year API");
check(JSON.stringify((getPosttestForLevel(5, "space")?.questions ?? []).map((item) => item.id)) === JSON.stringify(expectedPostIds), "Level 5 Starpath Post-Test must resolve through level API");
check(ASSESSMENT_THRESHOLDS.pretestPassPercent === 85 && ASSESSMENT_THRESHOLDS.posttestPassPercent === 85, "Level 5 assessment thresholds must remain 85%");

const voyageQuizSource = fs.readFileSync(path.join(process.cwd(), "components/starpath/StarpathVoyageQuiz.tsx"), "utf8");
check(/function changeAnswer\(\)[\s\S]+delete next\[answerKey\][\s\S]+setNonce/.test(voyageQuizSource), "Level 5 weekly quizzes must reopen the current task when an answer is changed");
check(/Correctness is shown after the quiz\.[\s\S]+Change answer/.test(voyageQuizSource), "Level 5 weekly quizzes must offer immediate answer changes without revealing correctness");

if (failures === 0) {
  console.log(`Starpath Level 5 audit passed: ${lessons} lessons, ${generators} generated lesson tasks, 105 weekly quiz questions and 40 independent assessment items validated.`);
} else {
  console.error(`Starpath Level 5 audit failed with ${failures} problem(s).`);
  process.exit(1);
}
