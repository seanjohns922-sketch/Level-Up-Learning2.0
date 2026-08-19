#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const email = process.env.DEMO_ACCOUNT_EMAIL?.trim().toLowerCase();
const password = process.env.DEMO_ACCOUNT_PASSWORD?.trim();
const displayName = process.env.DEMO_ACCOUNT_NAME?.trim();

if (!supabaseUrl || !serviceRoleKey || !email || !password || !displayName) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEMO_ACCOUNT_EMAIL, DEMO_ACCOUNT_PASSWORD and DEMO_ACCOUNT_NAME.",
  );
  process.exit(1);
}

if (password.length < 16) {
  console.error("DEMO_ACCOUNT_PASSWORD must be at least 16 characters.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail() {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === email);
    if (match) return match;
    if (data.users.length < 100) return null;
  }
  throw new Error("User lookup exceeded 2,000 accounts.");
}

const existing = await findUserByEmail();
const attributes = {
  email,
  password,
  email_confirm: true,
  app_metadata: { demo_access: true },
  user_metadata: {
    display_name: displayName,
    name: displayName,
    role: "demo",
  },
};

const result = existing
  ? await supabase.auth.admin.updateUserById(existing.id, attributes)
  : await supabase.auth.admin.createUser(attributes);
if (result.error || !result.data.user) throw result.error ?? new Error("Demo account was not created.");

const userId = result.data.user.id;
const cleanupTargets = [
  ["school_memberships", "user_id"],
  ["parent_student_links", "parent_user_id"],
  ["platform_roles", "user_id"],
  ["teachers", "id"],
  ["user_profiles", "user_id"],
];
for (const [table, column] of cleanupTargets) {
  const { error } = await supabase.from(table).delete().eq(column, userId);
  if (error && error.code !== "42P01") throw error;
}

console.log(JSON.stringify({
  created: !existing,
  userId,
  email,
  demoAccess: result.data.user.app_metadata?.demo_access === true,
  operationalProfilesRemoved: true,
}));
