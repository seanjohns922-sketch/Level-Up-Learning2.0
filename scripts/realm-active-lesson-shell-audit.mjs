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

assert.match(practice, /linear-gradient\(180deg, #fbfffe 0%, #effcf9 100%\)/);
assert.match(practice, /linear-gradient\(180deg, #fffdf7 0%, #fff7e6 100%\)/);
assert.match(engine, /Activity: \{activityLabel\}/);
assert.match(hud, /levelNumber === 0 \? "Ground"/);

console.log("Realm active lesson shell audit passed: both engines share modern realm chrome and retain existing lesson mechanics.");
