import { buildAssessmentReturnRoute } from "../lib/assessment-routes";
import { getLastProgramWeek } from "../lib/program-weeks";

// ── Assessment Route Audit ────────────────────────────────────────────────────
// Permanent regression guard for assessment navigation. For every realm and
// level, the post-test Back/Exit route must return to the CORRECT week in the
// CORRECT realm:
//
//   Measurelands (Ground → Level 6) → Week 8, realm_id=measurement
//   Number Nexus  (Year 1 → Year 6) → Week 12, number realm
//
// A route that leaks Week 12 into Measurelands, drops to Ground/Number, or flips
// the realm is a FAIL — this catches the previously-shipped Week 12 bug forever.

type Case = {
  realmLabel: string;
  year: string;
  realmId?: string; // raw realm_id as it appears in the URL
  expectWeek: number;
  expectRealmInUrl: "measurement" | "none-or-number";
};

const MEASURELANDS_YEARS = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const NUMBER_YEARS = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

const cases: Case[] = [
  // Ground = Prep Measurelands. "Ground → Ground": stays in measurement at Week 8.
  ...MEASURELANDS_YEARS.map((year): Case => ({
    realmLabel: year === "Prep" ? "Measurelands (Ground)" : "Measurelands",
    year,
    realmId: "measurement",
    expectWeek: 8,
    expectRealmInUrl: "measurement",
  })),
  // Number Nexus must be untouched: 12-week return, never measurement.
  ...NUMBER_YEARS.map((year): Case => ({
    realmLabel: "Number Nexus",
    year,
    realmId: undefined,
    expectWeek: 12,
    expectRealmInUrl: "none-or-number",
  })),
];

let hasFailure = false;
function fail(message: string) {
  console.error(`FAIL: ${message}`);
  hasFailure = true;
}

const report: Array<{ realm: string; year: string; route: string; ok: boolean }> = [];

for (const c of cases) {
  const route = buildAssessmentReturnRoute({ year: c.year, realmId: c.realmId });
  const scope = `${c.realmLabel} · ${c.year}`;
  let ok = true;

  // Must return to the program page.
  if (!route.startsWith("/program?")) { fail(`${scope} does not return to /program (got "${route}").`); ok = false; }
  // Must carry the correct year.
  if (!route.includes(`year=${encodeURIComponent(c.year)}`)) { fail(`${scope} lost the year (got "${route}").`); ok = false; }
  // Must land on the correct final week.
  if (!route.includes(`week=${c.expectWeek}`)) { fail(`${scope} expected week=${c.expectWeek} (got "${route}").`); ok = false; }

  if (c.expectRealmInUrl === "measurement") {
    // Measurelands: realm preserved, and NEVER the Number Week 12 / Ground / Number leak.
    if (!route.includes("realm_id=measurement")) { fail(`${scope} dropped realm_id=measurement (got "${route}").`); ok = false; }
    if (route.includes("week=12")) { fail(`${scope} leaked Number Nexus Week 12 (got "${route}").`); ok = false; }
    if (route.includes("realm_id=number")) { fail(`${scope} flipped to the Number realm (got "${route}").`); ok = false; }
    if (route.includes("/home") || route.includes("/ground")) { fail(`${scope} fell back to Ground/Home (got "${route}").`); ok = false; }
  } else {
    // Number Nexus: must not have flipped into the measurement realm/week.
    if (route.includes("realm_id=measurement")) { fail(`${scope} unexpectedly became measurement (got "${route}").`); ok = false; }
    if (route.includes("week=8")) { fail(`${scope} unexpectedly returned to Measurelands Week 8 (got "${route}").`); ok = false; }
  }

  report.push({ realm: c.realmLabel, year: c.year, route, ok });
}

// Direct contract on the resolver too: measurement=8, number=12, and they differ.
if (getLastProgramWeek("measurement") !== 8) fail(`getLastProgramWeek("measurement") !== 8.`);
if (getLastProgramWeek("number") !== 12) fail(`getLastProgramWeek("number") !== 12.`);
if (getLastProgramWeek(undefined) !== 12) fail(`getLastProgramWeek(undefined) should default to Number 12.`);

console.log(JSON.stringify({ routes: report }, null, 2));

if (hasFailure) {
  console.error("\n❌ Assessment route audit FAILED.");
  process.exitCode = 1;
} else {
  console.log("\n✅ Assessment route audit passed — Measurelands returns to Week 8 (measurement); Number Nexus returns to Week 12.");
}
