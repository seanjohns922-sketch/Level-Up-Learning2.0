import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// Exercise the actual page loader with controlled network completion order.
const source = fs.readFileSync('app/teacher/dashboard/page.tsx', 'utf8');
const ast = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true);
let loader;
function find(node) {
  if (ts.isFunctionDeclaration(node) && node.name?.text === 'loadClassData') loader = node.getText(ast);
  ts.forEachChild(node, find);
}
find(ast);
assert(loader);
const compiled = ts.transpileModule(loader, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const deferred = () => { let resolve; let reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const settle = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
function harness() {
  const state = { students: [], progress: [], activity: [], loading: true, error: null };
  const selectedClassRef = { current: 'a' }, classLoadVersionRef = { current: 0 }, classLoadRef = { current: null };
  const reads = [], realms = [];
  const supabase = { from(table) {
    assert(['students', 'live_student_activity'].includes(table), `Unexpected dashboard read: ${table}`);
    const d = deferred();
    const query = { select() { return this; }, eq() { return this; }, is() { return this; }, in() { return this; }, then(...args) { return d.promise.then(...args); } };
    reads.push({ table, ...d }); return query;
  } };
  const env = {
    selectedClassRef, classLoadVersionRef, classLoadRef, supabase,
    LIVE_REALM_IDS: ['number', 'measurement', 'space', 'pattern', 'statistics', 'chance'],
    fetchRealmCompatProgressForClass(realm, classId) { const d = deferred(); realms.push({ realm, classId, ...d }); return d.promise; },
    setStudents: value => { state.students = typeof value === 'function' ? value(state.students) : value; }, setProgress: value => { state.progress = typeof value === 'function' ? value(state.progress) : value; },
    setLiveRows: value => { state.activity = typeof value === 'function' ? value(state.activity) : value; }, setProgressLoading: value => { state.loading = value; },
    setProgressLoadError: value => { state.error = value; },
    console: { warn() {} },
  };
  const load = new Function(...Object.keys(env), `${compiled}\nreturn loadClassData;`)(...Object.values(env));
  return { state, load, reads, realms, selectedClassRef };
}
{
  const h = harness(), first = h.load('a', false);
  h.reads[0].resolve({ data: [{ id: 'student-a' }], error: null }); await settle();
  assert.equal(h.state.loading, true);
  assert.equal(h.state.students.length, 1, 'roster arrives before progress');
  assert.equal(h.realms.length, 6);
  assert.strictEqual(h.load('a', true), first, 'focus/poll refreshes share in-flight work');
  assert.equal(h.reads.length, 2);
  h.realms.forEach(r => r.resolve([{ student_id: 'student-a', realm_id: r.realm }])); await settle();
  assert.equal(h.state.progress.length, 6, 'all canonical realms publish while activity is still pending');
  assert.equal(h.state.loading, false, 'slow live activity never holds the progress spinner');
  h.reads[1].resolve({ data: [{ student_id: 'student-a' }], error: null }); await first;
  assert.equal(h.state.activity.length, 1);
  const refresh = h.load('a', true);
  assert.equal(h.state.progress.length, 6, 'background refresh retains visible results');
  h.reads[2].resolve({ data: [], error: null }); await refresh;
  assert.deepEqual(h.state.progress, [], 'empty roster clears previous progress');
  assert.deepEqual(h.state.activity, []);
}
{
  const h = harness(), old = h.load('a', false);
  h.reads[0].resolve({ data: [{ id: 'old' }], error: null }); await settle();
  h.selectedClassRef.current = 'b'; const next = h.load('b', false);
  h.reads[2].resolve({ data: [{ id: 'new' }], error: null }); await settle();
  h.realms.filter(r => r.classId === 'b').forEach(r => r.resolve([{ student_id: 'new' }]));
  h.reads[3].resolve({ data: [{ student_id: 'new' }], error: null }); await next;
  h.realms.filter(r => r.classId === 'a').forEach(r => r.resolve([{ student_id: 'old' }]));
  h.reads[1].resolve({ data: [{ student_id: 'old' }], error: null }); await old;
  assert(h.state.progress.every(r => r.student_id === 'new'), 'previous class cannot overwrite current progress');
  assert.equal(h.state.activity[0].student_id, 'new');
}
{
  const h = harness(), first = h.load('a', false);
  h.reads[0].resolve({ data: [{ id: 'student-a' }], error: null }); await settle();
  const edited = h.load('a', false);
  h.reads[2].resolve({ data: [], error: null }); await edited;
  h.realms.forEach(r => r.resolve([{ student_id: 'stale-before-edit' }]));
  h.reads[1].resolve({ data: [{ student_id: 'stale-before-edit' }], error: null }); await first;
  assert.deepEqual(h.state.progress, [], 'explicit edit refresh supersedes older read of the same class');
}
{
  const h = harness(), first = h.load('a', false);
  h.reads[0].resolve({ data: [{ id: 'student-a' }], error: null }); await settle();
  h.realms[0].reject(new Error('progress offline'));
  h.realms.slice(1).forEach(r => r.resolve([]));
  await settle();
  assert.equal(h.state.loading, false);
  assert.equal(h.state.error, 'progress offline');
  h.reads[1].resolve({ data: [{ student_id: 'student-a' }], error: null }); await first;
  assert.equal(h.state.activity.length, 1, 'progress failure does not discard independent live status');
}
assert(!source.includes('fetchLiveClassEvents'), 'unused paginated event history must not return to roster load');
assert(source.includes('progressLoading={progressLoading}'));
assert(source.includes('progressAvailable={!progressLoading && !progressLoadError}'));
const panel = fs.readFileSync('components/teacher/StrandStudentsPanel.tsx', 'utf8');
assert(panel.includes('Loading student progress…'));
assert(panel.indexOf('{progressLoading ? (') < panel.indexOf('studentRows.map('), 'loading must replace false unplaced rows');
console.log('PASS: independent progress, no event-history read, deduplicated polling, stale-class/edit responses, empty classes, errors and honest loading state.');

// Execute the actual focus/visibility and polling effects with controlled browser
// events. The loader tests above separately cover shared in-flight work.
const refreshEffects = [];
function findRefreshEffects(node) {
  if (ts.isCallExpression(node) && node.expression.getText(ast) === 'useEffect') {
    const callback = node.arguments[0];
    const text = callback?.getText(ast) ?? '';
    if (text.includes('function handleFocus()') || text.includes('const currentClassId = selectedClassRef.current')) {
      refreshEffects.push(text);
    }
  }
  ts.forEachChild(node, findRefreshEffects);
}
findRefreshEffects(ast);
assert.equal(refreshEffects.length, 2, 'Both dashboard refresh effects are exercised');
{
  const events = new Map(), timers = new Map(), requests = [];
  let timerId = 0;
  const selectedClassRef = { current: 'a' };
  const target = prefix => ({
    addEventListener(type, handler) { events.set(`${prefix}:${type}`, handler); },
    removeEventListener(type, handler) {
      assert.equal(events.get(`${prefix}:${type}`), handler);
      events.delete(`${prefix}:${type}`);
    },
  });
  const document = { ...target('document'), visibilityState: 'hidden' };
  const window = { ...target('window'),
    setInterval(handler, delay) { assert.equal(delay, 30000); timers.set(++timerId, handler); return timerId; },
    clearInterval(id) { timers.delete(id); },
  };
  const env = { document, window, selectedClassRef, loadClassData: (id, background) => requests.push({ id, background }) };
  const cleanups = refreshEffects.map(effect => {
    const code = ts.transpileModule(`const effect = ${effect};`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
    return new Function(...Object.keys(env), `${code}\nreturn effect();`)(...Object.values(env));
  });
  const poll = () => timers.forEach(handler => handler());
  poll();
  events.get('window:focus')();
  events.get('document:visibilitychange')();
  assert.equal(requests.length, 0, 'Hidden tabs do not poll or refresh on focus');
  document.visibilityState = 'visible';
  events.get('document:visibilitychange')();
  assert.deepEqual(requests, [{ id: 'a', background: true }], 'Visibility alone reconciles current class');
  poll();
  assert.equal(requests.length, 2, 'Visible polling remains enabled');
  selectedClassRef.current = 'b';
  events.get('window:focus')();
  assert.deepEqual(requests.at(-1), { id: 'b', background: true }, 'Stable listener reads the newly selected class');
  selectedClassRef.current = null;
  poll();
  events.get('document:visibilitychange')();
  assert.equal(requests.length, 3, 'No selection produces no reads');
  cleanups.forEach(cleanup => cleanup());
  assert.equal(events.size, 0, 'All browser listeners are removed');
  assert.equal(timers.size, 0, 'Poll timer is removed');
}
console.log('PASS dashboard hidden-tab pause, return refresh, current class selection and listener cleanup.');
