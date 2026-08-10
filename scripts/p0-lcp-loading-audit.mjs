import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const teacher = read("app/teacher/dashboard/page.tsx");
const schoolServer = read("lib/school-platform-server.ts");
const schoolClient = read("components/school/SchoolHomeClient.tsx");
const studentHome = read("app/home/page.tsx");

assert.match(teacher, /function TeacherDashboardSkeleton/);
assert.match(teacher, /if \(!diffOnly\) setStudents\(newStuds\)/);
assert.match(teacher, /return <TeacherDashboardSkeleton \/>/);

const initialSchoolLoader = schoolServer.slice(
  schoolServer.indexOf("export async function loadSchoolHomePreview"),
  schoolServer.indexOf("export async function loadSchoolStudentDirectoryPreview"),
);
assert.doesNotMatch(initialSchoolLoader, /getSchoolStudentDirectory\(/);
assert.match(initialSchoolLoader, /Promise\.all\([\s\S]*recordSchoolPreviewAccess/);
assert.match(schoolClient, /tab === "students" && directoryState === "idle"/);
assert.match(schoolClient, /directoryLoading=\{directoryState !== "ready"\}/);

assert.match(studentHome, /dashboard-bg-lcp\.webp/);
assert.match(studentHome, /priority/);
assert.match(studentHome, /fetchPriority="high"/);
assert.doesNotMatch(studentHome, /dashboard-bg\.jpg/);

const originalBytes = fs.statSync("public/images/dashboard-bg.jpg").size;
const lcpBytes = fs.statSync("public/images/dashboard-bg-lcp.webp").size;
assert.ok(lcpBytes < originalBytes * 0.2, "Student Home LCP asset should be at least 80% smaller");

console.log("P0 LCP loading audit passed.");
