// Read-only event profiling against the isolated synthetic local API.
// Run with --experimental-strip-types and scripts/typescript-alias-loader.mjs
// from the fixture checkout. Add --interactions to compare dashboard sources.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { fetchLiveClassEvents } from '../../lib/live-class-events.ts';
import { fetchLiveClassAttempts } from '../../lib/live-class-attempts.ts';
import { localConfig, localDir } from './local-config.mjs';

const config = localConfig();
const interactions = process.argv.includes('--interactions');
assert(process.argv.slice(2).every(arg => arg === '--interactions'));
const tables = ['student_lesson_attempts', 'student_weekly_quiz_attempts', 'student_realm_assessments'];
const otherSources = [...tables, 'live_student_activity', 'get_live_class_activity_today'];
const eventTypes = ['activity_started','lesson_started','quiz_started','question_loaded','answer_correct','answer_incorrect','hint_used','lesson_completed','quiz_completed','idle_detected'];
const groups = Array.from({ length: 4 }, (_, i) => JSON.parse(fs.readFileSync(`${localDir}/synthetic-accounts${i ? `-${i + 1}` : ''}.json`, 'utf8')));
const report = { at: new Date().toISOString(), samples: [], checks: [], limitation: 'Four synthetic teachers, event history only, no student activity workload. Header waits include network and API queuing, not just SQL. Not hosted latency or capacity proof.' };
const baselines = new Map();
const sourceBaselines = new Map();
if (interactions) report.limitation = 'Four synthetic teachers; read-only source combinations, no student writes. Alternating order is observational, not proof of a production bottleneck or 10,000-user capacity.';
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
      assert(isAuth || ['live_activity_events', 'get_live_class_compact_event_page_secure', ...(interactions ? otherSources : [])].includes(route), 'Unexpected route or fallback');
      if (!isAuth && !url.pathname.includes('/rpc/')) assert.equal(init?.method ?? 'GET', 'GET');
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
  const sourceSamples = [];
  const ids = group.students.map(s => s.studentId);
  const sources = !interactions || mode === 'events' ? [] : mode === 'all' ? otherSources : [mode];
  const competing = sources.map(async source => {
    const started = performance.now();
    const response = tables.includes(source) ? await fetchLiveClassAttempts(client, source, ids)
      : source === 'live_student_activity' ? await client.from(source).select('*').eq('class_id', group.classId).order('last_active_at', { ascending: false })
      : await client.rpc(source, { p_class_id: group.classId });
    assert.equal(response.error, null);
    assert(Array.isArray(response.data));
    const digest = createHash('sha256').update(JSON.stringify(response.data.map(row => JSON.stringify(row)).sort())).digest('hex');
    const key = `${teacherIndex}:${source}`;
    if (sourceBaselines.has(key)) assert.equal(digest, sourceBaselines.get(key), 'Competing source rows remain identical');
    else sourceBaselines.set(key, digest);
    sourceSamples.push({ source, rows: response.data.length, totalMs: performance.now() - started });
  });
  // Install rejection handlers immediately and drain all companion reads.
  const companions = Promise.allSettled(competing);
  let result;
  let eventMs;
  try {
    result = await fetchLiveClassEvents(client, { classId: group.classId, studentIds: ids, compact: true, eventTypes });
    eventMs = performance.now() - start;
  } finally {
    const outcomes = await companions;
    for (const outcome of outcomes) if (outcome.status === 'rejected') throw outcome.reason;
  }
  const totalMs = performance.now() - start;
  assert.equal(result.error, null);
  assert(result.data.length > 0);
  assert.equal(new Set(result.data.map(row => row.id)).size, result.data.length);
  const allowed = new Set(group.students.map(s => s.studentId));
  assert(result.data.every(row => row.class_id === group.classId && allowed.has(row.student_id)));
  const digest = createHash('sha256').update(JSON.stringify(result.data)).digest('hex');
  if (baselines.has(teacherIndex)) assert.equal(digest, baselines.get(teacherIndex), 'Complete ordered results must remain identical');
  else baselines.set(teacherIndex, digest);
  const eventRequests = requests.filter(r => r.route === 'live_activity_events' || r.route === 'get_live_class_compact_event_page_secure');
  assert.equal(eventRequests[0].route, 'live_activity_events');
  assert(eventRequests.slice(1).every(r => r.route === 'get_live_class_compact_event_page_secure'));
  assert(requests.every(r => r.status === 200));
  const sample = { teacherIndex, mode, round, rows: result.data.length, totalMs, eventMs, sourceSamples, requests: [...requests] };
  report.samples.push(sample);
  console.log(JSON.stringify({ teacherIndex, mode, round, rows: sample.rows, requests: requests.length, totalMs: Math.round(totalMs), eventMs: Math.round(eventMs) }));
}
// Alternate order to expose warm-up/order sensitivity. Drain reads on failure.
const modes = interactions ? ['events', ...otherSources, 'all'] : ['sequential', 'concurrent'];
for (let round = 0; round < (interactions ? 2 : 3); round++) {
  for (const mode of round % 2 ? [...modes].reverse() : modes) {
    if (mode === 'sequential') for (const teacher of teachers) await read(teacher, mode, round);
    else {
      const outcomes = await Promise.allSettled(teachers.map(t => read(t, mode, round)));
      for (const outcome of outcomes) if (outcome.status === 'rejected') throw outcome.reason;
    }
  }
}
report.checks = [`${report.samples.length} complete snapshots; identical ordered rows per teacher`, 'No duplicate or out-of-class rows', 'Production event head and compact-page routes; no fallback; allowed read sources only', 'No application, schema or learning-data writes'];
fs.writeFileSync(`${localDir}/event-chain-${interactions ? 'interactions' : 'profile'}-result.json`, JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
