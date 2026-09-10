import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [environment, world, entry, state, route, access, towerEntry, towerConfig, towerChamber, carousel] = await Promise.all([
  read("components/world3d/ChanceHollowEnvironment.tsx"),
  read("components/world3d/ChanceHollowLevel3World.tsx"),
  read("components/world3d/ChanceHollow3DEntry.tsx"),
  read("lib/world3d/chance-hollow-world-state.ts"),
  read("app/world/chance-hollow/page.tsx"),
  read("lib/world3d/access.ts"),
  read("lib/world3d/tower-realm-entry.ts"),
  read("lib/world3d/tower-realm-chamber-config.ts"),
  read("components/world3d/TowerRealmChamber.tsx"),
  read("components/realms/RealmCarousel.tsx"),
]);

assert.match(environment, /chancehollow-home-y3\.jpeg/, "Level 3 must retain its canonical forward artwork");
assert.match(environment, /chancehollow-level3-panorama-rear\.png/, "Level 3 must provide the rear panorama hemisphere");
assert.match(environment, /thetaStart=\{Math\.PI \/ 2/, "The forward artwork must occupy one panorama hemisphere");
assert.match(environment, /thetaStart=\{-Math\.PI \/ 2/, "The rear artwork must occupy the other panorama hemisphere");
assert.match(environment, /chancehollow-level3-floor\.png/, "The walkable floor must use the Chance Hollow trail texture");
assert.match(environment, /chancehollow-home-y4\.jpeg/, "Level 4 must retain its canonical forward artwork");
assert.match(environment, /chancehollow-level4-panorama-rear\.png/, "Level 4 must provide the rear panorama hemisphere");
assert.match(environment, /chancehollow-level4-floor\.png/, "Level 4 must use its rune-edged causeway floor");
assert.match(environment, /chancehollow-home-y5\.jpeg/, "Level 5 must retain its canonical forward artwork");
assert.match(environment, /chancehollow-level5-panorama-rear\.png/, "Level 5 must provide the rear cliff panorama");
assert.match(environment, /chancehollow-level5-floor\.png/, "Level 5 must use its cyan-channelled citadel floor");
assert.match(environment, /chancehollow-home-y6\.jpeg/, "Level 6 must retain its canonical forward artwork");
assert.match(environment, /chancehollow-level6-panorama-rear\.png/, "Level 6 must provide the rear master-citadel panorama");
assert.match(environment, /chancehollow-level6-floor\.png/, "Level 6 must use its magenta calibration-grid floor");
assert.match(environment, /RepeatWrapping/, "The trail texture must tile across the playable floor");
assert.match(world, /SharedRealmWorld3D/, "Chance Hollow must use the shared canonical 3D world flow");
assert.match(world, /realmId: "chance"/, "Chance Hollow must retain its canonical realm scope");
assert.match(world, /backgroundImage: visuals\.front/, "Small devices must retain the selected level artwork beneath the WebGL canvas");
assert.doesNotMatch(world + environment, /saveRealmLessonAttempt|saveRealmAssessment|markLessonComplete|markQuizComplete|supabase\.rpc/, "The 3D world must not create a second learning-state writer");
assert.match(entry, /\["Year 3", "Year 4", "Year 5", "Year 6"\]/, "The 3D entry must expose Levels 3 through 6");
assert.match(state, /totalWeeks: 6/, "Chance Hollow must expose exactly six weeks");
assert.equal((state.match(/weeks: \[\d, \d\]/g) ?? []).length, 12, "Each Chance Hollow level must pair six weeks across three districts");
assert.match(route, /ChanceHollow3DEntry/, "The Chance Hollow 3D route must render its guarded entry");
assert.match(access, /"statistics", "chance"/, "Chance Hollow must be registered as a supported 3D realm");
assert.match(towerEntry, /\/world\/chance-hollow\?level=\$\{encodeURIComponent\(level\)\}/, "Tower entry must open the student's resolved Chance Hollow level in 3D");
assert.doesNotMatch(towerEntry, /previewRouteForStagedRealm/, "Live Chance Hollow must not retain its staged-preview bypass");
assert.match(towerConfig, /realmId: "chance"[\s\S]*posterAsset: "\/images\/chancehollow-home-y3\.jpeg"/, "The Chance Hollow tower portal must use real realm artwork");
assert.match(towerChamber, /if \(!isLiveRealmId\(realmId\)\) return "COMING SOON"/, "Tower progress labels must follow the live realm registry");
assert.match(carousel, /displayedLevel === "Year 3" \|\| displayedLevel === "Year 4" \|\| displayedLevel === "Year 5" \|\| displayedLevel === "Year 6"/, "Realm preview must open Levels 3 through 6 in 3D");

for (const asset of [
  "public/images/chancehollow-home-y3.jpeg",
  "public/images/chancehollow-level3-panorama-rear.png",
  "public/images/chancehollow-level3-floor.png",
  "public/images/chancehollow-home-y4.jpeg",
  "public/images/chancehollow-level4-panorama-rear.png",
  "public/images/chancehollow-level4-floor.png",
  "public/images/chancehollow-home-y5.jpeg",
  "public/images/chancehollow-level5-panorama-rear.png",
  "public/images/chancehollow-level5-floor.png",
  "public/images/chancehollow-home-y6.jpeg",
  "public/images/chancehollow-level6-panorama-rear.png",
  "public/images/chancehollow-level6-floor.png",
]) {
  const details = await stat(new URL(`../${asset}`, import.meta.url));
  assert.ok(details.size > 100_000, `${asset} must contain production artwork`);
  assert.ok(details.size < 8 * 1024 * 1024, `${asset} must remain below the 8 MB scene target`);
}

console.log("Chance Hollow Levels 3-6 world audit passed.");
