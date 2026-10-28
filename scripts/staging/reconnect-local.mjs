// Uses the application's event reader, rather than a separate test-only query.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { fetchLiveClassEvents } from '../../lib/live-class-events.ts';
import { localConfig, localDir } from './local-config.mjs';
const config=localConfig();
const group=JSON.parse(fs.readFileSync(`${localDir}/synthetic-accounts-4.json`,'utf8'));
const student=group.students[0], run=crypto.randomUUID();
const teacher=createClient(config.API_URL,config.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const studentClient=createClient(config.API_URL,config.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const received=new Set(), report={at:new Date().toISOString(),environment:'isolated local reconnect and application event-read regression',checks:{},failures:[]};
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function subscribe() {
  return await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Subscription timed out')),15000);
    const channel=teacher.channel(`reconnect-${crypto.randomUUID()}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'live_activity_events',filter:`class_id=eq.${group.classId}`},({new:row})=>{
      if(row.payload?.reconnect_run===run)received.add(row.payload.phase);
    }).subscribe(status=>{
      if(status==='SUBSCRIBED'){clearTimeout(timer);resolve(channel);}
      if(['CHANNEL_ERROR','TIMED_OUT'].includes(status)){clearTimeout(timer);reject(new Error(status));}
    });
  });
}
async function awaitEvent(phase){const deadline=Date.now()+5000;while(!received.has(phase)&&Date.now()<deadline)await pause(50);assert.ok(received.has(phase),`Missing ${phase} realtime event`);}
const eventTypes=['activity_started','lesson_started','quiz_started','question_loaded','answer_correct','answer_incorrect','hint_used','lesson_completed','quiz_completed','idle_detected'];
try {
  const auth=await teacher.auth.signInWithPassword({email:group.email,password:group.password});assert.equal(auth.error,null);
  const login=await studentClient.rpc('student_login_lookup',{p_class_id:group.classId,p_display_name:student.username,p_pin:student.pin});assert.equal(login.error,null);
  const writer=createClient(config.API_URL,config.ANON_KEY,{auth:{persistSession:false},global:{headers:{'x-student-session':login.data[0].session_token}}});
  async function emit(phase){const result=await writer.rpc('insert_live_activity_event_secure',{p_student_id:student.studentId,p_class_id:group.classId,p_session_id:null,p_event_type:'answer_correct',p_payload:{reconnect_run:run,phase}});assert.equal(result.error,null);}
  let channel=await subscribe();
  await emit('before');await awaitEvent('before');report.checks.initialDelivery=true;
  assert.equal(await teacher.removeChannel(channel),'ok');
  await emit('offline');await pause(250);assert.ok(!received.has('offline'));report.checks.subscriptionRemoved=true;
  // Exercise the same class snapshot query used by the polling fallback.
  const fallback=await fetchLiveClassEvents(teacher,{classId:group.classId,eventTypes});assert.equal(fallback.error,null);
  report.snapshotRows=fallback.data.length;
  const legacy=await teacher.from('live_activity_events').select('id,payload').eq('class_id',group.classId).in('event_type',eventTypes).order('created_at',{ascending:true});
  assert.equal(legacy.error,null);
  report.legacySnapshotRows=legacy.data.length;
  report.legacyAlsoOmitsMissedEvent=!legacy.data.some(row=>row.payload?.reconnect_run===run&&row.payload.phase==='offline');
  report.checks.pollRecoversMissedEvent=fallback.data.some(row=>row.payload?.reconnect_run===run&&row.payload.phase==='offline');
  // Timeline verifies the row really exists independently of the class snapshot.
  const timeline=await fetchLiveClassEvents(teacher,{classId:group.classId,studentIds:[student.studentId],newestFirst:true,limit:15});assert.equal(timeline.error,null);
  report.checks.timelineContainsMissedEvent=timeline.data.some(row=>row.payload?.reconnect_run===run&&row.payload.phase==='offline');
  channel=await subscribe();await emit('after');await awaitEvent('after');report.checks.reconnectedDelivery=true;
  const refresh=await fetchLiveClassEvents(teacher,{classId:group.classId,eventTypes});assert.equal(refresh.error,null);
  report.checks.refreshContainsLatestEvent=refresh.data.some(row=>row.payload?.reconnect_run===run&&row.payload.phase==='after');
  for(const [name,passed] of Object.entries(report.checks))if(!passed)report.failures.push(name);
} catch(error){report.failures.push(error.message);}
finally {await teacher.removeAllChannels();await studentClient.removeAllChannels();}
report.passed=report.failures.length===0;
fs.writeFileSync(`${localDir}/reconnect-result.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(!report.passed)process.exitCode=1;
