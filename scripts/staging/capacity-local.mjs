// Protocol rehearsal only: never accepts a remote URL or service-role workload.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { localConfig, localDir } from './local-config.mjs';
const config = localConfig();
const seconds = Number(process.env.SCALE_DURATION_SECONDS ?? 120);
assert.ok(Number.isInteger(seconds) && seconds >= 60 && seconds <= 1800);
const groups = ['', '-2', '-3', '-4'].map(suffix => JSON.parse(fs.readFileSync(`${localDir}/synthetic-accounts${suffix}.json`, 'utf8')));
assert.equal(new Set(groups.flatMap(g => g.students.map(s => s.studentId))).size, 100);
const samples = [];
const failures = [];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function request(path, body, token, session, name) {
  const start = performance.now();
  let status = 0;
  try {
    const response = await fetch(config.API_URL + path, {
      method: 'POST', headers: { apikey: config.ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json',
        ...(session ? { 'x-student-session': session } : {}), ...(name ? {} : { Prefer: 'resolution=merge-duplicates' }) },
      body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
    });
    status = response.status;
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) throw new Error(`HTTP ${status}, code ${data?.code ?? 'unknown'}`);
    return data;
  } finally {
    if (name) samples.push({ name, ms: performance.now() - start, status });
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
console.log('Prepared 100 distinct students, four ordinary teachers and 20,000 synthetic history events.');
const teachers = await Promise.all(groups.map(async group => {
  const auth = await request('/auth/v1/token?grant_type=password', { email: group.email, password: group.password }, config.ANON_KEY, null, 'teacher_login');
  return { group, token: auth.access_token };
}));
// Verify cross-school denial before sending load; never use owner/service tokens below.
for (let i = 0; i < teachers.length; i++) {
  const teacher = teachers[i];
  await assert.rejects(request('/rest/v1/rpc/get_live_class_events_secure', { p_class_id: groups[(i+1)%4].classId }, teacher.token), /HTTP 403, code 42501/);
}
const students = groups.flatMap(group => group.students.map(student => ({ group, student })));
const started = Date.now();
const deadline = started + seconds * 1000;
let verifiedWrites = 0;
async function studentJourney({ group, student }) {
  const login = await rpc('student_login_lookup', { p_class_id: group.classId, p_display_name: student.username, p_pin: student.pin });
  assert.equal(login[0].student_id, student.studentId);
  const session = login[0].session_token;
  const context = await rpc('get_student_runtime_context_secure', { p_student_id: student.studentId }, session);
  assert.equal(context[0].class_id, group.classId);
  const before = sum(await rpc('get_student_activity_daily_secure', { p_student_id: student.studentId }, session));
  let writes = 0;
  do {
    await rpc('touch_live_student_presence_secure', { p_student_id: student.studentId, p_class_id: group.classId }, session);
    await rpc('upsert_student_activity_daily_secure', { p_student_id: student.studentId, p_class_id: group.classId, p_seconds_active: 30 }, session);
    writes++;
    await sleep(Math.min(30000, Math.max(0, deadline - Date.now())));
  } while (Date.now() < deadline);
  const after = sum(await rpc('get_student_activity_daily_secure', { p_student_id: student.studentId }, session));
  assert.equal(after, before + writes * 30, 'Individual activity write integrity');
  verifiedWrites += writes;
}
async function teacherJourney({ group, token }) {
  do {
    const rows = await request('/rest/v1/rpc/get_live_class_events_secure?order=created_at.asc&select=id,student_id,class_id,event_type,created_at,payload', {
      p_class_id: group.classId, p_student_ids: null,
      p_event_types: ['answer_correct','question_loaded'], p_newest_first: false, p_limit: null,
    }, token, null, 'teacher_event_read');
    assert.ok(rows.length > 0);
    const ids = new Set(group.students.map(s => s.studentId));
    assert.ok(rows.every(row => row.class_id === group.classId && ids.has(row.student_id)), 'Teacher event isolation');
    await sleep(Math.min(2000, Math.max(0, deadline - Date.now())));
  } while (Date.now() < deadline);
}
const work = [...students.map(studentJourney), ...teachers.map(teacherJourney)];
const results = await Promise.allSettled(work);
for (const result of results) if (result.status === 'rejected') failures.push(result.reason.message);
const endpoints = [...new Set(samples.map(s => s.name))].map(name => {
  const rows = samples.filter(s => s.name === name);
  const times = rows.map(s => s.ms).sort((a,b) => a-b);
  const percentile = p => Math.round(times[Math.ceil(times.length*p)-1]);
  return { name, requests: rows.length, failedRequests: rows.filter(s => s.status < 200 || s.status >= 300).length, p95Ms: percentile(.95), p99Ms: percentile(.99), maximumMs: Math.round(times.at(-1)) };
});
const failedRequests = endpoints.reduce((n,e) => n + e.failedRequests, 0);
const report = { at: new Date().toISOString(), environment: 'local protocol rehearsal; not production capacity certification',
  students: 100, teachers: 4, historyEvents: 20000, durationSeconds: Math.round((Date.now()-started)/1000),
  requests: samples.length, failedRequests, verifiedActivityWrites: verifiedWrites, failures, endpoints,
  preliminaryGatePassed: failures.length === 0 && failedRequests / samples.length <= .001 && endpoints.every(e => e.p95Ms < 1000 && e.p99Ms < 3000),
  exclusions: ['canonical lesson/assessment completion and retry integrity','full six-read teacher snapshots','realtime delivery','browser/iPad rendering','production-equivalent cloud resources','long soak'] };
fs.writeFileSync(`${localDir}/capacity-100-result.json`, JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if (!report.preliminaryGatePassed) process.exitCode = 1;
