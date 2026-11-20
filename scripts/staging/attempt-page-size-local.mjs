// Read-only local experiment. Production page sizes and permissions stay unchanged.
/* global performance, fetch */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { fetchLiveClassAttempts } from '../../lib/live-class-attempts.ts';
import { localConfig, localDir } from './local-config.mjs';

const config = localConfig();
const tables = ['student_lesson_attempts', 'student_weekly_quiz_attempts', 'student_realm_assessments'];
const results = [];
for (let groupIndex = 0; groupIndex < 4; groupIndex++) {
  const group = JSON.parse(fs.readFileSync(`${localDir}/synthetic-accounts${groupIndex ? `-${groupIndex + 1}` : ''}.json`, 'utf8'));
  let requests = 0;
  const client = createClient(config.API_URL, config.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (...args) => { requests++; return fetch(...args); } },
  });
  assert.equal((await client.auth.signInWithPassword({ email: group.email, password: group.password })).error, null);
  const ids = group.students.map(student => student.studentId);
  // Override only the existing reader's page-size request, keeping its bounded
  // UUID cursor, short-page handling, projection, cancellation and RLS path.
  const candidate = { from(table) { return { select(...args) {
    const query = client.from(table).select(...args);
    const limit = query.limit.bind(query);
    query.limit = size => limit(size === 500 ? 1000 : size);
    return query;
  } }; } };
  for (let round = 0; round < 3; round++) {
    const snapshots = {};
    for (const pageSize of round % 2 ? [1000, 500] : [500, 1000]) {
      const before = requests, start = performance.now();
      const outcomes = await Promise.allSettled(tables.map(table => fetchLiveClassAttempts(pageSize === 500 ? client : candidate, table, ids)));
      const rows = outcomes.map(outcome => {
        assert.equal(outcome.status, 'fulfilled');
        assert.equal(outcome.value.error, null);
        assert(outcome.value.data.every(row => ids.includes(row.student_id)));
        return outcome.value.data;
      });
      snapshots[pageSize] = rows;
      results.push({ groupIndex, round, pageSize, requests: requests - before, ms: Math.round(performance.now() - start), rows: rows.map(items => items.length) });
    }
    assert.deepEqual(snapshots[1000], snapshots[500], 'Every historical row and value must match');
  }
}
const report = {
  at: new Date().toISOString(), results, identical: true,
  limitation: 'Local static read-only comparison with four teachers in sequence. No concurrent writes, load, browser or cloud capacity claim. No application change.',
};
fs.writeFileSync(`${localDir}/attempt-page-size-result.json`, JSON.stringify(report, null, 2));
for (const size of [500, 1000]) {
  const rows = results.filter(row => row.pageSize === size);
  console.log(JSON.stringify({ pageSize: size, requests: rows.reduce((sum, row) => sum + row.requests, 0), meanMs: Math.round(rows.reduce((sum, row) => sum + row.ms, 0) / rows.length), maxMs: Math.max(...rows.map(row => row.ms)) }));
}
console.log('PASS identical complete histories and student scopes for both page sizes.');
