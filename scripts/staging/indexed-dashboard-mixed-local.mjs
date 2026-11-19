// Local-only index experiment. No migration, permission or production change.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sql } from './scoped-attempts-http-local.mjs';
import { localDir } from './local-config.mjs';

const index = 'reliq_probe_students_class_id_idx';
assert.equal(sql(`select to_regclass('public.${index}') is null;`), 't', 'Never replace an existing index');
const started = Date.now();
let outcome;
try {
  sql(`create index ${index} on public.students(class_id);`);
  const child = spawn(process.execPath, [fileURLToPath(new URL('./scoped-dashboard-mixed-local.mjs', import.meta.url))], { stdio: 'inherit' });
  outcome = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve({ code, signal }));
  });
} finally {
  sql(`drop index if exists public.${index};`);
  assert.equal(sql(`select to_regclass('public.${index}') is null;`), 't');
}
const result = JSON.parse(fs.readFileSync(`${localDir}/scoped-dashboard-mixed-result.json`, 'utf8'));
assert(Date.parse(result.at) >= started, 'Do not reuse an earlier workload report');
fs.writeFileSync(`${localDir}/indexed-dashboard-mixed-result.json`, JSON.stringify({
  experiment: 'Temporary students(class_id) index; all access policies unchanged',
  indexRemoved: true, workloadProcess: outcome, workload: result,
}, null, 2)+'\n');
process.exitCode = outcome.code ?? 1;
