// Read-only event profiling against the isolated synthetic local API.
// Run with --experimental-strip-types from the fixture checkout.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { fetchLiveClassEvents } from '../../lib/live-class-events.ts';
import { localConfig, localDir } from './local-config.mjs';

const config = localConfig();
const eventTypes = ['activity_started','lesson_started','quiz_started','question_loaded','answer_correct','answer_incorrect','hint_used','lesson_completed','quiz_completed','idle_detected'];
const groups = Array.from({ length: 4 }, (_, i) => JSON.parse(fs.readFileSync(`${localDir}/synthetic-accounts${i ? `-${i + 1}` : ''}.json`, 'utf8')));
const report = { at: new Date().toISOString(), samples: [], checks: [], limitation: 'Four synthetic teachers, event history only, no student activity workload. Header waits include network and API queuing, not just SQL. Not hosted latency or capacity proof.' };
const baselines = new Map();
const teachers = [];
for (const [teacherIndex, group] of groups.entries()) {
  const requests = [];
  const client = createClient(config.API_URL, config.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (input, init) => {
      const url = new URL(input instanceof Request ? input.url : String(input));
      assert.equal(url.origin, new URL(config.API_URL).origin);
      const route = url.pathname.split('/').at(-1);
      const isAuth = url.pathname === '/auth/v1/token';
      assert(isAuth || ['live_activity_events', 'get_live_class_compact_event_page_secure'].includes(route), 'Unexpected route or fallback');
      if (!isAuth && route === 'live_activity_events') assert.equal(init?.method ?? 'GET', 'GET');
      const start = performance.now();
      const response = await fetch(input, { ...init, signal: AbortSignal.timeout(30000) });
      if (!isAuth) requests.push({ route, status: response.status, headersMs: performance.now() - start });
      return response;
    } },
  });
  const login = await client.auth.signInWithPassword({ email: group.email, password: group.password });
  assert.equal(login.error, null);
  teachers.push({ client, group, teacherIndex, requests });
}
async function read(teacher, mode, round) {
  const { client, group, teacherIndex, requests } = teacher;
  requests.length = 0;
  const start = performance.now();
  const result = await fetchLiveClassEvents(client, { classId: group.classId, studentIds: group.students.map(s => s.studentId), compact: true, eventTypes });
  const totalMs = performance.now() - start;
  assert.equal(result.error, null);
  assert(result.data.length > 0);
  assert.equal(new Set(result.data.map(row => row.id)).size, result.data.length);
  const allowed = new Set(group.students.map(s => s.studentId));
  assert(result.data.every(row => row.class_id === group.classId && allowed.has(row.student_id)));
  const digest = createHash('sha256').update(JSON.stringify(result.data)).digest('hex');
  if (baselines.has(teacherIndex)) assert.equal(digest, baselines.get(teacherIndex), 'Complete ordered results must remain identical');
  else baselines.set(teacherIndex, digest);
  assert.equal(requests[0].route, 'live_activity_events');
  assert(requests.slice(1).every(r => r.route === 'get_live_class_compact_event_page_secure' && r.status === 200));
  const sample = { teacherIndex, mode, round, rows: result.data.length, totalMs, requests: [...requests] };
  report.samples.push(sample);
  console.log(JSON.stringify({ teacherIndex, mode, round, rows: sample.rows, requests: requests.length, totalMs: Math.round(totalMs) }));
}
// Alternate order to expose warm-up/order sensitivity. Drain reads on failure.
for (let round = 0; round < 3; round++) {
  for (const mode of round % 2 ? ['concurrent', 'sequential'] : ['sequential', 'concurrent']) {
    if (mode === 'sequential') for (const teacher of teachers) await read(teacher, mode, round);
    else {
      const outcomes = await Promise.allSettled(teachers.map(t => read(t, mode, round)));
      for (const outcome of outcomes) if (outcome.status === 'rejected') throw outcome.reason;
    }
  }
}
report.checks = ['24 complete snapshots; identical ordered rows per teacher', 'No duplicate or out-of-class rows', 'Only production head and compact-page routes; no fallback', 'No application, schema or learning-data writes'];
fs.writeFileSync(`${localDir}/event-chain-profile-result.json`, JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
