#!/usr/bin/env node

import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const appUrl = process.env.DEMO_ACCOUNT_APP_URL?.trim();
const email = process.env.DEMO_ACCOUNT_EMAIL?.trim().toLowerCase();
const password = process.env.DEMO_ACCOUNT_PASSWORD?.trim();

if (!supabaseUrl || !anonKey || !serviceRoleKey || !appUrl || !email || !password) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, DEMO_ACCOUNT_APP_URL, DEMO_ACCOUNT_EMAIL and DEMO_ACCOUNT_PASSWORD.",
  );
  process.exit(1);
}

const authClient = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { data, error } = await authClient.auth.signInWithPassword({ email, password });
assert.ifError(error);
assert.ok(data.session?.access_token, "Password login did not return a session.");
assert.equal(data.user?.app_metadata?.demo_access, true, "Account is missing demo_access metadata.");

const token = data.session.access_token;
const exchange = await fetch(`${appUrl}/api/demo-access`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
});
const exchangeBody = await exchange.json();
assert.equal(exchange.status, 200, `Demo exchange failed: ${JSON.stringify(exchangeBody)}`);
assert.equal(exchangeBody.mode, "demo_account");
assert.ok(exchange.headers.get("set-cookie")?.includes("lul_demo_session_v1="));

const cookie = exchange.headers.get("set-cookie")?.split(";", 1)[0] ?? "";
const sessionCheck = await fetch(`${appUrl}/api/demo-access`, { headers: { Cookie: cookie } });
assert.equal(sessionCheck.status, 200, "Exchanged demo cookie was not authorized.");

const adminCheck = await fetch(`${appUrl}/api/admin-session`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
});
const schoolCheck = await fetch(`${appUrl}/api/school-preview-session`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
});
assert.equal(adminCheck.status, 403, "Demo account unexpectedly received platform-admin access.");
assert.equal(schoolCheck.status, 403, "Demo account unexpectedly received school access.");

const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const checks = [
  ["user_profiles", "user_id"],
  ["teachers", "id"],
  ["school_memberships", "user_id"],
  ["parent_student_links", "parent_user_id"],
  ["platform_roles", "user_id"],
];
for (const [table, column] of checks) {
  const result = await serviceClient.from(table).select(column, { count: "exact", head: true }).eq(column, data.user.id);
  assert.ifError(result.error);
  assert.equal(result.count, 0, `${table} contains an operational record for the demo account.`);
}

await authClient.auth.signOut({ scope: "local" });
console.log(JSON.stringify({
  login: "passed",
  demoSession: "passed",
  displayName: exchangeBody.displayName,
  platformAdminAccess: "denied",
  schoolAccess: "denied",
  operationalRecords: 0,
}));
