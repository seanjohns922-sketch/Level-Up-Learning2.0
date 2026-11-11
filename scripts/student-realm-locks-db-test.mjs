// Disposable PostgreSQL only: no production connection, credentials or students.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const container=`reliq-realm-locks-${process.pid}`;
function docker(args,input){
 const result=spawnSync('docker',args,{input,encoding:'utf8',timeout:120000});
 if(result.error||result.status!==0) throw Error(result.error?.message||result.stderr||result.stdout);
 return result.stdout;
}
const id=n=>`00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
const fixture=`
CREATE ROLE authenticated NOLOGIN; CREATE ROLE anon NOLOGIN;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE TABLE classes(id uuid PRIMARY KEY);
CREATE TABLE students(id uuid PRIMARY KEY,class_id uuid,archived_at timestamptz);
CREATE TABLE class_enrollments(student_id uuid,class_id uuid,status text,ended_at timestamptz);
-- Fixture convention: a teacher manages the class whose id equals their user id.
CREATE FUNCTION can_view_class(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT auth.uid()=$1 $$;
CREATE FUNCTION can_manage_class(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT auth.uid()=$1 $$;
-- A student session may read only the student named in test.student.
CREATE FUNCTION assert_student_read(uuid) RETURNS void LANGUAGE plpgsql AS $$ BEGIN IF current_setting('test.student',true) IS DISTINCT FROM $1::text THEN RAISE EXCEPTION 'Student access denied' USING errcode='42501'; END IF; END $$;
GRANT USAGE ON SCHEMA public,auth TO authenticated,anon;
`;
const tests=`
INSERT INTO classes VALUES('${id(1)}'),('${id(2)}');
-- Students 11 and 12 are in class 1 (12 through an enrolment only); 21 is in class 2.
INSERT INTO students VALUES('${id(11)}','${id(1)}',null),('${id(12)}','${id(2)}',null),('${id(21)}','${id(2)}',null);
INSERT INTO class_enrollments VALUES('${id(12)}','${id(1)}','active',null);
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','${id(1)}',false);
DO $$BEGIN IF jsonb_array_length(teacher_get_realm_locks('${id(1)}'))<>0 THEN RAISE EXCEPTION 'Nobody starts locked'; END IF; END$$;
SELECT teacher_set_realm_locks('${id(1)}','[{"studentId":"${id(11)}","realmId":"pattern","locked":true},{"studentId":"${id(12)}","realmId":"pattern","locked":true},{"studentId":"${id(11)}","realmId":"chance","locked":true}]');
DO $$BEGIN IF jsonb_array_length(teacher_get_realm_locks('${id(1)}'))<>3 THEN RAISE EXCEPTION 'Bulk lock'; END IF; END$$;
-- Locking twice is harmless; opening removes only that realm.
SELECT teacher_set_realm_locks('${id(1)}','[{"studentId":"${id(11)}","realmId":"pattern","locked":true},{"studentId":"${id(11)}","realmId":"chance","locked":false}]');
DO $$BEGIN IF jsonb_array_length(teacher_get_realm_locks('${id(1)}'))<>2 THEN RAISE EXCEPTION 'Open one realm'; END IF; END$$;
-- A student outside the class, an unknown realm or a bad list: refused, and nothing changes.
DO $$BEGIN PERFORM teacher_set_realm_locks('${id(1)}','[{"studentId":"${id(11)}","realmId":"number","locked":true},{"studentId":"${id(21)}","realmId":"number","locked":true}]'); RAISE EXCEPTION 'outside student locked'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN PERFORM teacher_set_realm_locks('${id(1)}','[{"studentId":"${id(11)}","realmId":"reading","locked":true}]'); RAISE EXCEPTION 'unknown realm'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'Unknown realm%' THEN RAISE; END IF; END$$;
DO $$BEGIN IF jsonb_array_length(teacher_get_realm_locks('${id(1)}'))<>2 THEN RAISE EXCEPTION 'Refused change must roll back'; END IF; END$$;
-- Another teacher cannot read or change class 1.
SELECT set_config('request.jwt.claim.sub','${id(2)}',false);
DO $$BEGIN PERFORM teacher_get_realm_locks('${id(1)}'); RAISE EXCEPTION 'cross-class read'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN PERFORM teacher_set_realm_locks('${id(1)}','[]'); RAISE EXCEPTION 'cross-class write'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
-- Class 2's teacher does not see class 1's locks for student 12 unless 12 is in class 2 (it is, as its current class).
DO $$BEGIN IF jsonb_array_length(teacher_get_realm_locks('${id(2)}'))<>1 THEN RAISE EXCEPTION 'Student 12 lock visible to their other class'; END IF; END$$;
-- The table itself is closed to signed-in users.
DO $$BEGIN PERFORM 1 FROM student_realm_locks; RAISE EXCEPTION 'table readable'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
RESET ROLE;
-- Students read only their own locks.
SET ROLE anon;
SELECT set_config('test.student','${id(11)}',false);
DO $$BEGIN IF get_student_realm_locks('${id(11)}')<>ARRAY['pattern'] THEN RAISE EXCEPTION 'Own locks'; END IF; END$$;
DO $$BEGIN PERFORM get_student_realm_locks('${id(12)}'); RAISE EXCEPTION 'other student read'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN PERFORM teacher_get_realm_locks('${id(1)}'); RAISE EXCEPTION 'anon teacher read'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN PERFORM student_in_class('${id(11)}','${id(1)}'); RAISE EXCEPTION 'helper callable'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
RESET ROLE;
DELETE FROM students WHERE id='${id(11)}';
DO $$BEGIN IF EXISTS (SELECT 1 FROM student_realm_locks WHERE student_id='${id(11)}') THEN RAISE EXCEPTION 'Locks follow a deleted student'; END IF; END$$;
`;
try {
 docker(['run','--detach','--name',container,'--network','none','--memory','512m','-e','POSTGRES_PASSWORD=fictional-only','postgres:17-alpine']);
 let ready=false;
 for(let i=0;i<40;i++){if(spawnSync('docker',['exec',container,'pg_isready','-h','127.0.0.1','-U','postgres']).status===0){ready=true;break;}await new Promise(r=>setTimeout(r,500));}
 assert(ready);
 const psql=['exec','-i',container,'psql','-X','-U','postgres','-v','ON_ERROR_STOP=1'];
 docker(psql,fixture);
 docker(psql,readFileSync('supabase/migrations/20261111140000_student_realm_locks.sql','utf8'));
 docker(psql,tests);
 console.log('PASS realm locks: bulk lock/open, repeat-safe, all-or-nothing refusals, class and student boundaries, closed table, private helper, cascade on delete.');
} finally {docker(['rm','-f',container]);}
