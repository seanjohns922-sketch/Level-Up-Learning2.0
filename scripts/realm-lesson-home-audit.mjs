import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const home = read("components/lesson/RealmLessonHome.tsx");
const route = read("app/lesson/page.tsx");

for (const marker of [
  'number: {',
  'measurement: {',
  'realmName: "Number Nexus"',
  'realmName: "Measurelands"',
  "getHomeBg",
  "MEASURELANDS_BACKGROUNDS",
  'if (year === "Prep") return "/images/measurelands-home-bg.png"',
  "childFacingCriterion",
  "explain how I know",
  "Today I am learning to...",
  "I can...",
  "Approximately 9 minutes",
  "ReadAloudBtn",
  "embeddedVideoSrc",
  "Mission Rewards",
  "Quest Rewards",
]) {
  assert.ok(home.includes(marker), `Missing modern lesson-home marker: ${marker}`);
}

assert.match(route, /!started \? \(\s*<RealmLessonHome/);
assert.match(route, /realm=\{lessonRealmId\}/);
assert.match(route, /successCriteria=\{lessonMeta\?\.activityIdeas/);
assert.match(route, /hasEmbeddedLessonVideo[\s\S]*player\.vimeo\.com/);
assert.match(route, /eventType: "lesson_started"/);
assert.match(route, /resetYear1SessionTaskState\(\)/);
assert.match(route, /resetPrepMeasurelandsLessonSessionState\(\)/);
assert.doesNotMatch(route, /const lt = isMeasurement/);

console.log("Realm lesson home audit passed: shared modern shell, distinct Number Nexus and Measurelands themes, existing start behavior preserved.");
