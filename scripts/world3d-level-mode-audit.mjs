import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [themes, world, entry, state] = await Promise.all([
  readFile(new URL("../lib/number-nexus-visuals.ts", import.meta.url), "utf8"),
  readFile(new URL("../components/world3d/NumberNexusLevel3World.tsx", import.meta.url), "utf8"),
  readFile(new URL("../components/world3d/NumberNexus3DEntry.tsx", import.meta.url), "utf8"),
  readFile(new URL("../lib/world3d/number-nexus-level3-state.ts", import.meta.url), "utf8"),
]);

for (const level of ["Prep", "Year 1", "Year 2"]) {
  const key = level === "Prep" ? "Prep:" : `${JSON.stringify(level)}:`;
  const block = themes.slice(themes.indexOf(key), themes.indexOf("},", themes.indexOf(key)) + 2);
  assert.match(block, /experienceMode: "guided-adventure"/, `${level} must use the single-portal guided plaza`);
}
for (const level of ["Year 3", "Year 4", "Year 5", "Year 6"]) {
  const block = themes.slice(themes.indexOf(`${JSON.stringify(level)}:`), themes.indexOf("},", themes.indexOf(`${JSON.stringify(level)}:`)) + 2);
  assert.match(block, /experienceMode: "district-exploration"/, `${level} must use the shared district city`);
}

assert.match(world, /if \(guidedAdventure\) \{\s*return \[\{/, "Guided mode must build one portal gate directly");
assert.match(world, /kind: "adventure"/, "Guided mode must expose the adventure portal gate kind");
assert.match(world, /guidedAdventure \? \[\] : buildDistricts/, "Guided mode must render no districts");
assert.match(world, /<WorldHUD/, "All level modes must use the shared world HUD");
assert.match(world, /context="realm"/, "All level modes must retain fast Realm Teleport navigation");
assert.doesNotMatch(entry, /Level 3 only|wrong-level/, "The 3D entry must support every Number Nexus level");
assert.match(state, /getNumberNexusWorldState/, "Progression state must resolve the selected level dynamically");
assert.match(state, /yearLabel: level/, "Lesson routing must use the selected canonical level");

console.log("World 3D level-mode audit passed.");
