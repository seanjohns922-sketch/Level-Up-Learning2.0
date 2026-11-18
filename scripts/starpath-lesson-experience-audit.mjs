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
const groundLessons = allLessons.filter((lesson) => lesson.id.startsWith("ground-space-"));

assert.equal(allLessons.length, 7 * 8 * 3, "Starpath must expose 168 canonical lesson routes");
assert.equal(groundLessons.length, 24, "Ground Starpath must expose 24 lessons");
assert.ok(groundLessons.every((lesson) => lesson.status === "implemented"), "Every Ground Starpath lesson must be implemented");

const route = read("app/starpath/lesson/[level]/[week]/[lesson]/page.tsx");
assert.match(route, /StarpathGroundLesson/);
assert.match(route, /StarpathDevelopmentLesson/);

// Starpath missions use the shared lesson start page, with each mission's own brief and artwork.
const missionHome = read("components/starpath/StarpathMissionHome.tsx");
for (const required of ["<RealmLessonHome", 'realm="space"', "intro={content?.missionBrief", "artworkSrc={content?.artworkSrc", "Mission preparation in progress", "focus={lesson.learningIntention}"]) {
  assert.ok(missionHome.includes(required), `Starpath mission home must pass ${required}`);
}
const sharedHome = read("components/lesson/RealmLessonHome.tsx");
for (const required of ["Today I am learning to...", "I can...", "Approximately 9 minutes", 'rewardLabel:"Mission Rewards"', 'startLabel:"Begin Mission"', "ReadAloudBtn"]) {
  assert.ok(sharedHome.includes(required), `Shared lesson home must show ${required}`);
}

const implementedMission = read("components/starpath/StarpathGroundLesson.tsx");
assert.match(implementedMission, /StarpathLessonShell/);
assert.match(implementedMission, /GROUND_LESSON_CONTENT/);
assert.doesNotMatch(implementedMission, /PracticeRunner/);

const lessonShell = read("components/starpath/StarpathLessonShell.tsx");
for (const required of [
  "StarpathMissionHome",
  "<RealmActiveLessonShell",
  'realm="space"',
  "PracticeRunner",
  'brainBreakFrequency="normal"',
  "showResultsAfterReflection",
  "showCoachReview",
  "showMistakeReview={false}",
  "Mission Log",
  "Mission Complete!",
  "Back to Week",
]) {
  assert.match(lessonShell, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}
// Read-aloud for the mission title and learning goal comes from the shared lesson frame.
assert.match(read("components/lesson/RealmActiveLessonShell.tsx"), /ReadAloudBtn/);
assert.doesNotMatch(lessonShell, /getTaskTransition/);
assert.doesNotMatch(lessonShell, /StarpathChallengeTransition/);
assert.doesNotMatch(lessonShell, /activityNoun="Challenge"/);

const practiceRunner = read("components/PracticeRunner.tsx");
assert.match(practiceRunner, /Mission Progress/);

const hudRail = read("components/lesson/LessonHUDRail.tsx");
assert.match(hudRail, /isStarpath/);
assert.match(hudRail, /STAR CHAIN/);

const xpBar = read("components/lesson/LessonXPBar.tsx");
assert.match(xpBar, /Mission Progress/);
assert.match(xpBar, /Starpath Progress/);

const stats = read("components/lesson/LessonMasteryTile.tsx");
assert.match(stats, /Mission Accuracy/);

const combo = read("components/lesson/ComboCounter.tsx");
for (const label of ["STAR CHAIN", "IN ORBIT", "SUPERNOVA", "HYPERDRIVE", "STARPATH STATE"]) {
  assert.match(combo, new RegExp(label));
}

const platformBlueprint = read("data/activities/realm-lesson-blueprint.ts");
assert.match(platformBlueprint, /RealmLessonBlueprint/);
assert.match(platformBlueprint, /activities: readonly \[/);
assert.equal((platformBlueprint.match(/RealmLessonActivityDefinition,/g) ?? []).length, 3);
assert.match(platformBlueprint, /\.\.\.RealmLessonActivityDefinition\[\]/);
assert.match(platformBlueprint, /createRandomRealmLessonGenerator/);
assert.match(platformBlueprint, /shuffledActivityBag/);
assert.match(platformBlueprint, /Math\.random\(\)/);
assert.match(platformBlueprint, /activityBag\.pop\(\)/);
assert.doesNotMatch(platformBlueprint, /activityDurationSeconds/);

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

console.log(`Starpath lesson experience audit passed: shared platform blueprint, dedicated Starpath shell, ${allLessons.length} mission-home routes, ${implemented.length} implemented missions, including all ${groundLessons.length} Ground missions.`);
