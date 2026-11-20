/* global fetch, AbortSignal */
// Read-only preflight for the prepared local stack; never accepts cloud targets.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { localConfig } from './local-config.mjs';

const config = localConfig();
const docker = args => execFileSync('docker', args, { encoding: 'utf8', timeout: 30_000 }).trim();
for (const name of ['supabase_db_reliq-scale-local', 'supabase_rest_reliq-scale-local', 'supabase_auth_reliq-scale-local', 'supabase_kong_reliq-scale-local']) {
  assert.equal(docker(['inspect', '--format', '{{.State.Running}}', name]), 'true', `${name} is not running`);
}
const network = JSON.parse(docker(['inspect', '--format', '{{json .NetworkSettings.Networks}}', 'supabase_rest_reliq-scale-local']));
const restNetwork = network['supabase_network_reliq-scale-local'];
assert.ok(restNetwork?.Aliases?.includes('rest'), 'Local REST network alias is missing');
assert.ok(!restNetwork.IPAMConfig?.IPv4Address, 'Restore automatic REST address allocation before testing; a fixed address can conflict after Docker restarts');
const image = docker(['inspect', '--format', '{{.Config.Image}}', 'supabase_db_reliq-scale-local']);
assert.equal(image, 'public.ecr.aws/supabase/postgres:17.6.1.156',
  'Unverified local database image. Review docs/performance/LOCAL_DATABASE_RUNTIME_2026-11-16.md before testing.');
const gateway = docker(['exec', 'supabase_kong_reliq-scale-local', 'cat', '/usr/local/kong/nginx.conf']);
assert.match(gateway, /\bworker_connections\s+4096\s*;/,
  'Local gateway setting was reset. Run scripts/staging/tune-local-gateway.mjs before load tests.');
const schema = docker(['exec', 'supabase_db_reliq-scale-local', 'psql', '-X', '-U', 'postgres', '-d', 'postgres', '-At', '-v', 'ON_ERROR_STOP=1', '-c', `
SELECT to_regclass('public.student_realm_locks') IS NOT NULL
  AND to_regprocedure('public.start_school_year(uuid,integer,text)') IS NOT NULL
  AND to_regprocedure('public.remove_empty_class(uuid)') IS NOT NULL
  AND (SELECT provolatile = 'v' FROM pg_proc WHERE oid = to_regprocedure('public.get_student_realm_locks(uuid)'))
  AND NOT has_function_privilege('service_role','public.run_school_year_rollover()','EXECUTE');
`]);
assert.equal(schema, 't', 'Expected local November schema/manual-year guard is missing.');
const classIndex = docker(['exec', 'supabase_db_reliq-scale-local', 'psql', '-X', '-U', 'postgres', '-d', 'postgres', '-At', '-v', 'ON_ERROR_STOP=1', '-c', `
SELECT EXISTS (
  SELECT 1 FROM pg_index i
  WHERE i.indexrelid = to_regclass('public.students_class_id_idx')
    AND i.indrelid = 'public.students'::regclass
    AND i.indisvalid AND i.indisready AND i.indpred IS NULL
    AND i.indnkeyatts = 1
    AND pg_get_indexdef(i.indexrelid, 1, true) = 'class_id'
);
`]);
assert.equal(classIndex, 't', 'Local class index is missing or invalid. Apply existing migration 20261117090000_index_student_current_class.sql locally before comparing capacity results.');
const response = await fetch(`${config.API_URL}/rest/v1/`, {
  headers: { apikey: config.ANON_KEY, Authorization: `Bearer ${config.ANON_KEY}` },
  signal: AbortSignal.timeout(10000),
});
assert.ok(response.ok, `Local REST HTTP readiness failed (${response.status})`);
await response.arrayBuffer();
console.log('PASS local REST readiness, automatic addressing, runtime, gateway capacity and selected November schema preflight. This is not full schema parity or capacity certification.');
