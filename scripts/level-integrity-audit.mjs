#!/usr/bin/env node
// Level Integrity Audit
// ---------------------
// Validates that every built Measurelands level satisfies the shared platform
// contract (see LEVEL_BUILD_STANDARD.md) so we stop hand-checking routing,
// registry and quiz plumbing on every new level/strand.
//
// Run: npm run qa:level-integrity   (node scripts/level-integrity-audit.mjs)
//
// Checks per level:
//   • Program shell exists (8 weeks × 3 lessons)
//   • Registry exists and exposes the standard API
//   • Every program lesson resolves in the registry (registry ↔ program aligned)
//   • Lesson IDs are unique and match y{n}-measurement-w{week}-l{lesson}
//   • realm_id=measurement preserved in routes and registry return routes
//   • Quiz contribution builders exist for Weeks 1–7
//   • Week 8 has NO weekly quiz (post-test instead)
//   • Post-test routing signalled on Week 8 Lesson 3
//   • Save/resume + dashboards are realm-aware (measurement ≠ number keys)

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const moduleCache = new Map();

function loadTsModule(relativePath) {
  const absPath = path.resolve(repoRoot, relativePath);
  if (moduleCache.has(absPath)) return moduleCache.get(absPath);

  const source = fs.readFileSync(absPath, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
    fileName: absPath,
  }).outputText;

  const loadedModule = { exports: {} };
  moduleCache.set(absPath, loadedModule.exports);
  const context = vm.createContext({
    module: loadedModule,
    exports: loadedModule.exports,
    require: (specifier) => {
      const fromDir = path.dirname(absPath);
      const target = specifier.startsWith("@/")
        ? path.resolve(repoRoot, specifier.slice(2))
        : specifier.startsWith(".")
        ? path.resolve(fromDir, specifier)
        : null;
      if (!target) {
        throw new Error(`Unexpected runtime require "${specifier}" while loading ${relativePath}`);
      }
      const withExt =
        fs.existsSync(target) && fs.statSync(target).isFile()
          ? target
          : fs.existsSync(`${target}.ts`)
          ? `${target}.ts`
          : fs.existsSync(path.join(target, "index.ts"))
          ? path.join(target, "index.ts")
          : null;
      if (!withExt) {
        throw new Error(`Unable to resolve "${specifier}" while loading ${relativePath}`);
      }
      return loadTsModule(path.relative(repoRoot, withExt));
    },
    process,
    console,
    __filename: absPath,
    __dirname: path.dirname(absPath),
  });

  new vm.Script(compiled, { filename: absPath }).runInContext(context);
  moduleCache.set(absPath, loadedModule.exports);
  return loadedModule.exports;
}

// ── Modules under audit ──────────────────────────────────────────────────────
const { getCurriculumPlan } = loadTsModule("data/programs/genres.ts");
const routing = loadTsModule("lib/lesson-routing.ts");

// Levels to audit. Add a row here when a new Measurelands level ships.
//
// `standard: true`  → held to the going-forward LEVEL_BUILD_STANDARD (per-lesson
//                     quiz builders for Weeks 1–7, Week 8 → post-test).
// `standard` unset   → legacy level that predates the standard (Prep ships 8
//                     weekly quizzes; Year 1 ends "All lessons complete"). These
//                     still run every universal check; standard-only differences
//                     are reported as notes, not failures.
// `scaffold: true`   → placeholder level (quiz builders not yet expected).
const LEVELS = [
  { year: "Prep", yn: 0, ns: "PrepMeasurelands", registry: "data/activities/prepMeasurelands/registry.ts" },
  { year: "Year 1", yn: 1, ns: "Y1Measurelands", registry: "data/activities/year1Measurelands/registry.ts" },
  { year: "Year 2", yn: 2, ns: "Y2Measurelands", registry: "data/activities/year2Measurelands/registry.ts", standard: true },
  { year: "Year 3", yn: 3, ns: "Y3Measurelands", registry: "data/activities/year3Measurelands/registry.ts", standard: true },
  { year: "Year 4", yn: 4, ns: "Y4Measurelands", registry: "data/activities/year4Measurelands/registry.ts", standard: true, scaffold: true },
];

const EXPECTED_WEEKS = 8;
const LESSONS_PER_WEEK = 3;

const failures = [];
const notes = [];
function fail(scope, msg) { failures.push(`${scope} | ${msg}`); }
function note(scope, msg) { notes.push(`${scope} | ${msg}`); }

function auditLevel(level) {
  const scope = `${level.year} (Measurelands)`;
  const reg = loadTsModule(level.registry);

  const isLessonId = reg[`is${level.ns}LessonId`];
  const getMeta = reg[`get${level.ns}LessonMeta`];
  const resolveTask = reg[`resolve${level.ns}LessonTask`];
  const reset = reg[`reset${level.ns}LessonSessionState`];

  // 2. Registry exists + standard API.
  for (const [name, fn] of Object.entries({ isLessonId, getMeta, resolveTask, reset })) {
    if (typeof fn !== "function") fail(scope, `registry missing ${name}()`);
  }
  if (typeof isLessonId !== "function" || typeof getMeta !== "function") return;

  // 1. Program shell exists.
  const program = getCurriculumPlan(level.year, "measurement");
  if (!Array.isArray(program) || program.length === 0) {
    fail(scope, "program shell is empty (getCurriculumPlan returned no weeks)");
    return;
  }
  if (program.length !== EXPECTED_WEEKS) {
    fail(scope, `expected ${EXPECTED_WEEKS} weeks, program has ${program.length}`);
  }

  const seenIds = new Set();
  const idPattern = new RegExp(`^y${level.yn}-measurement-w\\d+-l\\d+$`);

  for (const week of program) {
    const lessons = week.lessons ?? [];
    // 3/1. Lessons exist.
    if (lessons.length !== LESSONS_PER_WEEK) {
      fail(scope, `Week ${week.week} has ${lessons.length} lessons (expected ${LESSONS_PER_WEEK})`);
    }

    for (const lesson of lessons) {
      const id = lesson.id;

      // 4. Unique IDs.
      if (seenIds.has(id)) fail(scope, `duplicate lesson id ${id}`);
      seenIds.add(id);

      // 5. ID pattern + collision-safe vs Number Nexus.
      if (!idPattern.test(id)) fail(scope, `lesson id ${id} does not match y${level.yn}-measurement-w#-l#`);

      // 3. Registry ↔ program alignment.
      if (!isLessonId(id)) fail(scope, `lesson ${id} not recognised by registry`);
      const meta = getMeta(id);
      if (!meta) {
        fail(scope, `lesson ${id} has no registry meta`);
        continue;
      }

      // 6. realm_id preserved in the registry return route.
      if (!/realm_id=measurement/.test(meta.returnRoute ?? "")) {
        fail(scope, `lesson ${id} returnRoute missing realm_id=measurement`);
      }

      // 6b. resolveTask returns a Measurelands task (never null → no Number fallback).
      const task = resolveTask?.(id, "easy");
      if (!task) fail(scope, `lesson ${id} resolveTask returned null (would fall back to Number)`);

      const isLastWeek = week.week === EXPECTED_WEEKS;
      const isLastLesson = lesson.lesson === LESSONS_PER_WEEK;

      // 7. Quiz builders exist for Weeks 1–7 lessons (standard, non-scaffold only).
      if (level.standard && !level.scaffold && !isLastWeek && typeof meta.quizContributionBuilder !== "function") {
        fail(scope, `lesson ${id} missing quizContributionBuilder`);
      }

      // 8/9. Week 8 = post-test, not a weekly quiz (standard levels only).
      if (isLastWeek && isLastLesson) {
        if (level.standard) {
          if (/weekly quiz/i.test(meta.unlockMessage ?? "")) {
            fail(scope, `Week ${EXPECTED_WEEKS} Lesson ${LESSONS_PER_WEEK} unlocks a Weekly Quiz (should be Post-Test)`);
          }
          if (!/post-?test/i.test(meta.unlockMessage ?? "")) {
            fail(scope, `Week ${EXPECTED_WEEKS} Lesson ${LESSONS_PER_WEEK} does not signal Post-Test unlock`);
          }
        } else {
          note(scope, `legacy Week ${EXPECTED_WEEKS} ending ("${meta.unlockMessage ?? ""}") — predates Week 8 post-test standard`);
        }
      }
    }
  }

  // 6c. Route builder preserves realm_id.
  const route = routing.buildLessonRoute({ yearLabel: level.year, week: 1, lessonNumber: 1, realmId: "measurement" });
  if (!/realm_id=measurement/.test(route)) fail(scope, "buildLessonRoute drops realm_id=measurement");

  // 10. Save/resume + dashboards realm-aware: measurement lesson id ≠ number lesson id.
  const measId = routing.buildLessonId({ yearLabel: level.year, week: 1, lessonNumber: 1, realmId: "measurement" });
  const numId = routing.buildLessonId({ yearLabel: level.year, week: 1, lessonNumber: 1, realmId: "number" });
  if (measId === numId) fail(scope, "measurement and number lesson ids collide (progress would merge)");
  if (!measId.includes("-measurement-")) fail(scope, `measurement lesson id ${measId} is not realm-namespaced`);

  if (level.scaffold) note(scope, "scaffold level — placeholder lessons are non-runnable (no XP/save/completion)");
}

console.log("Level Integrity Audit — Measurelands\n");
for (const level of LEVELS) {
  try {
    auditLevel(level);
    console.log(`  checked ${level.year}`);
  } catch (error) {
    fail(`${level.year} (Measurelands)`, `threw during audit: ${error.message}`);
  }
}

if (notes.length) {
  console.log("\nNotes:");
  for (const n of notes) console.log(`  • ${n}`);
}

if (failures.length) {
  console.log(`\n❌ ${failures.length} integrity issue(s):`);
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(1);
}

console.log("\n✅ All levels pass the integrity contract.");
