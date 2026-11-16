// Aggregate baseline diagnostics only: never exports SQL text, arguments or credentials.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { localConfig, localDir } from './local-config.mjs';
localConfig();
const duration = Number(process.env.SCALE_PROFILE_SECONDS ?? 75);
if (!Number.isInteger(duration) || duration < 30 || duration > 180) throw new Error('Profile duration must be 30–180 seconds');
const sql = query => JSON.parse(execFileSync('docker', ['exec', 'supabase_db_reliq-scale-local', 'psql', '-X', '-U', 'postgres', '-d', 'postgres', '-At', '-v', 'ON_ERROR_STOP=1', '-c', query], { encoding:'utf8', timeout:10000 }).trim());
const totals = () => sql(`select coalesce(json_agg(t),'[]'::json) from (
 select case when userid=(select oid from pg_roles where rolname='anon') then 'student anon' when userid=(select oid from pg_roles where rolname='service_role') then 'fixture provisioning' else 'other role' end as workload_role,
 userid::text || ':' || dbid::text || ':' || queryid::text || ':' || toplevel::text as key,
 case
 when query ilike '%student_login_lookup%' then 'student login RPC'
 when query ilike '%get_student_runtime_context_secure%' then 'student context RPC'
 when query ilike '%set_config%' then 'session configuration'
 when query ~* '^\\s*commit' then 'commit'
 when query ~* '^\\s*(begin|start transaction)' then 'begin'
 when query ~* '^\\s*rollback' then 'rollback'
 when query ilike '%live_student_activity%' then 'live activity RPC'
 when query ilike '%student_activity_daily%' then 'daily activity RPC'
 when query ilike '%touch_live_student_presence%' then 'presence RPC'
 else 'other statement (redacted)' end as category,
 calls, plans, total_exec_time as execution_ms, total_plan_time as planning_ms,
 shared_blks_hit as block_hits, shared_blks_read as block_reads, wal_bytes::float8 as wal_bytes
 from extensions.pg_stat_statements where query not ilike '%pg_stat_%'
 ) t;`);
const settings = sql(`select json_object_agg(name,setting) from pg_settings where name in ('track_io_timing','track_wal_io_timing','pg_stat_statements.track_planning');`);
const wal = () => sql(`select row_to_json(w) from (select wal_write,wal_sync,wal_write_time,wal_sync_time,stats_reset from pg_stat_wal) w;`);
const walBefore = wal();
const before = totals();
const samples = [], start = Date.now();
while (Date.now()-start < duration*1000) {
 samples.push({at:new Date().toISOString(), activity:sql(`select coalesce(json_agg(t),'[]'::json) from (
 select state, wait_event_type, wait_event, count(*) as connections
 from pg_stat_activity where backend_type='client backend' and pid<>pg_backend_pid()
 group by state,wait_event_type,wait_event) t;`)});
 await new Promise(resolve => setTimeout(resolve,1000));
}
const previous = new Map(before.map(row => [row.key,row]));
const deltas = totals().map(row => {
 const old = previous.get(row.key) ?? {};
 const delta = { key:row.key, workloadRole:row.workload_role, category:row.category };
 for (const field of ['calls','plans','execution_ms','planning_ms','block_hits','block_reads','wal_bytes']) delta[field] = row[field]-(old[field]??0);
 delta.averagePlanningMs = delta.plans ? delta.planning_ms/delta.plans : null;
 delta.averageExecutionMs = delta.calls ? delta.execution_ms/delta.calls : null;
 return delta;
}).filter(row=>row.calls>0).sort((a,b)=>b.execution_ms-a.execution_ms);
const walAfter = wal();
if (walAfter.stats_reset !== walBefore.stats_reset) throw new Error('WAL statistics reset during profiling');
const walDelta = Object.fromEntries(['wal_write','wal_sync','wal_write_time','wal_sync_time'].map(key=>[key,walAfter[key]-walBefore[key]]));
fs.writeFileSync(`${localDir}/transaction-profile.json`,JSON.stringify({
 environment:'isolated local baseline; no statistic resets',
 caveats:['Shared database deltas include fixture preparation and background services','Consult captured settings before interpreting zero planning/I/O timings; WAL counters cover the entire database including fixture provisioning','Statement execution excludes network, pool waiting and some transaction overhead','One-second activity samples can miss short waits'],
 settings,walDelta,deltas,samples,
},null,2));
console.log(`Saved ${deltas.length} redacted statement deltas and ${samples.length} wait samples.`);
