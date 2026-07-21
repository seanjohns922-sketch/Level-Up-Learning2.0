import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const navigation = read("components/realms/dashboard/RealmTopNavigation.tsx");
const selector = read("components/realms/dashboard/RealmLevelSelector.tsx");
const shell = read("components/realms/dashboard/RealmDashboardShell.tsx");
const number = read("components/world/NumberNexusMap.tsx");
const starpath = read("app/starpath/StarpathClient.tsx");
const levels = read("components/realms/LevelsDrawer.tsx");
const starpathLevels = read("components/realms/StarpathLevelsDrawer.tsx");
const demoBanner = read("components/demo/DemoPreviewBanner.tsx");

for (const source of [shell, number, starpath]) {
  assert.match(source, /<RealmTopNavigation/, "Realm must use the canonical top navigation");
}

for (const required of ["levelSelector", "Global XP", "progressLabel", "DemoModeNavigationControls", "Open student profile"]) {
  assert.match(navigation, new RegExp(required), `Top navigation is missing ${required}`);
}

assert.match(selector, /compactLabel/);
assert.match(selector, /Level \$\{number\}/);
assert.match(selector, /panelLabel/);
assert.match(selector, /position: "fixed"/);
assert.match(selector, /visibility: open/);
assert.match(selector, /pointerdown/);
assert.match(selector, /event\.key === "Escape"/);
assert.match(selector, /setOpen\(false\);[\s\S]*onSelect/);

assert.match(levels, /enterReviewMode/);
assert.match(levels, /exitReviewMode/);
assert.match(levels, /state: !unlocked \? "locked"/);
assert.match(starpathLevels, /STARPATH_LEVELS\.map/);
assert.doesNotMatch(starpathLevels, /levelNumber <= 2/);

assert.match(demoBanner, /usesRealmNavigation/);
assert.doesNotMatch(starpath, /Demo · Preview/);
assert.doesNotMatch(shell, /top: 61/);

console.log("Canonical realm top navigation audit passed for Measurelands, Number Nexus, and Starpath.");
