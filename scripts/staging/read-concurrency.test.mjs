import assert from 'node:assert/strict';
import test from 'node:test';
import { runReads } from './read-concurrency.mjs';

test('bounded reads preserve every result in input order', async () => {
  const started = [];
  const releases = [];
  let active = 0;
  let maximum = 0;
  const result = runReads(Array.from({ length: 6 }, (_, index) => async () => {
    started.push(index);
    maximum = Math.max(maximum, ++active);
    await new Promise(resolve => { releases[index] = resolve; });
    active--;
    return index;
  }), 3);
  assert.deepEqual(started, [0, 1, 2]);
  releases[2]();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(started, [0, 1, 2, 3]);
  releases[0]();
  releases[1]();
  await new Promise(resolve => setImmediate(resolve));
  releases[5]();
  releases[4]();
  releases[3]();
  assert.deepEqual(await result, [0, 1, 2, 3, 4, 5]);
  assert.equal(maximum, 3);
});

test('a failed read rejects the refresh and stops queued reads', async () => {
  let queuedStarted = false;
  await assert.rejects(runReads([
    () => Promise.reject(new Error('read failed')),
    () => { queuedStarted = true; },
  ], 1), /read failed/);
  assert.equal(queuedStarted, false);
});

test('empty reads succeed and invalid concurrency is rejected', async () => {
  assert.deepEqual(await runReads([], 3), []);
  for (const limit of [0, -1, 1.5, NaN]) await assert.rejects(runReads([], limit));
});

test('failure drains already-started reads before rejecting the batch', async () => {
  let release;
  let finished = false;
  let queued = false;
  const result = runReads([
    async () => { throw new Error('failed first'); },
    async () => { await new Promise(resolve => { release = resolve; }); },
    async () => { queued = true; },
  ], 2);
  const checked = assert.rejects(result, /failed first/).then(() => { finished = true; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(finished, false);
  assert.equal(queued, false);
  release();
  await checked;
  assert.equal(finished, true);
});
