/* global performance, fetch, AbortSignal, setInterval, clearInterval */
// Protocol rehearsal only: never accepts a remote URL or service-role workload.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { monitorEventLoopDelay, performance as nodePerformance } from 'node:perf_hooks';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { createLiveClassEventReader, fetchLiveClassEvents } from '../../lib/live-class-events.ts';
import { fetchLiveClassAttempts } from '../../lib/live-class-attempts.ts';
import { localConfig, localDir } from './local-config.mjs';
import { attemptPageClient } from './attempt-page-client.mjs';
const config = localConfig();
const traceDatabase = process.env.SCALE_TRACE_DATABASE === '1';
const seconds = Number(process.env.SCALE_DURATION_SECONDS ?? 120);
assert.ok(Number.isInteger(seconds) && seconds >= 60 && seconds <= 1800);
const groupCount = Number(process.env.SCALE_GROUP_COUNT ?? 4);
assert.ok(Number.isInteger(groupCount) && groupCount >= 4 && groupCount <= 20, 'Local rehearsal supports 4–20 groups only');
const studentCount = groupCount * 25;
const scenario = process.env.SCALE_SCENARIO ?? 'mixed';
assert.ok(['mixed', 'students-only', 'teachers-only', 'dashboard-mixed'].includes(scenario), 'Unknown local capacity scenario');
const dashboard = scenario === 'dashboard-mixed';
const attemptPageSize = Number(process.env.SCALE_ATTEMPT_PAGE_SIZE ?? (dashboard ? 1000 : 500));
assert.ok([500, 1000].includes(attemptPageSize), 'Attempt page size must be 500 or 1000');
assert.ok(attemptPageSize === 500 || dashboard, 'Experimental page size requires dashboard-mixed');
const eventMode = process.env.SCALE_EVENT_MODE ?? 'full';
assert.ok(['full', 'compact'].includes(eventMode), 'Event mode must be full or compact');
assert.ok(eventMode !== 'compact' || dashboard, 'Compact events require dashboard-mixed');
let compactPageRequests = 0;
const profileDashboard = process.env.SCALE_PROFILE_DASHBOARD === '1';
assert.ok(!profileDashboard || dashboard, 'Dashboard profiling requires dashboard-mixed');
const dashboardHttp = [];
const eventRun = crypto.randomUUID();
const expectedEvents = new Map();
const dashboardChecks = [];
const runStudents = scenario !== 'teachers-only';
const runTeachers = scenario !== 'students-only';
const restRoute = process.env.SCALE_REST_ROUTE ?? 'gateway';
assert.ok(['gateway', 'direct'].includes(restRoute), 'REST route must be gateway or direct');
assert.ok(restRoute !== 'direct' || scenario === 'students-only', 'Direct REST comparison supports student-only runs');
// Fixed loopback-only diagnostic port. Auth still uses the guarded local gateway.
const restUrl = restRoute === 'direct' ? 'http://127.0.0.1:56523' : `${config.API_URL}/rest/v1`;
const rampSeconds = Number(process.env.SCALE_LOGIN_RAMP_SECONDS ?? 0);
assert.ok(Number.isInteger(rampSeconds) && rampSeconds >= 0 && rampSeconds <= 30, 'Login ramp must be 0–30 seconds');
assert.ok(runStudents || rampSeconds === 0, 'Teacher-only scenario cannot ramp student logins');
const outputSuffix = (scenario === 'mixed' ? '' : `-${scenario}`) + (eventMode === 'compact' ? '-compact' : '') + (attemptPageSize === 1000 ? '-page1000' : '') + (rampSeconds ? `-ramp${rampSeconds}` : '') + (restRoute === 'direct' ? '-direct' : '');
const groups = Array.from({ length: groupCount }, (_, i) => i === 0 ? '' : `-${i + 1}`).map(suffix => JSON.parse(fs.readFileSync(`${localDir}/synthetic-accounts${suffix}.json`, 'utf8')));
for (const group of groups) assert.equal(group.students.length, 25);
for (const key of ['teacherId', 'classId', 'schoolId']) assert.equal(new Set(groups.map(g => g[key])).size, groupCount);
assert.equal(new Set(groups.flatMap(g => g.students.map(s => s.studentId))).size, studentCount);
const samples = [];
let snapshotHttpRequests = 0;
const failures = [];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function request(path, body, token, session, name) {
  const start = performance.now();
  const startedEpochMs = performance.timeOrigin + start;
  let status = 0;
  let headersMs = null, upstreamMs = null, proxyMs = null;
  const serverTimings = {};
  try {
    const url = path.startsWith('/rest/v1/') ? restUrl + path.slice('/rest/v1'.length) : config.API_URL + path;
    const response = await fetch(url, {
      method: 'POST', headers: { apikey: config.ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json',
        ...(session ? { 'x-student-session': session } : {}), ...(name ? {} : { Prefer: 'resolution=merge-duplicates' }) },
      body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
    });
    headersMs = performance.now() - start;
    const headerNumber = key => response.headers.has(key) ? Number(response.headers.get(key)) : null;
    upstreamMs = headerNumber('x-kong-upstream-latency');
    proxyMs = headerNumber('x-kong-proxy-latency');
    if (traceDatabase && name && path.startsWith('/rest/v1/')) {
      const transactionStartedEpochMs = headerNumber('x-reliq-db-start-ms');
      const databaseReadyEpochMs = headerNumber('x-reliq-db-ready-ms');
      assert.ok(Number.isFinite(transactionStartedEpochMs) && Number.isFinite(databaseReadyEpochMs), 'Local trace hook headers missing');
      Object.assign(serverTimings, { startedEpochMs, transactionStartedEpochMs, databaseReadyEpochMs });
    }
    for (const match of (response.headers.get('server-timing') ?? '').matchAll(/([a-z_]+);dur=([\d.]+)/gi)) {
      serverTimings[`server_${match[1]}Ms`] = Number(match[2]);
    }
    status = response.status;
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) throw new Error(`HTTP ${status}, code ${data?.code ?? 'unknown'}`);
    return data;
  } finally {
    if (name) samples.push({ name, ms: performance.now() - start, status, headersMs, upstreamMs, proxyMs, ...serverTimings });
  }
}
const rpc = (name, args, session) => request(`/rest/v1/rpc/${name}`, args, config.ANON_KEY, session, name);
const sum = rows => rows.reduce((n, row) => n + row.seconds_active, 0);
// Deterministic IDs make history provisioning repeatable without duplicating rows.
for (const group of groups) {
  for (let offset = 0; offset < 5000; offset += 500) {
    const rows = Array.from({ length: 500 }, (_, j) => {
      const n = offset + j;
      const hex = crypto.createHash('sha256').update(`capacity-v1:${group.classId}:${n}`).digest('hex');
      return { id: `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`,
        class_id: group.classId, student_id: group.students[n % 25].studentId,
        event_type: n % 2 ? 'answer_correct' : 'question_loaded',
        created_at: new Date(Date.UTC(2026,0,1) + n * 1000).toISOString(), payload: { synthetic: true, capacity_fixture: 'v1' } };
    });
    await request('/rest/v1/live_activity_events', rows, config.SERVICE_ROLE_KEY);
  }
}
console.log(`Prepared ${studentCount} distinct students, ${groupCount} ordinary teachers and ${groupCount * 5000} synthetic history events.`);
const teachers = await Promise.all(groups.map(async (group, teacherIndex) => {
  const profile = { phase: 'initial' };
  const auth = await request('/auth/v1/token?grant_type=password', { email: group.email, password: group.password }, config.ANON_KEY, null, runTeachers ? 'teacher_login' : undefined);
  return { group, profile, token: auth.access_token, client: createClient(config.API_URL, config.ANON_KEY, { auth: { persistSession:false, autoRefreshToken:false }, global: { headers: { Authorization: `Bearer ${auth.access_token}` }, fetch: async (...args) => {
    snapshotHttpRequests++;
    const requestUrl = new URL(typeof args[0] === 'string' || args[0] instanceof URL ? args[0] : args[0].url);
    const compactRequest = requestUrl.pathname.endsWith('/get_live_class_compact_event_page_secure');
    async function checkedFetch() {
      const response = await fetch(...args);
      if (compactRequest) {
        compactPageRequests++;
        assert.ok(response.ok, `Compact RPC HTTP ${response.status}; fallback would invalidate this rehearsal`);
      }
      return response;
    }
    if (!profileDashboard) return checkedFetch();
    const start = performance.now();
    // Export fixed route labels only: never URLs, filters, headers or bodies.
    const route = requestUrl.pathname.split('/').at(-1);
    const labels = ['live_student_activity','live_activity_events','get_live_class_event_page_secure','get_live_class_compact_event_page_secure','student_lesson_attempts','student_weekly_quiz_attempts','student_realm_assessments','get_live_class_activity_today'];
    const row = { teacherIndex, phase: profile.phase, route: labels.includes(route) ? route : 'other', startedEpochMs: performance.timeOrigin + start, status: 0 };
    try {
      const response = await checkedFetch();
      row.status = response.status;
      for (const [key, header] of [['upstreamMs','x-kong-upstream-latency'],['proxyMs','x-kong-proxy-latency']]) {
        const value = response.headers.get(header);
        row[key] = value !== null && Number.isFinite(Number(value)) ? Number(value) : null;
      }
      return response;
    } finally { row.headersMs = performance.now()-start; dashboardHttp.push(row); }
  } } }) };
}));
// Verify cross-school denial before sending load; never use owner/service tokens below.
for (let i = 0; i < teachers.length; i++) {
  const teacher = teachers[i];
  await assert.rejects(request('/rest/v1/rpc/get_live_class_events_secure', { p_class_id: groups[(i+1)%groupCount].classId }, teacher.token), /HTTP 403, code 42501/);
}
const students = groups.flatMap(group => group.students.map(student => ({ group, student })));
const eventLoop = monitorEventLoopDelay({ resolution: 10 });
const initialUtilization = nodePerformance.eventLoopUtilization();
eventLoop.enable();
const started = Date.now();
const deadline = started + seconds * 1000;
let verifiedWrites = 0;
let completedStudentJourneys = 0;
let initializedStudents = 0;
function saveProgress(finished = false) {
  fs.writeFileSync(`${localDir}/capacity-progress.json`, JSON.stringify({
    at: new Date().toISOString(), environment: 'isolated local test', scenario, eventMode, attemptPageSize, finished,
    plannedSeconds: seconds, elapsedSeconds: Math.round((Date.now()-started)/1000),
    completedStudentJourneys, initializedStudents, verifiedWrites, recordedOperations: samples.length,
    snapshotHttpRequests, observedFailedOperations: samples.filter(s=>s.status<200||s.status>=300).length,
  }, null, 2));
}
const progressTimer = setInterval(() => saveProgress(), 30000);
progressTimer.unref();
saveProgress();
async function studentJourney({ group, student }, index) {
  if (rampSeconds) await sleep(index * rampSeconds * 1000 / (students.length - 1));
  const login = await rpc('student_login_lookup', { p_class_id: group.classId, p_display_name: student.username, p_pin: student.pin });
  assert.equal(login[0].student_id, student.studentId);
  const session = login[0].session_token;
  const context = await rpc('get_student_runtime_context_secure', { p_student_id: student.studentId }, session);
  assert.equal(context[0].class_id, group.classId);
  await rpc('upsert_live_student_activity_secure', {p_student_id:student.studentId,p_class_id:group.classId,p_data:{current_level:'Year 4',current_strand:'number',current_lesson:'Synthetic capacity session',last_active_at:'2000-01-01T00:00:00Z'}}, session);
  initializedStudents++;
  const before = sum(await rpc('get_student_activity_daily_secure', { p_student_id: student.studentId }, session));
  let writes = 0;
  do {
    assert.equal(await rpc('touch_live_student_presence_secure', { p_student_id: student.studentId, p_class_id: group.classId }, session), true, 'Heartbeat must update a live activity row');
    await rpc('upsert_student_activity_daily_secure', { p_student_id: student.studentId, p_class_id: group.classId, p_seconds_active: 30 }, session);
    writes++;
    if (dashboard) {
      await rpc('insert_live_activity_event_secure', { p_student_id: student.studentId, p_class_id: group.classId,
        p_session_id: null, p_event_type: 'answer_correct', p_payload: { capacity_run: eventRun, sequence: writes,
          ...(eventMode === 'compact' ? { lessonId: `capacity-${eventRun}`, week: 1 } : {}) } }, session);
      expectedEvents.set(student.studentId, writes);
    }
    await sleep(Math.min(30000, Math.max(0, deadline - Date.now())));
  } while (Date.now() < deadline);
  const after = sum(await rpc('get_student_activity_daily_secure', { p_student_id: student.studentId }, session));
  assert.equal(after, before + writes * 30, 'Individual activity write integrity');
  const live = await rpc('get_live_student_activity_secure',{p_student_id:student.studentId,p_class_id:group.classId},session);
  assert.equal(live.student_id,student.studentId);
  assert.ok(Date.now()-Date.parse(live.last_active_at)<90000,'Persisted heartbeat must be recent');
  verifiedWrites += writes;
  completedStudentJourneys++;
}
async function dashboardJourney({ group, client, profile }) {
  const attemptsClient = attemptPageClient(client, attemptPageSize);
  const ids = group.students.map(s => s.studentId);
  const allowed = new Set(ids);
  const reader = createLiveClassEventReader(client, { classId: group.classId, studentIds: ids, compact: eventMode === 'compact',
    eventTypes: ['activity_started','lesson_started','quiz_started','question_loaded','answer_correct','answer_incorrect','hint_used','lesson_completed','quiz_completed','idle_detected'] });
  let refreshes = 0;
  let latestRows = [];
  async function measured(name, query) {
    const start = performance.now();
    let status = 0;
    try {
      const result = await query;
      status = result.error ? (result.status >= 400 ? result.status : 0) : (result.status ?? 200);
      assert.equal(result.error, null, name);
      assert.ok(Array.isArray(result.data), name);
      assert.ok(result.data.every(row => allowed.has(row.student_id)), `${name}: student isolation`);
      assert.ok(result.data.every(row => !row.class_id || row.class_id === group.classId), `${name}: class isolation`);
      return result.data;
    } finally { samples.push({ name, ms: performance.now()-start, status }); }
  }
  async function refresh() {
    profile.phase = refreshes ? 'incremental' : 'initial';
    const start = performance.now();
    let status = 0;
    try {
      latestRows = await Promise.all([
        measured('dashboard_live_activity', client.from('live_student_activity').select('*').eq('class_id', group.classId).order('last_active_at',{ascending:false})),
        measured(refreshes ? 'dashboard_events_incremental' : 'dashboard_events_initial', reader.read()),
        measured('dashboard_lesson_attempts', fetchLiveClassAttempts(attemptsClient, 'student_lesson_attempts', ids)),
        measured('dashboard_quiz_attempts', fetchLiveClassAttempts(attemptsClient, 'student_weekly_quiz_attempts', ids)),
        measured('dashboard_assessments', fetchLiveClassAttempts(attemptsClient, 'student_realm_assessments', ids)),
        measured('dashboard_daily_activity', client.rpc('get_live_class_activity_today',{p_class_id:group.classId})),
      ]);
      if (eventMode === 'full') assert.ok(latestRows[1].length >= 5000, 'Complete historical event snapshot');
      assert.equal(new Set(latestRows[1].map(row => row.id)).size, latestRows[1].length, 'No duplicate events');
      refreshes++;
      status = 200;
    } finally { samples.push({name:'dashboard_refresh',ms:performance.now()-start,status}); }
  }
  try {
    do {
      await refresh();
      await sleep(Math.min(30000, Math.max(0, deadline-Date.now())));
    } while (Date.now()<deadline);
    await studentResults;
    await refresh();
    const observed = latestRows[1].filter(row => row.payload?.capacity_run === eventRun);
    for (const id of ids) {
      const count = expectedEvents.get(id);
      assert.ok(count > 0, 'Student emitted events');
      const sequences = observed.filter(row => row.student_id===id).map(row=>row.payload.sequence).sort((a,b)=>a-b);
      assert.deepEqual(sequences, Array.from({length:count},(_,i)=>i+1), 'All student events reach incremental reader exactly once');
    }
    assert.equal(new Set(latestRows[0].map(row=>row.student_id)).size, ids.length, 'Final live activity includes every student');
    assert.equal(new Set(latestRows[5].map(row=>row.student_id)).size, ids.length, 'Final daily activity includes every student');
    // Independently verify complete attempt history, including classes beyond the API cap.
    // Student activity traffic in this scenario does not create new attempt rows.
    const historyTables = ['student_lesson_attempts','student_weekly_quiz_attempts','student_realm_assessments'];
    const historyCounts = [];
    for (const [index, table] of historyTables.entries()) {
      let query = client.from(table).select('id', { count: 'exact', head: true }).in('student_id', ids);
      if (table === 'student_lesson_attempts') query = query.eq('completed', true);
      const countResult = await query;
      assert.equal(countResult.error, null);
      assert.equal(latestRows[index+2].length, countResult.count, `${table}: complete persisted history`);
      assert.equal(new Set(latestRows[index+2].map(row=>row.id)).size, countResult.count, `${table}: no duplicate attempts`);
      historyCounts.push(countResult.count);
    }
    dashboardChecks.push({historyCounts, refreshes, observedNewEvents:observed.length, finalRowCounts:latestRows.map(rows=>rows.length)});
  } finally { reader.dispose(); }
}
async function teacherJourney({ group, client }) {
  do {
    const start = performance.now();
    const result = await fetchLiveClassEvents(client, {classId:group.classId,eventTypes:['answer_correct','question_loaded']});
    samples.push({name:'teacher_event_snapshot',ms:performance.now()-start,status:result.error ? (result.status>=400 ? result.status : 0) : result.status});
    assert.equal(result.error,null);
    const rows=result.data;
    assert.ok(rows.length >= 5000, 'Snapshot must include all seeded history, not the first API page');
    assert.ok(rows.length > 0);
    const ids = new Set(group.students.map(s => s.studentId));
    assert.ok(rows.every(row => row.class_id === group.classId && ids.has(row.student_id)), 'Teacher event isolation');
    await sleep(Math.min(2000, Math.max(0, deadline - Date.now())));
  } while (Date.now() < deadline);
}
const studentResults = Promise.allSettled(runStudents ? students.map(studentJourney) : []);
const teacherResults = Promise.allSettled(runTeachers ? teachers.map(dashboard ? dashboardJourney : teacherJourney) : []);
const results = (await Promise.all([studentResults, teacherResults])).flat();
clearInterval(progressTimer);
eventLoop.disable();
const clientProfile = {
  eventLoopDelayP99Ms: Math.round(eventLoop.percentile(99) / 1e6),
  eventLoopDelayMaxMs: Math.round(eventLoop.max / 1e6),
  eventLoopUtilization: nodePerformance.eventLoopUtilization(initialUtilization).utilization,
};
saveProgress(true);
for (const result of results) if (result.status === 'rejected') failures.push(result.reason.message);
const endpoints = [...new Set(samples.map(s => s.name))].map(name => {
  const rows = samples.filter(s => s.name === name);
  const times = rows.map(s => s.ms).sort((a,b) => a-b);
  const percentile = p => Math.round(times[Math.ceil(times.length*p)-1]);
  const timings = {};
  for (const metric of ['headersMs', 'upstreamMs', 'proxyMs', ...new Set(rows.flatMap(row => Object.keys(row).filter(key => key.startsWith('server_'))))]) {
    const values = rows.map(row => row[metric]).filter(value => value !== null && Number.isFinite(value)).sort((a,b) => a-b);
    timings[metric] = values.length ? { samples: values.length, p95: Math.round(values[Math.ceil(values.length*.95)-1]), p99: Math.round(values[Math.ceil(values.length*.99)-1]), max: Math.round(values.at(-1)) } : null;
  }
  return { name, timings, requests: rows.length, failedRequests: rows.filter(s => s.status < 200 || s.status >= 300).length, p95Ms: percentile(.95), p99Ms: percentile(.99), maximumMs: Math.round(times.at(-1)) };
});
const failedRequests = endpoints.reduce((n,e) => n + e.failedRequests, 0);
if (eventMode === 'compact' && compactPageRequests === 0) failures.push('Compact event RPC was never exercised');
const report = { at: new Date().toISOString(), environment: 'local protocol rehearsal; not production capacity certification',
  eventMode, compactPageRequests, attemptPageSize,
  workloadStartedAt: new Date(started).toISOString(),
  databaseTracing: traceDatabase, dashboardHttpProfiling: profileDashboard,
  ...(dashboard ? { dashboardChecks, dashboardMode: `six-source periodic refresh with production ${eventMode} incremental event reader; no realtime subscription`, expectedNewEvents: [...expectedEvents.values()].reduce((a,b)=>a+b,0) } : {}),
  clientProfile, scenario, restRoute, loginRampSeconds: rampSeconds, students: runStudents ? studentCount : 0, teachers: runTeachers ? groupCount : 0, provisionedStudents: studentCount, historyEvents: groupCount * 5000, durationSeconds: Math.round((Date.now()-started)/1000),
  requests: samples.length, requestUnits: dashboard ? 'student/auth HTTP requests plus overlapping logical dashboard source and refresh timings; not an HTTP total' : 'student/teacher-login HTTP requests plus logical teacher snapshots', snapshotHttpRequests, failedRequests, verifiedPresenceStudents:completedStudentJourneys, verifiedActivityWrites: verifiedWrites, failures, endpoints,
  workloadVersion: 'production-attempt-pagination-v4-page-sizes',
  scheduling: 'Closed-loop journeys: each operation completes before its sleep; not a fixed arrival-rate or 10,000-user test',
  preliminaryGatePassed: failures.length === 0 && failedRequests / samples.length <= .001 && endpoints.every(e => e.p95Ms < 1000 && e.p99Ms < 3000),
  exclusions: ['canonical lesson/assessment completion and retry integrity',...(dashboard ? [] : ['full six-read teacher snapshots']),'realtime delivery','browser/iPad rendering','production-equivalent cloud resources','long soak'] };
fs.writeFileSync(`${localDir}/capacity-${studentCount}${outputSuffix}-result.json`, JSON.stringify(report,null,2));
if (traceDatabase) fs.writeFileSync(`${localDir}/request-trace.json`, JSON.stringify({
  environment: 'isolated local diagnostic response timestamps; no identifiers or credentials',
  caveat: 'Host/database clocks require calibration; transaction start is after pool acquisition, not its exact boundary',
  samples,
},null,2));
console.log(JSON.stringify(report,null,2));
if (!report.preliminaryGatePassed) process.exitCode = 1;

if (profileDashboard) fs.writeFileSync(`${localDir}/dashboard-http-profile.json`, JSON.stringify({
  caveat: 'Fetch-to-response-headers timing only; excludes body parsing. Upstream includes API waiting, not pure SQL. Teacher indexes are synthetic ordinals.',
  samples: dashboardHttp,
}, null, 2));
