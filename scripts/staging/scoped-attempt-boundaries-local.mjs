// Local HTTP boundary test using existing rows only. No fixture mutations.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { groups, name, signature, setup, sql, snapshot, newClient } from './scoped-attempts-http-local.mjs';
import { localDir } from './local-config.mjs';
const client = newClient(), group = groups[0], ids = [group.students[0].studentId];
assert.equal((await client.auth.signInWithPassword({ email: group.email, password: group.password })).error, null);
assert.equal(sql(`select to_regprocedure('${signature}') is null;`), 't');
const report = { at: new Date().toISOString(), environment: 'isolated local read-only fixture HTTP boundary test', checks: [], restored: false,
  limitation: 'Uses existing rows and explicit bounds. Does not test concurrent database inserts, updates or deletes.' };
let created = false;
try {
  created = true; sql(setup);
  // NOTIFY reload is asynchronous. Retry only schema-cache absence during setup.
  const readyDeadline = Date.now() + 10000;
  for (;;) {
    const ready = await client.rpc(name, { p_ids: [], p_after: [null,null,null], p_through: null, p_limit: 1 });
    if (!ready.error) { assert.equal(ready.data.supported, true); break; }
    assert.equal(ready.error.code, 'PGRST202');
    assert(Date.now() < readyDeadline, 'Temporary endpoint schema cache did not become ready');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const baseline = (await snapshot(client, ids, false, 37)).rows;
  assert(baseline.every(rows => rows.length > 2));
  const through = baseline.map(rows => rows[1].id);
  const after = [null, null, null];
  const found = [[], [], []];
  for (let page = 0; page < 2; page++) {
    const response = await client.rpc(name, { p_ids: ids, p_after: after, p_through: through, p_limit: 1 });
    assert.equal(response.error, null); assert.equal(response.data.supported, true);
    assert.deepEqual(response.data.through, through);
    for (let i = 0; i < 3; i++) {
      assert.deepEqual(response.data.data[i], [baseline[i][page]]);
      found[i].push(...response.data.data[i]); after[i] = response.data.data[i][0].id;
    }
  }
  const end = await client.rpc(name, { p_ids: ids, p_after: after, p_through: through, p_limit: 1 });
  assert.equal(end.error, null); assert.deepEqual(end.data.data, [[], [], []]);
  report.checks.push('all three tables stop at explicit upper bounds despite more existing records');
  const refreshed = (await snapshot(client, ids, true, 37)).rows;
  assert.deepEqual(refreshed, baseline);
  report.checks.push('fresh unbounded-start refresh returns complete original RLS history');
  report.rows = baseline.map(rows => rows.length);
} finally {
  if (created) sql(`drop function if exists ${signature}; notify pgrst,'reload schema';`);
  assert.equal(sql(`select to_regprocedure('${signature}') is null;`), 't');
  report.restored = true;
  fs.writeFileSync(`${localDir}/scoped-attempt-boundaries-result.json`, JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({ passed: true, ...report }, null, 2));
