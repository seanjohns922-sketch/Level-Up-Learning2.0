import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

// Real object pictures on the Measurelands ruler: every listed picture must exist,
// and the ruler must still draw the bar for objects that have no picture yet.
const source = readFileSync(new URL("../components/measurelands/MeasurelandsRulerCard.tsx", import.meta.url), "utf8");
const block = source.match(/const RULER_OBJECT_ART[\s\S]*?\n};/)?.[0];
assert.ok(block, "the ruler must list its object pictures in RULER_OBJECT_ART");

const entries = [...block.matchAll(/src: "([^"]+)", aspect: ([\d.]+)/g)];
assert.ok(entries.length >= 7, "the ruler must have the seven existing object pictures");
for (const [, src, aspect] of entries) {
  assert.ok(existsSync(new URL(`../public${src}`, import.meta.url)), `missing ruler picture ${src}`);
  assert.ok(Number(aspect) > 0, `${src} needs its width / height aspect`);
}
assert.ok(source.includes("art ? (") && source.includes('fill={`url(#obj-${uid})`}'), "objects without a picture must keep the coloured bar");

console.log(`PASS Measurelands ruler objects: ${entries.length} real pictures, bar kept for objects without art`);
