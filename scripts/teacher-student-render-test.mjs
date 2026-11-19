import assert from 'node:assert/strict';
import { domHarness } from './test-support/react-dom-harness.mjs';
const snapshots = {};
const emptyComponent = { __esModule: true, default: () => null };
const h = domHarness({
  '@/lib/teacher/teacher-student-snapshot': snapshots,
  '@/lib/realm-progress-compat': { teacherAdvanceStudentWeek: () => { throw Error('Unexpected write'); } },
  './LessonPreviewDrawer': emptyComponent,
  './AssessmentReplay': emptyComponent,
  './MeasurementExtensionReport': emptyComponent,
  './NumberExtensionReport': emptyComponent,
  '@/components/teacher/StatisticsExtensionReport': emptyComponent,
  '@/components/teacher/SpaceExtensionReport': emptyComponent,
});
try {
  Object.assign(snapshots, h.load('lib/teacher/teacher-student-snapshot.ts'));
  const original = snapshots.buildTeacherStudentSnapshot;
  let calculations = 0;
  snapshots.buildTeacherStudentSnapshot = (...args) => { calculations++; return original(...args); };
  const Panel = h.load('components/teacher/StrandStudentsPanel.tsx').default;
  const props = {
    yearLabel:'Year 3',
    students:[{id:'a',display_name:'Amy Zebra',school_year_level:'Year 3'},{id:'b',display_name:'Zoe Apple',school_year_level:'Year 3'}],
    progress:[], liveRows:[], progressAvailable:true,
  };
  const button = text => [...h.document.querySelectorAll('button')].find(node=>node.textContent.includes(text));
  await h.render(Panel,props);
  const initial = calculations;
  assert(initial>=2);
  const rowNames = () => [...h.document.querySelectorAll('button')].filter(node=>/Amy Zebra|Zoe Apple/.test(node.textContent)).map(node=>node.textContent.includes('Amy Zebra')?'Amy':'Zoe');
  assert.deepEqual(rowNames(),['Zoe','Amy']);
  await h.click(button('Student'));
  assert.deepEqual(rowNames(),['Amy','Zoe']);
  assert.equal(calculations,initial,'Sorting must reuse canonical summaries');
  await h.click(button('Amy Zebra'));
  assert.equal(calculations,initial,'Opening details must reuse canonical summaries');
  await h.render(Panel,{...props,progressLoading:true});
  assert.equal(calculations,initial,'Unrelated loading state must reuse canonical summaries');
  await h.render(Panel,{...props,progressAvailable:false});
  assert(calculations>initial,'Availability changes must invalidate summaries');
  assert(h.document.body.textContent.includes('Unavailable'));
  const before = calculations;
  await h.render(Panel,{...props,liveRows:[{student_id:'a',latest_event_type:'lesson_started'}]});
  assert(calculations>before,'New live data must invalidate summaries');
  const beforeProgress = calculations;
  const updated = {...props,progress:[{student_id:'a',realm_id:'number',year:'Year 3',is_current:true,week:2,status:'in_progress',placement_complete:true,completed_lesson_ids:[],quiz_scores:{},unlocked_legends:[]}]};
  await h.render(Panel,updated);
  assert(calculations>beforeProgress,'New saved progress must invalidate summaries');
  assert(button('Amy Zebra').textContent.includes('W2'),'Updated saved week appears immediately');
  const beforeRealm = calculations;
  await h.click(button('Measurement'));
  assert(calculations>beforeRealm,'Switching realms must recalculate');
  assert(!button('Amy Zebra').textContent.includes('W2'),'Number progress must not leak into another realm');
  console.log('PASS actual Students component: sorting and details reuse snapshots; changed availability and live data recalculate.');
} finally { await h.close(); }
