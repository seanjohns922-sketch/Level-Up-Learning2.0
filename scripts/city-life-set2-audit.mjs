import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

// City Life, set 2: eight places unlocked with XP (City Life tab) and eight street pieces free at Level 1
// (the build picker's Street tab), all upgraded in the world through four levels. Rows must match the migration.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const load = (path) => import(new URL(`../${path}`, import.meta.url).href);
const { CITY_PLACES_STYLES, STREET_STYLES, PREMIUM_HOME_SPECS, PREMIUM_HOME_SHOP_ITEMS, PREMIUM_HOME_UPGRADE_ITEMS, premiumHomeItemKey, premiumHomeUpgradeKey, premiumHomeStyle } = await load("lib/world3d/premium-homes.ts");
const { CENTRAL_WORLD_SHOP_ROWS } = await load("lib/world3d/central-world-customisation-catalog.ts");
const { CENTRAL_WORLD_STARTER_SCENERY } = await load("lib/world3d/central-world-editor-catalog.ts");
const { centralWorldCategory } = await load("lib/marketplace-categories.ts");
const { freeBuildRender } = await load("lib/world3d/free-build-renders.ts");

assert.deepEqual([...CITY_PLACES_STYLES], ["servo", "car_wash", "pizza_shop", "supermarket", "police_station", "hospital", "vet_pet_shop", "dog_park"]);
assert.deepEqual([...STREET_STYLES], ["traffic_lights", "zebra_crossing", "wheelie_bins", "bike_rack", "hills_hoist", "water_tank", "shade_sail", "driveway_hoop"]);
for (const style of [...CITY_PLACES_STYLES, ...STREET_STYLES]) {
  const spec = PREMIUM_HOME_SPECS[style];
  assert.equal(spec.levels.length, 4, `${style} level names`);
  assert.ok(spec.metres && !spec.fixed, `${style} is placed and modelled in metres`);
  assert.ok(spec.prices.slice(1).every((price) => Number.isInteger(price) && price > 0) && spec.prices[1] <= spec.prices[2] && spec.prices[2] <= spec.prices[3], `${style} upgrades cost XP and get dearer`);
}

// Places: XP unlocks in the City Life tab, with a shop picture.
for (const style of CITY_PLACES_STYLES) {
  const spec = PREMIUM_HOME_SPECS[style];
  assert.ok(!spec.free && spec.prices[0] > 0 && spec.marketplaceCategory === "city_life" && spec.assetKey === `city_${style}`, `${style} is a City Life XP unlock`);
  assert.ok(existsSync(new URL(`../public/marketplace/world-renders/${spec.assetKey}.webp`, import.meta.url)), `${style} shop picture`);
  const unlock = PREMIUM_HOME_SHOP_ITEMS.find((row) => row.item_key === premiumHomeItemKey(style));
  assert.ok(unlock && centralWorldCategory(unlock) === "city_life" && CENTRAL_WORLD_SHOP_ROWS.some((row) => row.item_key === unlock.item_key), `${style} unlock is in the City Life shop`);
}
// Street pieces: free Level 1 in the Street tab (no unlock row), drawn as their upgradeable model, with a tray picture.
for (const style of STREET_STYLES) {
  const spec = PREMIUM_HOME_SPECS[style];
  assert.ok(spec.free && spec.prices[0] === 0 && spec.assetKey === `street_${style}`, `${style} is free at Level 1`);
  assert.ok(!PREMIUM_HOME_SHOP_ITEMS.some((row) => row.metadata.premiumHome === style), `${style} has no unlock row`);
  const free = CENTRAL_WORLD_STARTER_SCENERY.find((item) => item.metadata.worldAssetKey === spec.assetKey);
  assert.ok(free && free.price === 0 && free.metadata.worldSceneryGroup === "street" && free.metadata.gridSize === spec.gridSize, `${style} is in the Street tab on the same plot`);
  assert.equal(premiumHomeStyle(spec.assetKey), style, `${style} draws as its upgradeable model`);
  assert.ok(freeBuildRender(spec.assetKey) && existsSync(new URL(`../public${freeBuildRender(spec.assetKey)}`, import.meta.url)), `${style} tray picture`);
}

// The migration inserts exactly these rows at these prices, additively.
const rows = [...PREMIUM_HOME_SHOP_ITEMS, ...PREMIUM_HOME_UPGRADE_ITEMS].filter((row) => [...CITY_PLACES_STYLES, ...STREET_STYLES].includes(row.metadata.premiumHome));
assert.equal(rows.length, 8 + 8 * 3 + 8 * 3, "8 unlocks + 24 place upgrades + 24 street upgrades");
for (const style of [...CITY_PLACES_STYLES, ...STREET_STYLES]) for (const level of [2, 3, 4]) assert.ok(rows.find((row) => row.item_key === premiumHomeUpgradeKey(style, level))?.metadata.marketplaceHidden === true, `${style} level ${level} upgrade is hidden from the grid`);
const migration = read("supabase/migrations/20261128090000_city_life_set_2.sql");
for (const row of rows) assert.ok(migration.split("\n").some((line) => line.startsWith(`('${row.item_key}'`) && line.includes(`, ${row.price}, `)), `migration row for ${row.item_key}`);
assert.equal(migration.split("\n").filter((line) => line.startsWith("('")).length, rows.length, "the migration has exactly these rows");
assert.ok(migration.includes("on conflict (item_key) do nothing") && !/create\s+(or\s+replace\s+)?function|update\s+public|delete\s+from/i.test(migration.replace(/^--.*$/gm, "")), "additive only");

// Registered with the premium renderer, and the picker has a Street tab.
const models = read("components/world3d/premium-homes/PremiumHomeModels.tsx");
assert.ok(models.includes("...CITY_PLACES_LEVEL_MODELS") && models.includes("...STREET_LEVEL_MODELS"), "set 2 models are registered");
assert.ok(read("components/world3d/CentralWorld.tsx").includes('{ key: "street", label: "Street"'), "the build picker has a Street tab");
console.log(`PASS City Life set 2: ${CITY_PLACES_STYLES.length} places to unlock + ${STREET_STYLES.length} free street pieces, 4 levels each, ${rows.length} rows match the migration, shop and tray pictures, Street tab and renderer wiring in place`);
