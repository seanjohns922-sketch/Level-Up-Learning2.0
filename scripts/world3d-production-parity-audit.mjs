import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const storage = new Map();
globalThis.window = {
  location: { pathname: "/world", search: "" },
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  },
  sessionStorage: {
    getItem: (key) => storage.get(`session:${key}`) ?? null,
    setItem: (key, value) => storage.set(`session:${key}`, String(value)),
    removeItem: (key) => storage.delete(`session:${key}`),
  },
};
globalThis.localStorage = globalThis.window.localStorage;
globalThis.sessionStorage = globalThis.window.sessionStorage;

const { ACTIVE_STUDENT_KEY, writeProgress } = await import("../data/progress.ts");
const { resolveCanonicalNextActivity } = await import("../lib/canonical-next-activity.ts");
const { makeProgramProgressKey, writeProgramStore } = await import("../lib/program-progress.ts");
const { resolveRealmEntryRoute } = await import("../lib/realm-entry.ts");
const { getRealmWorldState } = await import("../lib/world3d/realm-world-state.ts");

localStorage.setItem(ACTIVE_STUDENT_KEY, "world3d-parity-fixture");
const districts = [
  { id: "early", label: "Early", weeks: [1, 2, 3], accent: "#fff", motif: "A" },
  { id: "middle", label: "Middle", weeks: [4, 5, 6], accent: "#fff", motif: "B" },
  { id: "later", label: "Later", weeks: [7, 8], accent: "#fff", motif: "C" },
];

for (const realmId of ["number", "measurement", "space"]) {
  storage.clear();
  localStorage.setItem(ACTIVE_STUDENT_KEY, "world3d-parity-fixture");
  const progress = {
    year: "Year 4",
    scorePercent: 52,
    status: "ASSIGNED_PROGRAM",
    placementComplete: true,
    assignedWeek: 5,
    requiredWeeks: [2, 5, 7],
    optionalWeeks: [],
    unlockedLegends: [],
  };
  const store = {
    [makeProgramProgressKey("Year 4", 2, realmId)]: { lessonsCompleted: [true, true, true], quizCompleted: true, quizBestScore: 80 },
    [makeProgramProgressKey("Year 4", 5, realmId)]: { lessonsCompleted: [true, false, false], quizCompleted: false },
  };
  writeProgress(progress, realmId);
  writeProgramStore(store);

  const canonical = resolveCanonicalNextActivity({ realmId, progress, store });
  const world = getRealmWorldState({ realmId, level: "Year 4", totalWeeks: 8, districts });
  assert.equal(world.level, progress.year, `${realmId}: level parity`);
  assert.deepEqual(world.playableWeeks, [2, 5], `${realmId}: targeted playable weeks`);
  assert.deepEqual(world.completedWeeks, [2], `${realmId}: completed weeks`);
  assert.equal(world.currentWeek, 5, `${realmId}: current week`);
  assert.equal(world.weekNodes.find((node) => node.week === 2)?.state, "completed", `${realmId}: completed gate`);
  assert.equal(world.weekNodes.find((node) => node.week === 5)?.state, "current", `${realmId}: current gate`);
  assert.equal(world.weekNodes.find((node) => node.week === 7)?.state, "locked", `${realmId}: locked gate`);
  assert.equal(world.nextActivity.route, canonical.route, `${realmId}: Quick Start route`);
  assert.equal(canonical.type, "lesson", `${realmId}: lesson next`);
  assert.equal(canonical.lessonNumber, 2, `${realmId}: lesson completion parity`);

  const quizStore = { ...store, [makeProgramProgressKey("Year 4", 5, realmId)]: { lessonsCompleted: [true, true, true], quizCompleted: false } };
  assert.equal(resolveCanonicalNextActivity({ realmId, progress, store: quizStore }).type, "quiz", `${realmId}: quiz readiness`);

  const posttestStore = {
    ...quizStore,
    [makeProgramProgressKey("Year 4", 5, realmId)]: { lessonsCompleted: [true, true, true], quizCompleted: true, quizBestScore: 80 },
    [makeProgramProgressKey("Year 4", 7, realmId)]: { lessonsCompleted: [true, true, true], quizCompleted: true, quizBestScore: 80 },
  };
  assert.equal(resolveCanonicalNextActivity({ realmId, progress, store: posttestStore }).type, "posttest", `${realmId}: post-test readiness`);
  assert.equal(resolveCanonicalNextActivity({ realmId, progress: { ...progress, status: "PASSED" }, store: posttestStore }).type, "realm-complete", `${realmId}: realm completion`);
  assert.match(resolveRealmEntryRoute({ realmId, progress: { ...progress, placementComplete: false }, fallbackYear: "Year 4", introSeen: true }), /^\/pretest/, `${realmId}: pre-test route`);
}

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const worldFiles = [
  "components/world3d/NumberNexusLevel3World.tsx",
  "components/world3d/MeasurelandsLevel3World.tsx",
  "components/world3d/SharedRealmWorld3D.tsx",
];
for (const file of worldFiles) {
  const source = read(file);
  assert.match(source, /resolveWorldJourney/, `${file}: canonical Quick Start resolver`);
  assert.doesNotMatch(source, /saveRealmLessonAttempt|saveRealmAssessment|saveStudentProgressState|markLessonComplete|markQuizComplete|supabase\.rpc/, `${file}: world must not write learning state`);
}

const worldSources = fs.readdirSync(path.join(root, "components/world3d"))
  .filter((name) => name.endsWith(".tsx"))
  .map((name) => read(path.join("components/world3d", name)))
  .join("\n");
assert.doesNotMatch(worldSources, /3dProgress|worldCompleted|worldLesson|worldXP/, "No duplicate 3D learning store");
assert.match(read("components/world3d/CentralWorld3DEntry.tsx"), /restoreCanonicalWorldState/, "Central World blocks on canonical restore");
assert.match(read("components/world3d/TowerRealmChamber3DEntry.tsx"), /restoreCanonicalWorldState/, "Tower blocks on canonical restore");
assert.match(read("lib/world3d/access.ts"), /NEXT_PUBLIC_ENABLE_REALM_3D[\s\S]*isDemoPreviewMode/, "Global kill switch precedes preview access");
assert.doesNotMatch(read("lib/world3d/access.ts"), /isLocalOverrideEnabled|local-override/, "Production local access bypass removed");
assert.match(read("app/results/page.tsx"), /getWorld3DReturnPathForPosttest/, "Post-test results preserve the 3D return path");
for (const file of worldFiles) {
  assert.match(read(file), /rememberWorld3DPosttestEntry/, `${file}: Quick Start preserves post-test return context`);
}

console.log("World 3D production parity audit passed for Number Nexus, Measurelands, and Starpath.");
