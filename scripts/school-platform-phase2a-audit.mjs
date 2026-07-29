import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const foundationPath = path.join(
  root,
  "supabase/migrations/20260729110000_school_authorisation_tenancy_foundation.sql",
);
const commandsPath = path.join(
  root,
  "supabase/migrations/20260729111000_school_authorisation_commands.sql",
);
const serverGuardPath = path.join(root, "lib/school-platform-server.ts");
const routePath = path.join(root, "app/school/[schoolId]/page.tsx");
const loginPath = path.join(root, "app/login/page.tsx");

const foundation = fs.readFileSync(foundationPath, "utf8");
const commands = fs.readFileSync(commandsPath, "utf8");
const serverGuard = fs.readFileSync(serverGuardPath, "utf8");
const route = fs.readFileSync(routePath, "utf8");
const login = fs.readFileSync(loginPath, "utf8");

const checks = [
  ["canonical user profiles", /create table if not exists public\.user_profiles/i.test(foundation)],
  ["platform roles", /platform_owner.*platform_admin.*platform_support/s.test(foundation)],
  ["academic years", /create table if not exists public\.academic_years/i.test(foundation)],
  ["multi-class enrolment", /class_enrollments_one_primary_per_year_idx/i.test(foundation)],
  ["class staff memberships", /lead_teacher.*support_staff.*viewer/s.test(foundation)],
  ["student-specific support assignment", /create table if not exists public\.student_staff_assignments/i.test(foundation)],
  ["student access does not depend on auth user columns", !/\bs\.user_id\b/.test(foundation)],
  ["canonical learning reads use school permissions", (foundation.match(/can_view_student_learning\(student_id\)/g) ?? []).length >= 6],
  ["parent progression writes removed", /drop policy if exists "Parents can update linked progress"/i.test(foundation) && /drop policy if exists "Parents can insert linked progress"/i.test(foundation)],
  ["fixed-path permission helpers", (foundation.match(/security definer\s+set search_path = public/gi) ?? []).length >= 12],
  ["school invite command", /function public\.invite_school_staff/i.test(commands)],
  ["member role command", /function public\.change_school_member_role/i.test(commands)],
  ["class creation command", /function public\.create_class\(/i.test(commands)],
  ["class staff assignment command", /function public\.assign_class_staff/i.test(commands)],
  ["class staff revoke command", /function public\.revoke_class_staff/i.test(commands)],
  ["free-text school creation removed", !/insert into public\.schools[\s\S]{0,120}clean_school_name/i.test(commands)],
  ["server route guard", /loadSchoolHomePreview/.test(route) && /redirect\("\/teacher\/dashboard"\)/.test(route)],
  ["canonical adult profile verification", /user_profiles/.test(serverGuard) && /profile\.status !== "active"/.test(serverGuard)],
  ["client metadata does not grant canonical roles", !/account_type/.test(foundation) && /platform_roles/.test(foundation)],
  ["feature flag", /SCHOOL_PLATFORM_PREVIEW_ENABLED/.test(serverGuard)],
  ["signup does not create class", !/handleTeacherSignup[\s\S]*?from\("classes"\)\.insert/.test(login)],
];

const failures = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
}

if (failures.length > 0) {
  process.exitCode = 1;
}
