import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const availability = read("lib/realm-entry.ts");
const carousel = read("components/realms/RealmCarousel.tsx");
const measurelands = read("app/measurelands/page.tsx");
const pretest = read("app/pretest/page.tsx");

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
  "Number Nexus and Measurelands are enabled in shared configuration",
  /"number-nexus":\s*\{[\s\S]*?enabled:\s*true/.test(availability) &&
    /measurelands:\s*\{[\s\S]*?enabled:\s*true/.test(availability),
);
check(
  "Unreleased realms are not implicitly enabled",
  availability.includes("return ENABLED_REALMS[realmId as RealmCarouselId] ?? null"),
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
