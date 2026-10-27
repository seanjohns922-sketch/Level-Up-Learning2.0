import assert from 'node:assert/strict';
import { domHarness } from './test-support/react-dom-harness.mjs';

// Run the actual canonical bootstrap and restore/cache merge functions with
// deferred network reads. No production records or credentials are used.
async function scenario(mode) {
  let activeStudent = 'fixture-a';
  let store = { 'other|Year 1|1': { lessonsCompleted: [true, false, false], quizCompleted: false } };
  const progress = new Map();
  const reads = new Map();
  const events = [];
  const h = domHarness({
    '@/lib/xp-award-store': {},
    '@/data/progress': {
      isProgressRealmScope: id => ['number', 'measurement', 'space', 'statistics', 'pattern', 'chance'].includes(id),
      writeProgress: (value, realm) => progress.set(realm, value),
    },
    '@/lib/program-progress': {
      makeProgramProgressKey: (year, week, realm) => `${realm}|${year}|${week}`,
      readProgramStore: () => structuredClone(store),
      writeProgramStore: value => { store = structuredClone(value); },
    },
    '@/lib/studentIdentity': {
      getActiveStudentIdentity: () => ({ studentId: activeStudent }),
      markActiveStudentIntroSeen: () => {},
    },
    '@/lib/realm-progress-compat': {
      fetchRealmCompatProgressForStudent: (realm, student) => {
        assert.equal(student, 'fixture-a');
        return new Promise((resolve, reject) => reads.set(realm, { resolve, reject }));
      },
    },
    '@/lib/demo-mode': { isDemoPreviewMode: () => false },
    '@/lib/supabase': { supabase: { rpc: async () => ({ data: [{ has_seen_intro: true }], error: null }) } },
    '@/lib/gem-reveal': {},
  });
  try {
    window.dispatchEvent = event => { events.push(event.type); return true; };
    const { LIVE_REALM_IDS } = h.load('lib/realms/realm-registry.ts');
    const { restoreCanonicalWorldState } = h.load('lib/world3d/canonical-bootstrap.ts');
    const pending = restoreCanonicalWorldState('fixture-a');
    const rejected = mode === 'success' ? null : assert.rejects(pending, mode === 'switch' ? /superseded/ : /network fixture/);
    assert.deepEqual([...reads.keys()], LIVE_REALM_IDS, 'all realm requests start before any one resolves');
    assert.equal(events.length, 0, 'no ready event while reads are pending');
    if (mode === 'switch') activeStudent = 'fixture-b';
    const reversed = [...LIVE_REALM_IDS].reverse();
    for (const [i, realm] of reversed.entries()) {
      if (mode === 'failure' && i === 0) reads.get(realm).reject(new Error('network fixture'));
      else reads.get(realm).resolve([{ realm_id: realm, year: 'Year 1', placement_complete: true, is_current: true, week: 1, completed_lesson_ids: [`y1-${realm}-w1-l1`] }]);
      await new Promise(resolve => setImmediate(resolve));
      if (i < reversed.length - 1) assert.equal(events.length, 0);
    }
    if (mode === 'success') {
      const result = await pending;
      assert.deepEqual([...result.keys()], LIVE_REALM_IDS, 'return ordering is deterministic');
      assert.equal(progress.size, LIVE_REALM_IDS.length);
      for (const realm of LIVE_REALM_IDS) assert.equal(store[`${realm}|Year 1|1`].lessonsCompleted[0], true, `${realm} survives other realm writes`);
      assert.ok(store['other|Year 1|1'], 'unrelated cache data survives');
      assert.deepEqual(events, ['level-up:world3d-canonical-restored']);
    } else {
      await rejected;
      assert.equal(events.length, 0, 'failed restore must never announce readiness');
      if (mode === 'switch') {
        assert.equal(progress.size, 0, 'old-session responses cannot write progress');
        assert.deepEqual(Object.keys(store), ['other|Year 1|1']);
      }
    }
    console.log(`PASS world startup: ${mode}`);
  } finally { await h.close(); }
}
for (const mode of ['success', 'failure', 'switch']) await scenario(mode);
