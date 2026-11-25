import assert from 'node:assert/strict';
import { mock } from 'node:test';
import { domHarness } from './test-support/react-dom-harness.mjs';

mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 });
const pending = { live: [], diagnostic: [] };
const counts = { live: 0, diagnostic: 0, tests: 0 };
const read = kind => { counts[kind]++; return new Promise(resolve => pending[kind].push(resolve)); };
const h = domHarness({
  '@/lib/supabase': { supabase: {} },
  '@/lib/live-class-attempts': { fetchLiveClassAttempts: async () => { counts.tests++; return { data: [], error: null }; } },
  '@/lib/whole-maths-diagnostic-client': {
    fetchTeacherDiagnostics: () => read('diagnostic'),
    fetchTeacherLiveMathsProgression: () => read('live'),
    fetchDiagnosticSchoolSession: async () => null,
  },
});
const props = { selectedClass: { id: 'class-a', name: 'Class A' }, students: [
  { id: 'a', display_name: 'Amy' }, { id: 'b', display_name: 'Ben' },
] };
const finish = async () => h.act(async () => {
  for (const kind of ['live', 'diagnostic']) pending[kind].splice(0).forEach(resolve => resolve([]));
});
try {
  const Panel = h.load('components/teacher/WholeMathsDiagnosticPanel.tsx').default;
  await h.render(Panel, props);
  await finish(); // Settle StrictMode's initial mount and cleanup probe.
  mock.timers.tick(30000);
  await h.flushTimers();
  const started = { ...counts };
  for (let i = 0; i < 3; i++) { mock.timers.tick(30000); await h.flushTimers(); }
  assert.deepEqual(counts, started, 'Slow live and diagnostic reads do not overlap across poll ticks');
  await h.render(Panel, { ...props, students: [...props.students].reverse() });
  assert.deepEqual(counts, started, 'Roster sorting does not refetch the same class');
  await finish();
  assert.equal(counts.live, started.live + 1, 'One trailing live refresh retains pending updates');
  assert.equal(counts.diagnostic, started.diagnostic + 1, 'One trailing diagnostic refresh retains pending updates');
  assert.equal(counts.tests, started.tests + 1, 'Assessment history follows the diagnostic refresh');
  mock.timers.tick(30000);
  await h.flushTimers();
  await h.render(Panel, { selectedClass: null, students: [] });
  const disposed = { ...counts };
  await finish();
  mock.timers.tick(30000);
  await h.flushTimers();
  assert.deepEqual(counts, disposed, 'Class cleanup cancels queued reads from the previous class');
  console.log('PASS diagnostic refresh overlap, trailing reconciliation, stable roster and class cleanup.');
} finally { await h.close(); mock.timers.reset(); }
