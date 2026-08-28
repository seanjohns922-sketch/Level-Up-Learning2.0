/* Statistica Level 6 production audit (6-week / 18-lesson structure). Validates
 * answer correctness for the new Year-6 tasks — range (highest - lowest),
 * side-by-side comparison, discrete/continuous data-typing, and critiquing
 * misleading media statistics — plus spiralled mode/shape/investigation tasks,
 * renderer safety, variety and repeated-call variation.
 * Run: npx tsx scripts/audit-statistica-level6.ts
 */
import { getStatisticaLevel6TaskSet, STATISTICA_LEVEL6_LESSON_IDS } from "@/data/activities/statistica/level6";
import { isPracticeTaskSafe } from "@/lib/task-safety";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

let problems = 0;
const check = (condition: boolean, message: string) => {
  if (!condition) { problems += 1; console.error(`FAIL: ${message}`); }
};
const inRange = (v: number) => v >= 1 && v <= 15;
const inRangeGraph = (v: number) => v >= 1 && v <= 60;
const argmax = (f: number[]) => f.reduce((best, v, i) => (v > f[best]! ? i : best), 0);

function auditTask(lessonId: string, task: PracticeTask) {
  check(isPracticeTaskSafe(task), `${lessonId}: ${task.kind} must be renderable`);
  check(Boolean((task as { feedback?: { correct?: string } }).feedback?.correct), `${lessonId}: ${task.kind} needs feedback`);

  switch (task.kind) {
    case "statisticaClassify": {
      const ids = new Set(task.options.map((o) => o.id));
      check(task.options.length >= 2 && task.correctOptionIds.length === 1 && ids.has(task.correctOptionIds[0]!), `${lessonId}: classify needs one valid answer`);
      check(ids.size === task.options.length, `${lessonId}: classify option ids must be unique`);
      break;
    }
    case "statisticaGraph": {
      check(task.categories.length >= 2 && task.categories.every((c) => inRangeGraph(c.count)), `${lessonId}: graph counts must be 1..60`);
      const ids = new Set(task.options?.map((o) => o.id));
      check(task.correctOptionIds?.length === 1 && ids.has(task.correctOptionIds[0]!), `${lessonId}: graph ${task.mode} needs one valid answer`);
      if (task.mode === "read") {
        const opts = task.options ?? [];
        const answerId = task.correctOptionIds?.[0];
        if (opts.every((o) => task.categories.some((c) => c.id === o.id))) {
          const top = task.categories[argmax(task.categories.map((c) => c.count))]!;
          check(answerId === top.id, `${lessonId}: mode answer must be the tallest column`);
        }
      }
      break;
    }
    case "statisticaShape": {
      const ids = new Set(task.options.map((o) => o.id));
      check(task.options.length >= 2 && task.correctOptionIds.length === 1 && ids.has(task.correctOptionIds[0]!), `${lessonId}: shape needs one valid answer`);
      check(task.categories.length >= 2 && task.categories.every((c) => inRangeGraph(c.count)), `${lessonId}: shape counts must be 1..60`);
      if (task.categoriesB) {
        check(task.categoriesB.every((c) => inRangeGraph(c.count)), `${lessonId}: second data set counts must be 1..60`);
        // A range comparison answer must name the group with the wider spread.
        if (task.prompt.includes("range")) {
          const ra = Math.max(...task.categories.map((c) => c.count)) - Math.min(...task.categories.map((c) => c.count));
          const rb = Math.max(...task.categoriesB.map((c) => c.count)) - Math.min(...task.categoriesB.map((c) => c.count));
          check(ra !== rb, `${lessonId}: compared ranges must differ`);
          check(task.correctOptionIds[0] === (ra > rb ? "a" : "b"), `${lessonId}: range-compare answer must be the wider group`);
        }
      }
      break;
    }
    case "statisticaInference": {
      const ids = new Set(task.options.map((o) => o.id));
      check(task.options.length >= 2 && task.correctOptionIds.length === 1 && ids.has(task.correctOptionIds[0]!), `${lessonId}: inference needs one valid answer`);
      check(task.categories.length >= 2 && task.categories.every((c) => inRangeGraph(c.count)), `${lessonId}: inference graph counts must be 1..60`);
      // A range answer must equal highest - lowest of the plotted values.
      if (task.prompt.includes("RANGE")) {
        const counts = task.categories.map((c) => c.count);
        const r = Math.max(...counts) - Math.min(...counts);
        const n = Number(task.options.find((o) => o.id === task.correctOptionIds[0])?.label);
        check(n === r, `${lessonId}: range answer must equal highest minus lowest`);
      }
      break;
    }
    case "statisticaInvestigation": {
      check(task.surveys.length === 4, `${lessonId}: investigation must offer 4 survey choices`);
      check(new Set(task.surveys.map((s) => s.question)).size === 4, `${lessonId}: the 4 survey choices must be distinct`);
      break;
    }
    default:
      break;
  }
}

function family(task: PracticeTask) {
  if (task.kind === "statisticaShape") return `shape:${task.mode}`;
  if (task.kind === "statisticaGraph") return `graph:${task.mode}`;
  return task.kind.replace("statistica", "").toLowerCase();
}
function fingerprint(task: PracticeTask) {
  const r = { ...(task as unknown as Record<string, unknown>) };
  delete r.target; delete r.feedback; delete r.speakText;
  return JSON.stringify(r);
}
const SOLO_FAMILIES = new Set(["classify", "investigation"]);

const coverage: Array<{ lesson: string; a1: string; a2: string; a3: string }> = [];
let taskCount = 0;
let sawRange = false;
let sawCritique = false;

for (const lessonId of STATISTICA_LEVEL6_LESSON_IDS) {
  const sample = getStatisticaLevel6TaskSet(lessonId);
  check(Boolean(sample), `${lessonId}: missing task set`);
  if (!sample) continue;

  const activities = sample.activities.map((a) => a() as PracticeTask);
  const week = Number(/-w(\d+)-/.exec(lessonId)?.[1] ?? 0);
  const families = activities.map(family);
  if (activities.some((t) => t.kind === "statisticaInference" && t.prompt.includes("RANGE"))) sawRange = true;
  if (activities.some((t) => t.kind === "statisticaClassify" && /misleading|support the claim/i.test(t.prompt))) sawCritique = true;
  coverage.push({ lesson: lessonId.replace("y6-statistics-", ""), a1: families[0]!, a2: families[1]!, a3: families[2]! });

  const solo = families.every((f) => f === families[0] && SOLO_FAMILIES.has(f));
  if (week >= 2 && !solo) check(new Set(families).size >= 2, `${lessonId}: cannot repeat one interaction family three times`);

  for (let round = 0; round < 8; round += 1) {
    const set = getStatisticaLevel6TaskSet(lessonId)!;
    for (const task of [set.teaching(), ...set.activities.map((a) => a())] as PracticeTask[]) {
      taskCount += 1;
      auditTask(lessonId, task);
    }
  }

  sample.activities.forEach((_, slot) => {
    const vs = getStatisticaLevel6TaskSet(lessonId)!;
    const sigs = Array.from({ length: 12 }, () => fingerprint(vs.activities[slot]!() as PracticeTask));
    check(new Set(sigs).size >= 10, `${lessonId} activity ${slot + 1}: needs >=10 distinct variants across 12 calls`);
  });
}

check(STATISTICA_LEVEL6_LESSON_IDS.length === 18, `Level 6 should have 18 lessons (6 weeks), found ${STATISTICA_LEVEL6_LESSON_IDS.length}`);
check(sawRange, "Level 6 must use range calculations");
check(sawCritique, "Level 6 must critique misleading statistics");

console.log("\nStatistica Level 6 activity coverage");
console.table(coverage);

if (problems > 0) {
  console.error(`\nStatistica Level 6 audit failed with ${problems} problem(s).`);
  process.exit(1);
}
console.log(`Statistica Level 6 audit passed: 18 lessons, ${taskCount} generated tasks validated.`);
