import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  pretestPathwayForPercent,
  pretestStartingWeekForPercent,
} from "../lib/assessment-rules.ts";

assert.equal(pretestPathwayForPercent(45), "full");
assert.equal(pretestStartingWeekForPercent(45, [2, 4, 7]), 1);
assert.equal(pretestStartingWeekForPercent(49, [6]), 1);

assert.equal(pretestPathwayForPercent(50), "targeted");
assert.equal(pretestStartingWeekForPercent(50, [6, 2, 4]), 2);
assert.equal(pretestStartingWeekForPercent(84, [5, 3]), 3);
assert.equal(pretestStartingWeekForPercent(70, []), 1);

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260728100000_fix_full_path_pretest_start_week.sql"),
  "utf8",
);

assert.match(migration, /assessment_percent < 50/);
assert.match(migration, /'current_week', 1/);
assert.match(migration, /not exists \(\s*select 1\s*from public\.student_lesson_attempts/s);
assert.match(migration, /not exists \(\s*select 1\s*from public\.student_weekly_quiz_attempts/s);
assert.match(migration, /not exists \(\s*select 1\s*from public\.student_progress_overrides/s);

console.log("Pre-test pathway assignment audit passed.");
