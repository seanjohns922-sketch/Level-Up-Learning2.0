import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

// Race Kit: paint tarmac, place race pieces, upgrade the kit. The kit, the track tile type,
// the shop rows and the hub wiring must agree. (Racing itself is checked separately.)
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const { RACE_KIT, RACE_PIECES, RACE_KIT_SHOP_ITEMS } = await import(new URL("../lib/world3d/race-kit.ts", import.meta.url).href);
const { buildKitLevel, nextBuildKitUpgrade } = await import(new URL("../lib/world3d/build-kits.ts", import.meta.url).href);

assert.equal(RACE_KIT.unlockKey, "central_world_kit_race");
assert.equal(buildKitLevel(RACE_KIT, new Set()), 0, "locked until bought");
assert.equal(buildKitLevel(RACE_KIT, new Set([RACE_KIT.unlockKey, RACE_KIT.upgradeKey(2)])), 2);
assert.equal(nextBuildKitUpgrade(RACE_KIT, new Set([RACE_KIT.unlockKey]))?.name, "Race Day Pack");
for (const level of [1, 2, 3, 4]) assert.ok(RACE_PIECES.some((piece) => piece.level === level), `kit level ${level} adds pieces`);

// Shop rows: listed kit, hidden upgrades, matching the migration.
assert.equal(RACE_KIT_SHOP_ITEMS.length, 4);
assert.equal(RACE_KIT_SHOP_ITEMS[0].metadata.marketplaceCategory, "kits");
assert.ok(RACE_KIT_SHOP_ITEMS.slice(1).every((row) => row.metadata.marketplaceHidden === true));
const migration = read("supabase/migrations/20261120210000_race_kit.sql");
for (const row of RACE_KIT_SHOP_ITEMS) assert.ok(migration.split("\n").some((line) => line.startsWith(`('${row.item_key}'`) && line.includes(`, ${row.price}, `)), `migration row for ${row.item_key}`);
assert.ok(migration.includes("on conflict (item_key) do nothing"));
assert.ok(existsSync(new URL("../public/marketplace/world-renders/kit_race.webp", import.meta.url)));

// Tarmac is a saved ground type; the editor only paints it once the kit is unlocked.
const layout = read("lib/world3d/central-world-layout.ts");
assert.ok(layout.includes('"path" | "road" | "stone" | "water" | "track"') && layout.includes('["path", "road", "stone", "water", "track"].includes'), "track tiles must load back from the saved layout");
const world = read("components/world3d/CentralWorld.tsx");
assert.ok(world.includes('(editTool === "track" && raceLevel > 0)'), "tarmac paints only with the Race Kit");
assert.ok(world.includes('paletteTab === "race" ? { kit: RACE_KIT, level: raceLevel }') && world.includes("<RaceKitWorldContext.Provider value={raceKitWorld}>"));
const env = read("components/world3d/CentralWorldEnvironment.tsx");
assert.ok(env.includes("<RaceTrackTiles tiles={tiles} />") && env.includes("if (RACE_PIECE_KEYS.has(assetKey)) return <PlacedRacePiece assetKey={assetKey} />;"));

// Pieces: free scenery in the Race group, gated by kit level, each with a tray picture.
const editor = await import(new URL("../lib/world3d/central-world-editor-catalog.ts", import.meta.url).href);
const pieces = editor.CENTRAL_WORLD_STARTER_SCENERY.filter((item) => item.metadata.worldSceneryGroup === "race");
assert.equal(pieces.length, RACE_PIECES.length);
assert.ok(pieces.every((item) => item.price === 0 && !item.purchasable && Number(item.metadata.kitPieceLevel) >= 1));
for (const piece of RACE_PIECES) assert.ok(existsSync(new URL(`../public/marketplace/world-renders/free/${piece.assetKey}.webp`, import.meta.url)), `${piece.name} needs its tray picture`);

// Turns are rounded: a cell joined ahead and to one side is a corner; straights, ends and junctions aren't.
const { trackCorner } = await import(new URL("../lib/world3d/race-kit.ts", import.meta.url).href);
const cells = new Set(["0:0", "1:0", "0:1", "5:5", "6:5", "7:5", "9:9", "10:9", "8:9", "9:10"]);
assert.deepEqual(trackCorner(0, 0, cells), [1, 1], "an L turn rounds round its inside corner");
assert.equal(trackCorner(6, 5, cells), null, "a straight stays square");
assert.equal(trackCorner(5, 5, cells), null, "an end stays square");
assert.equal(trackCorner(9, 9, cells), null, "a junction stays square");
assert.ok(read("components/world3d/premium-items/RacePieces.tsx").includes("<CornerTile corner={corner}"), "turns draw as rounded corners");
// Racing: start lines are Race targets, the kart replaces the explorer, and the overlay shows laps.
assert.ok(world.includes('assetKey === "race_start"') && world.includes('label: "RACE", icon: "flag"'), "a start line must offer the Race button");
assert.ok(world.includes("<RaceKartDriver key={race.nonce}") && world.includes("hidden={!roaming}"), "racing must swap the explorer for the kart");
assert.ok(world.includes("<RaceHud hud={raceHud}") && world.includes("driving={Boolean(race)}"), "racing must show the lap overlay and drive from the joystick");
console.log(`PASS Race Kit: ${RACE_PIECES.length} pieces over 4 kit levels, tarmac saved and gated by the kit, 4 shop rows match the migration, hub wiring and racing in place`);
