import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
const run = (settings = {}) => {
  const env = { ...process.env };
  for (const key of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_APP_ENV']) delete env[key];
  return spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e',
    'import { SUPABASE_URL, SUPABASE_PROJECT_REF } from "./lib/supabase-config.ts"; console.log(JSON.stringify({url:SUPABASE_URL,ref:SUPABASE_PROJECT_REF}));'],
    { env: { ...env, ...settings }, encoding: 'utf8' });
};
assert.equal(run().status, 0, 'production defaults remain supported');
assert.equal(run({ NEXT_PUBLIC_SUPABASE_URL: 'https://dqncplrxjxvjqbmwcyia.supabase.co/' }).status, 0, 'existing production URL-only configuration retains its public-key fallback');
assert.notEqual(run({ NEXT_PUBLIC_APP_ENV: 'staging' }).status, 0, 'staging cannot default to production');
assert.notEqual(run({ NEXT_PUBLIC_SUPABASE_URL: 'https://synthetic.supabase.co' }).status, 0, 'partial settings fail closed');
assert.notEqual(run({ NEXT_PUBLIC_APP_ENV: 'staging', NEXT_PUBLIC_SUPABASE_URL: 'https://dqncplrxjxvjqbmwcyia.supabase.co/', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'synthetic-key' }).status, 0, 'staging rejects production host');
const staging = run({ NEXT_PUBLIC_APP_ENV: 'staging', NEXT_PUBLIC_SUPABASE_URL: 'https://synthetic.supabase.co/', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'synthetic-key' });
assert.equal(staging.status, 0);
assert.deepEqual(JSON.parse(staging.stdout), { url: 'https://synthetic.supabase.co', ref: 'synthetic' });
for (const file of ['lib/supabase.ts', 'lib/school-platform-server.ts', 'lib/platform-admin-server.ts', 'lib/demo-account-server.ts', 'lib/world3d/expedition-access-server.ts', 'app/api/roster-extract/route.ts']) {
  const source = fs.readFileSync(file, 'utf8');
  assert.ok(source.includes('@/lib/supabase-config'), `${file} shares environment configuration`);
  assert.ok(!source.includes('dqncplrxjxvjqbmwcyia.supabase.co'), `${file} must not hard-code production data requests`);
}
console.log('PASS: staging isolation, production compatibility, incomplete settings and shared browser/server connections.');
