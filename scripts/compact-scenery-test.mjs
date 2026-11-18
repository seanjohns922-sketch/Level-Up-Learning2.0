import assert from "node:assert/strict";
import { centralWorldPlacementProblem, placementGroundCells, validateCentralWorldPlacement, isCompactScenery } from "../lib/world3d/central-world-layout.ts";
import { CENTRAL_WORLD_STARTER_SCENERY } from "../lib/world3d/central-world-editor-catalog.ts";

// Trees, plants, rocks, décor and animals block only their own square, so they
// can stand side by side; big things (water, bridges, play areas, castles) keep
// their whole footprint, and nothing can stand inside them.
const item = (key) => CENTRAL_WORLD_STARTER_SCENERY.find((entry) => entry.metadata.worldAssetKey === key);
const tree = item("tree"), shrub = item("shrub"), pond = item("pond"), keep = item("castle_keep"), gum = item("gum_tree"), lamp = item("lamp_post");
const items = new Map([tree, shrub, pond, keep, gum, lamp].map((entry) => [entry.item_key, entry]));
const at = (entry, gridX, gridZ, id = `${entry.item_key}-${gridX}-${gridZ}`) => ({ placementId: id, itemId: entry.item_key, gridX, gridZ, rotation: 0 });
const ok = (entry, gridX, gridZ, placements) => validateCentralWorldPlacement(at(entry, gridX, gridZ, "candidate"), entry, placements, items, []);

assert.ok(isCompactScenery(tree) && isCompactScenery(shrub), "trees and shrubs are compact");
assert.ok(!isCompactScenery(pond) && !isCompactScenery(keep), "ponds and castle keeps keep their space");

const grove = [at(tree, -20, 20)];
assert.ok(ok(tree, -19, 20, grove), "a tree can stand right next to another tree");
assert.ok(ok(tree, -19, 21, grove), "and diagonally next to it");
assert.ok(!ok(tree, -20, 20, grove), "but not on the same square");
assert.ok(ok(shrub, -21, 19, grove), "a shrub can tuck in beside a tree");

const water = [at(pond, -20, 30)];
assert.ok(!ok(tree, -20, 30, water), "a tree cannot stand in a pond");
assert.ok(!ok(tree, -19, 30, water), "or anywhere across the pond's footprint");
assert.ok(!ok(pond, -20, 20, grove), "a pond cannot be dropped over a tree");
assert.ok(!ok(pond, -21, 20, grove), "or over any part of the tree's footprint");

const castle = [at(keep, -10, 30)];
assert.ok(!ok(tree, -10, 30, castle) && !ok(tree, -9, 31, castle), "trees stay out of buildings");

// A tree stands on a 2 × 2 base, so its branches can hang over a path (the
// gum tree used to need a clear 10 × 10 patch, which almost never existed).
const pathAtZero = { grid: { cellSize: 2, minX: -30, maxX: 30, minZ: -30, maxZ: 30 }, isReservedCell: (gridX) => gridX === 0, fixedHome: false };
const problem = (entry, gridX, gridZ, placements = []) => centralWorldPlacementProblem(at(entry, gridX, gridZ, "candidate"), entry, placements, items, [], pathAtZero);
assert.deepEqual(placementGroundCells(at(gum, 5, 5), gum).length, 4, "a gum tree stands on 2 × 2 squares");
assert.deepEqual(placementGroundCells(at(lamp, 5, 5), lamp), [{ gridX: 5, gridZ: 5 }], "a lamp post stands on one square");
assert.equal(problem(gum, 2, 5), null, "a gum tree fits two squares from a path");
assert.equal(problem(gum, 1, 5), "reserved", "but its base cannot sit on the path");
assert.equal(problem(pond, 2, 5), "reserved", "a pond still needs its whole footprint clear");
assert.equal(problem(gum, 31, 5), "outside", "nothing goes past the edge of the world");
assert.equal(problem(gum, 10, 10, [at(keep, 10, 12)]), "occupied", "or into a building");
assert.equal(problem(keep, 10, 12, [at(gum, 10, 8)]), null, "a building can go next to a tree's base");

console.log("PASS compact scenery: trees and décor sit side by side on small bases; big items keep their space; every refusal has a reason");
