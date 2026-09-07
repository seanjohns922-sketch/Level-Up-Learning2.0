import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { getChanceHollowLevel3TaskSet } from "@/data/activities/chanceHollow/level3";
import { getChanceHollowLevel4TaskSet } from "@/data/activities/chanceHollow/level4";

const sourceFiles = [
  new URL("../data/activities/chanceHollow/level3.ts", import.meta.url),
  new URL("../data/activities/chanceHollow/level4.ts", import.meta.url),
];

for (const sourceFile of sourceFiles) {
  const source = readFileSync(fileURLToPath(sourceFile), "utf8");
  assert.doesNotMatch(source, /\b(?:poolGen|questionPool|lessonPool)\b/i, `${sourceFile.pathname} must not use fixed lesson question pools`);
}

const levels = [
  { level: 3, getTaskSet: getChanceHollowLevel3TaskSet },
  { level: 4, getTaskSet: getChanceHollowLevel4TaskSet },
] as const;

let lessonCount = 0;
for (const { level, getTaskSet } of levels) {
  for (let week = 1; week <= 6; week += 1) {
    for (let lesson = 1; lesson <= 3; lesson += 1) {
      const id = `y${level}-chance-w${week}-l${lesson}`;
      const taskSet = getTaskSet(id);
      assert.ok(taskSet, `${id} must have a generated task set`);
      assert.ok(taskSet.activities.length >= 3, `${id} must use at least three example activities or objects`);

      taskSet.activities.forEach((generate, index) => {
        let previous = generate();
        for (let sample = 0; sample < 25; sample += 1) {
          const task = generate();
          assert.notStrictEqual(task, previous, `${id} activity ${index + 1} must create a new task object on every call`);
          if (task.kind === "mcq") {
            assert.ok(task.options.includes(task.answer), `${id} activity ${index + 1} must include its answer in its options`);
            assert.equal(new Set(task.options).size, task.options.length, `${id} activity ${index + 1} must not contain duplicate options`);
          }
          previous = task;
        }
      });
      lessonCount += 1;
    }
  }
}

console.log(`Chance Hollow generation audit passed: ${lessonCount} lessons, at least three fresh activity generators each, no fixed lesson pools.`);
