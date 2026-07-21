#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const loadTypeScriptModule = async (source) => {
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
};

const access = await loadTypeScriptModule(read("lib/starpath-access.ts"));
const carousel = read("components/realms/RealmCarousel.tsx");
const serverPage = read("app/starpath/page.tsx");
const clientPage = read("app/starpath/StarpathClient.tsx");
const demoRoute = read("app/api/demo-access/route.ts");
const demoServer = read("lib/demo-session-server.ts");
const placementAdapter = read("lib/starpath-placement-adapter.ts");
const placementManager = read("components/teacher/PlacementManager.tsx");
const progressSync = read("lib/student-progress-sync.ts");
const economy = read("lib/economy.ts");
const routes = await loadTypeScriptModule(read("lib/starpath-routes.ts"));
const levels = await loadTypeScriptModule(read("lib/starpath-levels.ts"));

assert.deepEqual(
  access.resolveStarpathAccess({ demoFeatureEnabled: true, authorizedDemoSession: true }),
  { allowed: true, mode: "demo" },
);
assert.deepEqual(
  access.resolveStarpathAccess({ demoFeatureEnabled: true, authorizedDemoSession: false }),
  { allowed: false, reason: "invalid-session" },
);
assert.deepEqual(
  access.resolveStarpathAccess({ demoFeatureEnabled: false, authorizedDemoSession: false }),
  { allowed: false, reason: "not-demo-mode" },
);

assert.match(carousel, /const realms = ALL_REALMS/);
assert.match(carousel, /isStarpathRealm \? \(/);
assert.match(carousel, /Preview Realm/);
assert.match(carousel, /Demo access only/);
assert.match(carousel, /const isStarpathPreview = isStarpathRealm && starpathAccess\.allowed/);
assert.match(carousel, /Demo · Preview/);
assert.match(carousel, /buildStarpathWorldHref\(\{ selectedLevel: selectedStarpathLevel \}\)/);
assert.match(serverPage, /await getServerStarpathAccess\(\)/);
assert.match(serverPage, /redirect\("\/realms"\)/);
assert.ok(serverPage.indexOf("if (!access.allowed)") < serverPage.indexOf("<StarpathClient />"));
assert.match(clientPage, /Demo progress is not saved\./);
assert.match(clientPage, /Demo · Preview/);

assert.match(demoRoute, /response\.cookies\.set\(DEMO_SESSION_COOKIE, createDemoSessionToken\(\)/);
assert.match(demoRoute, /export async function GET\(\)/);
assert.match(demoRoute, /export async function DELETE\(\)/);
assert.match(demoServer, /httpOnly|DEMO_SESSION_COOKIE/);
assert.match(demoServer, /createHmac\("sha256"/);
assert.match(demoServer, /timingSafeEqual/);

assert.match(placementAdapter, /persistence: "unavailable"/);
assert.doesNotMatch(placementAdapter, /supabase|student_realm_progress|student-progress-sync/);
assert.match(progressSync, /if \(isDemoPreviewMode\(\)\) return/);
assert.match(economy, /if \(isDemoPreviewMode\(\)\)/);
assert.match(placementManager, /filter\(\(realm\) => realm\.id !== "space"\)/);

const selectedLevel = levels.normalizeStarpathLevel("Year 3");
const href = routes.buildStarpathWorldHref({ selectedLevel });
const url = new URL(href, "https://starpath.test");
assert.equal(url.pathname, "/starpath");
assert.equal(url.searchParams.get("realm_id"), "space");
assert.equal(url.searchParams.get("level"), "level-3");
assert.equal(url.searchParams.get("destination"), "world");
assert.equal(href.includes("number-nexus"), false);
assert.equal(href.includes("measurelands"), false);

console.log("Starpath demo access audit passed: card visible as a locked preview, authorised entry only, server guarded, and non-persistent.");
