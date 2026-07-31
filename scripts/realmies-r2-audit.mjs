import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const foundationPath = path.join(
  root,
  "supabase/migrations/20260731100000_realmies_secure_data_foundation.sql",
);
const integrationPath = path.join(
  root,
  "supabase/migrations/20260731101000_integrate_realmie_posttest_unlocks.sql",
);
const testPath = path.join(root, "supabase/tests/realmies_r2.sql");

const foundation = fs.readFileSync(foundationPath, "utf8");
const integration = fs.readFileSync(integrationPath, "utf8");
const tests = fs.readFileSync(testPath, "utf8");

const expectedKeys = [
  "number-nexus-numbot-counter-standard",
  "number-nexus-numbot-builder-standard",
  "number-nexus-numbot-processor-standard",
  "number-nexus-numbot-solver-standard",
  "number-nexus-numbot-calculator-standard",
  "number-nexus-numbot-equationator-standard",
  "measurelands-meazurex-ticklet-standard",
  "measurelands-meazurex-measurer-standard",
  "measurelands-meazurex-tracker-standard",
  "measurelands-meazurex-balancer-standard",
  "measurelands-meazurex-calibrator-standard",
  "measurelands-meazurex-timewielder-standard",
  "starpath-geospin-roller-standard",
  "starpath-geospin-mapper-standard",
  "starpath-geospin-navigator-standard",
  "starpath-geospin-shapeshifter-standard",
  "starpath-geospin-galaxycrafter-standard",
  "starpath-geospin-starweaver-standard",
];

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

for (const key of expectedKeys) {
  assert(foundation.includes(`'${key}'`), `Missing catalogue key: ${key}`);
}

const seededKeys = [
  ...foundation.matchAll(
    /\('((?:number-nexus|measurelands|starpath)-[^']+-standard)'/g,
  ),
].map((match) => match[1]);

assert(seededKeys.length === 18, `Expected 18 seeded keys, found ${seededKeys.length}`);
assert(new Set(seededKeys).size === 18, "Seeded Realmie keys are not unique");
assert(!foundation.toLowerCase().includes("'datara'"), "Datara must remain unseeded");
assert(!foundation.includes("'pet'"), "Pet Realmies must remain unseeded");
assert(
  foundation.includes("asset_path ~ '^/realmies/"),
  "Catalogue asset paths are not constrained to the Realmies namespace",
);
assert(
  foundation.includes("public.request_student_session_token() is null"),
  "Student Realmies access does not require an opaque student session",
);
assert(
  !foundation.includes("student.user_id"),
  "Realmies must not depend on the removed students.user_id identity model",
);
assert(
  foundation.includes("'collection_filter', v_context->'collection_filter'"),
  "Realmies telemetry does not use an explicit context allowlist",
);

for (const table of [
  "realmie_catalogue",
  "student_realmies",
  "realmie_unlock_receipts",
  "student_realmie_favourites",
  "student_realmie_display_slots",
  "student_realmie_backfill_state",
  "realmie_product_events",
]) {
  assert(
    foundation.includes(`alter table public.${table} enable row level security`),
    `RLS is not enabled for ${table}`,
  );
  assert(
    foundation.includes(`revoke all on table public.${table}`),
    `Direct table privileges are not revoked for ${table}`,
  );
}

assert(
  integration.includes("create or replace function public.complete_realm_assessment"),
  "Canonical assessment command is not integrated",
);
assert(
  integration.includes("if p_assessment_type = 'posttest' then"),
  "Realmie evaluation is not post-test scoped",
);
assert(
  integration.includes("grant_standard_realmie_for_canonical_posttest"),
  "Canonical post-test does not invoke the server-only grant evaluator",
);
assert(
  !integration.includes("weekly_quiz"),
  "Weekly quiz logic must not grant standard Realmies",
);
assert(
  integration.includes("backfill_standard_realmies_internal"),
  "Canonical historical backfill is missing",
);

for (const requiredTest of [
  "84 percent post-test does not grant",
  "pre-test cannot grant a standard Realmie",
  "weekly quiz cannot grant a standard Realmie",
  "forced Realmie failure rolls back assessment attempt",
  "backfill does not change XP",
  "backfill does not award Gems",
  "backfill does not alter Hall of Legends state",
  "student cannot read another collection",
  "parent cannot write Realmie state",
]) {
  assert(tests.includes(requiredTest), `Missing R2 test: ${requiredTest}`);
}

if (failures.length > 0) {
  console.error("Realmies R2 audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Realmies R2 audit passed.");
console.log("- 18 stable standard Legend keys");
console.log("- server-only atomic post-test integration");
console.log("- isolated ownership, receipts, favourites and six display slots");
console.log("- RLS/direct-grant controls and canonical backfill coverage");
