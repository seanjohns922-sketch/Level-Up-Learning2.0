// Isolated local read workload with temporary repeated-attempt event fixtures.
// Run from the checkout containing .local-archive/scale-local; never uses hosted data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { fetchLiveClassEvents } from '../../lib/live-class-events.ts';
import { localConfig, localDir } from './local-config.mjs';

const config = localConfig();
const reportPath = path.join(localDir, 'compact-dashboard-load-result.json');
const groups = Array.from({ length: 20 }, (_, index) => JSON.parse(fs.readFileSync(
  path.join(localDir, `synthetic-accounts${index ? `-${index + 1}` : ''}.json`), 'utf8')));
process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'));
const { api } = await import('../test-support/live-class-reducers.mjs');
const signature = 'public.get_live_class_compact_event_page_secure(uuid,uuid[],text[],timestamptz,uuid,timestamptz,uuid)';
function sql(input) {
  try {
    return execFileSync('docker', ['exec', '-i', 'supabase_db_reliq-scale-local', 'psql', '-X', '-q', '-U', 'postgres', '-d', 'postgres', '-At', '-v', 'ON_ERROR_STOP=1'],
      { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 1024 * 1024 }).trim();
  } catch (error) {
    throw new Error(`Local SQL failed: ${String(error.stderr ?? error.message).slice(-2000)}`);
  }
}
const eventTypes = ['activity_started', 'lesson_started', 'quiz_started', 'question_loaded', 'answer_correct', 'answer_incorrect', 'hint_used', 'lesson_completed', 'quiz_completed', 'idle_detected'];
const sources = ['presence', 'events', 'lessons', 'quizzes', 'assessments', 'dailyActivity'];
const report = { at: new Date().toISOString(), environment: 'isolated local synthetic data', students: groups.reduce((n, g) => n + g.students.length, 0), cases: [], restored: false };
assert.equal(sql(`select to_regprocedure('${signature}') is null and to_regprocedure('public.live_event_has_activity_context(jsonb)') is null;`), 't', 'Never overwrite existing functions');
const teachers = [];
const runId = randomUUID();
const fixtureStudents = groups.flatMap(g => g.students.map(s => {
  assert.match(g.classId, /^[0-9a-f-]{36}$/i);
  assert.match(s.studentId, /^[0-9a-f-]{36}$/i);
  return `('${g.classId}'::uuid,'${s.studentId}'::uuid)`;
})).join(',');
try {
  sql(fs.readFileSync('supabase/migrations/20261118120000_compact_live_class_event_reads.sql', 'utf8'));
  // Ten attempts at the same lesson; only the latest eleven events are needed.
  // Every inserted row carries this run's random marker for precise cleanup.
  sql(`insert into public.live_activity_events(id,class_id,student_id,event_type,created_at,payload)
    select gen_random_uuid(),s.class_id,s.student_id,
      case when step=0 then 'lesson_started' when step%2=0 then 'answer_correct' else 'answer_incorrect' end,
      now() + ((attempt*11+step)::text || ' milliseconds')::interval,
      jsonb_build_object('loadTestRun','${runId}','lessonId','compact-load-lesson','lessonTitle','Synthetic repeated lesson','week',1,'realmId','number-nexus','questionIndex',step,'questionId','q-'||step)
    from (values ${fixtureStudents}) s(class_id,student_id)
    cross join generate_series(0,9) attempt cross join generate_series(0,10) step;`);
  report.syntheticEventsAdded = groups.reduce((n,g) => n + g.students.length * 110, 0);
  sql("notify pgrst, 'reload schema';");
  for (const group of groups) {
    const counter = { requests: 0 };
    const client = createClient(config.API_URL, config.ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (...args) => { counter.requests++; return fetch(...args); } } });
    assert.equal((await client.auth.signInWithPassword({ email: group.email, password: group.password })).error, null);
    teachers.push({ client, group, counter });
  }
  // Refuse a silent old-RPC fallback: this benchmark must measure the new endpoint.
  const ready = await teachers[0].client.rpc('get_live_class_compact_event_page_secure', {
    p_class_id: groups[0].classId, p_through_created_at: '2099-01-01', p_through_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
  }).limit(1);
  assert.equal(ready.error, null, 'Compact RPC must be present in the API schema cache');

  async function snapshot(teacher, compact) {
    const { client, group, counter } = teacher;
    const ids = group.students.map(s => s.studentId), allowed = new Set(ids);
    const requests = counter.requests, start = performance.now();
    const sourceMs = {};
    const results = await Promise.all([
      client.from('live_student_activity').select('*').eq('class_id', group.classId).order('last_active_at', { ascending: false }),
      fetchLiveClassEvents(client, { classId: group.classId, eventTypes, compact }),
      client.from('student_lesson_attempts').select('student_id,realm_id,working_level,week,lesson,lesson_id,attempt_no,correct_count,total_questions,accuracy_percent,completed,completed_at').in('student_id', ids).eq('completed', true),
      client.from('student_weekly_quiz_attempts').select('student_id,realm_id,working_level,week,quiz_id,attempt_no,correct_count,total_questions,accuracy_percent,completed_at').in('student_id', ids),
      client.from('student_realm_assessments').select('student_id,realm_id,working_level,assessment_type,correct_count,total_questions,score_percent,completed_at').in('student_id', ids),
      client.rpc('get_live_class_activity_today', { p_class_id: group.classId }),
    ].map(async (request, index) => {
      const result = await request;
      sourceMs[sources[index]] = performance.now() - start;
      return result;
    }));
    const elapsedMs = performance.now() - start;
    for (const result of results) { assert.equal(result.error, null); assert.ok(Array.isArray(result.data)); }
    for (const result of results) assert.ok(result.data.every(row => allowed.has(row.student_id)), 'No cross-class student data');
    for (const result of [results[0], ...results.slice(2, 5)]) assert.equal(new Set(result.data.map(row => row.student_id)).size, ids.length, 'Every student retains canonical evidence');
    assert.ok(results[1].data.every(row => row.class_id === group.classId));
    assert.equal(results[1].data.filter(e => e.payload?.loadTestRun === runId).length,
      ids.length * (compact ? 11 : 110), 'Every student retains the expected repeated-attempt events');
    const projection = ids.map(id => {
      const events = results[1].data.filter(e => e.student_id === id);
      const row = api.resolveCurrentActivityRow({ id, class_id: group.classId }, results[0].data.find(r => r.student_id === id), events, [], results[5].data.find(r => r.student_id === id));
      return { row, performance: api.buildCurrentLessonPerformance(row, events) };
    });
    return { elapsedMs, requests: counter.requests - requests, rows: results[1].data.length,
      bytes: Buffer.byteLength(JSON.stringify(results[1].data)), sourceMs, projection };
  }

  for (const concurrency of [1, 4, 20]) {
    const samples = { full: [], compact: [] };
    for (let round = 0; round < 3; round++) {
      const paired = {};
      for (const mode of round % 2 ? ['compact', 'full'] : ['full', 'compact']) {
        const outcomes = await Promise.allSettled(teachers.slice(0, concurrency).map(t => snapshot(t, mode === 'compact')));
        // Await every request before cleanup, even when one teacher fails.
        for (const outcome of outcomes) if (outcome.status === 'rejected') throw outcome.reason;
        paired[mode] = outcomes.map(o => o.value);
        samples[mode].push(...paired[mode]);
      }
      paired.full.forEach((before, index) => assert.deepEqual(paired.compact[index].projection, before.projection, 'Current activity and scores must match full history'));
    }
    const summary = { concurrency, rounds: 3 };
    for (const mode of ['full', 'compact']) {
      const rows = samples[mode], times = rows.map(r => r.elapsedMs).sort((a, b) => a - b);
      summary[mode] = { snapshots: rows.length, p95Ms: Math.round(times[Math.ceil(times.length * .95) - 1]),
        maximumMs: Math.round(times.at(-1)), requests: rows.reduce((n, r) => n + r.requests, 0),
        eventRows: rows.reduce((n, r) => n + r.rows, 0), eventBytes: rows.reduce((n, r) => n + r.bytes, 0),
        sourceP95Ms: Object.fromEntries(sources.map(source => {
          const timings = rows.map(r => r.sourceMs[source]).sort((a,b) => a-b);
          return [source, Math.round(timings[Math.ceil(timings.length * .95) - 1])];
        })) };
    }
    summary.passedLatencyGate = summary.compact.p95Ms < 1000 && summary.compact.maximumMs < 3000;
    report.cases.push(summary);
    console.log(JSON.stringify(summary));
  }
  report.equivalencePassed = true;
  report.passed = report.cases.every(c => c.passedLatencyGate);
} catch (error) {
  report.error = error.message;
  report.passed = false;
  throw error;
} finally {
  sql(`begin; delete from public.live_activity_events where payload->>'loadTestRun'='${runId}'; drop function if exists ${signature}; drop function if exists public.live_event_has_activity_context(jsonb); notify pgrst, 'reload schema'; commit;`);
  report.restored = sql(`select to_regprocedure('${signature}') is null and to_regprocedure('public.live_event_has_activity_context(jsonb)') is null;`) === 't';
  assert.equal(sql(`select count(*) from public.live_activity_events where payload->>'loadTestRun'='${runId}';`), '0');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
}
if (!report.passed) process.exitCode = 1;
