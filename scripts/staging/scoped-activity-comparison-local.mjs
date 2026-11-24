// Mixed dashboard comparison with activity/presence/events only, not assessments
// or canonical completions. Temporary read endpoint is removed after workloads drain.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { signature, setup, sql, name, newClient, groups } from './scoped-attempts-http-local.mjs';
import { localDir } from './local-config.mjs';
const repo = fileURLToPath(new URL('../../', import.meta.url));
const order = (process.env.SCALE_COMPARISON_ORDER ?? 'direct,scoped').split(',');
assert.ok(['direct,scoped','scoped,direct'].includes(order.join(',')), 'Comparison must contain each mode exactly once');
const out = path.join(localDir, `scoped-activity-${Date.now()}`);
fs.mkdirSync(out);
const report = { at: new Date().toISOString(), order, rounds: [], restored: false,
  limitations: ['One sequential pair per invocation; compare recorded order explicitly. Not production capacity proof.', 'Activity, presence and event writes only; attempt histories stay static.', 'Scoped pages use 500 rows per table; direct production reader uses 1000.', 'No browser/realtime coverage.'] };
const run = mode => new Promise((resolve, reject) => {
  const fd = fs.openSync(path.join(out, `${mode}.log`), 'w');
  const child = spawn(process.execPath, ['--no-warnings','--experimental-strip-types','--experimental-loader',path.join(repo,'scripts/typescript-alias-loader.mjs'),path.join(repo,'scripts/staging/capacity-local.mjs')], {
    env: { ...process.env, SCALE_GROUP_COUNT:'4', SCALE_DURATION_SECONDS:'60', SCALE_SCENARIO:'dashboard-mixed', SCALE_EVENT_MODE:'compact', SCALE_PROFILE_DASHBOARD:'1', SCALE_ATTEMPT_PAGE_SIZE:'1000', SCALE_LOGIN_RAMP_SECONDS:'0', SCALE_TRACE_DATABASE:'0', SCALE_DASHBOARD_CONCURRENCY:'6', SCALE_ATTEMPT_MODE:mode },
    stdio: ['ignore',fd,fd],
  });
  fs.closeSync(fd);
  child.on('error', reject);
  child.on('close', code => resolve(code));
});
assert.equal(sql(`select to_regprocedure('${signature}') is null;`), 't');
try {
  sql(setup);
  const client = newClient();
  assert.equal((await client.auth.signInWithPassword({email:groups[0].email,password:groups[0].password})).error,null);
  const deadline = Date.now()+10000;
  for (;;) {
    const ready = await client.rpc(name,{p_ids:[],p_after:[null,null,null],p_through:null,p_limit:1});
    if (!ready.error) break;
    assert.equal(ready.error.code,'PGRST202'); assert(Date.now()<deadline);
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  for (const mode of report.order) {
    const start = Date.now();
    const code = await run(mode);
    assert([0,1].includes(code), 'Unexpected child exit');
    const source = path.join(localDir, `capacity-100${mode==='scoped'?'-scoped-attempts':''}-dashboard-mixed-compact-page1000-result.json`);
    assert(fs.statSync(source).mtimeMs>=start);
    const r = JSON.parse(fs.readFileSync(source,'utf8'));
    fs.copyFileSync(source,path.join(out,`${mode}.json`));
    fs.copyFileSync(path.join(localDir,r.activityJournalFile),path.join(out,`${mode}-activity.jsonl`));
    fs.copyFileSync(path.join(localDir,'dashboard-http-profile.json'),path.join(out,`${mode}-http.json`));
    report.rounds.push({mode,failedRecordedOperations:r.failedRequests,journeyFailures:r.failures.length,verifiedStudents:r.verifiedPresenceStudents,verifiedActivityWrites:r.verifiedActivityWrites,expectedEvents:r.expectedNewEvents,gatePassed:r.preliminaryGatePassed,dashboardChecks:r.dashboardChecks,p95Ms:Object.fromEntries(r.endpoints.map(e=>[e.name,e.p95Ms]))});
    console.log(JSON.stringify(report.rounds.at(-1)));
    assert.equal(r.failures.length,0); assert.equal(r.failedRequests,0); assert.equal(r.verifiedPresenceStudents,100);
  }
} finally {
  sql(`drop function if exists ${signature}; notify pgrst,'reload schema';`);
  assert.equal(sql(`select to_regprocedure('${signature}') is null;`),'t');
  report.restored = true;
  fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({output:out,restored:report.restored}));
