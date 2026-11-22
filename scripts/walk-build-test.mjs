// Walk-and-place building: items go on the square in front of the explorer, big
// things start in the planner, and the hotbar keeps pins, then recent picks, then starters.
import assert from "node:assert/strict";
import {
  footCell, frontCell, HOTBAR_SLOTS, HOTBAR_STARTERS, hotbarSlots, hotbarTool, hotbarToolOf, itemSize,
  rememberHotbarEntry, standBehind, togglePin,
} from "../lib/world3d/walk-build.ts";
import { CENTRAL_WORLD_STARTER_SCENERY } from "../lib/world3d/central-world-editor-catalog.ts";
import { itemGroundSize } from "../lib/world3d/central-world-layout.ts";

const CELL = 2;
const facingNorth = Math.PI; // rotation π faces -z, towards the Tower

// A one-square item lands two squares ahead (clear of the explorer's body), in each direction faced.
assert.deepEqual(frontCell(0, 18, facingNorth, [1, 1], CELL), { gridX: 0, gridZ: 7 });
assert.deepEqual(frontCell(0, 18, 0, [1, 1], CELL), { gridX: 0, gridZ: 11 });
assert.deepEqual(frontCell(0, 18, Math.PI / 2, [1, 1], CELL), { gridX: 2, gridZ: 9 });
// A 9 × 9 court is pushed out so its near edge is a square or two away, not under the explorer.
const court = frontCell(0, 18, facingNorth, [9, 9], CELL);
assert.equal(court.gridX, 0);
assert.ok(court.gridZ + 4 < 9 - 1, `court centre ${court.gridZ} must leave a clear square`);
assert.ok(court.gridZ + 4 >= 9 - 3, `court centre ${court.gridZ} must stay close`);
// Standing behind a held item puts it back in front.
for (const size of [[1, 1], [3, 2], [9, 9]]) {
  const [x, z] = standBehind(4, -6, size, CELL);
  assert.deepEqual(frontCell(x, z, facingNorth, size, CELL), { gridX: 4, gridZ: -6 }, `round trip ${size}`);
}
assert.deepEqual(footCell(3.1, -4.9, CELL), { gridX: 2, gridZ: -2 });

// Small scenery walks; the Tower's defences (bar the laser fence) and anything over 3 × 3 plan.
const scenery = (key) => CENTRAL_WORLD_STARTER_SCENERY.find((item) => item.metadata.worldAssetKey === key);
const sizeOf = (item) => itemSize(item, itemGroundSize(item));
for (const key of ["lamp_post", "fence", "bench", "tree", "gum_tree", "koala", "boulder", "defence_laser_fence"]) assert.equal(sizeOf(scenery(key)), "small", key);
for (const key of ["defence_scanner", "defence_laser_gate", "pond", "gazebo", "skate_bowl"]) assert.equal(sizeOf(scenery(key)), "big", key);
const fake = (metadata) => ({ item_key: "x", metadata });
assert.equal(itemSize(fake({ marketplaceCategory: "world_basic" }), [4, 2]), "big");
assert.equal(itemSize(fake({ marketplaceCategory: "buildings" }), [1, 1]), "big");
assert.equal(itemSize(fake({ marketplaceCategory: "world_basic" }), [3, 3]), "small");

// Every starter is a real brush or a real free item.
for (const entry of HOTBAR_STARTERS) assert.ok(hotbarToolOf(entry) || CENTRAL_WORLD_STARTER_SCENERY.some((item) => item.item_key === entry), entry);
assert.equal(hotbarToolOf(hotbarTool("water")), "water");
assert.equal(hotbarToolOf("tool:lava"), null);

// Pins first, then the newest picks, then starters; no repeats; only what's available; 8 slots.
let bar = { pins: [], recent: [] };
bar = rememberHotbarEntry(bar, "a");
bar = rememberHotbarEntry(bar, "b");
bar = rememberHotbarEntry(bar, "a");
assert.deepEqual(bar.recent, ["a", "b"]);
bar = togglePin(bar, "b");
const slots = hotbarSlots(bar, ["s1", "a", "s2", "gone", "s3", "s4", "s5", "s6", "s7"], (entry) => entry !== "gone");
assert.deepEqual(slots.slice(0, 3), ["b", "a", "s1"]);
assert.equal(slots.length, HOTBAR_SLOTS);
assert.ok(!slots.includes("gone"));
assert.deepEqual(togglePin(bar, "b").pins, []);
for (let i = 0; i < 20; i += 1) bar = rememberHotbarEntry(bar, `r${i}`);
assert.equal(bar.recent.length, HOTBAR_SLOTS);

console.log("walk-build: all checks passed");
