import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const route = read("app/lesson/page.tsx");
const shell = read("components/lesson/RealmActiveLessonShell.tsx");
const practice = read("components/PracticeRunner.tsx");
const engine = read("components/lesson/Year2LessonEngine.tsx");
const hud = read("components/lesson/LessonHUDRail.tsx");
const graph = read("components/statistica/StatisticaGraphCard.tsx");
const tally = read("components/statistica/StatisticaTallyCard.tsx");
const sort = read("components/statistica/StatisticaSortCard.tsx");

assert.equal(
  (route.match(/<RealmActiveLessonShell/g) ?? []).length,
  2,
  "Both PracticeRunner and Year2LessonEngine branches must use the modern shell"
);
assert.match(route, /<PracticeRunner[\s\S]*onComplete=\{completeLesson\}/);
assert.match(route, /<Year2LessonEngine[\s\S]*onTimedComplete=\{completeLesson\}/);
assert.match(route, /brainBreakFrequency=\{brainBreakFrequency\}/);
assert.match(route, /demoMode=\{previewMode \|\| DEMO_MODE\}/);

for (const marker of [
  "REALM_LESSON_THEMES",
  "getRealmLessonArtwork",
  "Back to Week",
  "Number Nexus",
  "Measurelands",
  "Demo Mode",
  "max-w-[1500px]",
]) {
  assert.ok(shell.includes(marker) || route.includes(marker), `Missing active lesson shell marker: ${marker}`);
}

assert.match(practice, /background: "#f8fbfc"/);
assert.match(practice, /linear-gradient\(180deg, #fffdf7 0%, #fff7e6 100%\)/);
assert.match(practice, /const isStatistics = realmId === "statistics"/);
assert.match(practice, /isStructuredRealm = isMeasurement \|\| isStarpath \|\| isStatistics/);
assert.match(practice, /linear-gradient\(180deg, #fffaf0 0%, #f1f5e8 100%\)/);
assert.match(engine, /Activity: \{activityLabel\}/);
assert.match(hud, /levelNumber === 0 \? "Ground"/);
assert.match(hud, /"DATA STREAK"/);

for (const [name, source] of [["graph", graph], ["tally", tally], ["sort", sort]]) {
  assert.match(source, /#f06b64/, `Statistica ${name} activity must use the coral realm accent`);
  assert.match(source, /#f2bc45/, `Statistica ${name} activity must use the gold realm accent`);
  assert.doesNotMatch(source, /(?:cyan|teal)-/, `Statistica ${name} activity must not inherit Number Nexus cyan/teal classes`);
}

console.log("Realm active lesson shell audit passed: shared lesson mechanics retain distinct Number Nexus, Measurelands, Starpath and Statistica presentation.");
