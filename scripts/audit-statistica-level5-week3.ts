import { getStatisticaLevel5TaskSet } from "@/data/activities/statistica/level5";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { isPracticeTaskSafe } from "@/lib/task-safety";

let problems = 0;
const check = (condition: boolean, message: string) => {
  if (!condition) {
    problems += 1;
    console.error(`FAIL: ${message}`);
  }
};

const set = getStatisticaLevel5TaskSet("y5-statistics-w3-l1");
check(Boolean(set), "Week 3 Lesson 1 task set is missing");

if (set) {
  const teaching = set.teaching() as PracticeTask;
  const activities = set.activities.map((makeTask) => makeTask() as PracticeTask);

  check(teaching.kind === "statisticaConcept", "Lesson must begin with a non-question concept introduction");
  if (teaching.kind === "statisticaConcept") {
    check(teaching.scene === "intro", "Concept card must advance directly without being scored as a question");
    check(teaching.title === "What is the mode?", "Introduction must explicitly name the mode");
    check(teaching.definition.toLowerCase().includes("appears most often"), "Introduction must define mode as the most frequent value");
    check(teaching.exampleValues.filter((value) => value === teaching.highlightValue).length >= 2, "Worked example must visibly repeat its mode");
    check(Boolean(teaching.speakText), "Introduction needs complete read-aloud text");
  }

  check(
    activities.map((task) => task.kind).join(",") === "statisticaGraph,statisticaClassify,statisticaGraph",
    "Practice must progress from graph to raw list and back to graph",
  );
  for (const task of [teaching, ...activities]) {
    check(isPracticeTaskSafe(task), `${task.kind} must be renderer-safe`);
  }
}

if (problems > 0) {
  console.error(`\nStatistica Level 5 Week 3 audit failed with ${problems} problem(s).`);
  process.exit(1);
}

console.log("Statistica Level 5 Week 3 audit passed: Lesson 1 begins with a worked, voiced mode introduction.");
