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
for (const token of ['left: "4%"', 'top: "14%"', 'left: "5%"', 'top: "58%"', 'left: "68%"']) {
  assert(map.includes(token), `Statistica widget coordinate missing: ${token}`);
}

for (const forbidden of ["fetchGlobalXp", "award", "writeProgress", "writeProgramStore", "supabase.from", "Blueprint preview"]) {
  assert(!map.includes(forbidden), `Statistica preview must not perform progress writes: ${forbidden}`);
}

const previewControls = read("components/demo/DemoModeNavigationControls.tsx");
assert(previewControls.includes("Preview Mode"), "Shared realm preview controls must use Preview Mode language");
assert(previewControls.includes("Exit Preview"), "Shared realm preview controls must use Exit Preview language");

const starpathVisuals = read("lib/starpath-visuals.ts");
assert(!starpathVisuals.includes("statistica-home"), "Starpath visuals must not reference Statistica backgrounds");

console.log("Statistica home audit passed.");
