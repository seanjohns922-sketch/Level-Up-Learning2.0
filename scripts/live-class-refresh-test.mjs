import assert from 'node:assert/strict';
import { mock } from 'node:test';
import fs from 'node:fs';
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
  assert.equal((source.match(/refreshWhenVisible,\n      \)/g) ?? []).length, 4, 'all realtime subscriptions share the scheduler');
  assert.ok(source.includes('setInterval(refreshWhenVisible, 30000)'));
  assert.ok(source.includes('window.addEventListener("focus", refreshWhenVisible)'));
  assert.ok(source.includes('document.addEventListener("visibilitychange", refreshWhenVisible)'));
  assert.ok(source.includes('refresh.dispose()'));
  assert.ok(source.includes('if (!cancelled) {\n        setRows('), 'old class response cannot publish after cleanup');
  console.log('PASS: burst coalescing, no overlapping reads, trailing freshness, errors, cleanup and visible-tab wiring.');
} finally {
  refresh.dispose();
  mock.timers.reset();
}
