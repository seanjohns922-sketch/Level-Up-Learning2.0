#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

const sharedNav = read("components/world/RealmDashboardNav.tsx");
const canonicalNav = read("components/realms/dashboard/RealmSideNavigation.tsx");
const canonicalShell = read("components/realms/dashboard/RealmDashboardShell.tsx");
const numberMap = read("components/world/NumberNexusMap.tsx");
const measurelandsMap = read("components/world/MeasurelandsMap.tsx");
const starpathMap = read("components/world/StarpathMap.tsx");

const results = [];
const check = (label, ok) => results.push({ label, ok });

check(
  "Shared realm HUD exposes exactly My Home and Tower",
  [sharedNav, canonicalNav].every((source) =>
    source.includes('label: "MY HOME"') &&
      source.includes('route: "/home-base"') &&
      source.includes('label: "TOWER"') &&
      source.includes('route: "/realms"') &&
      (source.match(/route:/g) ?? []).length === 2
  ),
);

check(
  "Shared realm HUD has accessible destination names",
  [sharedNav, canonicalNav].every((source) =>
    source.includes('aria-label={accessibleLabel}') &&
      source.includes('title={accessibleLabel}') &&
      source.includes("Return to the Tower of Knowledge")
  ),
);

check(
  "Number Nexus uses the shared realm HUD",
  numberMap.includes('import RealmDashboardNav from "@/components/world/RealmDashboardNav"') &&
    numberMap.includes("<RealmDashboardNav"),
);
check(
  "Measurelands uses the canonical shared realm HUD",
  measurelandsMap.includes("<RealmDashboardShell") && canonicalShell.includes("<RealmSideNavigation"),
);
check(
  "Starpath uses the canonical shared realm HUD",
  starpathMap.includes("<RealmDashboardShell") && canonicalShell.includes("<RealmSideNavigation"),
);

for (const [label, source] of [["Number Nexus", numberMap], ["Measurelands", measurelandsMap], ["Starpath", starpathMap]]) {
  check(
    `${label} no longer exposes standalone Legends, Worlds, or Progress HUD routes`,
    !source.includes('label: "LEGENDS"') &&
      !source.includes('label: "WORLDS"') &&
      !source.includes('label: "PROGRESS"') &&
      !source.includes('route: "/legends"') &&
      !source.includes('route: "/realm-stats"'),
  );
}

const failures = results.filter((result) => !result.ok);
console.log("\nRealm Dashboard Navigation Audit\n" + "=".repeat(60));
for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.label}`);
}
console.log("=".repeat(60));
console.log(`${results.length - failures.length}/${results.length} checks passed.`);

if (failures.length > 0) process.exit(1);
