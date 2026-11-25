// Building: items go on the square in front of the explorer (or the nearest spot that fits),
// big things get a further-back camera, and the hotbar keeps pins, then recent picks, then starters.
import assert from "node:assert/strict";
import {
  footCell, frontCell, HOTBAR_SLOTS, HOTBAR_STARTERS, hotbarSlots, hotbarTool, hotbarToolOf, itemSize, nearestFit,
  rememberHotbarEntry, standBehind, togglePin,
} from "../lib/world3d/walk-build.ts";
import { CENTRAL_WORLD_STARTER_SCENERY } from "../lib/world3d/central-world-editor-catalog.ts";
import { itemGroundSize, placementCentre, placementGroundCells } from "../lib/world3d/central-world-layout.ts";

const CELL = 2;
const facingNorth = Math.PI; // rotation π faces -z, towards the Tower

// A one-square item goes on the very next square, in each of the eight directions.
assert.deepEqual(frontCell(0, 18, facingNorth, [1, 1], CELL), { gridX: 0, gridZ: 8 });
assert.deepEqual(frontCell(0, 18, 0, [1, 1], CELL), { gridX: 0, gridZ: 10 });
assert.deepEqual(frontCell(0, 18, Math.PI / 2, [1, 1], CELL), { gridX: 1, gridZ: 9 });
assert.deepEqual(frontCell(0, 18, Math.PI / 4, [1, 1], CELL), { gridX: 1, gridZ: 10 });
// Standing anywhere in a square, or aiming a little off straight, still picks the same next square.
for (const [x, z, aim] of [[0.9, 18.9, facingNorth], [-0.9, 17.1, facingNorth], [0, 18, facingNorth + 0.3], [0, 18, facingNorth - 0.3]]) {
  assert.deepEqual(frontCell(x, z, aim, [1, 1], CELL), { gridX: 0, gridZ: 8 }, `from ${x},${z} aiming ${aim}`);
}
// A 9 × 9 court reaches out so its near edge is the next square: never under the explorer.
const court = frontCell(0, 18, facingNorth, [9, 9], CELL);
assert.deepEqual(court, { gridX: 0, gridZ: 4 });
assert.equal(court.gridZ + 4, 8, "court's near edge is the next square");
// Standing behind a held item puts it back in front.
for (const size of [[1, 1], [3, 2], [9, 9]]) {
  const [x, z] = standBehind(4, -6, size, CELL);
  assert.deepEqual(frontCell(x, z, facingNorth, size, CELL), { gridX: 4, gridZ: -6 }, `round trip ${size}`);
}
assert.deepEqual(footCell(3.1, -4.9, CELL), { gridX: 2, gridZ: -2 });

// Small scenery is small; the Tower's defences (bar the laser fence) and anything over 3 × 3 are big.
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
const starters = ["s1", "a", "gone", ...Array.from({ length: 20 }, (_, i) => `s${i + 2}`)];
const slots = hotbarSlots(bar, starters, (entry) => entry !== "gone");
assert.deepEqual(slots.slice(0, 3), ["b", "a", "s1"]);
assert.equal(slots.length, HOTBAR_SLOTS);
assert.ok(!slots.includes("gone"));
assert.deepEqual(togglePin(bar, "b").pins, []);
// Fifteen favourites at most: a sixteenth is refused, not swapped in.
let full = { pins: [], recent: [] };
for (let i = 0; i < 15; i += 1) full = togglePin(full, `f${i}`);
assert.equal(full.pins.length, 15);
assert.equal(togglePin(full, "extra"), full);
assert.equal(HOTBAR_STARTERS.length, HOTBAR_SLOTS, "a new builder's bar starts full");
for (let i = 0; i < 20; i += 1) bar = rememberHotbarEntry(bar, `r${i}`);
assert.equal(bar.recent.length, HOTBAR_SLOTS);

// Every item is drawn in the middle of the squares it covers, even ones an even number of squares wide.
for (const key of ["lamp_post", "bench", "campfire", "log", "tree", "pond", "defence_laser_gate"]) {
  for (const rotation of [0, 90, 180, 270]) {
    const item = scenery(key);
    const placement = { itemId: item.item_key, gridX: 3, gridZ: -2, rotation };
    const cells = placementGroundCells(placement, item);
    const mid = (axis) => ((Math.min(...cells.map((c) => c[axis])) + Math.max(...cells.map((c) => c[axis]))) / 2) * CELL;
    const [x, , z] = placementCentre(placement, item);
    assert.deepEqual([x, z], [mid("gridX"), mid("gridZ")], `${key} at ${rotation}°`);
  }
}

// The nearest spot that fits: itself if free, else the closest free square (strictly by distance), else null.
const blocked = new Set(["0:0", "1:0", "-1:0", "0:1", "0:-1"]);
const free = (cell) => !blocked.has(`${cell.gridX}:${cell.gridZ}`);
assert.deepEqual(nearestFit({ gridX: 5, gridZ: 5 }, free, 3), { gridX: 5, gridZ: 5 });
const near = nearestFit({ gridX: 0, gridZ: 0 }, free, 3);
assert.equal(Math.hypot(near.gridX, near.gridZ), Math.SQRT2, "a diagonal neighbour beats two squares straight");
// A whole ring blocked: the next ring out, never further than it needs to go.
const ring = (cell) => Math.max(Math.abs(cell.gridX), Math.abs(cell.gridZ)) >= 2;
const out = nearestFit({ gridX: 0, gridZ: 0 }, ring, 4);
assert.equal(Math.hypot(out.gridX, out.gridZ), 2);
assert.equal(nearestFit({ gridX: 0, gridZ: 0 }, () => false, 4), null);
assert.equal(nearestFit({ gridX: 0, gridZ: 0 }, ring, 1), null, "never looks past its reach");

console.log("walk-build: all checks passed");
