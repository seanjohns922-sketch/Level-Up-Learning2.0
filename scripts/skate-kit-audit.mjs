import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

// Skate Kit: kids place pieces anywhere and the avatar rides them. The riding heights,
// the kit levels, the shop rows and the hub wiring must all agree.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const kit = await import(new URL("../lib/world3d/skate-kit.ts", import.meta.url).href);
const { SKATE_KIT, SKATE_PIECES, SKATE_SCALE, SKATE_KIT_SHOP_ITEMS, skateKitLevel, nextSkateKitUpgrade, skateShapeHeight, skateHeightAt, quarterDepth } = kit;

// Levels: locked until bought, then the highest upgrade; every level adds pieces.
assert.equal(skateKitLevel(new Set()), 0);
assert.equal(nextSkateKitUpgrade(new Set()), null, "no upgrades before the kit is unlocked");
assert.equal(skateKitLevel(new Set([SKATE_KIT.unlockKey])), 1);
assert.equal(skateKitLevel(new Set([SKATE_KIT.unlockKey, SKATE_KIT.upgradeKey(2), SKATE_KIT.upgradeKey(3)])), 3);
assert.equal(nextSkateKitUpgrade(new Set([SKATE_KIT.unlockKey]))?.level, 2);
assert.equal(nextSkateKitUpgrade(new Set([SKATE_KIT.unlockKey, ...[2, 3, 4].map(SKATE_KIT.upgradeKey)])), null);
for (const level of [1, 2, 3, 4]) assert.ok(SKATE_PIECES.some((piece) => piece.level === level), `kit level ${level} adds pieces`);

// Riding heights: quarter pipes start flat at the front and reach the deck at the back.
for (const piece of SKATE_PIECES.filter((p) => p.shape.kind === "quarter")) {
  const { h } = piece.shape, front = quarterDepth(h) / 2;
  assert.equal(skateShapeHeight(piece.shape, 0, front), 0, `${piece.name} starts flat`);
  assert.equal(skateShapeHeight(piece.shape, 0, front - h), h, `${piece.name} reaches its deck`);
  let last = -1;
  for (let s = 0; s <= h; s += h / 20) { const y = skateShapeHeight(piece.shape, 0, front - s); assert.ok(y >= last - 1e-9, `${piece.name} only rises`); last = y; }
  assert.equal(skateShapeHeight(piece.shape, piece.shape.w, 0), null, "off the side is off the ramp");
}
const bowl = SKATE_PIECES.find((p) => p.shape.kind === "bowl").shape;
assert.ok(skateShapeHeight(bowl, 0, 0) < 0.1 && skateShapeHeight(bowl, bowl.r, 0) === bowl.depth, "the bowl dips in the middle and rises to its rim");
// World placement honours position and turning; heights come back in metres.
const quarter = SKATE_PIECES.find((p) => p.assetKey === "skate_quarter");
const deckLocal = quarterDepth(quarter.shape.h) / 2 - quarter.shape.h - 0.1;
assert.ok(Math.abs(skateHeightAt(10, 20 + deckLocal * SKATE_SCALE, [{ x: 10, z: 20, rotation: 0, piece: quarter }]) - quarter.shape.h * SKATE_SCALE) < 1e-9);
assert.ok(Math.abs(skateHeightAt(10 + deckLocal * SKATE_SCALE, 20, [{ x: 10, z: 20, rotation: 90, piece: quarter }]) - quarter.shape.h * SKATE_SCALE) < 1e-9, "a turned ramp rides turned");
assert.equal(skateHeightAt(40, 40, [{ x: 10, z: 20, rotation: 0, piece: quarter }]), null);

// Shop rows: one listed kit unlock, three hidden upgrades, all in the migration at the same prices.
assert.equal(SKATE_KIT_SHOP_ITEMS.length, 4);
assert.equal(SKATE_KIT_SHOP_ITEMS[0].metadata.marketplaceCategory, "kits");
assert.ok(SKATE_KIT_SHOP_ITEMS.slice(1).every((row) => row.metadata.marketplaceHidden === true));
const migration = read("supabase/migrations/20261120180000_skate_kit.sql");
for (const row of SKATE_KIT_SHOP_ITEMS) assert.ok(migration.split("\n").some((line) => line.startsWith(`('${row.item_key}'`) && line.includes(`, ${row.price}, `)), `migration row for ${row.item_key}`);
assert.ok(migration.includes("on conflict (item_key) do nothing"));
assert.ok(existsSync(new URL("../public/marketplace/world-renders/kit_skate.webp", import.meta.url)), "the kit needs its shop picture");

// Wiring: free pieces gated by kit level, drawn by the renderer, ridden by the avatar.
const editor = await import(new URL("../lib/world3d/central-world-editor-catalog.ts", import.meta.url).href);
const pieces = editor.CENTRAL_WORLD_STARTER_SCENERY.filter((item) => item.metadata.worldSceneryGroup === "skate");
assert.equal(pieces.length, SKATE_PIECES.length);
assert.ok(pieces.every((item) => item.price === 0 && !item.purchasable && Number(item.metadata.skateKitLevel) >= 1));
const world = read("components/world3d/CentralWorld.tsx");
assert.ok(world.includes('(paletteTab !== "skate" || Number(item.metadata.skateKitLevel) <= skateLevel)'), "the Skate tab shows only unlocked pieces");
assert.ok(world.includes("<SkateKitWorldContext.Provider value={skateKitWorld}>") && world.includes("rideHeightAt={rideHeightAt}"), "the hub must pass kit level and ride heights");
assert.ok(read("components/world3d/CentralWorldEnvironment.tsx").includes("if (SKATE_PIECE_KEYS.has(assetKey)) return <PlacedSkatePiece assetKey={assetKey} />;"));
assert.ok(read("components/world3d/SharedWorldPlayer.tsx").includes("board.current.visible = ride !== null"), "the avatar rides on a board on skate pieces");

console.log(`PASS Skate Kit: ${SKATE_PIECES.length} pieces over 4 kit levels, ramps rise smoothly and turn with the piece, 4 shop rows match the migration, hub wiring in place`);
