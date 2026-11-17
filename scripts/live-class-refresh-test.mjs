import assert from 'node:assert/strict';
import { mock } from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';
import { createCoalescedRefresh } from '../lib/coalesced-refresh.ts';

mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 });
const settle = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); };
let calls = 0;
let active = 0;
let maximumActive = 0;
let finish;
const errors = [];
const refresh = createCoalescedRefresh(async () => {
  calls++;
  active++;
  maximumActive = Math.max(active, maximumActive);
  await new Promise(resolve => { finish = resolve; });
  active--;
}, error => errors.push(error));
try {
  refresh.request();
  assert.equal(calls, 1, 'initial read starts immediately');
  for (let i = 0; i < 100; i++) refresh.request();
  mock.timers.tick(5000);
  assert.equal(calls, 1, 'slow reads never overlap despite a classroom burst');
  finish(); await settle();
  assert.equal(calls, 2, 'events during the read retain one trailing refresh');
  for (let i = 0; i < 100; i++) refresh.request();
  finish(); await settle();
  mock.timers.tick(1999); await settle();
  assert.equal(calls, 2, 'fast event bursts are rate limited');
  mock.timers.tick(1); await settle();
  assert.equal(calls, 3);
  assert.equal(maximumActive, 1);
  refresh.request();
  refresh.dispose();
  finish(); await settle();
  mock.timers.tick(30000); await settle();
  refresh.request();
  assert.equal(calls, 3, 'class switch/unmount discards pending refreshes');
  assert.deepEqual(errors, []);

  let recoveredCalls = 0;
  const recovered = createCoalescedRefresh(async () => {
    recoveredCalls++;
    if (recoveredCalls === 1) throw new Error('synthetic network failure');
  }, error => errors.push(error));
  recovered.request(); await settle();
  recovered.request();
  mock.timers.tick(2000); await settle();
  assert.equal(recoveredCalls, 2, 'network failure does not wedge future refreshes');
  assert.equal(errors.length, 1);
  recovered.request(); recovered.dispose();
  mock.timers.tick(30000); await settle();
  assert.equal(recoveredCalls, 2, 'cleanup cancels the waiting timer');

  const source = fs.readFileSync('components/teacher/LiveClassPanel.tsx', 'utf8');
  assert.ok(source.includes('if (cancelled || document.visibilityState !== "visible") return;'));
  assert.equal((source.match(/refreshWhenVisible,\n      \)/g) ?? []).length, 3, 'presence and attempt subscriptions share the scheduler');
  assert.ok(source.includes('setInterval(refreshWhenVisible, 30000)'));
  assert.ok(source.includes('window.addEventListener("focus", refreshWhenVisible)'));
  assert.ok(source.includes('document.addEventListener("visibilitychange", refreshWhenVisible)'));
  assert.ok(source.includes('refresh.dispose()'));
  assert.ok(source.includes('if (!cancelled) {\n        if (!error) setRows('), 'old class response cannot publish after cleanup');
  assert.ok(source.includes('eventRefresh.dispose()'));
  assert.ok(source.includes('if (payload.eventType !== "INSERT") eventReader.invalidate()'));
  assert.ok(source.includes('const result = await eventReader.read()'));
  const loadRows = source.slice(source.indexOf('async function loadRows()'), source.indexOf('const refresh = createCoalescedRefresh'));
  assert.ok(!loadRows.includes('eventReader') && !loadRows.includes('fetchLiveClassEvents'), 'current rows never wait for historical events');
  // Execute the actual panel subscription/scheduler wiring with controlled reads.
  const wiring = source.slice(source.indexOf('    const refresh = createCoalescedRefresh'), source.indexOf('  }, [selectedClass?.id, studentIdsKey]'));
  const compiled = ts.transpileModule(wiring, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const handlers = new Map();
  let statusCallback, reads = 0, invalidations = 0, finishRead;
  let visible = 'visible';
  const listeners = new Map();
  const fakeChannel = {
    on(kind, _filter, callback) { if (kind === 'system') handlers.set(kind, callback); return this; },
    subscribe(callback) { statusCallback = callback; return this; },
  };
  const env = {
    createCoalescedRefresh,
    loadRows: async () => {},
    loadEvents: async () => { reads++; await new Promise(resolve => { finishRead = resolve; }); },
    document: { get visibilityState() { return visible; }, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener() {} },
    window: { addEventListener() {}, removeEventListener() {} },
    ensureLiveSession: async () => {},
    setInterval: () => 1, clearInterval() {},
    supabase: { channel: () => fakeChannel, removeChannel: async () => {} },
    selectedClass: { id: 'test-class' },
    eventReader: { invalidate: () => invalidations++, dispose() {} },
    console,
  };
  const cleanup = new Function(...Object.keys(env), 'let cancelled = false, connectedBefore = false, streamReady = false, reconcileOnVisible = false, intervalId, channel;\n' + compiled)(...Object.values(env));
  const ready = () => handlers.get('system')({ extension: 'postgres_changes', status: 'ok' });
  statusCallback('SUBSCRIBED');
  handlers.get('system')({ extension: 'broadcast', status: 'ok' });
  assert.equal(invalidations, 0, 'unrelated readiness messages do not invalidate events');
  ready();
  assert.equal(reads, 1, 'readiness never overlaps the initial read');
  finishRead(); await settle();
  assert.equal(reads, 2, 'ready reconciles immediately after an in-flight startup read');
  assert.equal(invalidations, 1);
  ready(); finishRead(); await settle();
  assert.equal(reads, 2, 'duplicate ready messages do not produce repeated snapshots');
  listeners.get('visibilitychange')(); // queue an ordinary throttled refresh
  statusCallback('CHANNEL_ERROR'); statusCallback('SUBSCRIBED');
  ready();
  assert.equal(reads, 3, 'recovery bypasses an already scheduled 30-second timer');
  finishRead(); await settle();
  statusCallback('CHANNEL_ERROR');
  ready();
  const readyInvalidations = invalidations;
  statusCallback('SUBSCRIBED');
  assert.equal(invalidations, readyInvalidations, 'late channel acknowledgement does not invalidate the readiness snapshot');
  finishRead(); await settle();
  const readsBeforeHidden = reads;
  visible = 'hidden';
  statusCallback('CHANNEL_ERROR'); statusCallback('SUBSCRIBED'); ready();
  assert.equal(reads, readsBeforeHidden, 'hidden tabs defer recovery reads');
  visible = 'visible'; listeners.get('visibilitychange')();
  assert.equal(reads, readsBeforeHidden + 1, 'returning to a visible tab immediately reconciles');
  finishRead(); await settle();
  listeners.get('visibilitychange')();
  mock.timers.tick(29999); await settle();
  assert.equal(reads, readsBeforeHidden + 1, 'ordinary events still respect the polling interval');
  cleanup(); ready();
  mock.timers.tick(30000); await settle();
  assert.equal(reads, readsBeforeHidden + 1, 'cleanup cancels pending reads and ignores late readiness');
  console.log('PASS: burst coalescing, no overlapping reads, trailing freshness, errors, cleanup and visible-tab wiring.');
} finally {
  refresh.dispose();
  mock.timers.reset();
}
