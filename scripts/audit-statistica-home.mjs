import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const assetNames = Array.from({ length: 6 }, (_, index) => `statistica-home-y${index + 1}.png`);

for (const assetName of assetNames) {
  const assetPath = path.join(root, "public", "images", assetName);
  assert(fs.existsSync(assetPath), `Missing Statistica home background: ${assetName}`);
}
assert(fs.existsSync(path.join(root, "public", "images", "statistica-terrace-tile.png")), "Missing Statistica terrace tile texture");

const visualMap = read("lib/statistica-visuals.ts");
for (const assetName of assetNames) {
  assert(visualMap.includes(`/images/${assetName}`), `Statistica visual map does not reference ${assetName}`);
}
assert(visualMap.includes('"Year 2": {'), "Statistica Level 2 must have its own 3D visual theme");
assert(visualMap.includes('"Year 3": {'), "Statistica Level 3 must have its own 3D visual theme");
assert(visualMap.includes('"Year 4": {'), "Statistica Level 4 must have its own 3D visual theme");
assert(visualMap.includes('"Year 5": {'), "Statistica Level 5 must have its own 3D visual theme");
assert(visualMap.includes('floorStyle: "cliffTerrace"'), "Statistica Level 5 must use a valley/cliff terrace floor");
assert(visualMap.includes('"Year 6": {'), "Statistica Level 6 must have its own 3D visual theme");
assert(visualMap.includes('floorStyle: "summitTerrace"'), "Statistica Level 6 must use a summit terrace floor");

const legendCatalogue = read("data/legends.ts");
const dataraVideos = [
  ["Datara Picker", "datara-picker"],
  ["Datara Sorter", "datara-solver"],
  ["Datara Grapher", "datara-grapher"],
  ["Datara Analyst", "datara-analyst"],
  ["Datara Decoder", "datara-decoder"],
  ["Datara Insightkeeper", "datara-insightkeeper"],
];
assert(legendCatalogue.includes("unlockVideoUrl: legendVideoUrl(videoSlug)"), "Statistica legends must expose an unlock video");
assert(legendCatalogue.includes("showcaseVideoUrl: legendVideoUrl(videoSlug)"), "Statistica legends must expose a showcase video");
for (const [legendName, videoSlug] of dataraVideos) {
  const videoPath = path.join(root, "public", "videos", "legends", `${videoSlug}.mp4`);
  assert(legendCatalogue.includes(`\"${legendName}\"`), `Missing Statistica legend: ${legendName}`);
  assert(legendCatalogue.includes(`\"${videoSlug}\"`), `${legendName} is not mapped to ${videoSlug}.mp4`);
  assert(fs.existsSync(videoPath), `Missing ${legendName} video: ${videoSlug}.mp4`);
  assert(fs.statSync(videoPath).size > 0, `${legendName} video is empty: ${videoSlug}.mp4`);
}

const route = read("app/statistica/page.tsx");
const entry = read("components/statistica/StatisticaEntry.tsx");
assert(route.includes("StatisticaEntry"), "Statistica route must use its canonical entry boundary");
assert(entry.includes("StatisticaMap"), "Statistica entry must render the Statistica map");
assert(entry.includes("SUPPORTED_LEVELS") && !entry.includes('"Prep"'), "Statistica entry must exclude Prep from level selection");
assert(entry.includes('restoreStudentStateFromServer(identity.studentId, "statistics")'), "Statistica entry must restore canonical student progress before rendering");
assert(!route.includes('teacher_preview !== "1"'), "Live Statistica route must not force teacher preview mode");

const carousel = read("components/realms/RealmCarousel.tsx");
assert(carousel.includes('current.id === "statistica"'), "Realm carousel must identify the Statistica realm");
assert(carousel.includes('router.push(`/world/statistica?teacher_preview=1&level=${encodeURIComponent(displayedLevel)}`)'), "Realm carousel must open Statistica preview in 3D");
assert(carousel.includes("if (isStatisticaPreview)"), "Realm carousel must let live Statistica use the shared live realm entry path");

const portalPreview = read("components/realms/RealmPortalPreview.tsx");
assert(portalPreview.includes('statistica: "/videos/realms/statistica.mp4"'), "Statistica carousel video must be mapped");
assert(!portalPreview.includes('realmId === "pattern-peaks" || realmId === "statistica"'), "Statistica carousel video must not be gated behind Level 3");

const map = read("components/world/StatisticaMap.tsx");
assert(map.includes("RealmDashboardShell"), "Statistica must use the shared realm dashboard shell");
assert(map.includes('districtModeLevels: ["Year 3", "Year 4", "Year 5", "Year 6"]'), "Statistica must use Start Adventure for Level 1-2 and District World for Level 3-6");
assert(map.includes('demo: {') && !map.includes("only: true"), "Live Statistica must not be forced into demo-only mode");
assert(map.includes("buildRealmProgramHref"), "Statistica world must route entry through the shared realm journey contract");
assert(map.includes('realmId: "statistics"'), "Statistica world must preserve its canonical realm scope");

const programRoute = read("app/program/page.tsx");
assert(programRoute.includes("requireSharedWeeklyProgramRealm"), "Shared weekly program must discover supported realms from the registry contract");
assert(programRoute.includes("getCurriculumPlan(year, genreIdForRealm(realmId))"), "Shared weekly program must load curriculum through the canonical realm mapping");
assert(programRoute.includes("getStatisticaBackground"), "Shared weekly program must use Statistica artwork");
assert(programRoute.includes("isStatisticsRealm"), "Shared weekly program must apply the Statistica theme contract");
for (const token of ['left: "4%"', 'top: "13%"', 'left: "calc(50% - 190px)"', 'top: "53%"', 'left: "68%"']) {
  assert(map.includes(token), `Statistica widget coordinate missing: ${token}`);
}

const statistica3dEntry = read("components/world3d/Statistica3DEntry.tsx");
const statistica3dWorld = read("components/world3d/StatisticaLevel3World.tsx");
const statistica3dEnvironment = read("components/world3d/StatisticaEnvironment.tsx");
assert(statistica3dEntry.includes('["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"]'), "Statistica 3D entry must support Levels 1-6");
assert(statistica3dWorld.includes('level === "Year 1" || level === "Year 2"'), "Statistica Level 2 must use the guided Start Adventure 3D flow");
assert(statistica3dWorld.includes('districtLayout: STATISTICA_DISTRICT_LAYOUT'), "Statistica Level 3 must use the shared district 3D layout");
assert(statistica3dEnvironment.includes("<StatisticaGround theme={theme} />"), "Statistica 3D ground must use the selected level theme");
assert(statistica3dEnvironment.includes('"/images/statistica-terrace-tile.png"'), "Statistica 3D ground must use the supplied marble terrace tile texture");
assert(statistica3dEnvironment.includes("summitTerrace ? 2.2 : 3"), "Statistica 3D ground must repeat the terrace tile so borders stay visible");
assert(statistica3dEnvironment.includes('theme.floorStyle === "cliffTerrace"'), "Statistica 3D ground must support the Level 5 cliff terrace");
assert(statistica3dEnvironment.includes('theme.floorStyle === "summitTerrace"'), "Statistica 3D ground must support the Level 6 summit terrace");
assert(statistica3dEnvironment.includes("planeGeometry args={cliffTerrace ? [104, 72] : [120, 80]}"), "Statistica 3D ground must read as a broad tiled terrace");
assert(statistica3dEnvironment.includes("boxGeometry args={cliffTerrace ? [104, 0.92, 1.35] : [120, 0.78, 1.1]}"), "Statistica 3D ground must have a raised terrace edge");
assert(!statistica3dEnvironment.includes("theme.background} /></Suspense>"), "Statistica 3D ground must not flatten the panorama asset onto the floor");

for (const forbidden of ["fetchGlobalXp", "award", "writeProgress", "writeProgramStore", "supabase.from", "Blueprint preview"]) {
  assert(!map.includes(forbidden), `Statistica preview must not perform progress writes: ${forbidden}`);
}

const previewControls = read("components/demo/DemoModeNavigationControls.tsx");
assert(previewControls.includes("Preview Mode"), "Shared realm preview controls must use Preview Mode language");
assert(previewControls.includes("Exit Preview"), "Shared realm preview controls must use Exit Preview language");

const lessonHome = read("components/lesson/RealmLessonHome.tsx");
assert(lessonHome.includes('RealmLessonThemeId = "number" | "measurement" | "statistics"'), "Shared lesson home must include the Statistica theme");
assert(lessonHome.includes('realmName: "Statistica"'), "Statistica lesson home must use the Statistica identity");
assert(lessonHome.includes("getStatisticaBackground"), "Statistica lesson home must use its level background artwork");
for (const widget of ["Data Briefing", "Today I am learning to...", "I can...", "Investigation Rewards", "Approximately 9 minutes"]) {
  assert(lessonHome.includes(widget), `Statistica lesson home is missing shared widget copy: ${widget}`);
}
assert(lessonHome.includes("startDisabled ? (startDisabledLabel ?? theme.startLabel) : theme.startLabel"), "Playable lessons must show the live start label instead of disabled preview copy");

const lessonRoute = read("app/statistica/lesson/[level]/[week]/[lesson]/page.tsx");
assert(lessonRoute.includes("getStatisticaProgramForYearLabel"), "Statistica lesson home must read canonical curriculum data");
assert(!lessonRoute.includes('teacher_preview !== "1"'), "Live Statistica lesson route must not force preview-only mode");
assert(lessonRoute.includes("StatisticaLessonShell"), "Statistica lesson route must render the shared lesson shell");

const lessonAdapter = read("components/statistica/StatisticaLessonShell.tsx");
const lessonHomeAdapter = read("components/statistica/StatisticaLessonHome.tsx");
assert(lessonAdapter.includes('realm="statistics"'), "Statistica lesson adapter must use the shared statistics theme");
assert(lessonAdapter.includes('realmId="statistics"'), "Statistica active lesson must pass its canonical realm into the shared runner");
assert(lessonAdapter.includes("RealmActiveLessonShell"), "Statistica active lesson must use the shared realm heading, navigation and content frame");
assert(lessonAdapter.includes("buildRealmProgramHref"), "Statistica lessons must return to the shared weekly-program home");
assert(lessonAdapter.includes('realmId: "statistics", year: level, week'), "Statistica lesson back navigation must preserve its level and week context");
assert(!lessonAdapter.includes("router.push(`/statistica?"), "Statistica active lessons must not return to the Start Adventure map");
assert(lessonHomeAdapter.includes("buildRealmProgramHref"), "Statistica lesson introductions must return to the shared weekly-program home");
assert(lessonHomeAdapter.includes('realmId: "statistics", year: level, week'), "Statistica lesson introductions must preserve their level and week context");
assert(!lessonHomeAdapter.includes("router.push(`/statistica?"), "Statistica lesson introductions must not return to the Start Adventure map");
assert(lessonAdapter.includes("getStatisticaLevel1TaskSet"), "Statistica Level 1 must use its real activity engine");
assert(lessonAdapter.includes("startDisabled={!getTask}"), "Unimplemented Statistica levels must remain disabled");

const starpathVisuals = read("lib/starpath-visuals.ts");
assert(!starpathVisuals.includes("statistica-home"), "Starpath visuals must not reference Statistica backgrounds");

console.log("Statistica home audit passed.");
