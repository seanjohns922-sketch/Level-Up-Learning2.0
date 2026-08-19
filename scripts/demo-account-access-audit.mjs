#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const route = read("app/api/demo-access/route.ts");
const login = read("app/login/page.tsx");
const bootstrap = read("lib/demo-preview-bootstrap.ts");
const verifier = read("lib/demo-account-server.ts");
const provisioner = read("scripts/provision-demo-account.mjs");

assert.match(route, /verifyDemoAccountToken\(accessToken\)/);
assert.match(route, /createDemoSessionToken\(\)/);
assert.match(verifier, /app_metadata\?\.demo_access !== true/);
assert.doesNotMatch(verifier, /Marie\.Garcia|investible/i);
assert.match(login, /data\.user\.app_metadata\?\.demo_access === true/);
assert.match(login, /supabase\.auth\.signOut\(\{ scope: "local" \}\)/);
assert.match(login, /bootstrapDemoPreview\(\)/);
assert.match(login, /bootstrapDemoPreview\(result\?\.displayName \|\| fallbackDisplayName\)/);
assert.match(bootstrap, /DEMO_PREVIEW_SCOPE/);
assert.match(bootstrap, /clearScopedProgress\(DEMO_PREVIEW_SCOPE\)/);
assert.match(bootstrap, /clearScopedProgramStore\(DEMO_PREVIEW_SCOPE\)/);
assert.match(provisioner, /app_metadata: \{ demo_access: true \}/);
assert.match(provisioner, /role: "demo"/);
assert.match(provisioner, /\["teachers", "id"\]/);
assert.match(provisioner, /\["user_profiles", "user_id"\]/);
assert.doesNotMatch(route, /Marie\.Garcia|investible/i);
assert.doesNotMatch(login, /Marie\.Garcia|investible/i);

console.log("Demo account access audit passed: authenticated demo accounts reuse the isolated Demo Mode bootstrap.");
