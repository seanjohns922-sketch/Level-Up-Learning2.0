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
const placementSource = read("lib/starpath-placement.ts")
  .replace(/import[\s\S]*?from "@\/lib\/starpath-levels";\n/, "")
  .replace(/import[\s\S]*?from "@\/lib\/starpath-routes";\n/, "");
const placement = await loadTypeScriptModule(`
  const STARPATH_REALM_ID = "space";
  const isGroundStarpathLevel = (level) => level === "ground";
  ${placementSource}
`);

const aliases = {
  ground: "ground",
  "Ground Level": "ground",
  Prep: "ground",
  "Level 1": "level-1",
  "level-2": "level-2",
  "Year 3": "level-3",
  y4: "level-4",
  "5": "level-5",
  year6: "level-6",
};
for (const [input, expected] of Object.entries(aliases)) {
  assert.equal(levels.normalizeStarpathLevel(input), expected, `${input} should map to ${expected}`);
}
assert.deepEqual([...levels.STARPATH_LEVEL_IDS], [
  "ground", "level-1", "level-2", "level-3", "level-4", "level-5", "level-6",
]);
assert.equal(levels.tryNormalizeStarpathLevel("Year 7"), null);
assert.equal(levels.tryNormalizeStarpathLevel("unknown"), null);
assert.throws(() => levels.normalizeStarpathLevel(undefined), /Unsupported Starpath level/);

const base = placement.createUnplacedStarpathPlacement({ studentId: "student-a" });
const atLevel = (workingLevel, overrides) => ({ ...base, workingLevel, ...overrides });
assert.equal(placement.deriveStarpathShellState(base), "unplaced");
assert.equal(placement.deriveStarpathShellState(atLevel("ground", {
  status: "program_ready",
  pathway: "full",
  preTestStatus: "not_required",
})), "ground-level");
assert.throws(() => placement.validateStarpathTeacherPlacement({
  realmId: "space",
  studentId: "student-a",
  classId: null,
  workingLevel: "ground",
  source: "teacher_assigned",
  entryMode: "pre_test",
}), /Ground Level does not use/);

for (const workingLevel of levels.STARPATH_LEVEL_IDS.slice(1)) {
  const candidate = atLevel(workingLevel, {
    status: "pre_test_required",
    pathway: "targeted",
    preTestStatus: "not_started",
  });
  assert.equal(placement.deriveStarpathShellState(candidate), "pre-test-required");
  assert.equal(placement.placementRequiresStarpathPreTest(candidate), true);
}

console.log("Starpath level audit passed: 7 canonical levels, strict aliases, and Ground/pre-test rules.");
