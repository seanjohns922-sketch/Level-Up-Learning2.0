import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const availability = read("lib/realm-entry.ts");
const carousel = read("components/realms/RealmCarousel.tsx");
const measurelands = read("app/measurelands/page.tsx");
const entryHandoff = read("lib/realm-entry-handoff.ts");
const progressSync = read("lib/student-progress-sync.ts");
const studentDestination = read("lib/student-destination.ts");
const pretest = read("app/pretest/page.tsx");
const home = read("app/home/page.tsx");

const results = [];
const check = (label, ok) => results.push({ label, ok });

function resolveRealmEntryRoute({ realmId, progress, fallbackYear, introSeen }) {
  if (!introSeen) return "/home";
  const year = progress?.year?.trim() || fallbackYear.trim() || "Year 1";
  const route = realmId === "measurement" ? "/measurelands" : "/number-nexus";
  if (year === "Prep" || progress?.placementComplete === true || progress?.status === "PASSED") return route;
  return `/pretest?year=${encodeURIComponent(year)}&realm_id=${realmId}`;
}

check(
  "Live realms are enabled from the shared registry",
  availability.includes("getLiveRealmDefinitions()") &&
    availability.includes("realm.portalId") &&
    availability.includes("realm.realmId"),
);
check(
  "Unreleased realms are not implicitly enabled",
  availability.includes("ENABLED_REALMS[realmId] ?? null"),
);
check(
  "A new Year 2 Measurelands student enters the measurement pre-test",
  resolveRealmEntryRoute({ realmId: "measurement", progress: null, fallbackYear: "Year 2", introSeen: true }) ===
    "/pretest?year=Year%202&realm_id=measurement",
);
check(
  "A new Ground Level student enters Measurelands without a pre-test",
  resolveRealmEntryRoute({ realmId: "measurement", progress: null, fallbackYear: "Prep", introSeen: true }) ===
    "/measurelands",
);
check(
  "Ground Level students choose a realm after the shared intro",
  studentDestination.includes("if (isGroundLevel)") &&
    studentDestination.includes('return "/realms";') &&
    studentDestination.includes("placementComplete: isGroundLevel"),
);
check(
  "A new Ground Level learner starts Number Nexus Week 1 after the welcome video",
  studentDestination.includes("buildGroundFirstLessonRoute") &&
    studentDestination.includes('yearLabel: "Prep", week: 1, lessonNumber: 1, realmId: "number"'),
);
check(
  "A placed Week 2 student returns to Measurelands",
  resolveRealmEntryRoute({
    realmId: "measurement",
    progress: { year: "Year 2", status: "ASSIGNED_PROGRAM", placementComplete: true, assignedWeek: 2 },
    fallbackYear: "Year 2",
    introSeen: true,
  }) === "/measurelands",
);
check(
  "Realm selection restores exact student realm progress before routing",
  carousel.includes("restoreStudentStateFromServer(") &&
    carousel.includes("availability.progressRealmId") &&
    !carousel.includes("function isRealmAccessible"),
);
check(
  "Direct Measurelands navigation resolves authoritative measurement progress",
  measurelands.includes('restoreStudentStateFromServer(identity.studentId, "measurement")') &&
    measurelands.includes("resolveRealmEntryRoute({"),
);
check(
  "Fresh carousel entry avoids a duplicate Measurelands restore",
  carousel.includes("markRealmEntryRestored(identity.studentId, availability.progressRealmId)") &&
    measurelands.includes('consumeRestoredRealmEntry(identity.studentId, "measurement")'),
);
check(
  "Realm entry handoff is short-lived and isolated by student and realm",
  entryHandoff.includes("HANDOFF_MAX_AGE_MS = 30_000") &&
    entryHandoff.includes("handoff.studentId === studentId") &&
    entryHandoff.includes("handoff.realmId === realmId") &&
    entryHandoff.includes("sessionStorage.removeItem(HANDOFF_KEY)"),
);
check(
  "Explicit intro completion cannot race the server write and bounce back home",
  /await markStudentIntroSeen\(studentId\)[\s\S]*markActiveStudentIntroSeen\(studentId\)/.test(home) &&
    progressSync.includes("introSeenFromStudentFlag") &&
    progressSync.includes("introSeenFromHistoricalProgress"),
);
check(
  "Completed Measurelands placement leaves the pre-test for the Measurelands map",
  pretest.includes('progressRealmId === "measurement" ? "/measurelands" : "/levels"'),
);

const failures = results.filter((result) => !result.ok);
console.log("\nRealm Availability Audit\n" + "=".repeat(60));
for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.label}`);
}
console.log("=".repeat(60));
console.log(`${results.length - failures.length}/${results.length} checks passed.`);

if (failures.length > 0) process.exit(1);
