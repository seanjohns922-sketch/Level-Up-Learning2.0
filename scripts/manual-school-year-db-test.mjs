// Disposable PostgreSQL only: no production connection, credentials or students.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
const container=`reliq-manual-year-${process.pid}`;
function docker(args,input) {
 const result=spawnSync('docker',args,{input,encoding:'utf8',timeout:120000});
 if(result.error || result.status!==0) throw Error(result.error?.message || result.stderr || result.stdout);
 return result.stdout;
}
const id=n=>`00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
const year="extract(year from now() at time zone 'Australia/Melbourne')::integer";
const fixture=readFileSync('scripts/test-support/school-year-rollover-fixture.sql','utf8')+`
CREATE TABLE school_command_receipts(school_id uuid,actor_user_id uuid,command_name text,idempotency_key text,result jsonb,PRIMARY KEY(school_id,actor_user_id,command_name,idempotency_key));
-- Stub only the existing creation path; the wrapper must use it and its receipts.
CREATE FUNCTION create_school_student(uuid,uuid,text,text,text,text,text,text) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_id uuid:=gen_random_uuid(); v_result jsonb;
BEGIN
 IF nullif(trim($8),'') IS NULL THEN RAISE EXCEPTION 'Idempotency key required'; END IF;
 SELECT result INTO v_result FROM school_command_receipts WHERE school_id=$1 AND actor_user_id=auth.uid() AND command_name='create_school_student' AND idempotency_key=$8;
 IF v_result IS NOT NULL THEN RETURN v_result; END IF;
 INSERT INTO students(id,school_id,class_id,display_name,school_year_level,year_level) VALUES(v_id,$1,$2,$3||' '||$4,$5,$5);
 v_result:=jsonb_build_object('studentId',v_id,'name',$3||' '||$4);
 INSERT INTO school_command_receipts VALUES($1,auth.uid(),'create_school_student',$8,v_result);
 RETURN v_result;
END$$;
`;
let tests=`BEGIN;
INSERT INTO auth.users VALUES('${id(1)}'),('${id(2)}'),('${id(3)}');
INSERT INTO schools VALUES('${id(1)}','active'),('${id(2)}','active');
`;
// 2026 trials, already-2027 starters, retained Prep, Year 6/7/8, inactive and other school.
const rows=[['Trial','Year 3',0],['Next-year entry','Year 3',0],['Repeating Prep','Prep',0],['Six','Year 6',0],['Seven','Year 7',0],['Eight','Year 8',0],['Archived','Year 2',0],['Other school','Year 2',0]];
rows.forEach(([name,grade,offset],i)=>tests+=`INSERT INTO students(id,school_id,class_id,display_name,school_year_level,year_level,school_year_calendar_year,working_level,rewards,archived_at) VALUES('${id(100+i)}','${id(i===7?2:1)}','${id(20)}','${name}','${grade}','${grade}',${year}+${offset},'Year 1',99,${i===6?'now()':'null'});\n`);
tests+=`CREATE TEMP TABLE before_students AS SELECT * FROM students;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','${id(1)}',true);
DO $$DECLARE p jsonb; saved jsonb; choices jsonb; r jsonb; BEGIN
 p:=get_school_year_rollover_preview('${id(1)}',${year}+1);
 IF (p->>'prepared')::boolean OR jsonb_array_length(p->'students')<>6 THEN RAISE EXCEPTION 'Initial preview wrong'; END IF;
 BEGIN PERFORM start_school_year('${id(1)}',${year}+1,p->>'reviewToken'); RAISE EXCEPTION 'Accepted unprepared start'; EXCEPTION WHEN raise_exception THEN IF SQLERRM='Accepted unprepared start' THEN RAISE; END IF; END;
 SELECT jsonb_agg(jsonb_build_object('id',s->>'id','calendarYear',case when s->>'id'='${id(101)}' then ${year}+1 else (s->>'calendarYear')::integer end,'retain',s->>'id'='${id(102)}')) INTO choices FROM jsonb_array_elements(p->'students') s;
 saved:=save_school_year_preparation('${id(1)}',${year}+1,8,choices,p->>'reviewToken');
 IF saved->'lastResults'<>'[]'::jsonb OR EXISTS(SELECT 1 FROM jsonb_array_elements(saved->'students') s WHERE s->>'name'='Trial' AND s->>'yearLevel'<>'Year 3') THEN RAISE EXCEPTION 'Saving preparation promoted students'; END IF;
 BEGIN PERFORM start_school_year('${id(1)}',${year}+1,p->>'reviewToken'); RAISE EXCEPTION 'Accepted stale preview'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'The student list changed.%' THEN RAISE; END IF; END;
 r:=start_school_year('${id(1)}',${year}+1,saved->>'reviewToken');
 IF jsonb_array_length(r->'lastResults')<>5 THEN RAISE EXCEPTION 'Wrong result count'; END IF;
 BEGIN PERFORM start_school_year('${id(1)}',${year}+1,saved->>'reviewToken'); RAISE EXCEPTION 'Accepted duplicate stale start'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'The student list changed.%' THEN RAISE; END IF; END;
 PERFORM start_school_year('${id(1)}',${year}+1,r->>'reviewToken');
END$$;
RESET ROLE;
DO $$BEGIN
 IF (SELECT school_year_level FROM students WHERE id='${id(100)}')<>'Year 4' OR (SELECT school_year_level FROM students WHERE id='${id(101)}')<>'Year 3' OR (SELECT school_year_level FROM students WHERE id='${id(102)}')<>'Prep' OR (SELECT school_year_level FROM students WHERE id='${id(103)}')<>'Year 7' OR (SELECT school_year_level FROM students WHERE id='${id(104)}')<>'Year 8' THEN RAISE EXCEPTION 'Incorrect promotion / already-next-year / retention / Year7–8'; END IF;
 IF (SELECT count(*) FROM school_year_rollover_history)<>5 THEN RAISE EXCEPTION 'Repeated rollover'; END IF;
 IF NOT EXISTS(SELECT 1 FROM school_year_rollover_history WHERE student_id='${id(105)}' AND outcome='leaver_review') THEN RAISE EXCEPTION 'Leaver missing'; END IF;
 IF EXISTS(SELECT 1 FROM students s JOIN before_students b USING(id) WHERE s.working_level IS DISTINCT FROM b.working_level OR s.rewards IS DISTINCT FROM b.rewards OR s.class_id IS DISTINCT FROM b.class_id OR s.archived_at IS DISTINCT FROM b.archived_at) THEN RAISE EXCEPTION 'Learning or class data changed'; END IF;
 IF EXISTS(SELECT 1 FROM school_year_rollover_history WHERE student_id IN('${id(106)}','${id(107)}')) THEN RAISE EXCEPTION 'Archived / other school changed'; END IF;
 IF EXISTS(SELECT 1 FROM school_year_rollover_settings WHERE enabled) THEN RAISE EXCEPTION 'Automatic rollover enabled'; END IF;
END$$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','${id(1)}',true);
SELECT retain_student_after_manual_rollover('${id(1)}','${id(100)}',${year}+1);
SELECT retain_student_after_manual_rollover('${id(1)}','${id(100)}',${year}+1);
DO $$DECLARE p jsonb; r jsonb; again jsonb; BEGIN
 p:=get_school_year_rollover_preview('${id(1)}',${year}+1);
 PERFORM start_school_year('${id(1)}',${year}+1,p->>'reviewToken');
 r:=create_school_student_for_year('${id(1)}',null,'Future','Starter','Year 3',${year}+1,null,null,'future-starter');
 again:=create_school_student_for_year('${id(1)}',null,'Future','Starter','Year 3',${year}+1,null,null,'future-starter');
 IF r<>again THEN RAISE EXCEPTION 'Creation not idempotent'; END IF;
 BEGIN PERFORM create_school_student_for_year('${id(1)}',null,'Future','Starter','Year 3',${year},null,null,'future-starter'); RAISE EXCEPTION 'Receipt relabelled'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'This creation request has already been used.%' THEN RAISE; END IF; END;
 BEGIN PERFORM start_school_year('${id(1)}',${year}+1,p->>'reviewToken'); RAISE EXCEPTION 'New roster did not stale review'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'The student list changed.%' THEN RAISE; END IF; END;
 p:=get_school_year_rollover_preview('${id(1)}',${year}+1);
 PERFORM start_school_year('${id(1)}',${year}+1,p->>'reviewToken');
 BEGIN PERFORM get_school_year_rollover_preview('${id(2)}',${year}+1); RAISE EXCEPTION 'Cross-school read'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM start_school_year('${id(2)}',${year}+1,'x'); RAISE EXCEPTION 'Cross-school start'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM save_school_year_preparation('${id(2)}',${year}+1,8,'[]','x'); RAISE EXCEPTION 'Cross-school save'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM create_school_student_for_year('${id(2)}',null,'X','Y','Year 3',${year}+1,null,null,'cross'); RAISE EXCEPTION 'Cross-school create'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM retain_student_after_manual_rollover('${id(2)}','${id(100)}',${year}+1); RAISE EXCEPTION 'Cross-school correction'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM run_school_year_rollover(); RAISE EXCEPTION 'Global worker accessible'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM school_year_review_token('${id(1)}',${year}+1); RAISE EXCEPTION 'Private token accessible'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END$$;
SELECT set_config('request.jwt.claim.sub','${id(3)}',true);
DO $$BEGIN BEGIN PERFORM start_school_year('${id(1)}',${year}+1,'x'); RAISE EXCEPTION 'Non-manager start'; EXCEPTION WHEN insufficient_privilege THEN NULL; END; END$$;
RESET ROLE;
SET LOCAL ROLE anon;
DO $$BEGIN BEGIN PERFORM start_school_year('${id(1)}',${year}+1,'x'); RAISE EXCEPTION 'Anonymous start'; EXCEPTION WHEN insufficient_privilege THEN NULL; END; END$$;
RESET ROLE;
SET LOCAL ROLE service_role;
DO $$BEGIN BEGIN PERFORM run_school_year_rollover(); RAISE EXCEPTION 'Service automatic worker'; EXCEPTION WHEN insufficient_privilege THEN NULL; END; END$$;
RESET ROLE;
DO $$BEGIN
 IF (SELECT school_year_level FROM students WHERE id='${id(100)}')<>'Year 3' THEN RAISE EXCEPTION 'Correction or rerun failed'; END IF;
 IF (SELECT count(*) FROM students WHERE display_name='Future Starter' AND school_year_level='Year 3' AND school_year_calendar_year=${year}+1)<>1 THEN RAISE EXCEPTION 'Future creation duplicated / promoted'; END IF;
END$$;
-- A legacy-created or stale row must stop the operation, never catch up several years silently.
INSERT INTO students(id,school_id,display_name,school_year_level,year_level,school_year_calendar_year) VALUES('${id(200)}','${id(1)}','Old record','Year 2','Year 2',${year}-1);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','${id(1)}',true);
DO $$DECLARE p jsonb; BEGIN
 p:=get_school_year_rollover_preview('${id(1)}',${year}+1);
 BEGIN PERFORM start_school_year('${id(1)}',${year}+1,p->>'reviewToken'); RAISE EXCEPTION 'Old record advanced'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'Review missing or older%' THEN RAISE; END IF; END;
END$$;
RESET ROLE;
-- A current-year start in January uses the same mechanism; future-year students remain untouched.
INSERT INTO students(id,school_id,display_name,school_year_level,year_level,school_year_calendar_year) VALUES('${id(201)}','${id(2)}','January trial','Year 2','Year 2',${year}-1),('${id(202)}','${id(2)}','January direct','Year 3','Year 3',${year});
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','${id(2)}',true);
DO $$DECLARE p jsonb; choices jsonb; BEGIN
 p:=get_school_year_rollover_preview('${id(2)}',${year});
 SELECT jsonb_agg(jsonb_build_object('id',s->>'id','calendarYear',(s->>'calendarYear')::integer,'retain',false)) INTO choices FROM jsonb_array_elements(p->'students') s;
 p:=save_school_year_preparation('${id(2)}',${year},6,choices,p->>'reviewToken');
 PERFORM start_school_year('${id(2)}',${year},p->>'reviewToken');
END$$;
RESET ROLE;
DO $$BEGIN IF (SELECT count(*) FROM students WHERE id IN('${id(201)}','${id(202)}') AND school_year_level='Year 3')<>2 THEN RAISE EXCEPTION 'Current year start failed'; END IF; END$$;
ROLLBACK;
`;
try {
 docker(['run','--detach','--name',container,'--network','none','--memory','512m','-e','POSTGRES_PASSWORD=fictional-only','postgres:17-alpine']);
 let ready=false;
 for(let i=0;i<40;i++){if(spawnSync('docker',['exec',container,'pg_isready','-h','127.0.0.1','-U','postgres']).status===0){ready=true;break;}await new Promise(r=>setTimeout(r,500));}
 assert(ready);
 const psql=['exec','-i',container,'psql','-X','-U','postgres','-v','ON_ERROR_STOP=1'];
 docker(psql,fixture);
 docker(psql,readFileSync('supabase/migrations/20261102170000_school_year_rollover.sql','utf8'));
 docker(psql,readFileSync('supabase/migrations/20261106100000_manual_school_year_start.sql','utf8'));
 docker(psql,tests);
 // Two administrators confirming the same preview concurrently: exactly one succeeds.
 docker(psql,`INSERT INTO auth.users VALUES('${id(1)}'); INSERT INTO schools VALUES('${id(1)}','active');
 INSERT INTO students(id,school_id,display_name,school_year_level,year_level,school_year_calendar_year) VALUES('${id(300)}','${id(1)}','Concurrent trial','Year 2','Year 2',${year});
 INSERT INTO school_year_rollover_settings(school_id,highest_year,enabled,first_year) VALUES('${id(1)}',8,false,${year}+1);`);
 const token=docker([...psql,'-Atc',`SELECT school_year_review_token('${id(1)}',${year}+1)`]).trim();
 const concurrent=`BEGIN; SET LOCAL ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${id(1)}',true); SELECT start_school_year('${id(1)}',${year}+1,'${token}'); SELECT pg_sleep(0.3); COMMIT;`;
 const run=()=>new Promise((resolve,reject)=>{const p=spawn('docker',psql);let output='';p.stdout.on('data',d=>output+=d);p.stderr.on('data',d=>output+=d);p.on('error',reject);p.on('close',code=>resolve({code,output}));p.stdin.end(concurrent);});
 const results=await Promise.all([run(),run()]);assert.equal(results.filter(r=>r.code===0).length,1);assert(results.find(r=>r.code!==0).output.includes('student list changed'));
 docker(psql,`DO $$BEGIN IF (SELECT school_year_level FROM students WHERE id='${id(300)}')<>'Year 3' OR (SELECT count(*) FROM school_year_rollover_history WHERE student_id='${id(300)}')<>1 THEN RAISE EXCEPTION 'Concurrent duplicate promotion'; END IF; END$$;`);
 console.log('PASS manual current/next-year start, mixed cohorts, retention/correction, Prep–8, leavers, stale, duplicate and concurrent requests, creation receipts, role boundaries, no automatic worker and unchanged learning/class data.');
} finally {docker(['rm','-f',container]);}
