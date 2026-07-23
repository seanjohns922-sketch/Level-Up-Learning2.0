#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registry } from "./starpath-curriculum-utils.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const lesson = registry.getStarpathProgram("ground").weeks[0].lessons[0];
assert.equal(lesson.id, "ground-space-w1-l1");
assert.equal(lesson.title, "Meet the Shapes");
assert.equal(lesson.learningIntention, "I can recognise and name familiar shapes.");
assert.equal(lesson.status, "implemented");
assert.deepEqual(lesson.activityMechanics, [
  "cosmic-shape-match",
  "shape-name-recall",
  "shape-sorter",
]);

const generator = read("data/activities/starpath/ground/week1Lesson1.ts");
for (const kind of [
  "starpathShapeIntro",
  "starpathShapeMatch",
  "starpathShapeSort",
  "starpathShapeName",
]) {
  assert.match(generator, new RegExp(`kind: [\"']${kind}[\"']`), `${kind} must be generated`);
}
assert.match(generator, /createMeetTheShapesTaskSet/);
assert.match(generator, /activities: \[/);
assert.match(generator, /shapeNameTask\(nameRound, target\)/);
assert.match(generator, /MEET_THE_SHAPES_CONTENT/);
assert.match(generator, /satisfies StarpathLessonContent/);
assert.match(generator, /activities:/);
for (const title of [
  "Cosmic Shape Match",
  "Name the Shape",
  "Shape Sorter",
]) {
  assert.match(generator, new RegExp(title));
}
assert.doesNotMatch(generator, /brainBreak/i);

const route = read("app/starpath/lesson/[level]/[week]/[lesson]/page.tsx");
assert.match(route, /GROUND_LESSON_CONTENT\[lesson\.id\]/);
assert.match(route, /StarpathGroundLesson/);

const lessonComponent = read("components/starpath/StarpathGroundLesson.tsx");
assert.match(lessonComponent, /StarpathLessonShell/);
assert.match(lessonComponent, /GROUND_LESSON_CONTENT/);
assert.doesNotMatch(lessonComponent, /PracticeRunner/);

const lessonShell = read("components/starpath/StarpathLessonShell.tsx");
assert.match(lessonShell, /PracticeRunner/);
assert.match(lessonShell, /completionMode="time_only"/);
assert.match(lessonShell, /realmId="space"/);
assert.match(lessonShell, /writeStarpathDemoJourney/);
assert.match(lessonShell, /brainBreakFrequency="normal"/);
assert.doesNotMatch(lessonShell, /getTaskTransition/);
assert.match(lessonShell, /createRandomRealmLessonGenerator/);

const renderer = read("components/starpath/StarpathShapeTaskCard.tsx");
const shapeObjects = read("data/activities/starpath/ground/shape-objects.ts");
assert.match(renderer, /data-shape-drop/);
assert.match(renderer, /onPointerMove/);
assert.match(renderer, /Drag the shape, or tap its planet/);
assert.match(renderer, /Target shape/);
assert.match(shapeObjects, /label: "Planet"/);
assert.match(shapeObjects, /label: "Flag"/);
assert.match(shapeObjects, /label: "Window"/);
assert.match(shapeObjects, /label: "Door"/);

console.log("Starpath Ground Week 1 Lesson 1 audit passed: teaching + Match, Name and Sort only.");
