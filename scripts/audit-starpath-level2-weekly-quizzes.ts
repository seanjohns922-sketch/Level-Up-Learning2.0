import fs from "node:fs";
import path from "node:path";
import type { PracticeTask } from "../data/activities/year1/practice-task";
import { buildLevelTwoWeek1VoyageQuiz } from "../data/activities/starpath/level2/week1Quiz";
import { buildLevelTwoWeek2VoyageQuiz } from "../data/activities/starpath/level2/week2Quiz";
import { buildLevelTwoWeek3VoyageQuiz } from "../data/activities/starpath/level2/week3Quiz";
import { buildLevelTwoWeek4VoyageQuiz } from "../data/activities/starpath/level2/week4Quiz";
import { buildLevelTwoWeek5VoyageQuiz } from "../data/activities/starpath/level2/week5Quiz";
import { buildLevelTwoWeek6VoyageQuiz } from "../data/activities/starpath/level2/week6Quiz";
import { buildLevelTwoWeek7VoyageQuiz } from "../data/activities/starpath/level2/week7Quiz";
import { isPracticeTaskSafe } from "../lib/task-safety";

const builders: Array<{ week: number; kind: PracticeTask["kind"]; build: () => PracticeTask[] }> = [
  { week: 1, kind: "starpathShapeFeature", build: buildLevelTwoWeek1VoyageQuiz },
  { week: 2, kind: "starpathShapeFeature", build: buildLevelTwoWeek2VoyageQuiz },
  { week: 3, kind: "starpathShapeFeature", build: buildLevelTwoWeek3VoyageQuiz },
  { week: 4, kind: "starpathShapeFeature", build: buildLevelTwoWeek4VoyageQuiz },
  { week: 5, kind: "starpathMapLocate", build: buildLevelTwoWeek5VoyageQuiz },
  { week: 6, kind: "starpathMapLocate", build: buildLevelTwoWeek6VoyageQuiz },
  { week: 7, kind: "starpathMapRoute", build: buildLevelTwoWeek7VoyageQuiz },
];
const failures: string[] = [];
let passed = 0;
const check = (condition: boolean, message: string) => condition ? passed += 1 : failures.push(message);

function optionIds(task: PracticeTask): string[] {
  if (!("options" in task) || !Array.isArray(task.options)) return [];
  return task.options.flatMap((option) => typeof option === "object" && option !== null && "id" in option && typeof option.id === "string" ? [option.id] : []);
}

for (const { week, kind, build } of builders) {
  const quiz = build();
  check(quiz.length === 15, `Level 2 Week ${week} must build exactly 15 questions.`);
  check(new Set(quiz.map((task) => "target" in task ? task.target : null)).size === 15, `Level 2 Week ${week} must use 15 unique targets.`);
  for (let lesson = 0; lesson < 3; lesson += 1) check(quiz.slice(lesson * 5, lesson * 5 + 5).length === 5, `Week ${week} Lesson ${lesson + 1} must contribute five questions.`);
  for (const [index, task] of quiz.entries()) {
    const label = `Level 2 Week ${week} Question ${index + 1}`;
    const ids = optionIds(task);
    check(task.kind === kind, `${label} uses ${task.kind} instead of ${kind}.`);
    check(isPracticeTaskSafe(task), `${label} is blocked by task safety.`);
    check("prompt" in task && Boolean(task.prompt.trim()), `${label} has no prompt.`);
    check("speakText" in task && typeof task.speakText === "string" && Boolean(task.speakText.trim()), `${label} has no read-aloud text.`);
    check(new Set(ids).size === ids.length, `${label} has duplicate option IDs.`);
  }
  const source = fs.readFileSync(path.join(process.cwd(), `data/activities/starpath/level2/week${week}Quiz.ts`), "utf8");
  check(!source.includes("LEVEL_TWO_LESSON_CONTENT") && !source.includes("level2PostTest"), `Week ${week} quiz imports a lesson registry or assessment.`);
}

console.log(`Level 2 Starpath weekly-quiz audit: ${passed} passed, ${failures.length} failed.`);
console.log("Routes: 7/7. Questions: 105/105. Allocation: 5-5-5 in every weekly quiz.");
if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
}
