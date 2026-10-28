import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { fetchLiveClassEvents } from '../../lib/live-class-events.ts';
import { localConfig, localDir } from './local-config.mjs';
const config=localConfig(), group=JSON.parse(fs.readFileSync(`${localDir}/synthetic-accounts-3.json`,'utf8'));
const teacher=createClient(config.API_URL,config.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const provisioner=createClient(config.API_URL,config.SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const marker=crypto.randomUUID();
const rows=Array.from({length:1201},(_,i)=>({id:crypto.randomUUID(),class_id:group.classId,student_id:group.students[i===1200?24:0].studentId,event_type:'question_loaded',created_at:'2026-01-02T00:00:00Z',payload:{page_test:marker}}));
try{
 assert.equal((await teacher.auth.signInWithPassword({email:group.email,password:group.password})).error,null);
 for(let i=0;i<rows.length;i+=300)assert.equal((await provisioner.from('live_activity_events').insert(rows.slice(i,i+300))).error,null);
 const options={classId:group.classId,eventTypes:['question_loaded','answer_correct']};
 const result=await fetchLiveClassEvents(teacher,options);assert.equal(result.error,null);
 const ids=new Set(result.data.map(row=>row.id));
 assert.equal(ids.size,result.data.length,'No duplicate page boundary records');
 assert.ok(rows.every(row=>ids.has(row.id)),'All 1201 equal-timestamp rows, including the quiet student, survive page boundaries');
 // Simulate only the new endpoint being absent; real RLS-protected HTTP reads remain.
 const fallback={from:teacher.from.bind(teacher),rpc(){return {select(){return this;},order(){return this;},then(resolve){return Promise.resolve({data:null,error:{code:'PGRST202'}}).then(resolve);}};}};
 const legacy=await fetchLiveClassEvents(fallback,options);assert.equal(legacy.error,null);
 assert.deepEqual(legacy.data.map(row=>row.id),result.data.map(row=>row.id),'Migration-free fallback returns the same complete ordered history');
 const empty=await fetchLiveClassEvents(teacher,{classId:group.classId,studentIds:[]});assert.equal(empty.error,null);assert.equal(empty.data.length,0);
 console.log('PASS: >1000 tied timestamps, quiet student preservation, no duplicated boundaries, empty filters and real legacy fallback parity.');
}finally{
 const removed=await provisioner.from('live_activity_events').delete().eq('class_id',group.classId).eq('payload->>page_test',marker);
 assert.equal(removed.error,null,'Remove only this run’s synthetic events');
}
