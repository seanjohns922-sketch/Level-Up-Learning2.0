/** Bounded UUID pagination. Errors never expose a partial history.
 * Short pages may be a server cap, so continue until the upper ID or an empty page.
 * Concurrent edits are reconciled by later reads; this is not a database snapshot.
 */
export type HistoryPage = { head: boolean; after: string | null; through: string | null };
export async function readUuidHistory<T extends { id: string }>(
  readPage: (page: HistoryPage) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  inScope: (row: T) => boolean,
  isActive = () => true,
) {
  const failure = (message: string) => ({ data: null, error: new Error(message) });
  if (!isActive()) return failure("Attempt read cancelled");
  try {
    const head = await readPage({ head: true, after: null, through: null });
    if (!isActive()) return failure("Attempt read cancelled");
    if (head.error) return { data: null, error: head.error };
    if (!Array.isArray(head.data)) return failure("Invalid attempt head");
    if (!head.data.length) return { data: [], error: null };
    const through = (head.data[0] as unknown as { id: unknown }).id;
    if (typeof through !== "string" || !through) return failure("Invalid attempt cursor");
    const rows: T[] = [];
    let after: string | null = null;
    for (;;) {
      if (!isActive()) return failure("Attempt read cancelled");
      const page = await readPage({ head: false, after, through });
      if (!isActive()) return failure("Attempt read cancelled");
      if (page.error) return { data: null, error: page.error };
      if (!Array.isArray(page.data)) return failure("Invalid attempt page");
      if (!page.data.length) break;
      for (const row of page.data) {
        if (!row || typeof row.id !== "string" || !row.id || row.id > through ||
          (after !== null && row.id <= after) || !inScope(row)) {
          return failure("Invalid or non-advancing attempt page");
        }
        after = row.id;
        rows.push(row);
      }
      if (after === through) break;
      // A short page may reflect a lower server cap, so it is not end-of-history.
    }
    return { data: rows, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error("Attempt read failed") };
  }
}
