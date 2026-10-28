// Mirrors the six read sources in LiveClassPanel; no student writes.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { fetchLiveClassEvents } from '../../lib/live-class-events.ts';
import { localConfig, localDir } from './local-config.mjs';
const config=localConfig();
const groups=['','-2','-3','-4'].map(s=>JSON.parse(fs.readFileSync(`${localDir}/synthetic-accounts${s}.json`,'utf8')));
const samples=[],failures=[];let httpRequests=0;
const teachers=await Promise.all(groups.map(async group=>{
 const client=createClient(config.API_URL,config.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(...args)=>{httpRequests++;return fetch(...args);}}});
 assert.equal((await client.auth.signInWithPassword({email:group.email,password:group.password})).error,null);
 return {client,group};
}));
const started=Date.now(),deadline=started+120000;
const results=await Promise.allSettled(teachers.map(async({client,group})=>{
 const ids=group.students.map(s=>s.studentId),allowed=new Set(ids);
 do{
  const start=performance.now();
  const results=await Promise.all([
   client.from('live_student_activity').select('*').eq('class_id',group.classId).order('last_active_at',{ascending:false}),
   fetchLiveClassEvents(client,{classId:group.classId,eventTypes:['activity_started','lesson_started','quiz_started','question_loaded','answer_correct','answer_incorrect','hint_used','lesson_completed','quiz_completed','idle_detected']}),
   client.from('student_lesson_attempts').select('student_id,realm_id,working_level,week,lesson,lesson_id,attempt_no,correct_count,total_questions,accuracy_percent,completed,completed_at').in('student_id',ids).eq('completed',true),
   client.from('student_weekly_quiz_attempts').select('student_id,realm_id,working_level,week,quiz_id,attempt_no,correct_count,total_questions,accuracy_percent,completed_at').in('student_id',ids),
   client.from('student_realm_assessments').select('student_id,realm_id,working_level,assessment_type,correct_count,total_questions,score_percent,completed_at').in('student_id',ids),
   client.rpc('get_live_class_activity_today',{p_class_id:group.classId}),
  ]);
  for(const result of results){assert.equal(result.error,null);assert.ok(Array.isArray(result.data));}
  assert.ok(results[1].data.length>=5000,'Complete historical event snapshot');
  assert.ok(results[0].data.every(row=>row.class_id===group.classId));
  assert.equal(new Set(results[0].data.filter(row=>allowed.has(row.student_id)).map(row=>row.student_id)).size,25,'Every fixture student has live activity evidence');
  assert.ok(results[1].data.every(row=>row.class_id===group.classId));
  for(const result of results.slice(2,5)){
   assert.ok(result.data.every(row=>allowed.has(row.student_id)),'Attempt data stays within selected class');
   assert.equal(new Set(result.data.map(row=>row.student_id)).size,25,'All synthetic students retain canonical evidence');
  }
  samples.push(performance.now()-start);
  await new Promise(resolve=>setTimeout(resolve,Math.min(2000,Math.max(0,deadline-Date.now()))));
 }while(Date.now()<deadline);
}));
for(const result of results)if(result.status==='rejected')failures.push(result.reason.message);
samples.sort((a,b)=>a-b);
const report={at:new Date().toISOString(),environment:'local six-source dashboard snapshots during student soak',teachers:4,durationSeconds:Math.round((Date.now()-started)/1000),snapshots:samples.length,httpRequests,failures,p95Ms:Math.round(samples[Math.ceil(samples.length*.95)-1]??0),p99Ms:Math.round(samples[Math.ceil(samples.length*.99)-1]??0),maximumMs:Math.round(samples.at(-1)??0)};
report.passed=failures.length===0&&samples.length>0&&report.p95Ms<1000&&report.p99Ms<3000;
fs.writeFileSync(`${localDir}/dashboard-snapshot-result.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(!report.passed)process.exitCode=1;
