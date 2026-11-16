// Synthetic localhost fixture only. Restore the original lock state in finally.
/* global fetch, AbortSignal */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { localConfig, localDir } from './local-config.mjs';
const config = localConfig();
const group = JSON.parse(fs.readFileSync(`${localDir}/synthetic-accounts.json`, 'utf8'));
const [student, other] = group.students;
async function request(route, body, token = config.ANON_KEY, session) {
  const response = await fetch(config.API_URL + route, {
    method: 'POST', headers: { apikey: config.ANON_KEY, Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json', ...(session ? { 'x-student-session': session } : {}) },
    body: JSON.stringify(body), signal: AbortSignal.timeout(15_000),
  });
  return { ok: response.ok, status: response.status, data: await response.json() };
}
const rpc = (name, body, token, session) => request(`/rest/v1/rpc/${name}`, body, token, session);
const auth = await request('/auth/v1/token?grant_type=password', { email: group.email, password: group.password });
assert.ok(auth.ok, 'Synthetic teacher login');
const teacher = auth.data.access_token;
const original = await rpc('teacher_get_realm_locks', { p_class_id: group.classId }, teacher);
assert.ok(original.ok, 'Teacher lock read');
const wasLocked = original.data.some(row => row.studentId === student.studentId && row.realmId === 'number');
const change = locked => rpc('teacher_set_realm_locks', { p_class_id: group.classId,
  p_changes: [{ studentId: student.studentId, realmId: 'number', locked }] }, teacher);
let issuedSession;
try {
  assert.ok((await change(true)).ok, 'Teacher lock write');
  const login = await rpc('student_login_lookup', { p_class_id: group.classId, p_display_name: student.username, p_pin: student.pin });
  assert.ok(login.ok, 'Student login');
  assert.equal(login.data[0].student_id, student.studentId);
  const session = login.data[0].session_token;
  issuedSession = session;
  const read = id => rpc('get_student_realm_locks', { p_student_id: id }, config.ANON_KEY, session);
  const own = await read(student.studentId);
  assert.ok(own.ok && own.data.includes('number'), `Student sees own lock (HTTP ${own.status}, code ${own.data?.code ?? 'none'})`);
  for (const denied of [await read(other.studentId), await rpc('get_student_realm_locks', { p_student_id: student.studentId })]) {
    assert.equal(denied.ok, false);
    assert.equal(denied.data.code, '42501', 'Missing/cross-student sessions denied');
  }
  const write = await rpc('teacher_set_realm_locks', { p_class_id: group.classId, p_changes: [] }, config.ANON_KEY, session);
  assert.equal(write.ok, false, 'Student cannot invoke teacher writer');
  assert.ok([401, 403, 404].includes(write.status), 'Access denied or function hidden from anon');
  assert.ok((await read(student.studentId)).ok, 'Service survives permission denial');
} finally {
  try {
    assert.ok((await change(wasLocked)).ok, 'Restore original synthetic lock state');
  } finally {
    if (issuedSession) {
      // Provisioning credentials are used only to remove this exact local test
      // session, never for measured teacher/student workload requests.
      const hash = createHash('sha256').update(issuedSession).digest('hex');
      const cleanup = await fetch(`${config.API_URL}/rest/v1/student_access_sessions?student_id=eq.${encodeURIComponent(student.studentId)}&token_hash=eq.${hash}`, {
        method: 'DELETE', headers: { apikey: config.ANON_KEY, Authorization: `Bearer ${config.SERVICE_ROLE_KEY}` },
        signal: AbortSignal.timeout(15_000),
      });
      assert.ok(cleanup.ok, 'Remove the exact issued local test session');
    }
  }
}
const restored = await rpc('teacher_get_realm_locks', { p_class_id: group.classId }, teacher);
assert.ok(restored.ok);
assert.deepEqual(restored.data, original.data, 'Teacher lock list unchanged after test');
console.log('PASS HTTP teacher lock, real anon session, own read, missing/cross-student denials, teacher-write refusal and restored lock state.');
