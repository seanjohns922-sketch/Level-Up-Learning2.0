#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registry } from "./starpath-curriculum-utils.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const week = registry.getStarpathProgram("ground").weeks[1];

assert.equal(week.week, 2);
assert.equal(week.title, "Shape Builders");
assert.deepEqual(week.lessons.map((lesson) => lesson.title), [
  "Build with Shapes",
  "Shape Creators",
  "Space Builders",
]);
assert.deepEqual(week.lessons.map((lesson) => lesson.learningIntention), [
  "I can use shapes to build pictures.",
  "I can make new things using shapes.",
  "I can build and explain my creations.",
]);
assert.ok(week.lessons.every((lesson) => lesson.status === "implemented"));
assert.ok(week.lessons.every((lesson) => lesson.activityMechanics.length === 3));

const expected = [
  {
    file: "data/activities/starpath/ground/week2Lesson1.ts",
    exportName: "BUILD_WITH_SHAPES_CONTENT",
    mechanics: ["Finish the Picture", "Shape Builder", "Which Shapes Did You Use?"],
  },
  {
    file: "data/activities/starpath/ground/week2Lesson2.ts",
    exportName: "SHAPE_CREATORS_CONTENT",
    mechanics: ["Copy My Picture", "Shape Challenge", "Find the Missing Shape"],
  },
  {
    file: "data/activities/starpath/ground/week2Lesson3.ts",
    exportName: "SPACE_BUILDERS_CONTENT",
    mechanics: ["Cosmic Construction", "Match the Build", "Space Museum"],
  },
];

for (const lesson of expected) {
  const source = read(lesson.file);
  assert.match(source, new RegExp(`export const ${lesson.exportName}`));
  assert.match(source, /satisfies StarpathLessonContent/);
  assert.match(source, /activities: \[/);
  assert.doesNotMatch(source, /brainBreak/i);
  for (const mechanic of lesson.mechanics) {
    assert.match(source, new RegExp(mechanic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
}

const index = read("data/activities/starpath/ground/index.ts");
for (const id of ["ground-space-w2-l1", "ground-space-w2-l2", "ground-space-w2-l3"]) {
  assert.match(index, new RegExp(`"${id}"`));
}

const sharedBlueprint = read("data/activities/realm-lesson-blueprint.ts");
assert.match(sharedBlueprint, /shuffledActivityBag/);
assert.match(sharedBlueprint, /Math\.random\(\)/);
assert.match(sharedBlueprint, /activityBag\.pop\(\)/);

const tasks = read("data/activities/starpath/ground/week2Tasks.ts");
for (const kind of [
  "starpathFinishPicture",
  "starpathShapeBuilder",
  "starpathBuildShapeIdentify",
  "starpathBuildMatch",
  "starpathSpaceMuseum",
]) {
  assert.match(tasks, new RegExp(`kind: "${kind}"`));
}

const renderer = read("components/starpath/StarpathShapeBuilderCards.tsx");
assert.match(renderer, /data-build-drop/);
assert.match(renderer, /onPointerMove/);
assert.match(renderer, /BuildObjectVisual/);
assert.match(tasks, /There is no wrong answer/);

console.log("Starpath Ground Week 2 audit passed: three implemented lessons, three randomly rotated activities per lesson, and reusable procedural shape-building mechanics.");
