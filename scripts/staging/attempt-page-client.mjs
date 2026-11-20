import assert from 'node:assert/strict';

// Local experiment only: retain the production reader and every filter/cursor.
export function attemptPageClient(client, pageSize) {
  assert.ok([500, 1000].includes(pageSize), 'Attempt page size must be 500 or 1000');
  return { from(table) { return { select(...args) {
    const query = client.from(table).select(...args);
    const limit = query.limit.bind(query);
    query.limit = size => limit(size === 1 ? 1 : pageSize);
    return query;
  } }; } };
}
