import { getStatisticaLevel6TaskSet, mediaClaimTask } from "@/data/activities/statistica/level6";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { isPracticeTaskSafe } from "@/lib/task-safety";

type ClaimTask = Extract<PracticeTask, { kind: "statisticaClassify" }>;

let problems = 0;
const check = (condition: boolean, message: string) => {
  if (!condition) {
    problems += 1;
    console.error(`FAIL: ${message}`);
  }
};

const tasks = Array.from({ length: 12 }, (_, round) => mediaClaimTask(round, round + 1) as ClaimTask);
check(new Set(tasks.map((task) => task.variable)).size === 12, "Week 4 needs twelve distinct media claims");

for (const task of tasks) {
  const label = task.variable;
  check(isPracticeTaskSafe(task), `${label}: task must be renderer-safe`);
  check(task.variableLabel === "Claim", `${label}: claim must be clearly labelled`);
  check(task.examplesLabel === "Survey result", `${label}: numerical result must be clearly labelled`);
  check(Boolean(task.examples.trim()), `${label}: visible results are missing`);
  check(task.supportingDetails?.length === 2, `${label}: sample and collection details are required`);
  check(task.supportingDetails?.[0]?.label === "Who was included", `${label}: sample label is missing`);
  check(task.supportingDetails?.[1]?.label === "How it was collected", `${label}: collection label is missing`);
  check(task.supportingDetails?.every((detail) => detail.value.trim().length > 0) ?? false, `${label}: evidence details cannot be blank`);
  check(task.speakText.includes(task.examples), `${label}: voice-over must read the result`);
  check(task.supportingDetails?.every((detail) => task.speakText.includes(detail.value)) ?? false, `${label}: voice-over must read all evidence`);
  const optionIds = new Set(task.options.map((option) => option.id));
  check(task.correctOptionIds.length === 1 && optionIds.has(task.correctOptionIds[0]!), `${label}: verdict must reference a visible option`);
}

const everyone = tasks.find((task) => /Everyone prefers/.test(task.variable));
check(Boolean(everyone?.examples.includes("18 of 25") && everyone.correctOptionIds[0] === "misleading"), "The brand claim must show 18 of 25 and reject 'everyone'");
const always = tasks.find((task) => /always on time/.test(task.variable));
check(Boolean(always?.examples.includes("96 of 100") && always.correctOptionIds[0] === "misleading"), "The bus claim must reject 'always' when four trips were late");

const verdicts = new Set(tasks.map((task) => task.correctOptionIds[0]));
check(["fair", "misleading", "insufficient"].every((verdict) => verdicts.has(verdict)), "Week 4 must practise all three evidence verdicts");

const expectedModes = [
  ["calculate", "compare", "conclusion"],
  ["method", "method", "conclusion"],
  ["conclusion", "conclusion", "method"],
];
for (let lesson = 1; lesson <= 3; lesson += 1) {
  const set = getStatisticaLevel6TaskSet(`y6-statistics-w4-l${lesson}`);
  check(Boolean(set), `Week 4 Lesson ${lesson} task set is missing`);
  if (!set) continue;
  const activities = set.activities.map((makeTask) => makeTask() as PracticeTask);
  check(activities.every((task) => task.kind === "statisticaMediaAnalysis"), `Week 4 Lesson ${lesson} must use visual media analysis`);
  const modes = activities.map((task) => task.kind === "statisticaMediaAnalysis" ? task.mode : "wrong");
  check(modes.join(",") === expectedModes[lesson - 1]!.join(","), `Week 4 Lesson ${lesson} has the wrong analysis progression`);
  for (const task of activities) {
    if (task.kind !== "statisticaMediaAnalysis") continue;
    check(task.data.labels.length === task.data.values.length, `Week 4 Lesson ${lesson}: evidence display must be complete`);
    check(Boolean(task.sample && task.method), `Week 4 Lesson ${lesson}: sample and method must remain visible`);
  }
}

if (problems > 0) {
  console.error(`\nStatistica Level 6 Week 4 audit failed with ${problems} problem(s).`);
  process.exit(1);
}

console.log("Statistica Level 6 Week 4 audit passed: every claim includes visible results, sample evidence and collection details.");
