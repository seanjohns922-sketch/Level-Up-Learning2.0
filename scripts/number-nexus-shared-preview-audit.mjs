import assert from "node:assert/strict";
import fs from "node:fs";

const activePage = fs.readFileSync("app/number-nexus/page.tsx", "utf8");
const activeMap = fs.readFileSync("components/world/NumberNexusMap.tsx", "utf8");
const previewPage = fs.readFileSync("app/number-nexus/shared-preview/page.tsx", "utf8");
const previewMap = fs.readFileSync("components/world/NumberNexusSharedPreview.tsx", "utf8");
const shell = fs.readFileSync("components/realms/dashboard/RealmDashboardShell.tsx", "utf8");

assert.match(activePage, /import\("@\/components\/world\/NumberNexusMap"\)/);
assert.doesNotMatch(activePage, /SharedPreview|RealmDashboardShell/);
assert.doesNotMatch(activeMap, /SharedPreview/);

assert.match(previewPage, /NODE_ENV !== "production"/);
assert.match(previewPage, /getServerStarpathAccess/);
assert.match(previewPage, /redirect\("\/number-nexus"\)/);
assert.match(previewMap, /RealmDashboardShell/);
assert.match(previewMap, /storageRealmId: "number"/);
assert.match(previewMap, /totalWeeks: 12/);
assert.match(previewMap, /readProgress\("number"\)/);
assert.doesNotMatch(previewMap, /writeProgress|updateProgress|save|upsert|complete_realm/);

const expectedDistricts = [
  ["counting", 1, 3],
  ["bridge", 4, 6],
  ["tower", 12, 12],
  ["core", 7, 9],
  ["mastery", 10, 11],
];

for (const [id, start, end] of expectedDistricts) {
  assert.match(previewMap, new RegExp(`id: "${id}"[\\s\\S]*?weekStart: ${start},[\\s\\S]*?weekEnd: ${end},`));
}

assert.match(shell, /getRecommendedAssignedWeek\(/);
assert.match(shell, /getWeekProgress\(/);
assert.match(shell, /isWeekComplete\(/);
assert.match(shell, /fetchGlobalXp\(/);
assert.match(shell, /realm_id=\$\{config\.storageRealmId\}/);

function activeDistrictState(currentWeek, start, end, completedWeeks) {
  const complete = Array.from({ length: end - start + 1 }, (_, index) => start + index)
    .every((week) => completedWeeks.has(week));
  if (complete) return "complete";
  return currentWeek >= start ? "current" : "locked";
}

function sharedDistrictState(currentWeek, start, end, completedWeeks) {
  const complete = Array.from({ length: end - start + 1 }, (_, index) => start + index)
    .every((week) => completedWeeks.has(week));
  if (complete) return "complete";
  if (currentWeek >= start && currentWeek <= end) return "current";
  if (currentWeek > end) return "open";
  return "locked";
}

const syntheticStudents = [
  { name: "Ground placement", level: "Prep", week: 1, completed: [] },
  { name: "Level 1 full path", level: "Year 1", week: 4, completed: [1, 2, 3] },
  { name: "Level 2 active resume", level: "Year 2", week: 7, completed: [1, 2, 3, 4, 5, 6] },
  { name: "Level 3 targeted path", level: "Year 3", week: 7, completed: [4, 5, 6] },
  { name: "Level 4 incomplete district", level: "Year 4", week: 8, completed: [1, 2] },
  { name: "Level 5 final district", level: "Year 5", week: 12, completed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { name: "Level 6 complete", level: "Year 6", week: 12, completed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
];

let knownStateDifferences = 0;
for (const student of syntheticStudents) {
  assert.ok(student.week >= 1 && student.week <= 12, `${student.name} has an invalid week`);
  const completed = new Set(student.completed);
  for (const [, start, end] of expectedDistricts) {
    if (activeDistrictState(student.week, start, end, completed) !== sharedDistrictState(student.week, start, end, completed)) {
      knownStateDifferences += 1;
    }
  }
}

assert.ok(knownStateDifferences > 0, "The known legacy/shared past-district state difference was not detected");

console.log(`PASS: active /number-nexus route still owns NumberNexusMap`);
console.log(`PASS: preview is guarded and uses RealmDashboardShell with number-scoped reads`);
console.log(`PASS: 12 weeks and all five production district ranges are represented`);
console.log(`PASS: ${syntheticStudents.length} synthetic progression states audited`);
console.log(`KNOWN DIFFERENCE: ${knownStateDifferences} past incomplete district states render current in production and open in the shared shell`);
