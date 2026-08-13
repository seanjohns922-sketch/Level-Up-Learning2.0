import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), "utf8");
const placement = read("components/teacher/PlacementManager.tsx");
const client = read("lib/realm-progress-compat.ts");
const destination = read("lib/student-destination.ts");
const home = read("app/home/page.tsx");
const migration = read("supabase/migrations/20260813130000_ground_level_skips_pretest.sql");

assert.match(placement, /if \(level === "Prep"\) return "ground_week1"/);
assert.match(placement, /entryModesForLevel\(level\)/);
assert.match(placement, /level !== "Prep" \? <button onClick=\{\(\) => onResetPretest\(s\)\}/);
assert.match(client, /assignedLevel === "Prep"[\s\S]*\? "ground_week1"/);
assert.match(destination, /buildGroundFirstLessonRoute[\s\S]*yearLabel: "Prep", week: 1, lessonNumber: 1, realmId: "number"/);
assert.match(home, /isGroundLevel[\s\S]*\? buildGroundFirstLessonRoute\(\)/);
assert.match(migration, /student_realm_placement_ground_entry_check/);
assert.match(migration, /Ground Level does not use a pre-test/);
assert.match(migration, /not exists \([\s\S]*student_lesson_attempts/);
assert.match(migration, /not exists \([\s\S]*student_weekly_quiz_attempts/);
assert.match(migration, /not exists \([\s\S]*student_realm_assessments/);

console.log("Ground Level entry audit passed: no pre-test placement, guarded resets and Week 1 first journey.");
