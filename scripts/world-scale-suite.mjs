import { spawnSync } from 'node:child_process';
const checks = [
 'organic-path-test.mjs', 'world-scale-contract-test.mjs',
 'railway-test.mjs', 'railway-station-placement-test.mjs',
 'free-world-items-test.mjs', 'village-infrastructure-test.mjs',
 'village-buildings-test.mjs', 'realm-building-designs-test.mjs',
];
let failed = false;
for (const file of checks) {
 const result = spawnSync(process.execPath, ['--no-warnings', '--experimental-strip-types', '--experimental-loader', './scripts/typescript-alias-loader.mjs', `scripts/${file}`], { stdio: 'inherit', timeout: 120_000 });
 if (result.status !== 0) failed = true;
}
process.exitCode = failed ? 1 : 0;
