import assert from "node:assert/strict";
import { RIDER_TRACKS, newBike, stepBike, trackSegments, bikeAngle } from "../lib/chronorok/relic-rider.ts";

// An autopilot rides each track: full throttle, leaning to keep the bike level.
// Every track must be finishable, and the bike must behave (no explosions).
function ride(track, { verbose = false } = {}) {
  const segments = trackSegments(track);
  const bike = newBike();
  const dt = 1 / 60;
  let t = 0;
  while (t < 90 && !bike.crashed && !bike.finished) {
    const angle = bikeAngle(bike);
    const target = bike.grounded ? 0.05 : 0.1;
    const controls = { throttle: true, brake: false, leanBack: angle < target - 0.18, leanForward: angle > target + 0.18 };
    stepBike(bike, track, segments, controls, dt);
    t += dt;
    const speed = Math.hypot(bike.rear.p.x - bike.rear.prev.x, bike.rear.p.y - bike.rear.prev.y) * 60 * 6;
    if (!Number.isFinite(bike.rear.p.x) || speed > 400) throw new Error(`${track.name}: physics blew up`);
  }
  return { t: Math.round(t * 10) / 10, crashed: bike.crashed, finished: bike.finished, x: Math.round(bike.rear.p.x), finishX: Math.round(track.finishX) };
}

const results = RIDER_TRACKS.map((track, i) => ({ n: i + 1, name: track.name, par: track.par, ...ride(track) }));
for (const r of results) console.log(`${String(r.n).padStart(2)} ${r.name.padEnd(20)} ${r.finished ? "FINISHED" : r.crashed ? "CRASHED " : "STUCK   "} t=${r.t}s x=${r.x}/${r.finishX} par=${r.par}`);
assert.ok(results.every((r) => r.finished), "every track can be finished by the autopilot");
console.log("PASS Relic Rider: every track finishable; physics stable.");
