import { getStatisticaLevel6TaskSet, mediaRepairTask } from "@/data/activities/statistica/level6";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { isPracticeTaskSafe } from "@/lib/task-safety";

let problems = 0;
const check = (condition: boolean, message: string) => {
  if (!condition) {
    problems += 1;
    console.error(`FAIL: ${message}`);
  }
};

const expectedModes = [
  ["distortion", "quantify", "defend"],
  ["repair", "repair", "repair"],
  ["defend", "defend", "defend"],
];

for (let lesson = 1; lesson <= 3; lesson += 1) {
  const set = getStatisticaLevel6TaskSet(`y6-statistics-w5-l${lesson}`);
  check(Boolean(set), `Week 5 Lesson ${lesson} task set is missing`);
  if (!set) continue;
  const teaching = set.teaching() as PracticeTask;
  const activities = set.activities.map((makeTask) => makeTask() as PracticeTask);
  check(teaching.kind === "statisticaClassify", `Week 5 Lesson ${lesson}: direct flaw spotting should appear only as the opening scaffold`);
  check(activities.every((task) => task.kind === "statisticaMediaAnalysis"), `Week 5 Lesson ${lesson}: practice must analyse an actual representation`);
  const modes = activities.map((task) => task.kind === "statisticaMediaAnalysis" ? task.mode : "wrong");
  check(modes.join(",") === expectedModes[lesson - 1]!.join(","), `Week 5 Lesson ${lesson}: activity progression is incorrect`);

  for (const task of activities) {
    check(isPracticeTaskSafe(task), `Week 5 Lesson ${lesson}: ${task.kind} must be renderer-safe`);
    if (task.kind !== "statisticaMediaAnalysis") continue;
    if (lesson === 1) check(task.display === "columns" && (task.axisMin ?? 0) > 0, `Week 5 Lesson 1: the broken axis must be visible`);
    if (lesson === 2) check(["pictograph", "selected", "parts"].includes(task.display), `Week 5 Lesson 2: practice must use a misleading graphic, omitted series or invalid whole`);
    check(task.data.labels.length === task.data.values.length, `Week 5 Lesson ${lesson}: graph data must be complete`);
    check(Boolean(task.evidenceNote && task.speakText), `Week 5 Lesson ${lesson}: visual context and voice-over are required`);
    const optionIds = new Set(task.options.map((option) => option.id));
    check(task.correctOptionIds.length === 1 && optionIds.has(task.correctOptionIds[0]!), `Week 5 Lesson ${lesson}: correct answer must be visible`);
  }

  set.activities.forEach((makeTask, index) => {
    const variants = Array.from({ length: 12 }, () => JSON.stringify(makeTask() as PracticeTask));
    check(new Set(variants).size >= 6, `Week 5 Lesson ${lesson} activity ${index + 1} needs at least six datasets`);
  });
}

const lesson2Displays = new Set(Array.from({ length: 18 }, (_, round) => (mediaRepairTask(round, round + 1) as Extract<PracticeTask, { kind: "statisticaMediaAnalysis" }>).display));
check(["pictograph", "selected", "parts"].every((display) => lesson2Displays.has(display as "pictograph" | "selected" | "parts")), "Week 5 Lesson 2 must cover picture area, omitted data and invalid totals");

if (problems > 0) {
  console.error(`\nStatistica Level 6 Week 5 audit failed with ${problems} problem(s).`);
  process.exit(1);
}

console.log("Statistica Level 6 Week 5 audit passed: students quantify distortions, repair displays and defend critiques.");
