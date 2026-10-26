import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// A learner's built world is saved to their account through two guarded functions.
const sql = readFileSync("supabase/migrations/20261026100000_student_world_layouts.sql", "utf8");
const fn = (name) => {
  const start = sql.indexOf(`function public.${name}(`);
  assert.ok(start > 0, `${name} is defined`);
  return sql.slice(start, sql.indexOf("$$;", start));
};

assert.match(sql, /alter table public\.student_world_layouts enable row level security/, "table has RLS on");
assert.match(sql, /revoke all on table public\.student_world_layouts from public, anon, authenticated/, "no direct table access");
assert.doesNotMatch(sql, /create policy/i, "no table policies: access is through the functions only");
assert.match(sql, /references public\.students\(id\) on delete cascade/, "a world belongs to one student and goes with them");

const read = fn("get_student_world_layout_secure");
assert.match(read, /perform public\.assert_student_read\(p_student_id\)/, "reading uses the student-read boundary");
assert.match(read, /security definer/);
assert.match(read, /set search_path = public/);

const save = fn("save_student_world_layout_secure");
assert.match(save, /perform public\.assert_student_write\(p_student_id\)/, "saving uses the student-write boundary (never a parent)");
assert.doesNotMatch(save, /assert_student_read|can_access_student\b/, "saving does not use a read check");
assert.match(save, /jsonb_array_length\(p_placements\) > 3000/, "placement count is capped");
assert.match(save, /jsonb_array_length\(p_ground_tiles\) > 5000/, "ground tile count is capped");
assert.match(save, /pg_column_size\(p_placements\) \+ pg_column_size\(p_ground_tiles\) > 1048576/, "layout size is capped");
assert.match(save, /jsonb_typeof\(p_placements\) is distinct from 'array'/, "only lists are accepted");

// Student sessions run as anon with the validated header, so both grants are needed.
assert.match(sql, /grant execute on function public\.get_student_world_layout_secure\(uuid\) to anon, authenticated/);
assert.match(sql, /grant execute on function public\.save_student_world_layout_secure\(uuid, jsonb, jsonb\) to anon, authenticated/);
assert.match(sql, /revoke all on function public\.save_student_world_layout_secure\(uuid, jsonb, jsonb\) from public/);

// The app loads the account copy on open, moves a browser-only world up once, and saves edits.
const world = readFileSync("components/world3d/CentralWorld.tsx", "utf8");
const layout = readFileSync("lib/world3d/central-world-layout.ts", "utf8");
const sync = readFileSync("lib/world3d/central-world-sync.ts", "utf8");
assert.match(world, /fetchServerWorldLayout\(placementScope\)/, "the world loads the account copy");
assert.match(world, /uploadLocalCentralWorld\(placementScope\)/, "an existing browser world is moved to the account");
assert.match(world, /if \(preview \|\| !isSyncedWorldScope\(placementScope\)\) return;/, "demo preview never touches an account");
assert.match(layout, /syncWorldToAccount\(scope\)/, "every save queues an account save");
assert.match(sync, /save_student_world_layout_secure/);
assert.match(sync, /addEventListener\("pagehide", flushWorldLayoutSaves\)/, "a waiting save is sent when the learner leaves");
assert.match(sync, /UUID\.test\(scope\)/, "only real learner ids sync");

console.log("PASS student world layout: account storage, read/write boundaries, limits, grants and app wiring");
