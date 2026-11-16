// Run only in a disposable, network-disabled container. Older Supabase images
// crash on these legitimate ACL denials; never probe a working/shared database.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const container = process.argv[2];
assert.equal(process.argv.length, 3, 'Provide one disposable container name');
assert.match(container ?? '', /^reliq-parity-[a-z0-9-]+$/);
const inspect = JSON.parse(execFileSync('docker', ['inspect', container], { encoding: 'utf8' }))[0];
assert.equal(inspect.HostConfig.NetworkMode, 'none', 'Requires a network-disabled disposable container');
assert.equal(Object.keys(inspect.HostConfig.PortBindings ?? {}).length, 0, 'Published ports are forbidden');
assert.equal((inspect.Mounts ?? []).filter(mount => mount.Type === 'bind').length, 0, 'Host bind mounts are forbidden');

const sql = `BEGIN;
CREATE FUNCTION public.reliq_runtime_acl_probe() RETURNS integer LANGUAGE sql AS 'SELECT 1';
REVOKE ALL ON FUNCTION public.reliq_runtime_acl_probe() FROM PUBLIC, anon, authenticated;
SET LOCAL ROLE anon;
DO $$ BEGIN
  BEGIN
    PERFORM public.reliq_runtime_acl_probe();
    RAISE EXCEPTION 'Anonymous function access was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
RESET ROLE;
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  BEGIN
    PERFORM public.reliq_runtime_acl_probe();
    RAISE EXCEPTION 'Authenticated function access was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
RESET ROLE;
ROLLBACK;
`;
execFileSync('docker', ['exec', '-i', container, 'psql', '-X', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'], {
  input: sql, encoding: 'utf8', timeout: 30_000,
});
console.log(`PASS: anon/authenticated ACL denials return normally; fixtures rolled back (${inspect.Config.Image}).`);
