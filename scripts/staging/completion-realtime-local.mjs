import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { localConfig, localDir } from './local-config.mjs';
const config = localConfig();
const groups = ['', '-2', '-3', '-4'].map(s => JSON.parse(fs.readFileSync(`${localDir}/synthetic-accounts${s}.json`, 'utf8')));
const run = crypto.randomUUID();
let denialChecks = 0;
const samples = [], clients = [], failures = [], received = new Map(), sent = new Map();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function rpc(name, args, session, expectedDenial = false) {
  const start = performance.now();
  let response;
  try { response = await fetch(`${config.API_URL}/rest/v1/rpc/${name}`, {
    method: 'POST', headers: { apikey: config.ANON_KEY, Authorization: `Bearer ${config.ANON_KEY}`, 'Content-Type': 'application/json', ...(session ? { 'x-student-session': session } : {}) },
    body: JSON.stringify(args), signal: AbortSignal.timeout(15000),
  });
  } catch(error) {
    samples.push({name,ms:performance.now()-start,status:0});
    throw new Error(`${name}: transport failure ${error.cause?.code ?? error.name}`,{cause:error});
  }
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (expectedDenial) {
    assert.ok(!response.ok && data?.code === '42501' && data?.message === 'Student write access denied', 'Expected an explicit student-access denial');
    denialChecks++;
    return;
  }
  samples.push({name, ms:performance.now()-start, status:response.status});
  assert.ok(response.ok, `${name}: HTTP ${response.status}, ${data?.code}, ${data?.message}`);
  return data;
}
let checked = 0, teacherVerified = 0;
try {
  for (const group of groups) {
    const client = createClient(config.API_URL, config.ANON_KEY, { auth: { persistSession:false, autoRefreshToken:false } });
    clients.push(client);
    const auth = await client.auth.signInWithPassword({email:group.email,password:group.password});
    assert.equal(auth.error,null);
    await new Promise((resolve,reject) => {
      const timeout = setTimeout(() => reject(new Error('Realtime subscription timeout')),15000);
      client.channel(`capacity-${run}-${group.classId}`).on('postgres_changes', {event:'INSERT',schema:'public',table:'live_activity_events',filter:`class_id=eq.${group.classId}`}, payload => {
        const row = payload.new;
        if (row.payload?.capacity_run !== run) return;
        if (row.class_id !== group.classId || !group.students.some(s => s.studentId === row.student_id)) failures.push('Realtime class scope mismatch');
        received.set(row.student_id,performance.now());
      }).subscribe(status => {
        if (status === 'SUBSCRIBED') {clearTimeout(timeout);resolve();}
        if (['CHANNEL_ERROR','TIMED_OUT'].includes(status)) {clearTimeout(timeout);reject(new Error(`Realtime ${status}`));}
      });
    });
  }
  console.log('Four authenticated teacher subscriptions ready; starting 100 student completion/retry journeys.');
  const results = await Promise.allSettled(groups.flatMap(group => group.students.map(async student => {
    const id = student.studentId;
    const login = await rpc('student_login_lookup',{p_class_id:group.classId,p_display_name:student.username,p_pin:student.pin});
    assert.equal(login[0].student_id,id);
    const session = login[0].session_token;
    const readArgs = {p_student_id:id,p_realm_id:'number',p_working_level:'Year 4'};
    const base = {...readArgs,p_class_id:group.classId,p_program_key:'year4-number',p_school_year_level:'Year 4'};
    const lessonRead = () => rpc('get_student_realm_lesson_attempts_secure',readArgs,session);
    const quizRead = () => rpc('get_student_realm_weekly_quiz_attempts_secure',readArgs,session);
    const assessmentRead = () => rpc('get_student_realm_assessments_secure',readArgs,session);
    const xp = async () => (await rpc('get_student_activity_daily_secure',{p_student_id:id},session)).reduce((n,r)=>n+r.xp_earned,0);
    const before = await Promise.all([lessonRead(),quizRead(),assessmentRead(),xp()]);
    async function assessment(type) {
      const score = type === 'pretest' ? 60 : 90;
      const args = {...base,p_assessment_type:type,p_completion_key:crypto.randomUUID(),p_attempt:{correct_count:score/10,total_questions:10,score_percent:score,passed:score>=85},p_progress:{status:'ASSIGNED_PROGRAM',placement_complete:true,current_week:1,assigned_week:1,required_weeks:[1],optional_weeks:[]}};
      const saves = await Promise.all([rpc('complete_realm_assessment',args,session),rpc('complete_realm_assessment',args,session)]);
      assert.equal(saves.filter(Boolean).length,1);
    }
    await assessment('pretest');
    let lessonXP = 0;
    for (let lessonNumber = 1; lessonNumber <= 3; lessonNumber++) {
    const lesson = {...base,p_week:1,p_lesson:lessonNumber,p_lesson_id:`capacity-year4-w1-l${lessonNumber}`,p_completion_key:crypto.randomUUID(),p_attempt:{questionsAnswered:10,correctAnswers:9,completed:true,capacity_run:run},p_xp:40};
    await rpc('complete_realm_lesson',lesson,null,true);
    await rpc('complete_realm_lesson',{...lesson,p_student_id:group.students.find(s=>s.studentId!==id).studentId},session,true);
    const lessonRewards = await Promise.all([rpc('complete_realm_lesson',lesson,session),rpc('complete_realm_lesson',lesson,session)]);
    assert.equal(lessonRewards.filter(Boolean).length,before[0].some(r=>r.week===1&&r.lesson===lessonNumber&&r.completed)?0:1);
    lessonXP += lessonRewards.filter(Boolean).length*40;
    }
    const quiz = {...base,p_week:1,p_quiz_id:'capacity-year4-w1-quiz',p_completion_key:crypto.randomUUID(),p_attempt:{total:10,score:9,percent:90,passed:true},p_xp:60};
    const quizRewards = await Promise.all([rpc('complete_realm_quiz',quiz,session),rpc('complete_realm_quiz',quiz,session)]);
    assert.equal(quizRewards.filter(Boolean).length,before[1].some(r=>r.quiz_id===quiz.p_quiz_id&&r.passed)?0:1);
    await assessment('posttest');
    const after = await Promise.all([lessonRead(),quizRead(),assessmentRead(),xp()]);
    assert.equal(after[0].length,before[0].length+3,'Duplicate lesson retry must not duplicate attempt');
    assert.equal(after[1].length,before[1].length+1,'Duplicate quiz retry must not duplicate attempt');
    assert.equal(after[2].length,before[2].length+2,'Each assessment must save exactly once');
    assert.equal(after[3]-before[3],lessonXP+quizRewards.filter(Boolean).length*60,'XP must be paid exactly once');
    const savedLessons = after[0].filter(r=>r.summary?.capacity_run===run);
    assert.equal(savedLessons.length,3);
    assert.ok(savedLessons.every(r=>r.completed && r.correct_count===9 && r.total_questions===10));
    checked++;
    sent.set(id,performance.now());
    await rpc('insert_live_activity_event_secure',{p_student_id:id,p_class_id:group.classId,p_session_id:null,p_event_type:'lesson_completed',p_payload:{capacity_run:run}},session);
  })));
  for (const result of results) if (result.status === 'rejected') failures.push(result.reason.message);
  const deadline = Date.now()+5000;
  while (received.size < sent.size && Date.now()<deadline) await sleep(100);
  assert.equal(received.size,100,'Every student event must reach the correct teacher');
  for (let i = 0; i < groups.length; i++) {
    const {data,error} = await clients[i].rpc('get_class_realm_progress_compat',{p_class_id:groups[i].classId,p_realm_id:'number',p_working_level:'Year 4'});
    assert.equal(error,null);
    for (const student of groups[i].students) {
      const rows = data.filter(row=>row.student_id===student.studentId);
      assert.equal(rows.length,1);
      assert.ok(rows[0].placement_complete && rows[0].pretest_score===60 && rows[0].posttest_score===90, 'Teacher must see persisted canonical assessment results');
      teacherVerified++;
    }
  }
} catch (error) { failures.push(error.message); }
finally { await Promise.all(clients.map(client=>client.removeAllChannels())); }
const endpoints = [...new Set(samples.map(s=>s.name))].map(name=>{
  const rows=samples.filter(s=>s.name===name),times=rows.map(s=>s.ms).sort((a,b)=>a-b);
  return {name,requests:rows.length,failures:rows.filter(s=>s.status<200||s.status>=400).length,p95Ms:Math.round(times[Math.ceil(times.length*.95)-1]),p99Ms:Math.round(times[Math.ceil(times.length*.99)-1])};
});
const lag=[...received].filter(([id])=>sent.has(id)).map(([id,t])=>t-sent.get(id)).sort((a,b)=>a-b);
const report={at:new Date().toISOString(),environment:'local synthetic completion/retry and realtime burst',students:100,verifiedJourneys:checked,teacherVerifiedStudents:teacherVerified,requests:samples.length,expectedStudentDenials:denialChecks,eventsReceived:received.size,realtimeP95Ms:Math.round(lag[Math.ceil(lag.length*.95)-1]??0),realtimeMaximumMs:Math.round(lag.at(-1)??0),failures,endpoints};
report.passed=checked===100&&denialChecks===600&&teacherVerified===100&&endpoints.every(e=>e.failures===0&&e.p95Ms<1000&&e.p99Ms<3000)&&failures.length===0&&lag.length===100&&report.realtimeMaximumMs<5000;
fs.writeFileSync(`${localDir}/completion-realtime-result.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(!report.passed)process.exitCode=1;
