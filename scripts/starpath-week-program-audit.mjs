#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registry } from "./starpath-curriculum-utils.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const programs = registry.STARPATH_PROGRAMS;
assert.equal(programs.length, 7, "Starpath must define Ground and Levels 1-6");
assert.equal(programs.reduce((total, program) => total + program.weeks.length, 0), 56, "Starpath must define 56 level-weeks");
assert.equal(programs.reduce((total, program) => total + program.weeks.flatMap((week) => week.lessons).length, 0), 168, "Starpath must define 168 lesson slots");
assert.equal(programs.reduce((total, program) => total + program.weeks.filter((week) => week.quiz).length, 0), 56, "Every Starpath week needs a quiz");

for (const program of programs) {
  assert.equal(program.realmId, "space");
  assert.equal(program.weeks.length, 8);
  for (const week of program.weeks) {
    assert.equal(week.lessons.length, 3);
    assert.equal(week.quiz?.questionCount, 15);
  }
}

const dashboard = read("components/world/StarpathMap.tsx");
const programPage = read("app/program/page.tsx");
const lessonPage = read("app/starpath/lesson/[level]/[week]/[lesson]/page.tsx");
const quizPage = read("app/starpath/quiz/[level]/[week]/page.tsx");
const lessonPlaceholder = read("components/starpath/StarpathDevelopmentLesson.tsx");
const quizPlaceholder = read("components/starpath/StarpathDevelopmentQuiz.tsx");

assert.match(dashboard, /buildStarpathProgramHref/, "Dashboard must enter the week page first");
assert.doesNotMatch(dashboard, /buildStarpathLessonHref/, "Dashboard must not bypass the week page");
assert.match(programPage, /realmId !== "space"/);
assert.match(programPage, /getStarpathProgram/);
assert.match(programPage, /getStarpathBackground/);
assert.match(programPage, /buildStarpathWeeklyQuizHref/);
assert.match(programPage, /fetch\("\/api\/demo-access"/, "The shared Starpath week route must validate demo access");
assert.match(programPage, /isStarpathRealm \? item\.type === "quiz" \? "START QUIZ" : "START MISSION"/);
assert.match(programPage, /isStarpathRealm \? "Missions" : "Lessons"/);
assert.match(programPage, /activityCardVariant: "standard" \| "portal-circle"/);
assert.match(programPage, /isStarpathRealm \? null : readProgress\(canonicalRealmId\)/, "Starpath must not read another realm's placement state");
assert.match(lessonPage, /buildStarpathProgramHref/);
assert.match(quizPage, /buildStarpathProgramHref/);
assert.match(lessonPlaceholder, /Back to Week/);
assert.match(quizPlaceholder, /Back to Week/);
assert.match(quizPage, /realmId !== STARPATH_REALM_ID/);

for (const fixture of [
  ["ground", 1],
  ["level-3", 1],
  ["level-6", 8],
]) {
  const [level, week] = fixture;
  const program = registry.getStarpathProgram(level);
  assert.equal(program.weeks[week - 1].lessons.length, 3);
  assert.ok(program.weeks[week - 1].quiz);
}

console.log("Starpath week program audit passed: 7 levels, 8 weeks each, 168 lessons, 56 quizzes, isolated space routing.");
