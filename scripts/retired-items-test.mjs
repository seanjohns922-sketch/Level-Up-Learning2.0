// Retired from sale: the old-look buildings, landmarks and pools stop selling (owners keep and can still
// place them), the animals stay on sale, and the migration turns off exactly these rows.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CENTRAL_WORLD_CUSTOMISATION_CATALOG as catalogue, RETIRED_FROM_SALE } from "../lib/world3d/central-world-customisation-catalog.ts";
import { isMarketplaceItemListed } from "../lib/marketplace-visuals.ts";

const retired = catalogue.filter((item) => RETIRED_FROM_SALE.has(String(item.metadata.worldAssetKey)));
assert.ok(retired.length >= 31, "the old-look items are on the retired list");
for (const item of retired) {
  assert.equal(item.purchasable, false, `${item.name} is no longer sold`);
  assert.equal(isMarketplaceItemListed(item), false, `${item.name} is gone from the Marketplace`);
}
// Animals stay on sale.
for (const item of catalogue.filter((i) => i.metadata.marketplaceCategory === "animals")) assert.equal(item.purchasable, true, `${item.name} (an animal) is still sold`);
// Every new premium set is still sold.
for (const category of ["city_life", "defence"]) assert.ok(catalogue.some((i) => i.metadata.marketplaceCategory === category && i.purchasable), `${category} still sold`);
assert.ok(catalogue.some((i) => i.metadata.worldAssetKey === "home_cottage" && i.purchasable), "premium homes still sold");

// The migration turns off exactly the newly retired rows and nothing else.
const migration = readFileSync(new URL("../supabase/migrations/20261124150000_retire_old_look_items.sql", import.meta.url), "utf8");
const listed = [...migration.matchAll(/^  '([a-z0-9_]+)'/gm)].map((m) => m[1]);
const alreadyRetired = /^central_world_plot_\d+_(trampoline_park|village_(cottage|family_house|townhouse|manor|apartments))$/;
assert.deepEqual(new Set(listed), new Set(retired.map((i) => i.item_key).filter((k) => !alreadyRetired.test(k))), "migration lists exactly the newly retired items");
assert.ok(/set purchasable = false/.test(migration) && !/delete\s+from|insert\s+into|create\s+(or\s+replace\s+)?function/i.test(migration.replace(/^--.*$/gm, "")), "only switches selling off");
console.log(`retired items: ${retired.length} old-look items off sale, animals still sold, migration matches`);
