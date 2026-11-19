import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

// Premium homes: four styles, four levels. Unlocking and upgrading are XP purchases,
// so the catalogue, the migration rows and the world renderer must all agree.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const homes = await import(new URL("../lib/world3d/premium-homes.ts", import.meta.url).href);
const { PREMIUM_HOME_STYLES, PREMIUM_HOME_SPECS, PREMIUM_HOME_SHOP_ITEMS, PREMIUM_HOME_UPGRADE_ITEMS, premiumHomeLevel, premiumHomeUpgradeKey, premiumHomeItemKey, nextPremiumHomeUpgrade } = homes;

assert.deepEqual([...PREMIUM_HOME_STYLES], ["cottage", "modern", "treehouse", "apartment"]);
for (const style of PREMIUM_HOME_STYLES) {
  const spec = PREMIUM_HOME_SPECS[style];
  assert.equal(spec.levels.length, 4, `${style} needs four level names`);
  assert.ok(spec.prices.every((price) => Number.isInteger(price) && price > 0), `${style} prices must be positive XP`);
  assert.ok(existsSync(new URL(`../public/marketplace/world-renders/home_${style}.webp`, import.meta.url)), `${style} needs its shop render`);
}
const rows = [...PREMIUM_HOME_SHOP_ITEMS, ...PREMIUM_HOME_UPGRADE_ITEMS];
assert.equal(rows.length, 16, "4 unlocks + 12 upgrades");
assert.equal(new Set(rows.map((row) => row.item_key)).size, 16, "item keys must be unique");
assert.ok(PREMIUM_HOME_UPGRADE_ITEMS.every((row) => row.metadata.marketplaceHidden === true), "upgrades are sold from the home, not the Marketplace grid");
assert.ok(PREMIUM_HOME_SHOP_ITEMS.every((row) => row.metadata.marketplaceCategory === "buildings" && row.metadata.slot === "world_plot_1"), "unlocks are world buildings");

// Level = highest upgrade owned; the next upgrade follows in order and stops at Legendary.
assert.equal(premiumHomeLevel("modern", new Set()), 1);
assert.equal(premiumHomeLevel("modern", new Set([premiumHomeUpgradeKey("modern", 2), premiumHomeUpgradeKey("modern", 3)])), 3);
assert.equal(premiumHomeLevel("modern", new Set([premiumHomeUpgradeKey("cottage", 4)])), 1, "levels never leak between styles");
assert.equal(nextPremiumHomeUpgrade("apartment", new Set([premiumHomeItemKey("apartment")]))?.level, 2);
assert.equal(nextPremiumHomeUpgrade("apartment", new Set([2, 3, 4].map((level) => premiumHomeUpgradeKey("apartment", level)))), null);

// The migration must insert exactly these rows at these prices.
const migration = read("supabase/migrations/20261120090000_premium_homes.sql");
for (const row of rows) {
  const line = migration.split("\n").find((entry) => entry.startsWith(`('${row.item_key}'`));
  assert.ok(line, `migration is missing ${row.item_key}`);
  assert.ok(line.includes(`, ${row.price}, `), `${row.item_key} price differs from the catalogue`);
}
assert.ok(migration.includes("on conflict (item_key) do nothing"), "the migration must be additive");

// Wiring: renderer, sizing, catalogue, Marketplace, demo ownership and the upgrade button.
assert.ok(read("components/world3d/CentralWorldEnvironment.tsx").includes("<PlacedPremiumHome style={homeStyle} />"), "the world must draw premium homes");
assert.ok(read("lib/world3d/world-item-presentation.ts").includes("premiumHomeAssetKey(style)"), "premium homes need fixed sizing so upgrades grow in place");
assert.ok(read("lib/world3d/central-world-customisation-catalog.ts").includes("PREMIUM_HOME_ITEM_KEYS.has(item.item_key)"), "the live shop must wait for the database rows");
assert.ok(read("lib/marketplace-visuals.ts").includes("marketplaceHidden === true"), "the Marketplace must hide upgrade rows");
assert.ok(read("lib/economy.ts").includes('typeof metadata.premiumHome === "string"'), "demo upgrades must be bought, not given");
const world = read("components/world3d/CentralWorld.tsx");
assert.ok(world.includes("<PremiumHomeWorldContext.Provider value={homeWorld}>") && world.includes("<PremiumHomeUpgradeRows"), "the hub must pass home levels and offer the upgrade");

console.log(`PASS premium homes: ${PREMIUM_HOME_STYLES.length} styles x 4 levels, ${rows.length} shop rows match the migration, world wiring in place`);
