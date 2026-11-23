// Local rollback-only SQL equivalence and permission tests. No hosted access.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { createClient } from '@supabase/supabase-js';
import { fetchLiveClassEvents } from '../../lib/live-class-events.ts';
import { fileURLToPath } from 'node:url';
import { localConfig, localDir } from './local-config.mjs';
const fixtureDir = localDir;
const config = localConfig();
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
process.chdir(repo);
const { fixtures } = await import('../live-class-projection-test.mjs');
const { api } = await import('../test-support/live-class-reducers.mjs');
const f = JSON.parse(fs.readFileSync(`${fixtureDir}/synthetic-accounts.json`, 'utf8'));
const vars = { teacher_id:f.teacherId, school_id:f.schoolId, class_id:f.classId, student_id:f.students[0].studentId, other_student_id:f.students[1].studentId };
for (const value of Object.values(vars)) assert.match(value,/^[0-9a-f-]{36}$/i);
function sql(text) {
 const args=['exec','-i','supabase_db_reliq-scale-local','psql','-X','-q','-U','postgres','-d','postgres','-At','-v','ON_ERROR_STOP=1',...Object.entries(vars).flatMap(([key,value])=>['-v',`${key}=${value}`])];
 try {
  return execFileSync('docker',args,{input:text,encoding:'utf8',maxBuffer:32*1024*1024,stdio:['pipe','pipe','pipe']});
 } catch(error) {
  // Do not dump all returned fixture rows when psql terminates an input stream.
  throw new Error(`Local SQL check failed: ${String(error.stderr ?? error.message).slice(-2000)}`);
 }
}

const rowReuse = process.argv.includes('--row-reuse');
assert.ok(process.argv.slice(2).every(arg => arg === '--row-reuse'), 'Unknown local test option');
const migrationSource = fs.readFileSync('supabase/migrations/20261118120000_compact_live_class_event_reads.sql','utf8')
  + (rowReuse ? fs.readFileSync('supabase/manual/compact-row-reuse/candidate.sql','utf8') : '');
const migration = migrationSource.replace(/^begin;$/gm,'').replace(/^commit;$/gm,'');
const quote = value => "'" + value.replaceAll("'", "''") + "'";
const mapStudent = id => id === 'student' ? vars.student_id : vars.other_student_id;
const mapped = fixtures.map(fixture => ({...fixture,
 student:{...fixture.student,id:vars.student_id,class_id:vars.class_id},
 row:fixture.row ? {...fixture.row,student_id:vars.student_id} : null,
 attempts:fixture.attempts.map(row=>({...row,student_id:mapStudent(row.student_id)})),
 events:fixture.events.map(e=>({...e,id:`10000000-0000-0000-0000-${e.id.slice(6).padStart(12,'0')}`,student_id:mapStudent(e.student_id),class_id:vars.class_id})),
}));
let script = 'begin;\nset local statement_timeout=\'90s\';\n'+migration+`\nselect set_config('request.jwt.claim.sub', :'teacher_id', true);\n`;
// Exercise SQL/JS predicate differences before comparing complete histories.
const payloadCases=['null','{}','{"week":0}','{"week":-1}','{"week":"1"}','{"week":1e400}','{"week":1e-400}','{"week":-1e-400}','{"lessonId":""}','{"lessonId":" \u00a0"}','{"lessonId":"x"}','{"lessonId":42}'];
for(const raw of payloadCases) {
 const payload=JSON.parse(raw);
 const expected=Boolean(api.positiveNumberOrNull(payload?.week)!==null || api.stringOrNull(payload?.lessonId));
 script+=`do $$ begin assert public.live_event_has_activity_context(${quote(raw)}::jsonb) = ${expected}, 'Activity context predicate parity'; end $$;\n`;
}
script += `create function pg_temp.compact_all(c uuid,s uuid) returns jsonb language plpgsql as $$
declare result jsonb:='[]'; batch jsonb; last_time timestamptz; last_id uuid;
begin loop
 select jsonb_agg(to_jsonb(e) order by e.created_at,e.id) into batch from public.get_live_class_compact_event_page_secure(c,array[s],null,last_time,last_id,'2099-01-01','ffffffff-ffff-ffff-ffff-ffffffffffff') e;
 exit when batch is null; result:=result||batch;
 last_time:=(batch->-1->>'created_at')::timestamptz; last_id:=(batch->-1->>'id')::uuid;
 end loop; return result; end $$;\n`;
for (const [index, fixture] of mapped.entries()) {
 script += `reset role; delete from public.live_activity_events where class_id=:'class_id' and student_id in (:'student_id',:'other_student_id');\n`;
 if (fixture.events.length) script += `insert into public.live_activity_events(id,student_id,class_id,event_type,created_at,payload) select id,student_id,class_id,event_type,created_at,coalesce(payload,'null'::jsonb) from jsonb_populate_recordset(null::public.live_activity_events,${quote(JSON.stringify(fixture.events))}::jsonb);\n`;
 script += `set local role authenticated; select jsonb_build_object('case',${index},'events',pg_temp.compact_all(:'class_id',:'student_id'));\n`;
}
script+='reset role; rollback;';
const results = sql(script).split('\n').filter(line=>line.startsWith('{')).map(line=>JSON.parse(line));
assert.equal(results.length,mapped.length);
let fullRows=0,compactRows=0;
for (const result of results) {
 const f=mapped[result.case]; const actual=result.events;
 assert(actual.every(e=>e.student_id===vars.student_id && e.class_id===vars.class_id));
 const before=api.resolveCurrentActivityRow(f.student,f.row,f.events,f.attempts,f.daily);
 // Normalise only database timestamp formatting, not ordering or precision.
 const byId=new Map(f.events.map(e=>[e.id,e]));
 const normalized=actual.map(e=>{assert(byId.has(e.id));return {...e,created_at:byId.get(e.id).created_at};});
 const after=api.resolveCurrentActivityRow(f.student,f.row,normalized,f.attempts,f.daily);
 assert.deepEqual(after,before,f.label+' activity');
 assert.deepEqual(api.buildCurrentLessonPerformance(after,normalized),api.buildCurrentLessonPerformance(before,f.events),f.label+' performance');
 fullRows+=f.events.length;compactRows+=actual.length;
}
// Reuse the existing complete role/revocation matrix. Existing fixture events
// have no activity key/context, so compact selection must be empty when allowed.
let roles=fs.readFileSync('supabase/manual/live-event-reads/test.sql','utf8');
roles=roles.replace("assert rpc_rows=direct_rows, 'Page must match the same authorized RLS rows';", "assert jsonb_array_length(rpc_rows)=0, 'Non-activity fixture events must be omitted';");
roles=roles.replaceAll('get_live_class_event_page_secure','get_live_class_compact_event_page_secure');
// Remove existing history inside the rollback transaction for a deterministic matrix.
sql('begin;\n'+migration+`\ndelete from public.live_activity_events where class_id=:'class_id';\n`+roles+'\nrollback;');
console.log(JSON.stringify({passed:true,cases:results.length,fullRows,compactRows,roleMatrix:'teacher/support/principal/admin/legacy/revocation/anonymous',restoration:'all functions and fixture changes rolled back'},null,2));

// Existing installed functions are preserved; the candidate mode is rollback-only.
if (rowReuse) process.exit(0);

// Verify the real PostgREST transport and client pagination. Install only in the
// isolated local database, then remove both functions and this run's events.
const signature = 'public.get_live_class_compact_event_page_secure(uuid,uuid[],text[],timestamptz,uuid,timestamptz,uuid)';
assert.equal(sql(`select to_regprocedure('${signature}') is null and to_regprocedure('public.live_event_has_activity_context(jsonb)') is null;`).trim(),'t','Do not overwrite pre-existing local functions');
const httpFixture = mapped[0];
const ids = httpFixture.events.map(e=>quote(e.id)).join(',');
assert.equal(sql(`select count(*) from public.live_activity_events where id in (${ids});`).trim(),'0','Fixture IDs must be unused');
const teacher = createClient(config.API_URL,config.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const anon = createClient(config.API_URL,config.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
try {
 sql('begin;'+migration+`; insert into public.live_activity_events(id,student_id,class_id,event_type,created_at,payload) select id,student_id,class_id,event_type,created_at,payload from jsonb_populate_recordset(null::public.live_activity_events,${quote(JSON.stringify(httpFixture.events))}::jsonb); notify pgrst,'reload schema'; commit;`);
 assert.equal((await teacher.auth.signInWithPassword({email:f.email,password:f.password})).error,null);
 const args={p_class_id:f.classId,p_student_ids:[vars.student_id],p_through_created_at:'2099-01-01',p_through_id:'ffffffff-ffff-ffff-ffff-ffffffffffff'};
 let ready;
 for(let attempt=0;attempt<20;attempt++) {
  ready=await teacher.rpc('get_live_class_compact_event_page_secure',args).limit(1);
  if(ready.error?.code!=='PGRST202') break;
  await new Promise(resolve=>setTimeout(resolve,250));
 }
 assert.equal(ready.error,null,'RPC must exist in the API schema cache');
 const options={classId:f.classId,studentIds:[vars.student_id]};
 const full=await fetchLiveClassEvents(teacher,options);
 const compact=await fetchLiveClassEvents(teacher,{...options,compact:true});
 assert.equal(full.error,null); assert.equal(compact.error,null);
 const before=api.resolveCurrentActivityRow(httpFixture.student,httpFixture.row,full.data,[],null);
 const after=api.resolveCurrentActivityRow(httpFixture.student,httpFixture.row,compact.data,[],null);
 assert.deepEqual(after,before);
 assert.deepEqual(api.buildCurrentLessonPerformance(after,compact.data),api.buildCurrentLessonPerformance(before,full.data));
 const fixtureIds=new Set(httpFixture.events.map(e=>e.id));
 assert.equal(compact.data.filter(e=>fixtureIds.has(e.id)).length,11,'Repeated attempt fixture survives HTTP with only the latest 11 events');
 const denied=await teacher.rpc('get_live_class_compact_event_page_secure',{...args,p_class_id:'00000000-0000-0000-0000-000000000001'});
 assert.equal(denied.error?.code,'42501');
 assert.equal((await anon.rpc('get_live_class_compact_event_page_secure',args)).error?.code,'42501');
 assert.equal((await teacher.rpc('get_live_class_compact_event_page_secure',{...args,p_after_id:vars.student_id})).error?.code,'22023');
 assert.deepEqual((await teacher.rpc('get_live_class_compact_event_page_secure',{...args,p_student_ids:[]})).data,[]);
 assert.deepEqual((await teacher.rpc('get_live_class_compact_event_page_secure',{...args,p_event_types:[]})).data,[]);
 const timings={full:[],compact:[]};
 for(let round=0;round<5;round++) for(const mode of (round%2 ? ['compact','full'] : ['full','compact'])) {
  const start=performance.now();
  const result=await fetchLiveClassEvents(teacher,{...options,compact:mode==='compact'});
  assert.equal(result.error,null);
  timings[mode].push(Math.round(performance.now()-start));
 }
 console.log(JSON.stringify({sequentialReadMs:timings,limitation:'Single synthetic student; not concurrent load or browser rendering'}));
 console.log(JSON.stringify({http:'passed',fullRows:full.data.length,compactRows:compact.data.length,fullBytes:JSON.stringify(full.data).length,compactBytes:JSON.stringify(compact.data).length}));
} finally {
 sql(`begin; delete from public.live_activity_events where id in (${ids}); drop function if exists ${signature}; drop function if exists public.live_event_has_activity_context(jsonb); notify pgrst,'reload schema'; commit;`);
}
