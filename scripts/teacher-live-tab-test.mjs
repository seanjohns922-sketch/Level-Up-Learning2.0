import assert from 'node:assert/strict';
import React from 'react';
import { domHarness } from './test-support/react-dom-harness.mjs';
const readers = [], channels = [], attempts = [];
let tableReads = 0;
const h = domHarness({
  '@/components/FullscreenToggle': { FullscreenToggle: () => null },
  '@/components/teacher/LiveStudentDrawer': { LiveStudentDrawer: () => null },
  '@/lib/live-class-attempts': { async fetchLiveClassAttempts(_client,table,ids) { attempts.push({table,ids}); return {data:[],error:null}; } },
  '@/lib/coalesced-refresh': { createCoalescedRefresh(load) { let disposed=false; return {request(){if(!disposed)void load();},dispose(){disposed=true;}}; } },
  '@/lib/live-class-events': {
    createLiveClassEventReader(_client,options) {
      const reader={options,reads:0,disposed:false,invalidations:0,insertions:0,
        async read(){reader.reads++;return {data:[],error:null};},
        invalidate(){reader.invalidations++;},inserted(){reader.insertions++;},dispose(){reader.disposed=true;}};
      readers.push(reader);return reader;
    },
    async fetchLiveClassEvents(){return {data:[],error:null};},
  },
  '@/lib/supabase': {supabase:{
    from(){ const query={select(){return query;},eq(){return query;},order(){return query;},limit(){return query;},
      async maybeSingle(){return {data:{id:'existing'},error:null};},
      async then(resolve){tableReads++;return resolve({data:[],error:null});}};return query;},
    async rpc(){return {data:[],error:null};},
    channel(){const channel={handlers:[],removed:false,on(type,filter,callback){channel.handlers.push({type,filter,callback});return channel;},subscribe(){return channel;}};channels.push(channel);return channel;},
    async removeChannel(channel){channel.removed=true;},
  }},
});
try {
  Object.defineProperty(h.document,'visibilityState',{configurable:true,get:()=> 'visible'});
  const Panel=h.load('components/teacher/LiveClassPanel.tsx').default;
  const Mounted=props=>React.createElement(Panel,{...props,key:props.selectedClass.id});
  const props={selectedClass:{id:'a',name:'Class A',class_code:'test-a'},students:[{id:'student-a',display_name:'Amy'}],progressRows:[],active:true};
  await h.render(Mounted,props);
  const current=readers.at(-1), count=readers.length, initial=current.reads, reads=tableReads;
  assert(initial>0);
  await h.render(Mounted,{...props,active:false});
  const activeChannel=channels.at(-1);
  await h.act(async()=>{
    activeChannel.handlers.find(item=>item.filter.table==='live_activity_events').callback({eventType:'INSERT',new:{created_at:'2026-11-19T00:00:00Z'}});
    h.document.defaultView.dispatchEvent(new h.document.defaultView.Event('focus'));
  });
  assert.equal(tableReads,reads,'Hidden panel must not reload on focus or realtime events');
  assert.equal(current.reads,initial);
  assert.equal(current.insertions,1,'Hidden panel still records event invalidation hints');
  await h.render(Mounted,props);
  assert.equal(readers.length,count,'Tab return must retain the event reader/cache');
  assert(current.reads>initial,'Tab return must reconcile current results');
  assert(!current.disposed);
  const attemptsBefore=attempts.length;
  const next={...props,selectedClass:{id:'b',name:'Class B',class_code:'test-b'},students:[{id:'student-b',display_name:'Ben'}],active:false};
  await h.render(Mounted,next);
  assert(current.disposed && activeChannel.removed,'Class change disposes old reader and subscription');
  assert.equal(attempts.length,attemptsBefore,'Inactive new class does not preload history');
  await h.render(Mounted,{...next,active:true});
  assert(attempts.slice(attemptsBefore).every(read=>read.ids.length===1&&read.ids[0]==='student-b'));
  assert(h.document.body.textContent.includes('Ben')&&!h.document.body.textContent.includes('Amy'),'Old class never appears in new panel');
  console.log('PASS actual Live Class tab lifecycle: retained reader, hidden read pause, immediate return refresh, class isolation and disposal.');
} finally {await h.close();}
