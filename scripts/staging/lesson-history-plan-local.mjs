// Read-only authenticated plans against isolated synthetic fixtures. No DDL.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { localConfig, localDir } from './local-config.mjs';
localConfig();
const apiShape = process.argv.includes('--api-shape');
assert(process.argv.slice(2).every(arg => arg === '--api-shape'));
const groups = Array.from({ length: 4 }, (_, i) => JSON.parse(fs.readFileSync(`${localDir}/synthetic-accounts${i ? `-${i + 1}` : ''}.json`, 'utf8')));
const uuid = value => { assert.match(value, /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i); return `'${value}'`; };
function sql(query) {
  // Do not expose SQL/fixture identifiers if psql fails.
  try {
    return execFileSync('docker', ['exec', '-i', 'supabase_db_reliq-scale-local', 'psql', '-XqAt', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'], { input: query, encoding: 'utf8', stdio: ['pipe','pipe','pipe'], maxBuffer: 8 * 1024 * 1024 });
  } catch { throw new Error('Local read-only plan query failed; inspect locally without exporting fixture identifiers.'); }
}
const columns = 'id,student_id,realm_id,working_level,week,lesson,lesson_id,attempt_no,correct_count,total_questions,accuracy_percent,completed,completed_at';
const report = { apiShape, at: new Date().toISOString(), samples: [], checks: [], limitation: 'Sequential local authenticated EXPLAIN ANALYZE, not concurrent HTTP, pool waits, browser latency or capacity proof. Plan conditions and fixture IDs are not exported.' };
function nodes(plan, depth = 0) {
  return [{ depth, type: plan['Node Type'], relation: plan['Relation Name'], index: plan['Index Name'], rows: plan['Actual Rows'], loops: plan['Actual Loops'], removed: plan['Rows Removed by Filter'] ?? 0, totalMs: plan['Actual Total Time'], sharedHits: plan['Shared Hit Blocks'], sharedReads: plan['Shared Read Blocks'] }, ...(plan.Plans ?? []).flatMap(p => nodes(p, depth + 1))];
}
for (const [teacherIndex, group] of groups.entries()) {
  const begin = `begin read only; set local statement_timeout='20s'; set local role authenticated; set local "request.jwt.claim.sub"=${uuid(group.teacherId)};`;
  const where = `from public.student_lesson_attempts where completed=true and student_id=any(array[${group.students.map(s => uuid(s.studentId)).join(',')}]::uuid[])`;
  const head = sql(`${begin} select id ${where} order by id desc limit 1; rollback;`).trim();
  uuid(head);
  // Reproduce the fixed first-page UUID upper bound used by the production reader.
  for (let round = 0; round < 3; round++) {
    for (const kind of round % 2 ? ['page','head'] : ['head','page']) {
      for (const planMode of ['literal', 'force_custom_plan', 'force_generic_plan']) {
      const query = kind === 'head' ? `select id ${where} order by id desc limit 1` : `select ${columns} ${where} and id<=${uuid(head)}::uuid order by id asc limit 1000`;
      const scope = `array[${group.students.map(s => uuid(s.studentId)).join(',')}]::uuid[]`;
      let parameterized = query.replace(scope, '$1').replace(`${uuid(head)}::uuid`, '$2');
      let types = `uuid[]${kind === 'page' ? ',uuid' : ''}`;
      let values = `${scope}${kind === 'page' ? `,${uuid(head)}::uuid` : ''}`;
      if (apiShape) {
        const offset = kind === 'page' ? 2 : 1;
        parameterized = parameterized.replace('completed=true', `completed=$${offset + 1}`).replace(/limit (1000|1)$/, `limit $${offset + 2} offset $${offset + 3}`);
        types += ',boolean,bigint,bigint';
        values += `,true,${kind === 'page' ? 1000 : 1},0`;
      }
      const wrap = q => apiShape ? `with pgrst_source as (${q}) select null::bigint as total_result_set, count(_postgrest_t) as page_total, coalesce(json_agg(_postgrest_t),'[]'::json) as body, nullif(current_setting('response.headers',true),'') as response_headers, nullif(current_setting('response.status',true),'') as response_status, '' as response_inserted from (select * from pgrst_source) _postgrest_t` : q;
      const statement = planMode === 'literal' ? wrap(query) : `execute lesson_probe(${values})`;
      const prepare = planMode === 'literal' ? '' : `set local plan_cache_mode='${planMode}'; prepare lesson_probe(${types}) as ${wrap(parameterized)};`;
      const [plan] = JSON.parse(sql(`${begin} ${prepare} explain (analyze,buffers,format json) ${statement}; rollback;`));
      assert(plan.Plan['Actual Rows'] > 0);
      if (apiShape && round === 0) {
        const expected = JSON.parse(sql(`${begin} select coalesce(json_agg(t),'[]'::json) from (${query}) t; rollback;`));
        const prepareResult = planMode === 'literal' ? '' : `set local plan_cache_mode='${planMode}'; prepare result_probe(${types}) as select row_to_json(t) from (${wrap(parameterized)}) t;`;
        const resultQuery = planMode === 'literal' ? `select row_to_json(t) from (${wrap(query)}) t` : `execute result_probe(${values})`;
        const actual = JSON.parse(sql(`${begin} ${prepareResult} ${resultQuery}; rollback;`));
        assert.equal(actual.page_total, expected.length);
        assert.deepEqual(actual.body, expected, 'API envelope must preserve all ordered rows');
      }
      report.samples.push({ teacherIndex, round, kind, planMode, executionMs: plan['Execution Time'], planningMs: plan['Planning Time'], nodes: nodes(plan.Plan) });
      }
    }
  }
}
report.checks = [ ...(apiShape ? ['24 complete API-envelope bodies match direct ordered rows across literal/custom/generic modes'] : []),'72 successful authenticated literal/custom/generic head/page plans', 'Read-only transactions rolled back; no schema or fixture writes', 'Exact production projection, completed filter, student scope, UUID order and first-page upper bound'];
fs.writeFileSync(`${localDir}/lesson-history-${apiShape ? 'api-shape' : 'plan'}-result.json`, JSON.stringify(report,null,2)+'\n', { mode: 0o600 });
for (const kind of ['head','page']) for (const planMode of ['literal','force_custom_plan','force_generic_plan']) {
  const samples = report.samples.filter(s => s.kind === kind && s.planMode === planMode);
  console.log(JSON.stringify({ kind, planMode, minMs: Math.min(...samples.map(s => s.executionMs)), maxMs: Math.max(...samples.map(s => s.executionMs)), indexes: [...new Set(samples.flatMap(s => s.nodes.map(n => n.index).filter(Boolean)))] }));
}
