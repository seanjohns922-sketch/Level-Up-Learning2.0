import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migration = fs.readFileSync(path.join(root, "supabase/migrations/20260811100000_platform_admin_pa1.sql"), "utf8");
const server = fs.readFileSync(path.join(root, "lib/platform-admin-server.ts"), "utf8");
const login = fs.readFileSync(path.join(root, "app/login/page.tsx"), "utf8");

const requiredFiles = [
  "app/admin/page.tsx", "app/admin/schools/page.tsx", "app/admin/schools/[schoolId]/page.tsx",
  "app/admin/users/page.tsx", "app/admin/home/page.tsx", "app/admin/growth/page.tsx",
  "app/admin/analytics/page.tsx", "app/admin/audit/page.tsx",
  "docs/PLATFORM_ADMIN_MASTER_ARCHITECTURE.md", "docs/PLATFORM_ADMIN_PHASE_PA1_IMPLEMENTATION.md",
];

const checks = [
  ["canonical owner role", /role = 'platform_owner'[\s\S]+role\.status = 'active'/.test(migration)],
  ["owner role is not client-derived", !/hardcoded.*email|query parameter|localStorage/.test(server)],
  ["identity and entitlement separated", /student_access_entitlements/.test(migration)],
  ["school licence entitlement", /school_licence_entitlements/.test(migration)],
  ["free billing classification", /billing_status[\s\S]+free/.test(migration)],
  ["future billing skeleton", /billing_provider[\s\S]+subscription_reference[\s\S]+billing_started_at[\s\S]+billing_ended_at/.test(migration)],
  ["no payment integration", !/stripe|checkout|webhook/i.test(migration)],
  ["seat reduction protection", /Cannot reduce this school''s seat entitlement/.test(migration)],
  ["immutable audit", /reject_platform_audit_mutation[\s\S]+before update or delete/.test(migration)],
  ["aggregated platform read", /get_platform_admin_overview/.test(migration) && /get_platform_admin_school_summaries/.test(migration)],
  ["parent relationship separate", /parent_student_links/.test(migration) && /access_source = 'home'/.test(migration)],
  ["owner login routing", /api\/admin-session/.test(login)],
  ["http-only owner session", /httpOnly: true/.test(fs.readFileSync(path.join(root, "app/api/admin-session/route.ts"), "utf8"))],
  ...requiredFiles.map((file) => [`route or documentation: ${file}`, fs.existsSync(path.join(root, file))]),
];

const failures = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
if (failures.length) process.exitCode = 1;
