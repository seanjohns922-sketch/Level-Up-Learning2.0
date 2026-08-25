import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [entry, world, environment, state, genericState, themes, access, tower, route] = await Promise.all([
  read("components/world3d/Measurelands3DEntry.tsx"),
  read("components/world3d/MeasurelandsLevel3World.tsx"),
  read("components/world3d/MeasurelandsEnvironment.tsx"),
  read("lib/world3d/measurelands-level3-state.ts"),
  read("lib/world3d/realm-world-state.ts"),
  read("lib/measurelands-visuals.ts"),
  read("lib/world3d/access.ts"),
  read("lib/world3d/tower-realm-entry.ts"),
  read("app/world/measurelands/page.tsx"),
]);

assert.match(entry, /dynamic\(\(\) => import\("@\/components\/world3d\/MeasurelandsLevel3World"\)/, "Measurelands must remain route-lazy");
assert.match(entry, /resolveRealm3DAccess\(\{ realmId: "measurement"/, "Measurelands must use central 3D access");
assert.match(entry, /router\.replace\("\/measurelands"\)/, "Measurelands must retain its 2D fallback");
assert.match(entry, /\["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"\]/, "Measurelands production access must include Ground and Levels 1-6");
assert.match(route, /Measurelands3DEntry/, "Measurelands world route is missing");

for (const sharedImport of ["SharedThirdPersonPlayer", "WorldMovePad", "WorldHUD", "WorldInteractionPrompt"]) {
  assert.match(world, new RegExp(sharedImport), `Missing shared world component: ${sharedImport}`);
}
assert.match(world, /rememberWorld3DWeekEntry/, "Week entry must use shared return context");
assert.match(world, /realmId: "measurement"/, "Return context must identify canonical measurement realm");
assert.match(world, /router\.push\(node\.route\)/, "Week gates must use canonical routes");
assert.match(world, /__MEASURELANDS_3D_METRICS__/, "Performance instrumentation is missing");
assert.match(world, /gl=\{\{ alpha: true/, "The Level 3 matte requires a transparent WebGL canvas");

const districts = [
  ["ruler-district", "Ruler District", "weeks: [1, 2]"],
  ["measure-lab", "Measure Lab", "weeks: [3, 4]"],
  ["timeworks", "Timeworks", "weeks: [5, 6]"],
  ["explorer-district", "Explorer District", "weeks: [7, 8]"],
];
for (const [id, label, weeks] of districts) {
  assert.ok(state.includes(`id: "${id}"`) && state.includes(`label: "${label}"`) && state.includes(weeks), `Canonical district definition missing: ${label}`);
}
assert.match(state, /getRealmWorldState/, "Measurelands must consume the shared canonical progression adapter");
assert.doesNotMatch(state + world, /measurelands(?:3D)?Progress/i, "Measurelands must not create parallel 3D progress");
assert.match(genericState, /getPlayableWeeks/, "Shared state must respect targeted playable weeks");
assert.match(genericState, /buildLessonRoute/, "Shared state must use canonical lesson routing");

for (const level of ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"]) {
  assert.ok(themes.includes(`${level}:`) || themes.includes(`"${level}":`), `Missing Measurelands theme: ${level}`);
}
assert.match(themes, /measurelands-panorama-y3-360-4k\.jpg/, "Level 3 must use the approved 360-degree panorama");
assert.match(environment, /MeasurelandsGround/, "Measurelands themed ground is missing");
assert.doesNotMatch(environment, /ClockMonument|BalanceMonument/, "Removed clock and scale landmarks must not return");
assert.ok(access.includes('"measurement"'), "Central 3D access does not support Measurelands");
assert.match(tower, /\/world\/measurelands/, "Tower entry does not resolve to Measurelands 3D");

const background = await stat(new URL("../public/images/measurelands-panorama-y3-360-4k.jpg", import.meta.url));
assert.ok(background.size <= 3_000_000, `Level 3 panorama exceeds approval budget: ${background.size} bytes`);

console.log("Measurelands M3D-1 shared-world audit passed.");
console.log(JSON.stringify({ districts: districts.length, weeks: 8, level3BackgroundBytes: background.size }));
