// Roads & Cars: painted roads draw kerbs and a centre line, each car has its own feel on and off the
// road, placed things block cars (flat things don't), and the four cars match their migration.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildDriveCourse, CAR_COLOURS, CAR_ITEM_KEYS, CAR_SHOP_ITEMS, CAR_SPECS, CAR_STYLES, carBlockedCells, carItemKey, carToDrive, cellAt, nextOf, ownedCars,
} from "../lib/world3d/cars.ts";
import { roadPieces } from "../lib/world3d/roads.ts";
import { newKart, stepKart } from "../lib/world3d/race-driving.ts";
import { CENTRAL_WORLD_STARTER_SCENERY } from "../lib/world3d/central-world-editor-catalog.ts";
import { CENTRAL_WORLD_SHOP_ROWS } from "../lib/world3d/central-world-customisation-catalog.ts";
import { centralWorldCategory, MARKETPLACE_CATEGORIES } from "../lib/marketplace-categories.ts";

const tile = (gridX, gridZ, tileType = "road") => ({ gridX, gridZ, tileType });
const CELL = 2;

// A one-lane strip: kerbs and edge lines down both long sides and across both ends, no centre line.
{
  const strip = [0, 1, 2].map((x) => tile(x, 0));
  const p = roadPieces(strip, CELL);
  assert.equal(p.squares.length, 3);
  assert.equal(p.kerbs.length, 3 * 2 + 2, "both long sides plus the two ends");
  assert.equal(p.edgeLines.length, p.kerbs.length);
  assert.equal(p.dashes.length, 0, "one lane has no centre line");
}
// A two-lane road gets a dashed centre line on its middle edge, two dashes per square, drawn once.
{
  const road = [0, 1, 2, 3].flatMap((x) => [tile(x, 0), tile(x, 1)]);
  const p = roadPieces(road, CELL);
  assert.equal(p.dashes.length, 4 * 2);
  assert.ok(p.dashes.every((d) => d.alongX && d.z === CELL / 2), "dashes run along the road on the shared edge");
  assert.equal(p.kerbs.filter((k) => k.alongX).length, 8, "kerbs down both outside edges only");
  // Three lanes wide has no single middle edge, so no centre line.
  const wide = [0, 1, 2].flatMap((x) => [tile(x, 0), tile(x, 1), tile(x, 2)]);
  assert.equal(roadPieces(wide, CELL).dashes.length, 0);
  // Other ground (paths, water) never becomes road.
  assert.equal(roadPieces([tile(0, 0, "path"), tile(1, 0, "water")], CELL).squares.length, 0);
}

// Each car: fast on road, its own speed on grass. The 4WD barely slows off-road; the sports car is
// fastest on road and slowest on grass.
const top = (style, onRoad) => {
  const course = buildDriveCourse(onRoad ? Array.from({ length: 200 }, (_, i) => tile(0, i - 20)) : []);
  let car = newKart(0, 0, 0);
  for (let t = 0; t < 6; t += 1 / 60) car = stepKart(car, { throttle: 1, steer: 0 }, course, { canDriveAt: () => true }, 1 / 60, CAR_SPECS[style].handling);
  return car.speed;
};
for (const style of CAR_STYLES) assert.ok(top(style, true) > top(style, false), `${style} is faster on road`);
assert.equal(Math.max(...CAR_STYLES.map((s) => top(s, true))), top("sports", true), "Volt GT is fastest on road");
assert.equal(Math.min(...CAR_STYLES.map((s) => top(s, false))), top("sports", false), "Volt GT is slowest on grass");
assert.equal(Math.max(...CAR_STYLES.map((s) => top(s, false))), top("four_wd", false), "the 4WD is the off-road car");
assert.ok(top("four_wd", false) / top("four_wd", true) > 0.85, "the 4WD barely slows on grass");
// Race tarmac counts as road too.
assert.ok(buildDriveCourse([tile(3, 4, "track")]).track.has("3:4") && !buildDriveCourse([tile(3, 4, "path")]).track.has("3:4"));

// Placed things block cars; flat things (rails, stepping stones, the carport itself) don't.
{
  const item = (key, asset, gridSize = "1x1", group = "furniture_fun") => ({ item_key: key, metadata: { worldAssetKey: asset, gridSize, marketplaceCategory: "world_basic", worldSceneryGroup: group } });
  const items = new Map([["bench", item("bench", "bench", "2x1")], ["rail", item("rail", "rail_straight")], ["carport", CENTRAL_WORLD_STARTER_SCENERY.find((i) => i.metadata.worldAssetKey === "carport")]]);
  const blocked = carBlockedCells([
    { itemId: "bench", gridX: 4, gridZ: 0, rotation: 0 },
    { itemId: "rail", gridX: 8, gridZ: 0, rotation: 0 },
    { itemId: items.get("carport").item_key, gridX: 0, gridZ: 8, rotation: 0 },
  ], new Map([...items].map(([, value]) => [value.item_key, value])));
  assert.ok(blocked.has("4:0") && blocked.has("3:0"), "a bench blocks its squares");
  assert.ok(!blocked.has("8:0"), "rails are driven over");
  assert.ok(!blocked.has("0:8"), "the carport is driven out of");
  assert.equal(cellAt(8.9, -1.1), "4:-1");
}
const carport = CENTRAL_WORLD_STARTER_SCENERY.find((item) => item.metadata.worldAssetKey === "carport");
assert.ok(carport && carport.price === 0 && carport.metadata.gridSize === "3x2", "the carport is a free 3 x 2 build item");

// The car to drive: the chosen one if owned, else the first owned; nothing without a car.
const owned = new Set([carItemKey("ute"), carItemKey("sports")]);
assert.deepEqual(ownedCars(owned), ["ute", "sports"]);
assert.equal(carToDrive({ style: "sports", colour: CAR_COLOURS[0] }, owned), "sports");
assert.equal(carToDrive({ style: "hatch", colour: CAR_COLOURS[0] }, owned), "ute", "a car you don't own falls back");
assert.equal(carToDrive({ style: null, colour: CAR_COLOURS[0] }, new Set()), null);
assert.equal(nextOf(["a", "b", "c"], "c"), "a");

// Shop rows: the Cars tab, in the hub's rows (so demo mode owns them), and exactly as the migration.
assert.equal(CAR_SHOP_ITEMS.length, 4);
assert.ok(MARKETPLACE_CATEGORIES.world.some((c) => c.id === "cars" && c.label === "Cars"));
for (const row of CAR_SHOP_ITEMS) {
  assert.equal(centralWorldCategory(row), "cars");
  assert.ok(CENTRAL_WORLD_SHOP_ROWS.some((r) => r.item_key === row.item_key), `${row.item_key} is sold in the hub`);
}
assert.deepEqual([...CAR_ITEM_KEYS], CAR_STYLES.map(carItemKey));
const migration = readFileSync(new URL("../supabase/migrations/20261124120000_roads_and_cars.sql", import.meta.url), "utf8");
for (const row of CAR_SHOP_ITEMS) assert.ok(migration.split("\n").some((line) => line.startsWith(`('${row.item_key}'`) && line.includes(`, ${row.price}, `)), `migration row for ${row.item_key}`);
assert.equal(migration.split("\n").filter((line) => line.startsWith("('")).length, 4);
assert.ok(migration.includes("on conflict (item_key) do nothing") && !/create\s+(or\s+replace\s+)?function|update\s+public|delete\s+from/i.test(migration.replace(/^--.*$/gm, "")), "additive only");

console.log("cars: roads, handling, blocking, car choice and shop rows all check out");
