import assert from "node:assert/strict";
import fs from "node:fs";

const migration = fs.readFileSync(
  new URL("../supabase/migrations/20260719193000_fix_class_creation_pgcrypto_resolution.sql", import.meta.url),
  "utf8",
);

assert.match(migration, /create or replace function public\.create_class_for_teacher/);
assert.match(migration, /extensions\.gen_random_bytes\(5\)/);
assert.doesNotMatch(migration, /(?<!extensions\.)gen_random_bytes\(5\)/);
assert.match(migration, /revoke all on function public\.create_class_for_teacher[\s\S]*from public, anon/);
assert.match(migration, /grant execute on function public\.create_class_for_teacher[\s\S]*to authenticated/);

console.log("Class creation pgcrypto audit passed: school codes use extensions.gen_random_bytes and authenticated-only execution.");
