import fs from 'node:fs';
import assert from 'node:assert/strict';
import { localConfig, localDir } from './local-config.mjs';
const config = localConfig();
const fixture = JSON.parse(fs.readFileSync(`${localDir}/synthetic-accounts.json`, 'utf8'));
assert.equal(fixture.students.length, 25, 'Use the known 25-student synthetic fixture');
const samples = [];
async function rpc(name, args, session) {
  const start = performance.now();
  const response = await fetch(`${config.API_URL}/rest/v1/rpc/${name}`, {
    method: 'POST', headers: { apikey: config.ANON_KEY, Authorization: `Bearer ${config.ANON_KEY}`, 'Content-Type': 'application/json', ...(session ? { 'x-student-session': session } : {}) },
    body: JSON.stringify(args), signal: AbortSignal.timeout(30000),
  });
  const body = await response.text();
  const result = body ? JSON.parse(body) : null;
  samples.push({ name, ms: performance.now() - start, status: response.status });
  assert.ok(response.ok, `${name} failed with HTTP ${response.status}`);
  return result;
}
await Promise.all(fixture.students.map(async student => {
  const login = await rpc('student_login_lookup', { p_class_id: fixture.classId, p_display_name: student.username, p_pin: student.pin });
  assert.equal(login[0].student_id, student.studentId);
  const session = login[0].session_token;
  const context = await rpc('get_student_runtime_context_secure', { p_student_id: student.studentId }, session);
  assert.equal(context[0].class_id, fixture.classId);
  const before = await rpc('get_student_activity_daily_secure', { p_student_id: student.studentId }, session);
  const sum = rows => rows.reduce((total, row) => total + row.seconds_active, 0);
  await rpc('touch_live_student_presence_secure', { p_student_id: student.studentId, p_class_id: fixture.classId }, session);
  await rpc('upsert_student_activity_daily_secure', { p_student_id: student.studentId, p_class_id: fixture.classId, p_seconds_active: 30 }, session);
  const after = await rpc('get_student_activity_daily_secure', { p_student_id: student.studentId }, session);
  assert.equal(sum(after), sum(before) + 30, 'Each synthetic student must retain their own activity write');
}));
const endpoints = [...new Set(samples.map(sample => sample.name))].map(name => {
  const rows = samples.filter(sample => sample.name === name).map(sample => sample.ms).sort((a,b) => a-b);
  return { name, requests: rows.length, p95Ms: Math.round(rows[Math.ceil(rows.length * .95) - 1]), maximumMs: Math.round(rows.at(-1)) };
});
const report = { at: new Date().toISOString(), environment: 'local synthetic smoke, not production capacity', concurrentStudents: 25, requests: samples.length, failures: 0, endpoints };
fs.writeFileSync(`${localDir}/smoke-result.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
