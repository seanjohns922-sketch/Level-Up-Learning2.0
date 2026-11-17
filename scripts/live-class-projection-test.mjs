// Design probe only: no production reader, SQL, permissions or data is changed.
import assert from 'node:assert/strict';
import { api } from './test-support/live-class-reducers.mjs';
export const fixtures = [];

// Proposed two-stage selection: first find the latest meaningful activity event,
// resolve activity using the unchanged presence/canonical/daily rules, then read
// that activity's latest attempt. This still starts with full history in the probe.
function project(student, row, events, attempts, daily) {
  const latest = events.filter(event => {
    const payload = api.parseEventPayload(event.payload);
    return event.student_id === student.id && (api.positiveNumberOrNull(payload.week) != null || api.stringOrNull(payload.lessonId) != null);
  }).sort((a, b) => api.timestampMs(b.created_at) - api.timestampMs(a.created_at))[0];
  const resolved = api.resolveCurrentActivityRow(student, row, latest ? [latest] : [], attempts, daily);
  const matching = resolved ? events.filter(event => api.matchesCurrentLesson(resolved, event))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) : [];
  let start = 0;
  for (let i = matching.length - 1; i >= 0; i--) {
    if (['lesson_started', 'quiz_started'].includes(matching[i].event_type)) { start = i; break; }
  }
  const selected = new Set(matching.slice(start));
  if (latest) selected.add(latest);
  // Preserve the database ordering, including equal timestamps.
  return events.filter(event => selected.has(event));
}
const student = { id: 'student', class_id: 'class' };
const at = n => new Date(Date.UTC(2026, 0, 1) + n * 1000).toISOString();
let sequence = 0, comparisons = 0;
const event = (type, time, payload = {}, id = 'student') => ({ id: `event-${String(sequence++).padStart(6, '0')}`, student_id: id, class_id: 'class', event_type: type, created_at: at(time), payload });
function compare(label, events, row = null, attempts = [], daily = null) {
  const compact = project(student, row, events, attempts, daily);
  const originalRow = api.resolveCurrentActivityRow(student, row, events, attempts, daily);
  const compactRow = api.resolveCurrentActivityRow(student, row, compact, attempts, daily);
  assert.deepEqual(compactRow, originalRow, `${label}: current activity`);
  assert.deepEqual(api.buildCurrentLessonPerformance(compactRow, compact), api.buildCurrentLessonPerformance(originalRow, events), `${label}: score and attempt`);
  assert(compact.every(e => e.student_id === student.id), `${label}: student boundary`);
  fixtures.push({ label, student, row, events, attempts, daily });
  comparisons++;
  return compact;
}
const history = [];
for (let attempt = 0; attempt < 100; attempt++) {
  history.push(event('lesson_started', attempt * 20, { lessonId: 'lesson-a', week: 1 }));
  for (let q = 0; q < 10; q++) history.push(event(q % 2 ? 'answer_incorrect' : 'answer_correct', attempt * 20 + q + 1, { lessonId: 'lesson-a', questionId: `q${q}`, week: 1 }));
}
const compact = compare('100 repeated attempts', history);
assert.equal(compact.length, 11, 'Latest attempt is retained completely, not capped');
assert.deepEqual(api.buildCurrentLessonPerformance(api.resolveCurrentActivityRow(student, null, history, [], null), history), { answered: 10, correct: 5, accuracy: 50, completed: false });

compare('empty', []);
assert.equal(compare('no start retains all current-lesson answers', history.filter(e => e.event_type !== 'lesson_started')).length, 1000, 'Missing starts must not silently cap or discard historical answers');
const longAttempt = [event('lesson_started', 0, { lessonId: 'long' }), ...Array.from({ length: 1200 }, (_, i) => event('answer_correct', i + 1, { lessonId: 'long', questionId: `q${i}` }))];
assert.equal(compare('long attempt crosses API page boundaries', longAttempt).length, 1201, 'Even a compact attempt requires complete pagination');
compare('no meaningful activity keeps row fallback', [event('hint_used', 1, { lessonTitle: 'Title' })], { student_id: student.id, current_lesson_title: 'Title', questions_answered: 4, correct_count: 3 });
compare('daily-only activity', [], null, [], { updated_at: at(50) });
compare('completed canonical activity supersedes telemetry', history, null, [{ student_id: student.id, completed: true, completed_at: at(3000), activity_type: 'quiz', quiz_id: 'quiz-b', realm_id: 'number', working_level: 'Year 4', week: 2, total_questions: 10, correct_count: 8, accuracy_percent: 80, attempt_no: 2 }]);
compare('old meaningful event before title-only restart', [event('answer_correct', 1, { week: 1, lessonTitle: 'Title' }), event('lesson_started', 2, { lessonTitle: 'Title' }), event('answer_incorrect', 3, { lessonTitle: 'Title', questionText: 'Q' })]);
compare('duplicate answers and same-title distinct quizzes', [event('quiz_started', 1, { lessonId: 'quiz-a', lessonTitle: 'Weekly Quiz' }), event('answer_correct', 2, { lessonId: 'quiz-a', questionId: 'q' }), event('quiz_started', 3, { lessonId: 'quiz-b', lessonTitle: 'Weekly Quiz' }), event('answer_incorrect', 4, { lessonId: 'quiz-b', questionId: 'q' }), event('answer_correct', 5, { lessonId: 'quiz-b', questionId: 'q' })]);

// Deterministic adversarial mixtures: tied/backdated events, missing starts,
// empty payloads, metadata-only events, title fallback and cross-student rows.
let seed = 7937;
const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
const types = ['lesson_started', 'quiz_started', 'answer_correct', 'answer_incorrect', 'lesson_completed', 'quiz_completed', 'hint_used', 'question_loaded'];
for (let trial = 0; trial < 400; trial++) {
  const events = Array.from({ length: 80 }, () => {
    const payload = random(5) ? { lessonId: random(3) ? `lesson-${random(3)}` : '', lessonTitle: 'Shared title', questionId: `q${random(5)}`, questionsAnswered: random(12), correctCount: random(10) } : null;
    return event(types[random(types.length)], random(25), payload, random(5) ? 'student' : 'other');
  }).sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
  const row = trial % 2 ? { student_id: student.id, current_lesson: trial % 3 ? 'lesson-1' : null, current_lesson_title: 'Shared title', updated_at: at(10), questions_answered: 6, correct_count: 4, current_lesson_status: trial % 4 ? 'active' : 'completed' } : null;
  compare(`generated case ${trial}`, events, row);
}
console.log(JSON.stringify({ comparisons, repeatedAttemptHistory: history.length, selectedEvents: compact.length,
  fullBytes: Buffer.byteLength(JSON.stringify(history)), selectedBytes: Buffer.byteLength(JSON.stringify(compact)),
  limitation: 'In-memory selection proof only; no server query, request reduction, authorization or browser performance claim.' }, null, 2));
