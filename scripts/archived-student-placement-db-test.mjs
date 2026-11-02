// Fictional fixtures only, in a disposable PostgreSQL container with no network.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const migration = readFileSync('supabase/migrations/20261102150000_block_archived_student_placement.sql','utf8').replace(/^begin;$/m,'').replace(/^commit;$/m,'');
const container = `reliq-placement-test-${process.pid}`;
const student = '00000000-0000-0000-0000-000000000001';
const call = `public.teacher_change_starting_level('${student}','number','Year 3','pretest')`;
function docker(args,input) {
  const r=spawnSync('docker',args,{input,encoding:'utf8',timeout:120000});
  if(r.error || r.status!==0) throw Error(r.error?.message || r.stderr || r.stdout);
  return r.stdout;
}
const sql = `BEGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT '${student}'::uuid$$;
CREATE FUNCTION public.teacher_owns_student(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT current_setting('fixture.authorized',true)='yes'$$;
CREATE FUNCTION public.realm_program_key(text,text) RETURNS text LANGUAGE sql AS $$SELECT $1||$2$$;
CREATE TABLE students(id uuid PRIMARY KEY,class_id uuid,school_year_level text,year_level text,archived_at timestamptz);
CREATE TABLE student_realm_placement(student_id uuid,realm_id text,assigned_start_level text,assigned_entry_mode text,placement_source text,placement_assigned_by uuid,placement_assigned_at timestamptz,updated_at timestamptz,PRIMARY KEY(student_id,realm_id));
CREATE TABLE student_realm_progress(student_id uuid,class_id uuid,realm_id text,program_key text,school_year_level text,working_level text,is_current boolean,status text,current_week int,assigned_week int,placement_complete boolean,required_weeks jsonb,optional_weeks jsonb,pretest_score numeric,posttest_score numeric,pretest_completed_at timestamptz,posttest_completed_at timestamptz,updated_at timestamptz,PRIMARY KEY(student_id,realm_id,working_level));
CREATE TABLE student_lesson_attempts(student_id uuid,realm_id text);
CREATE TABLE student_weekly_quiz_attempts(student_id uuid,realm_id text);
CREATE TABLE student_realm_assessments(student_id uuid,realm_id text);
CREATE TABLE teacher_realm_actions(teacher_id uuid,student_id uuid,realm_id text,action text,old_value text,new_value text);
${migration}
GRANT USAGE ON SCHEMA public,auth TO authenticated;
GRANT EXECUTE ON FUNCTION teacher_change_starting_level(uuid,text,text,text) TO authenticated;
INSERT INTO students VALUES('${student}','${student}','Year 3','Year 3',now());
SET LOCAL ROLE authenticated;
SELECT set_config('fixture.authorized','yes',true);
DO $$BEGIN
 BEGIN PERFORM ${call}; RAISE EXCEPTION 'Archived student accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'Student class context is missing' THEN RAISE; END IF; END;
END$$;
RESET ROLE;
DO $$BEGIN IF EXISTS(SELECT 1 FROM student_realm_placement) OR EXISTS(SELECT 1 FROM student_realm_progress) OR EXISTS(SELECT 1 FROM teacher_realm_actions) THEN RAISE EXCEPTION 'Rejected placement changed data'; END IF; END$$;
-- Restoring permits placement, and an established score must survive later changes.
UPDATE students SET archived_at=null;
SET LOCAL ROLE authenticated;
SELECT ${call};
RESET ROLE;
UPDATE student_realm_progress SET pretest_score=90,current_week=4;
SET LOCAL ROLE authenticated;
SELECT public.teacher_change_starting_level('${student}','number','Year 4','pretest');
SELECT set_config('fixture.authorized','no',true);
DO $$BEGIN BEGIN PERFORM ${call}; RAISE EXCEPTION 'Unauthorized accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END; END$$;
RESET ROLE;
DO $$BEGIN
IF NOT EXISTS(SELECT 1 FROM student_realm_progress WHERE pretest_score=90 AND current_week=4 AND working_level='Year 3') THEN RAISE EXCEPTION 'History altered'; END IF;
IF (SELECT count(*) FROM teacher_realm_actions)<>2 THEN RAISE EXCEPTION 'Unexpected writes'; END IF;
END$$;
DELETE FROM students;
SET LOCAL ROLE authenticated;
SELECT set_config('fixture.authorized','yes',true);
DO $$BEGIN BEGIN PERFORM ${call}; RAISE EXCEPTION 'Missing student accepted'; EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'Student class context is missing' THEN RAISE; END IF; END; END$$;
ROLLBACK;`;
try {
 docker(['run','--detach','--name',container,'--network','none','--memory','512m','-e','POSTGRES_PASSWORD=fictional-only','postgres:17-alpine']);
 let ready=false;
 for(let i=0;i<40;i++) {
  if(spawnSync('docker',['exec',container,'pg_isready','-h','127.0.0.1','-U','postgres']).status===0){ready=true;break;}
  await new Promise(r=>setTimeout(r,500));
 }
 assert(ready);
 const psql=['exec','-i',container,'psql','-X','-U','postgres','-v','ON_ERROR_STOP=1'];
 const baseline=sql.replace('    and student.archived_at is null\n  for update;',';');
 assert.throws(()=>docker(psql,baseline),/Archived student accepted/);
 docker(psql,sql);
 console.log('PASS old bug reproduced; archived/missing/unauthorized rejected; restored student accepted; established progress retained.');
} finally { docker(['rm','-f',container]); }
