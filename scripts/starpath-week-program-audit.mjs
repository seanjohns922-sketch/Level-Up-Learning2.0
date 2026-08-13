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
assert.equal(programs.reduce((total, program) => total + program.weeks.filter((week) => week.quiz).length, 0), 49, "Each Starpath level needs seven weekly quizzes");

for (const program of programs) {
  assert.equal(program.realmId, "space");
  assert.equal(program.weeks.length, 8);
  for (const week of program.weeks.slice(0, 7)) {
    assert.equal(week.lessons.length, 3);
    assert.equal(week.quiz?.questionCount, 15);
  }
  assert.equal(program.weeks[7]?.quiz, null, "Week 8 must lead to the post-test instead of a weekly quiz");
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
assert.doesNotMatch(programPage, /fetch\("\/api\/demo-access"/, "The live Starpath week route must not depend on demo access");
assert.match(programPage, /restoreStudentStateFromServer\(studentId, canonicalRealmId\)/, "The shared Starpath week route must restore canonical progress");
assert.match(programPage, /isStarpathRealm \? item\.type === "quiz" \? "START QUIZ" : "START MISSION"/);
assert.match(programPage, /isStarpathRealm \? "Missions" : "Lessons"/);
assert.match(programPage, /borderRadius: isStarpathRealm \? 6/);
assert.match(programPage, /readProgress\(canonicalRealmId\)/, "Starpath must read canonical space placement state");
assert.match(lessonPage, /buildStarpathProgramHref/);
assert.match(quizPage, /buildStarpathProgramHref/);
assert.match(lessonPlaceholder, /StarpathMissionHome/);
assert.match(read("components/starpath/StarpathMissionHome.tsx"), /Back to Week/);
assert.match(quizPlaceholder, /onBack=\{\(\) => router\.push\(quiz\.weekHref\)\}/);
assert.match(quizPage, /realmId !== STARPATH_REALM_ID/);

for (const fixture of [
  ["ground", 1],
  ["level-3", 1],
  ["level-6", 7],
]) {
  const [level, week] = fixture;
  const program = registry.getStarpathProgram(level);
  assert.equal(program.weeks[week - 1].lessons.length, 3);
  assert.ok(program.weeks[week - 1].quiz);
}

console.log("Starpath week program audit passed: 7 levels, 8 weeks each, 168 lessons, 49 weekly quizzes, and final-week post-tests.");
