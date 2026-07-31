import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const correctionPath =
  "supabase/migrations/20260731103000_correct_realmies_to_discovery_model.sql";
const correction = read(correctionPath);
const integration = read(
  "supabase/migrations/20260731101000_integrate_realmie_posttest_unlocks.sql",
);
const test = read("supabase/tests/realmies_r2.sql");
const header = read("components/economy/EconomyHeader.tsx");
const home = read("app/home-base/page.tsx");
const collectionPage = read("app/my-realmies/page.tsx");
const collectionService = read("lib/realmies.ts");
const release = read(
  "supabase/migrations/20260731120000_release_live_realmie_collection_assets.sql",
);

const expectedRealmies = [
  "number-nexus-bitling-standard",
  "number-nexus-carrybot-standard",
  "number-nexus-codekeeper-standard",
  "number-nexus-neon-sentinel-standard",
  "measurelands-gaugekin-standard",
  "measurelands-ruleroot-standard",
  "measurelands-compass-keeper-standard",
  "measurelands-golden-surveyor-standard",
  "starpath-orbitling-standard",
  "starpath-prism-scout-standard",
  "starpath-constellation-keeper-standard",
  "starpath-aurora-guardian-standard",
  "global-fogling-standard",
  "global-mist-mischief-standard",
  "global-shadow-of-forgetfulness-standard",
];

const checks = [];
const check = (label, condition) => checks.push({ label, condition });

for (const realmieKey of expectedRealmies) {
  check(`catalogue seeds ${realmieKey}`, correction.includes(`'${realmieKey}'`));
}

check(
  "retires Legend catalogue rows without deleting history",
  correction.includes("category = 'legend'") &&
    correction.includes("is_collectible = false") &&
    !correction.includes("delete from public.student_realmies"),
);
check(
  "retires every unapproved catalogue row",
  correction.includes("where realmie_key not in ("),
);
check(
  "enforces exact 15-item 4/4/4/3 distribution",
  correction.includes("Realmies correction invariant failed") &&
    correction.includes("v_collectible_count <> 15") &&
    correction.includes("v_number_count <> 4") &&
    correction.includes("v_measurement_count <> 4") &&
    correction.includes("v_space_count <> 4") &&
    correction.includes("v_global_count <> 3"),
);
check(
  "forbids pets and main Legends",
  correction.includes("category in ('legend', 'pet')") &&
    correction.includes(
      "lower(character_key) in ('numbot', 'meazurex', 'geospin', 'datara')",
    ),
);
check(
  "uses canonical lesson and quiz evidence",
  correction.includes("student_lesson_attempts") &&
    correction.includes("student_weekly_quiz_attempts"),
);
check(
  "uses unique lesson identity",
  correction.includes(
    "select distinct attempt.realm_id, attempt.working_level, attempt.week, attempt.lesson",
  ),
);
check(
  "uses unique weekly quiz identity and 80 percent pass rule",
  correction.includes(
    "select distinct attempt.realm_id, attempt.working_level, attempt.week",
  ) && correction.includes("attempt.accuracy_percent >= 80"),
);
check(
  "reuses the existing canonical streak source",
  correction.includes("from public.student_activity_daily activity") &&
    correction.includes(
      "'streak_evidence_uses_existing_canonical_activity_daily', true",
    ) &&
    !correction.includes("with active_days as ("),
);
check(
  "excludes demo review and teacher-advanced evidence",
  ["demo_mode", "review_mode", "teacher_advanced"].every((token) =>
    correction.includes(token),
  ),
);
check(
  "uses deferred canonical-save triggers",
  correction.includes("deferrable initially deferred") &&
    correction.includes("trg_evaluate_realmie_lesson_discoveries") &&
    correction.includes("trg_evaluate_realmie_quiz_discoveries"),
);
check(
  "supports idempotent backfill",
  correction.includes("backfill_realmie_discoveries_internal") &&
    correction.includes("on conflict (student_id, realmie_id) do nothing"),
);
check(
  "removes post-test Realmie grants",
  correction.includes(
    "drop function if exists public.grant_standard_realmie_for_canonical_posttest",
  ) &&
    correction.includes(
      "drop function if exists public.backfill_standard_realmies_internal",
    ),
);
check(
  "preserves assessment advisory lock",
  correction.includes("pg_advisory_xact_lock"),
);
check(
  "filters student teacher and parent reads",
  (correction.match(/catalogue\.is_collectible/g) ?? []).length >= 12 &&
    correction.includes("get_teacher_student_realmie_summary_secure") &&
    correction.includes("get_parent_student_realmie_summary_secure"),
);
check(
  "keeps internal evaluator client-inaccessible",
  correction.includes(
    "revoke all on function public.evaluate_realmie_discoveries_internal",
  ),
);
check(
  "records a correction report",
  correction.includes("realmie_architecture_correction_reports") &&
    correction.includes("historical_ownership_rows_preserved"),
);
check(
  "old integration is explicitly superseded",
  integration.includes("grant_standard_realmie_for_canonical_posttest") &&
    correction.includes("posttest_grants_removed"),
);
check(
  "My Realmies navigation is released",
  header.includes("My Realmies") &&
    header.includes("/my-realmies") &&
    home.includes("/my-realmies"),
);
check(
  "collection route contains the two released realms",
  collectionPage.includes("Number Nexus") &&
    collectionPage.includes("Measurelands") &&
    collectionPage.includes("Starpath Realmies") &&
    collectionPage.includes("Coming Soon") &&
    !collectionPage.includes("Fog Collection"),
);
check(
  "collection uses canonical production RPCs and isolated demo preferences",
  collectionService.includes("get_student_realmies_secure") &&
    collectionService.includes("set_student_realmie_favourite_secure") &&
    collectionService.includes("set_student_realmie_display_slot_secure") &&
    collectionService.includes("isDemoPreviewMode"),
);
check(
  "release migration exposes exactly eight finished digital assets",
  release.includes("v_ready_count <> 8") &&
    release.includes("realm_id in ('number', 'measurement')") &&
    release.includes("'asset_status', 'ready'"),
);
check(
  "release migration keeps Starpath coming soon and Fog hidden",
  release.includes("realm_id = 'space'") &&
    release.includes("'collection_status', 'coming_soon'") &&
    release.includes("realm_id = 'global'") &&
    release.includes("'student_visible', false"),
);
check(
  "SQL regression covers architecture correction",
  [
    "exactly 15 active collectible standard Realmies",
    "main Legends are not collectible Realmies",
    "post-tests do not grant Realmies",
    "backfill is idempotent",
  ].every((label) => test.includes(label)),
);

const failed = checks.filter(({ condition }) => !condition);
for (const { label, condition } of checks) {
  console.log(`${condition ? "PASS" : "FAIL"} ${label}`);
}

if (failed.length > 0) {
  console.error(`\n${failed.length} Realmies R2 audit check(s) failed.`);
  process.exit(1);
}

console.log(`\nRealmies R2 correction audit passed (${checks.length} checks).`);
