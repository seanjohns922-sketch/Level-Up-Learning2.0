// Sports: each court's targets, the odds and scoring of a shot (goals, behinds, aces), the button it shows,
// and the four sports' shop rows (plus basketball moving into the Sports tab) matching the migration.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { chooseTarget, planSportShot, SPORT_ACTION, SPORT_KINDS, SPORT_TARGETS, sportBallAt, sportChance, sportInWorld } from "../lib/world3d/sports.ts";
import { PREMIUM_HOME_SHOP_ITEMS, PREMIUM_HOME_SPECS, PREMIUM_HOME_UPGRADE_ITEMS, SPORTS_STYLES, premiumHomeItemKey } from "../lib/world3d/premium-homes.ts";
import { centralWorldCategory, MARKETPLACE_CATEGORIES } from "../lib/marketplace-categories.ts";

assert.deepEqual([...SPORT_KINDS], [...SPORTS_STYLES], "every sport in the shop has a game");
assert.deepEqual(SPORT_ACTION, { tennis: "SERVE", soccer: "KICK", footy: "KICK", netball: "SHOOT" });

// Every target sits inside its court's plot at every level.
for (const kind of SPORT_KINDS) {
  const [w, d] = PREMIUM_HOME_SPECS[kind].gridSize.split("x").map((n) => Number(n) * 2);
  for (const level of [1, 2, 3, 4]) for (const [x, y, z] of SPORT_TARGETS[kind][level]) {
    assert.ok(Math.abs(x) <= w / 2 && Math.abs(z) <= d / 2 && y > 0, `${kind} level ${level} target inside the plot`);
  }
}

// Close is easy, far is harder, never hopeless; tennis serves are steady.
for (const kind of ["netball", "soccer", "footy"]) {
  assert.ok(sportChance(kind, 1) >= sportChance(kind, 12) && sportChance(kind, 40) >= 0.15, `${kind} odds fall with distance but never to zero`);
}
assert.equal(sportChance("netball", 1.5), 1, "a netball shot from under the ring goes in");
assert.equal(sportChance("tennis", 3), sportChance("tennis", 20));

// Scoring: a footy goal is 6, a behind 1; soccer and netball goals 1; tennis aces 1; misses 0.
const from = [0, 0.3, 0];
assert.deepEqual([planSportShot("footy", from, [0, 3.5, -7], 0).points, planSportShot("footy", from, [0, 3.5, -7], 0).label], [6, "GOAL! +6"]);
const behind = planSportShot("footy", from, [0, 3.5, -40], 0.99, 0.1);
assert.deepEqual([behind.points, behind.label, behind.makes], [1, "Behind! +1", true]);
const missed = planSportShot("footy", from, [0, 3.5, -40], 0.99, 0.9);
assert.deepEqual([missed.points, missed.makes], [0, false]);
assert.equal(planSportShot("soccer", from, [0, 1, -6], 0).label, "GOAL! +1");
assert.equal(planSportShot("tennis", [0, 1.9, 0], [5, 0.12, 0], 0).label, "ACE! +1");
assert.equal(planSportShot("tennis", [0, 1.9, 0], [5, 0.12, 0], 0.95).label, "Out!");
// A kick flies lower than a netball lob over the same distance, and lands where it was aimed.
const kick = planSportShot("soccer", from, [0, 1, -10], 0), lob = planSportShot("netball", from, [0, 1, -10], 0);
assert.ok(sportBallAt(kick, 0.5)[1] < sportBallAt(lob, 0.5)[1], "kicks fly lower than lobs");
assert.deepEqual(sportBallAt(kick, 1).map((v) => Math.round(v * 100) / 100), [0, 1, -10]);

// Aiming: the nearest goal or ring, but in tennis the far side of the net; targets follow rotation.
assert.deepEqual(chooseTarget("soccer", 9, 0, [[-12, 1, 0], [12, 1, 0]]), [12, 1, 0]);
assert.deepEqual(chooseTarget("tennis", 3, 0, [[-5, 0.12, 0], [5, 0.12, 0]]), [-5, 0.12, 0]);
const turned = sportInWorld("footy", 2, [100, 50], 90, [20, 16]);
assert.deepEqual(turned.targets[0].map((v) => Math.round(v * 100) / 100), [92.9, 3.5, 50], "a turned court's goal turns with it");
assert.ok(turned.reach > 12, "the button shows anywhere on the ground");

// Shop rows: four sports in the Sports tab, basketball moved there too, and the migration matches.
const rows = [...PREMIUM_HOME_SHOP_ITEMS, ...PREMIUM_HOME_UPGRADE_ITEMS].filter((row) => SPORTS_STYLES.includes(row.metadata.premiumHome));
assert.equal(rows.length, 4 + 12);
for (const style of SPORTS_STYLES) {
  const unlock = rows.find((row) => row.item_key === premiumHomeItemKey(style));
  assert.ok(unlock && centralWorldCategory(unlock) === "sports", `${style} is in the Sports tab`);
  assert.ok(existsSync(new URL(`../public/marketplace/world-renders/${PREMIUM_HOME_SPECS[style].assetKey}.webp`, import.meta.url)), `${style} shop picture`);
}
const basketball = PREMIUM_HOME_SHOP_ITEMS.find((row) => row.item_key === premiumHomeItemKey("basketball"));
assert.equal(centralWorldCategory(basketball), "sports", "the basketball court shows in the Sports tab");
assert.ok(MARKETPLACE_CATEGORIES.world.some((c) => c.id === "sports" && c.label === "Sports"));
const migration = readFileSync(new URL("../supabase/migrations/20261124220000_sports.sql", import.meta.url), "utf8");
for (const row of rows) assert.ok(migration.split("\n").some((line) => line.startsWith(`('${row.item_key}'`) && line.includes(`, ${row.price}, `)), `migration row for ${row.item_key}`);
assert.equal(migration.split("\n").filter((line) => line.startsWith("('")).length, rows.length);
assert.ok(migration.includes(`where item_key = '${premiumHomeItemKey("basketball")}'`) && migration.includes('"marketplaceCategory":"sports"'), "basketball's row moves to the Sports tab");
assert.ok(!/delete\s+from|create\s+(or\s+replace\s+)?function/i.test(migration.replace(/^--.*$/gm, "")), "additive plus one metadata update");
const models = readFileSync(new URL("../components/world3d/premium-homes/PremiumHomeModels.tsx", import.meta.url), "utf8");
assert.ok(models.includes("...SPORTS_LEVEL_MODELS"), "sports models are registered");
console.log("sports: targets, odds, goals/behinds/aces, aiming, shop rows and the Sports tab all check out");
