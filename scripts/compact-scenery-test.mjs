import assert from "node:assert/strict";
import { validateCentralWorldPlacement, isCompactScenery } from "../lib/world3d/central-world-layout.ts";
import { CENTRAL_WORLD_STARTER_SCENERY } from "../lib/world3d/central-world-editor-catalog.ts";

// Trees, plants, rocks, décor and animals block only their own square, so they
// can stand side by side; big things (water, bridges, play areas, castles) keep
// their whole footprint, and nothing can stand inside them.
const item = (key) => CENTRAL_WORLD_STARTER_SCENERY.find((entry) => entry.metadata.worldAssetKey === key);
const tree = item("tree"), shrub = item("shrub"), pond = item("pond"), keep = item("castle_keep");
const items = new Map([tree, shrub, pond, keep].map((entry) => [entry.item_key, entry]));
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

console.log("PASS compact scenery: trees and décor sit side by side; big items keep their space");
