// Aggregate local resource samples only; no query text or student records.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { localConfig, localDir } from './local-config.mjs';
localConfig();
const duration=Number(process.env.SCALE_MONITOR_SECONDS ?? 1800);
if(!Number.isInteger(duration)||duration<30||duration>1800)throw new Error('Duration must be 30–1800 seconds');
const intervalMs=Number(process.env.SCALE_MONITOR_INTERVAL_MS ?? 30000);
if(!Number.isInteger(intervalMs)||intervalMs<1000||intervalMs>30000)throw new Error('Sample interval must be 1000–30000 milliseconds');
const samples=[],start=Date.now();
const output=`${localDir}/resource-samples.json`;
function save(){fs.writeFileSync(output,JSON.stringify({environment:'local Docker point samples; not production headroom',intervalMs,caveat:'Samples are sequential and take time; timestamps bracket collection, not an instantaneous measurement. Docker CPU percentages use one core as 100%.',samples},null,2));}
for(;;){
 const at=new Date().toISOString();
 try{
  const containers=execFileSync('docker',['stats','--no-stream','--format','{{json .}}','supabase_db_reliq-scale-local','supabase_rest_reliq-scale-local','supabase_realtime_reliq-scale-local','supabase_kong_reliq-scale-local'],{encoding:'utf8',timeout:15000}).trim().split('\n').map(line=>{const row=JSON.parse(line);return {name:row.Name,cpu:row.CPUPerc,memory:row.MemUsage,network:row.NetIO,blockIO:row.BlockIO};});
  const database=JSON.parse(execFileSync('docker',['exec','supabase_db_reliq-scale-local','psql','-U','postgres','-d','postgres','-Atc',"select json_build_object('connections',count(*),'activeIncludingObserver',count(*) filter(where state='active')) from pg_stat_activity;"],{encoding:'utf8',timeout:15000}).trim());
  samples.push({at,completedAt:new Date().toISOString(),containers,database});
 }catch(error){samples.push({at,completedAt:new Date().toISOString(),error:error.code??'sampling failed'});}
 save();
 if(Date.now()-start>=duration*1000)break;
 await new Promise(resolve=>setTimeout(resolve,Math.max(0,Math.min(intervalMs,duration*1000-(Date.now()-start)))));
}
console.log(`Saved ${samples.length} local resource samples.`);
