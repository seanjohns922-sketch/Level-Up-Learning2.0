import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { registry, renderStarpathCurriculumMap, repoRoot } from "./starpath-curriculum-utils.mjs";

const expectedLevels = ["ground", "level-1", "level-2", "level-3", "level-4", "level-5", "level-6"];
assert.equal(registry.STARPATH_PROGRAMS.length, 7);
assert.deepEqual(registry.STARPATH_PROGRAMS.map((program) => program.level), expectedLevels);
assert.equal(registry.STARPATH_WEEK_COUNT, 8);

const groundProgram = registry.STARPATH_PROGRAM_BY_LEVEL.ground;
assert.equal(groundProgram.assessments.preTest, null);
assert.deepEqual(
  groundProgram.weeks.map((week) => week.title),
  [
    "Shape Spotters",
    "Shape Builders",
    "Shape Sorters",
    "Shapes Around Us",
    "Space Positions",
    "Space Adventures",
    "Build Starpath",
    "Space Graduation",
  ],
);
assert.deepEqual(
  groundProgram.weeks.map((week) => week.lessons.map((lesson) => lesson.title)),
  [
    ["Meet the Shapes", "Shape Detectives", "Shape Masters"],
    ["Build with Shapes", "Shape Creators", "Space Builders"],
    ["Sort by Shape", "What's Different?", "Shape Families"],
    ["Space Objects", "Home Objects", "Treasure Hunt"],
    ["Above, Below, Beside", "In, On, Under, Behind", "Move the Object"],
    ["Guide the Rocket", "Help Geospin", "Hidden Treasure"],
    ["Build a Planet", "Create a Space Scene", "Describe Your Picture"],
    ["Shape Explorer Challenge", "Position Explorer Challenge", "Geospin's Final Mission"],
  ],
);
assert.match(groundProgram.progressionRationale, /Ground Level Starpath Graduate title/);

const ids = new Set();
for (const program of registry.STARPATH_PROGRAMS) {
  assert.equal(program.realmId, "space");
  assert.equal(program.status, "planned");
  assert.equal(program.weeks.length, 8, `${program.level} must have exactly 8 weeks`);
  assert.equal(program.skills.length, 8, `${program.level} must expose one stable reporting skill per week`);
  assert.equal(program.assessments.preTest === null, program.level === "ground");
  assert.equal(program.assessments.postTest.questionCount, 20);
  assert.equal(program.assessments.postTest.unlockAfterLessonId, `${program.programId}-w8-l3`);

  for (const week of program.weeks) {
    assert.equal(week.lessons.length, 3);
    assert.deepEqual(week.lessons.map((lesson) => lesson.sequenceRole), ["build", "develop", "apply"]);
    assert.ok(week.quiz, `${program.level} week ${week.week} must have a weekly quiz`);
    assert.equal(week.quiz.questionCount, 15);
    for (const lesson of week.lessons) {
      assert.equal(lesson.activityMechanics.length, 3, `${lesson.id} must plan exactly three activities`);
      assert.match(lesson.id, /^(ground|y[1-6])-space-w[1-8]-l[1-3]$/);
      assert.equal(ids.has(lesson.id), false, `Duplicate lesson ID ${lesson.id}`);
      ids.add(lesson.id);
    }
  }
}

assert.equal(registry.STARPATH_SKILLS.length, 56);
assert.equal(new Set(registry.STARPATH_SKILLS.map((skill) => skill.id)).size, registry.STARPATH_SKILLS.length);

const accessSource = fs.readFileSync(path.join(repoRoot, "lib/starpath-program-access.ts"), "utf8")
  .replace(/import[\s\S]*?from "@\/data\/starpath\/program-registry";\n/, "")
  .replace(/import type[\s\S]*?from "@\/lib\/starpath-levels";\n/, "");
const accessOutput = ts.transpileModule(`
  const STARPATH_WEEK_COUNT = 8;
  const registry = ${JSON.stringify({ STARPATH_PROGRAM_BY_LEVEL: registry.STARPATH_PROGRAM_BY_LEVEL })};
  const getStarpathProgram = (level) => registry.STARPATH_PROGRAM_BY_LEVEL[level];
  ${accessSource}
`, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const access = await import(`data:text/javascript;base64,${Buffer.from(accessOutput).toString("base64")}#${Date.now()}`);
assert.deepEqual(access.resolveStarpathPathway(90).requiredWeeks, []);
assert.deepEqual(access.resolveStarpathPathway(70, [6, 2, 6, 9]).requiredWeeks, [2, 6]);
assert.equal(access.resolveStarpathPathway(49).requiredWeeks.length, 8);
assert.equal(access.resolveStarpathPathway(null).requiredWeeks.length, 8);
for (const program of registry.STARPATH_PROGRAMS) {
  const programAccess = access.getStarpathProgramAccess(program.level);
  assert.equal(programAccess.weekCount, 8);
  assert.equal(programAccess.playable, false);
  assert.equal(programAccess.persistenceReady, false);
}

const docPath = path.join(repoRoot, "docs/starpath/starpath-curriculum-map.md");
assert.equal(fs.readFileSync(docPath, "utf8"), renderStarpathCurriculumMap(), "Curriculum document is stale; run npm run generate:starpath-curriculum");

for (const file of ["lib/program-progress.ts", "lib/program-weeks.ts", "lib/assessment-routes.ts", "lib/student-progress-sync.ts", "app/session/page.tsx"]) {
  const source = fs.readFileSync(path.join(repoRoot, file), "utf8");
  assert.equal(source.includes("STARPATH_PROGRAMS"), false, `${file} must not consume Starpath until it explicitly supports space`);
}

console.log("Starpath curriculum audit passed: 7 levels, 56 weeks, 168 planned lessons, 56 quizzes, 56 skills, and isolated 8-week access rules.");
