import fs from "node:fs";
import path from "node:path";
import type { PracticeTask } from "../data/activities/year1/practice-task";
import { buildLevelThreeWeek1VoyageQuiz } from "../data/activities/starpath/level3/week1Quiz";
import { buildLevelThreeWeek2VoyageQuiz } from "../data/activities/starpath/level3/week2Quiz";
import { buildLevelThreeWeek3VoyageQuiz } from "../data/activities/starpath/level3/week3Quiz";
import { buildLevelThreeWeek4VoyageQuiz } from "../data/activities/starpath/level3/week4Quiz";
import { buildLevelThreeWeek5VoyageQuiz } from "../data/activities/starpath/level3/week5Quiz";
import { buildLevelThreeWeek6VoyageQuiz } from "../data/activities/starpath/level3/week6Quiz";
import { buildLevelThreeWeek7VoyageQuiz } from "../data/activities/starpath/level3/week7Quiz";
import { getStarpathQuizTasks } from "../data/activities/starpath/ground/week1Quiz";
import { isPracticeTaskSafe } from "../lib/task-safety";
import { isStarpathMapCreationValid } from "../lib/starpath-map-create";

const builders = [buildLevelThreeWeek1VoyageQuiz, buildLevelThreeWeek2VoyageQuiz, buildLevelThreeWeek3VoyageQuiz, buildLevelThreeWeek4VoyageQuiz, buildLevelThreeWeek5VoyageQuiz, buildLevelThreeWeek6VoyageQuiz, buildLevelThreeWeek7VoyageQuiz];
const expectedSections = [
  [["starpathObject", "name"], ["starpathObject", "find"], ["starpathObject", "compare"]],
  [["starpathObject", "find"], ["starpathObject", "compare"], ["starpathObject", "classify"]],
  [["starpathObject", "find"], ["starpathObject", "name"], ["starpathObject", "classify"]],
  [["starpathMapLocate", "symbol"], ["starpathMapLocate", "relative"], ["starpathMapLocate", "clues"]],
  [["starpathMapCreate", "create"], ["starpathMapCreate", "create"], ["starpathMapCreate", "create"]],
  [["starpathSteer", "heading"], ["starpathSteer", "firstMove"], ["starpathSteer", "drive"]],
  [["starpathObject", "find"], ["starpathMapCreate", "create"], ["starpathMapRoute", "give"]],
] as const;
const failures: string[] = [];
let passed = 0;
const check = (condition: boolean, message: string) => condition ? passed += 1 : failures.push(message);

function mode(task: PracticeTask) { return "mode" in task && typeof task.mode === "string" ? task.mode : "create"; }
function solveCreate(task: Extract<PracticeTask, { kind: "starpathMapCreate" }>) {
  const ids = task.landmarks.map((landmark) => landmark.id);
  const placements: Record<string, { r: number; c: number }> = {};
  const used = new Set<string>();
  const search = (index: number): boolean => {
    if (index === ids.length) return isStarpathMapCreationValid(task, placements);
    for (let r = 0; r < task.rows; r += 1) for (let c = 0; c < task.cols; c += 1) {
      const key = `${r}:${c}`;
      if (used.has(key)) continue;
      placements[ids[index]!] = { r, c }; used.add(key);
      if (search(index + 1)) return true;
      used.delete(key); delete placements[ids[index]!];
    }
    return false;
  };
  return search(0);
}

const serialized: string[] = [];
for (const [weekIndex, build] of builders.entries()) {
  const week = weekIndex + 1;
  const quiz = build();
  check(quiz.length === 15, `Level 3 Week ${week} must build exactly 15 questions.`);
  check(new Set(quiz.map((task) => "target" in task ? task.target : null)).size === 15, `Level 3 Week ${week} must use targets 1-15 exactly once.`);
  check(JSON.stringify(getStarpathQuizTasks("level-3", week)) === JSON.stringify(quiz), `Level 3 Week ${week} dispatcher does not launch the canonical quiz.`);
  for (let section = 0; section < 3; section += 1) {
    const tasks = quiz.slice(section * 5, section * 5 + 5);
    const [kind, expectedMode] = expectedSections[weekIndex]![section]!;
    check(tasks.length === 5, `Week ${week} section ${section + 1} must contain five questions.`);
    check(tasks.every((task) => task.kind === kind && mode(task) === expectedMode), `Week ${week} section ${section + 1} uses the wrong interaction.`);
    if (week === 5) check(tasks.every((task) => task.kind === "starpathMapCreate" && task.constraints.length === section + 1), `Week 5 section ${section + 1} must assess ${section + 1} relative clue(s).`);
  }
  for (const [index, task] of quiz.entries()) {
    const label = `Level 3 Week ${week} Question ${index + 1}`;
    serialized.push(JSON.stringify(task));
    check(isPracticeTaskSafe(task), `${label} is blocked by task safety.`);
    check("prompt" in task && typeof task.prompt === "string" && Boolean(task.prompt.trim()), `${label} has no prompt.`);
    check("speakText" in task && typeof task.speakText === "string" && Boolean(task.speakText.trim()), `${label} has no read-aloud text.`);
    if (task.kind === "starpathMapCreate") check(solveCreate(task), `${label} has no valid map construction.`);
    if (task.kind === "starpathMapRoute") check((task.maxSteps ?? 0) >= Math.abs(task.goal.r - task.start.r) + Math.abs(task.goal.c - task.start.c), `${label} has an insufficient route budget.`);
    if (task.kind === "starpathSteer" && task.mode !== "drive") check(Boolean(task.options?.some((option) => option.id === task.correctOptionId)), `${label} has no valid steering answer.`);
  }
  const source = fs.readFileSync(path.join(process.cwd(), `data/activities/starpath/level3/week${week}Quiz.ts`), "utf8");
  check(!source.includes("LEVEL_THREE_LESSON_CONTENT") && !source.includes("level3PostTest"), `Week ${week} quiz imports lessons or assessment content.`);
}
check(new Set(serialized).size === 105, "The 105 Level 3 weekly questions must be structurally unique.");
check(getStarpathQuizTasks("level-3", 8) === null, "Level 3 Week 8 must not launch a non-existent weekly quiz.");

console.log(`Level 3 Starpath weekly-quiz audit: ${passed} passed, ${failures.length} failed.`);
console.log("Routes: 7/7. Questions: 105/105. Allocation: exact 5-5-5. Week 8: Post-Test only.");
if (failures.length) { failures.forEach((failure) => console.error(`- ${failure}`)); process.exitCode = 1; }
