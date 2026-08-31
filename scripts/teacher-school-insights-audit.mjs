import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const migration = read("supabase/migrations/20260831160000_teacher_school_insights.sql");
const dashboard = read("components/school/SchoolAnalyticsDashboard.tsx");
const schoolHome = read("components/school/SchoolHomeClient.tsx");
const server = read("lib/school-platform-server.ts");

const checks = [
  [
    "teachers receive the shared school analytics dashboard",
    /audience=\{isAdministrator \? "leadership" : "teacher"\}/.test(schoolHome) &&
      /teacherClassIds=\{myClasses\.map/.test(schoolHome),
  ],
  [
    "teacher analytics include explicit school class comparison",
    /Class comparison/.test(dashboard) &&
      /Compare classes/.test(dashboard) &&
      /My class/.test(dashboard),
  ],
  [
    "unassigned classes open aggregate trends instead of students",
    /audience === "teacher" && !isMyClass \? "overview" : "students"/.test(dashboard),
  ],
  [
    "school analytics accept active teachers without granting administration",
    /v_can_view_administration/.test(migration) &&
      /has_school_role\(p_school_id, array\['teacher'\]\)/.test(migration),
  ],
  [
    "named analytics students remain permission scoped",
    /where v_can_view_administration\s+or public\.can_view_student\(student_id\)/.test(migration),
  ],
  [
    "whole-school placement uses anonymous analysis rows",
    /'analysisStudents'/.test(migration) &&
      !/'name', student_name[\s\S]{0,300}'analysisStudents'/.test(migration) &&
      /snapshot\?\.analysisStudents \?\? snapshot\?\.students/.test(dashboard) &&
      /analysisStudents: Array/.test(server),
  ],
  [
    "student journeys enforce existing student visibility",
    /get_student_learning_journey[\s\S]*can_view_student\(p_student_id\)/.test(migration),
  ],
  [
    "Statistica is available in the realm filter",
    /statistics: "Statistica"/.test(dashboard),
  ],
];

const failures = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
}

console.log(`\n${checks.length - failures.length}/${checks.length} checks passed.`);
if (failures.length > 0) process.exitCode = 1;
