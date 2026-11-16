// Read-only preflight for the prepared local stack; never accepts cloud targets.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { localConfig } from './local-config.mjs';

localConfig();
const docker = args => execFileSync('docker', args, { encoding: 'utf8', timeout: 30_000 }).trim();
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
console.log('PASS local runtime, gateway capacity and selected November schema preflight. This is not full schema parity or capacity certification.');
