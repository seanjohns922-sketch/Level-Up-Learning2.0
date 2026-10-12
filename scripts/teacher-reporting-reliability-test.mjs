import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const read = file => fs.readFileSync(file, 'utf8');
function execute(source, names, bindings = {}) {
  bindings = { exports: {}, ...bindings };
  const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  return new Function(...Object.keys(bindings), `${code}; return {${names.join(',')}};`)(...Object.values(bindings));
}
const helperSource = read('lib/teacher/reporting-history.ts').replaceAll('export ', '');
const helpers = execute(helperSource, ['fetchReportingHistory', 'fetchReportingAttempts', 'createReportingRequestGate', 'reportingAttemptNumber', 'uniqueCompletionEvents']);
const now = new Date('2026-10-09T10:00:00.000Z');
const event = (id, overrides = {}) => ({ id, student_id: 'student', class_id: 'class-a', created_at: '2026-10-09T09:00:00.000Z', event_type: 'answer_correct', payload: {}, ...overrides });

// Model the API's filtering/order/cap, not the implementation's page loop.
function fakeClient(rows, { cap = 3, failPage = -1, afterPage = () => {} } = {}) {
  const calls = [];
  return { calls, from(table) {
    const filters = []; const orders = []; let cursor; let limit;
    const query = {
      select() { return query; },
      eq(k, v) { filters.push(row => row[k] === v); return query; },
      in(k, v) { filters.push(row => v.includes(row[k])); return query; },
      gte(k, v) { filters.push(row => row[k] >= v); return query; },
      lte(k, v) { filters.push(row => row[k] <= v); return query; },
      order(k, options) { orders.push([k, options.ascending]); return query; },
      limit(n) { limit = n; return query; },
      or(value) { cursor = value; return query; },
      async then(resolve, reject) {
        try {
          assert.ok(limit > 0 && limit <= 250, 'every request has an explicit page limit');
          calls.push({ table, cursor, orders, limit });
          if (calls.length === failPage) return resolve({ data: null, error: new Error('page failed') });
          let data = rows.filter(row => filters.every(filter => filter(row)));
          if (cursor) {
            const [, column, stamp] = /^(created_at|completed_at)\.lt\.([^,]+)/.exec(cursor);
            const [, id] = /id\.lt\.([^)]+)/.exec(cursor);
            data = data.filter(row => row[column] < stamp || (row[column] === stamp && row.id < id));
          }
          data.sort((a, b) => {
            for (const [key, asc] of orders) {
              const result = a[key].localeCompare(b[key]);
              if (result) return asc ? result : -result;
            }
            return 0;
          });
          const page = data.slice(0, Math.min(cap, limit));
          afterPage(calls.length, rows);
          return resolve({ data: page, error: null });
        } catch (error) { return reject(error); }
      },
    };
    return query;
  } };
}

const fixture = Array.from({ length: 8 }, (_, i) => event(String(i).padStart(3, '0')));
fixture.push(event('old', { created_at: '2026-09-01T00:00:00.000Z' }), event('foreign', { class_id: 'class-b' }));
const client = fakeClient(fixture, { afterPage(n, rows) { if (n === 1) rows.push(event('new', { created_at: '2026-10-09T10:00:01.000Z' })); } });
const history = await helpers.fetchReportingHistory(client, 'class-a', { now, eventTypes: ['answer_correct'] });
assert.deepEqual(history.map(x => x.id), ['000','001','002','003','004','005','006','007']);
assert.equal(client.calls.length, 4, 'short server-capped pages must not truncate history');
assert.deepEqual(client.calls[0].orders, [['created_at', false], ['id', false]]);
assert.equal((await helpers.fetchReportingHistory(fakeClient([]), 'class-a', { now, eventTypes: [] })).length, 0);
await assert.rejects(helpers.fetchReportingHistory(fakeClient(fixture, { failPage: 2 }), 'class-a', { now, eventTypes: ['answer_correct'] }), /page failed/);
let current = true;
await assert.rejects(helpers.fetchReportingHistory(fakeClient(fixture, { afterPage() { current = false; } }), 'class-a', { now, eventTypes: ['answer_correct'], isCurrent: () => current }), /superseded/);
const attempts = Array.from({ length: 9 }, (_, i) => ({ id: String(i), student_id: 'student', completed_at: '2020-01-01T00:00:00.000Z', completed: true, attempt_no: i + 1 }));
const saved = await helpers.fetchReportingAttempts(fakeClient(attempts), 'student_lesson_attempts', 'attempt_no', ['student'], () => true);
assert.equal(saved.length, 9, 'old saved attempts survive the history window and API cap');
assert.equal(Math.max(...saved.map(x => x.attempt_no)), 9);
console.log('PASS: bounded pagination, equal timestamps, insertion, empty pages, API caps, errors, cancellation and historical attempts');

const gate = helpers.createReportingRequestGate();
const first = gate.begin('class-a');
assert.equal(gate.begin('class-a'), null, 'poll, focus and realtime refreshes cannot overlap');
const second = gate.begin('class-b');
assert.equal(first.isCurrent(), false, 'old class response cannot commit');
first.finish();
assert.equal(gate.begin('class-b'), null, 'old finally cannot release new lease');
second.finish();
assert.ok(gate.begin('class-b'), 'success/failure release permits next poll');
gate.invalidate();
assert.equal(second.isCurrent(), false);
assert.ok(gate.begin('class-a'), 'new mount can refresh');
console.log('PASS: polling overlap, class switching, stale response and release/unmount handling');

// Run the dashboard's real refresh function with deferred database responses.
// This tests the consumer's finally/stale-response wiring as well as the gate.
const dashboard = read('app/teacher/dashboard/page.tsx');
const dashboardAst = ts.createSourceFile('dashboard.tsx', dashboard, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let loadSource;
function visit(node) {
  if (ts.isFunctionDeclaration(node) && node.name?.text === 'loadClassData') loadSource = node.getText(dashboardAst);
  ts.forEachChild(node, visit);
}
visit(dashboardAst);
const pending = new Map(); const rosterRequests = []; const renderedStudents = [];
const dashboardClient = { from(table) {
  let classId;
  const query = {
    select() { return query; },
    eq(key, value) { classId = value; return query; },
    in() { return query; },
    is() { rosterRequests.push(classId); return new Promise(resolve => pending.set(classId, resolve)); },
    then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve); },
  };
  assert.ok(['students', 'live_student_activity'].includes(table));
  return query;
} };
const noop = () => {};
const { loadClassData } = execute(loadSource, ['loadClassData'], {
  reportingGate: helpers.createReportingRequestGate(), classes: [], supabase: dashboardClient,
  console: { log: noop, warn: noop, error: noop }, LIVE_REALM_IDS: ['number'],
  fetchRealmCompatProgressForClass: async () => [], fetchReportingHistory: async () => [],
  setStudents: value => renderedStudents.push(typeof value === 'function' ? value([]) : value),
  setProgress: noop, setLiveRows: noop, setLiveEvents: noop, setProgressLoadError: noop, setHistoryUnavailable: noop,
});
const requestA = loadClassData('class-a', false);
await loadClassData('class-a', true);
assert.deepEqual(rosterRequests, ['class-a']);
const requestB = loadClassData('class-b', false);
pending.get('class-b')({ data: [{ id: 'student-b' }], error: null }); await requestB;
pending.get('class-a')({ data: [{ id: 'student-a' }], error: null }); await requestA;
assert.deepEqual(renderedStudents, [[{ id: 'student-b' }]], 'late old-class result cannot replace the new roster');
const failedRequest = loadClassData('class-b', true);
pending.get('class-b')({ data: null, error: new Error('transient') }); await failedRequest;
const retryRequest = loadClassData('class-b', true);
pending.get('class-b')({ data: [], error: null }); await retryRequest;
assert.equal(rosterRequests.length, 4, 'failed refresh releases the gate for retry');
console.log('PASS: actual dashboard overlap, late responses and failure/retry wiring');

// Execute the actual panel functions with only unrelated presentation mocked.
const panel = read('components/teacher/LiveClassPanel.tsx');
const ast = ts.createSourceFile('panel.tsx', panel, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const fnNames = ['lessonNumberFromRow', 'isQuizActivity', 'matchesCompletedAttempt', 'buildCompletedActivityAttemptSummary', 'toLiveCard'];
const fnSource = ast.statements.filter(n => ts.isFunctionDeclaration(n) && fnNames.includes(n.name?.text)).map(n => n.getText(ast)).join('\n');
const { buildCompletedActivityAttemptSummary, toLiveCard } = execute(fnSource, ['buildCompletedActivityAttemptSummary', 'toLiveCard'], {
  normalizeAttemptRealm: x => x === 'Number Nexus' ? 'number' : x,
  normalizeLearningScore: (correct, total) => ({ correct, total, accuracy: total ? Math.round(correct / total * 100) : 0 }),
  buildLiveStudentInsight: () => ({}), formatWorkingLevelBadge: x => x,
  reportingAttemptNumber: helpers.reportingAttemptNumber,
});
const student = { id: 'student', class_id: 'class-a', display_name: 'Fixture' };
const row = { student_id: 'student', current_strand: 'number', current_level: 'Year 7', current_week: 1, current_lesson: 'y7-w1-l2', current_lesson_status: 'active' };
const savedAttempt = { student_id: 'student', realm_id: 'number', working_level: 'Year 7', week: 1, lesson: 2, lesson_id: 'y7-w1-l2', activity_type: 'lesson', attempt_no: 2, correct_count: 7, total_questions: 8, completed_at: '2026-10-08T00:00:00Z' };
const summary = buildCompletedActivityAttemptSummary(row, [savedAttempt, { ...savedAttempt, student_id: 'other', attempt_no: 99 }, { ...savedAttempt, lesson: 3, lesson_id: 'y7-w1-l3', attempt_no: 50 }]);
for (const question of [1, 4, 15]) assert.equal(toLiveCard(student, { ...row, attempt_number: question }, null, summary).attemptNumber, 3);
assert.equal(toLiveCard(student, JSON.parse(JSON.stringify(row)), null, summary).attemptNumber, 3, 'reload does not invent another attempt');
assert.equal(toLiveCard(student, row, null, null).attemptNumber, 1);
assert.equal(toLiveCard(student, row, null, null, false).attemptNumber, null, 'failed history does not invent attempt 1');
const complete = toLiveCard(student, { ...row, current_lesson_status: 'completed', attempt_number: 8 }, null, summary);
assert.equal(complete.attemptNumber, 2);
assert.equal(complete.questionsAnswered, 8); assert.equal(complete.correctCount, 7); assert.equal(complete.accuracyPercent, 88);
assert.equal(toLiveCard(student, row, null, { ...summary, attemptNumber: 3 }).attemptNumber, 4, 'genuine next retry advances');
console.log('PASS: actual display uses canonical attempts across questions, reloads, retries and completed scoring');

const completion = (key, overrides = {}) => ({ event_type: 'lesson_completed', payload: { studentId: 'student', strand: 'number', level: 'Year 7', lessonId: 'y7-w1-l2', completionKey: key, ...overrides } });
assert.equal(helpers.uniqueCompletionEvents([completion('run-a'), completion('run-a')]).length, 1);
assert.equal(helpers.uniqueCompletionEvents([completion('run-a'), completion('run-b')]).length, 2);
assert.equal(helpers.uniqueCompletionEvents([completion('run-a'), completion('run-a', { studentId: 'other' })]).length, 2);
assert.equal(helpers.uniqueCompletionEvents([completion(undefined), completion(undefined)]).length, 2, 'do not erase ambiguous legacy history');
for (const file of ['components/lesson/Year2LessonEngine.tsx', 'components/PracticeRunner.tsx']) {
  const source = read(file);
  const start = source.indexOf('  const liveCompletionReported = useRef(false);');
  const end = source.indexOf('\n\n', source.indexOf('  }, [', start));
  const fragment = source.slice(start, end);
  let emitted = 0;
  const ref = { current: false };
  const run = (enabled, finished = true) => execute(fragment, [], {
    useRef: () => ref, useEffect: fn => fn(), finished, liveContext: { lessonId: 'fixture' }, reportLiveCompletion: enabled,
    trackLiveLearningEvent: () => { emitted++; }, correctAnswers: 7, questionsAnswered: 8, safeQuestionsAnswered: 8, completionMode: 'time_only', minutes: 9,
  });
  run(false); assert.equal(emitted, 0, 'route owns completion');
  run(true, false); assert.equal(emitted, 0);
  run(true); run(true); assert.equal(emitted, 1, 'rerender/StrictMode cannot emit twice');
}
const route = read('app/lesson/page.tsx');
assert.equal((route.match(/reportLiveCompletion=\{false\}/g) ?? []).length, 2);
assert.match(route, /eventType: "lesson_completed",\s*completionKey: getOrCreateLessonSessionId/);
assert.doesNotMatch(read('components/lesson/Year2LessonEngine.tsx'), /attemptNumber:.*questionsAnswered/);
console.log('PASS: one completion owner, effect replay guard, keyed timeline dedup and distinct retries');
