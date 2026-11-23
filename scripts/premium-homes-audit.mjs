import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

// Premium homes: four styles, four levels. Unlocking and upgrading are XP purchases,
// so the catalogue, the migration rows and the world renderer must all agree.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const homes = await import(new URL("../lib/world3d/premium-homes.ts", import.meta.url).href);
const { PREMIUM_HOME_STYLES: ALL_STYLES, DEFENCE_STYLES, PREMIUM_HOME_SPECS, premiumHomeLevel, premiumHomeUpgradeKey, premiumHomeItemKey, nextPremiumHomeUpgrade, trampolineBounceAt, TRAMPOLINE_BOUNCE } = homes;

// The Protect the Tower, everyday, City Life and Main Street styles share this system and have their own audits (qa:tower-defence, qa:everyday-items, qa:city-life, qa:main-street).
const PREMIUM_HOME_STYLES = ALL_STYLES.filter((style) => !DEFENCE_STYLES.includes(style) && !homes.EVERYDAY_STYLES.includes(style) && !homes.CITY_LIFE_STYLES.includes(style) && !homes.MAIN_STREET_STYLES.includes(style) && !homes.SPORTS_STYLES.includes(style) && !homes.WATER_STYLES.includes(style));
const isHomeRow = (row) => PREMIUM_HOME_STYLES.includes(row.metadata.premiumHome);
const PREMIUM_HOME_SHOP_ITEMS = homes.PREMIUM_HOME_SHOP_ITEMS.filter(isHomeRow), PREMIUM_HOME_UPGRADE_ITEMS = homes.PREMIUM_HOME_UPGRADE_ITEMS.filter(isHomeRow);
assert.deepEqual([...PREMIUM_HOME_STYLES], ["cottage", "modern", "treehouse", "apartment", "fair", "trampoline", "basketball"]);
for (const style of PREMIUM_HOME_STYLES) {
  const spec = PREMIUM_HOME_SPECS[style];
  assert.equal(spec.levels.length, 4, `${style} needs four level names`);
  assert.ok(spec.prices.every((price) => Number.isInteger(price) && price > 0), `${style} prices must be positive XP`);
  assert.ok(existsSync(new URL(`../public/marketplace/world-renders/${spec.assetKey}.webp`, import.meta.url)), `${style} needs its shop render`);
}
const rows = [...PREMIUM_HOME_SHOP_ITEMS, ...PREMIUM_HOME_UPGRADE_ITEMS];
assert.equal(rows.length, 28, "7 unlocks + 21 upgrades");
assert.equal(new Set(rows.map((row) => row.item_key)).size, 28, "item keys must be unique");
assert.ok(PREMIUM_HOME_UPGRADE_ITEMS.every((row) => row.metadata.marketplaceHidden === true), "upgrades are sold from the home, not the Marketplace grid");
assert.ok(PREMIUM_HOME_SHOP_ITEMS.every((row) => row.metadata.marketplaceCategory === PREMIUM_HOME_SPECS[row.metadata.premiumHome].marketplaceCategory && row.metadata.slot === "world_plot_1"), "unlocks are placeable world items in their shop category");
// The live home rows keep their original keys.
assert.equal(premiumHomeItemKey("cottage"), "central_world_plot_1_home_cottage");
assert.equal(premiumHomeUpgradeKey("apartment", 4), "central_world_home_upgrade_apartment_4");

// Level = highest upgrade owned; the next upgrade follows in order and stops at Legendary.
assert.equal(premiumHomeLevel("modern", new Set()), 1);
assert.equal(premiumHomeLevel("modern", new Set([premiumHomeUpgradeKey("modern", 2), premiumHomeUpgradeKey("modern", 3)])), 3);
assert.equal(premiumHomeLevel("modern", new Set([premiumHomeUpgradeKey("cottage", 4)])), 1, "levels never leak between styles");
assert.equal(nextPremiumHomeUpgrade("apartment", new Set([premiumHomeItemKey("apartment")]))?.level, 2);
assert.equal(nextPremiumHomeUpgrade("apartment", new Set([2, 3, 4].map((level) => premiumHomeUpgradeKey("apartment", level)))), null);

// Trampolines bounce inside their reach, harder at higher levels, and not at all elsewhere.
const pads = [{ x: 10, z: -4 }];
assert.equal(trampolineBounceAt(10.5, -4, pads, 1), TRAMPOLINE_BOUNCE[1].power);
assert.equal(trampolineBounceAt(10 + TRAMPOLINE_BOUNCE[1].radius + 0.1, -4, pads, 1), 0);
assert.ok(TRAMPOLINE_BOUNCE[4].power > TRAMPOLINE_BOUNCE[1].power && TRAMPOLINE_BOUNCE[4].radius > TRAMPOLINE_BOUNCE[1].radius);
assert.equal(trampolineBounceAt(0, 0, [], 4), 0);

// The migrations must insert exactly these rows at these prices.
const migration = read("supabase/migrations/20261120090000_premium_homes.sql") + read("supabase/migrations/20261120150000_fair_ride_and_trampoline.sql") + read("supabase/migrations/20261121150000_basketball_court.sql");
for (const row of rows) {
  const line = migration.split("\n").find((entry) => entry.startsWith(`('${row.item_key}'`));
  assert.ok(line, `migration is missing ${row.item_key}`);
  assert.ok(line.includes(`, ${row.price}, `), `${row.item_key} price differs from the catalogue`);
}
assert.equal(migration.split("on conflict (item_key) do nothing").length - 1, 3, "every premium migration must be additive");

// Wiring: renderer, sizing, catalogue, Marketplace, demo ownership and the upgrade button.
assert.ok(read("components/world3d/CentralWorldEnvironment.tsx").includes("<PlacedPremiumHome style={homeStyle} />"), "the world must draw premium homes");
assert.ok(read("lib/world3d/world-item-presentation.ts").includes("premiumHomeAssetKey(style)"), "premium homes need fixed sizing so upgrades grow in place");
assert.ok(read("lib/world3d/central-world-customisation-catalog.ts").includes("PREMIUM_HOME_ITEM_KEYS.has(item.item_key)"), "the live shop must wait for the database rows");
assert.ok(read("lib/marketplace-visuals.ts").includes("marketplaceHidden === true"), "the Marketplace must hide upgrade rows");
assert.ok(read("lib/economy.ts").includes('premiumHomeLevel === "number"'), "demo upgrades must be bought, not given");
const world = read("components/world3d/CentralWorld.tsx");
assert.ok(world.includes("<PremiumHomeWorldContext.Provider value={homeWorld}>") && world.includes("<PremiumHomeUpgradeRows"), "the hub must pass home levels and offer the upgrade");
assert.ok(world.includes("bounceAt={bounceAt}") && read("components/world3d/SharedWorldPlayer.tsx").includes("bounce={bounceAt ?"), "placed trampolines must reach the avatar jump");

// Basketball: lay-ups always go in, long shots are harder (never hopeless), threes count from outside the
// line, and the ball's arc starts in the explorer's hands, rises above the rim and ends there.
const ball = await import(new URL("../lib/world3d/basketball.ts", import.meta.url).href);
assert.equal(ball.shotChance(1.5), 1);
assert.ok(ball.shotChance(4) > ball.shotChance(7) && ball.shotChance(30) === 0.15);
assert.deepEqual([ball.shotPoints(3), ball.shotPoints(ball.THREE_POINT_RADIUS + 0.1)], [2, 3]);
const hoop = [0, -5.6];
const make = ball.planShot([0, 1.9, 0], hoop, 0), miss = ball.planShot([0, 1.9, 0], hoop, 0.999);
assert.ok(make.makes && make.points === 3 && !miss.makes && miss.points === 0);
assert.deepEqual(ball.ballAt(make, 0), [0, 1.9, 0]);
assert.deepEqual(ball.ballAt(make, 1).map((n) => Math.round(n * 100) / 100), [0, Math.round(ball.RIM_HEIGHT * ball.COURT_SCALE * 100) / 100, -5.6]);
assert.ok(ball.ballAt(make, 0.5)[1] > ball.RIM_HEIGHT * ball.COURT_SCALE + 1, "the ball arcs above the rim");
const turned = ball.courtInWorld({ gridX: 5, gridZ: 0, rotation: 90 }, 3, 2);
assert.deepEqual(turned.hoops.map(([x, z]) => [Math.round(x * 100) / 100 + 0, Math.round(z * 100) / 100 + 0]), [[10 - 5.6 * ball.COURT_SCALE, 0], [10 + 5.6 * ball.COURT_SCALE, 0]].map(([x, z]) => [Math.round(x * 100) / 100, z]), "hoops turn and scale with the court");
assert.deepEqual(ball.nearestHoop(14, 0, turned.hoops), turned.hoops[1]);
// Court markings stay on the playing surface at every level (the three-point arc and key included).
for (const level of [1, 2, 3, 4]) {
  const area = ball.COURT_AREA[level];
  for (const [, hz] of ball.HOOPS[level]) {
    const inward = hz < area.z ? 1 : -1, arcEnd = hz + inward * ball.THREE_POINT_RADIUS;
    assert.ok(ball.THREE_POINT_RADIUS <= area.w / 2 && Math.abs(arcEnd - area.z) <= area.d / 2 && Math.abs(hz - area.z) <= area.d / 2, `level ${level} markings fit the court`);
  }
  assert.ok(ball.courtReach(level) > Math.hypot(area.w, area.d) / 2, `level ${level}: Shoot works anywhere on the court`);
}

// Every placeable premium item, at every level, stays inside its plot. Measured from the real models
// (solid parts only: glows, lasers and light cones are light, not land). Re-measure after changing a model.
const levelSizes = JSON.parse(read("docs/world3d/premium-level-sizes.json"));
for (const style of ALL_STYLES.filter((s) => !PREMIUM_HOME_SPECS[s].fixed)) {
  const [w, d] = PREMIUM_HOME_SPECS[style].gridSize.split("x").map((n) => Number(n) * 2);
  for (const level of [1, 2, 3, 4]) {
    const row = levelSizes.find((r) => r.style === style && r.level === level);
    assert.ok(row, `${style} level ${level} has been measured`);
    const over = Math.max(-row.min[0] - w / 2, row.max[0] - w / 2, -row.min[2] - d / 2, row.max[2] - d / 2);
    assert.ok(over <= 0.05, `${style} level ${level} spills ${over.toFixed(2)} m outside its ${w} x ${d} m plot`);
  }
}
const hub = read("components/world3d/CentralWorld.tsx");
assert.ok(hub.includes('nearCourt ? { label: nearCourt.kind === "basketball" ? "SHOOT"') && hub.includes("<ShotBall key={shot.id}") && hub.includes("<BasketballScoreContext.Provider value={hoopScore}>"), "courts offer Shoot, fly the ball and score");
console.log(`PASS premium items: ${PREMIUM_HOME_STYLES.length} styles x 4 levels (homes, Fair Ride, trampoline, basketball), ${rows.length} shop rows match the migrations, trampoline bounce, hoop shooting, every level inside its plot and world wiring in place`);
