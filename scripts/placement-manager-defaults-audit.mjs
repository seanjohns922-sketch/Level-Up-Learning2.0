import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(
  path.join(process.cwd(), "components/teacher/PlacementManager.tsx"),
  "utf8",
);

assert.match(
  source,
  /savedLevelIsSupported \|\| hasRealmProgress \|\| next\[student\.id\]/,
  "Only new or unsupported placement rows should receive automatic defaults.",
);
assert.match(
  source,
  /const level = supportedLevel\(realmId, schoolYearOf\(student\)\);[\s\S]*entry: level === "Prep" \? "ground_week1" : "pretest"/,
  "New placement rows must persist a school-year default supported by the selected realm.",
);
assert.match(source, /if \(level === "Prep"\) return "ground_week1"/);
assert.match(source, /entryModesForLevel\(level\)/);
assert.match(
  source,
  /levelLabels: realm\.levelLabels/,
  "Placement level choices must come from each realm's supported curriculum levels.",
);
assert.match(
  source,
  /activeLevelCatalog\.map/,
  "Statistica must not offer its unsupported Prep level.",
);
assert.match(
  source,
  /savedLevelIsSupported/,
  "A legacy placement on an unsupported realm level must be corrected rather than counted as valid.",
);
assert.match(
  source,
  /database migration must be deployed/,
  "Database realm drift must produce an actionable teacher-facing error.",
);
assert.match(source, /level !== "Prep" \? <button onClick=\{\(\) => onResetPretest\(s\)\}/);
for (const key of ["surname", "schoolYear", "assignedStart", "currentProgress"]) {
  assert.match(source, new RegExp(`toggleSort\\("${key}"\\)`));
}
assert.match(source, /s\.last_name\?\.trim\(\)/);
assert.match(
  source,
  /const rosterStudentIds = useMemo\([\s\S]*new Set\(students\.map\(\(student\) => student\.id\)\)/,
  "Placement totals must use unique IDs from the current class roster.",
);
assert.match(
  source,
  /\.filter\(\(studentId\) => rosterStudentIds\.has\(studentId\)\)/,
  "Progress from students outside the current roster must not count as placed.",
);
assert.match(
  source,
  /placement\.realm_id === id && rosterStudentIds\.has\(placement\.student_id\)/,
  "Saved placements from students outside the current roster must not count as placed.",
);
assert.match(
  source,
  /Math\.max\(0, rosterStudentIds\.size - placed\)/,
  "Need-placement totals must never become negative.",
);

const roster = new Set(["current-a", "current-b"]);
const returnedStudentIds = ["current-a", "current-b", "stale-student"];
const placed = new Set(returnedStudentIds.filter((studentId) => roster.has(studentId))).size;
assert.equal(placed, 2);
assert.equal(Math.max(0, roster.size - placed), 0);

console.log("Placement manager defaults and sorting audit passed.");
