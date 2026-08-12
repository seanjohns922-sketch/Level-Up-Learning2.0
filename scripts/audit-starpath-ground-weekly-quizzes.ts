import type { PracticeTask } from "../data/activities/year1/practice-task";
import { buildGroundWeek1VoyageQuiz } from "../data/activities/starpath/ground/week1Quiz";
import { buildGroundWeek2VoyageQuiz } from "../data/activities/starpath/ground/week2Quiz";
import { buildGroundWeek3VoyageQuiz } from "../data/activities/starpath/ground/week3Quiz";
import { buildGroundWeek4VoyageQuiz } from "../data/activities/starpath/ground/week4Quiz";
import { buildGroundWeek5VoyageQuiz } from "../data/activities/starpath/ground/week5Quiz";
import { buildGroundWeek6VoyageQuiz } from "../data/activities/starpath/ground/week6Quiz";
import { buildGroundWeek7VoyageQuiz } from "../data/activities/starpath/ground/week7Quiz";
import { isPracticeTaskSafe } from "../lib/task-safety";

type Builder = () => PracticeTask[];

const builders: Array<{ week: number; build: Builder; lessonKinds: readonly (readonly string[])[] }> = [
  {
    week: 1,
    build: buildGroundWeek1VoyageQuiz,
    lessonKinds: [
      ["starpathShapeMatch", "starpathShapeName"],
      ["starpathObjectShape", "starpathShapeScene"],
      ["starpathOddOneOut"],
    ],
  },
  {
    week: 2,
    build: buildGroundWeek2VoyageQuiz,
    lessonKinds: [
      ["starpathBuildShapeIdentify", "starpathBuildMatch"],
      ["starpathBuildShapeIdentify", "starpathBuildMatch"],
      ["starpathSpaceMuseum", "starpathBuildMatch"],
    ],
  },
  {
    week: 3,
    build: buildGroundWeek3VoyageQuiz,
    lessonKinds: [
      ["starpathOddOneOut"],
      ["starpathShapeCompare", "starpathWhatChanged"],
      ["starpathOddOneOut", "starpathShapeCompare", "starpathWhatChanged"],
    ],
  },
  {
    week: 4,
    build: buildGroundWeek4VoyageQuiz,
    lessonKinds: [
      ["starpathPositionFind", "starpathPositionPicture"],
      ["starpathPositionWord", "starpathPositionFind", "starpathPositionPicture"],
      ["starpathPositionFind", "starpathPositionWord", "starpathPositionPicture"],
    ],
  },
  {
    week: 5,
    build: buildGroundWeek5VoyageQuiz,
    lessonKinds: [
      ["starpathPositionWord"],
      ["starpathPositionPicture"],
      ["starpathPositionFind"],
    ],
  },
  {
    week: 6,
    build: buildGroundWeek6VoyageQuiz,
    lessonKinds: [
      ["starpathPositionFind"],
      ["starpathPositionWord"],
      ["starpathPositionPicture"],
    ],
  },
  {
    week: 7,
    build: buildGroundWeek7VoyageQuiz,
    lessonKinds: [
      ["starpathBuildShapeIdentify", "starpathBuildMatch"],
      ["starpathPositionPicture", "starpathBuildMatch"],
      ["starpathPositionWord", "starpathPositionFind", "starpathPositionPicture"],
    ],
  },
];

const failures: string[] = [];
let passed = 0;

function check(condition: boolean, message: string): void {
  if (condition) passed += 1;
  else failures.push(message);
}

for (const { week, build, lessonKinds } of builders) {
  const quiz = build();
  check(quiz.length === 15, `Ground Week ${week} must build exactly 15 questions.`);
  check(lessonKinds.length === 3, `Ground Week ${week} must define three lesson allocations.`);
  check(new Set(quiz.map((task) => "target" in task ? task.target : null)).size === 15, `Ground Week ${week} must use 15 unique targets.`);

  for (let lesson = 0; lesson < 3; lesson += 1) {
    const slice = quiz.slice(lesson * 5, lesson * 5 + 5);
    check(slice.length === 5, `Ground Week ${week} Lesson ${lesson + 1} must contribute exactly 5 questions.`);
    check(
      slice.every((task) => lessonKinds[lesson]!.includes(task.kind)),
      `Ground Week ${week} Lesson ${lesson + 1} contains a task outside its taught interaction set.`,
    );
  }

  for (const [index, task] of quiz.entries()) {
    const label = `Ground Week ${week} Question ${index + 1}`;
    check(isPracticeTaskSafe(task), `${label} is blocked by the task-safety gate.`);
    check("prompt" in task && Boolean(task.prompt.trim()), `${label} has no prompt.`);
    check("speakText" in task && typeof task.speakText === "string" && Boolean(task.speakText.trim()), `${label} has no read-aloud text.`);
    check(task.kind !== "starpathDirectionChoice" && task.kind !== "starpathDirectionPath", `${label} leaks Year 1 direction work.`);
    check(!(task.kind === "starpathGroundAssessment" && task.mode === "route"), `${label} leaks Year 1 route work.`);
  }
}

console.log(`Ground Starpath weekly-quiz audit: ${passed} passed, ${failures.length} failed.`);
console.log("Routes: 7/7. Questions: 105/105. Allocation: 5-5-5 in every weekly quiz.");

if (failures.length > 0) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
}
