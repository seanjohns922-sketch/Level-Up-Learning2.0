// Local-only sampled connection lifetimes; never exports SQL text or credentials.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { localConfig, localDir } from './local-config.mjs';
localConfig();
const seconds = Number(process.env.SCALE_PROFILE_SECONDS ?? 75);
assert.ok(Number.isInteger(seconds) && seconds >= 30 && seconds <= 180);
assert.equal(execFileSync('docker', ['inspect', '--format', '{{.State.Running}}', 'supabase_db_reliq-scale-local'], {encoding:'utf8'}).trim(), 'true');
const query = `select json_build_object('at',clock_timestamp(),'connections',coalesce((
 select json_agg(json_build_object('pid',pid,'state',state,'waitType',wait_event_type,
 'waitEvent',wait_event,'transactionStart',xact_start,
 'transactionAgeMs',case when xact_start is not null then extract(epoch from(clock_timestamp()-xact_start))*1000 end,
 'queryAgeMs',case when state='active' then extract(epoch from(clock_timestamp()-query_start))*1000 end,
 'blockerCount',case when wait_event_type='Lock' then cardinality(pg_blocking_pids(pid)) else 0 end,
 'category',case
 when state<>'active' then 'inactive'
 when query ilike '%complete_realm_lesson%' then 'lesson completion RPC'
 when query ilike '%reliq_probe_scoped_attempt_page%' then 'scoped attempt probe RPC'
 when query ilike '%get_live_class_compact_event_page_secure%' then 'compact event page RPC'
 when query ilike '%get_live_class_activity_today%' then 'teacher daily activity RPC'
 when query ilike '%student_lesson_attempts%' then 'lesson attempts table'
 when query ilike '%student_weekly_quiz_attempts%' then 'quiz attempts table'
 when query ilike '%student_realm_assessments%' then 'assessment table'
 when query ilike '%insert_live_activity_event_secure%' then 'student event insert RPC'
 when query ilike '%live_activity_events%' then 'event history table'
 when query ilike '%student_login_lookup%' then 'student login RPC'
 when query ilike '%live_student_activity%' then 'live presence table'
 else 'other statement (redacted)' end))
 from pg_stat_activity where usename='authenticator' and application_name like 'PostgREST%'
 ),'[]'::json));`;
// One persistent psql process avoids a docker/connection startup per sample.
const child = spawn('docker', ['exec','-i','supabase_db_reliq-scale-local','psql','-X','-U','postgres','-d','postgres','-At','-v','ON_ERROR_STOP=1'], {stdio:['pipe','pipe','pipe']});
let buffer = '', error = '';
const samples = [];
child.stdout.setEncoding('utf8');
child.stdout.on('data', chunk => {
 buffer += chunk;
 const lines = buffer.split('\n'); buffer = lines.pop();
 for (const line of lines) if (line.startsWith('{')) samples.push(JSON.parse(line));
});
child.stderr.setEncoding('utf8'); child.stderr.on('data', chunk => { error += chunk; });
const closed = new Promise((resolve,reject) => {
 child.on('error',reject); child.on('close',(code,signal)=>resolve({code,signal}));
});
// watch has a bounded iteration count; psql exits at EOF afterward.
child.stdin.end(`${query}\n\\watch i=0.05 c=${seconds*20}\n`);
const timeout = setTimeout(()=>child.kill('SIGTERM'), (seconds+20)*1000);
let result;
try { result = await closed; } finally { clearTimeout(timeout); }
assert.equal(result.code, 0, `Connection sampler failed: ${error.slice(0,400)}`);
assert.ok(samples.length >= seconds*10, 'Too few connection samples');
fs.writeFileSync(`${localDir}/connection-profile.json`, JSON.stringify({
 environment:'isolated local PostgREST connection samples', intervalTargetMs:50,
 caveats:['Sampling misses transactions shorter than the interval','Database transaction age excludes waiting for a pool connection','PostgREST includes non-workload connections; not per-request attribution','Profiling introduces observer overhead'],
 samples,
},null,2));
console.log(`Saved ${samples.length} local connection samples without SQL text.`);
