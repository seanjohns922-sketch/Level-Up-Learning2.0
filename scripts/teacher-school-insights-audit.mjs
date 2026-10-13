import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const migration = read("supabase/migrations/20260831160000_teacher_school_insights.sql");
const dashboard = read("components/school/SchoolAnalyticsDashboard.tsx");
const schoolHome = read("components/school/SchoolHomeClient.tsx");
const server = read("lib/school-platform-server.ts");
const teachersSeeSchool = read("supabase/migrations/20261014230000_teachers_see_school_students.sql");

const checks = [
  [
    "teachers receive the shared school analytics dashboard",
    /audience=\{isAdministrator \? "leadership" : "teacher"\}/.test(schoolHome) &&
      /teacherClassIds=\{myClasses\.map/.test(schoolHome),
  ],
  [
    // The My class view is about that class alone: no year filter, no "All
    // classes", and no Classes comparison tab. Teachers start on My class and
    // can switch to Whole school; leaders start on Whole school and get My
    // class when they teach a class. Leaders keep the Classes comparison tab.
    "My class view is scoped to the user's own classes without class comparison",
    /Class comparison/.test(dashboard) &&
      !/Compare classes/.test(dashboard) &&
      /label: "My class"/.test(dashboard) &&
      /label: "Whole school"/.test(dashboard) &&
      /viewAudience !== "teacher" \|\| item\.id !== "classes"/.test(dashboard) &&
      /useState<string>\(audience === "teacher" && hasMyClass \? "class" : "school"\)/.test(dashboard) &&
      /hasMyClass \? \[\{ id: "class", label: "My class" \}\]/.test(dashboard),
  ],
  [
    "unassigned classes open aggregate trends instead of students",
    /namesLimited && !isMyClass \? "overview" : "students"/.test(dashboard),
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
    // Teachers see every student at their school in analytics (names and
    // journeys), without widening can_view_student for the rest of RELIQ.
    "teachers see every student at their school in analytics only",
    /or public\.has_school_role\(p_school_id, array\['teacher'\]\)\s+or public\.can_view_student\(student_id\)/.test(teachersSeeSchool) &&
      /get_student_learning_journey[\s\S]*or public\.has_school_role\(p_school_id, array\['teacher'\]\)[\s\S]*Student is not entitled at this school/.test(teachersSeeSchool) &&
      !/function public\.can_view_student/.test(teachersSeeSchool),
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
