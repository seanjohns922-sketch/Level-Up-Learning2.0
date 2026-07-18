#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

const sharedNav = read("components/world/RealmDashboardNav.tsx");
const numberMap = read("components/world/NumberNexusMap.tsx");
const measurelandsMap = read("components/world/MeasurelandsMap.tsx");

const results = [];
const check = (label, ok) => results.push({ label, ok });

check(
  "Shared realm HUD exposes exactly My Home and Tower",
  sharedNav.includes('label: "MY HOME"') &&
    sharedNav.includes('route: "/home-base"') &&
    sharedNav.includes('label: "TOWER"') &&
    sharedNav.includes('route: "/realms"') &&
    (sharedNav.match(/route:/g) ?? []).length === 2,
);

check(
  "Shared realm HUD has accessible destination names",
  sharedNav.includes('aria-label={accessibleLabel}') &&
    sharedNav.includes('title={accessibleLabel}') &&
    sharedNav.includes("Return to the Tower of Knowledge"),
);

for (const [label, source] of [
  ["Number Nexus", numberMap],
  ["Measurelands", measurelandsMap],
]) {
  check(
    `${label} uses the shared realm HUD`,
    source.includes('import RealmDashboardNav from "@/components/world/RealmDashboardNav"') &&
      source.includes("<RealmDashboardNav"),
  );
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
