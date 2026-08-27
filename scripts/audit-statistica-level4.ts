/* Statistica Level 4 production audit (6-week / 18-lesson structure). Validates
 * answer correctness for the new many-to-one pictograph and distribution-shape
 * tasks (plus spiralled Year-3 graphs/tables), renderer safety, interaction
 * variety and repeated-call variation. Run: npx tsx scripts/audit-statistica-level4.ts
 */
import { getStatisticaLevel4TaskSet, STATISTICA_LEVEL4_LESSON_IDS } from "@/data/activities/statistica/level4";
import { isPracticeTaskSafe } from "@/lib/task-safety";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

let problems = 0;
const check = (condition: boolean, message: string) => {
  if (!condition) { problems += 1; console.error(`FAIL: ${message}`); }
};
const inRange = (v: number) => v >= 1 && v <= 15;
// Year-4 column graphs scale into the 40s (by 10s), so graph/inference reads
// carry two-digit counts; shape/table stay small (0-4 frequencies).
const inRangeGraph = (v: number) => v >= 1 && v <= 50;
const argmax = (f: number[]) => f.reduce((best, v, i) => (v > f[best]! ? i : best), 0);
const bucket = (i: number) => (i <= 1 ? "low" : i === 2 ? "middle" : "high");
const variance = (f: number[]) => {
  const n = f.reduce((a, b) => a + b, 0);
  const mean = f.reduce((s, v, i) => s + v * i, 0) / n;
  return f.reduce((s, v, i) => s + v * (i - mean) ** 2, 0) / n;
};

function auditTask(lessonId: string, task: PracticeTask) {
  check(isPracticeTaskSafe(task), `${lessonId}: ${task.kind} must be renderable`);
  check(Boolean((task as { feedback?: { correct?: string } }).feedback?.correct), `${lessonId}: ${task.kind} needs feedback`);

  switch (task.kind) {
    case "statisticaPictograph": {
      check([2, 5, 10].includes(task.keyUnits), `${lessonId}: pictograph key must be 2/5/10`);
      check(Boolean(task.unitNoun) && Boolean(task.symbolLabel), `${lessonId}: pictograph needs a unit + symbol`);
      check(task.categories.length >= 2 && task.categories.every((c) => c.count > 0), `${lessonId}: pictograph rows malformed`);
      // Every total must be a whole or half number of symbols.
      check(task.categories.every((c) => (c.count * 2) % task.keyUnits === 0), `${lessonId}: pictograph totals must be whole/half symbols`);
      if (task.mode === "build") {
        check(task.categories.every((c) => c.count % task.keyUnits === 0), `${lessonId}: build totals must be whole symbols`);
      } else {
        const ids = new Set((task.options ?? []).map((o) => o.id));
        check((task.options?.length ?? 0) >= 3 && task.correctOptionIds?.length === 1 && ids.has(task.correctOptionIds![0]!), `${lessonId}: pictograph ${task.mode} needs one valid answer`);
        const answer = Number((task.options ?? []).find((o) => o.id === task.correctOptionIds![0])?.label);
        if (task.mode === "compare") {
          const counts = task.categories.map((c) => c.count);
          check(answer === Math.max(...counts) - Math.min(...counts), `${lessonId}: pictograph compare answer must equal the difference`);
        } else {
          check(task.categories.some((c) => c.count === answer), `${lessonId}: pictograph ${task.mode} answer must be a row total`);
        }
      }
      break;
    }
    case "statisticaShape": {
      const ids = new Set(task.options.map((o) => o.id));
      check(task.options.length >= 2 && task.correctOptionIds.length === 1 && ids.has(task.correctOptionIds[0]!), `${lessonId}: shape needs one valid answer`);
      check(task.categories.length >= 2 && task.categories.every((c) => inRange(c.count)), `${lessonId}: shape counts must be 1..15`);
      const fa = task.categories.map((c) => c.count);
      const answer = task.correctOptionIds[0]!;
      if (task.mode === "concentrated") {
        check(bucket(argmax(fa)) === answer, `${lessonId}: concentrated answer must match the tallest columns`);
      } else if (task.mode === "spread") {
        if (answer === "even") check(Math.max(...fa) - Math.min(...fa) <= 2, `${lessonId}: 'even' spread must be near-uniform`);
        else check(bucket(argmax(fa)) === answer, `${lessonId}: spread answer must match the peak`);
      } else {
        check(Boolean(task.categoriesB) && task.categoriesB!.every((c) => inRange(c.count)), `${lessonId}: ${task.mode} needs a valid second data set`);
        const fb = task.categoriesB!.map((c) => c.count);
        if (task.mode === "variation") {
          check(variance(fa) !== variance(fb), `${lessonId}: variation sets must differ in spread`);
          check(answer === (variance(fa) > variance(fb) ? "a" : "b"), `${lessonId}: variation answer must be the more-spread set`);
        } else {
          check(argmax(fa) !== argmax(fb), `${lessonId}: compare sets must peak at different values`);
          check(answer === (argmax(fa) > argmax(fb) ? "a" : "b"), `${lessonId}: compare answer must be the higher-peaking set`);
        }
      }
      break;
    }
    case "statisticaGraph": {
      check(task.categories.length >= 2 && task.categories.every((c) => inRangeGraph(c.count)), `${lessonId}: graph counts must be 1..50`);
      if (task.mode !== "build") {
        const ids = new Set(task.options?.map((o) => o.id));
        check(task.correctOptionIds?.length === 1 && ids.has(task.correctOptionIds[0]!), `${lessonId}: graph ${task.mode} needs one valid answer`);
      }
      if (task.mode === "read") {
        const opts = task.options ?? [];
        const answerId = task.correctOptionIds?.[0];
        if (opts.every((o) => task.categories.some((c) => c.id === o.id))) {
          check(task.categories.some((c) => c.id === answerId), `${lessonId}: category read answer must be real`);
        } else {
          const n = Number(opts.find((o) => o.id === answerId)?.label);
          check(task.categories.some((c) => c.count === n), `${lessonId}: frequency read answer must equal a count`);
        }
      }
      break;
    }
    case "statisticaTable": {
      check(task.rows.length >= 2 && task.rows.every((r) => inRange(r.count)), `${lessonId}: table counts must be 1..15`);
      if (task.mode === "select") check(Boolean(task.correctRowId && task.rows.some((r) => r.id === task.correctRowId)), `${lessonId}: table select needs a real row`);
      else check(Boolean(task.answerCount && task.rows.some((r) => r.count === task.answerCount)), `${lessonId}: table count answer must be shown`);
      break;
    }
    case "statisticaInference": {
      const ids = new Set(task.options.map((o) => o.id));
      check(task.options.length >= 3 && task.correctOptionIds.length === 1 && ids.has(task.correctOptionIds[0]!), `${lessonId}: inference needs one valid answer`);
      check(task.categories.length >= 2 && task.categories.every((c) => inRangeGraph(c.count)), `${lessonId}: inference graph counts must be 1..50`);
      break;
    }
    default:
      break;
  }
}

function family(task: PracticeTask) {
  if (task.kind === "statisticaPictograph") return `pictograph:${task.mode}`;
  if (task.kind === "statisticaShape") return `shape:${task.mode}`;
  if (task.kind === "statisticaGraph") return `graph:${task.mode}`;
  if (task.kind === "statisticaTable") return `table:${task.mode}`;
  return task.kind.replace("statistica", "").toLowerCase();
}
function fingerprint(task: PracticeTask) {
  const r = { ...(task as unknown as Record<string, unknown>) };
  delete r.target; delete r.feedback; delete r.speakText;
  return JSON.stringify(r);
}

const coverage: Array<{ lesson: string; teach: string; a1: string; a2: string; a3: string }> = [];
let taskCount = 0;
let sawPictoRead = false;
let sawPictoBuild = false;
let sawConcentrated = false;
let sawVariation = false;

for (const lessonId of STATISTICA_LEVEL4_LESSON_IDS) {
  const sample = getStatisticaLevel4TaskSet(lessonId);
  check(Boolean(sample), `${lessonId}: missing task set`);
  if (!sample) continue;

  const teaching = sample.teaching() as PracticeTask;
  const activities = sample.activities.map((a) => a() as PracticeTask);
  const week = Number(/-w(\d+)-/.exec(lessonId)?.[1] ?? 0);
  const families = activities.map(family);
  if (lessonId === "y4-statistics-w1-l3") {
    check(
      [family(teaching), ...families].every((item) => item.startsWith("pictograph:")),
      `${lessonId}: Calculate Frequencies must stay on many-to-one pictographs, not Level 3 column graphs`,
    );
  }
  if (activities.some((t) => t.kind === "statisticaPictograph" && (t.mode === "read" || t.mode === "calc"))) sawPictoRead = true;
  if (activities.some((t) => t.kind === "statisticaPictograph" && t.mode === "build")) sawPictoBuild = true;
  if (activities.some((t) => t.kind === "statisticaShape" && t.mode === "concentrated")) sawConcentrated = true;
  if (activities.some((t) => t.kind === "statisticaShape" && t.mode === "variation")) sawVariation = true;
  coverage.push({ lesson: lessonId.replace("y4-statistics-", ""), teach: family(teaching), a1: families[0]!, a2: families[1]!, a3: families[2]! });

  if (week >= 2) check(new Set(families).size >= 2, `${lessonId}: cannot repeat one interaction family three times`);

  for (let round = 0; round < 8; round += 1) {
    const set = getStatisticaLevel4TaskSet(lessonId)!;
    for (const task of [set.teaching(), ...set.activities.map((a) => a())] as PracticeTask[]) {
      taskCount += 1;
      auditTask(lessonId, task);
    }
  }

  sample.activities.forEach((_, slot) => {
    const vs = getStatisticaLevel4TaskSet(lessonId)!;
    const sigs = Array.from({ length: 12 }, () => fingerprint(vs.activities[slot]!() as PracticeTask));
    check(new Set(sigs).size >= 10, `${lessonId} activity ${slot + 1}: needs >=10 distinct variants across 12 calls (kids should rarely see a repeat)`);
  });
}

check(STATISTICA_LEVEL4_LESSON_IDS.length === 18, `Level 4 should have 18 lessons (6 weeks), found ${STATISTICA_LEVEL4_LESSON_IDS.length}`);
check(sawPictoRead, "Level 4 must use many-to-one pictograph reading");
check(sawPictoBuild, "Level 4 must use pictograph building");
check(sawConcentrated, "Level 4 must use distribution-concentration tasks");
check(sawVariation, "Level 4 must use variation tasks");

console.log("\nStatistica Level 4 activity coverage");
console.table(coverage);

if (problems > 0) {
  console.error(`\nStatistica Level 4 audit failed with ${problems} problem(s).`);
  process.exit(1);
}
console.log(`Statistica Level 4 audit passed: 18 lessons, ${taskCount} generated tasks validated.`);
