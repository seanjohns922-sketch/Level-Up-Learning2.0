// Disposable PostgreSQL only: no production connection, credentials or students.
// Loads the real pre-change function definitions from the migrations, applies
// 20261126090000, 20261126100000 and 20261126110000, then checks every role.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const container = `reliq-school-hardening-${process.pid}`;
function docker(args, input) {
  const result = spawnSync('docker', args, { input, encoding: 'utf8', timeout: 120000 });
  if (result.error || result.status !== 0) throw Error(result.error?.message || result.stderr || result.stdout);
  return result.stdout;
}
const migration = (name) => readFileSync(`supabase/migrations/${name}`, 'utf8');
function fn(file, name) {
  const match = migration(file).match(new RegExp(`create (?:or replace )?function public\\.${name}\\([\\s\\S]*?\\n\\$\\$;`));
  assert(match, `${name} not found in ${file}`);
  return match[0];
}
const id = (n) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const SCHOOL = id(1), OTHER_SCHOOL = id(2);
const OWNER = id(11), ADMIN = id(12), CO_TEACHER = id(13), OTHER_TEACHER = id(14), OTHER_ADMIN = id(15);
const CLASS = id(21), OTHER_CLASS = id(22);
const STUDENT = id(31), HOME_STUDENT = id(32), CLASSMATE = id(33);

const fixture = `
CREATE ROLE authenticated NOLOGIN; CREATE ROLE anon NOLOGIN;
CREATE SCHEMA auth; CREATE SCHEMA extensions; CREATE EXTENSION pgcrypto SCHEMA extensions;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
GRANT USAGE ON SCHEMA public, auth, extensions TO authenticated, anon;
CREATE TABLE teachers(id uuid PRIMARY KEY, user_id uuid);
CREATE TABLE classes(id uuid PRIMARY KEY, school_id uuid, teacher_id uuid, status text DEFAULT 'active');
CREATE TABLE school_memberships(school_id uuid, user_id uuid, role text, status text, permissions jsonb DEFAULT '{}');
CREATE TABLE class_staff_memberships(class_id uuid, school_id uuid, user_id uuid, role text, status text);
CREATE TABLE students(id uuid PRIMARY KEY, class_id uuid, school_id uuid, display_name text, first_name text, last_name text,
  username text, pin text, qr_token text, user_id uuid, school_year_level text, working_level text, year_level text,
  archived_at timestamptz, identity_status text DEFAULT 'active');
CREATE TABLE class_enrollments(student_id uuid, class_id uuid, status text DEFAULT 'active', ended_at timestamptz, UNIQUE(student_id, class_id));
CREATE TABLE student_access_sessions(student_id uuid, token_hash text, expires_at timestamptz);
CREATE TABLE student_access_entitlements(student_id uuid, access_source text, status text, starts_at timestamptz, ends_at timestamptz);
CREATE TABLE whole_math_diagnostic_school_sessions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), class_id uuid, checkpoint text,
  academic_year int, opened_by uuid, opened_at timestamptz DEFAULT now(), closes_at timestamptz, closed_at timestamptz);
CREATE FUNCTION is_platform_admin() RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT false $$;
CREATE FUNCTION has_school_role(p_school_id uuid, p_roles text[]) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM school_memberships WHERE school_id=p_school_id AND user_id=auth.uid() AND status='active' AND role=ANY(p_roles)) $$;
CREATE FUNCTION can_manage_school(p_school_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT is_platform_admin() OR has_school_role(p_school_id, array['school_admin']) $$;
${fn('20260514093000_mvp_safe_rls_policies.sql', 'teacher_belongs_to_auth')}
${fn('20260803101000_restore_legacy_class_owner_management.sql', 'can_manage_class')}
${fn('20260911153000_supervised_adaptive_whole_maths_diagnostic.sql', 'teacher_open_whole_math_diagnostic_session')}
${fn('20260911153000_supervised_adaptive_whole_maths_diagnostic.sql', 'teacher_close_whole_math_diagnostic_session')}
${fn('20260911153000_supervised_adaptive_whole_maths_diagnostic.sql', 'get_teacher_whole_math_diagnostic_session')}
${fn('20260914110000_fix_whole_maths_diagnostic_answer_counts.sql', 'get_teacher_whole_math_diagnostics')}
${fn('20260903180000_live_maths_progression_tracker.sql', 'get_teacher_live_maths_progression')}
${fn('20260718100500_fix_student_session_pgcrypto_resolution.sql', 'student_login_lookup')}
${fn('20260813070000_home_family_onboarding.sql', 'home_student_login_lookup')}
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION student_login_lookup(uuid,text,text), home_student_login_lookup(text,text) TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fixture staff read and write" ON students FOR SELECT TO authenticated USING (true);
${migration('20260526090000_add_student_delete_policy.sql')}

INSERT INTO classes VALUES ('${CLASS}','${SCHOOL}','${OWNER}','active'), ('${OTHER_CLASS}','${OTHER_SCHOOL}','${OTHER_ADMIN}','active');
INSERT INTO school_memberships(school_id,user_id,role,status) VALUES ('${SCHOOL}','${OWNER}','teacher','active'),
  ('${SCHOOL}','${ADMIN}','school_admin','active'), ('${SCHOOL}','${CO_TEACHER}','teacher','active'),
  ('${SCHOOL}','${OTHER_TEACHER}','teacher','active'), ('${OTHER_SCHOOL}','${OTHER_ADMIN}','school_admin','active');
INSERT INTO class_staff_memberships VALUES ('${CLASS}','${SCHOOL}','${CO_TEACHER}','teacher','active');
INSERT INTO students(id,class_id,school_id,display_name,username,pin) VALUES
  ('${STUDENT}','${CLASS}','${SCHOOL}','Ava Lee','ava.lee','4821'),
  ('${CLASSMATE}','${CLASS}','${SCHOOL}','Ben Cho','ben.cho','1357'),
  ('${HOME_STUDENT}',null,null,'Mia Home','mia.home','2468');
INSERT INTO class_enrollments(student_id,class_id) VALUES ('${STUDENT}','${CLASS}'), ('${CLASSMATE}','${CLASS}');
INSERT INTO student_access_entitlements VALUES ('${HOME_STUDENT}','home','active',now()-interval '1 day',null);
`;

const as = (user) => `RESET ROLE; SELECT set_config('request.jwt.claim.sub','${user}',false); SET ROLE authenticated;`;
const allowed = (sql) => `DO $t$BEGIN PERFORM ${sql}; END$t$;`;
const denied = (sql, label) => `DO $t$BEGIN PERFORM ${sql}; RAISE EXCEPTION '${label} was allowed';
  EXCEPTION WHEN insufficient_privilege OR raise_exception THEN
    IF SQLERRM LIKE '%was allowed' THEN RAISE; END IF; END$t$;`;
const staffJobs = (classId) => [
  `teacher_open_whole_math_diagnostic_session('${classId}','start',60)`,
  `get_teacher_whole_math_diagnostic_session('${classId}')`,
  `teacher_close_whole_math_diagnostic_session('${classId}')`,
];

const staffTests = `
${[OWNER, ADMIN, CO_TEACHER].map((user) => `${as(user)}\n${staffJobs(CLASS).map(allowed).join('\n')}`).join('\n')}
${[OTHER_TEACHER, OTHER_ADMIN].map((user) => `${as(user)}\n${staffJobs(CLASS).map((job) => denied(job, `${user} ${job.split('(')[0]}`)).join('\n')}`).join('\n')}
RESET ROLE;
DO $t$BEGIN
  IF (SELECT count(*) FROM whole_math_diagnostic_school_sessions) <> 3 THEN RAISE EXCEPTION 'Expected one diagnostic window per allowed staff member'; END IF;
  IF EXISTS (SELECT 1 FROM whole_math_diagnostic_school_sessions WHERE closed_at IS NULL) THEN RAISE EXCEPTION 'Close did not close'; END IF;
  IF pg_get_functiondef('get_teacher_whole_math_diagnostics(uuid)'::regprocedure) NOT LIKE '%can_teach_class(class.id)%'
    OR pg_get_functiondef('get_teacher_live_maths_progression(uuid)'::regprocedure) NOT LIKE '%can_teach_class(class.id)%'
    OR pg_get_functiondef('get_teacher_live_maths_progression(uuid)'::regprocedure) LIKE '%teacher_belongs_to_auth(class.teacher_id)%'
    THEN RAISE EXCEPTION 'Read functions not switched to can_teach_class'; END IF;
  IF NOT (SELECT prosecdef FROM pg_proc WHERE oid='teacher_open_whole_math_diagnostic_session(uuid,text,integer)'::regprocedure) THEN RAISE EXCEPTION 'Patched function lost security definer'; END IF;
END$t$;
SET ROLE anon;
${denied(`can_teach_class('${CLASS}')`, 'anon can_teach_class')}
`;

const deleteTests = `
${as(OWNER)}
DELETE FROM students WHERE id='${STUDENT}';
RESET ROLE;
DO $t$BEGIN IF NOT EXISTS (SELECT 1 FROM students WHERE id='${STUDENT}') THEN RAISE EXCEPTION 'Owner deleted a student from the browser'; END IF; END$t$;
`;

const wrong = (n, call) => Array.from({ length: n }, () => `SELECT count(*) FROM ${call};`).join('\n');
const expectLocked = (call, label) => `DO $t$BEGIN PERFORM * FROM ${call}; RAISE EXCEPTION '${label} not locked';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE '%not locked' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE 'Too many tries.%' THEN RAISE; END IF; END$t$;`;
const expectLogin = (call, label) => `DO $t$BEGIN IF NOT EXISTS (SELECT 1 FROM ${call} WHERE session_token IS NOT NULL) THEN RAISE EXCEPTION '${label} could not log in'; END IF; END$t$;`;
const school = (name, pin) => `student_login_lookup('${CLASS}','${name}','${pin}')`;
const home = (name, pin) => `home_student_login_lookup('${name}','${pin}')`;

const loginTests = `
RESET ROLE; SELECT set_config('request.jwt.claim.sub','',false); SET ROLE anon;
${expectLogin(school('ava.lee', '4821'), 'Ava first login')}
${wrong(9, school('ava.lee', '0000'))}
${expectLogin(school(' AVA.LEE ', '4821'), 'Ava after nine misses')}
${wrong(10, school('Ava.Lee', '0000'))}
${expectLocked(school('ava.lee', '4821'), 'Ava with the right code after ten misses')}
${expectLogin(school('ben.cho', '1357'), 'Classmate during Ava lock')}
${wrong(10, home('mia.home', '0000'))}
${expectLocked(home('MIA.HOME', '2468'), 'Home login after ten misses')}
DO $t$BEGIN PERFORM * FROM student_login_lookup_unthrottled('${CLASS}','ava.lee','4821'); RAISE EXCEPTION 'anon reached unthrottled';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END$t$;
DO $t$BEGIN PERFORM * FROM student_login_throttles; RAISE EXCEPTION 'anon read throttles';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END$t$;
DO $t$BEGIN PERFORM student_login_clear_failures('home:mia.home'); RAISE EXCEPTION 'anon cleared a lock';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END$t$;
RESET ROLE;
UPDATE student_login_throttles SET window_started_at = now() - interval '16 minutes', locked_until = now() - interval '1 minute';
SET ROLE anon;
${expectLogin(school('ava.lee', '4821'), 'Ava after the pause')}
${expectLogin(home('mia.home', '2468'), 'Home learner after the pause')}
RESET ROLE;
DO $t$BEGIN IF EXISTS (SELECT 1 FROM student_login_throttles) THEN RAISE EXCEPTION 'Correct logins should clear counts'; END IF; END$t$;
`;

try {
  docker(['run', '--detach', '--name', container, '--network', 'none', '--memory', '512m', '-e', 'POSTGRES_PASSWORD=fictional-only', 'postgres:17-alpine']);
  let ready = false;
  for (let i = 0; i < 40; i++) {
    if (spawnSync('docker', ['exec', container, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres']).status === 0) { ready = true; break; }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert(ready, 'Disposable PostgreSQL did not start');
  const psql = ['exec', '-i', container, 'psql', '-X', '-q', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1'];
  docker(psql, fixture);
  docker(psql, migration('20261126090000_school_wide_class_staff_rules.sql'));
  docker(psql, migration('20261126100000_retire_browser_student_delete.sql'));
  docker(psql, migration('20261126110000_student_login_attempt_limits.sql'));
  docker(psql, staffTests);
  docker(psql, deleteTests);
  docker(psql, loginTests);
  console.log('PASS school hardening: owner, school admin and co-teacher run diagnostics; other teachers and other schools refused; browser student delete gone; 10 wrong codes pause one login name for 15 minutes, school and home, without touching classmates; correct login clears it.');
} finally {
  docker(['rm', '-f', container]);
}
