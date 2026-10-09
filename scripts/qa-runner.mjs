// Named groups reuse existing checks without changing their assertions.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const groups = {
  critical: [
    'qa:screen-recording-safety', 'qa:student-session-isolation',
    'qa:student-diagnostic-permissions', 'qa:realm-release-gate',
    'qa:canonical-progression', 'qa:teacher-canonical-snapshot',
    'qa:live-maths-progression', 'qa:completion-rewards',
    'qa:activity-marking', 'qa:quiz-math-integrity', 'qa:lint-interactions',
  ],
  // Source checks only: not a substitute for deployed role/RLS tests.
  'security-source': ['qa:screen-recording-safety', 'qa:student-session-isolation', 'qa:student-diagnostic-permissions', 'qa:school-teacher-learning-access'],
};
const group = process.argv[2];
if (!Object.hasOwn(groups, group ?? '')) {
  console.error(`Choose a QA group: ${Object.keys(groups).join(', ')}`);
  process.exit(2);
}
const scripts = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts;
const checks = groups[group];
for (const name of checks) if (!scripts[name]) throw new Error(`Missing QA command: ${name}`);
const output = path.join('.local-archive', 'qa', group);
fs.mkdirSync(output, { recursive: true });
const results = [];
for (const name of checks) {
  const started = Date.now();
  const result = spawnSync('npm', ['run', name], { encoding: 'utf8', timeout: 180_000, maxBuffer: 16 * 1024 * 1024 });
  const log = (result.stdout ?? '') + (result.stderr ?? '') + (result.error?.message ?? '');
  fs.writeFileSync(path.join(output, name.replaceAll(':', '_') + '.log'), log);
  const passed = result.status === 0 && !result.error;
  results.push({ name, passed, seconds: (Date.now() - started) / 1000 });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
  if (!passed) console.error(log.slice(-6000));
}
fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
const failed = results.filter(result => !result.passed);
console.log(`${results.length - failed.length}/${results.length} ${group} checks passed. Logs: ${output}`);
process.exitCode = failed.length ? 1 : 0;
