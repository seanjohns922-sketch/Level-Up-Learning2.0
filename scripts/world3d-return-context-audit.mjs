import assert from "node:assert/strict";

class SessionStorageMock {
  #items = new Map();

  getItem(key) {
    return this.#items.get(key) ?? null;
  }

  removeItem(key) {
    this.#items.delete(key);
  }

  setItem(key, value) {
    this.#items.set(key, String(value));
  }
}

globalThis.window = { sessionStorage: new SessionStorageMock() };

const {
  clearWorld3DReturnContext,
  getWorld3DReturnPathForLesson,
  getWorld3DReturnPathForPosttest,
  getWorld3DReturnPathForQuiz,
  getWorld3DReturnPathForWeek,
  preserveWorld3DReturnContextForLesson,
  preserveWorld3DReturnContextForQuiz,
  readWorld3DReturnContext,
  rememberWorld3DWeekEntry,
  rememberWorld3DPosttestEntry,
} = await import("../lib/world3d/return-context.ts");

const weekEntry = {
  realmId: "number",
  level: "Year 3",
  districtId: "number-l3-number-bridge",
  week: 4,
  spawnPointId: "number-l3-number-bridge-return",
  returnHref: "/world/number-nexus?spawn=number-l3-number-bridge-return&district=number-l3-number-bridge",
};

rememberWorld3DWeekEntry(weekEntry);
assert.deepEqual(
  { ...readWorld3DReturnContext(), createdAt: 0 },
  { source: "3d", ...weekEntry, createdAt: 0 },
  "A week gate should save one transient 3D origin object",
);
assert.equal(
  getWorld3DReturnPathForWeek({ realmId: "number", level: "Year 3", week: 4 }),
  weekEntry.returnHref,
  "Back to Map should return directly to the originating 3D district",
);
assert.equal(
  getWorld3DReturnPathForWeek({ realmId: "number", level: "Year 3", week: 5 }),
  null,
  "A different week must retain its normal 2D map fallback",
);

preserveWorld3DReturnContextForLesson({
  realmId: "number",
  level: "Year 3",
  week: 5,
  lessonNumber: 1,
  lessonId: "y3-w5-l1",
});
assert.equal(readWorld3DReturnContext()?.activity, undefined, "A different week must not inherit the return");

preserveWorld3DReturnContextForLesson({
  realmId: "number",
  level: "Year 3",
  week: 4,
  lessonNumber: 2,
  lessonId: "y3-w4-l2",
});
assert.equal(
  getWorld3DReturnPathForLesson({
    realmId: "number",
    level: "Year 3",
    week: 4,
    lessonNumber: 2,
    lessonId: "y3-w4-l2",
  }),
  weekEntry.returnHref,
  "Lesson completion should return to the exact district spawn",
);

preserveWorld3DReturnContextForQuiz({ realmId: "number", level: "Year 3", week: 4 });
assert.equal(
  getWorld3DReturnPathForQuiz({ realmId: "number", level: "Year 3", week: 4 }),
  weekEntry.returnHref,
  "Quiz completion should return to the exact district spawn",
);
assert.equal(
  getWorld3DReturnPathForLesson({
    realmId: "number",
    level: "Year 3",
    week: 4,
    lessonNumber: 2,
    lessonId: "y3-w4-l2",
  }),
  null,
  "The active quiz must not be mistaken for a lesson return",
);

rememberWorld3DPosttestEntry(weekEntry);
assert.equal(
  getWorld3DReturnPathForPosttest({ realmId: "number", level: "Year 3" }),
  weekEntry.returnHref,
  "Post-test completion should return to the exact 3D realm origin",
);
assert.equal(
  getWorld3DReturnPathForPosttest({ realmId: "measurement", level: "Year 3" }),
  null,
  "A post-test must not inherit another realm's return path",
);

clearWorld3DReturnContext();
assert.equal(readWorld3DReturnContext(), null, "Entering the restored world should consume the transient context");

console.log("World 3D return-context audit passed.");
