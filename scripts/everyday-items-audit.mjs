import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

// Everyday items: lamp post, bench, fence, mailbox and campfire, free at Level 1 and upgraded with XP.
// They keep their original world keys, so items already placed upgrade in place.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const load = (path) => import(new URL(`../${path}`, import.meta.url).href);
const { EVERYDAY_STYLES, PREMIUM_HOME_SPECS, PREMIUM_HOME_SHOP_ITEMS, PREMIUM_HOME_UPGRADE_ITEMS, premiumHomeStyle } = await load("lib/world3d/premium-homes.ts");
const { CENTRAL_WORLD_STARTER_SCENERY } = await load("lib/world3d/central-world-editor-catalog.ts");
const { WORLD_ITEM_PRESENTATION } = await load("lib/world3d/world-item-presentation.ts");

assert.deepEqual([...EVERYDAY_STYLES], ["lamp_post", "bench", "fence", "mailbox", "campfire"]);
for (const style of EVERYDAY_STYLES) {
  const spec = PREMIUM_HOME_SPECS[style];
  assert.equal(spec.assetKey, style, `${style} keeps its original world key`);
  assert.ok(spec.free && spec.metres && spec.prices[0] === 0 && spec.prices.slice(1).every((price) => price > 0), `${style}: free Level 1, XP upgrades`);
  assert.equal(premiumHomeStyle(style), style);
  assert.ok(CENTRAL_WORLD_STARTER_SCENERY.some((item) => item.metadata.worldAssetKey === style && item.metadata.worldSceneryGroup === "furniture_fun"), `${style} is in the Décor tab`);
  assert.equal(WORLD_ITEM_PRESENTATION[style].sizing, "fixed", `${style} is sized by its own model`);
  assert.ok(existsSync(new URL(`../public/marketplace/world-renders/free/${style}.webp`, import.meta.url)), `${style} tray picture`);
}
const rows = [...PREMIUM_HOME_SHOP_ITEMS, ...PREMIUM_HOME_UPGRADE_ITEMS].filter((row) => EVERYDAY_STYLES.includes(row.metadata.premiumHome));
assert.equal(rows.length, 15, "upgrades only: 5 items x 3");
const migration = read("supabase/migrations/20261121180000_everyday_items.sql");
for (const row of rows) assert.ok(migration.split("\n").some((line) => line.startsWith(`('${row.item_key}'`) && line.includes(`, ${row.price}, `)), `migration row for ${row.item_key}`);
assert.ok(migration.includes("on conflict (item_key) do nothing"));

// The old procedural lamp, bench, fence and mailbox are gone; the fence still joins up.
const env = read("components/world3d/CentralWorldEnvironment.tsx");
for (const key of ["lamp_post", "bench", "fence", "mailbox"]) assert.ok(!env.includes(`if (assetKey === "${key}") return`), `old ${key} model removed`);
assert.ok(read("components/world3d/ConnectedBoundary.tsx").includes('if(assetKey==="fence")return') && read("lib/world3d/world-connections.ts").includes('"fence"'));
assert.ok(read("components/world3d/premium-items/EverydayItems.tsx").includes("if (!night) return null;"), "lamp light pools only show after dark");
console.log(`PASS everyday items: ${EVERYDAY_STYLES.length} items free at Level 1 with ${rows.length} XP upgrades, upgraded in place, fence joins up`);
