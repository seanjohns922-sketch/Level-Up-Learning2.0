// Disposable PostgreSQL only: no production connection, credentials or students.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const container=`reliq-current-year-${process.pid}`;
function docker(args,input){
 const result=spawnSync('docker',args,{input,encoding:'utf8',timeout:120000});
 if(result.error||result.status!==0) throw Error(result.error?.message||result.stderr||result.stdout);
 return result.stdout;
}
const id=n=>`00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
const Y="extract(year from now() at time zone 'Australia/Melbourne')::integer";
const fixture=`
CREATE ROLE authenticated NOLOGIN; CREATE ROLE anon NOLOGIN; CREATE ROLE service_role NOLOGIN;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE TABLE schools(id uuid PRIMARY KEY,status text);
CREATE TABLE academic_years(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),school_id uuid,calendar_year int,status text,updated_at timestamptz DEFAULT now());
CREATE TABLE school_licence_entitlements(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),school_id uuid,academic_year_id uuid,status text);
CREATE TABLE classes(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),school_id uuid,academic_year_id uuid,status text);
CREATE TABLE class_enrollments(student_id uuid,school_id uuid,academic_year_id uuid,status text,ended_at timestamptz);
-- School members (and managers) are the user whose id equals the school id; a fixture convention.
CREATE FUNCTION can_view_school(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT auth.uid()=$1 $$;
CREATE FUNCTION can_manage_school(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT auth.uid()=$1 $$;
CREATE TABLE fixture_audit(action text,before jsonb,after jsonb);
CREATE FUNCTION write_school_audit(uuid,text,text,text,jsonb,jsonb,jsonb) RETURNS void LANGUAGE sql AS $$ INSERT INTO fixture_audit VALUES($2,$5,$6) $$;
GRANT USAGE ON SCHEMA public,auth TO authenticated;
GRANT SELECT,UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
`;
const tests=`
INSERT INTO schools VALUES('${id(1)}','active'),('${id(2)}','active'),('${id(3)}','active');
-- School 1: this year and next year, both licensed, with a class and enrolment in each.
INSERT INTO academic_years(id,school_id,calendar_year,status) VALUES('${id(11)}','${id(1)}',${Y},'active'),('${id(12)}','${id(1)}',${Y}+1,'active');
INSERT INTO school_licence_entitlements(school_id,academic_year_id,status) VALUES('${id(1)}','${id(11)}','active'),('${id(1)}','${id(12)}','trial');
INSERT INTO classes(school_id,academic_year_id,status) VALUES('${id(1)}','${id(11)}','active'),('${id(1)}','${id(12)}','active');
INSERT INTO class_enrollments VALUES('${id(100)}','${id(1)}','${id(11)}','active',null),('${id(100)}','${id(1)}','${id(12)}','active',null);
-- School 2: a new school with only next year.
INSERT INTO academic_years(id,school_id,calendar_year,status) VALUES('${id(21)}','${id(2)}',${Y}+1,'active');
INSERT INTO school_licence_entitlements(school_id,academic_year_id,status) VALUES('${id(2)}','${id(21)}','active');
-- School 3: next year exists but its licence is paused.
INSERT INTO academic_years(id,school_id,calendar_year,status) VALUES('${id(31)}','${id(3)}',${Y},'active'),('${id(32)}','${id(3)}',${Y}+1,'active');
INSERT INTO school_licence_entitlements(school_id,academic_year_id,status) VALUES('${id(3)}','${id(31)}','active'),('${id(3)}','${id(32)}','paused');

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','${id(1)}',false);
DO $$BEGIN IF (get_school_years('${id(1)}')->>'currentYear')::int<>${Y} THEN RAISE EXCEPTION 'Default current year should be this calendar year'; END IF; END$$;
DO $$BEGIN IF jsonb_array_length(get_school_years('${id(1)}')->'years')<>2 OR NOT (get_school_years('${id(1)}')->'years'->1->>'hasLicence')::boolean THEN RAISE EXCEPTION 'Years list'; END IF; END$$;
SELECT make_school_year_current('${id(1)}',${Y}+1);
RESET ROLE;
DO $$BEGIN
 IF (SELECT status FROM academic_years WHERE id='${id(11)}')<>'closed' OR (SELECT status FROM academic_years WHERE id='${id(12)}')<>'active' THEN RAISE EXCEPTION 'Make next year current'; END IF;
 IF (SELECT current_academic_year_id FROM schools WHERE id='${id(1)}')<>'${id(12)}' THEN RAISE EXCEPTION 'Pointer not set'; END IF;
 IF (SELECT count(*) FROM class_enrollments WHERE status='active' AND ended_at IS NULL)<>2 OR (SELECT count(*) FROM classes WHERE status='active')<>2 THEN RAISE EXCEPTION 'Classes and enrolments must not change'; END IF;
 IF NOT EXISTS (SELECT 1 FROM fixture_audit WHERE action='school_year_made_current' AND (after->>'currentYear')::int=${Y}+1) THEN RAISE EXCEPTION 'Audit'; END IF;
END$$;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','${id(1)}',false);
DO $$BEGIN IF (get_school_years('${id(1)}')->>'currentYear')::int<>${Y}+1 THEN RAISE EXCEPTION 'Current year after switch'; END IF; END$$;
-- Undo: making this year current again reopens it and puts next year back to planning.
SELECT make_school_year_current('${id(1)}',${Y});
RESET ROLE;
DO $$BEGIN IF (SELECT status FROM academic_years WHERE id='${id(11)}')<>'active' OR (SELECT status FROM academic_years WHERE id='${id(12)}')<>'planned' THEN RAISE EXCEPTION 'Undo'; END IF; END$$;
SET ROLE authenticated;
-- A new school with only next year sees next year as current.
SELECT set_config('request.jwt.claim.sub','${id(2)}',false);
DO $$BEGIN IF (get_school_years('${id(2)}')->>'currentYear')::int<>${Y}+1 THEN RAISE EXCEPTION 'Fresh school current year'; END IF; END$$;
-- Another school cannot read or change school 1.
DO $$BEGIN PERFORM make_school_year_current('${id(1)}',${Y}+1); RAISE EXCEPTION 'cross-school change allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN PERFORM get_school_years('${id(1)}'); RAISE EXCEPTION 'cross-school read allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
-- No licence for that year, or no such year: refused.
SELECT set_config('request.jwt.claim.sub','${id(3)}',false);
DO $$BEGIN PERFORM make_school_year_current('${id(3)}',${Y}+1); RAISE EXCEPTION 'unlicensed year made current'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE '%no % licence%' AND SQLERRM NOT LIKE '%licence yet%' THEN RAISE; END IF; END$$;
DO $$BEGIN PERFORM make_school_year_current('${id(3)}',${Y}+5); RAISE EXCEPTION 'missing year made current'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE '%school year yet%' THEN RAISE; END IF; END$$;
RESET ROLE;
DO $$BEGIN IF (SELECT status FROM academic_years WHERE id='${id(31)}')<>'active' OR (SELECT current_academic_year_id FROM schools WHERE id='${id(3)}') IS NOT NULL THEN RAISE EXCEPTION 'Refusal must change nothing'; END IF; END$$;
-- The internal helper is not callable directly.
SET ROLE authenticated;
DO $$BEGIN PERFORM school_current_academic_year_id('${id(1)}'); RAISE EXCEPTION 'helper callable'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
`;
try {
 docker(['run','--detach','--name',container,'--network','none','--memory','512m','-e','POSTGRES_PASSWORD=fictional-only','postgres:17-alpine']);
 let ready=false;
 for(let i=0;i<40;i++){if(spawnSync('docker',['exec',container,'pg_isready','-h','127.0.0.1','-U','postgres']).status===0){ready=true;break;}await new Promise(r=>setTimeout(r,500));}
 assert(ready);
 const psql=['exec','-i',container,'psql','-X','-U','postgres','-v','ON_ERROR_STOP=1'];
 docker(psql,fixture);
 docker(psql,readFileSync('supabase/migrations/20261111120000_school_current_year.sql','utf8'));
 docker(psql,tests);
 console.log('PASS current school year: calendar default, fresh-school default, switch and undo, licence and year checks, cross-school refusal, audit, and no change to classes or enrolments.');
} finally {docker(['rm','-f',container]);}
