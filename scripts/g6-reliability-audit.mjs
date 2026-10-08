// Read-only local checks. Nonzero exit preserves unresolved audit findings.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const checks = [
  "qa:question-read-aloud",
  "qa:student-session-isolation",
  "qa:number-nexus-ground-full-year",
  "qa:number-nexus-year1-full-year",
  "qa:number-nexus-year2-full-year",
  "qa:number-nexus-mab",
  "qa:number-nexus-year3-full-year",
  "qa:number-nexus-year4-full-year",
  "qa:number-nexus-year5-full-year",
  "qa:number-nexus-year6-full-year",
  "qa:completion-rewards",
  "qa:starpath-level4",
  "qa:starpath-level5",
  "qa:starpath-level6",
  "qa:measurelands-progression",
  "qa:level-integrity",
  "qa:measurelands-weekly-quizzes",
  "qa:canonical-progression",
  "qa:teacher-progress-overrides",
  "qa:teacher-canonical-snapshot",
  "qa:live-maths-progression",
  "qa:statistica-level1",
  "qa:statistica-level2",
  "qa:statistica-level3",
  "qa:statistica-level4",
  "qa:statistica-level6",
  "qa:pattern-peaks-release",
  "qa:chance-hollow-generation",
  "qa:chance-hollow-answer-voice",
  "qa:chance-hollow-weekly-quizzes",
  "qa:chance-hollow-flow",
  "qa:early-years-inputs",
  "qa:quiz-math-integrity",
  "qa:lesson-start-guides",
  "qa:activity-marking",
  "qa:g6-question-integrity"
];
const output = process.env.AUDIT_OUTPUT_DIR ?? '.local-archive/g6-reliability';
fs.mkdirSync(output,{recursive:true});
const results=[];
for(const name of checks) {
 const started=Date.now();
 const result=spawnSync('npm',['run',name],{encoding:'utf8',timeout:180000});
 fs.writeFileSync(path.join(output,name.replaceAll(':','_')+'.log'),(result.stdout??'')+(result.stderr??'')+(result.error?.message??''));
 results.push({name,passed:result.status===0,seconds:(Date.now()-started)/1000});
 console.log(`${result.status===0?'PASS':'FAIL'} ${name}`);
}
fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2)+'\n');
const failed=results.filter(result=>!result.passed);
console.log(`${results.length-failed.length}/${results.length} checks passed. Evidence: ${output}`);
process.exitCode=failed.length ? 1 : 0;
