import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const runner = read("components/PracticeRunner.tsx");
const renderer = read("components/TaskRenderer.tsx");
const level3Lesson = read("data/activities/year3Measurelands/week1Lesson1.ts");

const results = [];
const check = (label, ok) => results.push({ label, ok });

const advanceIntroBody = runner.match(/function advanceIntro\(\) \{([\s\S]*?)\n  \}/)?.[1] ?? "";
const markCorrectBody = runner.match(/function markCorrect\(\) \{([\s\S]*?)\n  \}/)?.[1] ?? "";

check(
  "Measurelands intro cards use a dedicated callback",
  renderer.includes('const isIntroTask = "scene" in task && task.scene === "intro"') &&
    renderer.includes("if (isIntroTask && advanceIntro)"),
);
check(
  "Intro advancement does not score or show correct feedback",
  advanceIntroBody.includes("nextTask()") &&
    !advanceIntroBody.includes("bumpSessionCounters") &&
    !advanceIntroBody.includes("setStatus") &&
    !advanceIntroBody.includes("markCorrect"),
);
check(
  "Measurelands correct answers wait for Next Challenge",
  runner.includes('isMeasurement && status === "correct"') &&
    runner.includes("onClick={continueAfterCorrect}") &&
    markCorrectBody.includes("if (!isMeasurement)"),
);
check(
  "Wrong answers retain an explicit next action",
  runner.includes("onClick={continueAfterWrong}") && runner.includes("Next Question"),
);
check(
  "Duplicate task transitions are guarded",
  runner.includes("advancingTaskRef.current") && runner.includes("disabled={isAdvancingTask}"),
);
check(
  "Measurelands scenes have distinct repetition keys",
  runner.includes('parts.push(`scene:${scene}`)'),
);
check(
  "Failed generation shows retry without reusing the completed task",
  runner.includes("Next challenge generation failed") &&
    runner.includes("The next challenge did not load. Please try again.") &&
    !runner.includes("generateLessonTask(ctx) ?? task"),
);
check(
  "Intro and recovery errors pause the clock without extending feedback time",
    runner.includes("pauseLessonClockRef.current =") &&
    runner.includes("isIntroTask || Boolean(transitionError)") &&
    !runner.includes('isIntroTask || status !== "idle" || Boolean(transitionError) || isAdvancingTask') &&
    runner.includes("pauseLessonClockRef.current ? s : s - 1"),
);
check(
  "Level 3 Week 1 Lesson 1 still emits intro then ruler activities",
  level3Lesson.includes('scene: "intro"') &&
    level3Lesson.includes('"startZero", "measure", "compare"') &&
    level3Lesson.includes("memory.introShown = true"),
);

const failures = results.filter((result) => !result.ok);
console.log("\nMeasurelands Progression Audit\n" + "=".repeat(64));
for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.label}`);
}
console.log("=".repeat(64));
console.log(`${results.length - failures.length}/${results.length} checks passed.`);

if (failures.length > 0) process.exit(1);
