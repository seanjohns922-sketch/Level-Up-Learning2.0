import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

// City Life: eight everyday places on the premium upgrade system, unlocked with XP in the
// Marketplace's City Life category and upgraded in the world. The rows must match the migration.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const load = (path) => import(new URL(`../${path}`, import.meta.url).href);
const { CITY_LIFE_STYLES, PREMIUM_HOME_SPECS, PREMIUM_HOME_SHOP_ITEMS, PREMIUM_HOME_UPGRADE_ITEMS, premiumHomeItemKey, premiumHomeUpgradeKey, premiumHomeLevel } = await load("lib/world3d/premium-homes.ts");
const { CENTRAL_WORLD_SHOP_ROWS } = await load("lib/world3d/central-world-customisation-catalog.ts");
const { centralWorldCategory, MARKETPLACE_CATEGORIES } = await load("lib/marketplace-categories.ts");
const { itemSize } = await load("lib/world3d/walk-build.ts");
const { itemGroundSize } = await load("lib/world3d/central-world-layout.ts");

assert.deepEqual([...CITY_LIFE_STYLES], ["playground", "cricket_nets", "park_bbq", "cubby_house", "outdoor_setting", "bus_stop", "food_truck", "vending_kiosk"]);
for (const style of CITY_LIFE_STYLES) {
  const spec = PREMIUM_HOME_SPECS[style];
  assert.equal(spec.levels.length, 4, `${style} level names`);
  assert.ok(spec.prices.every((price) => Number.isInteger(price) && price > 0), `${style} prices are positive XP`);
  assert.ok(spec.prices[1] <= spec.prices[2] && spec.prices[2] <= spec.prices[3], `${style} upgrades get dearer`);
  assert.equal(spec.marketplaceCategory, "city_life");
  assert.ok(spec.metres && !spec.free && !spec.fixed, `${style} is a placed XP unlock modelled in metres`);
  assert.ok(spec.assetKey === `city_${style}`, `${style} world key`);
  assert.ok(existsSync(new URL(`../public/marketplace/world-renders/${spec.assetKey}.webp`, import.meta.url)), `${style} shop picture`);
}

// Shop rows: one unlock in the City Life tab, three upgrades sold from the world (hidden from the grid).
const rows = [...PREMIUM_HOME_SHOP_ITEMS, ...PREMIUM_HOME_UPGRADE_ITEMS].filter((row) => CITY_LIFE_STYLES.includes(row.metadata.premiumHome));
assert.equal(rows.length, 8 + 24, "8 unlocks + 8 x 3 upgrades");
for (const style of CITY_LIFE_STYLES) {
  const unlock = rows.find((row) => row.item_key === premiumHomeItemKey(style));
  assert.ok(unlock && unlock.metadata.slot === "world_plot_1" && centralWorldCategory(unlock) === "city_life", `${style} unlock is a placeable City Life item`);
  assert.ok(CENTRAL_WORLD_SHOP_ROWS.some((row) => row.item_key === unlock.item_key), `${style} is in the hub's shop rows`);
  for (const level of [2, 3, 4]) assert.ok(rows.find((row) => row.item_key === premiumHomeUpgradeKey(style, level))?.metadata.marketplaceHidden === true, `${style} level ${level} upgrade is hidden from the grid`);
}
assert.ok(MARKETPLACE_CATEGORIES.world.some((category) => category.id === "city_life" && category.label === "City Life"), "the Marketplace has a City Life tab");
assert.equal(premiumHomeLevel("bus_stop", new Set([premiumHomeUpgradeKey("bus_stop", 2), premiumHomeUpgradeKey("bus_stop", 3)])), 3, "level is the highest upgrade owned");

// The small places sit close; for the big ones the camera stands back to show all of it.
const sized = (style) => itemSize(rows.find((row) => row.item_key === premiumHomeItemKey(style)), itemGroundSize(rows.find((row) => row.item_key === premiumHomeItemKey(style))));
for (const style of ["park_bbq", "cubby_house", "outdoor_setting", "vending_kiosk"]) assert.equal(sized(style), "small", `${style} is small`);
for (const style of ["playground", "cricket_nets", "bus_stop", "food_truck"]) assert.equal(sized(style), "big", `${style} is big`);

const migration = read("supabase/migrations/20261124090000_city_life.sql");
for (const row of rows) assert.ok(migration.split("\n").some((line) => line.startsWith(`('${row.item_key}'`) && line.includes(`, ${row.price}, `)), `migration row for ${row.item_key}`);
assert.equal(migration.split("\n").filter((line) => line.startsWith("('")).length, rows.length, "the migration has exactly these rows");
assert.ok(migration.includes("on conflict (item_key) do nothing") && !/create\s+(or\s+replace\s+)?function|update\s+public|delete\s+from/i.test(migration.replace(/^--.*$/gm, "")), "additive only");

// Drawn by the premium renderer at the learner's level, and the hub lists them in My items.
const models = read("components/world3d/premium-homes/PremiumHomeModels.tsx");
assert.ok(models.includes("...CITY_LIFE_LEVEL_MODELS") && models.includes("CITY_LIFE_MODELS"), "City Life models are registered");
assert.ok(/"city_life"[^\]]*\]\.includes\(/.test(read("components/world3d/CentralWorld.tsx")), "owned City Life items appear in My items");
console.log(`PASS City Life: ${CITY_LIFE_STYLES.length} places x 4 levels, ${rows.length} shop rows match the migration, City Life tab, placing camera by size and renderer wiring in place`);
