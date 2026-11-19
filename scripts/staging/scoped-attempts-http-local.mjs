// Temporary local-only API experiment; never a production migration.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { localConfig, localDir } from './local-config.mjs';

const config = localConfig();
const groups = Array.from({ length: 20 }, (_, i) => JSON.parse(fs.readFileSync(`${localDir}/synthetic-accounts${i ? `-${i + 1}` : ''}.json`, 'utf8')));
const name = 'reliq_probe_scoped_attempt_page';
const signature = `public.${name}(uuid[],uuid[],integer)`;
const tables = ['student_lesson_attempts', 'student_weekly_quiz_attempts', 'student_realm_assessments'];
const columns = [
  'student_id,realm_id,working_level,week,lesson,lesson_id,attempt_no,correct_count,total_questions,accuracy_percent,completed,completed_at',
  'student_id,realm_id,working_level,week,quiz_id,attempt_no,correct_count,total_questions,accuracy_percent,completed_at',
  'student_id,realm_id,working_level,assessment_type,correct_count,total_questions,score_percent,completed_at',
];
function sql(input) {
  try {
    return execFileSync('docker', ['exec', '-i', 'supabase_db_reliq-scale-local', 'psql', '-X', '-qAt', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'],
      { input, encoding: 'utf8', maxBuffer: 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (error) { throw new Error(String(error.stderr ?? error.message).slice(-1500)); }
}
// Fixed projections, bounded pages, and stable UUID cursors. Authorisation is
// checked anew on every page. No caller-supplied SQL or table names.
const pageQueries = tables.map((table, i) => `(select coalesce(jsonb_agg(to_jsonb(t) order by t.id),'[]'::jsonb)
  from (select id,${columns[i]} from public.${table}
  where student_id=any(permitted) ${i === 0 ? 'and completed=true' : ''}
  and (p_after[${i + 1}] is null or id>p_after[${i + 1}]) order by id limit p_limit) t)`);
const setup = `begin;
create function public.${name}(p_ids uuid[],p_after uuid[],p_limit integer) returns jsonb
language plpgsql stable security definer set search_path=public,pg_temp as $$
declare requested uuid[]; permitted uuid[];
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_ids is null or cardinality(p_ids)>500 or p_limit is null or p_limit<1 or p_limit>500
   or p_after is null or cardinality(p_after)<>3 or array_ndims(p_after)<>1 or array_lower(p_after,1)<>1 then
  raise exception 'Bounded scope and three cursors required' using errcode='22023';
 end if;
 select coalesce(array_agg(distinct id order by id),'{}') into requested from unnest(p_ids) id where id is not null;
 select coalesce(array_agg(s.id order by s.id),'{}') into permitted from public.students s
 where s.id=any(requested) and public.can_view_student_learning(s.id);
 if permitted<>requested or array_position(p_ids,null) is not null then return jsonb_build_object('supported',false); end if;
 return jsonb_build_object('supported',true,'data',jsonb_build_array(${pageQueries.join(',')}));
end $$;
revoke all on function ${signature} from public,anon;
grant execute on function ${signature} to authenticated;
commit;
notify pgrst,'reload schema';`;
const report = { at: new Date().toISOString(), environment: 'isolated local PostgREST; synthetic accounts only', cases: [], checks: [], restored: false,
  limitation: 'Attempt reads only, with static fixtures. Not a full dashboard, concurrent student writes, legacy-role matrix, hosted latency or 10,000-user capacity proof. No application integration.' };
const newClient = () => createClient(config.API_URL, config.ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const args = (ids, limit = 500, after = [null, null, null]) => ({ p_ids: ids, p_after: after, p_limit: limit });
const idsFor = group => group.students.map(s => s.studentId);
// Drain all requests before throwing so cleanup never races an unfinished read.
async function settled(tasks) {
  const outcomes = await Promise.allSettled(tasks);
  for (const result of outcomes) if (result.status === 'rejected') throw result.reason;
  return outcomes.map(result => result.value);
}
async function snapshot(client, ids, candidate, limit = 500) {
  const start = performance.now();
  let requests = 0;
  const rows = [[], [], []];
  if (candidate) {
    const after = [null, null, null], done = [false, false, false];
    for (let page = 0; ; page++) {
      assert(page < 10000, 'Pagination must terminate');
      const result = await client.rpc(name, args(ids, limit, after)); requests++;
      assert.equal(result.error, null); assert.equal(result.data.supported, true);
      for (let i = 0; i < 3; i++) {
        const batch = result.data.data[i];
        assert(batch.length <= limit);
        if (!done[i]) {
          rows[i].push(...batch);
          if (batch.length) after[i] = batch.at(-1).id;
          done[i] = batch.length < limit;
        }
      }
      if (done.every(Boolean)) break;
    }
  } else {
    await settled(tables.map(async (table, i) => {
      let after = null;
      for (let page = 0; ; page++) {
        assert(page < 10000, 'Pagination must terminate');
        let query = client.from(table).select(`id,${columns[i]}`).in('student_id', ids).order('id').limit(limit);
        if (i === 0) query = query.eq('completed', true);
        if (after) query = query.gt('id', after);
        const result = await query; requests++;
        assert.equal(result.error, null);
        rows[i].push(...result.data);
        if (result.data.length < limit) break;
        after = result.data.at(-1).id;
      }
    }));
  }
  for (const batch of rows) {
    assert.equal(new Set(batch.map(row => row.id)).size, batch.length, 'No duplicate rows across pages');
    assert(batch.every(row => ids.includes(row.student_id)), 'No foreign student rows');
  }
  return { ms: performance.now() - start, requests, rows };
}

export { config, groups, name, signature, setup, sql, snapshot, settled, newClient, idsFor };

async function main() {
  assert.equal(sql(`select to_regprocedure('${signature}') is null;`), 't', 'Never overwrite an existing function');
  try {
    sql(setup);
    const teachers = [];
    for (const group of groups) {
      const client = newClient();
      const login = await client.auth.signInWithPassword({ email: group.email, password: group.password });
      assert.equal(login.error, null);
      teachers.push({ client, ids: idsFor(group) });
    }
    const first = teachers[0];
    const anonymous = await newClient().rpc(name, args(first.ids));
    assert.equal(anonymous.error?.code, '42501'); report.checks.push('anonymous execute denied');
    for (const scope of [[...first.ids, teachers[1].ids[0]], [null], ['ffffffff-ffff-ffff-ffff-ffffffffffff']]) {
      const response = await first.client.rpc(name, args(scope));
      assert.equal(response.error, null); assert.deepEqual(response.data, { supported: false });
    }
    report.checks.push('mixed-school, null and unknown scopes return no data');
    for (const invalid of [args(null), args(Array(501).fill(first.ids[0])), args(first.ids, 501), args(first.ids, 0), args(first.ids, 500, [])]) {
      const response = await first.client.rpc(name, invalid);
      assert.equal(response.error?.code, '22023');
    }
    report.checks.push('invalid scope, page size and cursor shape rejected');
    const empty = await first.client.rpc(name, args([]));
    assert.equal(empty.error, null); assert.deepEqual(empty.data, { supported: true, data: [[], [], []] });
    const small = await snapshot(first.client, first.ids, true, 37);
    const baseline = await snapshot(first.client, first.ids, false, 500);
    assert.deepEqual(small.rows, baseline.rows);
    assert(small.requests > 1);
    assert.deepEqual((await snapshot(first.client, [...first.ids, ...first.ids], true)).rows, baseline.rows);
    report.checks.push('empty and duplicate scopes; 37-row pages match full direct RLS results');
    report.pagination = { rows: baseline.rows.map(rows => rows.length), smallPageRequests: small.requests };
    for (const concurrency of [1, 4, 20]) {
      const samples = { direct: [], scoped: [] };
      for (let round = 0; round < 3; round++) {
        const paired = {};
        for (const mode of round % 2 ? ['scoped', 'direct'] : ['direct', 'scoped']) {
          paired[mode] = await settled(teachers.slice(0, concurrency).map(t => snapshot(t.client, t.ids, mode === 'scoped')));
          samples[mode].push(...paired[mode]);
        }
        paired.direct.forEach((value, i) => assert.deepEqual(paired.scoped[i].rows, value.rows, 'Complete result sets must match direct RLS'));
      }
      const summary = { concurrency };
      for (const mode of ['direct', 'scoped']) {
        const times = samples[mode].map(s => s.ms).sort((a,b) => a-b);
        summary[mode] = { snapshots: times.length, p95Ms: Math.round(times[Math.ceil(times.length * .95)-1]), maximumMs: Math.round(times.at(-1)), requests: samples[mode].reduce((n,s) => n+s.requests, 0) };
      }
      report.cases.push(summary); console.log(JSON.stringify(summary));
    }
  } finally {
    sql(`drop function if exists ${signature}; notify pgrst,'reload schema';`);
    assert.equal(sql(`select to_regprocedure('${signature}') is null;`), 't');
    report.restored = true;
    fs.writeFileSync(`${localDir}/scoped-attempts-http-result.json`, JSON.stringify(report,null,2)+'\n');
  }
  console.log(JSON.stringify({ passed: true, checks: report.checks, restored: report.restored }));

}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
