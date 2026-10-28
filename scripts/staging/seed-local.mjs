import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { localConfig, localDir } from './local-config.mjs';

const config = localConfig();
const group = process.env.SCALE_FIXTURE_GROUP ?? '';
assert.ok(group === '' || /^[2-4]$/.test(group), 'Only isolated fixture groups 2–4 are supported');
const suffix = group ? `-${group}` : '';
const fixturePath = path.join(localDir, `synthetic-accounts${suffix}.json`);
const fixture = fs.existsSync(fixturePath) ? JSON.parse(fs.readFileSync(fixturePath, 'utf8')) : {
  email: `scale.teacher${suffix}@example.invalid`, password: crypto.randomBytes(24).toString('base64url'), students: [],
};
function save() { fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2), { mode: 0o600 }); }
save();
async function request(route, body, token = config.SERVICE_ROLE_KEY, method = 'POST', extra = {}) {
  const response = await fetch(`${config.API_URL}${route}`, {
    method, headers: { apikey: config.ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...extra },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(30000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`${route}: ${response.status} ${data?.message ?? data?.msg ?? data?.error_description ?? 'request failed'}`);
  return data;
}
const upsert = (table, row) => request(`/rest/v1/${table}`, row, config.SERVICE_ROLE_KEY, 'POST', { Prefer: 'resolution=merge-duplicates,return=representation' });
if (!fixture.teacherId) {
  const user = await request('/auth/v1/admin/users', { email: fixture.email, password: fixture.password, email_confirm: true, user_metadata: { role: 'teacher', display_name: 'Synthetic Scale Teacher' } });
  fixture.teacherId = user.id; save();
}
await upsert('user_profiles', { user_id: fixture.teacherId, email: fixture.email, display_name: 'Synthetic Scale Teacher', status: 'active' });
await upsert('teachers', { id: fixture.teacherId, user_id: fixture.teacherId, email: fixture.email, name: 'Synthetic Scale Teacher', display_name: 'Synthetic Scale Teacher' });
await upsert('platform_roles', { user_id: fixture.teacherId, role: 'platform_owner', status: 'active' });
const auth = await request('/auth/v1/token?grant_type=password', { email: fixture.email, password: fixture.password }, config.ANON_KEY);
const rpc = (name, args) => request(`/rest/v1/rpc/${name}`, args, auth.access_token);
const year = new Date().getFullYear();
fixture.schoolId = await rpc('platform_owner_create_school', { p_name: 'Synthetic Scale School', p_school_code: `SCALETEST${group}`, p_calendar_year: year, p_seat_limit: 100, p_status: 'active', p_idempotency_key: `scale-school${suffix}-v1` });
save();
await upsert('school_memberships', { school_id: fixture.schoolId, user_id: fixture.teacherId, role: 'school_admin', status: 'active' });
const years = await request(`/rest/v1/academic_years?school_id=eq.${fixture.schoolId}&select=id`, undefined, config.SERVICE_ROLE_KEY, 'GET');
fixture.classId = await rpc('create_class', { p_school_id: fixture.schoolId, p_academic_year_id: years[0].id, p_name: 'Synthetic Class', p_class_code: `SCALE0${group || '1'}`, p_year_levels: ['Year 4'], p_idempotency_key: `scale-class${suffix}-v1` });
fixture.classCode = `SCALE0${group || '1'}`; save();
for (let i = 1; i <= 25; i++) {
  const student = await rpc('create_school_student', { p_school_id: fixture.schoolId, p_class_id: fixture.classId, p_first_name: 'Synthetic', p_last_name: `Student${i}`, p_school_year_level: 'Year 4', p_username: `scale${group}${i}`, p_pin: String(1000 + i), p_idempotency_key: `scale-student${suffix}-${i}-v1` });
  fixture.students[i - 1] = student; save();
}
// Remove provisioning privileges: runtime checks use an ordinary class teacher.
await upsert('school_memberships', { school_id: fixture.schoolId, user_id: fixture.teacherId, role: 'teacher', status: 'active' });
await request(`/rest/v1/platform_roles?user_id=eq.${fixture.teacherId}`, undefined, config.SERVICE_ROLE_KEY, 'DELETE');
// Workload smoke uses anon + the student's actual issued session, never service role.
const student = fixture.students[0];
const login = await request('/rest/v1/rpc/student_login_lookup', { p_class_id: fixture.classId, p_display_name: student.username, p_pin: student.pin }, config.ANON_KEY);
assert.equal(login[0].student_id, student.studentId);
const headers = { 'x-student-session': login[0].session_token };
const context = await request('/rest/v1/rpc/get_student_runtime_context_secure', { p_student_id: student.studentId }, config.ANON_KEY, 'POST', headers);
assert.equal(context[0].class_id, fixture.classId);
await assert.rejects(request('/rest/v1/rpc/get_student_runtime_context_secure', { p_student_id: fixture.students[1].studentId }, config.ANON_KEY, 'POST', headers));
await assert.rejects(request('/rest/v1/rpc/get_student_runtime_context_secure', { p_student_id: student.studentId }, config.ANON_KEY));
await request('/rest/v1/rpc/upsert_live_student_activity_secure', {p_student_id:student.studentId,p_class_id:fixture.classId,p_data:{current_level:'Year 4',current_strand:'number',current_lesson:'Synthetic setup session'}}, config.ANON_KEY, 'POST', headers);
assert.equal(await request('/rest/v1/rpc/touch_live_student_presence_secure', { p_student_id: student.studentId, p_class_id: fixture.classId }, config.ANON_KEY, 'POST', headers), true);
const activityArgs = { p_student_id: student.studentId };
const before = await request('/rest/v1/rpc/get_student_activity_daily_secure', activityArgs, config.ANON_KEY, 'POST', headers);
const previousSeconds = before.reduce((sum, row) => sum + row.seconds_active, 0);
await request('/rest/v1/rpc/upsert_student_activity_daily_secure', { p_student_id: student.studentId, p_class_id: fixture.classId, p_seconds_active: 30 }, config.ANON_KEY, 'POST', headers);
const after = await request('/rest/v1/rpc/get_student_activity_daily_secure', activityArgs, config.ANON_KEY, 'POST', headers);
assert.equal(after.reduce((sum, row) => sum + row.seconds_active, 0), previousSeconds + 30);
const live = await rpc('get_live_class_activity_today', { p_class_id: fixture.classId });
assert.ok(Array.isArray(live));
console.log('PASS: local synthetic school, teacher and 25 students; real login, scoped context, denied cross-student/missing sessions, presence and persisted activity.');
console.log(`Local-only account details saved to ${fixturePath}`);
