import test from 'node:test';
import assert from 'node:assert/strict';
import { readScopedAttemptPages } from './scoped-attempt-reader.mjs';
const row = id => ({ id, student_id: 'student' });
const response = (rows, through = ['c', null, null]) => ({ data: { supported: true, through, data: [rows, [], []] }, error: null });
test('short pages retain fixed bounds and continue until upper ID', async () => {
  let calls = 0;
  const rows = await readScopedAttemptPages(async args => {
    if (calls++ === 0) { assert.equal(args.through, null); return response([row('a')]); }
    assert.deepEqual(args.through, ['c', null, null]);
    assert.equal(args.after[0], 'a');
    return response([row('c')]);
  }, () => assert.fail('unexpected fallback'), ['student'], 500);
  assert.deepEqual(rows, [[row('a'), row('c')], [], []]);
});
test('unsupported later page discards accumulated rows and uses whole fallback', async () => {
  let calls = 0, fallbacks = 0;
  const original = [[row('b')], [], []];
  const result = await readScopedAttemptPages(async () => calls++ ? { data: { supported: false } } : response([row('a')]),
    async () => { fallbacks++; return original; }, ['student'], 37);
  assert.equal(result, original); assert.equal(fallbacks, 1);
});
test('transport, permission and malformed responses fail without fallback', async () => {
  for (const read of [
    async () => { throw new Error('transport'); },
    async () => ({ error: { message: 'denied' } }),
    async () => ({ data: { supported: false, data: [[row('a')]] } }),
    async () => response([row('z')]),
    async () => response([{ id: 'a', student_id: 'foreign' }]),
  ]) await assert.rejects(readScopedAttemptPages(read, () => assert.fail('must not fallback'), ['student'], 37));
});
test('changed upper bounds and duplicate cursors fail without partial results', async () => {
  for (const next of [response([row('b')], ['z',null,null]), response([row('a')])]) {
    let calls = 0;
    await assert.rejects(readScopedAttemptPages(async () => calls++ ? next : response([row('a')]),
      () => assert.fail('must not fallback'), ['student'], 37));
  }
});
