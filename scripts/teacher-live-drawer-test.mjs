import assert from 'node:assert/strict';
import { mock } from 'node:test';
mock.timers.enable({ apis: ['Date', 'setTimeout', 'setInterval'], now: 0 });
const timelineReads = [];
let drawer;
import { domHarness } from './test-support/react-dom-harness.mjs';
const readers = [], channels = [], attempts = [];
let lessonAttempts = [];
const h = domHarness({
  '@/components/FullscreenToggle': { FullscreenToggle: () => null },
  '@/components/teacher/LiveStudentDrawer': { LiveStudentDrawer: props => { drawer = props; return null; } },
  '@/lib/live-class-attempts': { async fetchLiveClassAttempts(_client,table,ids) { attempts.push({table,ids}); return {data:table === 'student_lesson_attempts' ? lessonAttempts.filter(row=>ids.includes(row.student_id)) : [],error:null}; } },
  '@/lib/live-class-events': {
    createLiveClassEventReader(_client,options) {
      const reader={options,reads:0,disposed:false,invalidations:0,insertions:0,
        async read(){reader.reads++;return {data:[],error:null};},
        invalidate(){reader.invalidations++;},inserted(){reader.insertions++;},dispose(){reader.disposed=true;}};
      readers.push(reader);return reader;
    },
    fetchLiveClassEvents(_client, options) { return new Promise(resolve => timelineReads.push({ options, resolve })); },
  },
  '@/lib/supabase': {supabase:{
    from(){ const query={select(){return query;},eq(){return query;},order(){return query;},limit(){return query;},
      async maybeSingle(){return {data:{id:'existing'},error:null};},
      async then(resolve){return resolve({data:[],error:null});}};return query;},
    async rpc(){return {data:[],error:null};},
    channel(){const channel={handlers:[],removed:false,on(type,filter,callback){channel.handlers.push({type,filter,callback});return channel;},subscribe(){return channel;}};channels.push(channel);return channel;},
    async removeChannel(channel){channel.removed=true;},
  }},
});

const visibility = async value => h.act(async () => {
  Object.defineProperty(h.document, 'visibilityState', { configurable: true, value });
  h.document.dispatchEvent(new h.document.defaultView.Event('visibilitychange'));
});
const tick = () => h.act(async () => { mock.timers.tick(30000); });
const open = name => h.click([...h.document.querySelectorAll('[title="Open student detail"]')].find(button => button.textContent.includes(name)));
const finish = (index, id) => h.act(async () => {
  timelineReads[index].resolve({ data: [{ id, event_type: 'lesson_started', created_at: new Date().toISOString(), payload: null }], error: null });
});
try {
  await visibility('visible');
  const Panel = h.load('components/teacher/LiveClassPanel.tsx').default;
  const props = { selectedClass: { id: 'a', name: 'Class A', class_code: 'test-a' },
    students: [{ id: 'student-a', display_name: 'Amy' }, { id: 'student-b', display_name: 'Ben' }], progressRows: [], active: true };
  await h.render(Panel, props);
  await open('Amy');
  assert.equal(timelineReads.length, 1);
  assert.deepEqual(timelineReads[0].options, { classId: 'a', studentIds: ['student-a'], newestFirst: true, limit: 15 });
  await finish(0, 'amy-event');
  assert.equal(drawer.events[0].id, 'amy-event');
  await tick();
  await tick();
  assert.equal(timelineReads.length, 2, 'Slow timeline polls do not overlap');
  await open('Ben');
  assert.deepEqual(drawer.events, [], 'Previous student timeline is never shown for the new student');
  assert.equal(timelineReads.length, 3);
  await finish(1, 'late-amy-event');
  assert.deepEqual(drawer.events, [], 'Late old-student response cannot populate the new drawer');
  assert.equal(timelineReads.length, 3, 'Old student pending refresh is disposed');
  await finish(2, 'ben-event');
  assert.equal(drawer.events[0].id, 'ben-event');
  await visibility('hidden');
  await tick();
  await tick();
  assert.equal(timelineReads.length, 3, 'Hidden browser tab does not poll the drawer');
  await visibility('visible');
  assert.equal(timelineReads.length, 4, 'Returning immediately refreshes the drawer');
  assert.deepEqual(timelineReads[3].options.studentIds, ['student-b']);
  await h.render(Panel, { ...props, active: false });
  await finish(3, 'late-hidden-ben');
  await tick();
  assert.equal(timelineReads.length, 4, 'Inactive Live Class does not poll the drawer');
  await h.render(Panel, props);
  assert.equal(timelineReads.length, 5, 'Returning to Live Class refreshes the selected student');
  await h.act(async () => drawer.onClose());
  await finish(4, 'late-closed-ben');
  await tick();
  assert.equal(drawer.open, false);
  assert.equal(timelineReads.length, 5, 'Closing disposes the drawer refresh');
  console.log('PASS timeline query scope, slow-read coalescing, student isolation, late responses, hidden-tab pause, resume and drawer cleanup.');
} finally { await h.close(); mock.timers.reset(); }
