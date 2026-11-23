// Swimming: every bit of water is deep enough to swim in. Painted water and Swimming Lakes shelve in from
// the bank to a shoulder-deep float, the river runs deep in the middle, swimmers are slower, and cars stay
// out. Plus the Swimming Lake's shop rows matching the migration and the hub wiring.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { buildWaterAreas, placedLakes, swimFeetY, swimSurfaceAt, waterReach, withSwimming, LAKE_WATER_SIZE, SWIM_BED_Y, SWIM_FLOAT_DEPTH, SWIM_SURFACE_Y, SWIM_SPEED } from "../lib/world3d/swimming.ts";
import { HUB_V2_SWIM_DEPTH, HUB_V2_WATER_Y, hubGroundHeight, hubRiverX, hubSpeedFactor, hubSwimSurfaceAt, hubWaterDepth } from "../lib/world3d/central-world-v2.ts";
import { PREMIUM_HOME_SHOP_ITEMS, PREMIUM_HOME_SPECS, PREMIUM_HOME_UPGRADE_ITEMS, WATER_STYLES, premiumHomeItemKey } from "../lib/world3d/premium-homes.ts";
import { centralWorldCategory, MARKETPLACE_CATEGORIES } from "../lib/marketplace-categories.ts";

const flat = () => 0;
const water = (gridX, gridZ) => ({ gridX, gridZ, tileType: "water" });

// Painted water: a 5 x 5 pond. The middle floats you shoulder-deep; the bank is shallow; dry land is dry.
const pond = [];
for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) pond.push(water(x, z));
const areas = buildWaterAreas(pond);
assert.equal(swimFeetY(areas, 0, 0), SWIM_SURFACE_Y - SWIM_FLOAT_DEPTH, "the middle of a pond floats you shoulder-deep");
assert.equal(swimFeetY(areas, 30, 0), null, "dry land is dry");
const nearBank = swimFeetY(areas, 5.4, 0);
assert.ok(nearBank !== null && nearBank > SWIM_SURFACE_Y - SWIM_FLOAT_DEPTH, "near the bank it's shallower");
assert.ok(waterReach(areas, 0, 0) > waterReach(areas, 5, 0), "further in is further from the bank");
assert.ok(SWIM_SURFACE_Y - SWIM_FLOAT_DEPTH > SWIM_BED_Y, "a swimmer's feet hang above the bed");
// The ground wrapper only ever lowers you into water; land elsewhere is untouched.
const ground = withSwimming(areas, flat);
assert.equal(ground(0, 0), SWIM_SURFACE_Y - SWIM_FLOAT_DEPTH);
assert.equal(ground(40, 40), 0);
assert.equal(withSwimming(buildWaterAreas([]), flat), flat, "no water, no change");
assert.equal(swimSurfaceAt(areas, 0, 0), SWIM_SURFACE_Y, "swimming in the middle");
assert.equal(swimSurfaceAt(areas, 40, 40), null, "not swimming on land");
// A single painted square is still deep enough to swim in at its centre.
assert.ok(swimSurfaceAt(buildWaterAreas([water(10, 10)]), 20, 20) !== null, "even a one-square pond is swimmable");

// Swimming Lakes: an oval, turned with the lake.
const lake = buildWaterAreas([], [{ x: 100, z: 0, rotation: 0 }]);
assert.equal(swimFeetY(lake, 100, 0), SWIM_SURFACE_Y - SWIM_FLOAT_DEPTH, "the lake's middle floats you");
assert.ok(swimFeetY(lake, 100 + LAKE_WATER_SIZE[0] / 2 - 0.2, 0) !== null && swimFeetY(lake, 100, LAKE_WATER_SIZE[0] / 2 - 0.2) === null, "long way across x");
const turnedLake = buildWaterAreas([], [{ x: 0, z: 0, rotation: 90 }]);
assert.ok(swimFeetY(turnedLake, 0, LAKE_WATER_SIZE[0] / 2 - 0.2) !== null, "a turned lake runs along z");
const lakeItem = PREMIUM_HOME_SHOP_ITEMS.find((row) => row.item_key === premiumHomeItemKey("swimming_lake"));
const found = placedLakes([{ placementId: "a", itemId: lakeItem.item_key, gridX: 5, gridZ: 5, rotation: 0 }, { placementId: "b", itemId: "nope", gridX: 0, gridZ: 0, rotation: 0 }], new Map([[lakeItem.item_key, lakeItem]]));
assert.equal(found.length, 1, "only placed Swimming Lakes count");

// The river: shallow at the edge (wading), deep in the middle (swimming), never deeper than a float.
const z = -40, mid = hubRiverX(z);
assert.ok(hubWaterDepth(mid, z) > 0.6, "the river's middle is deep");
assert.ok(hubGroundHeight(mid, z) >= HUB_V2_WATER_Y - HUB_V2_SWIM_DEPTH - 1e-9, "you float in the river, never sink to the bed");
assert.equal(hubSwimSurfaceAt(mid, z), HUB_V2_WATER_Y, "swimming in the river's middle");
assert.equal(hubSpeedFactor(mid, z), SWIM_SPEED, "swimming is slower than walking");
assert.equal(hubSwimSurfaceAt(0, 0), null, "not swimming at the Tower");

// Shop: one lake, three upgrades, in the new Swimming tab, and the migration matches.
const rows = [...PREMIUM_HOME_SHOP_ITEMS, ...PREMIUM_HOME_UPGRADE_ITEMS].filter((row) => WATER_STYLES.includes(row.metadata.premiumHome));
assert.equal(rows.length, 4);
assert.equal(centralWorldCategory(lakeItem), "water");
assert.ok(MARKETPLACE_CATEGORIES.world.some((c) => c.id === "water" && c.label === "Swimming"));
assert.ok(existsSync(new URL(`../public/marketplace/world-renders/${PREMIUM_HOME_SPECS.swimming_lake.assetKey}.webp`, import.meta.url)), "lake shop picture");
const migration = readFileSync(new URL("../supabase/migrations/20261125120000_swimming_lake.sql", import.meta.url), "utf8");
for (const row of rows) assert.ok(migration.split("\n").some((line) => line.startsWith(`('${row.item_key}'`) && line.includes(`, ${row.price}, `)), `migration row for ${row.item_key}`);
assert.equal(migration.split("\n").filter((line) => line.startsWith("('")).length, rows.length);
assert.ok(!/delete\s+from|update\s+public|create\s+(or\s+replace\s+)?function/i.test(migration.replace(/^--.*$/gm, "")), "additive only");

// Hub wiring: the explorer swims, cars keep out, the grass leaves holes, the lake model is registered.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const hub = read("components/world3d/CentralWorld.tsx");
assert.ok(hub.includes("withSwimming(waterAreas, hubGroundHeight)") && hub.includes("swimSurfaceAt={swimmingAt}") && hub.includes("waterReach(waterAreas, x, z) === 0"), "the hub swims explorers and keeps cars out of water");
assert.ok(read("components/world3d/CentralWorldV2Scenery.tsx").includes("WATER_HOLE_FRAGMENT.body"), "the terrain leaves holes for water");
assert.ok(read("components/world3d/CentralWorldEnvironment.tsx").includes("dug={hubV2}"), "painted water is dug out in the hub");
assert.ok(read("components/world3d/premium-homes/PremiumHomeModels.tsx").includes("...WATER_LEVEL_MODELS"), "the lake model is registered");
console.log("swimming: ponds, lakes and the river all swim, shelving banks, slower swimmers, cars kept out, Swimming tab and migration check out");
