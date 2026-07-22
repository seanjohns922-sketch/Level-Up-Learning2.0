#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registry } from "./starpath-curriculum-utils.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const allLessons = registry.STARPATH_PROGRAMS.flatMap((program) =>
  program.weeks.flatMap((week) => week.lessons)
);
const implemented = allLessons.filter((lesson) => lesson.status === "implemented");

assert.equal(allLessons.length, 7 * 8 * 3, "Starpath must expose 168 canonical lesson routes");
assert.deepEqual(implemented.map((lesson) => lesson.id), ["ground-space-w1-l1"]);

const route = read("app/starpath/lesson/[level]/[week]/[lesson]/page.tsx");
assert.match(route, /StarpathMeetTheShapesLesson/);
assert.match(route, /StarpathDevelopmentLesson/);

const missionHome = read("components/starpath/StarpathMissionHome.tsx");
for (const required of [
  "Today I am learning to...",
  "I can...",
  "Mission rewards",
  "Approximately 9 minutes",
  "Start Mission",
  "Mission preparation in progress",
]) {
  assert.match(missionHome, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}
assert.match(missionHome, /Read mission/);
assert.match(missionHome, /ReadAloudBtn/);

const implementedMission = read("components/starpath/StarpathMeetTheShapesLesson.tsx");
assert.match(implementedMission, /StarpathLessonShell/);
assert.match(implementedMission, /MEET_THE_SHAPES_CONTENT/);
assert.doesNotMatch(implementedMission, /PracticeRunner/);

const lessonShell = read("components/starpath/StarpathLessonShell.tsx");
for (const required of [
  "StarpathMissionHome",
  "PracticeRunner",
  'brainBreakFrequency="normal"',
  "showResultsAfterReflection",
  "showCoachReview={false}",
  "showMistakeReview={false}",
  "Mission Log",
  "Mission Complete!",
  "Back to Week",
  "getTaskTransition",
]) {
  assert.match(lessonShell, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}
assert.match(lessonShell, /ReadAloudBtn/);

const challengeTransition = read("components/starpath/StarpathChallengeTransition.tsx");
assert.match(challengeTransition, /Read challenge/);
assert.match(challengeTransition, /ReadAloudBtn/);

const practiceRunner = read("components/PracticeRunner.tsx");
assert.match(practiceRunner, /Mission Progress/);

const hudRail = read("components/lesson/LessonHUDRail.tsx");
assert.match(hudRail, /isStarpath/);
assert.match(hudRail, /STAR CHAIN/);

const xpBar = read("components/lesson/LessonXPBar.tsx");
assert.match(xpBar, /Mission Progress/);
assert.match(xpBar, /Starpath Progress/);

const stats = read("components/lesson/LessonStatStrip.tsx");
assert.match(stats, /Mission Accuracy/);

const combo = read("components/lesson/ComboCounter.tsx");
for (const label of ["STAR CHAIN", "IN ORBIT", "SUPERNOVA", "HYPERDRIVE", "STARPATH STATE"]) {
  assert.match(combo, new RegExp(label));
}

const platformBlueprint = read("data/activities/realm-lesson-blueprint.ts");
assert.match(platformBlueprint, /RealmLessonBlueprint/);
assert.match(platformBlueprint, /activities: readonly \[/);
assert.equal((platformBlueprint.match(/RealmLessonActivityDefinition,/g) ?? []).length, 3);

const starpathBlueprint = read("data/activities/starpath/lesson-blueprint.ts");
assert.match(starpathBlueprint, /RealmLessonBlueprint/);
assert.match(starpathBlueprint, /missionBrief/);

const lessonContent = read("data/activities/starpath/ground/week1Lesson1.ts");
assert.match(lessonContent, /satisfies StarpathLessonContent/);
assert.doesNotMatch(lessonContent, /brainBreak/i);

const runner = read("components/PracticeRunner.tsx");
assert.match(runner, /pendingTaskTransition/);
assert.match(runner, /showResultsAfterReflection/);
assert.match(runner, /pauseLessonClockRef\.current[\s\S]*pendingTaskTransition/);

console.log(`Starpath lesson experience audit passed: shared platform blueprint, dedicated Starpath shell, ${allLessons.length} mission-home routes, ${implemented.length} implemented mission, ${allLessons.length - implemented.length} safely unavailable mission engines.`);
