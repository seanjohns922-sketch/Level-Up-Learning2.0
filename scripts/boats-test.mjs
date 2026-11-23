// Boats: four to collect and ride on any water. They float only where it's deep enough, launch pointing
// out into the water, land you on the nearest bank, and their shop rows match the migration.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { BOAT_SHOP_ITEMS, BOAT_SPECS, BOAT_STYLES, boatItemKey, boatToRide, boatWaterAt, nearestBank, openWaterHeading, ownedBoats } from "../lib/world3d/boats.ts";
import { buildWaterAreas, SWIM_SURFACE_Y } from "../lib/world3d/swimming.ts";
import { centralWorldCategory, MARKETPLACE_CATEGORIES } from "../lib/marketplace-categories.ts";
import { CENTRAL_WORLD_SHOP_ROWS } from "../lib/world3d/central-world-customisation-catalog.ts";

// Choosing a boat.
const owned = new Set([boatItemKey("tinny"), boatItemKey("speedboat")]);
assert.deepEqual(ownedBoats(owned), ["tinny", "speedboat"]);
assert.equal(boatToRide(null, owned), "tinny", "the first owned boat");
assert.equal(boatToRide("speedboat", owned), "speedboat", "the one you picked");
assert.equal(boatToRide("kayak", owned), "tinny", "a boat you don't own falls back");
assert.equal(boatToRide(null, new Set()), null);
for (const style of BOAT_STYLES) assert.equal(BOAT_SPECS[style].handling.top, BOAT_SPECS[style].handling.offRoad, `${style}: no off-road on water`);
assert.ok(BOAT_SPECS.speedboat.handling.top > BOAT_SPECS.tinny.handling.top && BOAT_SPECS.tinny.handling.top > BOAT_SPECS.kayak.handling.top, "speedboat fastest, kayak slowest");

// Where a boat floats: a lake's middle yes, its very edge and dry land no; the river where it's deep.
const lake = buildWaterAreas([], [{ x: 0, z: 0, rotation: 0 }]);
assert.equal(boatWaterAt(lake, null, 0, 0), SWIM_SURFACE_Y);
assert.equal(boatWaterAt(lake, null, 7.3, 0), null, "too near the bank");
assert.equal(boatWaterAt(lake, null, 30, 0), null, "dry land");
const river = { surfaceY: -0.9, depthAt: (x) => (x > 100 ? 1.5 : 0) };
assert.equal(boatWaterAt(lake, river, 120, 0), -0.9, "the river floats boats");

// Launching points out across the water; getting out lands on dry ground.
const inLake = (x, z) => boatWaterAt(lake, null, x, z) !== null;
const heading = openWaterHeading(inLake, 5, 0, 0);
assert.ok(Math.sin(heading) < -0.5, "from the east edge, a boat points west across the lake");
const bank = nearestBank((x, z) => !inLake(x, z) && Math.hypot(x / 7.5, z / 5) > 1, 0, 0);
assert.ok(bank && Math.hypot(bank.x / 7.5, bank.z / 5) > 1, "the explorer lands outside the water");

// Shop: four boats in the Swimming & boats tab, never placed, pictured, and the migration matches.
assert.ok(MARKETPLACE_CATEGORIES.world.some((c) => c.id === "water" && c.label === "Swimming & boats"));
for (const row of BOAT_SHOP_ITEMS) {
  assert.equal(centralWorldCategory(row), "water");
  assert.ok(existsSync(new URL(`../public/marketplace/world-renders/boat_${row.metadata.boatStyle}.webp`, import.meta.url)), `${row.name} picture`);
  assert.ok(CENTRAL_WORLD_SHOP_ROWS.some((r) => r.item_key === row.item_key), `${row.name} is sold in the hub`);
}
const migration = readFileSync(new URL("../supabase/migrations/20261125190000_boats.sql", import.meta.url), "utf8");
for (const row of BOAT_SHOP_ITEMS) assert.ok(migration.split("\n").some((line) => line.startsWith(`('${row.item_key}'`) && line.includes(`, ${row.price}, `)), `migration row for ${row.item_key}`);
assert.equal(migration.split("\n").filter((line) => line.startsWith("('")).length, BOAT_SHOP_ITEMS.length);
assert.ok(!/delete\s+from|update\s+public|create\s+(or\s+replace\s+)?function/i.test(migration.replace(/^--.*$/gm, "")), "additive only");

// Hub wiring: BOAT on the water, a rider, EXIT BOAT to the bank, and boats kept out of the build tray.
const hub = readFileSync(new URL("../components/world3d/CentralWorld.tsx", import.meta.url), "utf8");
assert.ok(hub.includes('{ label: "BOAT", icon: "car", onClick: runActiveAction }') && hub.includes("<BoatRider ") && hub.includes('exitLabel="EXIT BOAT"') && hub.includes("nearestBank(dry, x, z)"), "the hub launches, rides and lands boats");
assert.ok(hub.includes("!item.metadata.boatStyle"), "boats are ridden, not placed");
console.log("boats: choosing, floating, launching, landing, shop rows and hub wiring all check out");
