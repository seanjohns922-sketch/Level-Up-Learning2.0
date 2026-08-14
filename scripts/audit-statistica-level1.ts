/* Audit for Statistica Level 1 (Year 1, AC9M1ST01/ST02). Generates every
 * lesson's tasks over several rounds and checks each is well-formed and its
 * answer matches the data. Run: npx tsx scripts/audit-statistica-level1.ts
 */
import { getStatisticaLevel1TaskSet, STATISTICA_LEVEL1_LESSON_IDS } from "@/data/activities/statistica/level1";
import { isPracticeTaskSafe } from "@/lib/task-safety";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

let problems = 0;
const check = (cond: boolean, message: string) => { if (!cond) { problems += 1; console.error(`FAIL: ${message}`); } };

type SortT = Extract<PracticeTask, { kind: "statisticaSort" }>;
type TallyT = Extract<PracticeTask, { kind: "statisticaTally" }>;
type GraphT = Extract<PracticeTask, { kind: "statisticaGraph" }>;

function auditTask(lessonId: string, task: PracticeTask) {
  check(isPracticeTaskSafe(task), `${lessonId}: ${task.kind} must be renderable`);
  check(Boolean((task as { feedback?: { correct?: string; wrong?: string } }).feedback?.correct), `${lessonId}: ${task.kind} needs feedback`);

  if (task.kind === "statisticaSort") {
    const t = task as SortT;
    const catIds = new Set(t.categories.map((c) => c.id));
    check(t.categories.length >= 2 && t.items.length >= 2, `${lessonId}: sort needs >= 2 categories and items`);
    check(t.items.every((it) => catIds.has(it.category)), `${lessonId}: every sort item must belong to a listed category`);
  } else if (task.kind === "statisticaTally") {
    const t = task as TallyT;
    if (t.mode === "record") {
      check(t.count >= 1 && t.count <= 20, `${lessonId}: tally record count out of range`);
    } else {
      const ids = new Set((t.options ?? []).map((o) => o.id));
      check(ids.size >= 2 && (t.correctOptionIds ?? []).length === 1 && ids.has((t.correctOptionIds ?? [])[0]!), `${lessonId}: tally read needs one valid answer`);
      const correct = (t.options ?? []).find((o) => o.id === (t.correctOptionIds ?? [])[0]);
      check(correct?.label === String(t.count), `${lessonId}: tally read answer must equal the shown count ${t.count}`);
    }
  } else if (task.kind === "statisticaGraph") {
    const t = task as GraphT;
    check(t.categories.length >= 2 && t.categories.every((c) => c.count >= 1 && c.count <= 8), `${lessonId}: graph categories need counts 1..8`);
    if (t.mode === "build") return;
    const ids = new Set((t.options ?? []).map((o) => o.id));
    check(ids.size >= 2 && (t.correctOptionIds ?? []).length === 1 && ids.has((t.correctOptionIds ?? [])[0]!), `${lessonId}: graph ${t.mode} needs one valid answer`);
    const answer = (t.correctOptionIds ?? [])[0]!;
    if (t.mode === "compare") {
      check(["a", "b", "eq"].includes(answer), `${lessonId}: compare answer must be a/b/eq`);
      const [a, b] = [t.categories[0]!, t.categories[1]!];
      const truth = a.count > b.count ? "a" : a.count < b.count ? "b" : "eq";
      check(answer === truth, `${lessonId}: compare answer must match the counts (${a.count} vs ${b.count})`);
    } else if (t.options!.every((o) => t.categories.some((c) => c.id === o.id))) {
      // A "which category" question (most/least/most-popular): answer must be a real category.
      check(t.categories.some((c) => c.id === answer), `${lessonId}: category answer must be a real category`);
    } else {
      // A frequency question: the answer number must equal one category's count.
      const n = Number((t.options ?? []).find((o) => o.id === answer)?.label);
      check(t.categories.some((c) => c.count === n), `${lessonId}: frequency answer ${n} must equal a category count`);
    }
  }
}

let taskCount = 0;
for (const lessonId of STATISTICA_LEVEL1_LESSON_IDS) {
  const built = getStatisticaLevel1TaskSet(lessonId);
  check(Boolean(built), `${lessonId}: missing task set`);
  if (!built) continue;
  for (let round = 0; round < 6; round += 1) {
    const set = getStatisticaLevel1TaskSet(lessonId)!;
    const tasks = [set.teaching(), ...set.activities.map((a) => a())];
    for (const task of tasks) { taskCount += 1; auditTask(lessonId, task as PracticeTask); }
  }
}

check(STATISTICA_LEVEL1_LESSON_IDS.length === 24, `Level 1 should have 24 lessons, found ${STATISTICA_LEVEL1_LESSON_IDS.length}`);

if (problems > 0) {
  console.error(`\nStatistica Level 1 audit failed with ${problems} problem(s).`);
  process.exit(1);
}
console.log(`Statistica Level 1 audit passed: 24 lessons, ${taskCount} generated tasks validated.`);
