/* Statistica Level 3 production audit (6-week / 18-lesson structure). Validates
 * answer correctness, renderer safety, interaction variety and repeated-call
 * variation. Run: npx tsx scripts/audit-statistica-level3.ts
 */
import { getStatisticaLevel3TaskSet, STATISTICA_LEVEL3_LESSON_IDS } from "@/data/activities/statistica/level3";
import { isPracticeTaskSafe } from "@/lib/task-safety";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

let problems = 0;
const check = (condition: boolean, message: string) => {
  if (!condition) { problems += 1; console.error(`FAIL: ${message}`); }
};
const unique = <T,>(v: T[]) => new Set(v).size === v.length;
const inRange = (v: number) => v >= 1 && v <= 12;

function auditTask(lessonId: string, task: PracticeTask) {
  check(isPracticeTaskSafe(task), `${lessonId}: ${task.kind} must be renderable`);
  check(Boolean((task as { feedback?: { correct?: string } }).feedback?.correct), `${lessonId}: ${task.kind} needs feedback`);

  switch (task.kind) {
    case "statisticaClassify": {
      const ids = new Set(task.options.map((o) => o.id));
      check(task.options.length === 2 && task.correctOptionIds.length === 1 && ids.has(task.correctOptionIds[0]!), `${lessonId}: classify needs one valid answer`);
      check(["categorical", "numerical"].includes(task.correctOptionIds[0]!), `${lessonId}: classify answer must be categorical/numerical`);
      break;
    }
    case "statisticaCollect": {
      const ids = new Set(task.categories.map((c) => c.id));
      check(task.categories.length >= 2 && task.items.length >= 4 && task.items.every((it) => ids.has(it.category)), `${lessonId}: collect malformed`);
      const counts = task.categories.map((c) => ({ id: c.id, n: task.items.filter((it) => it.category === c.id).length }));
      const want = /MOST/.test(task.question) ? [...counts].sort((a, b) => b.n - a.n)[0]!.id : [...counts].sort((a, b) => a.n - b.n)[0]!.id;
      check(task.correctOptionIds[0] === want, `${lessonId}: collect answer must match gathered counts`);
      break;
    }
    case "statisticaSort": {
      const ids = new Set(task.categories.map((c) => c.id));
      check(task.categories.length >= 2 && task.items.length >= 2 && task.items.every((it) => ids.has(it.category)), `${lessonId}: sort malformed`);
      break;
    }
    case "statisticaTally": {
      check(task.count >= 1 && task.count <= 25, `${lessonId}: tally count out of range`);
      if (task.mode === "read") {
        const ans = task.options?.find((o) => o.id === task.correctOptionIds?.[0]);
        check(task.correctOptionIds?.length === 1 && ans?.label === String(task.count), `${lessonId}: tally read answer must match marks`);
      }
      break;
    }
    case "statisticaGraph": {
      check(task.categories.length >= 2 && task.categories.every((c) => inRange(c.count)), `${lessonId}: graph counts must be 1..12`);
      if (task.mode !== "build") {
        const ids = new Set(task.options?.map((o) => o.id));
        check(task.correctOptionIds?.length === 1 && ids.has(task.correctOptionIds[0]!), `${lessonId}: graph ${task.mode} needs one valid answer`);
      }
      if (task.mode === "compare") {
        const [a, b] = task.categories;
        const truth = a!.count > b!.count ? "a" : a!.count < b!.count ? "b" : "eq";
        check(task.correctOptionIds?.[0] === truth, `${lessonId}: compare answer must match counts`);
      }
      if (task.mode === "read") {
        const opts = task.options ?? [];
        const answerId = task.correctOptionIds?.[0];
        if (opts.every((o) => task.categories.some((c) => c.id === o.id))) {
          check(task.categories.some((c) => c.id === answerId), `${lessonId}: category read answer must be real`);
        } else {
          const n = Number(opts.find((o) => o.id === answerId)?.label);
          check(task.categories.some((c) => c.count === n), `${lessonId}: frequency read answer ${n} must equal a count`);
        }
      }
      break;
    }
    case "statisticaTapGraph": {
      const ordered = [...task.categories].sort((a, b) => task.ask === "most" ? b.count - a.count : a.count - b.count);
      check(task.categories.length >= 3 && unique(task.categories.map((c) => c.count)), `${lessonId}: tap graph needs distinct counts`);
      check(task.correctCategoryId === ordered[0]!.id, `${lessonId}: tap graph answer must be the ${task.ask}`);
      break;
    }
    case "statisticaRank": {
      const ordered = [...task.categories].sort((a, b) => task.direction === "most-to-least" ? b.count - a.count : a.count - b.count).map((c) => c.id);
      check(task.categories.length === 3 && unique(task.categories.map((c) => c.count)), `${lessonId}: rank needs distinct counts`);
      check(task.correctOrderIds.length === 3 && task.correctOrderIds.every((id, i) => id === ordered[i]), `${lessonId}: rank order must match counts`);
      break;
    }
    case "statisticaGap": {
      const [a, b] = task.categories;
      const diff = Math.abs(a!.count - b!.count);
      const larger = a!.count > b!.count ? a! : b!;
      check(task.categories.length === 2 && diff >= 1, `${lessonId}: gap needs a difference`);
      check(task.difference === diff && task.largerCategoryId === larger.id, `${lessonId}: gap answer must match counts`);
      break;
    }
    case "statisticaTable": {
      check(task.rows.length >= 2 && task.rows.every((r) => inRange(r.count)), `${lessonId}: table counts must be 1..12`);
      if (task.mode === "select") check(Boolean(task.correctRowId && task.rows.some((r) => r.id === task.correctRowId)), `${lessonId}: table select needs a real row`);
      else check(Boolean(task.answerCount && task.rows.some((r) => r.count === task.answerCount)), `${lessonId}: table count answer must be shown`);
      break;
    }
    default:
      break;
  }
}

function family(task: PracticeTask) {
  if (task.kind === "statisticaGraph") return `graph:${task.mode}`;
  if (task.kind === "statisticaTally") return `tally:${task.mode}`;
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
let sawClassify = false;
let sawNumerical = false;

for (const lessonId of STATISTICA_LEVEL3_LESSON_IDS) {
  const sample = getStatisticaLevel3TaskSet(lessonId);
  check(Boolean(sample), `${lessonId}: missing task set`);
  if (!sample) continue;

  const teaching = sample.teaching() as PracticeTask;
  const activities = sample.activities.map((a) => a() as PracticeTask);
  const week = Number(/-w(\d+)-/.exec(lessonId)?.[1] ?? 0);
  const families = activities.map(family);
  if (activities.some((t) => t.kind === "statisticaClassify")) sawClassify = true;
  if (activities.some((t) => t.kind === "statisticaGraph" && t.display === "columns" && t.categories.every((c) => /^\d+$/.test(c.label)))) sawNumerical = true;
  coverage.push({ lesson: lessonId.replace("y3-statistics-", ""), teach: family(teaching), a1: families[0]!, a2: families[1]!, a3: families[2]! });

  if (week >= 2) check(new Set(families).size >= 2, `${lessonId}: cannot repeat one interaction family three times`);

  for (let round = 0; round < 8; round += 1) {
    const set = getStatisticaLevel3TaskSet(lessonId)!;
    for (const task of [set.teaching(), ...set.activities.map((a) => a())] as PracticeTask[]) {
      taskCount += 1;
      auditTask(lessonId, task);
    }
  }

  sample.activities.forEach((_, slot) => {
    const vs = getStatisticaLevel3TaskSet(lessonId)!;
    const sigs = Array.from({ length: 12 }, () => fingerprint(vs.activities[slot]!() as PracticeTask));
    check(new Set(sigs).size >= 5, `${lessonId} activity ${slot + 1}: needs >=5 variants across 12 calls`);
  });
}

check(STATISTICA_LEVEL3_LESSON_IDS.length === 18, `Level 3 should have 18 lessons (6 weeks), found ${STATISTICA_LEVEL3_LESSON_IDS.length}`);
check(sawClassify, "Level 3 must use the classify (data type) task");
check(sawNumerical, "Level 3 must use numerical-data column graphs");

console.log("\nStatistica Level 3 activity coverage");
console.table(coverage);

if (problems > 0) {
  console.error(`\nStatistica Level 3 audit failed with ${problems} problem(s).`);
  process.exit(1);
}
console.log(`Statistica Level 3 audit passed: 18 lessons, ${taskCount} generated tasks validated.`);
