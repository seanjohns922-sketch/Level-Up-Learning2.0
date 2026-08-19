/* Statistica Level 1 production audit. Validates correctness, renderer safety,
 * lesson-family coverage and repeated-call variation across the 8 x 3 scope.
 * Run: npm run qa:statistica-level1
 */
import { getStatisticaLevel1TaskSet, STATISTICA_LEVEL1_LESSON_IDS } from "@/data/activities/statistica/level1";
import { isPracticeTaskSafe } from "@/lib/task-safety";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

let problems = 0;
const check = (condition: boolean, message: string) => {
  if (!condition) {
    problems += 1;
    console.error(`FAIL: ${message}`);
  }
};

function unique<T>(values: T[]) {
  return new Set(values).size === values.length;
}

function frequencyRangeForWeek(week: number): readonly [number, number] {
  if (week === 6) return [9, 12];
  if (week === 7) return [15, 20];
  return [1, 8];
}

function frequenciesMatchWeek(values: number[], week: number) {
  const [minimum, maximum] = frequencyRangeForWeek(week);
  return values.every((value) => value >= minimum && value <= maximum);
}

function auditTask(lessonId: string, task: PracticeTask) {
  const week = Number(/-w(\d+)-/.exec(lessonId)?.[1] ?? 0);
  const [minimumFrequency, maximumFrequency] = frequencyRangeForWeek(week);
  check(isPracticeTaskSafe(task), `${lessonId}: ${task.kind} must be renderable`);
  check(Boolean((task as { feedback?: { correct?: string; wrong?: string } }).feedback?.correct), `${lessonId}: ${task.kind} needs feedback`);

  switch (task.kind) {
    case "statisticaCollect": {
      const categoryIds = new Set(task.categories.map((category) => category.id));
      check(task.categories.length >= 2 && task.items.length >= 4, `${lessonId}: collect needs categories and items`);
      check(task.items.every((item) => categoryIds.has(item.category)), `${lessonId}: collect items must use listed categories`);
      const counts = task.categories.map((category) => ({ id: category.id, count: task.items.filter((item) => item.category === category.id).length }));
      const answer = /MOST/.test(task.question)
        ? [...counts].sort((a, b) => b.count - a.count)[0]!.id
        : [...counts].sort((a, b) => a.count - b.count)[0]!.id;
      check(task.correctOptionIds.length === 1 && task.correctOptionIds[0] === answer, `${lessonId}: collect answer must match gathered counts`);
      break;
    }
    case "statisticaSort": {
      const categoryIds = new Set(task.categories.map((category) => category.id));
      check(task.categories.length >= 2 && task.items.length >= 2, `${lessonId}: sort needs categories and items`);
      check(task.items.every((item) => categoryIds.has(item.category)), `${lessonId}: sort items must use listed categories`);
      break;
    }
    case "statisticaTally": {
      check(task.count >= 1 && task.count <= 25, `${lessonId}: tally count must be 1..25`);
      if (week === 3) check(task.count >= 15, `${lessonId}: Week 3 tallies must reach the teens or twenties`);
      if (task.mode === "read") {
        const answer = task.options?.find((option) => option.id === task.correctOptionIds?.[0]);
        check(task.correctOptionIds?.length === 1 && answer?.label === String(task.count), `${lessonId}: tally answer must match shown marks`);
      }
      break;
    }
    case "statisticaGraph": {
      check(task.categories.length >= 2 && frequenciesMatchWeek(task.categories.map((category) => category.count), week), `${lessonId}: graph counts must be ${minimumFrequency}..${maximumFrequency}`);
      if (week === 4) check(task.display === "objects", `${lessonId}: Week 4 must use one-to-one object displays`);
      if (week === 5) check(task.display === "pictures", `${lessonId}: Week 5 must use one-to-one picture displays`);
      if (task.mode !== "build") {
        const optionIds = new Set(task.options?.map((option) => option.id));
        check(task.correctOptionIds?.length === 1 && optionIds.has(task.correctOptionIds[0]!), `${lessonId}: graph ${task.mode} needs one valid answer`);
      }
      if (task.mode === "compare") {
        const [a, b] = task.categories;
        const answer = a!.count > b!.count ? "a" : a!.count < b!.count ? "b" : "eq";
        check(task.correctOptionIds?.[0] === answer, `${lessonId}: graph comparison answer must match frequencies`);
      }
      break;
    }
    case "statisticaTapGraph": {
      const ordered = [...task.categories].sort((a, b) => task.ask === "most" ? b.count - a.count : a.count - b.count);
      check(task.categories.length >= 3 && unique(task.categories.map((category) => category.count)), `${lessonId}: tap graph needs three distinct frequencies`);
      check(frequenciesMatchWeek(task.categories.map((category) => category.count), week), `${lessonId}: tap graph counts must be ${minimumFrequency}..${maximumFrequency}`);
      check(task.correctCategoryId === ordered[0]!.id, `${lessonId}: tap graph answer must be the ${task.ask}`);
      if (week === 4) check(task.display === "objects", `${lessonId}: Week 4 tap tasks must use object displays`);
      if (week === 5) check(task.display === "pictures", `${lessonId}: Week 5 tap tasks must use picture displays`);
      break;
    }
    case "statisticaRank": {
      const ordered = [...task.categories]
        .sort((a, b) => task.direction === "most-to-least" ? b.count - a.count : a.count - b.count)
        .map((category) => category.id);
      check(task.categories.length === 3 && unique(task.categories.map((category) => category.count)), `${lessonId}: rank needs three distinct frequencies`);
      check(frequenciesMatchWeek(task.categories.map((category) => category.count), week), `${lessonId}: rank counts must be ${minimumFrequency}..${maximumFrequency}`);
      check(task.correctOrderIds.length === 3 && task.correctOrderIds.every((id, index) => id === ordered[index]), `${lessonId}: rank order must match frequencies`);
      break;
    }
    case "statisticaGap": {
      const [a, b] = task.categories;
      const difference = Math.abs(a!.count - b!.count);
      const larger = a!.count > b!.count ? a! : b!;
      check(task.categories.length === 2 && difference >= 1 && difference <= 4, `${lessonId}: gap needs a clear small difference`);
      check(frequenciesMatchWeek(task.categories.map((category) => category.count), week), `${lessonId}: gap counts must be ${minimumFrequency}..${maximumFrequency}`);
      check(task.difference === difference && task.largerCategoryId === larger.id, `${lessonId}: gap answer must match the two frequencies`);
      break;
    }
    case "statisticaTable": {
      check(task.rows.length === 3 && frequenciesMatchWeek(task.rows.map((row) => row.count), week), `${lessonId}: table counts must be ${minimumFrequency}..${maximumFrequency}`);
      if (task.mode === "select") {
        check(Boolean(task.correctRowId && task.rows.some((row) => row.id === task.correctRowId)), `${lessonId}: table selection needs a listed answer row`);
      } else {
        check(Boolean(task.answerCount && task.rows.some((row) => row.count === task.answerCount)), `${lessonId}: table count answer must be shown in the table`);
      }
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
  const record = { ...(task as unknown as Record<string, unknown>) };
  delete record.target;
  delete record.feedback;
  delete record.speakText;
  return JSON.stringify(record);
}

const coverage: Array<{ lesson: string; teaching: string; activity1: string; activity2: string; activity3: string }> = [];
const graphModeWeeks = new Map<string, Set<number>>();
let taskCount = 0;

for (const lessonId of STATISTICA_LEVEL1_LESSON_IDS) {
  const sample = getStatisticaLevel1TaskSet(lessonId);
  check(Boolean(sample), `${lessonId}: missing task set`);
  if (!sample) continue;

  const teaching = sample.teaching() as PracticeTask;
  const activities = sample.activities.map((activity) => activity() as PracticeTask);
  const week = Number(/-w(\d+)-/.exec(lessonId)?.[1] ?? 0);
  const families = activities.map(family);
  coverage.push({ lesson: lessonId, teaching: family(teaching), activity1: families[0]!, activity2: families[1]!, activity3: families[2]! });

  if (week >= 2) check(new Set(families).size >= 2, `${lessonId}: cannot repeat one interaction family three times`);
  for (const task of activities) {
    if (task.kind === "statisticaGraph" && task.mode !== "build") {
      if (!graphModeWeeks.has(task.mode)) graphModeWeeks.set(task.mode, new Set());
      graphModeWeeks.get(task.mode)!.add(week);
    }
  }

  for (let round = 0; round < 8; round += 1) {
    const set = getStatisticaLevel1TaskSet(lessonId)!;
    const tasks = [set.teaching(), ...set.activities.map((activity) => activity())] as PracticeTask[];
    for (const task of tasks) {
      taskCount += 1;
      auditTask(lessonId, task);
    }
  }

  sample.activities.forEach((_, slot) => {
    const variationSet = getStatisticaLevel1TaskSet(lessonId)!;
    const signatures = Array.from({ length: 12 }, () => fingerprint(variationSet.activities[slot]!() as PracticeTask));
    check(new Set(signatures).size >= 5, `${lessonId} activity ${slot + 1}: needs at least five meaningful variants across twelve calls`);
  });
}

for (const [mode, weeksSet] of graphModeWeeks) {
  const weeks = [...weeksSet].sort((a, b) => a - b);
  let run = 1;
  let longest = 1;
  for (let index = 1; index < weeks.length; index += 1) {
    run = weeks[index] === weeks[index - 1]! + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  check(longest <= 2, `graph:${mode} cannot dominate more than two consecutive weeks`);
}

check(STATISTICA_LEVEL1_LESSON_IDS.length === 24, `Level 1 should have 24 lessons, found ${STATISTICA_LEVEL1_LESSON_IDS.length}`);

console.log("\nStatistica Level 1 activity coverage");
console.table(coverage);

if (problems > 0) {
  console.error(`\nStatistica Level 1 audit failed with ${problems} problem(s).`);
  process.exit(1);
}
console.log(`Statistica Level 1 audit passed: 24 lessons, ${taskCount} generated tasks validated with repeated-call variation.`);
