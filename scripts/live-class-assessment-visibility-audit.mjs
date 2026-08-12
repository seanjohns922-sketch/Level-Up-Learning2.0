import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const failures = [];

function requireText(source, expected, message) {
  if (!source.includes(expected)) failures.push(message);
}

const tracker = read("components/student/ActiveLearningTracker.tsx");
const panel = read("components/teacher/LiveClassPanel.tsx");
const liveClient = read("lib/live-class-client.ts");
const migration = read("supabase/migrations/20260812140000_include_assessments_in_live_class.sql");

requireText(tracker, 'context === "pretest" || context === "posttest"', "Assessment routes do not publish Live Class presence.");
requireText(tracker, 'eventType: "activity_started"', "Assessment presence does not use canonical live activity telemetry.");
requireText(panel, '"activity_started"', "Live Class excludes assessment start events.");
requireText(panel, 'get_live_class_activity_today', "Live Class does not load the canonical active-today fallback.");
requireText(panel, "active now", "Live Class does not distinguish active-now from active-today totals.");
requireText(panel, "active today", "Live Class does not display the active-today total.");
requireText(panel, "Promise.all", "Live Class data sources are not loaded concurrently.");
requireText(liveClient, "isAssessmentStart", "Assessment starts do not clear stale lesson presentation state.");
requireText(migration, "public.can_view_class(p_class_id)", "The activity fallback is not protected by class access.");
requireText(migration, "public.student_activity_daily", "The activity fallback does not use canonical daily activity.");
requireText(migration, "student.archived_at is null", "Archived students are included in Live Class activity.");

if (failures.length > 0) {
  console.error(`Live Class assessment visibility audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Live Class assessment visibility audit passed: pre/post-tests publish presence and canonical daily activity is visible.");
