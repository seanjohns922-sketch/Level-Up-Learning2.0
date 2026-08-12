import fs from "node:fs";
import path from "node:path";
import { getLevelThreePosttest } from "../data/activities/starpath/level3/level3PostTest";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import { getPosttestForLevel, getPosttestForYearLabel, getPretestForLevel, getPretestForYearLabel } from "../data/assessments/api";
import type { IndependentAssessmentItem } from "../data/assessments/assessmentItemStandard";
import { LEVEL3_STARPATH_INDEPENDENT_POSTTEST_ITEMS, LEVEL3_STARPATH_INDEPENDENT_PRETEST_ITEMS } from "../data/assessments/level3StarpathIndependentAssessments";
import { STARPATH_ASSESSMENT_BLUEPRINTS } from "../data/assessments/starpathAssessmentBlueprint";
import { STARPATH_MISCONCEPTION_LIBRARY } from "../data/assessments/starpathMisconceptions";
import type { Question } from "../data/assessments/posttests";
import { ASSESSMENT_THRESHOLDS } from "../lib/assessment-rules";
import { isPracticeTaskSafe } from "../lib/task-safety";
import { isStarpathMapCreationValid } from "../lib/starpath-map-create";

type Candidate = Question & IndependentAssessmentItem;
const failures: string[] = [];
let passed = 0;
const check = (condition: boolean, message: string) => condition ? passed += 1 : failures.push(message);
const counts = (values: readonly string[]) => values.reduce<Record<string, number>>((result, value) => ({ ...result, [value]: (result[value] ?? 0) + 1 }), {});
const sameCounts = (actual: Record<string, number>, expected: Record<string, number>) => Object.keys({ ...actual, ...expected }).every((key) => actual[key] === expected[key]);

function solveCreate(task: Extract<NonNullable<Question["practiceTask"]>, { kind: "starpathMapCreate" }>) {
  const ids = task.landmarks.map((landmark) => landmark.id);
  const placements: Record<string, { r: number; c: number }> = {};
  const used = new Set<string>();
  const search = (index: number): boolean => {
    if (index === ids.length) return isStarpathMapCreationValid(task, placements);
    for (let r = 0; r < task.rows; r += 1) for (let c = 0; c < task.cols; c += 1) {
      const key = `${r}:${c}`;
      if (used.has(key)) continue;
      placements[ids[index]!] = { r, c }; used.add(key);
      if (search(index + 1)) return true;
      used.delete(key); delete placements[ids[index]!];
    }
    return false;
  };
  return search(0);
}

const blueprint = STARPATH_ASSESSMENT_BLUEPRINTS.find((item) => item.level === 3);
const misconceptionById = new Map(STARPATH_MISCONCEPTION_LIBRARY.map((item) => [item.id, item]));
check(Boolean(blueprint), "Year 3 Starpath blueprint is missing.");
check(blueprint?.descriptors.every((item) => item.curriculumMapping.implementationStatus === "aligned") ?? false, "Year 3 blueprint is not curriculum-aligned.");

const forms = [
  { kind: "pretest", bank: LEVEL3_STARPATH_INDEPENDENT_PRETEST_ITEMS, difficulty: { easy: 7, moderate: 9, challenging: 4 }, cognitive: { recall: 2, understanding: 6, application: 7, reasoning: 4, transfer: 1 }, bankId: "starpath-level-3-pretest-v1" },
  { kind: "posttest", bank: LEVEL3_STARPATH_INDEPENDENT_POSTTEST_ITEMS, difficulty: { easy: 5, moderate: 9, challenging: 6 }, cognitive: { recall: 1, understanding: 5, application: 7, reasoning: 5, transfer: 2 }, bankId: "starpath-level-3-posttest-v1" },
] as const;

for (const form of forms) {
  const bank = form.bank as readonly Candidate[];
  check(bank.length === 20, `${form.kind} must contain 20 items.`);
  check(new Set(bank.map((item) => item.id)).size === 20, `${form.kind} IDs must be unique.`);
  check(new Set(bank.map((item) => item.prompt)).size === 20, `${form.kind} prompts must be unique.`);
  check(new Set(bank.map((item) => item.contextKey)).size === 20, `${form.kind} contexts must be unique.`);
  check(new Set(bank.map((item) => item.structureKey)).size === 20, `${form.kind} structures must be unique.`);
  check(sameCounts(counts(bank.map((item) => item.primaryDescriptorCode)), { AC9M3SP01: 8, AC9M3SP02: 12 }), `${form.kind} descriptor allocation must be 8 SP01 and 12 SP02.`);
  check(sameCounts(counts(bank.map((item) => item.difficulty)), form.difficulty), `${form.kind} difficulty mix differs from the approved blueprint.`);
  check(sameCounts(counts(bank.map((item) => item.cognitiveCategory)), form.cognitive), `${form.kind} cognitive mix differs from the approved blueprint.`);
  check(sameCounts(counts(bank.map((item) => item.responseMode)), { selected_response: 4, manipulated_response: 16 }), `${form.kind} response mix must be 4 selected and 16 manipulated.`);
  check(bank.filter((item) => item.practiceTask?.kind === "starpathMapCreate").length === 8, `${form.kind} must contain eight map-creation tasks.`);
  check(bank.filter((item) => item.practiceTask?.kind === "starpathMapRoute").length === 4, `${form.kind} must contain four route-authoring tasks.`);
  check(bank.every((item) => item.prompt.trim().split(/\s+/).length <= 15), `${form.kind} contains a prompt above the 15-word Year 3 ceiling.`);

  for (const item of bank) {
    const task = item.practiceTask;
    check(item.version === "1.0.0" && item.bankId === form.bankId, `${item.id} has incorrect release metadata.`);
    check(item.realm === "space" && item.level === 3 && item.form === form.kind, `${item.id} targets the wrong form.`);
    check(item.origin === "assessment_authored" && item.sourcePool === form.kind, `${item.id} is not independent assessment content.`);
    check(item.renderer.type === "starpath_assessment_task" && item.type === "starpathTask", `${item.id} is not launchable.`);
    check(item.scoring.kind === "interaction" && isAssessmentAnswerCorrect(item, item.correctAnswer), `${item.id} rejects its correct token.`);
    check(!isAssessmentAnswerCorrect(item, `incorrect:${item.id}`), `${item.id} accepts an incorrect token.`);
    check(item.statistics.calibrationStatus === "uncalibrated" && item.statistics.sampleSize === 0, `${item.id} must start uncalibrated.`);
    check(item.curriculumLessonMapping.length === 1 && item.descriptorCodes.includes(item.primaryDescriptorCode), `${item.id} has incomplete curriculum metadata.`);
    check(item.misconceptionTags.length > 0 && item.misconceptionTags.every((tag) => misconceptionById.get(tag)?.descriptorCodes.includes(item.primaryDescriptorCode)), `${item.id} has an invalid misconception mapping.`);
    check(item.isTransfer === (item.cognitiveCategory === "transfer"), `${item.id} has incorrect transfer metadata.`);
    check(item.requiresReasoning === (["reasoning", "transfer"] as string[]).includes(item.cognitiveCategory), `${item.id} has incorrect reasoning metadata.`);
    check(Boolean(task && isPracticeTaskSafe(task)), `${item.id} is blocked by task safety.`);
    check(Boolean(task && "speakText" in task && typeof task.speakText === "string" && task.speakText.trim()), `${item.id} has no read-aloud prompt.`);
    check(Boolean(task && "feedback" in task && task.feedback?.correct === task.feedback?.wrong), `${item.id} feedback can reveal correctness.`);
    if (task?.kind === "starpathObject") {
      if (task.mode === "compare" || task.mode === "name") check(Boolean(task.options?.some((option) => option.id === task.correctOptionId)), `${item.id} has no matching object answer.`);
      if (task.mode === "find") check(task.scene.some((object) => object.id === task.correctObjectId), `${item.id} has no matching object.`);
      if (task.mode === "classify") check(task.scene.every((object) => Boolean(task.assignments?.[object.id])), `${item.id} lacks a classification answer.`);
    }
    if (task?.kind === "starpathMapCreate") check(solveCreate(task), `${item.id} has no valid map solution.`);
    if (task?.kind === "starpathMapRoute") {
      const minimum = Math.abs(task.goal.r - task.start.r) + Math.abs(task.goal.c - task.start.c);
      check(task.mode === "give" && (task.maxSteps ?? 0) >= minimum, `${item.id} is not a solvable authored route.`);
    }
  }
}

const prePrompts = new Set(LEVEL3_STARPATH_INDEPENDENT_PRETEST_ITEMS.map((item) => item.prompt));
check(LEVEL3_STARPATH_INDEPENDENT_POSTTEST_ITEMS.every((item) => !prePrompts.has(item.prompt)), "Pre-Test and Post-Test reuse prompt wording.");
const source = fs.readFileSync(path.join(process.cwd(), "data/assessments/level3StarpathIndependentAssessments.ts"), "utf8");
const apiSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/api.ts"), "utf8");
const legacyIds = new Set((getLevelThreePosttest().questions ?? []).map((item) => item.id));
const expectedPreIds = LEVEL3_STARPATH_INDEPENDENT_PRETEST_ITEMS.map((item) => item.id);
const expectedPostIds = LEVEL3_STARPATH_INDEPENDENT_POSTTEST_ITEMS.map((item) => item.id);
const routes = [
  ["year Pre-Test", getPretestForYearLabel("Year 3", "space").map((item) => item.id), expectedPreIds],
  ["level Pre-Test", getPretestForLevel(3, "space").map((item) => item.id), expectedPreIds],
  ["year Post-Test", (getPosttestForYearLabel("Year 3", "space")?.questions ?? []).map((item) => item.id), expectedPostIds],
  ["level Post-Test", (getPosttestForLevel(3, "space")?.questions ?? []).map((item) => item.id), expectedPostIds],
] as const;
check(
  !source.includes("LEVEL_THREE_LESSON_CONTENT")
    && !source.includes("weeklyQuizBank")
    && !/week[1-8]Quiz/.test(source),
  "Candidate banks import Level 3 lesson or quiz content.",
);
check(apiSource.includes("level3StarpathIndependentAssessments"), "Production resolver does not import the Year 3 Starpath banks.");
for (const [label, actual, expected] of routes) check(JSON.stringify(actual) === JSON.stringify(expected), `${label} route is not live on the independent bank.`);
check(routes[2][1].every((id) => !legacyIds.has(id)), "Production still resolves a retired legacy Post-Test item.");
check(ASSESSMENT_THRESHOLDS.pretestPassPercent === 85 && ASSESSMENT_THRESHOLDS.posttestPassPercent === 85, "Assessment thresholds must remain 85%.");

console.log(`Year 3 Starpath independent-bank audit: ${passed} passed, ${failures.length} failed.`);
console.log("Forms: 40 items; each 16 manipulated / 4 selected; independent production resolver active.");
if (failures.length) { failures.forEach((failure) => console.error(`- ${failure}`)); process.exitCode = 1; }
