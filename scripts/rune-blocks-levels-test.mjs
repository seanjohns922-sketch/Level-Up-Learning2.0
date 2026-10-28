import assert from "node:assert/strict";
import { RUNE_LEVELS, solve, parseLevel, step } from "../lib/chronorok/rune-blocks.ts";

// Every Rune Blocks level must be solvable, and the rules must behave.
const results = RUNE_LEVELS.map((level, i) => ({ n: i + 1, name: level.name, par: solve(level) }));
for (const r of results) console.log(`${String(r.n).padStart(2)} ${r.name.padEnd(18)} ${r.par ?? "UNSOLVABLE"}`);
assert.ok(results.every((r) => r.par !== null), "every level can be solved");

// Rules: rolling off the edge falls; standing on crumbling stone breaks it.
const rows = ["oSo", "ooo", "oco"];
const start = parseLevel({ name: "t", map: rows }).start;
assert.equal(step(rows, start, "left", false).outcome, "fall");
assert.equal(step(["ooo", "oSo", "ooo", "oco", "ooo"], { x: 1, z: 1, o: "up" }, "down", false).outcome, "ok");
console.log("PASS Rune Blocks: every level solvable; rolling, falling and crumbling rules hold.");
