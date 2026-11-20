import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

// Protect the Tower: nine security items on the premium upgrade system. Three are free at Level 1
// (they replaced the castle pieces, which saved worlds convert), five are XP unlocks, and the Tower
// Shield stands round the Tower. Fences block the explorer; the rows match the migration.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const load = (path) => import(new URL(`../${path}`, import.meta.url).href);
const { DEFENCE_STYLES, PREMIUM_HOME_SPECS, PREMIUM_HOME_SHOP_ITEMS, PREMIUM_HOME_UPGRADE_ITEMS, premiumHomeItemKey, premiumHomeUpgradeKey, premiumHomeLevel } = await load("lib/world3d/premium-homes.ts");
const { retireCastlePieces } = await load("lib/world3d/central-world-layout.ts");
const { CENTRAL_WORLD_STARTER_SCENERY, DEFENCE_STARTER_KEYS } = await load("lib/world3d/central-world-editor-catalog.ts");
const { CENTRAL_WORLD_CUSTOMISATION_CATALOG, CENTRAL_WORLD_SHOP_ROWS } = await load("lib/world3d/central-world-customisation-catalog.ts");
const { laserFenceBeams, laserFenceHit, insideTripWire } = await load("lib/world3d/tower-defence.ts");

assert.deepEqual([...DEFENCE_STYLES], ["laser_fence", "laser_gate", "scanner", "trip_wire", "drone_pad", "guard_dog", "patrol_drone", "sentry_bot", "tower_shield"]);
const free = DEFENCE_STYLES.filter((style) => PREMIUM_HOME_SPECS[style].free), fixed = DEFENCE_STYLES.filter((style) => PREMIUM_HOME_SPECS[style].fixed);
assert.deepEqual(free, ["laser_fence", "laser_gate", "scanner"], "the three castle replacements are free at Level 1");
assert.deepEqual(fixed, ["tower_shield"], "only the Tower Shield is never placed");
for (const style of DEFENCE_STYLES) {
  const spec = PREMIUM_HOME_SPECS[style];
  assert.equal(spec.levels.length, 4);
  assert.ok(spec.prices.slice(1).every((price) => price > 0) && (spec.free ? spec.prices[0] === 0 : spec.prices[0] > 0), `${style} prices`);
  assert.equal(spec.marketplaceCategory, "defence");
  if (!spec.free) assert.ok(existsSync(new URL(`../public/marketplace/world-renders/${spec.assetKey}.webp`, import.meta.url)), `${style} shop picture`);
}

// Shop rows: no unlock for free styles; the Tower Shield is sold but not a placeable world item.
const rows = [...PREMIUM_HOME_SHOP_ITEMS, ...PREMIUM_HOME_UPGRADE_ITEMS].filter((row) => DEFENCE_STYLES.includes(row.metadata.premiumHome));
assert.equal(rows.length, 6 + 27, "6 unlocks + 9 x 3 upgrades");
for (const style of free) assert.ok(!rows.some((row) => row.item_key === premiumHomeItemKey(style)), `${style} has no unlock row`);
const shield = rows.find((row) => row.item_key === premiumHomeItemKey("tower_shield"));
assert.ok(shield && shield.metadata.premiumFixed === true && !shield.metadata.worldAssetKey && !shield.metadata.slot, "the shield row carries no plot");
assert.ok(!CENTRAL_WORLD_CUSTOMISATION_CATALOG.some((item) => item.item_key === shield.item_key) && CENTRAL_WORLD_SHOP_ROWS.some((item) => item.item_key === shield.item_key));
assert.equal(premiumHomeLevel("scanner", new Set([premiumHomeUpgradeKey("scanner", 2)])), 2, "free styles still level up from their upgrades");
const migration = read("supabase/migrations/20261121120000_protect_the_tower.sql");
for (const row of rows) assert.ok(migration.split("\n").some((line) => line.startsWith(`('${row.item_key}'`) && line.includes(`, ${row.price}, `)), `migration row for ${row.item_key}`);
assert.ok(migration.includes("on conflict (item_key) do nothing") && !/create\s+(or\s+replace\s+)?function|update\s+public|delete\s+from/i.test(migration.replace(/^--.*$/gm, "")), "additive only");

// The castle pieces are gone from the editor; saved worlds swap them for their tech replacements.
const keys = new Set(CENTRAL_WORLD_STARTER_SCENERY.map((item) => item.item_key));
for (const old of ["wall", "corner", "gatehouse", "turret", "keep", "banner", "drawbridge"]) assert.ok(!keys.has(`central_world_starter_${old}`), `${old} retired from the editor`);
for (const key of Object.values(DEFENCE_STARTER_KEYS)) assert.ok(keys.has(key) && CENTRAL_WORLD_STARTER_SCENERY.find((item) => item.item_key === key).metadata.worldSceneryGroup === "fortress", `${key} in the Defence tab`);
const saved = [
  { placementId: "a", itemId: "central_world_starter_wall", gridX: 1, gridZ: 2, rotation: 90, tint: "#999" },
  { placementId: "b", itemId: "central_world_starter_drawbridge", gridX: 4, gridZ: 2, rotation: 0, state: "up" },
  { placementId: "c", itemId: "central_world_starter_keep", gridX: 8, gridZ: 2, rotation: 180 },
  { placementId: "d", itemId: "central_world_starter_tree", gridX: 9, gridZ: 9, rotation: 0, tint: "#0f0" },
];
assert.deepEqual(retireCastlePieces(saved), [
  { placementId: "a", itemId: DEFENCE_STARTER_KEYS.laser_fence, gridX: 1, gridZ: 2, rotation: 90 },
  { placementId: "b", itemId: DEFENCE_STARTER_KEYS.laser_gate, gridX: 4, gridZ: 2, rotation: 0 },
  { placementId: "c", itemId: DEFENCE_STARTER_KEYS.scanner, gridX: 8, gridZ: 2, rotation: 180 },
  saved[3],
], "castle pieces swap in place; other items are untouched");
assert.ok(read("lib/world3d/central-world-layout.ts").includes("return normaliseHomes(retireCastlePieces(parsed"), "every saved world is converted as it loads");

// Laser fences block the explorer along their beams, not beside them; trip wires catch inside their box.
const row = [-2, -1, 0, 1, 2].map((x) => ({ placementId: `f${x}`, itemId: "fence", gridX: x, gridZ: 5, rotation: 0 }));
const beams = laserFenceBeams(row);
assert.ok(laserFenceHit(1.3, 10.2, beams), "walking into the fence line is blocked");
assert.equal(laserFenceHit(1.3, 11.2, beams), null, "a step back is free");
assert.equal(laserFenceHit(7, 10, beams), null, "past the end is free");
assert.ok(insideTripWire(0.5, 0.2, false) && !insideTripWire(0.5, 1, false) && insideTripWire(0.5, 1, true));

// Hub wiring: free pieces render as set pieces, fences join up, the shield stands at the Tower, fences block.
const env = read("components/world3d/CentralWorldEnvironment.tsx"), world = read("components/world3d/CentralWorld.tsx");
assert.ok(env.includes("if (defence) return <PlacedPremiumHome style={defence} />;") && env.includes("<TowerShieldAtTower position={CENTRAL_WORLD_CONFIG.towerPosition} />"));
assert.ok(read("lib/world3d/world-connections.ts").includes('"defence_laser_fence"') && read("components/world3d/ConnectedBoundary.tsx").includes("<LaserFenceRun"));
assert.ok(world.includes("canStandAt={canStandAt}") && world.includes("<ExplorerPositionContext.Provider value={avatarPosRef}>") && world.includes('towerShield: ownedItemKeys.has(premiumHomeItemKey("tower_shield"))'));
assert.ok(world.includes('{ key: "fortress", label: "Defence", Icon: Shield }'));
assert.ok(read("lib/audio/defence-sfx.ts").includes("if (typeof window === \"undefined\" || !streakSoundsEnabled()) return null;"), "defence sounds stay off unless sounds are turned on");
for (const key of Object.keys(DEFENCE_STARTER_KEYS)) assert.ok(existsSync(new URL(`../public/marketplace/world-renders/free/${PREMIUM_HOME_SPECS[key].assetKey}.webp`, import.meta.url)), `${key} tray picture`);

console.log(`PASS Protect the Tower: ${DEFENCE_STYLES.length} items (3 free, 5 unlocks, Tower Shield), ${rows.length} shop rows match the migration, castle pieces convert, fences block, hub wiring in place`);
