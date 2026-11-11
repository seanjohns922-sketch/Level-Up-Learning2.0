// Disposable PostgreSQL only: no production connection, credentials or students.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const container=`reliq-remove-class-${process.pid}`;
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
CREATE TABLE classes(id uuid PRIMARY KEY,school_id uuid,name text,academic_year int);
CREATE TABLE students(id uuid PRIMARY KEY,class_id uuid REFERENCES classes(id) ON DELETE SET NULL);
CREATE TABLE class_enrollments(student_id uuid,class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,status text,ended_at timestamptz);
CREATE TABLE student_realm_progress(student_id uuid,class_id uuid REFERENCES classes(id) ON DELETE SET NULL);
CREATE TABLE whole_math_diagnostic_sittings(student_id uuid,class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE);
CREATE TABLE class_staff_memberships(user_id uuid,class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE);
-- Fixture convention: the user whose id equals the school id manages that school's classes.
CREATE FUNCTION can_manage_class(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT EXISTS (SELECT 1 FROM classes WHERE id=$1 AND school_id=auth.uid()) $$;
CREATE TABLE fixture_audit(action text,entity text);
CREATE FUNCTION write_school_audit(uuid,text,text,text,jsonb,jsonb,jsonb) RETURNS void LANGUAGE sql AS $$ INSERT INTO fixture_audit VALUES($2,$4) $$;
GRANT USAGE ON SCHEMA public,auth TO authenticated;
`;
const S=id(1), OTHER=id(2);
const tests=`
-- Three 3B classes: 31 populated, 32 and 33 empty duplicates (33 has a staff row only).
-- 34 has only an ended enrolment; 35 only a diagnostic sitting; 36 only progress; 37 belongs to another school.
INSERT INTO classes VALUES('${id(31)}','${S}','3B',2026),('${id(32)}','${S}','3B',2026),('${id(33)}','${S}','3B',2026),
 ('${id(34)}','${S}','4A',2026),('${id(35)}','${S}','4B',2026),('${id(36)}','${S}','4C',2026),('${id(37)}','${OTHER}','3B',2026);
INSERT INTO students VALUES('${id(101)}','${id(31)}');
INSERT INTO class_enrollments VALUES('${id(101)}','${id(31)}','active',null),('${id(102)}','${id(34)}','ended',now());
INSERT INTO class_staff_memberships VALUES('${S}','${id(33)}');
INSERT INTO whole_math_diagnostic_sittings VALUES('${id(103)}','${id(35)}');
INSERT INTO student_realm_progress VALUES('${id(104)}','${id(36)}');
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','${S}',false);
DO $$BEGIN PERFORM remove_empty_class('${id(31)}'); RAISE EXCEPTION 'populated removed'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'This class still has 1 student.%' THEN RAISE; END IF; END$$;
DO $$BEGIN PERFORM remove_empty_class('${id(34)}'); RAISE EXCEPTION 'history removed'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE '%enrolled in this class before%' THEN RAISE; END IF; END$$;
DO $$BEGIN PERFORM remove_empty_class('${id(35)}'); RAISE EXCEPTION 'diagnostic removed'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE '%saved student work (whole_math_diagnostic_sittings)%' THEN RAISE; END IF; END$$;
DO $$BEGIN PERFORM remove_empty_class('${id(36)}'); RAISE EXCEPTION 'progress removed'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE '%saved student work (student_realm_progress)%' THEN RAISE; END IF; END$$;
DO $$BEGIN PERFORM remove_empty_class('${id(37)}'); RAISE EXCEPTION 'other school removed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
SELECT remove_empty_class('${id(32)}');
SELECT remove_empty_class('${id(33)}');
RESET ROLE;
DO $$BEGIN
 IF (SELECT count(*) FROM classes)<>5 OR EXISTS (SELECT 1 FROM classes WHERE id IN ('${id(32)}','${id(33)}')) THEN RAISE EXCEPTION 'Only the two empty duplicates go'; END IF;
 IF (SELECT class_id FROM students WHERE id='${id(101)}')<>'${id(31)}' THEN RAISE EXCEPTION 'Populated 3B student moved'; END IF;
 IF (SELECT count(*) FROM class_enrollments)<>2 OR (SELECT count(*) FROM whole_math_diagnostic_sittings)<>1 OR (SELECT count(*) FROM student_realm_progress WHERE class_id IS NOT NULL)<>1 THEN RAISE EXCEPTION 'Student data changed'; END IF;
 IF EXISTS (SELECT 1 FROM class_staff_memberships) THEN RAISE EXCEPTION 'Set-up row should go with its class'; END IF;
 IF (SELECT count(*) FROM fixture_audit WHERE action='class_removed')<>2 THEN RAISE EXCEPTION 'Audit'; END IF;
END$$;
SET ROLE anon;
DO $$BEGIN PERFORM remove_empty_class('${id(34)}'); RAISE EXCEPTION 'anon allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
`;
try {
 docker(['run','--detach','--name',container,'--network','none','--memory','512m','-e','POSTGRES_PASSWORD=fictional-only','postgres:17-alpine']);
 let ready=false;
 for(let i=0;i<40;i++){if(spawnSync('docker',['exec',container,'pg_isready','-h','127.0.0.1','-U','postgres']).status===0){ready=true;break;}await new Promise(r=>setTimeout(r,500));}
 assert(ready);
 const psql=['exec','-i',container,'psql','-X','-U','postgres','-v','ON_ERROR_STOP=1'];
 docker(psql,fixture);
 docker(psql,readFileSync('supabase/migrations/20261111160000_remove_empty_class.sql','utf8'));
 docker(psql,tests);
 console.log('PASS remove empty class: blocks current students, past enrolments and any student data; other schools refused; only empty duplicates removed; set-up rows go with them; audit written.');
} finally {docker(['rm','-f',container]);}
