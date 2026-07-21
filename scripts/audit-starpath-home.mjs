#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dashboard = fs.readFileSync(path.join(root, "components/world/StarpathMap.tsx"), "utf8");
const shell = fs.readFileSync(path.join(root, "components/realms/dashboard/RealmDashboardShell.tsx"), "utf8");

for (const suffix of ["ground", "y1", "y2", "y3", "y4", "y5", "y6"]) {
  const asset = `public/images/starpath-home-bg-${suffix}.png`;
  assert.ok(fs.existsSync(path.join(root, asset)), `Missing ${asset}`);
  assert.match(dashboard, new RegExp(`/images/starpath-home-bg-${suffix}\\.png`));
}

assert.match(dashboard, /RealmDashboardShell/);
assert.match(dashboard, /districtModeLevels: \["Year 3", "Year 4", "Year 5", "Year 6"\]/);
assert.match(dashboard, /DISTRICT_POSITIONS\.map/);
assert.match(dashboard, /START VOYAGE/);
assert.match(dashboard, /CONTINUE VOYAGE/);
assert.match(dashboard, /storageRealmId: "space"/);
assert.match(dashboard, /#8fe7ff/);
assert.match(dashboard, /#c4b5fd/);
assert.match(shell, /RealmDistrictLabel/);
assert.match(shell, /RealmSideNavigation/);
assert.match(shell, /RealmLevelSelector/);

console.log("Starpath home audit passed: seven backgrounds, shared shell/navigation, guided Ground–L2 entry, and four L3–L6 districts are configured.");
