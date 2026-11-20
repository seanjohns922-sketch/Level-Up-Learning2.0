// Race Kit racing: the kart drives at full speed only on tarmac, boost pads and jumps work,
// tyre walls stop it, and laps only count going forwards across the line after a full lap.
import assert from "node:assert/strict";
import {
  buildRaceCourse, formatLapTime, KART_BOOST_SPEED, KART_OFF_TRACK_SPEED, KART_TOP_SPEED, LAP_ARM_DISTANCE,
  newKart, newLaps, raceExitPosition, raceGridPosition, raceStartLine, stepKart, updateLaps,
} from "../lib/world3d/race-driving.ts";

const open = { canDriveAt: () => true };
const tiles = (cells) => cells.map(([gridX, gridZ]) => ({ gridX, gridZ, tileType: "track" }));
const straight = tiles(Array.from({ length: 200 }, (_, i) => [0, i - 30]));
const drive = (kart, course, seconds, input = { throttle: 1, steer: 0 }, world = open) => {
  for (let t = 0; t < seconds; t += 1 / 60) kart = stepKart(kart, input, course, world, 1 / 60);
  return kart;
};

// Full speed on tarmac, slow on grass, the same at any frame rate.
{
  const tarmac = drive(newKart(0, -40, 0), buildRaceCourse([], straight), 3);
  assert.ok(Math.abs(tarmac.speed - KART_TOP_SPEED) < 0.01, `tarmac top speed ${tarmac.speed}`);
  const grass = drive(newKart(20, 0, 0), buildRaceCourse([], straight), 3);
  assert.ok(Math.abs(grass.speed - KART_OFF_TRACK_SPEED) < 0.01, `grass top speed ${grass.speed}`);
  let slow = newKart(0, -40, 0);
  for (let i = 0; i < 90; i++) slow = stepKart(slow, { throttle: 1, steer: 0 }, buildRaceCourse([], straight), open, 1 / 30);
  assert.ok(Math.abs(slow.z - tarmac.z) < 0.5, "frame rate changes distance");
}

// Steering: +1 turns right (towards -x when heading +z), and a parked kart can't spin on the spot.
{
  const course = buildRaceCourse([], straight);
  const turned = drive({ ...newKart(0, 0, 0), speed: 10 }, course, 0.3, { throttle: 1, steer: 1 });
  assert.ok(turned.heading < 0 && turned.x < 0, "right steer turns right");
  const parked = drive(newKart(0, 0, 0), course, 1, { throttle: 0, steer: 1 });
  assert.equal(parked.heading, 0);
}

// Boost pads push past top speed; it wears off.
{
  const course = buildRaceCourse([{ assetKey: "race_boost", gridX: 0, gridZ: 0, rotation: 0 }], straight);
  let kart = drive(newKart(0, -12, 0), course, 2.5);
  assert.ok(kart.speed > KART_TOP_SPEED + 3 && kart.speed <= KART_BOOST_SPEED, `boost speed ${kart.speed}`);
  kart = drive(kart, course, 3);
  assert.ok(Math.abs(kart.speed - KART_TOP_SPEED) < 0.5, "boost wears off");
}

// Jump ramps launch the kart and it lands; rolling over one slowly does nothing.
{
  const course = buildRaceCourse([{ assetKey: "race_jump", gridX: 0, gridZ: 0, rotation: 0 }], straight);
  let kart = { ...newKart(0, -6, 0), speed: KART_TOP_SPEED }, peak = 0;
  for (let i = 0; i < 180; i++) { kart = stepKart(kart, { throttle: 1, steer: 0 }, course, open, 1 / 60); peak = Math.max(peak, kart.y); }
  assert.ok(peak > 1.2, `jump height ${peak}`);
  assert.equal(kart.airborne, false);
  assert.equal(kart.y, 0);
  const crawl = drive({ ...newKart(0, -2, 0), speed: 2 }, course, 1, { throttle: 0.1, steer: 0 });
  assert.equal(crawl.y, 0);
}

// The bridge lifts the kart over and counts as tarmac.
{
  const course = buildRaceCourse([{ assetKey: "race_bridge", gridX: 20, gridZ: 0, rotation: 0 }], []);
  let kart = { ...newKart(40, -8, 0), speed: KART_TOP_SPEED }, peak = 0;
  for (let i = 0; i < 60; i++) { kart = stepKart(kart, { throttle: 1, steer: 0 }, course, open, 1 / 60); peak = Math.max(peak, kart.y); }
  assert.ok(peak > 1.6, `bridge height ${peak}`);
  assert.ok(kart.speed > KART_OFF_TRACK_SPEED + 4, "bridge counts as track");
}

// Tyre walls and blocked ground stop the kart.
{
  const course = buildRaceCourse([{ assetKey: "race_tyres", gridX: 0, gridZ: 0, rotation: 0 }], straight);
  const kart = drive(newKart(0, -10, 0), course, 3);
  assert.ok(kart.z < 0, `drove through tyres to ${kart.z}`);
  const walled = drive(newKart(0, -10, 0), buildRaceCourse([], straight), 3, undefined, { canDriveAt: (_x, z) => z < 0 });
  assert.ok(walled.z < 0);
}

// Laps: start lights face the grid; the first crossing from the grid doesn't count, a full lap does,
// and crossing backwards never does.
{
  const start = raceStartLine({ assetKey: "race_start", gridX: 0, gridZ: 0, rotation: 90 });
  const grid = raceGridPosition(start);
  // Rotated 90°: the grid sits on +x, facing -x.
  assert.ok(grid.x > 2 && Math.abs(grid.z) < 1e-9, `grid at ${grid.x},${grid.z}`);
  assert.ok(Math.abs(Math.sin(grid.heading) + 1) < 1e-9, "faces the lights");
  let laps = newLaps(0);
  laps = updateLaps(laps, start, { x: 3, z: 0 }, { x: -0.5, z: 0 }, 0.5);
  assert.equal(laps.laps, 0, "the start doesn't count");
  laps = updateLaps(laps, start, { x: -10, z: 0 }, { x: -10, z: LAP_ARM_DISTANCE + 5 }, 8);
  assert.equal(laps.armed, true);
  const backwards = updateLaps(laps, start, { x: -0.5, z: 0 }, { x: 0.5, z: 0 }, 19);
  assert.equal(backwards.laps, 0, "backwards doesn't count");
  laps = updateLaps(laps, start, { x: 0.5, z: 0 }, { x: -0.5, z: 0 }, 20);
  assert.deepEqual([laps.laps, laps.lastLap, laps.bestLap, laps.armed], [1, 20, 20, false]);
  laps = updateLaps(laps, start, { x: -10, z: 0 }, { x: -10, z: 30 }, 25);
  laps = updateLaps(laps, start, { x: 0.5, z: 0 }, { x: -0.5, z: 0 }, 38);
  assert.deepEqual([laps.laps, laps.lastLap, laps.bestLap], [2, 18, 18]);
  // Crossing beside the gantry, not through it, doesn't count.
  const armed = { ...laps, armed: true };
  assert.equal(updateLaps(armed, start, { x: 0.5, z: 9 }, { x: -0.5, z: 9 }, 50).laps, 2);
}

// After a race the explorer steps out beside the gantry, near enough for the Race button (6 m).
{
  const start = raceStartLine({ assetKey: "race_start", gridX: 3, gridZ: -2, rotation: 180 });
  const out = raceExitPosition(start);
  const d = Math.hypot(out.x - 6, out.z + 4);
  assert.ok(d > start.halfWidth && d < 6, `exit ${d} m from the line`);
}

assert.equal(formatLapTime(null), "--:--.--");
assert.equal(formatLapTime(65.432), "1:05.43");
assert.equal(formatLapTime(9.5), "0:09.50");
console.log("PASS race driving: tarmac speed, steering, boost, jumps, bridge, tyre walls, laps");
