// Verify the production reader using real authenticated local API requests.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fetchLiveClassAttempts } from '../../lib/live-class-attempts.ts';
import { groups, newClient, idsFor, snapshot, settled } from './scoped-attempts-http-local.mjs';
import { localDir } from './local-config.mjs';

const tables = ['student_lesson_attempts','student_weekly_quiz_attempts','student_realm_assessments'];
const cases = [];
for (const [i, group] of groups.entries()) {
  const client = newClient(), ids = idsFor(group);
  assert.equal((await client.auth.signInWithPassword({ email: group.email, password: group.password })).error,null);
  const original = await snapshot(client, ids, false);
  const results = await settled(tables.map(table => fetchLiveClassAttempts(client,table,ids)));
  for (const [j,result] of results.entries()) {
    assert.equal(result.error,null);
    assert.deepEqual(result.data,original.rows[j]);
  }
  const foreignId = groups[(i+1)%groups.length].students[0].studentId;
  const foreign = await fetchLiveClassAttempts(client,'student_lesson_attempts',[foreignId]);
  assert.equal(foreign.error,null); assert.deepEqual(foreign.data,[], 'Existing RLS must hide the foreign class');
  cases.push({ teacher: i+1, rowCounts: results.map(r => r.data.length), complete: true, foreignClassHidden: true });
}
assert(cases.some(c => c.rowCounts.some(count => count>1000)), 'Fixtures must exercise the API row-limit regression');
const report = { at: new Date().toISOString(), environment: 'isolated local authenticated HTTP; no schema or fixture writes', cases,
  passed: true, limitations: 'Static synthetic data. Not browser rendering, concurrent writes or a throughput benchmark.' };
fs.writeFileSync(`${localDir}/live-class-attempts-result.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({ passed: true, teachers: cases.length, firstClassRows: cases[0].rowCounts, foreignClassChecks: cases.length }));
