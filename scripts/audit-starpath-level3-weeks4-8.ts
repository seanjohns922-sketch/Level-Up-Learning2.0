import assert from "node:assert/strict";
import { LEVEL_THREE_LESSON_CONTENT } from "../data/activities/starpath/level3/index";
import { getStarpathQuizTasks } from "../data/activities/starpath/ground/week1Quiz";
import { getPosttestForLevel } from "../data/assessments/api";
import { LEVEL3_STARPATH_INDEPENDENT_POSTTEST_ITEMS } from "../data/assessments/level3StarpathIndependentAssessments";
import { isPracticeTaskSafe } from "../lib/task-safety";
import { isStarpathMapCreationValid } from "../lib/starpath-map-create";

function solveCreate(task: Extract<ReturnType<(typeof LEVEL_THREE_LESSON_CONTENT)[string]["createTaskSet"]>["activities"][number] extends () => infer T ? T : never, { kind: "starpathMapCreate" }>) {
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

const ids = Object.keys(LEVEL_THREE_LESSON_CONTENT).filter((id) => /-w[4-8]-/.test(id));
assert.equal(ids.length, 15, "Weeks 4-8 must register 15 lessons");
for (const id of ids) {
  const content = LEVEL_THREE_LESSON_CONTENT[id]!;
  const tasks = content.createTaskSet().activities.flatMap((activity) => Array.from({ length: 5 }, () => activity()));
  assert.equal(tasks.length, 15, `${id} must generate 15 audit tasks`);
  for (const task of tasks) {
    assert(isPracticeTaskSafe(task), `${id} generated an unsafe task`);
    assert("speakText" in task && typeof task.speakText === "string" && Boolean(task.speakText.trim()), `${id} generated a task without read-aloud text`);
    if (task.kind === "starpathMapCreate") assert(solveCreate(task), `${id} generated an unsolvable map`);
    if (task.kind === "starpathMapRoute") assert((task.maxSteps ?? 20) >= Math.abs(task.goal.r - task.start.r) + Math.abs(task.goal.c - task.start.c), `${id} generated an insufficient route budget`);
  }
}

for (const week of [4, 5, 6, 7]) assert.equal(getStarpathQuizTasks("level-3", week)?.length, 15, `Week ${week} must launch 15 independent quiz questions`);
assert.equal(getStarpathQuizTasks("level-3", 8), null, "Week 8 must not launch a weekly quiz");
const production = getPosttestForLevel(3, "space")?.questions ?? [];
assert.deepEqual(production.map((item) => item.id), LEVEL3_STARPATH_INDEPENDENT_POSTTEST_ITEMS.map((item) => item.id), "Week 8 must launch the independent production Post-Test");

console.log("Starpath Level 3 Weeks 4-8 audit passed: 15 lessons, 4 independent weekly quizzes, and the 20-item production Post-Test checked.");
