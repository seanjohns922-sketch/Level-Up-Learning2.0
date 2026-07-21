import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const frameworkDirectory = path.join(root, "components/realms/dashboard");
const requiredComponents = [
  "RealmDashboardShell.tsx",
  "RealmTopNavigation.tsx",
  "RealmLevelSelector.tsx",
  "RealmScene.tsx",
  "RealmDistrictCard.tsx",
  "RealmContinueAction.tsx",
  "RealmCurrentPath.tsx",
  "RealmSideNavigation.tsx",
  "RealmTowerProgress.tsx",
];

for (const file of requiredComponents) {
  assert.ok(fs.existsSync(path.join(frameworkDirectory, file)), `${file} is missing`);
}

for (const file of fs.readdirSync(frameworkDirectory).filter((name) => name.endsWith(".tsx"))) {
  assert.doesNotMatch(read(`components/realms/dashboard/${file}`), /MeasurelandsMap|NumberNexusMap|StarpathClient|StarpathLevelsDrawer/);
}

const registry = read("lib/realms/realm-registry.ts");
for (const realmId of ["number", "measurement", "space", "pattern", "statistics", "chance", "time"]) {
  assert.match(registry, new RegExp(`\\b${realmId}: \\{`), `Missing canonical ${realmId} realm`);
}
assert.match(registry, /space:[\s\S]*?totalWeeks: 8/);
assert.match(registry, /number:[\s\S]*?totalWeeks: 12/);
assert.match(registry, /measurement:[\s\S]*?totalWeeks: 8/);

const progress = read("lib/program-progress.ts");
assert.match(progress, /requireCanonicalRealmId\(realmId\)/);
assert.doesNotMatch(progress, /realmId === "measurement" \? "measurement" : "number"/);
assert.match(progress, /Math\.min\(getProgramWeeks\(realmId\)\.length/);
assert.doesNotMatch(progress, /week <= 12|Math\.min\(12/);

const config = read("lib/realms/realm-dashboard-config.ts");
for (const field of ["totalWeeks", "districts", "weeklyQuizWeeks", "hasPretest", "hasPosttest"]) {
  assert.match(config, new RegExp(`\\b${field}\\b`), `Dashboard config is missing ${field}`);
}
assert.match(config, /district\.weeks/);
assert.doesNotMatch(config, /index \* 2|week <= 8|week === 12/);

console.log("Realm dashboard framework audit passed.");
