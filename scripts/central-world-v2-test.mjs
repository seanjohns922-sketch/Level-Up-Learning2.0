// Rules for the bigger central hub: saved builds never move, the old build area
// stays flat, new features (river, bridges, paths, gums) stay out of it, and the
// treehouse links in and out correctly.
import assert from "node:assert/strict";
import {
  HUB_V2_BRIDGES, HUB_V2_BUILD_AREA, HUB_V2_DECOR, HUB_V2_GUMS, HUB_V2_PADS, HUB_V2_PATHS, HUB_V2_PLAY_RADIUS, HUB_V2_ROCKS, HUB_V2_WATER_Y,
  HUB_V2_TREEHOUSE_ANCHORS, distanceFromBuildArea, hubBridgeDeckY, hubCanStand, hubGroundHeight, hubRiverX, hubTerrainHeight, hubV2Spot, isCentralWorldV2Enabled,
} from "../lib/world3d/central-world-v2.ts";
import { collectionFromTreehouseHref, parseTreehouseRoom, treehouseExitHref, treehouseHref, treehouseWindowView, DEFAULT_WINDOW_VIEW } from "../lib/world3d/treehouse-navigation.ts";
import { CENTRAL_WORLD_GRID } from "../lib/world3d/central-world-layout.ts";
import { CENTRAL_WORLD_CONFIG } from "../lib/world3d/central-world-config.ts";

let checks = 0;
const check = (fn, message) => { checks++; assert.ok(fn(), message); };

// The switch is off unless asked for.
check(() => !isCentralWorldV2Enabled(new URLSearchParams("")), "v2 must be off by default");
check(() => isCentralWorldV2Enabled(new URLSearchParams("hub=v2")), "?hub=v2 turns the new hub on");

// Today's build grid fits inside the protected build area, so no saved cell is affected.
const grid = CENTRAL_WORLD_GRID;
check(() => grid.minX * grid.cellSize >= HUB_V2_BUILD_AREA.minX && grid.maxX * grid.cellSize <= HUB_V2_BUILD_AREA.maxX, "build grid x must sit inside the protected area");
check(() => grid.minZ * grid.cellSize >= HUB_V2_BUILD_AREA.minZ && grid.maxZ * grid.cellSize <= HUB_V2_BUILD_AREA.maxZ, "build grid z must sit inside the protected area");

// Every saved cell stays flat ground at y=0, standable and dry.
for (let gx = grid.minX; gx <= grid.maxX; gx++) for (let gz = grid.minZ; gz <= grid.maxZ; gz++) {
  const x = gx * grid.cellSize, z = gz * grid.cellSize;
  assert.equal(hubTerrainHeight(x, z), 0, `cell ${gx}:${gz} must stay flat`);
  assert.ok(hubCanStand(x, z) || Math.hypot(x, z) > HUB_V2_PLAY_RADIUS, `cell ${gx}:${gz} must be walkable`);
}
checks++;

// The Tower keeps its spot.
assert.deepEqual(CENTRAL_WORLD_CONFIG.towerPosition, [0, 0, -46]);
checks++;

// The river, paths, pads, gums and rocks are all outside the build area.
for (let z = -150; z <= 190; z += 2) assert.ok(distanceFromBuildArea(hubRiverX(z) - 15, z) > 0, `river bank at z=${z} touches the build area`);
for (const path of HUB_V2_PATHS) for (const [x, z] of path) assert.ok(x <= HUB_V2_BUILD_AREA.minX || x >= HUB_V2_BUILD_AREA.maxX || z <= HUB_V2_BUILD_AREA.minZ || z >= HUB_V2_BUILD_AREA.maxZ, `path point ${x},${z} is inside the build area`);
for (const pad of HUB_V2_PADS) assert.ok(distanceFromBuildArea(pad.x, pad.z) > pad.r, `${pad.key} clearing overlaps the build area`);
for (const gum of HUB_V2_GUMS) assert.ok(distanceFromBuildArea(gum.x, gum.z) >= 10, "a ghost gum grows in the build area");
for (const rock of HUB_V2_ROCKS) assert.ok(distanceFromBuildArea(rock.x, rock.z) >= 8, "a rock sits in the build area");
checks += 5;
check(() => HUB_V2_GUMS.length >= 15 && HUB_V2_GUMS.length <= 30, `expected a few ghost gums, got ${HUB_V2_GUMS.length}`);
check(() => HUB_V2_DECOR.every((d) => !d.model.startsWith("plant") || distanceFromBuildArea(d.x, d.z) >= 12 || Math.abs(d.x - hubRiverX(d.z)) <= 28), "bushes must keep to the edges and riverbanks");

// The river blocks walking, the bridges carry you over it.
for (const bridge of HUB_V2_BRIDGES) {
  const mid = hubRiverX(bridge.z);
  check(() => !hubCanStand(mid, bridge.z + 6), `river next to the bridge at z=${bridge.z} must block walking`);
  check(() => hubTerrainHeight(mid, bridge.z) < HUB_V2_WATER_Y, "riverbed must sit under the water");
  for (let x = bridge.x0 - 1; x <= bridge.x1 + 1; x += 0.5) assert.ok(hubCanStand(x, bridge.z), `bridge deck at x=${x.toFixed(1)} must be walkable`);
  check(() => hubGroundHeight(mid, bridge.z) > hubBridgeDeckY(bridge, bridge.x0), "the bridge arches up over the water");
}

// The edge of the world blocks walking.
check(() => !hubCanStand(HUB_V2_PLAY_RADIUS + 1, 0), "the world edge must block walking");

// Named arrival spots are walkable.
for (const key of ["hub-river", "hub-camp", "hub-lookout", "hub-treehouse", "hub-waterfall"]) {
  const spot = hubV2Spot(key);
  check(() => spot && hubCanStand(spot.position[0], spot.position[2]), `${key} must be a walkable spot`);
}
check(() => hubV2Spot("not-a-spot") === null, "unknown spots are ignored");

// The treehouse door and its arrival point are walkable, and the treehouse sits outside the build area.
const door = HUB_V2_TREEHOUSE_ANCHORS;
check(() => hubCanStand(door.entrance[0], door.entrance[2]), "treehouse entrance must be walkable");
check(() => hubCanStand(door.exit[0], door.exit[2]), "treehouse exit must be walkable");
check(() => !hubCanStand(door.position[0], door.position[2]), "the treehouse trunk must block walking");
check(() => distanceFromBuildArea(door.position[0], door.position[2]) > 20, "the treehouse must stand outside the build area");

// Treehouse links.
check(() => parseTreehouseRoom("gems") === "gems" && parseTreehouseRoom("legends") === "legends" && parseTreehouseRoom("attic") === "main" && parseTreehouseRoom(null) === "main", "unknown rooms fall back to the main room");
assert.equal(treehouseHref(), "/world/treehouse");
assert.equal(treehouseHref("gems", true), "/world/treehouse?teacher_preview=1&room=gems");
assert.equal(treehouseExitHref(), "/world?hub=v2&spawn=my-home-exit-spawn");
assert.equal(treehouseExitHref(true), "/world?teacher_preview=1&hub=v2&spawn=my-home-exit-spawn");
assert.equal(collectionFromTreehouseHref("/gem-vault", "gems"), "/gem-vault?from=treehouse&room=gems");
assert.equal(collectionFromTreehouseHref("/legends", "legends", true), "/legends?from=treehouse&room=legends&teacher_preview=1");
checks += 6;

// Window views: the aurora skin and the stock room show the new painting; other skins keep their art until theirs arrives.
assert.equal(treehouseWindowView(undefined), DEFAULT_WINDOW_VIEW);
assert.equal(treehouseWindowView("/images/home-themes/aurora-mountain-cabin.png"), "/images/treehouse-views/aurora.jpg");
assert.equal(treehouseWindowView("/images/home-themes/crystal-observatory.png"), "/images/home-themes/crystal-observatory.png");
checks += 3;

console.log(`central world v2: ${checks} checks passed`);
