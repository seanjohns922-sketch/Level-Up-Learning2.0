import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

// Main Street: six town buildings on the premium upgrade system, unlocked with XP in the
// Marketplace's Main Street category and upgraded in the world. The rows must match the migration.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const load = (path) => import(new URL(`../${path}`, import.meta.url).href);
const { MAIN_STREET_STYLES, PREMIUM_HOME_SPECS, PREMIUM_HOME_SHOP_ITEMS, PREMIUM_HOME_UPGRADE_ITEMS, premiumHomeItemKey, premiumHomeUpgradeKey, premiumHomeLevel } = await load("lib/world3d/premium-homes.ts");
const { CENTRAL_WORLD_SHOP_ROWS } = await load("lib/world3d/central-world-customisation-catalog.ts");
const { centralWorldCategory, MARKETPLACE_CATEGORIES } = await load("lib/marketplace-categories.ts");
const { itemSize } = await load("lib/world3d/walk-build.ts");
const { itemGroundSize } = await load("lib/world3d/central-world-layout.ts");

assert.deepEqual([...MAIN_STREET_STYLES], ["corner_shop", "cafe", "library", "town_hall", "school", "fire_station"]);
for (const style of MAIN_STREET_STYLES) {
  const spec = PREMIUM_HOME_SPECS[style];
  assert.equal(spec.levels.length, 4, `${style} level names`);
  assert.ok(spec.prices.every((price) => Number.isInteger(price) && price > 0), `${style} prices are positive XP`);
  assert.ok(spec.prices[1] <= spec.prices[2] && spec.prices[2] <= spec.prices[3], `${style} upgrades get dearer`);
  assert.equal(spec.marketplaceCategory, "main_street");
  assert.ok(spec.metres && !spec.free && !spec.fixed, `${style} is a placed XP unlock modelled in metres`);
  assert.ok(spec.assetKey === `main_${style}`, `${style} world key`);
  assert.ok(existsSync(new URL(`../public/marketplace/world-renders/${spec.assetKey}.webp`, import.meta.url)), `${style} shop picture`);
}

// Shop rows: one unlock in the Main Street tab, three upgrades sold from the world (hidden from the grid).
const rows = [...PREMIUM_HOME_SHOP_ITEMS, ...PREMIUM_HOME_UPGRADE_ITEMS].filter((row) => MAIN_STREET_STYLES.includes(row.metadata.premiumHome));
assert.equal(rows.length, 6 + 18, "6 unlocks + 6 x 3 upgrades");
for (const style of MAIN_STREET_STYLES) {
  const unlock = rows.find((row) => row.item_key === premiumHomeItemKey(style));
  assert.ok(unlock && unlock.metadata.slot === "world_plot_1" && centralWorldCategory(unlock) === "main_street", `${style} unlock is a placeable Main Street building`);
  assert.ok(CENTRAL_WORLD_SHOP_ROWS.some((row) => row.item_key === unlock.item_key), `${style} is in the hub's shop rows`);
  for (const level of [2, 3, 4]) assert.ok(rows.find((row) => row.item_key === premiumHomeUpgradeKey(style, level))?.metadata.marketplaceHidden === true, `${style} level ${level} upgrade is hidden from the grid`);
}
assert.ok(MARKETPLACE_CATEGORIES.world.some((category) => category.id === "main_street" && category.label === "Main Street"), "the Marketplace has a Main Street tab");
assert.equal(premiumHomeLevel("school", new Set([premiumHomeUpgradeKey("school", 2), premiumHomeUpgradeKey("school", 3)])), 3, "level is the highest upgrade owned");

// Every town building is big, so it starts in the planner.
const sized = (style) => itemSize(rows.find((row) => row.item_key === premiumHomeItemKey(style)), itemGroundSize(rows.find((row) => row.item_key === premiumHomeItemKey(style))));
for (const style of MAIN_STREET_STYLES) assert.equal(sized(style), "big", `${style} opens the planner`);

const migration = read("supabase/migrations/20261124180000_main_street.sql");
for (const row of rows) assert.ok(migration.split("\n").some((line) => line.startsWith(`('${row.item_key}'`) && line.includes(`, ${row.price}, `)), `migration row for ${row.item_key}`);
assert.equal(migration.split("\n").filter((line) => line.startsWith("('")).length, rows.length, "the migration has exactly these rows");
assert.ok(migration.includes("on conflict (item_key) do nothing") && !/create\s+(or\s+replace\s+)?function|update\s+public|delete\s+from/i.test(migration.replace(/^--.*$/gm, "")), "additive only");

// Drawn by the premium renderer at the learner's level, and the hub lists them in My items.
const models = read("components/world3d/premium-homes/PremiumHomeModels.tsx");
assert.ok(models.includes("...MAIN_STREET_LEVEL_MODELS") && models.includes("MAIN_STREET_MODELS"), "Main Street models are registered");
assert.ok(/"main_street"[^\]]*\]\.includes\(/.test(read("components/world3d/CentralWorld.tsx")), "owned Main Street buildings appear in My items");
console.log(`PASS Main Street: ${MAIN_STREET_STYLES.length} buildings x 4 levels, ${rows.length} shop rows match the migration, Main Street tab, planner placing and renderer wiring in place`);
