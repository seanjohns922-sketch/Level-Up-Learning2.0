import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [entry, world, sharedWorld, environment, state, themes, access, tower, route] = await Promise.all([
  read("components/world3d/Starpath3DEntry.tsx"),
  read("components/world3d/StarpathLevel3World.tsx"),
  read("components/world3d/SharedRealmWorld3D.tsx"),
  read("components/world3d/StarpathEnvironment.tsx"),
  read("lib/world3d/starpath-world-state.ts"),
  read("lib/starpath-visuals.ts"),
  read("lib/world3d/access.ts"),
  read("lib/world3d/tower-realm-entry.ts"),
  read("app/world/starpath/page.tsx"),
]);

assert.match(entry, /dynamic\(\(\) => import\("@\/components\/world3d\/StarpathLevel3World"\)/, "Starpath must remain route-lazy");
assert.match(entry, /resolveRealm3DAccess\(\{ realmId: "space"/, "Starpath must use central 3D access");
assert.match(entry, /router\.replace\("\/starpath"\)/, "Starpath must retain its 2D fallback");
assert.match(entry, /\["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"\]/, "Starpath production access must include Ground and Levels 1-6");
assert.match(route, /Starpath3DEntry/, "Starpath world route is missing");

assert.match(world, /SharedRealmWorld3D/, "Starpath must compose the shared realm world");
assert.doesNotMatch(world, /SharedThirdPersonPlayer|<Canvas|useFrame/, "Starpath must not copy the shared engine");
for (const sharedContract of ["SharedThirdPersonPlayer", "WorldMovePad", "WorldHUD", "WorldInteractionPrompt", "rememberWorld3DWeekEntry"]) {
  assert.match(sharedWorld, new RegExp(sharedContract), `Shared realm contract missing: ${sharedContract}`);
}
assert.match(sharedWorld, /searchParams\.get\("district"\)/, "Lesson return must restore the source district");
assert.match(sharedWorld, /__SHARED_REALM_3D_METRICS__/, "Shared performance instrumentation is missing");

const districts = ["Object Observatory", "Mapmaker's Reach", "Transformation Crossing", "Spatial Mission"];
for (const label of districts) {
  assert.ok(state.includes(`"${label}"`), `Canonical Starpath district missing: ${label}`);
}
assert.match(state, /weeks: \[index \* 2 \+ 1, index \* 2 \+ 2\]/, "Starpath districts must map to consecutive two-week groups");
assert.match(state, /getRealmWorldState/, "Starpath must consume canonical realm progression");
assert.doesNotMatch(state + world + sharedWorld, /starpath(?:3D)?Progress/i, "Starpath must not create parallel 3D progress");
assert.match(themes, /starpath-home-bg-y3\.png/, "The canonical 2D Level 3 artwork must remain registered");
assert.match(themes, /starpath-panorama-y3-front\.jpg/, "The Level 3 forward panorama is missing");
assert.match(themes, /starpath-panorama-y3-rear\.jpg/, "The complementary Level 3 rear panorama is missing");
assert.match(themes, /starpath-panorama-ground-front-4k\.jpg/, "The Ground forward panorama is missing");
assert.match(themes, /starpath-panorama-ground-rear-4k\.jpg/, "The complementary Ground rear panorama is missing");
assert.match(themes, /starpath-ground-glass-floor-2k\.jpg/, "The Ground glass floor is missing");
assert.match(themes, /starpath-panorama-y1-front-4k\.jpg/, "The Level 1 forward panorama is missing");
assert.match(themes, /starpath-panorama-y1-rear-4k\.jpg/, "The complementary Level 1 rear panorama is missing");
assert.match(themes, /starpath-y1-constellation-glass-floor-2k\.jpg/, "The Level 1 constellation glass floor is missing");
assert.match(themes, /STARPATH_LEVEL_THEMES\["Year 2"\][\s\S]*starpath-panorama-y1-front-4k\.jpg[\s\S]*starpath-panorama-y1-rear-4k\.jpg[\s\S]*starpath-y1-constellation-glass-floor-2k\.jpg/, "Level 2 must share the finished Level 1 world assets");
assert.match(environment, /theme\.level === "Year 1" \|\| theme\.level === "Year 2"/, "Levels 1 and 2 must share the winding glass walkway");
assert.match(themes, /STARPATH_LEVEL_THEMES\["Year 4"\][\s\S]*starpath-panorama-y45-front-4k\.jpg[\s\S]*starpath-panorama-y45-rear-4k\.jpg[\s\S]*starpath-y45-crystal-floor-2k\.jpg/, "Level 4 must use the shared Level 4-5 visual assets");
assert.match(themes, /STARPATH_LEVEL_THEMES\["Year 5"\][\s\S]*starpath-panorama-y45-front-4k\.jpg[\s\S]*starpath-panorama-y45-rear-4k\.jpg[\s\S]*starpath-y45-crystal-floor-2k\.jpg/, "Level 5 must use the shared Level 4-5 visual assets");
assert.match(themes, /STARPATH_LEVEL_THEMES\["Year 6"\][\s\S]*starpath-panorama-y6-front-4k\.jpg[\s\S]*starpath-panorama-y6-rear-4k\.jpg[\s\S]*starpath-y6-constellation-floor-2k\.jpg/, "Level 6 must use its capstone visual assets");
assert.match(environment, /theme\.panoramaOverlap \?\? 0\.42/, "Starpath themes must support per-level seam overlap tuning");
assert.match(environment, /theme\.panoramaEdgeFade \?\? 0\.12/, "Starpath themes must support per-level seam feather tuning");
assert.match(world, /guidedAdventure/, "Ground must use the single guided-adventure portal flow");
assert.match(world, /adventurePortalPosition/, "Ground guided portal position is missing");
assert.match(environment, /thetaStart=\{Math\.PI \/ 2 - panoramaOverlap \/ 2\}/, "The forward panorama half is missing its seam overlap");
assert.match(environment, /thetaStart=\{-Math\.PI \/ 2 - panoramaOverlap \/ 2\}/, "The rear panorama half is missing its seam overlap");
assert.match(environment, /edgeFade=\{panoramaEdgeFade\}/, "The panorama seam feather is missing");
assert.ok(access.includes('"space"'), "Central 3D access does not support Starpath");
assert.match(tower, /\/world\/starpath/, "Tower entry does not resolve to Starpath 3D");

const front = await stat(new URL("../public/images/starpath-panorama-y3-front.jpg", import.meta.url));
const rear = await stat(new URL("../public/images/starpath-panorama-y3-rear.jpg", import.meta.url));
assert.ok(front.size + rear.size <= 3_000_000, `Starpath panorama pair exceeds its 3 MB art budget: ${front.size + rear.size} bytes`);

const groundFront = await stat(new URL("../public/images/starpath-panorama-ground-front-4k.jpg", import.meta.url));
const groundRear = await stat(new URL("../public/images/starpath-panorama-ground-rear-4k.jpg", import.meta.url));
const groundFloor = await stat(new URL("../public/images/starpath-ground-glass-floor-2k.jpg", import.meta.url));
const groundArtBytes = groundFront.size + groundRear.size + groundFloor.size;
assert.ok(groundArtBytes <= 4_000_000, `Starpath Ground art exceeds its 4 MB budget: ${groundArtBytes} bytes`);

const year1Front = await stat(new URL("../public/images/starpath-panorama-y1-front-4k.jpg", import.meta.url));
const year1Rear = await stat(new URL("../public/images/starpath-panorama-y1-rear-4k.jpg", import.meta.url));
const year1Floor = await stat(new URL("../public/images/starpath-y1-constellation-glass-floor-2k.jpg", import.meta.url));
const year1ArtBytes = year1Front.size + year1Rear.size + year1Floor.size;
assert.ok(year1ArtBytes <= 4_000_000, `Starpath Level 1 art exceeds its 4 MB budget: ${year1ArtBytes} bytes`);

const year45Front = await stat(new URL("../public/images/starpath-panorama-y45-front-4k.jpg", import.meta.url));
const year45Rear = await stat(new URL("../public/images/starpath-panorama-y45-rear-4k.jpg", import.meta.url));
const year45Floor = await stat(new URL("../public/images/starpath-y45-crystal-floor-2k.jpg", import.meta.url));
const year45ArtBytes = year45Front.size + year45Rear.size + year45Floor.size;
assert.ok(year45ArtBytes <= 4_000_000, `Starpath shared Level 4-5 art exceeds its 4 MB budget: ${year45ArtBytes} bytes`);

const year6Front = await stat(new URL("../public/images/starpath-panorama-y6-front-4k.jpg", import.meta.url));
const year6Rear = await stat(new URL("../public/images/starpath-panorama-y6-rear-4k.jpg", import.meta.url));
const year6Floor = await stat(new URL("../public/images/starpath-y6-constellation-floor-2k.jpg", import.meta.url));
const year6ArtBytes = year6Front.size + year6Rear.size + year6Floor.size;
assert.ok(year6ArtBytes <= 4_000_000, `Starpath Level 6 art exceeds its 4 MB budget: ${year6ArtBytes} bytes`);

console.log("Starpath S3D-1 shared-world audit passed.");
console.log(JSON.stringify({ districts: districts.length, weeks: 8, panoramaBytes: front.size + rear.size, groundArtBytes, year1ArtBytes, year45ArtBytes, year6ArtBytes }));
