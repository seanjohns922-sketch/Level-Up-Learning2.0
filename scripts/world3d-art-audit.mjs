import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const environmentPath = new URL("../components/world3d/CountingDistrictEnvironment.tsx", import.meta.url);
const cityEnvironmentPath = new URL("../components/world3d/NumberNexusCityEnvironment.tsx", import.meta.url);
const guidedEnvironmentPath = new URL("../components/world3d/NumberNexusGuidedEnvironment.tsx", import.meta.url);
const themesPath = new URL("../lib/number-nexus-visuals.ts", import.meta.url);
const worldPath = new URL("../components/world3d/NumberNexusLevel3World.tsx", import.meta.url);
const mapPath = new URL("../components/world/NumberNexusMap.tsx", import.meta.url);
const [environment, cityEnvironment, guidedEnvironment, themes, world, map] = await Promise.all([
  readFile(environmentPath, "utf8"),
  readFile(cityEnvironmentPath, "utf8"),
  readFile(guidedEnvironmentPath, "utf8"),
  readFile(themesPath, "utf8"),
  readFile(worldPath, "utf8"),
  readFile(mapPath, "utf8"),
]);

assert.match(environment, /ProductionWeekGate/, "Counting District must use one shared production gate model");
assert.match(environment, /NumberGate/, "Counting District must include its hero Number Gate landmark");
assert.doesNotMatch(environment, /TowerVista/, "The removed rocket-style Tower must not return to the weeks scene");
assert.match(environment, /quality === "low" \? 8 : quality === "medium" \? 12 : 16/, "Quality tiers must control skyline density");
assert.match(guidedEnvironment, /StartAdventurePortal/, "Ground-Level 2 must use one hero adventure portal");
assert.match(guidedEnvironment, /NumberNexusGuidedEnvironment/, "Ground-Level 2 must use the guided plaza environment");
assert.match(cityEnvironment, /asset=\{theme\.background\}/, "The city panorama must come from level theme configuration");
assert.match(environment, /asset=\{theme\.background\}/, "The district panorama must come from level theme configuration");
// Owner-authorised (View 1/View 2 city brief): a distant Number Nexus city
// panorama + a small texture atlas / modular assets are now permitted. Guard
// only that any image the district loads is an approved Number Nexus asset.
{
  const source = `${environment}\n${cityEnvironment}\n${guidedEnvironment}\n${themes}`;
  const assetRefs = [...new Set([...source.matchAll(/["'`](\/[^"'`]+\.(?:png|jpe?g|webp|glb|gltf))["'`]/g)].map((m) => m[1]))];
  for (const ref of assetRefs) {
    assert.match(ref, /^\/images\/number-nexus-/, `District art assets must be approved Number Nexus assets (got ${ref})`);
    const assetSize = (await stat(new URL(`../public${ref}`, import.meta.url))).size;
    assert.ok(assetSize <= 8 * 1024 * 1024, `A Number Nexus level theme must stay within the 8 MB scene target (got ${assetSize} bytes for ${ref})`);
  }
  console.log(`World 3D art boundary audit passed (${assetRefs.length} approved level assets).`);
}
assert.match(world, /__NUMBER_NEXUS_3D_METRICS__/, "The scene must expose opt-in performance telemetry");
assert.match(world, /selectedDistrictId === "counting-district"/, "Production art must remain scoped to Counting District");
assert.doesNotMatch(map, /CountingDistrictEnvironment|NumberNexusLevel3World/, "The normal 2D map must not import the production 3D scene");
