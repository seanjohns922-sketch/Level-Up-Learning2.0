import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const migrationPath = path.join(
  root,
  "supabase/migrations/20260914133000_allow_school_teachers_manage_student_learning.sql",
);
const migration = fs.readFileSync(migrationPath, "utf8");

const checks = [
  [
    "defines a dedicated student-learning permission boundary",
    migration.includes("can_manage_school_student_learning"),
  ],
  [
    "allows active teachers, principals and school administrators",
    migration.includes("membership.status = 'active'") &&
      migration.includes("('teacher', 'principal', 'school_admin')"),
  ],
  [
    "requires an active school",
    migration.includes("school.status = 'active'"),
  ],
  [
    "matches both canonical and legacy class relationships",
    migration.includes("membership.school_id = student.school_id") &&
      migration.includes("public.class_enrollments") &&
      migration.includes("student.class_id"),
  ],
  [
    "routes legacy placement checks through the shared boundary",
    /function public\.teacher_owns_student[\s\S]*can_manage_school_student_learning/.test(
      migration,
    ),
  ],
  [
    "routes progression checks through the shared boundary",
    /function public\.can_manage_student_progress[\s\S]*can_manage_school_student_learning/.test(
      migration,
    ) &&
      /function public\.can_override_student_progress[\s\S]*can_manage_school_student_learning/.test(
        migration,
      ),
  ],
  [
    "does not broaden school administration permissions",
    !migration.includes("create or replace function public.can_manage_school(") &&
      !migration.includes("create or replace function public.can_manage_student("),
  ],
];

let failed = false;
for (const [label, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
  failed ||= !passed;
}

if (failed) process.exit(1);
