// Local synthetic HTTP permission experiment; never run against a remote project.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { groups, name, signature, setup, sql, snapshot, newClient } from './scoped-attempts-http-local.mjs';
import { localDir } from './local-config.mjs';
import { readScopedAttemptPages } from './scoped-attempt-reader.mjs';
const uuid = value => { assert.match(value, /^[0-9a-f-]{36}$/i); return `'${value}'::uuid`; };
const group = groups[0], teacher = uuid(group.teacherId), school = uuid(group.schoolId), classId = uuid(group.classId);
const ids = group.students.slice(0, 2).map(s => s.studentId);
const assignmentIds = [crypto.randomUUID(), crypto.randomUUID()];
const report = { at: new Date().toISOString(), environment: 'isolated local synthetic HTTP revocation', checks: [], restored: false };
const original = JSON.parse(sql(`select json_build_object(
 'schoolStatus',(select status from public.school_memberships where user_id=${teacher} and school_id=${school}),
 'classStaff', (select json_agg(json_build_object('id',id,'status',status)) from public.class_staff_memberships where user_id=${teacher} and class_id=${classId}));`));
assert.equal(original.schoolStatus, 'active');
assert.ok(original.classStaff?.length && original.classStaff.every(row => row.status === 'active'));
assert.equal(sql(`select count(*) from public.student_staff_assignments where user_id=${teacher} and student_id in (${ids.map(uuid).join(',')});`), '0', 'Never replace existing individual assignments');
assert.equal(sql(`select to_regprocedure('${signature}') is null;`), 't', 'Never overwrite an endpoint');
const client = newClient();
assert.equal((await client.auth.signInWithPassword({ email: group.email, password: group.password })).error, null);
let created = false, mutated = false;
async function revokeBetweenPages(scope, revoke, expected) {
  let pages = 0, fallbackCalls = 0;
  const result = await readScopedAttemptPages(async ({ after, through }) => {
    const response = await client.rpc(name, { p_ids: scope, p_after: after, p_through: through, p_limit: 1 });
    assert.equal(response.error, null);
    if (++pages === 1) {
      assert.equal(response.data.supported, true);
      assert(response.data.data.some(rows => rows.length), 'Must read real rows before revocation');
      revoke();
    } else assert.deepEqual(response.data, { supported: false }, 'Next page must recheck access');
    return response;
  }, async () => {
    fallbackCalls++;
    return (await snapshot(client, scope, false, 37)).rows;
  }, scope, 1);
  assert.equal(pages, 2); assert.equal(fallbackCalls, 1);
  assert.deepEqual(result, expected, 'Discard pre-revocation rows; preserve only current RLS results');
  return result.map(rows => rows.length);
}
try {
  created = true; sql(setup);
  const direct = await snapshot(client, ids, false, 37);
  assert(direct.rows.every(rows => rows.length > 1));
  mutated = true;
  const emptyCounts = await revokeBetweenPages(ids, () => sql(`update public.school_memberships set status='inactive' where user_id=${teacher} and school_id=${school};`), [[], [], []]);
  report.checks.push({ name: 'school membership revoked after first page', rowCounts: emptyCounts });
  sql(`update public.school_memberships set status='active' where user_id=${teacher} and school_id=${school};`);
  assert.deepEqual((await snapshot(client, ids, true, 37)).rows, direct.rows);
  report.checks.push({ name: 'school membership restoration preserves complete history' });
  sql(`begin;
    update public.class_staff_memberships set status='inactive' where user_id=${teacher} and class_id=${classId};
    insert into public.student_staff_assignments(id,student_id,school_id,user_id,role,status) values
    ${ids.map((id, i) => `(${uuid(assignmentIds[i])},${uuid(id)},${school},${teacher},'support_staff','active')`).join(',')};
    commit;`);
  assert.deepEqual((await snapshot(client, ids, true, 37)).rows, direct.rows);
  const retained = (await snapshot(client, [ids[1]], false, 37)).rows;
  assert(retained.every(rows => rows.length && rows.every(row => row.student_id === ids[1])));
  const partialCounts = await revokeBetweenPages(ids, () => sql(`update public.student_staff_assignments set status='inactive' where id=${uuid(assignmentIds[0])};`), retained);
  report.checks.push({ name: 'one individual assignment revoked after first page', rowCounts: partialCounts });
} finally {
  if (mutated) {
    sql(`begin;
      delete from public.student_staff_assignments where id in (${assignmentIds.map(uuid).join(',')});
      update public.school_memberships set status='active' where user_id=${teacher} and school_id=${school};
      ${original.classStaff.map(row => `update public.class_staff_memberships set status='active' where id=${uuid(row.id)};`).join('\n')}
      commit;`);
  }
  if (created) sql(`drop function if exists ${signature}; notify pgrst,'reload schema';`);
  assert.equal(sql(`select to_regprocedure('${signature}') is null;`), 't');
  assert.equal(sql(`select count(*) from public.student_staff_assignments where id in (${assignmentIds.map(uuid).join(',')});`), '0');
  assert.equal(sql(`select status from public.school_memberships where user_id=${teacher} and school_id=${school};`), original.schoolStatus);
  for (const row of original.classStaff) assert.equal(sql(`select status from public.class_staff_memberships where id=${uuid(row.id)};`), row.status);
  report.restored = true;
  fs.writeFileSync(`${localDir}/scoped-attempt-revocation-result.json`, JSON.stringify(report, null, 2) + '\n');
}
assert.equal(report.checks.length, 3);
console.log(JSON.stringify({ passed: true, ...report }, null, 2));
