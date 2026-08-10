import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(
  path.join(process.cwd(), "components/teacher/PlacementManager.tsx"),
  "utf8",
);

assert.match(
  source,
  /hasSavedPlacement \|\| hasRealmProgress \|\| next\[student\.id\]/,
  "Only genuinely new placement rows should receive automatic defaults.",
);
assert.match(
  source,
  /level: schoolYearOf\(student\),[\s\S]*entry: "pretest"/,
  "New placement rows must persist the student's school-year default.",
);
for (const key of ["surname", "schoolYear", "assignedStart", "currentProgress"]) {
  assert.match(source, new RegExp(`toggleSort\\("${key}"\\)`));
}
assert.match(source, /s\.last_name\?\.trim\(\)/);

console.log("Placement manager defaults and sorting audit passed.");
