import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
const run = (settings = {}) => {
  const env = { ...process.env };
  for (const key of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_APP_ENV', 'NODE_ENV']) delete env[key];
  return spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e',
    'import { SUPABASE_URL, SUPABASE_PROJECT_REF } from "./lib/supabase-config.ts"; console.log(JSON.stringify({url:SUPABASE_URL,ref:SUPABASE_PROJECT_REF}));'],
    { env: { ...env, NODE_ENV: 'production', ...settings }, encoding: 'utf8' });
};
assert.equal(run().status, 0, 'production defaults remain supported');
assert.equal(run({ NEXT_PUBLIC_SUPABASE_URL: 'https://dqncplrxjxvjqbmwcyia.supabase.co/' }).status, 0, 'existing production URL-only configuration retains its public-key fallback');
assert.notEqual(run({ NEXT_PUBLIC_APP_ENV: 'staging' }).status, 0, 'staging cannot default to production');
assert.notEqual(run({ NEXT_PUBLIC_SUPABASE_URL: 'https://synthetic.supabase.co' }).status, 0, 'partial settings fail closed');
assert.notEqual(run({ NEXT_PUBLIC_APP_ENV: 'staging', NEXT_PUBLIC_SUPABASE_URL: 'https://dqncplrxjxvjqbmwcyia.supabase.co/', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'synthetic-key' }).status, 0, 'staging rejects production host');
const staging = run({ NEXT_PUBLIC_APP_ENV: 'staging', NEXT_PUBLIC_SUPABASE_URL: 'https://synthetic.supabase.co/', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'synthetic-key' });
assert.equal(staging.status, 0);
assert.deepEqual(JSON.parse(staging.stdout), { url: 'https://synthetic.supabase.co', ref: 'synthetic' });
for (const mode of [
  { NODE_ENV: 'development' },
  { NEXT_PUBLIC_APP_ENV: 'development' },
  { NEXT_PUBLIC_APP_ENV: 'staging' },
  // A developer cannot override the NODE_ENV guard with a production app label.
  { NODE_ENV: 'development', NEXT_PUBLIC_APP_ENV: 'production' },
]) {
  for (const settings of [
    {},
    { NEXT_PUBLIC_SUPABASE_URL: 'https://synthetic.supabase.co' },
    { NEXT_PUBLIC_SUPABASE_ANON_KEY: 'synthetic-key' },
    { NEXT_PUBLIC_SUPABASE_URL: ' ', NEXT_PUBLIC_SUPABASE_ANON_KEY: ' ' },
    { NEXT_PUBLIC_SUPABASE_URL: 'https://dqncplrxjxvjqbmwcyia.supabase.co/', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'synthetic-key' },
  ]) {
    const result = run({ ...mode, ...settings });
    assert.notEqual(result.status, 0, 'isolated environments reject absent, partial and production settings');
    assert.match(result.stderr, /Local development and staging/);
    assert.ok(!result.stderr.includes('synthetic-key'), 'configuration errors do not disclose key values');
  }
  for (const url of ['https://synthetic.supabase.co/', 'http://127.0.0.1:56521/', 'http://localhost:56521/']) {
    const result = run({ ...mode, NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_ANON_KEY: 'synthetic-key' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).url, url.replace(/\/$/, ''));
  }
}
for (const file of ['lib/supabase.ts', 'lib/school-platform-server.ts', 'lib/platform-admin-server.ts', 'lib/demo-account-server.ts', 'lib/world3d/expedition-access-server.ts', 'app/api/roster-extract/route.ts']) {
  const source = fs.readFileSync(file, 'utf8');
  assert.ok(source.includes('@/lib/supabase-config'), `${file} shares environment configuration`);
  assert.ok(!source.includes('dqncplrxjxvjqbmwcyia.supabase.co'), `${file} must not hard-code production data requests`);
}
console.log('PASS: development/staging isolation, production compatibility, incomplete settings and shared browser/server connections.');
