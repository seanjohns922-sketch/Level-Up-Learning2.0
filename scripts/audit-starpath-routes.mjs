import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const loadTypeScriptModule = async (source) => {
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
};

const levels = await loadTypeScriptModule(read("lib/starpath-levels.ts"));
const routeSource = read("lib/starpath-routes.ts")
  .replace(/import \{ getStarpathLevel, type StarpathLevelId \} from "@\/lib\/starpath-levels";\n/, "")
  .replace(
    "export const STARPATH_CAROUSEL_ID",
    'const getStarpathLevel = (level) => ({ yearLabel: level === "ground" ? "Prep" : `Year ${level.slice(-1)}` });\nexport const STARPATH_CAROUSEL_ID',
  );
const routes = await loadTypeScriptModule(routeSource);
const context = {
  selectedLevel: levels.normalizeStarpathLevel("Year 3"),
  placementLevel: levels.normalizeStarpathLevel("Level 2"),
};
const hrefs = [
  routes.buildStarpathRealmEntryHref(context),
  routes.buildStarpathWorldHref(context),
  routes.buildStarpathPlacementHref(context),
  routes.buildStarpathPreTestHref(context),
  routes.buildStarpathProgramHref(context),
  routes.buildStarpathLessonHref(context, 4, 2),
  routes.buildStarpathWeeklyQuizHref(context, 4),
  routes.buildStarpathPostTestHref(context),
];

for (const [index, href] of hrefs.entries()) {
  const url = new URL(href, "https://starpath.test");
  const expectedPath = index === 4
    ? "/program"
    : index === 5
      ? "/starpath/lesson/level-3/4/2"
      : index === 6
        ? "/starpath/quiz/level-3/4"
        : routes.STARPATH_WORLD_ROUTE;
  assert.equal(url.pathname, expectedPath);
  assert.equal(url.searchParams.get("realm_id"), routes.STARPATH_REALM_ID);
  if (index !== 5 && index !== 6) {
    assert.equal(url.searchParams.get("level"), "level-3");
    assert.equal(url.searchParams.get("placement_level"), "level-2");
  }
  assert.equal(href.includes("number-nexus"), false);
  assert.equal(href.includes("measurelands"), false);
}
assert.equal(new URL(hrefs[5], "https://starpath.test").searchParams.get("demo"), "1");
assert.equal(new URL(hrefs[6], "https://starpath.test").searchParams.get("demo"), "1");
assert.equal(new URL(hrefs[4], "https://starpath.test").searchParams.get("week"), "1");
assert.throws(() => levels.normalizeStarpathLevel("Level 8"), /Unsupported Starpath level/);

console.log("Starpath route audit passed: selected and placement levels survive every destination.");
