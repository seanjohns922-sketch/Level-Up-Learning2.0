import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createActivityJournal, journalActivityWrite } from './activity-journal.mjs';

test('intent is on disk before dispatch; timeout remains unacknowledged and is not retried', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reliq-journal-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'run.jsonl');
  const record = createActivityJournal(file, 'synthetic-run');
  const rows = () => fs.readFileSync(file, 'utf8').trim().split('\n').map(JSON.parse);
  record({ kind: 'baseline', studentOrdinal: 1, secondsActive: 90 });
  let calls = 0;
  await assert.rejects(journalActivityWrite(record, 1, 1, 'activity', async () => {
    calls++;
    assert.equal(rows().at(-1).kind, 'intent');
    throw new Error('timeout after possible commit');
  }), /timeout/);
  assert.equal(calls, 1);
  assert.deepEqual(rows().map(r => r.kind), ['run', 'baseline', 'intent']);
  await journalActivityWrite(record, 2, 1, 'activity', async () => null);
  await journalActivityWrite(record, 2, 1, 'event', async () => true);
  assert.deepEqual(rows().slice(-4).map(r => [r.operation, r.kind]), [
    ['activity', 'intent'], ['activity', 'acknowledged'], ['event', 'intent'], ['event', 'acknowledged'],
  ]);
  assert.throws(() => createActivityJournal(file, 'replacement'), /EEXIST/);
});

test('failed intent persistence prevents dispatch; failed acknowledgement remains unknown', async () => {
  let called = false;
  await assert.rejects(journalActivityWrite(() => { throw new Error('disk full'); }, 1, 1, 'activity', async () => { called = true; }), /disk full/);
  assert.equal(called, false);
  const rows = [];
  await assert.rejects(journalActivityWrite(row => {
    if (row.kind === 'acknowledged') throw new Error('disk full');
    rows.push(row);
  }, 1, 1, 'event', async () => { called = true; }), /disk full/);
  assert.equal(called, true);
  assert.deepEqual(rows.map(r => r.kind), ['intent']);
});
