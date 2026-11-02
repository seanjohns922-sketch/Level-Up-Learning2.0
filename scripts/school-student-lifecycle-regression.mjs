// Isolated authorization regression: requires Docker; never connects to Supabase.
// Minimal auth/audit/table fixtures test RPC behavior, not full production RLS/triggers.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const container = `reliq-lifecycle-test-${process.pid}`;
const image = 'postgres:17-alpine';
const migration = readFileSync(new URL('../supabase/migrations/20261102140000_school_student_lifecycle_current_school.sql', import.meta.url), 'utf8');
const original = readFileSync(new URL('../supabase/migrations/20260811160000_school_student_lifecycle.sql', import.meta.url), 'utf8');
// Ensure the only function-body change is the ownership predicate.
const tightened = original.replace(/    and \(\n[\s\S]*?\n    \)\n  for update;/g, '    and student.school_id = p_school_id\n  for update;');
assert.equal(migration.slice(migration.indexOf('begin;')), tightened);
function docker(args, input) {
  const r = spawnSync('docker', args, { input, encoding: 'utf8', timeout: 120000 });
  if (r.error || r.status !== 0) throw new Error(r.error?.message || r.stderr || r.stdout);
  return r.stdout;
}
const id = n => `00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
const schoolA=id(1), schoolB=id(2), student=id(3), classA=id(4);
let sql = `BEGIN;
CREATE SCHEMA auth;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE anon NOLOGIN;
CREATE TABLE public.students(id uuid primary key,school_id uuid,class_id uuid,archived_at timestamptz,display_name text,school_year_level text,year_level text,username text);
CREATE TABLE public.classes(id uuid primary key,school_id uuid);
CREATE TABLE public.class_enrollments(student_id uuid,school_id uuid,status text,ended_at timestamptz);
CREATE TABLE public.student_explorer_codes(id uuid,student_id uuid,created_at timestamptz);
CREATE TABLE public.fixture_audit(action text);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE FUNCTION public.can_manage_school(s uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT auth.uid()='${id(9)}'::uuid OR auth.uid()=s $$;
CREATE FUNCTION public.write_school_audit(uuid,text,text,text,jsonb,jsonb,jsonb) RETURNS void LANGUAGE sql AS $$ INSERT INTO public.fixture_audit VALUES ($2) $$;
${migration.replace(/^begin;$/m,'').replace(/^commit;$/m,'')}
GRANT USAGE ON SCHEMA public,auth TO authenticated;
INSERT INTO public.classes VALUES ('${classA}','${schoolA}');
-- A stale class link and even an erroneously active enrollment must not override B.
INSERT INTO public.class_enrollments VALUES ('${student}','${schoolA}','inactive',now()),('${student}','${schoolA}','active',null);
`;
let cases=0;
function check({actor,owner=schoolB,school=schoolA,archived=false,operation,allowed=false,confirmation='DELETE',reason='Synthetic regression',error='P0002'}) {
  cases++;
  const call = operation==='delete'
    ? `public.delete_school_student('${school}','${student}','${confirmation}','${reason}')`
    : `public.${operation}_school_student('${school}','${student}')`;
  sql += `
DELETE FROM public.students;
TRUNCATE public.fixture_audit;
INSERT INTO public.students VALUES ('${student}',${owner?`'${owner}'`:'null'},'${classA}',${archived?'now()':'null'},'Fictional student','Year 5','Year 5','fictional');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','${actor??''}',true);
DO $$ BEGIN
${allowed ? `PERFORM ${call};` : `BEGIN PERFORM ${call}; RAISE EXCEPTION 'Case ${cases}: unauthorized success'; EXCEPTION WHEN SQLSTATE '${error}' THEN NULL; END;`}
END $$;
RESET ROLE;
DO $$ BEGIN
`;
  if (!allowed) sql += `IF NOT EXISTS(SELECT 1 FROM students WHERE id='${student}' AND (archived_at IS NOT NULL)=${archived}) OR EXISTS(SELECT 1 FROM fixture_audit) THEN RAISE EXCEPTION 'Case ${cases}: denied call changed data'; END IF;`;
  else if(operation==='delete') sql += `IF EXISTS(SELECT 1 FROM students) THEN RAISE EXCEPTION 'Delete did not remove fixture'; END IF;`;
  else sql += `IF NOT EXISTS(SELECT 1 FROM students WHERE id='${student}' AND school_id='${owner}' AND display_name='Fictional student' AND (archived_at IS NOT NULL)=${operation==='archive'}) THEN RAISE EXCEPTION 'Wrong lifecycle result'; END IF;`;
  sql += `END $$;\n`;
}
for (const operation of ['archive','restore','delete']) {
  for (const archived of [false,true]) {
    check({actor:schoolA,operation,archived});
    check({actor:schoolB,school:schoolB,operation,archived,allowed:true});
    check({actor:id(8),school:schoolB,operation,archived,error:'42501'});
    check({actor:null,school:schoolB,operation,archived,error:'42501'});
    check({actor:id(9),school:schoolB,operation,archived,allowed:true});
    check({actor:id(9),school:schoolA,operation,archived});
    check({actor:schoolA,owner:null,operation,archived});
  }
}
check({actor:schoolB,school:schoolB,operation:'delete',confirmation:'WRONG',error:'22023'});
check({actor:schoolB,school:schoolB,operation:'delete',reason:' ',error:'22023'});
sql += `DO $$ DECLARE f text; BEGIN
FOREACH f IN ARRAY ARRAY['archive_school_student(uuid,uuid)','restore_school_student(uuid,uuid)','delete_school_student(uuid,uuid,text,text)'] LOOP
IF has_function_privilege('anon',f,'EXECUTE') OR NOT has_function_privilege('authenticated',f,'EXECUTE') THEN RAISE EXCEPTION 'Unexpected RPC grant'; END IF;
END LOOP; END $$;
ROLLBACK;`;
try {
  docker(['run','--detach','--name',container,'--network','none','--memory','512m','-e','POSTGRES_PASSWORD=local-fixture-only',image]);
  let ready=false;
  for(let i=0;i<40;i++) {
    const r=spawnSync('docker',['exec',container,'pg_isready','-h','127.0.0.1','-U','postgres'],{encoding:'utf8'});
    if(r.status===0) {ready=true;break;}
    await new Promise(resolve=>setTimeout(resolve,500));
  }
  assert(ready,'Disposable database failed to start');
  docker(['exec',container,'createdb','-U','postgres','lifecycle_fixture']);
  const psql = ['exec','-i',container,'psql','-X','-U','postgres','-d','lifecycle_fixture','-v','ON_ERROR_STOP=1'];
  const body = value => value.replace(/^begin;$/m,'').replace(/^commit;$/m,'');
  // Prove the test catches the original defect, then verify the patch.
  assert.throws(() => docker(psql, sql.replace(body(migration), () => body(original))), /Case 1: unauthorized success/);
  docker(psql,sql);
  console.log(`PASS: ${cases} lifecycle authorization/state cases, RPC grants, and minimal-change check. All fixtures rolled back.`);
} finally {
  docker(['rm','-f',container]);
}
