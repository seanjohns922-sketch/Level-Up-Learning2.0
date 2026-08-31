import { getStatisticaLevel6TaskSet } from "@/data/activities/statistica/level6";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { isPracticeTaskSafe } from "@/lib/task-safety";

let problems = 0;
const check = (condition: boolean, message: string) => {
  if (!condition) {
    problems += 1;
    console.error(`FAIL: ${message}`);
  }
};

const set = getStatisticaLevel6TaskSet("y6-statistics-w2-l2");
check(Boolean(set), "Level 6 Week 2 Lesson 2 task set is missing");

if (set) {
  const teaching = set.teaching() as PracticeTask;
  const activities = set.activities.map((makeTask) => makeTask() as PracticeTask);

  check(teaching.kind === "statisticaConcept", "Calculate the Range must begin with an unscored concept page");
  if (teaching.kind === "statisticaConcept") {
    const numericValues = teaching.exampleValues.map(Number);
    const highest = String(Math.max(...numericValues));
    const lowest = String(Math.min(...numericValues));
    const expectedRange = Number(highest) - Number(lowest);
    check(teaching.scene === "intro", "Range concept page must advance without being scored");
    check(teaching.title === "What is the range?", "Range concept page must explicitly name the idea");
    check(teaching.highlightValue === highest, "Worked example must mark the highest value");
    check(teaching.secondaryHighlightValue === lowest, "Worked example must mark the lowest value");
    check(teaching.explanation.includes(`range ${expectedRange}`), "Worked example must show the calculated range");
    check(/highest/i.test(teaching.definition) && /lowest/i.test(teaching.definition), "Definition must explain the two endpoints");
    check(Boolean(teaching.speakText), "Range introduction needs complete read-aloud text");
  }

  check(
    activities.map((task) => task.kind).join(",") === "statisticaInference,statisticaGraph,statisticaShape",
    "Practice must move from calculating range to mode and distribution shape",
  );
  check(!activities.some((task) => task.kind === "statisticaConcept"), "The concept page must not repeat as a scored activity");
  for (const task of [teaching, ...activities]) {
    check(isPracticeTaskSafe(task), `${task.kind} must be renderer-safe`);
    if ("speakText" in task) check(Boolean(task.speakText), `${task.kind} needs read-aloud text`);
  }
}

if (problems > 0) {
  console.error(`\nStatistica Level 6 Week 2 audit failed with ${problems} problem(s).`);
  process.exit(1);
}

console.log("Statistica Level 6 Week 2 audit passed: Calculate the Range begins with a worked, voiced concept page.");
