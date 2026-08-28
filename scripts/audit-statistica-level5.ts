/* Statistica Level 5 production audit (6-week / 18-lesson structure). Validates
 * answer correctness for the new Year-5 tasks — line graphs (change over time),
 * mode, nominal/ordinal data-typing and data validation — plus spiralled shape
 * and investigation tasks, renderer safety, interaction variety and
 * repeated-call variation. Run: npx tsx scripts/audit-statistica-level5.ts
 */
import { getStatisticaLevel5TaskSet, STATISTICA_LEVEL5_LESSON_IDS } from "@/data/activities/statistica/level5";
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
        // A category read (mode) answer must be the value with the greatest count.
        if (opts.every((o) => task.categories.some((c) => c.id === o.id))) {
          const top = task.categories[argmax(task.categories.map((c) => c.count))]!;
          check(answerId === top.id, `${lessonId}: mode answer must be the tallest column`);
        } else {
          const n = Number(opts.find((o) => o.id === answerId)?.label);
          check(task.categories.some((c) => c.count === n), `${lessonId}: frequency read answer must equal a count`);
        }
      }
      break;
    }
    case "statisticaShape": {
      check(task.options.length >= 2 && task.correctOptionIds.length === 1, `${lessonId}: shape needs one valid answer`);
      check(task.categories.length >= 2 && task.categories.every((c) => inRange(c.count)), `${lessonId}: shape counts must be 1..15`);
      break;
    }
    case "statisticaInference": {
      const ids = new Set(task.options.map((o) => o.id));
      check(task.options.length >= 2 && task.correctOptionIds.length === 1 && ids.has(task.correctOptionIds[0]!), `${lessonId}: inference needs one valid answer`);
      check(task.categories.length >= 2 && task.categories.every((c) => inRangeGraph(c.count)), `${lessonId}: inference graph counts must be 1..60`);
      break;
    }
    case "statisticaLineGraph": {
      check(task.points.length >= 2 && task.points.every((p) => p.value >= 0 && p.value <= 100), `${lessonId}: line graph needs 2+ points with sensible values`);
      const ids = new Set(task.options.map((o) => o.id));
      check(task.options.length >= 2 && task.correctOptionIds.length === 1 && ids.has(task.correctOptionIds[0]!), `${lessonId}: line graph needs one valid answer`);
      const answerId = task.correctOptionIds[0]!;
      if (task.mode === "read") {
        const n = Number(task.options.find((o) => o.id === answerId)?.label);
        check(task.points.some((p) => p.value === n), `${lessonId}: line read answer must equal a plotted value`);
      } else if (task.mode === "infer") {
        // The answer label must be the peak or the trough.
        const vals = task.points.map((p) => p.value);
        const hi = task.points.find((p) => p.value === Math.max(...vals))!.label;
        const lo = task.points.find((p) => p.value === Math.min(...vals))!.label;
        check(answerId === hi || answerId === lo, `${lessonId}: line infer answer must be the highest or lowest point`);
      }
      break;
    }
    case "statisticaInvestigation": {
      const step = task.buildStep ?? 1;
      check(task.surveys.length === 4, `${lessonId}: investigation must offer 4 survey choices`);
      check(new Set(task.surveys.map((s) => s.question)).size === 4, `${lessonId}: the 4 survey choices must be distinct`);
      for (const s of task.surveys) {
        check(s.categories.every((c) => c.count % step === 0), `${lessonId}: survey counts must be buildable multiples of ${step}`);
        check(s.analyses.length >= 2 && s.analyses.length <= 3, `${lessonId}: each survey needs 2-3 analysis questions`);
      }
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
// Immersive single-mechanic weeks may run three of one family (like L4's
// all-pictograph and all-investigation lessons).
const SOLO_FAMILIES = new Set(["classify", "linegraph", "investigation"]);

const coverage: Array<{ lesson: string; a1: string; a2: string; a3: string }> = [];
let taskCount = 0;
let sawLineGraph = false;
let sawMode = false;

for (const lessonId of STATISTICA_LEVEL5_LESSON_IDS) {
  const sample = getStatisticaLevel5TaskSet(lessonId);
  check(Boolean(sample), `${lessonId}: missing task set`);
  if (!sample) continue;

  const activities = sample.activities.map((a) => a() as PracticeTask);
  const week = Number(/-w(\d+)-/.exec(lessonId)?.[1] ?? 0);
  const families = activities.map(family);
  if (activities.some((t) => t.kind === "statisticaLineGraph")) sawLineGraph = true;
  if (activities.some((t) => t.kind === "statisticaGraph" && t.mode === "read")) sawMode = true;
  coverage.push({ lesson: lessonId.replace("y5-statistics-", ""), a1: families[0]!, a2: families[1]!, a3: families[2]! });

  const solo = families.every((f) => f === families[0] && SOLO_FAMILIES.has(f));
  if (week >= 2 && !solo) check(new Set(families).size >= 2, `${lessonId}: cannot repeat one interaction family three times`);

  for (let round = 0; round < 8; round += 1) {
    const set = getStatisticaLevel5TaskSet(lessonId)!;
    for (const task of [set.teaching(), ...set.activities.map((a) => a())] as PracticeTask[]) {
      taskCount += 1;
      auditTask(lessonId, task);
    }
  }

  sample.activities.forEach((_, slot) => {
    const vs = getStatisticaLevel5TaskSet(lessonId)!;
    const sigs = Array.from({ length: 12 }, () => fingerprint(vs.activities[slot]!() as PracticeTask));
    check(new Set(sigs).size >= 10, `${lessonId} activity ${slot + 1}: needs >=10 distinct variants across 12 calls`);
  });
}

check(STATISTICA_LEVEL5_LESSON_IDS.length === 18, `Level 5 should have 18 lessons (6 weeks), found ${STATISTICA_LEVEL5_LESSON_IDS.length}`);
check(sawLineGraph, "Level 5 must use line graphs");
check(sawMode, "Level 5 must use mode reads");

console.log("\nStatistica Level 5 activity coverage");
console.table(coverage);

if (problems > 0) {
  console.error(`\nStatistica Level 5 audit failed with ${problems} problem(s).`);
  process.exit(1);
}
console.log(`Statistica Level 5 audit passed: 18 lessons, ${taskCount} generated tasks validated.`);
