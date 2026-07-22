#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const findings = [];

function requirePattern(relativePath, pattern, message) {
  if (!pattern.test(read(relativePath))) findings.push(`${relativePath}: ${message}`);
}

function rejectPattern(relativePath, pattern, message) {
  if (pattern.test(read(relativePath))) findings.push(`${relativePath}: ${message}`);
}

for (const relativePath of [
  "components/realms/dashboard/RealmDashboardShell.tsx",
  "components/world/NumberNexusMap.tsx",
  "app/program/page.tsx",
  "app/home-base/page.tsx",
]) {
  requirePattern(
    relativePath,
    /<CanonicalStudentAvatar\b/,
    "student-facing avatar must use the canonical appearance wrapper",
  );
  rejectPattern(
    relativePath,
    /<StudentAvatar\b/,
    "student-facing page bypasses the canonical appearance resolver",
  );
}

rejectPattern(
  "components/avatar/StudentAvatar.tsx",
  /localStorage|readOutfitFromStorage|ACTIVE_STUDENT_KEY/,
  "visual renderer must remain pure and must not resolve identity or storage",
);
requirePattern(
  "lib/avatar-appearance.ts",
  /isDemoPreviewMode\(\)[\s\S]+DEMO_PREVIEW_SCOPE/,
  "Demo Mode must resolve one stable canonical appearance scope",
);
requirePattern(
  "lib/avatar-appearance.ts",
  /fetchStudentEconomy\(scope\)[\s\S]+persistCanonicalAvatarAppearance/,
  "production appearance must refresh from the canonical economy source",
);
requirePattern(
  "lib/avatar-appearance.ts",
  /AVATAR_APPEARANCE_EVENT[\s\S]+addEventListener\(AVATAR_APPEARANCE_EVENT/,
  "wardrobe changes must update mounted avatar renderers immediately",
);
rejectPattern(
  "components/world/NumberNexusMap.tsx",
  /function PlayerCharacter\(\{ gender|readGenderFromStorage/,
  "legacy page-specific Number Nexus character renderer remains",
);

const allowedDirectRenderers = new Set([
  "components/avatar/CanonicalStudentAvatar.tsx",
  "components/economy/MarketplaceItemImage.tsx",
  "app/wardrobe/page.tsx",
]);

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolutePath);
      continue;
    }
    if (!entry.name.endsWith(".tsx")) continue;
    const relativePath = path.relative(root, absolutePath);
    if (relativePath === "components/avatar/StudentAvatar.tsx") continue;
    if (/<StudentAvatar\b/.test(fs.readFileSync(absolutePath, "utf8")) && !allowedDirectRenderers.has(relativePath)) {
      findings.push(`${relativePath}: direct StudentAvatar rendering is limited to canonical, wardrobe and marketplace preview components`);
    }
  }
}

walk(path.join(root, "app"));
walk(path.join(root, "components"));

if (findings.length) {
  console.error("Avatar consistency audit failed:\n" + findings.map((finding) => `- ${finding}`).join("\n"));
  process.exit(1);
}

console.log("Avatar consistency audit passed.");
console.log("- Student-facing surfaces use CanonicalStudentAvatar.");
console.log("- StudentAvatar is a pure prop-driven renderer.");
console.log("- Demo and production appearances use stable, separate scopes.");
console.log("- Wardrobe changes publish immediately to mounted avatars.");
console.log("- Direct rendering is limited to intentional wardrobe and marketplace previews.");
