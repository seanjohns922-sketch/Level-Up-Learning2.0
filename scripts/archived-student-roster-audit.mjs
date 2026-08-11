import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dashboard = fs.readFileSync(path.join(root, "app/teacher/dashboard/page.tsx"), "utf8");
const migration = fs.readFileSync(path.join(root, "supabase/migrations/20260806100000_sync_archived_student_enrolments.sql"), "utf8");
const lifecycleMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260811160000_school_student_lifecycle.sql"), "utf8");

const checks = [
  ["dashboard query excludes archived students", /\.eq\("class_id", classId\)\s*\.is\("archived_at", null\)/.test(dashboard)],
  ["rendered class roster excludes stale archived state", /student\.class_id === selectedClassId && !student\.archived_at/.test(dashboard)],
  ["archive closes active enrolments", /old\.archived_at is null[\s\S]*?status = 'ended'[\s\S]*?ended_at = coalesce/.test(migration)],
  ["unarchive restores the retained class enrolment", /old\.archived_at is not null[\s\S]*?insert into public\.class_enrollments[\s\S]*?status = 'active'/.test(migration)],
  ["existing archived students are repaired", /Repair students archived before[\s\S]*?student\.archived_at is not null[\s\S]*?enrolment\.status = 'active'/.test(migration)],
  ["archived directory entries have no current classes", (migration.match(/where student\.archived_at is null/g) ?? []).length === 2],
  ["historical student class id is preserved", !/update public\.students[\s\S]{0,180}class_id = null/i.test(migration)],
  ["school student lifecycle commands require school management access", (lifecycleMigration.match(/not public\.can_manage_school\(p_school_id\)/g) ?? []).length === 3],
  ["permanent deletion requires exact DELETE confirmation", /p_confirmation is distinct from 'DELETE'/.test(lifecycleMigration)],
  ["permanent deletion requires an audit reason", /if v_reason is null then[\s\S]*?A deletion reason is required/.test(lifecycleMigration)],
  ["permanent deletion records an audit event", /'student_deleted'[\s\S]*?jsonb_build_object\('reason', v_reason\)/.test(lifecycleMigration)],
  ["explorer identity history is removed oldest first", /student_explorer_codes explorer[\s\S]*?order by explorer\.created_at, explorer\.id[\s\S]*?delete from public\.student_explorer_codes/.test(lifecycleMigration)],
];

const failures = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
if (failures.length > 0) process.exitCode = 1;
