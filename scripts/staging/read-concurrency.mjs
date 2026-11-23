// Local experiment only. Keep result ordering even when reads finish out of order.
export async function runReads(reads, concurrency) {
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error('Invalid read concurrency');
  const results = new Array(reads.length);
  let next = 0;
  let failed = false;
  await Promise.all(Array.from({ length: Math.min(concurrency, reads.length) }, async () => {
    while (!failed && next < reads.length) {
      const index = next++;
      try { results[index] = await reads[index](); }
      catch (error) { failed = true; throw error; }
    }
  }));
  return results;
}
