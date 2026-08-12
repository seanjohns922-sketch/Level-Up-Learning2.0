import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const migration = read("supabase/migrations/20260812100000_platform_admin_pa4_identity_parent_home.sql");
const safety = read("supabase/migrations/20260812110000_platform_admin_pa4_safety_hardening.sql");
const parentBoundary = read("supabase/migrations/20260812120000_platform_admin_pa4_parent_read_write_boundary.sql");
const parentGemArtwork = read("supabase/migrations/20260813080000_parent_achievement_gem_artwork.sql");
const parentWeeklyJourney = read("supabase/migrations/20260813090000_parent_weekly_journey_activity.sql");
const parentRealmProgress = read("supabase/migrations/20260813100000_parent_realm_lesson_progress.sql");
const safetyTests = read("supabase/tests/platform_admin_pa4_safety.sql");
const parent = read("components/parent/ParentPortal.tsx");
const login = read("app/login/page.tsx");
const schoolApi = read("app/api/school/[schoolId]/command/route.ts");
const schoolUi = read("components/school/SchoolHomeClient.tsx");
const adminApi = read("app/api/admin/command/route.ts");
const adminUi = read("components/admin/IdentityCentreClient.tsx");
const adminLayout = read("app/admin/layout.tsx");
const adminNav = read("components/admin/PlatformAdminShell.tsx");
const rules = read("lib/assessment-rules.ts");
const docs = read("docs/PLATFORM_ADMIN_PHASE_PA4_IDENTITY_PARENT_HOME.md");
const architecture = read("docs/PLATFORM_ADMIN_MASTER_ARCHITECTURE.md");

let passed = 0;
let failed = 0;
const failures = [];
function check(name, condition) {
  if (condition) {
    passed += 1;
    console.log(`PASS ${name}`);
  } else {
    failed += 1;
    failures.push(name);
    console.error(`FAIL ${name}`);
  }
}
const has = (source, ...needles) => needles.every((needle) => source.includes(needle));
const functionBody = (name) => {
  const start = migration.indexOf(`create or replace function public.${name}`);
  const end = migration.indexOf("\n$$;", start);
  return start >= 0 && end >= 0 ? migration.slice(start, end) : "";
};
const safetyFunctionBody = (name) => {
  const start = safety.indexOf(`create or replace function public.${name}`);
  const end = safety.indexOf("\n$$;", start);
  return start >= 0 && end >= 0 ? safety.slice(start, end) : "";
};
const parentBoundaryFunctionBody = (name) => {
  const start = parentBoundary.indexOf(`create or replace function public.${name}`);
  const end = parentBoundary.indexOf("\n$$;", start);
  return start >= 0 && end >= 0 ? parentBoundary.slice(start, end) : "";
};

// Canonical identity and lifecycle foundation.
check("student identity has active and merged states", has(migration, "identity_status", "('active', 'merged')"));
check("merged identity points to survivor", has(migration, "merged_into_student_id", "merged_at", "merged_by"));
check("school relationship is separate history", has(migration, "student_school_memberships", "student_school_transfer_events"));
check("one active school membership per child", migration.includes("student_school_one_active_idx"));
check("parent relationship remains separate", migration.includes("parent_student_links"));
check("Home entitlement remains separate", has(migration, "student_access_entitlements", "access_source='home'"));
check("identity audit is immutable", has(migration, "student_identity_audit_immutable", "before update or delete"));
check("identity tables use RLS", (migration.match(/enable row level security/g) ?? []).length >= 6);
check("identity tables are not directly writable", has(migration, "revoke all on public.student_school_memberships", "from public, anon, authenticated"));

// Parent linking and Home access.
for (const fn of ["preview_parent_child_link", "confirm_parent_child_link", "activate_free_home_access", "get_parent_home_snapshot", "get_parent_child_realm_snapshot"]) {
  check(`${fn} exists`, migration.includes(`function public.${fn}`));
}
check("parent role is enforced", functionBody("assert_parent_role").includes("Parent access required"));
check("Explorer Code is normalized", functionBody("preview_parent_child_link").includes("normalise_explorer_code"));
check("invalid Explorer Code does not reveal identity", has(functionBody("preview_parent_child_link"), "'not_matched'", "That Explorer Code could not be verified."));
check("parent link attempts are rate limited", has(functionBody("preview_parent_child_link"), "interval '15 minutes'", "v_attempts >= 8", "throttled"));
check("parent preview exposes limited confirmation", has(functionBody("preview_parent_child_link"), "'firstName'", "'lastInitial'", "'yearLevel'", "'schoolName'"));
check("parent confirmation is idempotent", /on conflict\s*\(parent_user_id,\s*student_id\)\s*do update/i.test(functionBody("confirm_parent_child_link")));
check("parent confirmation requires a second factor", has(safetyFunctionBody("confirm_parent_child_link"), "p_student_pin", "credential_type='pin'", "pin_not_matched"));
check("failed PIN attempts survive the RPC", has(safetyFunctionBody("confirm_parent_child_link"), "'linked',false", "'status','not_matched'"));
check("failed Explorer Code attempts survive the RPC", has(safetyFunctionBody("preview_parent_child_link"), "'matched',false", "'status','not_matched'", "'status','throttled'"));
check("Explorer-Code-only confirmation is removed", has(safety, "drop function if exists public.confirm_parent_child_link(text,text)", "confirm_parent_child_link(text,text,text)"));
check("multiple parents are supported", !migration.includes("unique(student_id)"));
check("one parent can link multiple children", migration.includes("unique(parent_user_id, student_id)") || read("supabase/migrations/20260420090000_account_linking_foundation.sql").includes("unique(parent_user_id, student_id)"));
check("Home activation is free for 2026", has(functionBody("activate_free_home_access"), "'free'", "2026"));
check("Home activation has no payment provider", !functionBody("activate_free_home_access").match(/stripe|checkout|card|payment_method/i));
check("Home access is not required for parent linking", !functionBody("confirm_parent_child_link").includes("activate_free_home_access"));
check("parent portal has no direct table writes", !parent.match(/insert\(|update\(|delete\(|\.from\([^)]*\)\.upsert/i));
check("parent route is selected after login", login.includes('role: "parent"') && /router\.(push|replace)\("\/parent"\)/.test(login));
check("parent supports child linking", has(parent, "Link a child", "preview_parent_child_link", "confirm_parent_child_link"));
check("parent signup offers optional existing-student linking", has(login, "Link an existing student account", "parentLinkExisting", "Explorer Code", "Child’s 4-digit PIN"));
check("parent signup linking uses both PA4 verification steps", has(login, 'supabase.rpc("preview_parent_child_link"', 'supabase.rpc("confirm_parent_child_link"', "p_student_pin: parentStudentPin"));
check("parent signup never retains the child PIN", has(login, "retainPendingParentExplorerCode", 'setParentStudentPin("")') && !login.includes("sessionStorage.setItem(PENDING_PARENT_EXPLORER_CODE_KEY, parentStudentPin)"));
check("parent signup linking does not create a duplicate student", !login.match(/parentLinkExisting[\s\S]{0,3000}create_home_student_for_parent/));
check("parent client requires explicit link success", has(parent, "data.linked !== true", "child details could not be verified"));
check("parent client requires explicit preview success", has(parent, "data.matched !== true", "Explorer Code could not be verified"));
check("parent supports multiple-child selection", has(parent, "children.map", "activeStudentId", "setActiveStudentId"));
check("parent has neutral empty states", has(parent, "Learning hasn’t started yet.", "No assessments completed yet.", "Not started"));
check("parent has responsive child layout", parent.includes("md:grid-cols-2"));
check("parent detail has compact metrics", parent.includes("sm:grid-cols-3"));
check("parent snapshot returns canonical Gem identity", has(parentGemArtwork, "'gemId', definition.id", "student_gems", "gem_definitions"));
check("parent achievements use canonical Gem artwork", has(parent, "GemIcon", "cutForGem(item.gemId, item.rarity)"));
check("parent weekly journey includes saved activity weeks", has(parentWeeklyJourney, "student_lesson_attempts lesson", "student_weekly_quiz_attempts quiz", "union all"));
check("parent weekly journey uses canonical curriculum labels", has(parent, "curriculumWeek", "planned?.title", "plan?.title"));
check("parent realm detail lists the complete canonical level", has(parent, "curriculumWeeks", "allWeeks", '"Not started"'));
check("parent realm detail removes required pathway metric", !parent.includes('<SummaryMetric label="Required pathway"'));
check("parent assessments include the working level", parent.includes("{levelLabel} {assessmentName(item.type)}"));
check("parent realm progress counts unique completed lessons", has(parentRealmProgress, "'completedLessons'", "select distinct attempt.week, attempt.lesson", "attempt.completed=true"));
check("parent realm percentage uses complete level lessons", has(parent, "completedLessons / totalLessons", "of {totalLessons} lessons completed"));
check("parent signup captures a full name", has(login, "parentFirstName", "parentLastName", "first_name: firstName", "display_name: `${firstName} ${lastName}`"));

// Curriculum progress and assessment reporting.
for (const realm of ["Number Nexus", "Measurelands", "Starpath"]) check(`parent realm label ${realm}`, parent.includes(realm));
check("parent snapshot reads canonical lesson attempts", functionBody("get_parent_child_realm_snapshot").includes("student_lesson_attempts"));
check("parent snapshot reads canonical quiz attempts", functionBody("get_parent_child_realm_snapshot").includes("student_weekly_quiz_attempts"));
check("parent snapshot reads canonical assessments", functionBody("get_parent_child_realm_snapshot").includes("student_realm_assessments"));
check("parent snapshot reads canonical progression", functionBody("get_parent_child_realm_snapshot").includes("student_realm_progress"));
check("targeted required weeks are returned", has(functionBody("get_parent_child_realm_snapshot"), "required_weeks", "optional_weeks"));
check("assessment threshold is canonical 85 percent", has(rules, "pretestPassPercent: 85", "posttestPassPercent: 85"));
check("parent snapshot reports 85 percent", functionBody("get_parent_child_realm_snapshot").includes("'passThreshold',85"));

// School linking, transfer, and duplicate prevention.
for (const fn of ["preview_school_student_link", "link_existing_student_to_school", "preview_school_student_creation", "approve_school_student_creation_override"]) {
  check(`${fn} exists`, migration.includes(`function public.${fn}`));
}
check("school UI separates link existing and create new", has(schoolUi, "Link existing", "Create new"));
check("school link uses Explorer Code preview", has(schoolApi, "previewExistingStudent", "preview_school_student_link"));
check("school link preserves canonical student id", has(schoolApi, "linkExistingStudent", "link_existing_student_to_school"));
check("school transfer records from and to schools", has(functionBody("link_existing_student_to_school"), "student_school_transfer_events", "from_school_id", "to_school_id"));
check("school transfer preserves parent and Home records", !functionBody("link_existing_student_to_school").match(/delete from public\.parent_student_links|delete from public\.student_access_entitlements/i));
check("creation performs duplicate preview", has(schoolApi, "preview_school_student_creation", "potential_duplicate"));
check("bulk creation does not silently bypass duplicates", schoolApi.includes("Potential existing student found. Review before creating a new identity."));
check("creation override is explicit", has(schoolApi, "duplicateRequestId", "approve_school_student_creation_override"));
check("duplicate matching is scoped to active identities", functionBody("preview_school_student_creation").includes("identity_status"));

// Owner-only merge workflow and integrity.
check("admin routes require platform owner", adminLayout.includes("requirePlatformOwner"));
check("Identity Centre is in owner navigation", has(adminNav, 'href: "/admin/identity"', 'label: "Identity"'));
for (const queue of ["Pending parent links", "Potential duplicates", "Pending school links", "Pending merge reviews", "Retired and merged identities", "School transfers"]) {
  check(`Identity Centre exposes ${queue}`, adminUi.includes(queue));
}
check("transfer queue returns readable student and school names", has(functionBody("get_platform_identity_centre"), "'studentName'", "'fromSchoolName'", "'toSchoolName'"));
check("merge requires owner request", functionBody("request_student_identity_merge").includes("is_platform_owner"));
check("merge requires owner resolution", functionBody("resolve_student_identity_merge").includes("is_platform_owner"));
check("survivor and duplicate cannot match", migration.includes("survivor_student_id <> duplicate_student_id"));
check("merge creates preview", has(functionBody("request_student_identity_merge"), "jsonb_build_object", "preview"));
check("merge requires request reason", has(adminUi, ">Reason<", "reason.trim()"));
check("merge requires final review reason", has(adminUi, "Final review reason", "reviewReason.trim()"));
check("merge supports rejection", has(adminApi, "p_approve: payload.approve === true", "resolve_student_identity_merge"));
check("merge detects protected-domain conflicts", has(safetyFunctionBody("get_student_identity_merge_conflicts"), "educational_progress", "economy", "home_entitlements", "class_enrolments"));
check("merge approval fails closed", has(safetyFunctionBody("resolve_student_identity_merge"), "Merge blocked by unresolved identity conflicts", "for update"));
check("overlapping merges lock both identities", (safetyFunctionBody("resolve_student_identity_merge").match(/pg_advisory_xact_lock/g) ?? []).length === 2);
check("merge UI hides approval for blocked previews", has(adminUi, "previewIsMergeable", "Merge blocked", "previewConflicts"));
check("retired duplicate sessions are revoked", safetyFunctionBody("resolve_student_identity_merge").includes("student_access_sessions"));
check("retired duplicate credentials are revoked", safetyFunctionBody("resolve_student_identity_merge").includes("student_access_credentials"));
check("canonical access denies archived and merged students", has(parentBoundaryFunctionBody("can_access_student_read"), "archived_at is null", "identity_status") && has(parentBoundaryFunctionBody("can_write_student"), "archived_at is null", "identity_status"));
check("canonical read predicate includes parent links", parentBoundaryFunctionBody("can_access_student_read").includes("parent_student_links"));
check("canonical write predicate excludes parent links", !parentBoundaryFunctionBody("can_write_student").includes("parent_student_links"));
check("legacy student assertion is a write gate", parentBoundaryFunctionBody("assert_student_access").includes("assert_student_write"));
check("student progress reads use read predicate", parentBoundaryFunctionBody("get_student_realm_progress_compat_secure").includes("assert_student_read"));
check("school reporting uses event-time attribution", has(safetyFunctionBody("get_platform_admin_school_detail"), "student_belonged_to_school_at", "class_id"));
check("PA4 executable safety fixtures exist", has(safetyTests, "resolve_student_identity_merge", "pin_not_matched", "retired-token", "student_belonged_to_school_at", "linked parent cannot complete a lesson"));
check("PA4 fixture plan matches its assertions", safetyTests.includes("select plan(68)") && (safetyTests.match(/^select (?:has_function|function_returns|ok|is|lives_ok|alike|throws_ok)\(/gmi) ?? []).length === 68);
for (const table of [
  "student_lesson_attempts", "student_weekly_quiz_attempts", "student_realm_assessments",
  "student_realm_progress", "parent_student_links", "student_gems", "gem_award_events",
  "student_inventory", "student_realmies", "realmie_unlock_receipts",
  "student_economy_transactions", "student_economy_wallets", "student_access_entitlements",
  "student_school_memberships", "class_enrollments", "student_explorer_codes",
]) check(`merge preserves ${table}`, functionBody("resolve_student_identity_merge").includes(table));
check("duplicate identity is retired", has(functionBody("resolve_student_identity_merge"), "identity_status='merged'", "merged_into_student_id=v_survivor.id"));
check("merge audit records survivor and duplicate", has(functionBody("resolve_student_identity_merge"), "identity_merge_approved", "related_student_id"));

// Product scope and operating guidance.
check("no school-hours restriction", !migration.match(/school_hours|business_hours|extract\(hour/i));
check("no billing implementation", ![parent, schoolUi, adminUi].some((source) => source.match(/stripe|checkout|credit card|payment method/i)));
for (const heading of ["Identity invariant", "Parent linking", "School transfer", "Duplicate handling", "Merge recovery", "Manual QA"]) check(`runbook documents ${heading}`, docs.includes(heading));
check("master architecture links PA4 runbook", architecture.includes("PLATFORM_ADMIN_PHASE_PA4_IDENTITY_PARENT_HOME.md"));
check("historical school reporting boundary is documented", has(docs, "Historical reporting", "Reporting resolves school ownership", "cannot see learning completed under the new school"));
for (const scenario of ["Home Only to School + Home", "School A to School B", "Multiple parents", "Multiple children", "Duplicate prevention", "Merge integrity", "Mobile parent portal"]) check(`manual test: ${scenario}`, docs.includes(scenario));

console.log(`\nPA4 AUDIT: ${passed} passed, ${failed} failed`);
if (failures.length) console.error(`Failing checks:\n${failures.map((name) => `- ${name}`).join("\n")}`);
process.exitCode = failed ? 1 : 0;
