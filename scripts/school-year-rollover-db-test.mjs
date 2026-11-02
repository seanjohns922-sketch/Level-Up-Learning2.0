// Isolated minimal-schema regression. No production connection or student data.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const migration=readFileSync('supabase/migrations/20261102170000_school_year_rollover.sql','utf8');
const fixture=readFileSync('scripts/test-support/school-year-rollover-fixture.sql','utf8');
const container=`reliq-rollover-${process.pid}`;
function docker(args,input) {
 const result=spawnSync('docker',args,{input,encoding:'utf8',timeout:120000});
 if(result.error || result.status!==0) throw Error(result.error?.message || result.stderr || result.stdout);
 return result.stdout;
}
const id=n=>`00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
const current="extract(year from now() at time zone 'Australia/Melbourne')::integer";
const cases=[['Prep','Year 1'],['Year 1','Year 2'],['Year 5','Year 6'],['Year 6','Year 7'],['Year 7','Year 8'],['Year 8','Year 8'],['Year 4','Year 4'],['Year 3','Year 3'],['Unknown','Unknown']];
let tests=`BEGIN;
INSERT INTO auth.users VALUES('${id(1)}'),('${id(2)}');
INSERT INTO schools VALUES('${id(1)}','active'),('${id(2)}','active');
INSERT INTO school_year_rollover_settings(school_id,highest_year,enabled,first_year) VALUES('${id(1)}',8,true,${current}),('${id(2)}',6,false,${current});
`;
cases.forEach(([before],index)=>{
 tests+=`INSERT INTO students(id,school_id,class_id,school_year_level,year_level,display_name,working_level,rewards,school_year_calendar_year,archived_at)
 VALUES('${id(100+index)}','${id(1)}','${id(20)}','${before}','${before}','Fictional ${index}','Year 2',25,${current}-1,${index===7?'now()':'null'});\n`;
});
tests+=`INSERT INTO school_year_retention_exceptions VALUES('${id(106)}','${id(1)}',${current},'${id(1)}');
CREATE TEMP TABLE before_students AS SELECT * FROM students;
SELECT run_school_year_rollover();
SELECT run_school_year_rollover();
DO $$BEGIN
`;
cases.forEach(([,after],index)=>tests+=`IF (SELECT school_year_level FROM students WHERE id='${id(100+index)}')<>'${after}' THEN RAISE EXCEPTION 'Incorrect promotion case ${index}'; END IF;\n`);
tests+=`IF (SELECT count(*) FROM school_year_rollover_history)<>8 THEN RAISE EXCEPTION 'Duplicate or missing rollovers'; END IF;
IF EXISTS(SELECT 1 FROM students s JOIN before_students b USING(id) WHERE s.working_level<>b.working_level OR s.rewards<>b.rewards OR s.class_id<>b.class_id OR s.id<>b.id) THEN RAISE EXCEPTION 'Learning state changed'; END IF;
IF NOT EXISTS(SELECT 1 FROM school_year_rollover_history WHERE student_id='${id(105)}' AND outcome='leaver_review') THEN RAISE EXCEPTION 'Year 8 leaver missing'; END IF;
IF NOT EXISTS(SELECT 1 FROM school_year_rollover_history WHERE student_id='${id(108)}' AND outcome='year_review') THEN RAISE EXCEPTION 'Invalid year not flagged'; END IF;
END$$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','${id(1)}',true);
SELECT retain_student_after_rollover('${id(1)}','${id(100)}',${current});
SELECT retain_student_after_rollover('${id(1)}','${id(100)}',${current});
SELECT save_school_year_rollover('${id(1)}',7,true,${current}+1,ARRAY['${id(101)}'::uuid]);
DO $$BEGIN
BEGIN PERFORM process_school_year_rollover(${current}+1); RAISE EXCEPTION 'Public future run accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
BEGIN PERFORM run_school_year_rollover(); RAISE EXCEPTION 'Public worker accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
BEGIN UPDATE school_year_rollover_settings SET highest_year=8; RAISE EXCEPTION 'Direct settings write accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
BEGIN PERFORM save_school_year_rollover('${id(2)}',6,true,${current}+1,'{}'); RAISE EXCEPTION 'Cross school settings accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END$$;
RESET ROLE;
DO $$BEGIN IF (SELECT school_year_level FROM students WHERE id='${id(100)}')<>'Prep' THEN RAISE EXCEPTION 'Retention correction failed'; END IF; END$$;
-- A transfer using a current-year grade must not cause a second promotion.
UPDATE school_year_rollover_settings SET enabled=true WHERE school_id='${id(2)}';
UPDATE students SET school_id='${id(2)}',school_year_level='Year 4',year_level='Year 4' WHERE id='${id(101)}';
SELECT run_school_year_rollover();
DO $$BEGIN IF (SELECT school_year_level FROM students WHERE id='${id(101)}')<>'Year 4' THEN RAISE EXCEPTION 'Transfer promoted twice'; END IF; END$$;
-- Test final year 6 and 7, disabled schools, newly-created students and year 8 retention.
INSERT INTO students(id,school_id,school_year_level,year_level,display_name,school_year_calendar_year)
 VALUES('${id(200)}','${id(2)}','Year 6','Year 6','Final Year 6',${current}-1),
 ('${id(201)}','${id(1)}','Year 7','Year 7','Final Year 7',${current}-1),
 ('${id(202)}','${id(1)}','Year 8','Year 8','Retained Year 8',${current}-1),
 ('${id(203)}','${id(1)}','Year 2','Year 2','New current-year student',${current});
INSERT INTO school_year_retention_exceptions VALUES('${id(202)}','${id(1)}',${current},'${id(1)}');
SELECT run_school_year_rollover();
DO $$BEGIN
IF (SELECT count(*) FROM school_year_rollover_history WHERE student_id IN ('${id(200)}','${id(201)}') AND outcome='leaver_review')<>2 THEN RAISE EXCEPTION 'School final-year handling failed'; END IF;
IF NOT EXISTS(SELECT 1 FROM school_year_rollover_history WHERE student_id='${id(202)}' AND outcome='retained') THEN RAISE EXCEPTION 'Retention must precede leaver classification'; END IF;
IF EXISTS(SELECT 1 FROM school_year_rollover_history WHERE student_id='${id(203)}') THEN RAISE EXCEPTION 'Current-year newcomer promoted'; END IF;
END$$;
UPDATE school_year_rollover_settings SET enabled=false;
INSERT INTO students(id,school_id,school_year_level,year_level,display_name,school_year_calendar_year)
 VALUES('${id(204)}','${id(1)}','Year 2','Year 2','Disabled-school student',${current}-1);
SELECT run_school_year_rollover();
DO $$BEGIN IF (SELECT school_year_level FROM students WHERE id='${id(204)}')<>'Year 2' THEN RAISE EXCEPTION 'Disabled school promoted'; END IF; END$$;
ROLLBACK;`;
try {
 docker(['run','--detach','--name',container,'--network','none','--memory','512m','-e','POSTGRES_PASSWORD=fictional-only','postgres:17-alpine']);
 let ready=false;
 for(let i=0;i<40;i++) { if(spawnSync('docker',['exec',container,'pg_isready','-h','127.0.0.1','-U','postgres']).status===0){ready=true;break;} await new Promise(r=>setTimeout(r,500)); }
 assert(ready);
 const psql=['exec','-i',container,'psql','-X','-U','postgres','-v','ON_ERROR_STOP=1'];
 docker(psql,fixture); docker(psql,migration); docker(psql,tests);
 console.log('PASS Prep–8 promotion, retention/correction, school final years 6/7/8, archive exclusion, duplicate-run prevention, transfer/current-year protection, disabled schools, authorization and preserved working level/rewards/class.');
} finally { docker(['rm','-f',container]); }
