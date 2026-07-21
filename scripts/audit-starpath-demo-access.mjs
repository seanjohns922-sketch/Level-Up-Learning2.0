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
const login = read("app/login/page.tsx");
const serverPage = read("app/starpath/page.tsx");
const starpathMap = read("components/world/StarpathMap.tsx");
const lessonPage = read("app/starpath/lesson/[level]/[week]/[lesson]/page.tsx");
const demoRoute = read("app/api/demo-access/route.ts");
const demoServer = read("lib/demo-session-server.ts");
const placementAdapter = read("lib/starpath-placement-adapter.ts");
const placementManager = read("components/teacher/PlacementManager.tsx");
const progressSync = read("lib/student-progress-sync.ts");
const economy = read("lib/economy.ts");
const levels = await loadTypeScriptModule(read("lib/starpath-levels.ts"));
const routeSource = read("lib/starpath-routes.ts")
  .replace(/import \{ getStarpathLevel, type StarpathLevelId \} from "@\/lib\/starpath-levels";\n/, "")
  .replace(
    "export const STARPATH_CAROUSEL_ID",
    'const getStarpathLevel = (level) => ({ yearLabel: level === "ground" ? "Prep" : `Year ${level.slice(-1)}` });\nexport const STARPATH_CAROUSEL_ID',
  );
const routes = await loadTypeScriptModule(routeSource);

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
assert.match(carousel, /requestStarpathPreviewAccess/);
assert.match(carousel, /\/login\?demo=1&returnTo=/);
assert.match(carousel, /<button[\s\S]*Preview Realm/);
assert.match(carousel, /const isStarpathPreview = isStarpathRealm && starpathAccess\.allowed/);
assert.match(carousel, /Demo · Preview/);
assert.match(carousel, /buildStarpathWorldHref\(\{ selectedLevel: selectedStarpathLevel \}\)/);
assert.match(serverPage, /await getServerStarpathAccess\(\)/);
assert.match(serverPage, /redirect\("\/realms"\)/);
assert.ok(serverPage.indexOf("if (!access.allowed)") < serverPage.indexOf("<StarpathMap"));
assert.match(starpathMap, /RealmDashboardShell/);
assert.match(starpathMap, /only: true/);
assert.match(starpathMap, /storageRealmId: "space"/);
assert.match(lessonPage, /await getServerStarpathAccess\(\)/);
assert.match(lessonPage, /realmId !== STARPATH_REALM_ID/);
assert.match(login, /new URLSearchParams\(window\.location\.search\)\.get\("demo"\) === "1"/);
assert.match(login, /candidate\.pathname === "\/starpath"/);
assert.match(login, /candidate\.searchParams\.get\("realm_id"\) === STARPATH_REALM_ID/);
assert.match(login, /router\.push\(demoDestination\)/);

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

console.log("Starpath demo access audit passed: preview is clickable, code-authorised, safely returned to Starpath, server guarded, and non-persistent.");
