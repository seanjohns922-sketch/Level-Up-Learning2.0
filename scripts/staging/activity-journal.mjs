// Local synthetic diagnostics only. Never record identities, tokens or payloads.
import fs from 'node:fs';
import assert from 'node:assert/strict';

export function createActivityJournal(file, runId) {
  // Exclusive creation keeps earlier runs intact. Appends survive a process exit,
  // but are not fsynced: this is not a power-loss durability guarantee.
  fs.writeFileSync(file, `${JSON.stringify({ kind: 'run', runId, version: 1 })}\n`, { flag: 'wx', mode: 0o600 });
  return record => fs.appendFileSync(file, `${JSON.stringify(record)}\n`);
}

export async function journalActivityWrite(record, studentOrdinal, sequence, operation, write) {
  assert.ok(Number.isInteger(studentOrdinal) && studentOrdinal > 0);
  assert.ok(Number.isInteger(sequence) && sequence > 0);
  assert.ok(['activity', 'event'].includes(operation));
  const entry = { studentOrdinal, sequence, operation };
  // Persist intent before dispatch. Missing acknowledgement means unknown, not failed.
  record({ kind: 'intent', ...entry });
  const result = await write();
  record({ kind: 'acknowledged', ...entry });
  return result;
}
