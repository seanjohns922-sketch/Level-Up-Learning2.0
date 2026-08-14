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

const visualMap = read("lib/statistica-visuals.ts");
for (const assetName of assetNames) {
  assert(visualMap.includes(`/images/${assetName}`), `Statistica visual map does not reference ${assetName}`);
}

const route = read("app/statistica/page.tsx");
assert(route.includes("StatisticaMap"), "Statistica route must render the Statistica map");
assert(route.includes('entry.id !== "Prep"'), "Statistica route must exclude Prep from level selection");
assert(route.includes('teacher_preview !== "1"'), "Statistica route must force teacher preview mode while blueprint-only");

const carousel = read("components/realms/RealmCarousel.tsx");
assert(carousel.includes('current.id === "statistica"'), "Realm carousel must identify the Statistica realm");
assert(carousel.includes('router.push(`/statistica?teacher_preview=1&level=${encodeURIComponent(displayedLevel)}`)'), "Realm carousel must route Statistica preview into the Statistica map");

const portalPreview = read("components/realms/RealmPortalPreview.tsx");
assert(portalPreview.includes('statistica: "/videos/realms/statistica.mp4"'), "Statistica carousel video must be mapped");
assert(!portalPreview.includes('realmId === "pattern-peaks" || realmId === "statistica"'), "Statistica carousel video must not be gated behind Level 3");

const map = read("components/world/StatisticaMap.tsx");
assert(map.includes("RealmDashboardShell"), "Statistica must use the shared realm dashboard shell");
assert(map.includes('districtModeLevels: ["Year 3", "Year 4", "Year 5", "Year 6"]'), "Statistica must use Start Adventure for Level 1-2 and District World for Level 3-6");
assert(map.includes('demo: {') && map.includes("only: true"), "Statistica must remain preview-only until production progression exists");
assert(map.includes("buildRealmProgramHref"), "Statistica world must route entry through the shared realm journey contract");
assert(map.includes('realmId: "statistics"'), "Statistica world must preserve its canonical realm scope");

const programRoute = read("app/program/page.tsx");
assert(programRoute.includes("requireSharedWeeklyProgramRealm"), "Shared weekly program must discover supported realms from the registry contract");
assert(programRoute.includes("getCurriculumPlan(year, realmId)"), "Shared weekly program must load curriculum by canonical realm");
assert(programRoute.includes("getStatisticaBackground"), "Shared weekly program must use Statistica artwork");
assert(programRoute.includes("isStatisticsRealm"), "Shared weekly program must apply the Statistica theme contract");
for (const token of ['left: "4%"', 'top: "14%"', 'left: "5%"', 'top: "58%"', 'left: "68%"']) {
  assert(map.includes(token), `Statistica widget coordinate missing: ${token}`);
}

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

const lessonRoute = read("app/statistica/lesson/[level]/[week]/[lesson]/page.tsx");
assert(lessonRoute.includes("getStatisticaProgramForYearLabel"), "Statistica lesson home must read canonical curriculum data");
assert(lessonRoute.includes('teacher_preview !== "1"'), "Statistica lesson home must remain preview-only");
assert(lessonRoute.includes("StatisticaLessonHome"), "Statistica lesson route must render the shared lesson-home adapter");

const lessonAdapter = read("components/statistica/StatisticaLessonHome.tsx");
assert(lessonAdapter.includes('realm="statistics"'), "Statistica lesson adapter must use the shared statistics theme");
assert(lessonAdapter.includes("startDisabled"), "Statistica lesson activity must stay disabled until its real engine is implemented");

const starpathVisuals = read("lib/starpath-visuals.ts");
assert(!starpathVisuals.includes("statistica-home"), "Starpath visuals must not reference Statistica backgrounds");

console.log("Statistica home audit passed.");
