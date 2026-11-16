// Local-only aggregate timing/wait profile. Never records SQL text or account data.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { localConfig, localDir } from './local-config.mjs';
localConfig();
const duration = Number(process.env.SCALE_PROFILE_SECONDS ?? 75);
if (!Number.isInteger(duration) || duration < 30 || duration > 180) throw new Error('Profile duration must be 30–180 seconds');
const sql = query => JSON.parse(execFileSync('docker', ['exec', 'supabase_db_reliq-scale-local', 'psql', '-X', '-U', 'postgres', '-d', 'postgres', '-At', '-v', 'ON_ERROR_STOP=1', '-c', query], { encoding: 'utf8', timeout: 10000 }).trim());
const statementTotals = () => sql(`
select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
  select n.name, coalesce(sum(s.calls),0) as calls, coalesce(sum(s.total_exec_time),0) as execution_ms
  from unnest(array['student_login_lookup','get_student_runtime_context_secure',
    'upsert_live_student_activity_secure','get_student_activity_daily_secure',
    'touch_live_student_presence_secure','upsert_student_activity_daily_secure',
    'get_live_student_activity_secure']) n(name)
  left join extensions.pg_stat_statements s on s.query like '%' || n.name || '%'
    and s.query not like '%pg_stat_statements%'
  group by n.name order by n.name
) t;`);
const before = statementTotals();
const samples = [], start = Date.now();
while (Date.now() - start < duration * 1000) {
  samples.push({ at: new Date().toISOString(), database: sql(`
    select json_build_object('connections',count(*),
      'active',count(*) filter(where state='active'),
      'lockWaits',count(*) filter(where wait_event_type='Lock'),
      'ioWaits',count(*) filter(where wait_event_type='IO'),
      'longestActiveMs',coalesce(max(extract(epoch from (clock_timestamp()-query_start))*1000) filter(where state='active'),0))
    from pg_stat_activity where pid <> pg_backend_pid();`) });
  await new Promise(resolve => setTimeout(resolve, 1000));
}
const after = statementTotals();
const deltas = after.map(row => {
  const prior = before.find(item => item.name === row.name);
  const calls = row.calls - prior.calls, executionMs = row.execution_ms - prior.execution_ms;
  return { name: row.name, calls, executionMs, averageExecutionMs: calls ? executionMs/calls : null };
});
fs.writeFileSync(`${localDir}/database-profile.json`, JSON.stringify({
  environment: 'isolated local aggregate profile', durationSeconds: (Date.now()-start)/1000,
  note: 'Statement totals are shared local database deltas, not per-request traces; active/wait samples may miss short events.',
  deltas, samples,
}, null, 2));
console.log(`Saved ${samples.length} aggregate database samples and statement deltas.`);
