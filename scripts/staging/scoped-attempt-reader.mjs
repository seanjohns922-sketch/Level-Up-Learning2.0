// Experimental local reader. Not imported by the application.
import assert from 'node:assert/strict';
export async function readScopedAttemptPages(read, fallback, ids, limit, isActive = () => true) {
  const rows = [[], [], []], after = [null, null, null];
  let through = null;
  const scope = new Set(ids);
  const checkActive = () => { if (!isActive()) throw new Error('Attempt read cancelled'); };
  for (let page = 0; page < 10000; page++) {
    checkActive();
    const result = await read({ after: [...after], through });
    checkActive();
    if (result.error) throw new Error(result.error.message || 'Attempt page failed');
    const value = result.data;
    if (value?.supported === false) {
      assert.deepEqual(value, { supported: false }, 'Unsupported response must contain no data');
      // Discard ALL candidate rows, even after successful earlier pages.
      const original = await fallback();
      checkActive();
      return original;
    }
    assert.equal(value?.supported, true);
    assert.ok(Array.isArray(value.through) && value.through.length === 3);
    assert.ok(value.through.every(id => id === null || typeof id === 'string'));
    if (through) assert.deepEqual(value.through, through, 'Upper bounds must stay fixed');
    else through = [...value.through];
    assert.ok(Array.isArray(value.data) && value.data.length === 3);
    let finished = true;
    for (let i = 0; i < 3; i++) {
      const batch = value.data[i];
      assert.ok(Array.isArray(batch) && batch.length <= limit);
      for (const row of batch) {
        assert.ok(row && typeof row.id === 'string' && through[i] !== null && row.id <= through[i] &&
          (after[i] === null || row.id > after[i]) && scope.has(row.student_id), 'Invalid or non-advancing page');
        rows[i].push(row); after[i] = row.id;
      }
      // A short nonempty page is not necessarily end-of-history.
      if (batch.length && after[i] !== through[i]) finished = false;
    }
    if (finished) return rows;
  }
  throw new Error('Pagination did not terminate');
}
