import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { getChanceHollowLevel3TaskSet } from "@/data/activities/chanceHollow/level3";
import { getChanceHollowLevel4TaskSet } from "@/data/activities/chanceHollow/level4";
import { getChanceHollowLevel5TaskSet } from "@/data/activities/chanceHollow/level5";
import { getChanceHollowLevel6TaskSet } from "@/data/activities/chanceHollow/level6";
import { CHANCE_HOLLOW_PROGRAMS } from "@/data/programs/chanceHollow";

const sourceFiles = [
  new URL("../data/activities/chanceHollow/level3.ts", import.meta.url),
  new URL("../data/activities/chanceHollow/level4.ts", import.meta.url),
  new URL("../data/activities/chanceHollow/level5.ts", import.meta.url),
  new URL("../data/activities/chanceHollow/level6.ts", import.meta.url),
];

for (const sourceFile of sourceFiles) {
  const source = readFileSync(fileURLToPath(sourceFile), "utf8");
  assert.doesNotMatch(source, /\b(?:poolGen|questionPool|lessonPool)\b/i, `${sourceFile.pathname} must not use fixed lesson question pools`);
}

const levels = [
  { level: 3, getTaskSet: getChanceHollowLevel3TaskSet },
  { level: 4, getTaskSet: getChanceHollowLevel4TaskSet },
  { level: 5, getTaskSet: getChanceHollowLevel5TaskSet },
  { level: 6, getTaskSet: getChanceHollowLevel6TaskSet },
] as const;

assert.equal(CHANCE_HOLLOW_PROGRAMS[6].length, 6, "Level 6 must contain six weeks");
assert.ok(CHANCE_HOLLOW_PROGRAMS[6].every((week) => week.lessons.length === 3), "Each Level 6 week must contain three lessons");
assert.deepEqual(
  [...new Set(CHANCE_HOLLOW_PROGRAMS[6].flatMap((week) => week.curriculum))].sort(),
  ["AC9M6P01", "AC9M6P02"],
  "Level 6 must stay within the Year 6 probability curriculum",
);

function semanticFingerprint(task: ReturnType<NonNullable<ReturnType<typeof getChanceHollowLevel5TaskSet>>["activities"][number]>) {
  if (task.kind !== "mcq") return JSON.stringify(task);
  return JSON.stringify({ ...task, options: [...task.options].sort() });
}

let lessonCount = 0;
for (const { level, getTaskSet } of levels) {
  for (let week = 1; week <= 6; week += 1) {
    for (let lesson = 1; lesson <= 3; lesson += 1) {
      const id = `y${level}-chance-w${week}-l${lesson}`;
      const taskSet = getTaskSet(id);
      assert.ok(taskSet, `${id} must have a generated task set`);
      assert.ok(taskSet.activities.length >= 3, `${id} must use at least three example activities or objects`);
      const lessonFingerprints = new Set<string>();
      let interactiveGenerators = 0;

      taskSet.activities.forEach((generate, index) => {
        let previous = generate();
        if (previous.kind !== "mcq") interactiveGenerators += 1;
        const fingerprints = new Set([semanticFingerprint(previous)]);
        for (let sample = 0; sample < 25; sample += 1) {
          const task = generate();
          if (level === 6 && "prompt" in task) {
            assert.ok(task.prompt.trim().split(/\s+/).length <= 18, `${id} activity ${index + 1} prompt must stay concise`);
          }
          assert.notStrictEqual(task, previous, `${id} activity ${index + 1} must create a new task object on every call`);
          if (task.kind === "mcq") {
            assert.ok(task.options.includes(task.answer), `${id} activity ${index + 1} must include its answer in its options`);
            assert.equal(new Set(task.options).size, task.options.length, `${id} activity ${index + 1} must not contain duplicate options`);
          }
          const fingerprint = semanticFingerprint(task);
          fingerprints.add(fingerprint);
          lessonFingerprints.add(fingerprint);
          previous = task;
        }
        if (level >= 5) {
          assert.ok(fingerprints.size >= 2, `${id} activity ${index + 1} must vary beyond shuffled answer order`);
        }
      });
      if (level >= 5) {
        assert.ok(lessonFingerprints.size >= 18, `${id} must generate a broad set of fresh lesson-specific questions`);
      }
      if (level === 6) {
        assert.ok(interactiveGenerators >= 2, `${id} must use interactive mechanics for at least two of its three generators`);
      }
      lessonCount += 1;
    }
  }
}

console.log(`Chance Hollow generation audit passed: ${lessonCount} lessons, at least three fresh activity generators each, no fixed lesson pools.`);
