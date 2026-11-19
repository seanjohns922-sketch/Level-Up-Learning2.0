// Synthetic local workload only. Completion fixtures remain for later rehearsals.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { fetchLiveClassEvents } from '../../lib/live-class-events.ts';
import { localDir } from './local-config.mjs';
import { config, groups, name, signature, setup, sql, snapshot, settled, newClient, idsFor } from './scoped-attempts-http-local.mjs';

const compactSignature = 'public.get_live_class_compact_event_page_secure(uuid,uuid[],text[],timestamptz,uuid,timestamptz,uuid)';
const helperSignature = 'public.live_event_has_activity_context(jsonb)';
const run = randomUUID();
const eventTypes = ['activity_started','lesson_started','quiz_started','question_loaded','answer_correct','answer_incorrect','hint_used','lesson_completed','quiz_completed','idle_detected'];
const report = { at: new Date().toISOString(), teachers: 20, studentsWriting: 100, rounds: [], passedCorrectness: false, temporaryFunctionsRemoved: false,
  limitation: 'Local synthetic six-source HTTP snapshots; no browser/realtime rendering or 10,000-user proof. Student completions and login sessions remain in the isolated fixture database. Both modes use compact events; only attempt reads differ.' };
const stats = values => {
  const sorted = values.toSorted((a,b) => a-b);
  return { samples: sorted.length, p95Ms: Math.round(sorted[Math.ceil(sorted.length*.95)-1] ?? 0), maximumMs: Math.round(sorted.at(-1) ?? 0) };
};
async function studentRpc(endpoint, args, session, denied = false) {
  const response = await fetch(`${config.API_URL}/rest/v1/rpc/${endpoint}`, {
    method: 'POST', headers: { apikey: config.ANON_KEY, Authorization: `Bearer ${config.ANON_KEY}`, 'Content-Type': 'application/json', ...(session ? { 'x-student-session': session } : {}) },
    body: JSON.stringify(args), signal: AbortSignal.timeout(30000),
  });
  const body = await response.text();
  const data = body ? JSON.parse(body) : null;
  if (!response.ok && data?.code !== '42501') throw new Error(`${endpoint}: HTTP ${response.status}, ${data?.code ?? 'unknown'}`);
  if (denied) { assert.equal(data?.code, '42501'); assert(!response.ok); }
  else assert(response.ok, `${endpoint}: HTTP ${response.status}, ${data?.code}`);
  return data;
}
async function dashboard(teacher, candidate) {
  const start = performance.now(), allowed = new Set(teacher.ids);
  const sourceMs = {};
  const sources = ['attempts', 'presence', 'events', 'daily'];
  const [attempts, presence, events, daily] = await settled([
    snapshot(teacher.client, teacher.ids, candidate),
    teacher.client.from('live_student_activity').select('*').eq('class_id', teacher.group.classId),
    fetchLiveClassEvents(teacher.client, { classId: teacher.group.classId, eventTypes, compact: true }),
    teacher.client.rpc('get_live_class_activity_today', { p_class_id: teacher.group.classId }),
  ].map(async (request, i) => {
    const result = await request;
    sourceMs[sources[i]] = performance.now()-start;
    return result;
  }));
  for (const result of [presence, events, daily]) {
    assert.equal(result.error, null); assert(Array.isArray(result.data));
    assert(result.data.every(row => allowed.has(row.student_id)), 'No cross-class data');
  }
  assert(events.data.every(row => row.class_id === teacher.group.classId));
  return { start, end: performance.now(), ms: performance.now()-start, sourceMs, attempts: attempts.rows };
}

for (const sig of [signature, compactSignature, helperSignature]) assert.equal(sql(`select to_regprocedure('${sig}') is null;`), 't', 'Never overwrite existing functions');
try {
  sql(setup);
  sql(fs.readFileSync(fileURLToPath(new URL('../../supabase/migrations/20261118120000_compact_live_class_event_reads.sql', import.meta.url)), 'utf8'));
  sql("notify pgrst,'reload schema';");
  const teachers = [];
  for (const group of groups) {
    const client = newClient();
    assert.equal((await client.auth.signInWithPassword({ email: group.email, password: group.password })).error, null);
    teachers.push({ client, group, ids: idsFor(group) });
  }
  // Explicitly require both prototypes; a missing-RPC fallback invalidates this test.
  assert.equal((await teachers[0].client.rpc(name, { p_ids: [], p_after: [null,null,null], p_limit: 1 })).error, null);
  assert.equal((await teachers[0].client.rpc('get_live_class_compact_event_page_secure', {
    p_class_id: groups[0].classId, p_through_created_at: '2099-01-01', p_through_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
  }).limit(1)).error, null);
  const students = [];
  // Login is outside measured traffic; this experiment is not a login burst test.
  for (const group of groups) {
    students.push(...await settled(group.students.slice(0,5).map(async student => {
      const login = await studentRpc('student_login_lookup', { p_class_id: group.classId, p_display_name: student.username, p_pin: student.pin });
      assert.equal(login[0].student_id, student.studentId);
      return { student, group, session: login[0].session_token };
    })));
  }
  let denied = 0, verified = 0;
  for (let round = 0; round < 2; round++) {
    for (const mode of round % 2 ? ['scoped','direct'] : ['direct','scoped']) {
      const writeTimes = [];
      const completedReads = [];
      const writeStart = performance.now();
      let writeEnd;
      const writes = settled(students.map(async ({ student, group, session }) => {
        const args = { p_student_id: student.studentId, p_class_id: group.classId, p_realm_id: 'number', p_working_level: 'Year 4', p_program_key: 'year4-number', p_school_year_level: 'Year 4',
          p_week: 1, p_lesson: 1, p_lesson_id: 'capacity-year4-w1-l1', p_completion_key: randomUUID(), p_xp: 0,
          p_attempt: { questionsAnswered: 10, correctAnswers: 9, completed: true, mixed_run: run, mixed_round: round, mixed_mode: mode } };
        await studentRpc('complete_realm_lesson', args, null, true); denied++;
        await studentRpc('complete_realm_lesson', { ...args, p_student_id: group.students[5].studentId }, session, true); denied++;
        const started = performance.now();
        await settled([studentRpc('complete_realm_lesson', args, session), studentRpc('complete_realm_lesson', args, session)]);
        writeTimes.push(performance.now()-started);
        await studentRpc('insert_live_activity_event_secure', { p_student_id: student.studentId, p_class_id: group.classId, p_session_id: null,
          p_event_type: 'lesson_completed', p_payload: { mixed_run: run, lessonId: args.p_lesson_id, week: 1, realmId: 'number' } }, session);
      })).finally(() => { writeEnd = performance.now(); });
      const reads = settled(teachers.map(async teacher => {
        const samples = [];
        for (let refresh = 0; refresh < 3; refresh++) {
          const sample = await dashboard(teacher, mode === 'scoped');
          samples.push(sample); completedReads.push(sample);
        }
        return samples;
      }));
      let batches;
      try { [, batches] = await settled([writes, reads]); }
      catch (error) {
        report.failedRound = { round: round+1, mode, completedDashboardReads: stats(completedReads.map(s => s.ms)),
          sources: Object.fromEntries(['attempts','presence','events','daily'].map(source => [source, stats(completedReads.map(s => s.sourceMs[source]))])),
          completedSubmissionPairs: stats(writeTimes) };
        throw error;
      }
      const samples = batches.flat();
      const overlaps = samples.filter(sample => sample.start < writeEnd && sample.end > writeStart).length;
      assert(overlaps > 0, 'Reads must overlap writes');
      // Writes have drained. A fresh read must match complete direct RLS data.
      await settled(teachers.map(async teacher => {
        const [direct, scoped] = await settled([snapshot(teacher.client, teacher.ids, false), snapshot(teacher.client, teacher.ids, true)]);
        assert.deepEqual(scoped.rows, direct.rows, 'Post-write refresh must recover the complete canonical results');
      }));
      const saved = Number(sql(`select count(*) from public.student_lesson_attempts where summary->>'mixed_run'='${run}' and summary->>'mixed_round'='${round}' and summary->>'mixed_mode'='${mode}' and completed and correct_count=9 and total_questions=10;`));
      assert.equal(saved, students.length, 'One correct attempt per student despite duplicate submissions');
      assert.equal(Number(sql(`select count(distinct student_id) from public.student_lesson_attempts where summary->>'mixed_run'='${run}' and summary->>'mixed_round'='${round}' and summary->>'mixed_mode'='${mode}';`)), students.length);
      verified += saved;
      const result = { round: round+1, mode, dashboard: stats(samples.map(s => s.ms)),
        sources: Object.fromEntries(['attempts','presence','events','daily'].map(source => [source, stats(samples.map(s => s.sourceMs[source]))])),
        completionPair: stats(writeTimes), overlappingSnapshots: overlaps, verifiedCompletions: saved };
      report.rounds.push(result); console.log(JSON.stringify(result));
    }
  }
  assert.equal(denied, 800); assert.equal(verified, 400);
  assert.equal(Number(sql(`select count(*) from public.student_lesson_attempts where summary->>'mixed_run'='${run}';`)), 400);
  assert.equal(Number(sql(`select count(*) from public.live_activity_events where payload->>'mixed_run'='${run}';`)), 400);
  report.expectedDenials = denied; report.verifiedCompletions = verified;
  report.passedCorrectness = true;
  report.passedLatencyGate = report.rounds.every(r => r.mode !== 'scoped' || (r.dashboard.p95Ms < 1000 && r.dashboard.maximumMs < 3000 && r.completionPair.p95Ms < 1000));
} catch (error) {
  report.error = error.message;
  throw error;
} finally {
  sql(`drop function if exists ${signature}; drop function if exists ${compactSignature}; drop function if exists ${helperSignature}; notify pgrst,'reload schema';`);
  report.temporaryFunctionsRemoved = [signature, compactSignature, helperSignature].every(sig => sql(`select to_regprocedure('${sig}') is null;`) === 't');
  assert(report.temporaryFunctionsRemoved);
  fs.writeFileSync(`${localDir}/scoped-dashboard-mixed-result.json`, JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({ passedCorrectness: report.passedCorrectness, passedLatencyGate: report.passedLatencyGate, temporaryFunctionsRemoved: report.temporaryFunctionsRemoved }));
if (!report.passedLatencyGate) process.exitCode = 1;
