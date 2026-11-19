// Exercise the production event reader against isolated synthetic HTTP data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { createLiveClassEventReader } from '../../lib/live-class-events.ts';
import { config, groups, sql, snapshot, settled, idsFor } from './scoped-attempts-http-local.mjs';
import { localDir } from './local-config.mjs';

const index = 'reliq_probe_students_class_id_idx';
const signatures = ['public.get_live_class_compact_event_page_secure(uuid,uuid[],text[],timestamptz,uuid,timestamptz,uuid)', 'public.live_event_has_activity_context(jsonb)'];
const eventTypes = ['activity_started','lesson_started','quiz_started','question_loaded','answer_correct','answer_incorrect','hint_used','lesson_completed','quiz_completed','idle_detected'];
const run = randomUUID();
const report = { at: new Date().toISOString(), teachers: 20, studentsPerMode: 20, phases: [], correctnessPassed: false, temporaryObjectsRemoved: false,
  limitations: ['Uses the actual event-reader cache, with controlled read/invalidate triggers, not browser timers, coalescing, WebSocket delivery or rendering.', 'Attempt queries are fully paginated; current UI queries are unpaginated. This is not a complete replica of the shipped panel.', 'Two sequential local modes, baseline then indexed; not a 10,000-user capacity test. Synthetic completions/events/sessions remain local.'] };
const stats = values => {
  const sorted = values.toSorted((a,b) => a-b);
  return { count: sorted.length, p95Ms: Math.round(sorted[Math.ceil(sorted.length*.95)-1]), maxMs: Math.round(sorted.at(-1)) };
};
async function rpc(name, args, session) {
  const response = await fetch(`${config.API_URL}/rest/v1/rpc/${name}`, { method: 'POST',
    headers: { apikey: config.ANON_KEY, Authorization: `Bearer ${config.ANON_KEY}`, 'Content-Type': 'application/json', ...(session ? { 'x-student-session': session } : {}) },
    body: JSON.stringify(args), signal: AbortSignal.timeout(30000) });
  const body = await response.text(), data = body ? JSON.parse(body) : null;
  assert(response.ok, `${name}: HTTP ${response.status}, ${data?.code}`);
  return data;
}
const readers = [];
for (const signature of signatures) assert.equal(sql(`select to_regprocedure('${signature}') is null;`), 't');
assert.equal(sql(`select to_regclass('public.${index}') is null;`), 't');
try {
  sql(fs.readFileSync(fileURLToPath(new URL('../../supabase/migrations/20261118120000_compact_live_class_event_reads.sql', import.meta.url)), 'utf8'));
  sql("notify pgrst,'reload schema';");
  const teachers = [];
  for (const group of groups) {
    const counter = { events: 0 };
    const client = createClient(config.API_URL, config.ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false }, global: {
      fetch: (input, init) => {
        const url = typeof input === 'string' ? input : input.url ?? String(input);
        if (url.includes('/live_activity_events') || url.includes('/rpc/get_live_class_compact_event_page_secure')) counter.events++;
        return fetch(input, init);
      },
    } });
    assert.equal((await client.auth.signInWithPassword({ email: group.email, password: group.password })).error, null);
    const student = group.students[0];
    const login = await rpc('student_login_lookup', { p_class_id: group.classId, p_display_name: student.username, p_pin: student.pin });
    assert.equal(login[0].student_id, student.studentId);
    teachers.push({ group, client, counter, student, session: login[0].session_token, ids: idsFor(group) });
  }
  assert.equal((await teachers[0].client.rpc('get_live_class_compact_event_page_secure', {
    p_class_id: groups[0].classId, p_through_created_at: '2099-01-01', p_through_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
  }).limit(1)).error, null, 'Do not benchmark a missing-endpoint fallback');

  for (const mode of ['baseline','indexed']) {
    if (mode === 'indexed') sql(`create index ${index} on public.students(class_id);`);
    for (const teacher of teachers) {
      teacher.reader = createLiveClassEventReader(teacher.client, { classId: teacher.group.classId, studentIds: teacher.ids, eventTypes, compact: true });
      readers.push(teacher.reader);
    }
    async function phase(label) {
      const values = await settled(teachers.map(async teacher => {
        const start = performance.now(), requests = teacher.counter.events;
        const [attempts, events, presence, daily] = await settled([
          snapshot(teacher.client, teacher.ids, false), teacher.reader.read(),
          teacher.client.from('live_student_activity').select('*').eq('class_id', teacher.group.classId),
          teacher.client.rpc('get_live_class_activity_today', { p_class_id: teacher.group.classId }),
        ]);
        for (const result of [events, presence, daily]) {
          assert.equal(result.error, null); assert(Array.isArray(result.data));
          assert(result.data.every(row => teacher.ids.includes(row.student_id)));
        }
        assert.equal(new Set(events.data.map(row => row.id)).size, events.data.length, 'Cache must not duplicate events');
        if (label === 'quiet') assert.deepEqual(events.data, teacher.initialEvents);
        if (label === 'initial') teacher.initialEvents = events.data;
        if (label === 'changed' || label === 'reconnected') {
          assert.equal(events.data.filter(row => row.payload?.incremental_run === run && row.payload?.mode === mode).length, 1, 'New event survives incremental/recovery reads');
          assert(attempts.rows[0].some(row => row.student_id === teacher.student.studentId && row.lesson_id === teacher.lessonId && row.correct_count === 9 && row.total_questions === 10), 'Teacher sees the new canonical result');
          if (label === 'changed') teacher.changedAttempts = attempts.rows;
          else assert.deepEqual(attempts.rows, teacher.changedAttempts);
        }
        return { ms: performance.now()-start, eventRequests: teacher.counter.events-requests };
      }));
      const entry = { mode, phase: label, ...stats(values.map(v => v.ms)), eventRequests: values.reduce((n,v) => n+v.eventRequests,0) };
      if (label === 'quiet') assert.equal(entry.eventRequests, teachers.length, 'Unchanged history should need only one head read per teacher');
      report.phases.push(entry); console.log(JSON.stringify(entry));
    }
    await phase('initial');
    await phase('quiet');
    const nextRefreshAt = Date.now()+30000;
    await settled(teachers.map(async teacher => {
      teacher.lessonId = `incremental-${run}-${mode}`;
      const args = { p_student_id: teacher.student.studentId, p_class_id: teacher.group.classId, p_realm_id: 'number', p_working_level: 'Year 4', p_program_key: 'year4-number', p_school_year_level: 'Year 4',
        p_week: 1, p_lesson: 1, p_lesson_id: teacher.lessonId, p_completion_key: randomUUID(), p_xp: 0,
        p_attempt: { questionsAnswered: 10, correctAnswers: 9, completed: true, incremental_run: run, mode } };
      await settled([rpc('complete_realm_lesson', args, teacher.session), rpc('complete_realm_lesson', args, teacher.session)]);
      await rpc('insert_live_activity_event_secure', { p_student_id: teacher.student.studentId, p_class_id: teacher.group.classId, p_session_id: null, p_event_type: 'lesson_completed',
        p_payload: { incremental_run: run, mode, lessonId: teacher.lessonId, week: 1, realmId: 'number' } }, teacher.session);
    }));
    await new Promise(resolve => setTimeout(resolve, Math.max(0,nextRefreshAt-Date.now())));
    await phase('changed');
    for (const teacher of teachers) teacher.reader.invalidate();
    await phase('reconnected');
    for (const teacher of teachers) teacher.reader.dispose();
  }
  assert.equal(Number(sql(`select count(*) from public.student_lesson_attempts where summary->>'incremental_run'='${run}' and completed and correct_count=9 and total_questions=10;`)), 40);
  assert.equal(Number(sql(`select count(*) from public.student_lesson_attempts where summary->>'incremental_run'='${run}';`)), 40);
  report.correctnessPassed = true;
  report.latencyPassed = report.phases.filter(p => p.mode === 'indexed').every(p => p.p95Ms<1000 && p.maxMs<3000);
} catch (error) {
  report.error = error.message; throw error;
} finally {
  for (const reader of readers) reader.dispose();
  sql(`drop index if exists public.${index}; drop function if exists ${signatures[0]}; drop function if exists ${signatures[1]}; notify pgrst,'reload schema';`);
  report.temporaryObjectsRemoved = sql(`select to_regclass('public.${index}') is null and to_regprocedure('${signatures[0]}') is null and to_regprocedure('${signatures[1]}') is null;`) === 't';
  assert(report.temporaryObjectsRemoved);
  fs.writeFileSync(`${localDir}/incremental-dashboard-result.json`, JSON.stringify(report,null,2)+'\n');
}
if (!report.latencyPassed) process.exitCode = 1;
