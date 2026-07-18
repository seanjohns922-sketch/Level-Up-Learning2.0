#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

const login = read("app/login/page.tsx");
const rootRoute = read("app/page.tsx");
const restore = read("lib/student-progress-sync.ts");
const realmProgress = read("lib/realm-progress-compat.ts");
const progress = read("data/progress.ts");
const programProgress = read("lib/program-progress.ts");
const resume = read("lib/resume-state.ts");
const identity = read("lib/studentIdentity.ts");
const home = read("app/home/page.tsx");
const pretest = read("app/pretest/page.tsx");
const migration = read("supabase/migrations/20260718103000_fix_student_access_legacy_user_id.sql");

const results = [];
const check = (label, ok) => results.push({ label, ok });

check(
  "Progress cache keys include student scope and realm",
  progress.includes("`lul:${scope}:${realmId}:student_progress_v1`")
);
check(
  "Program cache is student-scoped and entries include realm",
  programProgress.includes("getScopedProgramStoreKey(scope = getActiveStudentScope())") &&
    programProgress.includes("`${normalizeRealmId(realmId)}|${year}|${week}`")
);
check(
  "Assessment and lesson resume keys cannot cross students",
  resume.includes("`lul:pretest-resume:${activeStudentScope()}:${realmId}:${year}`") &&
    resume.includes("`lul:lesson-resume:${activeStudentScope()}:${lessonId}`") &&
    resume.includes("`lul:lesson-session:${activeStudentScope()}:${lessonId}`")
);
check(
  "Logout removes active identity, profile, and opaque student token",
  identity.includes("localStorage.removeItem(ACTIVE_STUDENT_KEY)") &&
    identity.includes("localStorage.removeItem(ACTIVE_STUDENT_PROFILE_KEY)") &&
    identity.includes("localStorage.removeItem(STUDENT_SESSION_TOKEN_KEY)")
);
check(
  "Student logout invalidates local identity before awaiting network sign-out",
  home.indexOf("clearActiveStudentSession()") < home.indexOf("await supabase.auth.signOut()") &&
    pretest.indexOf("clearActiveStudentSession()", pretest.indexOf("async function exitLogout")) <
      pretest.indexOf("await supabase.auth.signOut()", pretest.indexOf("async function exitLogout"))
);
check(
  "Login waits in an explicit bootstrap state before routing",
  login.includes('useState<"idle" | "loading" | "resolved" | "error">') &&
    login.includes('setStudentBootstrapState("resolved")') &&
    login.indexOf('setStudentBootstrapState("resolved")') < login.indexOf("router.push(dest)")
);
check(
  "A failed authoritative restore clears the session instead of routing a default",
  login.includes("Authoritative student progress restore failed") &&
    login.includes('failCurrentAttempt("We could not load your saved progress. Please try again.", true)')
);
check(
  "Login does not seed progress before the server restore finishes",
  login.indexOf("restoreStudentStateFromServer(student.student_id, \"number\")") <
    login.indexOf("persistResolvedStudentProgress(progress)")
);
check(
  "Late restore responses verify the active student before committing",
  restore.includes("assertActiveRestoreStudent(studentId)") &&
    (restore.match(/assertActiveRestoreStudent\(studentId\)/g) ?? []).length >= 3 &&
    restore.includes("StudentRestoreSupersededError")
);
check(
  "The selected progress row prefers the server's current realm row",
  restore.includes("usableRows.filter((row) => row.is_current === true)")
);
check(
  "Student routing never substitutes a legacy snapshot after a canonical RPC error",
  realmProgress.includes("if (compatError) {\n    throw compatError;") &&
    !realmProgress.includes("fetchSnapshotFallbackForStudent")
);
check(
  "Canonical pre-test assessments confirm placement completion",
  realmProgress.includes('assessment_type === "pretest"') &&
    realmProgress.includes("summary.placement_complete || latestPretest !== null")
);
check(
  "Refresh routing refuses cached fallback when the server restore fails",
  rootRoute.includes("clearActiveStudentSession()") &&
    rootRoute.includes('router.replace("/login?error=progress_restore")')
);
check(
  "Anonymous cache data cannot create a student route",
  rootRoute.includes("let progress = activeStudentId ? readProgress() : null") &&
    rootRoute.includes("if (activeStudentId) {") &&
    !rootRoute.includes("if (activeStudentId || progress)")
);
check(
  "Student authorization does not reference the missing legacy students.user_id",
  !migration.includes("s.user_id") &&
    migration.includes("public.parent_student_links") &&
    migration.includes("public.student_access_sessions")
);

const failures = results.filter((result) => !result.ok);
console.log("\nStudent Session Isolation Audit\n" + "=".repeat(60));
for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.label}`);
}
console.log("=".repeat(60));
console.log(`${results.length - failures.length}/${results.length} checks passed.`);

if (failures.length > 0) process.exit(1);
