// Rules for the bigger central hub: saved builds never move, the old build area
// stays flat, new features (river, bridges, paths, gums) stay out of it, and the
// treehouse links in and out correctly.
import assert from "node:assert/strict";
import {
  HUB_V2_BRIDGES, HUB_V2_BUILD_AREA, HUB_V2_DECOR, HUB_V2_GUMS, HUB_V2_PADS, HUB_V2_PATHS, HUB_V2_PLAY_RADIUS, HUB_V2_ROCKS, HUB_V2_WATER_Y,
  HUB_V2_BUILD_RULES, HUB_V2_FLAT_TOLERANCE, HUB_V2_GRID, HUB_V2_TREEHOUSE_ANCHORS, distanceFromBuildArea, hubIsReservedCell, hubBridgeDeckY, hubCanStand, hubGroundHeight, hubRiverX, hubTerrainHeight, hubV2Spot, isCentralWorldV2Enabled,
} from "../lib/world3d/central-world-v2.ts";
import { pageFromTreehouseHref, parseTreehouseRoom, treehouseExitHref, treehouseHref, treehouseWindowView, DEFAULT_WINDOW_VIEW } from "../lib/world3d/treehouse-navigation.ts";
import { CENTRAL_WORLD_BUILD_RULES, CENTRAL_WORLD_GRID, CENTRAL_WORLD_HOME_KEY, DEFAULT_HOME_PLACEMENT, isCentralWorldProtectedCell, validateCentralWorldGroundCell, validateCentralWorldPlacement } from "../lib/world3d/central-world-layout.ts";
import { CENTRAL_WORLD_CONFIG } from "../lib/world3d/central-world-config.ts";

let checks = 0;
const check = (fn, message) => { checks++; assert.ok(fn(), message); };

// The switch is off unless asked for.
check(() => isCentralWorldV2Enabled(new URLSearchParams("")), "the bigger hub is the default");
check(() => isCentralWorldV2Enabled(new URLSearchParams("hub=v2")), "old ?hub=v2 links still open the bigger hub");
check(() => !isCentralWorldV2Enabled(new URLSearchParams("hub=classic")), "?hub=classic opens the previous hub");

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
assert.equal(treehouseExitHref(), "/world?spawn=my-home-exit-spawn");
assert.equal(treehouseExitHref(true), "/world?teacher_preview=1&spawn=my-home-exit-spawn");
assert.equal(pageFromTreehouseHref("/gem-vault", "gems"), "/gem-vault?from=treehouse&room=gems");
assert.equal(pageFromTreehouseHref("/legends", "legends", true), "/legends?from=treehouse&room=legends&teacher_preview=1");
assert.equal(pageFromTreehouseHref("/wardrobe", "main"), "/wardrobe?from=treehouse&room=main");
assert.equal(pageFromTreehouseHref("/marketplace", "main", true), "/marketplace?from=treehouse&room=main&teacher_preview=1");
checks += 6;

// Window views: the aurora skin and the stock room show the new painting; other skins keep their art until theirs arrives.
assert.equal(treehouseWindowView(undefined), DEFAULT_WINDOW_VIEW);
assert.equal(treehouseWindowView("/images/home-themes/aurora-mountain-cabin.png"), "/images/treehouse-views/aurora.jpg");
assert.equal(treehouseWindowView("/images/home-themes/crystal-observatory.png"), "/images/home-themes/crystal-observatory.png");
checks += 3;

// ---------- building in the bigger hub ----------
// Today's squares keep exactly today's rules: no new feature reserves any of them.
for (let gx = grid.minX; gx <= grid.maxX; gx++) for (let gz = grid.minZ; gz <= grid.maxZ; gz++) {
  assert.equal(hubIsReservedCell(gx, gz), isCentralWorldProtectedCell(gx, gz), `cell ${gx}:${gz} must keep today's build rule`);
}
checks++;
// Every square of the bigger grid is either reserved or flat, dry, walkable ground.
let open = 0;
for (let gx = HUB_V2_GRID.minX; gx <= HUB_V2_GRID.maxX; gx++) for (let gz = HUB_V2_GRID.minZ; gz <= HUB_V2_GRID.maxZ; gz++) {
  if (hubIsReservedCell(gx, gz)) continue;
  const x = gx * 2, z = gz * 2;
  assert.ok(Math.abs(hubTerrainHeight(x, z)) <= HUB_V2_FLAT_TOLERANCE, `open cell ${gx}:${gz} must be flat`);
  assert.ok(hubCanStand(x, z), `open cell ${gx}:${gz} must be walkable`);
  open++;
}
checks++;
const todayCells = (grid.maxX - grid.minX + 1) * (grid.maxZ - grid.minZ + 1);
check(() => open > todayCells * 1.8, `the bigger grid should offer far more building room (${open} open squares vs ${todayCells} today)`);
const cellOf = (x, z) => [Math.round(x / 2), Math.round(z / 2)];
check(() => hubIsReservedCell(...cellOf(hubRiverX(0), 0)), "the river is reserved");
check(() => hubIsReservedCell(...cellOf(HUB_V2_TREEHOUSE_ANCHORS.position[0], HUB_V2_TREEHOUSE_ANCHORS.position[2])), "the treehouse clearing is reserved");
check(() => HUB_V2_GUMS.every((g) => hubIsReservedCell(...cellOf(g.x, g.z)) || Math.abs(g.x) > 133 || Math.abs(g.z) > 133), "every ghost gum inside the grid is reserved");

// Placement checks with the new rules.
const shed = { item_key: "test_shed", name: "Test shed", category: "decoration", realm_id: null, rarity: "common", price: 0, icon: "home", accent: "#fff", purchasable: true, discoverable: true, active: true, sort_order: 0, metadata: { gridSize: "3x3" } };
const items = new Map([[shed.item_key, shed]]);
const at = (gridX, gridZ) => ({ placementId: "t", itemId: shed.item_key, gridX, gridZ, rotation: 0 });
check(() => validateCentralWorldPlacement(at(60, 0), shed, [], items, [], HUB_V2_BUILD_RULES) === !hubIsReservedCell(60, 0), "the new meadows can be built on");
check(() => !validateCentralWorldPlacement(at(60, 0), shed, [], items, [], CENTRAL_WORLD_BUILD_RULES), "today's hub still stops at its old edge");
const [riverGX, riverGZ] = cellOf(hubRiverX(10), 10);
check(() => !validateCentralWorldPlacement(at(riverGX, riverGZ), shed, [], items, [], HUB_V2_BUILD_RULES), "nothing can be built in the river");
const home = { ...DEFAULT_HOME_PLACEMENT };
check(() => !validateCentralWorldPlacement(at(home.gridX, home.gridZ), shed, [home], items, [], CENTRAL_WORLD_BUILD_RULES), "today the movable home blocks its squares");
check(() => validateCentralWorldPlacement(at(home.gridX, home.gridZ), shed, [home], items, [], HUB_V2_BUILD_RULES), "in the new hub the old home spot is free to build on");
check(() => !validateCentralWorldPlacement({ ...home, itemId: CENTRAL_WORLD_HOME_KEY }, shed, [], items, [], HUB_V2_BUILD_RULES), "the fixed treehouse home cannot be moved");
check(() => !validateCentralWorldGroundCell(riverGX, riverGZ, [home], "path", HUB_V2_BUILD_RULES), "no ground tiles on the river");
check(() => validateCentralWorldGroundCell(home.gridX, home.gridZ, [home], "path", HUB_V2_BUILD_RULES), "paths can be painted where the old home stood");

console.log(`central world v2: ${checks} checks passed (${open} open building squares, ${todayCells} today)`);
