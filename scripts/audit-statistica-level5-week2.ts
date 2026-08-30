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

const set = getStatisticaLevel5TaskSet("y5-statistics-w2-l1");
check(Boolean(set), "Week 2 Lesson 1 task set is missing");

if (set) {
  const teaching = set.teaching() as PracticeTask;
  const activities = set.activities.map((makeTask) => makeTask() as PracticeTask);
  check(teaching.kind === "statisticaClassify", "Teaching must introduce mixed validation checks");
  check(activities.every((task) => task.kind === "statisticaClassify"), "Activities must use supported classify interactions");

  for (const task of [teaching, ...activities]) {
    check(isPracticeTaskSafe(task), `${task.kind} must be renderer-safe`);
    if (task.kind === "statisticaClassify") {
      const optionIds = new Set(task.options.map((option) => option.id));
      check(task.correctOptionIds.every((id) => optionIds.has(id)), "Correct answers must reference displayed options");
      check(Boolean(task.speakText), "Every mixed-error task needs read-aloud text");
    }
  }

  const spotTasks = Array.from({ length: 16 }, () => set.activities[0]() as PracticeTask);
  const spotVariables = spotTasks.map((task) => task.kind === "statisticaClassify" ? task.variable : "");
  check(new Set(spotVariables).size >= 8, "Spot Data Errors needs at least eight varied data sets");
  check(spotVariables.some((value) => value.includes("—")), "Spot Data Errors must include a missing response");
  check(spotVariables.some((value) => /Buss|soccer/.test(value)), "Spot Data Errors must include an inconsistent category label");
  check(spotVariables.some((value) => /many|7/.test(value)), "Spot Data Errors must include a wrong response type");
  check(spotVariables.some((value) => value.includes("1.48 m")), "Spot Data Errors must include mixed measurement units");
  check(spotVariables.some((value) => value.includes("Bike and car")), "Spot Data Errors must include an invalid multiple response");
}

if (problems > 0) {
  console.error(`\nStatistica Level 5 Week 2 audit failed with ${problems} problem(s).`);
  process.exit(1);
}

console.log("Statistica Level 5 Week 2 audit passed: Lesson 1 covers mixed error types and responsible data cleaning.");
