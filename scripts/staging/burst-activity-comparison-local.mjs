// Four activity-only local mixed runs. No temporary endpoint or schema changes.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { localConfig, localDir } from './local-config.mjs';
localConfig();
const repo = fileURLToPath(new URL('../../', import.meta.url));
const out = path.join(localDir, `burst-activity-${Date.now()}`);
fs.mkdirSync(out);
const report = { at: new Date().toISOString(), order: [6,2,2,6], rounds: [], limitation: 'Local synthetic presence/daily activity/events; no canonical submissions or hosted capacity proof. Histories grow between rounds. Default production concurrency unchanged.' };
try {
  for (const [round, concurrency] of report.order.entries()) {
    const fd = fs.openSync(path.join(out, `${round}.log`), 'w', 0o600);
    const started = Date.now();
    const code = await new Promise((resolve,reject) => {
      const child = spawn(process.execPath, ['--no-warnings','--experimental-strip-types','--experimental-loader',path.join(repo,'scripts/typescript-alias-loader.mjs'),path.join(repo,'scripts/staging/capacity-local.mjs')], {
        env: { ...process.env, SCALE_GROUP_COUNT:'4', SCALE_DURATION_SECONDS:'60', SCALE_SCENARIO:'dashboard-mixed', SCALE_EVENT_MODE:'compact', SCALE_PROFILE_DASHBOARD:'1', SCALE_ATTEMPT_PAGE_SIZE:'1000', SCALE_LOGIN_RAMP_SECONDS:'0', SCALE_TRACE_DATABASE:'0', SCALE_DASHBOARD_CONCURRENCY:String(concurrency), SCALE_ATTEMPT_MODE:'direct' }, stdio: ['ignore',fd,fd],
      });
      fs.closeSync(fd);
      child.on('error',reject); child.on('close',resolve);
    });
    assert([0,1].includes(code));
    const source = path.join(localDir,'capacity-100-dashboard-mixed-compact-page1000-result.json');
    assert(fs.statSync(source).mtimeMs >= started);
    const r = JSON.parse(fs.readFileSync(source,'utf8'));
    fs.copyFileSync(source,path.join(out,`${round}.json`));
    fs.copyFileSync(path.join(localDir,r.activityJournalFile),path.join(out,`${round}-activity.jsonl`));
    fs.copyFileSync(path.join(localDir,'dashboard-http-profile.json'),path.join(out,`${round}-http.json`));
    report.rounds.push({round,concurrency,failedOperations:r.failedRequests,failures:r.failures,verifiedStudents:r.verifiedPresenceStudents,activityWrites:r.verifiedActivityWrites,events:r.expectedNewEvents,gatePassed:r.preliminaryGatePassed,p95Ms:Object.fromEntries(r.endpoints.map(e=>[e.name,e.p95Ms]))});
    console.log(JSON.stringify(report.rounds.at(-1)));
    assert.equal(r.failedRequests,0); assert.equal(r.failures.length,0); assert.equal(r.verifiedPresenceStudents,100);
  }
} finally { fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n'); }
console.log(JSON.stringify({output:out}));
