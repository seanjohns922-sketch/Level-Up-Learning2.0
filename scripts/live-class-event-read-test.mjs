import assert from 'node:assert/strict';
import { fetchLiveClassEvents } from '../lib/live-class-events.ts';
const a={id:'a',created_at:'2026-01-01T00:00:00Z'}, b={id:'b',created_at:a.created_at}, c={id:'c',created_at:'2026-01-02T00:00:00Z'};
const ok=data=>({data,error:null});
function mock(tableResults,rpcResults){
 const calls=[];
 function builder(result,label){
  assert.ok(result,`Unexpected ${label} request`);
  const chain={then:(resolve,reject)=>Promise.resolve(result).then(resolve,reject)};
  for(const method of ['select','eq','in','or','order','limit'])chain[method]=(...args)=>{calls.push([label,method,...args]);return chain;};
  return chain;
 }
 return {calls,client:{from(name){calls.push(['from',name]);return builder(tableResults.shift(),'table');},rpc(name,args){calls.push(['rpc',name,args]);return builder(rpcResults.shift(),'rpc');}}};
}
const options={classId:'class',studentIds:['student'],eventTypes:['answer_correct']};
const paged=mock([ok([c])],[ok([a,b]),ok([c])]);
assert.deepEqual((await fetchLiveClassEvents(paged.client,options)).data,[a,b,c]);
const requests=paged.calls.filter(c=>c[0]==='rpc'&&c[1].startsWith('get_'));
assert.equal(requests[0][1],'get_live_class_event_page_secure');
assert.equal(requests[1][2].p_after_id,'b','Timestamp ties advance by ID');
assert.equal(requests[1][2].p_after_created_at,a.created_at);
assert.equal(requests[1][2].p_through_id,'c','Fixed upper cursor across pages');
assert.deepEqual(requests[0][2].p_student_ids,options.studentIds);
assert.deepEqual(requests[0][2].p_event_types,options.eventTypes);
// Short pages are not EOF: a server cap smaller than 500 must not truncate results.
assert.equal(requests.length,2);
const absent=mock([ok([c]),ok([a,b]),ok([c])],[{data:null,error:{code:'PGRST202'}}]);
assert.deepEqual((await fetchLiveClassEvents(absent.client,options)).data,[a,b,c]);
assert.equal(absent.calls.filter(c=>c[0]==='rpc'&&c[1].startsWith('get_')).length,1);
assert.ok(absent.calls.some(c=>c[1]==='or'&&c[2].includes('id.gt.b')));
for(const code of ['42501','57014','42883','PGRST301']){
 const denied=mock([ok([c])],[ok([a]),{data:null,error:{code}}]);
 const result=await fetchLiveClassEvents(denied.client,options);
 assert.equal(result.error.code,code);
 assert.equal(result.data,null,'A later failure must not publish partial history');
 assert.equal(denied.calls.filter(c=>c[0]==='from').length,1,'Do not bypass failures');
}
const empty=mock([ok([])],[]);
assert.deepEqual((await fetchLiveClassEvents(empty.client,{classId:'class',studentIds:[],eventTypes:[]})).data,[]);
assert.ok(empty.calls.some(c=>c[1]==='in'&&c[2]==='student_id'&&c[3].length===0));
const reverse=mock([ok([c])],[ok([a,b,c])]);
assert.deepEqual((await fetchLiveClassEvents(reverse.client,{...options,newestFirst:true})).data,[c,b,a]);
const timeline=mock([],[ok([c])]);
await fetchLiveClassEvents(timeline.client,{...options,newestFirst:true,limit:15});
assert.equal(timeline.calls[0][1],'get_live_class_events_secure');
assert.equal(timeline.calls[0][2].p_limit,15);
assert.ok(timeline.calls.some(c=>c[1]==='order'&&c[2]==='created_at'&&c[3].ascending===false));
const timelineFallback=mock([ok([c])],[{data:null,error:{code:'PGRST202'}}]);
await fetchLiveClassEvents(timelineFallback.client,{...options,newestFirst:true,limit:15});
assert.ok(timelineFallback.calls.some(c=>c[0]==='table'&&c[1]==='limit'&&c[2]===15));
const deletedHead=mock([ok([c])],[ok([a,b]),ok([])]);
assert.deepEqual((await fetchLiveClassEvents(deletedHead.client,options)).data,[a,b]);
console.log('PASS: complete keyset pages, tied timestamps, fixed upper cursor, smaller API caps, fail-closed partial reads, rollout fallback and latest-15 timeline.');
