import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const livePanel = fs.readFileSync(path.join(root, "components/teacher/LiveClassPanel.tsx"), "utf8");
const strandPanel = fs.readFileSync(path.join(root, "components/teacher/StrandStudentsPanel.tsx"), "utf8");
const dashboard = fs.readFileSync(path.join(root, "app/teacher/dashboard/page.tsx"), "utf8");
const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20260722100000_prevent_stale_live_activity_overwrites.sql"),
  "utf8",
);

const checks = [
  ["live cards reconcile append-only events", /resolveCurrentActivityRow[\s\S]*latestEvent/],
  ["live cards reconcile canonical attempts", /resolveCurrentActivityRow[\s\S]*latestAttempt/],
  ["week identity comes from event payload", /current_week: positiveNumberOrNull\(payload\.week\)/],
  ["missing canonical attempts do not fabricate attempt 1", /function buildCompletedActivityAttemptSummary[\s\S]*return null;/],
  ["student view compares progress and live timestamps", /function resolveDisplayedWeek[\s\S]*liveAt > progressAt/],
  ["teacher event feed includes quiz starts", dashboard.includes('"quiz_started"')],
  ["teacher event feed includes quiz completions", dashboard.includes('"quiz_completed"')],
  ["database rejects older snapshots", /where excluded\.last_active_at >= coalesce\([\s\S]*public\.live_student_activity\.last_active_at/],
  ["existing rows repair from latest event", /with latest_event as[\s\S]*update public\.live_student_activity/],
];

let failed = 0;
for (const [label, assertion] of checks) {
  const source = label.startsWith("student view") ? strandPanel
    : label.startsWith("database") || label.startsWith("existing") ? migration
      : livePanel;
  const passed = typeof assertion === "boolean" ? assertion : assertion.test(source);
  console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
  if (!passed) failed += 1;
}

if (failed) {
  console.error(`\n${failed} teacher week tally check(s) failed.`);
  process.exit(1);
}

console.log(`\nTeacher week tally audit passed (${checks.length}/${checks.length}).`);
