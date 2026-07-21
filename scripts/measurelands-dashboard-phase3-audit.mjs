import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const shell = read("components/realms/dashboard/RealmDashboardShell.tsx");
const selector = read("components/realms/dashboard/RealmLevelSelector.tsx");
const status = read("components/realms/dashboard/RealmDashboardStatus.tsx");
const measurelands = read("components/world/MeasurelandsMap.tsx");
const measurelandsPage = read("app/measurelands/page.tsx");
const numberNexus = read("components/world/NumberNexusMap.tsx");

for (const genericBehavior of [
  "getDistrictState",
  "goToFirstIncompleteWeek",
  "launchGuidedAdventure",
  "RealmLevelSelector",
  "RealmSideNavigation",
  "fetchGlobalXp",
  "readBestChain",
  "getRecommendedAssignedWeek",
]) {
  assert.match(shell, new RegExp(`\\b${genericBehavior}\\b`), `Shared shell is missing ${genericBehavior}`);
}

assert.doesNotMatch(shell, /Measurelands|MEASURELANDS|measurement|LevelsDrawer/);
assert.doesNotMatch(measurelands, /useEffect|useState|useRouter|<button|<canvas|<FogOfForgetfulness/);
assert.match(measurelands, /satisfies CanonicalRealmDashboardConfig/);
assert.match(measurelands, /<RealmDashboardShell config=\{MEASURELANDS_DASHBOARD_CONFIG\} level=\{year\}/);

assert.match(selector, /levels\.map/);
assert.match(selector, /useState/);
assert.match(selector, /aria-haspopup="menu"/);
assert.match(selector, /role="menu"/);
assert.match(selector, /ChevronDown/);
assert.match(selector, /pointerdown/);
assert.match(selector, /event\.key === "Escape"/);
assert.match(selector, /position: "fixed"/);
assert.match(selector, /top: 60/);
assert.doesNotMatch(shell, /top: 61/);

assert.match(measurelandsPage, /RealmDashboardLoading/);
assert.match(measurelandsPage, /RealmDashboardError/);
assert.match(status, /config\.theme/);

assert.match(measurelands, /districtModeLevels: \["Year 3", "Year 4", "Year 5", "Year 6"\]/);
assert.match(measurelands, /totalWeeks: 8/);
assert.doesNotMatch(measurelands, /maxLevelIndex:/);

// Number Nexus remains on its existing implementation until its own migration.
assert.doesNotMatch(numberNexus, /RealmDashboardShell/);

console.log("Measurelands Phase 3 canonical dashboard audit passed.");
