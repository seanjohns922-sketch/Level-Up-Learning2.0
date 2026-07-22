import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20260722113000_teacher_progress_overrides.sql"),
  "utf8",
);
const permissionFix = fs.readFileSync(
  path.join(root, "supabase/migrations/20260722114500_fix_progress_override_policy_permission.sql"),
  "utf8",
);
const panel = fs.readFileSync(path.join(root, "components/teacher/StrandStudentsPanel.tsx"), "utf8");
const dashboard = fs.readFileSync(path.join(root, "app/teacher/dashboard/page.tsx"), "utf8");
const compat = fs.readFileSync(path.join(root, "lib/realm-progress-compat.ts"), "utf8");

const checks = [
  ["override has a dedicated audit table", migration.includes("create table if not exists public.student_progress_overrides")],
  ["override reason is mandatory and constrained", migration.includes("reason text not null check")],
  ["class teachers and school administrators are authorised", migration.includes("can_manage_student_progress") && migration.includes("'school_admin'")],
  ["authenticated RLS policy can execute its permission helper", permissionFix.includes("grant execute on function public.can_manage_student_progress(uuid)") && permissionFix.includes("to authenticated")],
  ["only the canonical current week can advance", migration.includes("Only the student current week can be advanced")],
  ["placement must be resolved before advancement", migration.includes("active placed program")],
  ["override advances only week pointers", /set current_week = v_next_week,[\s\S]*assigned_week = v_next_week/.test(migration)],
  ["override creates no fake lesson attempts", !migration.includes("insert into public.student_lesson_attempts")],
  ["override creates no fake quiz attempts", !migration.includes("insert into public.student_weekly_quiz_attempts")],
  ["override creates no XP or collectible rewards", !migration.includes("student_economy") && !migration.includes("discover_realm_collectible")],
  ["student secure read hides sensitive reasons and notes", /returns table\([\s\S]*working_level text,[\s\S]*advanced_to_week integer,[\s\S]*created_at timestamptz[\s\S]*\)/.test(migration)],
  ["teacher UI requires a reason", panel.includes("Reason <span") && panel.includes("disabled={!advanceReason")],
  ["teacher UI explains no fabricated rewards", panel.includes("It does not create scores, attempts, XP or rewards")],
  ["teacher week displays a manual advancement badge", panel.includes('teacherAdvanced ? "Advanced"')],
  ["normal and teacher-advanced analytics are separate", dashboard.includes("completed normally") && dashboard.includes("teacher advanced")],
  ["canonical compatibility rows include override audit details", compat.includes("teacher_overrides")],
];

let failed = 0;
for (const [label, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
  if (!passed) failed += 1;
}

if (failed) {
  console.error(`\n${failed} teacher progress override check(s) failed.`);
  process.exit(1);
}

console.log(`\nTeacher progress override audit passed (${checks.length}/${checks.length}).`);
