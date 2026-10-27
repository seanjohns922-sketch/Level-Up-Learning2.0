#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

const foundation = read("supabase/migrations/20260718110000_student_economy_foundation.sql");
const backfill = read("supabase/migrations/20260718111500_backfill_existing_global_xp.sql");
const hardening = read("supabase/migrations/20260718113000_harden_global_xp_foundation.sql");
const economy = read("lib/economy.ts");
const progressSync = read("lib/student-progress-sync.ts");
const numberMap = read("components/world/NumberNexusMap.tsx");
const measurelandsMap = read("components/world/MeasurelandsMap.tsx");
const realmDashboard = read("components/realms/dashboard/RealmDashboardShell.tsx");
const walletDefinition = foundation.slice(
  foundation.indexOf("create table if not exists public.student_economy_wallets"),
  foundation.indexOf("create table if not exists public.student_economy_transactions"),
);

const results = [];
const check = (label, ok) => results.push({ label, ok });

check(
  "The XP wallet is student-global and has no realm partition",
  walletDefinition.includes("student_id uuid primary key references public.students(id)") &&
    !walletDefinition.includes("realm_id"),
);
check(
  "Direct wallet and ledger access remains private",
  foundation.includes("revoke all on public.student_economy_wallets from public, anon, authenticated") &&
    foundation.includes("revoke all on public.student_economy_transactions from public, anon, authenticated"),
);
check(
  "Global XP has a lightweight student-authorized wallet RPC",
  hardening.includes("get_student_global_xp_secure") &&
    hardening.includes("perform public.assert_student_access(p_student_id)") &&
    hardening.includes("w.xp_earned - w.xp_spent"),
);
check(
  "Client XP reads use only the authoritative wallet",
  economy.includes('supabase.rpc("get_student_global_xp_secure"') &&
    !economy.includes('supabase.rpc("get_student_activity_daily_secure"'),
);
check(
  "All live realm maps consume the same global XP reader",
  numberMap.includes("fetchGlobalXp(studentId)") &&
    measurelandsMap.includes("RealmDashboardShell") &&
    realmDashboard.includes("fetchGlobalXp(studentId)"),
);
check(
  "Lesson and quiz awards use immutable completion receipt keys",
  hardening.includes("'lesson_completion',\n    p_completion_key::text") &&
    hardening.includes("'quiz_completion',\n    p_completion_key::text") &&
    !hardening.includes("gen_random_uuid()::text"),
);
check(
  "Ledger uniqueness independently rejects replayed completion events",
  foundation.includes("unique(student_id, source_type, source_key)") &&
    hardening.includes("if inserted_count = 0 then\n    return false"),
);
check(
  "A zero-XP quiz still records one completion event and daily attempt",
  hardening.includes("safe_xp integer := greatest(coalesce(p_xp, 0), 0)") &&
    hardening.indexOf("insert into public.student_economy_transactions") <
      hardening.indexOf("perform public.upsert_student_activity_daily"),
);
const xpRules = read("supabase/migrations/20261027120000_server_side_xp_rules.sql");
check(
  "Every realm shares lesson and quiz award amounts, set by the server",
  progressSync.includes("p_xp: LESSON_XP") &&
    progressSync.includes('realmId: StudentProgressRealmId = "number"') &&
    xpRules.includes("lesson_xp constant integer := 40;") &&
    xpRules.includes("quiz_pass_xp constant integer := 60;") &&
    !/apply_completion_xp\([\s\S]{0,200}p_xp,/.test(xpRules),
);
check(
  "Quiz XP pays once, on the first pass (80%+)",
  xpRules.includes("reward_eligible := this_passed and not passed_before;") &&
    xpRules.includes("quiz_pass_percent constant integer := 80;"),
);
check(
  "Brain-break XP checks the student and limits awards per day",
  xpRules.includes("perform public.assert_student_write(p_student_id);") &&
    xpRules.includes("awards_today >= 30") &&
    xpRules.includes("least(greatest(coalesce(p_xp, 0), 0), 10)"),
);
check(
  "Historical XP backfill is cross-realm, conservative, and replay-safe",
  backfill.includes("select distinct") &&
    backfill.includes("greatest(\n    public.student_economy_wallets.xp_earned") &&
    backfill.includes("on conflict (student_id, source_type, source_key) do nothing"),
);

const failures = results.filter((result) => !result.ok);
console.log("\nGlobal XP Foundation Audit\n" + "=".repeat(64));
for (const result of results) console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.label}`);
console.log("=".repeat(64));
console.log(`${results.length - failures.length}/${results.length} checks passed.`);

if (failures.length > 0) process.exit(1);
