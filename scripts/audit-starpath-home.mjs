#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const client = fs.readFileSync(path.join(root, "app/starpath/StarpathClient.tsx"), "utf8");

for (const suffix of ["ground", "y1", "y2", "y3", "y4", "y5", "y6"]) {
  const asset = `public/images/starpath-home-bg-${suffix}.png`;
  assert.ok(fs.existsSync(path.join(root, asset)), `Missing ${asset}`);
  assert.match(client, new RegExp(`/images/starpath-home-bg-${suffix}\\.png`));
}

assert.match(client, /guidedMode = \(selectedDefinition\?\.levelNumber \?\? 0\) <= 2/);
assert.match(client, /Start Adventure/);
assert.match(client, /Array\.from\(\{ length: 4 \}/);
assert.match(client, /Weeks \{district\.weekStart\}–\{district\.weekEnd\}/);
assert.match(client, /STARPATH_DISTRICT_NAMES/);
assert.match(client, /#8fe7ff/);
assert.match(client, /#c4b5fd/);
assert.match(client, /Demo progress is not saved/);

console.log("Starpath home audit passed: seven level backgrounds, guided Ground–L2 entry, four L3–L6 districts, and Starpath theming are present.");
