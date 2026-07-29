import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const migration = read(
  "supabase/migrations/20260730100000_explorer_code_identity_foundation.sql",
);
const server = read("lib/school-platform-server.ts");
const schoolClient = read("components/school/SchoolHomeClient.tsx");
const commandRoute = read("app/api/school/[schoolId]/command/route.ts");
const teacherClasses = read("app/teacher/classes/page.tsx");
const architecture = read("docs/EXPLORER_CODE_ARCHITECTURE.md");

const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function generateTestCode() {
  let body = "";
  while (body.length < 8) {
    const bytes = crypto.randomBytes(16);
    for (const byte of bytes) {
      if (byte < Math.floor(256 / alphabet.length) * alphabet.length) {
        body += alphabet[byte % alphabet.length];
      }
      if (body.length === 8) break;
    }
  }
  return `LUL-${body.slice(0, 4)}-${body.slice(4)}`;
}

const generated = new Set();
for (let index = 0; index < 100_000; index += 1) {
  generated.add(generateTestCode());
}

const checks = [
  [
    "dedicated immutable history table",
    /create table if not exists public\.student_explorer_codes/.test(migration) &&
      /status in \('active', 'revoked'\)/.test(migration) &&
      /replacement_code_id/.test(migration),
  ],
  [
    "global historical uniqueness",
    /student_explorer_codes_code_normalised_key[\s\S]*code_normalised/.test(
      migration,
    ),
  ],
  [
    "one active code per student",
    /student_explorer_codes_one_active_per_student[\s\S]*where status = 'active'/.test(
      migration,
    ),
  ],
  [
    "human-safe canonical format",
    /\^LUL-\[23456789ABCDEFGHJKMNPQRSTUVWXYZ\]\{4\}-/.test(migration),
  ],
  [
    "server cryptographic generation",
    /extensions\.gen_random_bytes\(16\)/.test(migration) &&
      /get_byte\(v_bytes, v_index\) < 248/.test(migration) &&
      /generate_explorer_code_candidate/.test(migration),
  ],
  [
    "collision retry",
    /loop[\s\S]*unique_violation[\s\S]*return v_code/.test(migration),
  ],
  [
    "normalisation accepts separator variants",
    /regexp_replace\(upper\(trim\(p_code\)\), '\[\^A-Z0-9\]'/.test(migration),
  ],
  [
    "new student transaction trigger",
    /after insert on public\.students[\s\S]*assign_explorer_code_after_student_insert/.test(
      migration,
    ),
  ],
  [
    "idempotent existing-student backfill",
    /Explorer Code backfill created/.test(migration) &&
      /not exists[\s\S]*explorer\.status = 'active'/.test(migration),
  ],
  [
    "backfill resolves deferred trigger events before table alteration",
    /set constraints student_explorer_codes_replacement_code_id_fkey immediate;[\s\S]*alter table public\.student_explorer_codes enable row level security/.test(
      migration,
    ),
  ],
  [
    "protected exact lookup",
    /lookup_student_by_explorer_code[\s\S]*code_normalised = public\.normalise_explorer_code[\s\S]*can_view_student/.test(
      migration,
    ),
  ],
  [
    "school-scoped reset with reason",
    /reset_student_explorer_code[\s\S]*p_school_id[\s\S]*Reset reason is required[\s\S]*does not belong to the active school/.test(
      migration,
    ),
  ],
  [
    "reset audit excludes raw codes",
    /student_explorer_code_reset/.test(migration) &&
      /code_record_id/.test(migration) &&
      !/previous_state[\s\S]{0,180}'code'/.test(migration),
  ],
  [
    "table writes remain RPC-only",
    /revoke all on public\.student_explorer_codes[\s\S]*authenticated/.test(
      migration,
    ) && !/grant (insert|update|delete)/i.test(migration),
  ],
  [
    "school directory hides plaintext PIN",
    /'pinStatus'/.test(migration) &&
      !/jsonb_build_object\([\s\S]*?'pin', student\.pin/.test(migration),
  ],
  [
    "administrator directory UI",
    /School Students/.test(schoolClient) &&
      /Explorer Code/.test(schoolClient) &&
      /Reset Explorer Code/.test(schoolClient),
  ],
  [
    "teacher roster reads authorised codes",
    /get_student_explorer_codes/.test(teacherClasses) &&
      /Explorer Code:/.test(teacherClasses),
  ],
  [
    "reset uses protected server command",
    /reset_student_explorer_code/.test(commandRoute) &&
      /p_school_id: schoolId/.test(commandRoute),
  ],
  [
    "school snapshot has additive deployment fallback",
    /getSchoolStudentDirectory/.test(server) &&
      /ordinary teachers do not have school-directory permission/.test(server),
  ],
  ["100k generated test codes are unique", generated.size === 100_000],
  [
    "security limitations documented",
    /not a login secret/.test(architecture) &&
      /never sufficient authority/.test(architecture),
  ],
];

const failures = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
}

if (failures.length > 0) process.exitCode = 1;
