import fs from "node:fs";
import path from "node:path";
import type { PracticeTask } from "../data/activities/year1/practice-task";
import { buildLevelOneWeek1VoyageQuiz } from "../data/activities/starpath/level1/week1Quiz";
import { buildLevelOneWeek2VoyageQuiz } from "../data/activities/starpath/level1/week2Quiz";
import { buildLevelOneWeek3VoyageQuiz } from "../data/activities/starpath/level1/week3Quiz";
import { buildLevelOneWeek4VoyageQuiz } from "../data/activities/starpath/level1/week4Quiz";
import { buildLevelOneWeek5VoyageQuiz } from "../data/activities/starpath/level1/week5Quiz";
import { buildLevelOneWeek6VoyageQuiz } from "../data/activities/starpath/level1/week6Quiz";
import { buildLevelOneWeek7VoyageQuiz } from "../data/activities/starpath/level1/week7Quiz";
import { isPracticeTaskSafe } from "../lib/task-safety";

type Builder = () => PracticeTask[];

const builders: Array<{
  week: number;
  descriptor: "AC9M1SP01" | "AC9M1SP02";
  build: Builder;
  lessonKinds: readonly (readonly string[])[];
}> = [
  { week: 1, descriptor: "AC9M1SP01", build: buildLevelOneWeek1VoyageQuiz, lessonKinds: [["starpathShapeDisguise"], ["starpathShapeFaceOff"], ["starpathMysteryShape"]] },
  { week: 2, descriptor: "AC9M1SP01", build: buildLevelOneWeek2VoyageQuiz, lessonKinds: [["starpathShapeClassify"], ["starpathShapeClassify"], ["starpathShapeClassify"]] },
  { week: 3, descriptor: "AC9M1SP01", build: buildLevelOneWeek3VoyageQuiz, lessonKinds: [["starpathShapeHunt"], ["starpathShapeHunt"], ["starpathShapeHunt"]] },
  { week: 4, descriptor: "AC9M1SP01", build: buildLevelOneWeek4VoyageQuiz, lessonKinds: [["starpathObjectSpotter"], ["starpathObjectCompare"], ["starpathObjectMatch"]] },
  { week: 5, descriptor: "AC9M1SP01", build: buildLevelOneWeek5VoyageQuiz, lessonKinds: [["starpathShapeWorkshop"], ["starpathShapeWorkshop"], ["starpathShapeWorkshop"]] },
  { week: 6, descriptor: "AC9M1SP02", build: buildLevelOneWeek6VoyageQuiz, lessonKinds: [["starpathRouteBuild"], ["starpathRouteRecord"], ["starpathRouteBuild"]] },
  { week: 7, descriptor: "AC9M1SP02", build: buildLevelOneWeek7VoyageQuiz, lessonKinds: [["starpathRouteDebug"], ["starpathRouteBuild"], ["starpathRouteDebug", "starpathRouteBuild"]] },
];

const failures: string[] = [];
let passed = 0;

function check(condition: boolean, message: string): void {
  if (condition) passed += 1;
  else failures.push(message);
}

function optionIds(task: PracticeTask): string[] {
  if (!("options" in task) || !Array.isArray(task.options)) return [];
  return task.options.flatMap((option) => {
    if (typeof option !== "object" || option === null || !("id" in option)) return [];
    return typeof option.id === "string" ? [option.id] : [];
  });
}

for (const { week, descriptor, build, lessonKinds } of builders) {
  const quiz = build();
  check(quiz.length === 15, `Level 1 Week ${week} must build exactly 15 questions.`);
  check(lessonKinds.length === 3, `Level 1 Week ${week} must define three lesson allocations.`);
  check(new Set(quiz.map((task) => "target" in task ? task.target : null)).size === 15, `Level 1 Week ${week} must use 15 unique targets.`);

  for (let lesson = 0; lesson < 3; lesson += 1) {
    const slice = quiz.slice(lesson * 5, lesson * 5 + 5);
    check(slice.length === 5, `Level 1 Week ${week} Lesson ${lesson + 1} must contribute exactly 5 questions.`);
    check(slice.every((task) => lessonKinds[lesson]!.includes(task.kind)), `Level 1 Week ${week} Lesson ${lesson + 1} contains a task outside its taught interaction set.`);
  }

  for (const [index, task] of quiz.entries()) {
    const label = `Level 1 Week ${week} Question ${index + 1}`;
    const ids = optionIds(task);
    check(isPracticeTaskSafe(task), `${label} is blocked by the task-safety gate.`);
    check("prompt" in task && Boolean(task.prompt.trim()), `${label} has no prompt.`);
    check("speakText" in task && typeof task.speakText === "string" && Boolean(task.speakText.trim()), `${label} has no read-aloud text.`);
    check(new Set(ids).size === ids.length, `${label} has duplicate option IDs.`);

    if (descriptor === "AC9M1SP01") {
      check(!task.kind.toLowerCase().includes("route"), `${label} leaks direction work into AC9M1SP01.`);
    } else {
      check(task.kind.toLowerCase().includes("route"), `${label} does not assess AC9M1SP02 direction work.`);
      if ("cols" in task && typeof task.cols === "number") check(task.cols <= 4, `${label} uses a grid wider than the Year 1 interaction.`);
      if ("rows" in task && typeof task.rows === "number") check(task.rows <= 4, `${label} uses a grid taller than the Year 1 interaction.`);
    }
  }
}

for (let week = 1; week <= 7; week += 1) {
  const source = fs.readFileSync(path.join(process.cwd(), `data/activities/starpath/level1/week${week}Quiz.ts`), "utf8");
  check(!/from\s+["'].+Lessons["']/.test(source), `Level 1 Week ${week} quiz imports a lesson task factory.`);
  check(!/from\s+["'].+route-tasks["']/.test(source), `Level 1 Week ${week} quiz imports lesson-native route tasks.`);
}

console.log(`Level 1 Starpath weekly-quiz audit: ${passed} passed, ${failures.length} failed.`);
console.log("Routes: 7/7. Questions: 105/105. Allocation: 5-5-5 in every weekly quiz.");

if (failures.length > 0) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
}
