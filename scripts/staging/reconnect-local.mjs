// Uses the application's event reader, rather than a separate test-only query.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import net from 'node:net';
import { createClient } from '@supabase/supabase-js';
import { createLiveClassEventReader, fetchLiveClassEvents } from '../../lib/live-class-events.ts';
import { localConfig, localDir } from './local-config.mjs';
const config=localConfig();
const mode=process.env.SCALE_RECONNECT_MODE ?? 'subscription';
assert.ok(['subscription','socket'].includes(mode),'Reconnect mode must be subscription or socket');
const group=JSON.parse(fs.readFileSync(`${localDir}/synthetic-accounts-4.json`,'utf8'));
const student=group.students[0], run=crypto.randomUUID();
// Only the test teacher's WebSocket crosses this loopback proxy. Never inspect
// or log bytes/URLs: handshake URLs contain credentials. REST remains direct.
const sockets=new Set();
let online=true;
const proxy=mode==='socket' ? net.createServer(downstream=>{
  if(!online){downstream.destroy();return;}
  const upstream=net.createConnection({host:'127.0.0.1',port:56521});
  sockets.add(downstream);sockets.add(upstream);
  for(const [socket,peer] of [[downstream,upstream],[upstream,downstream]]){
    socket.on('error',()=>socket.destroy());
    socket.on('close',()=>{sockets.delete(socket);peer.destroy();});
  }
  downstream.pipe(upstream);upstream.pipe(downstream);
}) : null;
if(proxy)await new Promise((resolve,reject)=>{proxy.once('error',reject);proxy.listen(0,'127.0.0.1',resolve);});
const transport=proxy ? class extends globalThis.WebSocket {
  constructor(address){
    const url=new URL(address);
    assert.equal(url.hostname,'127.0.0.1');assert.equal(url.port,'56521');
    url.port=String(proxy.address().port);
    super(url.toString());
  }
} : undefined;
const teacher=createClient(config.API_URL,config.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false},...(transport ? {realtime:{transport}} : {})});
const studentClient=createClient(config.API_URL,config.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const received=new Set(), report={at:new Date().toISOString(),environment:'isolated local reconnect and application event-read regression',mode,channelStatuses:[],channelTransitions:[],systemStatuses:[],markers:[],checks:{},failures:[]};
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const eventTypes=['activity_started','lesson_started','quiz_started','question_loaded','answer_correct','answer_incorrect','hint_used','lesson_completed','quiz_completed','idle_detected'];
const studentIds=group.students.map(row=>row.studentId);
const reader=createLiveClassEventReader(teacher,{classId:group.classId,studentIds,eventTypes});
let connectedBefore=false;
let subscriptions=0;
let streamReady=false;
const started=Date.now();
// Match LiveClassPanel's invalidation hooks; refresh timing is driven explicitly
// below. Socket mode leaves the same channel mounted and uses SDK retry defaults.
async function subscribe() {
  return await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Subscription timed out')),15000);
    const channel=teacher.channel(`live-class-${group.classId}`,{config:{private:true}}).on('postgres_changes',{event:'*',schema:'public',table:'live_activity_events',filter:`class_id=eq.${group.classId}`},payload=>{
      if(payload.eventType!=='INSERT')reader.invalidate();
      else reader.inserted(payload.new.created_at);
      if(payload.new?.payload?.reconnect_run===run)received.add(payload.new.payload.phase);
    }).on('system',{},payload=>{
      const postgres=payload.extension==='postgres_changes';
      report.systemStatuses.push({elapsedMs:Date.now()-started,postgres,status:['ok','error'].includes(payload.status)?payload.status:'other'});
      if(postgres&&payload.status==='ok')streamReady=true;
    }).subscribe(status=>{
      report.channelStatuses.push(status);
      report.channelTransitions.push({elapsedMs:Date.now()-started,status});
      if(status==='SUBSCRIBED'){
        subscriptions++;
        if(connectedBefore)reader.invalidate();
        connectedBefore=true;
        clearTimeout(timer);resolve(channel);
      }
      if(['CHANNEL_ERROR','TIMED_OUT'].includes(status)){clearTimeout(timer);reject(new Error(status));}
    });
  });
}
// Keep testing the polling fallback even when live delivery misses its deadline.
// A false delivery check still fails the final report; no timeout is relaxed.
async function awaitEvent(phase){const deadline=Date.now()+5000;while(!received.has(phase)&&Date.now()<deadline)await pause(50);return received.has(phase);}
async function snapshot(expectedPhases) {
  const result=await reader.read();assert.equal(result.error,null);
  assert.ok(result.data.every(row=>row.class_id===group.classId&&studentIds.includes(row.student_id)), 'Snapshot class/student isolation');
  assert.equal(new Set(result.data.map(row=>row.id)).size,result.data.length,'No duplicate events after refresh');
  const phases=result.data.filter(row=>row.payload?.reconnect_run===run).map(row=>row.payload.phase).sort();
  assert.deepEqual(phases,[...expectedPhases].sort(),'Every marker appears exactly once in snapshot');
  return result.data;
}
try {
  const auth=await teacher.auth.signInWithPassword({email:group.email,password:group.password});assert.equal(auth.error,null);
  const login=await studentClient.rpc('student_login_lookup',{p_class_id:group.classId,p_display_name:student.username,p_pin:student.pin});assert.equal(login.error,null);
  const writer=createClient(config.API_URL,config.ANON_KEY,{auth:{persistSession:false},global:{headers:{'x-student-session':login.data[0].session_token}}});
  async function emit(phase){
    const marker={phase,startedMs:Date.now()-started};
    const result=await writer.rpc('insert_live_activity_event_secure',{p_student_id:student.studentId,p_class_id:group.classId,p_session_id:null,p_event_type:'answer_correct',p_payload:{reconnect_run:run,phase}});
    assert.equal(result.error,null);report.markers.push({...marker,completedMs:Date.now()-started});
  }
  let channel=await subscribe();
  await emit('before');report.checks.initialDelivery=await awaitEvent('before');
  const readyDeadline=Date.now()+5000;
  while(!streamReady&&Date.now()<readyDeadline)await pause(50);
  assert.ok(streamReady,'Database-change readiness must be observed');
  await emit('ready');report.checks.readyStreamDelivery=await awaitEvent('ready');
  const initial=await snapshot(['before','ready']);
  report.initialSnapshotRows=initial.length;
  assert.ok(initial.length>500,'Exercise multiple history pages');
  report.checks.initialIncrementalReaderSnapshot=true;
  const joinsBeforeFault=subscriptions;
  if(proxy){
    online=false;
    for(const socket of sockets)socket.destroy();
    await pause(1200);
    assert.equal(teacher.realtime.isConnected(),false,'Test socket must actually disconnect');
    report.checks.transportDisconnected=true;
  }else assert.equal(await teacher.removeChannel(channel),'ok');
  await emit('offline');await pause(250);assert.ok(!received.has('offline'));report.checks.notificationPathUnavailable=true;
  // Poll while the subscription is absent; the mounted reader retains its cursor.
  const fallback=await snapshot(['before','ready','offline']);
  report.snapshotRows=fallback.length;
  report.checks.pollRecoversMissedEvent=true;
  // Timeline verifies the row really exists independently of the class snapshot.
  const timeline=await fetchLiveClassEvents(teacher,{classId:group.classId,studentIds:[student.studentId],newestFirst:true,limit:15});assert.equal(timeline.error,null);
  report.checks.timelineContainsMissedEvent=timeline.data.some(row=>row.payload?.reconnect_run===run&&row.payload.phase==='offline');
  // Leave another event unread so the rejoin's full reconciliation must recover it.
  await emit('offline-unpolled');
  assert.ok(!received.has('offline-unpolled'));
  if(proxy){
    const restoredAt=Date.now();
    online=true;
    const deadline=Date.now()+15000;
    while(subscriptions===joinsBeforeFault&&Date.now()<deadline)await pause(50);
    assert.ok(subscriptions>joinsBeforeFault,'SDK must automatically rejoin without subscribe/connect calls');
    assert.ok(teacher.getChannels().includes(channel),'Same channel remains mounted');
    report.rejoinAfterRestoreMs=Date.now()-restoredAt;
    report.checks.automaticRejoin=true;
  }else channel=await subscribe();
  await emit('after');report.checks.reconnectedDelivery=await awaitEvent('after');
  const refresh=await snapshot(['before','ready','offline','offline-unpolled','after']);
  report.checks.rejoinRecoversUnpolledEvent=true;
  report.checks.refreshContainsLatestEvent=true;
  assert.equal(await snapshot(['before','ready','offline','offline-unpolled','after']),refresh,'Unchanged refresh preserves snapshot reference');
  report.checks.unchangedRefreshHasNoDuplicates=true;
  for(const [name,passed] of Object.entries(report.checks))if(!passed)report.failures.push(name);
} catch(error){report.failures.push(error.message);}
finally {
  reader.dispose();await teacher.removeAllChannels();await studentClient.removeAllChannels();
  if(proxy){
    online=false;
    for(const socket of sockets)socket.destroy();
    await new Promise(resolve=>proxy.close(resolve));
  }
}
report.privateChannels=true;
report.limitations=[mode==='socket'?'Forced local TCP interruption; REST stays available, not whole-device/browser network loss':'Controlled subscription removal/rejoin, not automatic socket recovery','Polling invoked directly, not the browser 30-second scheduler','Single synthetic class, not concurrent 500-student reconnects'];
report.passed=report.failures.length===0;
fs.writeFileSync(`${localDir}/reconnect${mode==='socket'?'-socket':''}-result.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(!report.passed)process.exitCode=1;
