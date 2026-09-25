import { newWorldPlacementId } from "../lib/world3d/world-connections.ts";
import assert from 'node:assert/strict';
import {
  CENTRAL_WORLD_HOME_ITEM as homeItem, CENTRAL_WORLD_HOME_KEY as homeKey,
  DEFAULT_HOME_PLACEMENT as original, getCentralWorldHome, getCentralWorldHomeAnchors,
  validateCentralWorldPlacement as fits, validateCentralWorldGroundCell as paintable,
  readCentralWorldPlacements, writeCentralWorldPlacements,
  readCentralWorldGroundTiles, writeCentralWorldGroundTiles, centralWorldStarterPaths,
} from '../lib/world3d/central-world-layout.ts';

const storage = new Map();
globalThis.window = { localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) } };
const tree = { ...homeItem, item_key: 'tree', metadata: { gridSize: '1x1' } };
const items = new Map([[homeKey, homeItem], ['tree', tree]]);
const moved = { ...original, gridX: 12, gridZ: 4, rotation: 0 };
assert.equal(fits(original, homeItem, [], items), true, 'Original home remains valid');
for (const rotation of [0, 90, 180, 270]) {
  const candidate = { ...moved, rotation };
  assert.equal(fits(candidate, homeItem, [original], items), true, `Rotation ${rotation} fits`);
  const { position, entrance, exit } = getCentralWorldHomeAnchors(candidate);
  assert.equal(Math.round(Math.hypot(exit[0] - position[0], exit[2] - position[2])), 8);
  assert.equal(Math.round(Math.hypot(entrance[0] - position[0], entrance[2] - position[2]) * 10), 65);
}
assert.equal(fits({ ...moved, gridX: 0, gridZ: -23 }, homeItem, [], items), false, 'Protect tower');
assert.equal(fits({ ...moved, gridX: 0, gridZ: 9 }, homeItem, [], items), false, 'Protect central arrival');
assert.equal(fits({ ...moved, gridX: 29 }, homeItem, [], items), false, 'Footprint must fit grid');
assert.equal(fits({ ...moved, gridX: 26, gridZ: 22 }, homeItem, [], items), false, 'Doorstep must be reachable inside roam ellipse');
const obstruction = { itemId: 'tree', placementId: 'tree-1', gridX: 12, gridZ: 8, rotation: 0 };
assert.equal(fits(moved, homeItem, [obstruction], items), false, 'Do not place exit on an existing item');
assert.equal(fits(moved, homeItem, [], items, [{ gridX: 12, gridZ: 8, tileType: 'water' }]), false, 'No water at doorstep');
assert.equal(fits(moved, homeItem, [], items, [{ gridX: 12, gridZ: 4, tileType: 'water' }]), false, 'No water under house');
assert.equal(fits(moved, homeItem, [{ ...obstruction, itemId: 'unknown' }], items), false, 'Unknown reward footprints must not be ignored');
assert.equal(fits(obstruction, tree, [moved], items), false, 'New objects cannot block saved doorstep');
assert.equal(fits({ ...obstruction, gridX: -30, gridZ: 12 }, tree, [moved], items), true, 'Old house location becomes buildable');
assert.equal(paintable(12, 8, [moved], 'water'), false);
assert.equal(paintable(12, 8, [moved], 'path'), true, 'Allow path at doorstep');
assert.equal(paintable(12, 4, [moved], 'path'), false, 'Protect occupied house footprint');
assert.equal(paintable(-30, 12, [moved], 'path'), true);
assert.equal(paintable(0, 2, [moved], 'path'), true, 'Old main path corridor is editable');

assert.deepEqual(getCentralWorldHome(readCentralWorldPlacements('student-a')), original);
writeCentralWorldPlacements('student-a', [moved, { ...moved, gridX: 18 }, obstruction]);
const saved = readCentralWorldPlacements('student-a');
assert.equal(saved.filter(p => p.itemId === homeKey).length, 1, 'Home is always a singleton');
assert.deepEqual(getCentralWorldHome(saved), moved, 'Move survives reload');
assert.deepEqual(getCentralWorldHome(readCentralWorldPlacements('student-b')), original, 'Student scopes are separate');
assert.deepEqual(getCentralWorldHome(readCentralWorldPlacements('demo-preview')), original, 'Preview is isolated');
writeCentralWorldPlacements('student-a', [original]);
assert.deepEqual(getCentralWorldHome(readCentralWorldPlacements('student-a')), original, 'Undo can restore transform');

storage.set('lul:central-world:layout:v1:broken', JSON.stringify([{ ...original, gridX: 900 }]));
assert.deepEqual(getCentralWorldHome(readCentralWorldPlacements('broken')), original, 'Corrupt home position falls back safely');

const starter = centralWorldStarterPaths();
assert(starter.length > 60);
const remaining = new Set(starter.map(t => `${t.gridX}:${t.gridZ}`));
const queue = [starter[0]];
remaining.delete(`${starter[0].gridX}:${starter[0].gridZ}`);
for (const cell of queue) for (const [dx, dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
  const gridX = cell.gridX + dx, gridZ = cell.gridZ + dz;
  if (remaining.delete(`${gridX}:${gridZ}`)) queue.push({ gridX, gridZ });
}
assert.equal(remaining.size, 0, 'Starter paths connect edge-to-edge, including diagonal bends');
assert.equal(new Set(starter.map(t => `${t.gridX}:${t.gridZ}`)).size, starter.length);
storage.set('lul:central-world:ground:v1:student-a', JSON.stringify([{ gridX: -8, gridZ: 7, tileType: 'stone' }]));
const migrated = readCentralWorldGroundTiles('student-a');
assert(migrated.some(t => t.gridX === -8 && t.gridZ === 7 && t.tileType === 'stone'), 'Legacy paint preserved');
assert(migrated.some(t => t.tileType === 'path'), 'Starter routes become editable');
const erased = migrated.filter(t => !(t.gridX === 0 && t.gridZ === 2));
writeCentralWorldGroundTiles('student-a', erased);
assert.deepEqual(readCentralWorldGroundTiles('student-a'), erased, 'Erased starter tile stays erased after reload');
writeCentralWorldGroundTiles('student-a', []);
assert.deepEqual(readCentralWorldGroundTiles('student-a'), [], 'Empty v2 never regenerates locked paths');
assert(readCentralWorldGroundTiles('student-b').length > 60);
const firstFence={itemId:'central_world_starter_fence',placementId:newWorldPlacementId('fence'),gridX:12,gridZ:12,rotation:90,tint:'#96744e'};
writeCentralWorldPlacements('fence-session',[original,firstFence]);
const loaded=readCentralWorldPlacements('fence-session');
const secondFence={...firstFence,placementId:newWorldPlacementId('fence'),gridX:13};
writeCentralWorldPlacements('fence-session',[...loaded,secondFence]);
const reloaded=readCentralWorldPlacements('fence-session');
assert.equal(reloaded.filter(p=>p.itemId===firstFence.itemId).length,2,'New copies after reload preserve earlier placements');
assert.notEqual(firstFence.placementId,secondFence.placementId);
assert.deepEqual(reloaded.find(p=>p.placementId===firstFence.placementId),firstFence,'Rotation and colour survive reload');
delete globalThis.window;
console.log('Movable home, rotation, reachable entry, collision, scope isolation, undo storage and path migration checks passed.');
