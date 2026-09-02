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
const statisticaShell = read("components/statistica/StatisticaLessonShell.tsx");
const patternShell = read("components/pattern-peaks/PatternPeaksLessonShell.tsx");
const comboActivation = read("components/lesson/ComboActivation.tsx");
const nexusActivation = read("components/lesson/NexusActivation.tsx");
const realmTheme = read("lib/useRealmTheme.ts");

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
assert.match(practice, /hasStatisticaFeedback/);

for (const marker of [
  'realmId="pattern"',
  'realm="pattern"',
  "generatePatternPeaksQuestion",
]) {
  assert.ok(patternShell.includes(marker), `Pattern Peaks active lesson is missing shared functionality: ${marker}`);
}

assert.match(engine, /const isPattern = realmId === "pattern"/);
assert.match(engine, /const isNumber = !realmId \|\| realmId === "number"/);
assert.match(engine, /isPattern \? "Pattern State" : "Nexus State"/);
assert.match(engine, /data-number-nexus-level=\{isModernNumber \? String\(levelNumber\) : undefined\}/);
assert.match(comboActivation, /const PATTERN_TIERS/);
assert.match(nexusActivation, /const PATTERN_THEME/);
assert.match(realmTheme, /if \(realmId === "pattern"\) return PATTERN_PEAKS/);

for (const numberMarker of [
  'title: "SURGE"',
  'title: "OVERDRIVE"',
  'title: "NEXUS STATE"',
  'copy: "Your number power is surging!"',
]) {
  assert.ok(
    comboActivation.includes(numberMarker) || nexusActivation.includes(numberMarker),
    `Number Nexus presentation changed or is missing: ${numberMarker}`,
  );
}

for (const marker of [
  "RealmActiveLessonShell",
  'realm="statistics"',
  'completionMode="time_only"',
  "liveContext={{",
  'strand: "Statistics"',
  "practisedSkills={[...successCriteria]}",
  'activityNoun="Investigation"',
]) {
  assert.ok(statisticaShell.includes(marker), `Statistica active lesson is missing shared functionality: ${marker}`);
}
assert.match(
  statisticaShell,
  /<RealmActiveLessonShell[\s\S]*<PracticeRunner[\s\S]*<\/RealmActiveLessonShell>/,
  "Statistica PracticeRunner must remain inside the shared active lesson shell"
);

for (const [name, source] of [["graph", graph], ["tally", tally], ["sort", sort]]) {
  assert.match(source, /#f06b64/, `Statistica ${name} activity must use the coral realm accent`);
  assert.match(source, /#f2bc45/, `Statistica ${name} activity must use the gold realm accent`);
  assert.doesNotMatch(source, /(?:cyan|teal)-/, `Statistica ${name} activity must not inherit Number Nexus cyan/teal classes`);
}

console.log("Realm active lesson shell audit passed: shared lesson mechanics retain distinct Number Nexus, Measurelands, Starpath, Statistica and Pattern Peaks presentation.");
