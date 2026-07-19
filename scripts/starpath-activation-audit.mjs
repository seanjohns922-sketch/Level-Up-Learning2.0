#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

const carousel = read("components/realms/RealmCarousel.tsx");
const availability = read("lib/realm-entry.ts");
const routes = read("lib/starpath-routes.ts");
const starpathPage = read("app/starpath/page.tsx");
const levelCatalog = read("lib/level-catalog.ts");
const levelsPage = read("app/levels/page.tsx");

const results = [];
const check = (label, ok) => results.push({ label, ok });

check(
  "The carousel contains exactly one Starpath card",
  (carousel.match(/id: "starpath-realm"/g) ?? []).length === 1,
);
check(
  "Starpath remains disabled with an explicit space destination",
  /"starpath-realm":\s*\{[\s\S]*?enabled:\s*false[\s\S]*?progressRealmId:\s*null[\s\S]*?destinationRealmId:\s*STARPATH_REALM_ID[\s\S]*?route:\s*STARPATH_WORLD_ROUTE/.test(availability),
);
check(
  "Number Nexus and Measurelands availability is unchanged",
  /"number-nexus":\s*\{[\s\S]*?enabled:\s*true[\s\S]*?progressRealmId:\s*"number"[\s\S]*?route:\s*"\/number-nexus"/.test(availability) &&
    /measurelands:\s*\{[\s\S]*?enabled:\s*true[\s\S]*?progressRealmId:\s*"measurement"[\s\S]*?route:\s*"\/measurelands"/.test(availability),
);
check(
  "The Starpath contract uses realm_id=space and a dedicated route",
  routes.includes('export const STARPATH_REALM_ID = "space"') &&
    routes.includes('export const STARPATH_WORLD_ROUTE = "/starpath"'),
);
check(
  "Starpath entry bypasses live curriculum progress restoration",
  carousel.indexOf("availability.destinationRealmId === STARPATH_REALM_ID") <
    carousel.indexOf("restoreStudentStateFromServer("),
);
check(
  "The Starpath world validates realm and selected-level context",
  starpathPage.includes('searchParams.get("realm_id") !== STARPATH_REALM_ID') &&
    starpathPage.includes('searchParams.get("level")') &&
    starpathPage.includes("tryNormalizeStarpathLevel"),
);
check(
  "The Starpath shell cannot load another realm's curriculum",
  !starpathPage.includes("/number-nexus") &&
    !starpathPage.includes("/measurelands") &&
    !starpathPage.includes("restoreStudentStateFromServer"),
);
check(
  "Unknown level routes do not fall back to Number Nexus",
  levelCatalog.includes('realmId === "starpath-realm"') &&
    levelCatalog.includes("buildStarpathWorldHref") &&
    levelCatalog.includes("href: `/realms?level=${encodeURIComponent(targetYear)}`") &&
    !levelCatalog.includes('REALM_ROUTES[realmId] ?? "/number-nexus"'),
);
check(
  "The retired Levels redirect preserves legacy and canonical Starpath levels",
  levelsPage.includes("LEVEL_CATALOG.some") &&
    levelsPage.includes("tryNormalizeStarpathLevel(requestedLevel)") &&
    levelsPage.includes("`/realms?level=${encodeURIComponent(selectedLevel)}`"),
);

const failures = results.filter((result) => !result.ok);
console.log("\nStarpath Activation Audit\n" + "=".repeat(64));
for (const result of results) console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.label}`);
console.log("=".repeat(64));
console.log(`${results.length - failures.length}/${results.length} checks passed.`);

if (failures.length > 0) process.exit(1);
