#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const adapter = read("lib/starpath-placement-adapter.ts");
const placement = read("lib/starpath-placement.ts");
const dashboard = read("components/world/StarpathMap.tsx");
const lessonPage = read("app/starpath/lesson/[level]/[week]/[lesson]/page.tsx");
const teacherMigration = read("supabase/migrations/20260718100000_fix_teacher_placement_persistence.sql");
const secureMigration = read("supabase/migrations/20260717213000_secure_student_completions.sql");

assert.match(adapter, /persistence: "unavailable"/);
assert.match(adapter, /space-specific database RPCs/);
assert.doesNotMatch(adapter, /supabase|student-progress-sync|realm-progress-compat|student_realm_progress/);
assert.match(placement, /realmId: typeof STARPATH_REALM_ID/);
assert.match(placement, /workingLevel: StarpathLevelId \| null/);
assert.match(placement, /source: StarpathPlacementSource/);
assert.match(placement, /status: StarpathPlacementStatus/);
assert.match(placement, /pathway: StarpathPathway/);
assert.match(placement, /assignedWeeks: number\[\]/);
assert.match(placement, /completedWeeks: number\[\]/);
assert.match(placement, /preTestStatus: StarpathAssessmentStatus/);
assert.match(placement, /postTestStatus: StarpathAssessmentStatus/);
assert.match(placement, /levelComplete: boolean/);
assert.match(placement, /nextLevelStatus: StarpathNextLevelStatus/);
assert.doesNotMatch(dashboard, /number-nexus|measurelands|restoreStudentStateFromServer/);
assert.match(dashboard, /storageRealmId: "space"/);
assert.match(lessonPage, /realmId !== STARPATH_REALM_ID/);
assert.doesNotMatch(lessonPage, /complete_realm|save_student|student_realm_progress/);

assert.match(teacherMigration, /p_realm_id not in \('number', 'measurement'\)/);
assert.match(secureMigration, /p_realm_id not in \('number', 'measurement'\)/);

console.log("Starpath placement isolation audit passed: persistence stays blocked until space-specific RPCs exist.");
