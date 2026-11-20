import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Kart garage: realm karts need a finished level in that realm (checked by the server), parts fit
// any kart, the kart in use comes from equipped slots, and the shop rows match the migration.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const {
  KART_GARAGE_SHOP_ITEMS, KART_PART_SLOTS, KART_PARTS, KART_REALMS, KART_SLOT,
  kartAvailability, kartItemKey, kartPartItemKey, kartSetup,
} = await import(new URL("../lib/world3d/kart-garage.ts", import.meta.url).href);

// Every realm has a kart; every kart needs a finished level in its own realm; parts fill all three slots.
assert.deepEqual([...KART_REALMS], ["number", "measurement", "space", "statistics", "pattern", "chance"]);
for (const realm of KART_REALMS) {
  const row = KART_GARAGE_SHOP_ITEMS.find((item) => item.item_key === kartItemKey(realm));
  assert.equal(row?.metadata.requiresFinishedLevelIn, realm, `${realm} kart needs a finished level there`);
  assert.equal(row?.metadata.slot, KART_SLOT);
}
assert.deepEqual(new Set(KART_PARTS.map((part) => part.group)), new Set(["spoiler", "wheels", "trail"]));
assert.ok(KART_GARAGE_SHOP_ITEMS.every((item) => item.metadata.marketplaceHidden === true && item.price > 0), "garage items are bought in the garage, with XP");

// What the learner drives: the Starter Kart until they own and pick another; unowned picks fall back.
const owned = new Set([kartItemKey("space"), kartPartItemKey(KART_PARTS[0]), kartPartItemKey(KART_PARTS[4])]);
assert.deepEqual(kartSetup({}, owned), { style: "starter", parts: {} });
assert.deepEqual(kartSetup({ [KART_SLOT]: kartItemKey("space"), [KART_PART_SLOTS.spoiler]: kartPartItemKey(KART_PARTS[0]), [KART_PART_SLOTS.wheels]: kartPartItemKey(KART_PARTS[4]) }, owned), { style: "space", parts: { spoiler: "wing", wheels: "neon" } });
assert.deepEqual(kartSetup({ [KART_SLOT]: kartItemKey("chance"), [KART_PART_SLOTS.trail]: kartPartItemKey(KART_PARTS[5]) }, owned), { style: "starter", parts: {} }, "unowned picks never show");

// Garage cards: locked until a level is finished, then buyable, then owned, then driving.
assert.equal(kartAvailability("pattern", "starter", new Set(), new Set()), "locked");
assert.equal(kartAvailability("pattern", "starter", new Set(), new Set(["pattern"])), "buy");
assert.equal(kartAvailability("pattern", "starter", new Set([kartItemKey("pattern")]), new Set()), "owned");
assert.equal(kartAvailability("pattern", "pattern", new Set([kartItemKey("pattern")]), new Set()), "driving");

// The migration: the shop rows, the four equip slots, and the server-side realm check.
const migration = read("supabase/migrations/20261121090000_kart_garage.sql");
for (const row of KART_GARAGE_SHOP_ITEMS) assert.ok(migration.split("\n").some((line) => line.startsWith(`('${row.item_key}'`) && line.includes(`, ${row.price}, `)), `migration row for ${row.item_key}`);
assert.equal(migration.match(/'kart', 'kart_spoiler', 'kart_wheels', 'kart_trail'/g)?.length, 2, "slot check and equip function both allow the kart slots");
assert.ok(migration.includes("required_realm := target.metadata->>'requiresFinishedLevelIn';") && migration.includes("posttest_completed_at is not null") && migration.includes("raise exception 'Finish a level in this realm first'"), "the server must check the realm before selling a kart");
assert.ok(migration.includes("perform public.assert_student_access(p_student_id);") && migration.includes("function public.get_student_finished_realms_secure"));
assert.ok(read("lib/economy.ts").includes("/finish a level/i.test(message)"), "the locked-kart error must read kindly");

// Hub wiring: the race offers the garage, the kart drives what is equipped, the live shop waits for the rows.
const world = read("components/world3d/CentralWorld.tsx");
assert.ok(world.includes("onGarage={openGarage}") && world.includes("<KartGarage style={kart.style}") && world.includes("kart={kart} racePaused={garageOpen}"), "the race must open the garage and drive the chosen kart");
assert.ok(world.includes("setEquipped(merged.equipped);"), "the hub must load equipped kart slots");
assert.ok(read("lib/world3d/central-world-customisation-catalog.ts").includes("KART_GARAGE_ITEM_KEYS.has(item.item_key)"), "the live shop must wait for the database rows");
assert.ok(read("lib/world3d/kart-garage-client.ts").includes("if (demo) return new Set(KART_REALMS);"), "demo mode has every kart");

console.log(`PASS kart garage: ${KART_REALMS.length} realm karts locked to a finished level, ${KART_PARTS.length} parts, equipped slots, migration and hub wiring`);
