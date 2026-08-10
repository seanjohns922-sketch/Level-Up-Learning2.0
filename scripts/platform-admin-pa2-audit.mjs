import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const migration = read("supabase/migrations/20260811130000_platform_admin_pa2_school_lifecycle.sql");
const list = read("components/admin/SchoolsAdminClient.tsx");
const lifecycle = read("components/admin/SchoolLifecycleManager.tsx");
const api = read("app/api/admin/command/route.ts");
const docs = read("docs/PLATFORM_ADMIN_PHASE_PA2_SCHOOL_LIFECYCLE.md");

const checks = [
  ["default list excludes archived", list.includes('useState<Filter>("current")') && list.includes('school.status === "archived"')],
  ["dedicated archived filter", list.includes('["archived", "Archived"]')],
  ["atomic provisioning command", migration.includes("platform_owner_provision_school") && migration.includes("platform_command_receipts")],
  ["duplicate school code protection", migration.includes("School code is already in use")],
  ["academic year and licence created", migration.includes("insert into public.academic_years") && migration.includes("insert into public.school_licence_entitlements")],
  ["existing account membership", migration.includes("v_admin_status := 'membership_added'")],
  ["new account invitation", migration.includes("v_admin_status := 'invitation_created'")],
  ["no password provisioning", !migration.toLowerCase().includes("password") && !lifecycle.toLowerCase().includes("temporary password")],
  ["seat reduction blocked", migration.includes("Cannot reduce this school''s seat entitlement")],
  ["archive reason required", migration.includes("if nullif(trim(coalesce(p_reason")],
  ["school entitlements held", migration.includes("access_source = 'school'") && migration.includes("lifecycle_held_at")],
  ["home entitlements untouched", !migration.includes("access_source = 'home' and status = 'revoked'")],
  ["parent links untouched", !migration.includes("delete from public.parent_student_links")],
  ["identity records untouched", !migration.includes("delete from public.students") && !migration.includes("delete from public.user_profiles")],
  ["cross-school membership scoped", migration.includes("where school_id = p_school_id")],
  ["enrolment lifecycle guard", migration.includes("guard_school_enrolment_lifecycle")],
  ["invitation lifecycle guard", migration.includes("guard_school_invitation_lifecycle")],
  ["restore avoids membership inserts", migration.includes("update public.school_memberships set status = coalesce(lifecycle_previous_status")],
  ["restore only reactivates held class staffing", migration.includes("staffing.lifecycle_held_at is not null")],
  ["legacy lifecycle mutation revoked", migration.includes("platform_owner_update_school_licence") && migration.includes("from authenticated")],
  ["final administrator confirmation", migration.includes("p_confirm_final_admin") && lifecycle.includes("only active administrator")],
  ["owner-only commands", (migration.match(/if not public\.is_platform_owner\(\)/g) ?? []).length >= 7],
  ["immutable audit events", ["school_created","school_updated","school_code_changed","school_paused","school_reactivated","school_archived","school_restored","seat_limit_changed","school_admin_invited","school_admin_added","school_admin_deactivated","school_admin_restored"].every((event) => migration.includes(`'${event}'`))],
  ["API uses canonical PA2 commands", api.includes("platform_owner_transition_school") && api.includes("platform_owner_assign_school_admin")],
  ["PA2 documentation", docs.includes("Home access") && docs.includes("Archived")],
];

const failed = checks.filter(([, pass]) => !pass);
for (const [name, pass] of checks) console.log(`${pass ? "PASS" : "FAIL"} ${name}`);
console.log(`\nPA2 audit: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exit(1);
