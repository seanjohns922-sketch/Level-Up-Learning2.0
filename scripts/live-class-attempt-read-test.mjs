import assert from 'node:assert/strict';
import { fetchLiveClassAttempts } from '../lib/live-class-attempts.ts';
import { fetchClassRealmHistory } from '../lib/class-realm-history.ts';

const id = n => `00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
const rows = Array.from({ length: 1207 }, (_, i) => ({ id: id(i+1), student_id: 'ours', completed: true, correct_count: i%10 }));
function fixture({ data = rows, cap = 137, failAt, mutate, malformed } = {}) {
  const calls = [];
  const client = { from(table) {
    const filters = {}, call = { table, filters };
    const chain = {
      select(value) { call.projection = value; return chain; },
      in(key,value) { filters[key] = value; return chain; },
      eq(key,value) { filters[key] = value; return chain; },
      order(key,options) { assert.equal(key,'id'); call.ascending = options.ascending; return chain; },
      limit(value) { call.limit = value; return chain; },
      lte(key,value) { assert.equal(key,'id'); call.through = value; return chain; },
      gt(key,value) { assert.equal(key,'id'); call.after = value; return chain; },
      async then(resolve,reject) {
        try {
          call.rpcParams = chain.rpcParams;
          calls.push(call);
          mutate?.(calls.length, data);
          if (calls.length === failAt) return resolve({ data: null, error: { code: '42501' } });
          let result = data.filter(row => filters.student_id.includes(row.student_id) &&
            (filters.completed === undefined || row.completed === filters.completed) &&
            (filters.realm_id === undefined || row.realm_id === filters.realm_id) &&
            (!call.after || row.id>call.after) && (!call.through || row.id<=call.through));
          result = result.toSorted((a,b) => a.id.localeCompare(b.id) * (call.ascending ? 1 : -1)).slice(0, Math.min(cap,call.limit));
          if (malformed && calls.length > 1) result = malformed;
          return resolve({ data: result, error: null });
        } catch (error) { return reject(error); }
      },
    };
    return chain;
  }, rpc(name, params) { const chain = this.from(name); chain.rpcParams = params; return chain; } };
  return { client, calls };
}
for (const table of ['student_lesson_attempts','student_weekly_quiz_attempts','student_realm_assessments']) {
  const test = fixture();
  const result = await fetchLiveClassAttempts(test.client, table, ['ours']);
  assert.equal(result.error,null); assert.deepEqual(result.data,rows);
  assert(test.calls.length>3, 'Read beyond the default API cap, including short pages');
  assert(test.calls.every(c => c.table === table && c.filters.student_id[0] === 'ours'));
  assert(test.calls.every(c => c.filters.completed === (table === 'student_lesson_attempts' ? true : undefined)));
}
const empty = fixture();
// Full-sized summary pages reduce round trips while still draining all history.
for (const cap of [500, 1000]) {
  const test = fixture({cap});
  assert.deepEqual((await fetchLiveClassAttempts(test.client,'student_lesson_attempts',['ours'])).data,rows);
  assert.equal(test.calls.length, cap === 1000 ? 3 : 4, 'Bounded head plus complete pages, including a lower server cap');
}
const largePageFailure = fixture({cap:1000,failAt:3});
assert.equal((await fetchLiveClassAttempts(largePageFailure.client,'student_lesson_attempts',['ours'])).data,null,'Failure after a full summary page must not expose partial results');
// Report details must survive pagination without increasing routine class payloads.
const reportRows = rows.map(row => ({ ...row, question_results: [{ correct: true, curriculum_codes: ['AC9M3N01'] }] }));
const report = fixture({ data: reportRows });
assert.deepEqual((await fetchLiveClassAttempts(report.client,'student_realm_assessments',['ours'],()=>true,{includeQuestionResults:true})).data,reportRows);
assert(report.calls.slice(1).every(call => call.projection.includes('question_results')));
const detailedPages = fixture({data:reportRows,cap:1000});
assert.deepEqual((await fetchLiveClassAttempts(detailedPages.client,'student_realm_assessments',['ours'],()=>true,{includeQuestionResults:true})).data,reportRows);
assert.equal(detailedPages.calls.length,4,'Detailed answer payloads keep their smaller page bound');
const summary = fixture();
await fetchLiveClassAttempts(summary.client,'student_realm_assessments',['ours']);
assert(summary.calls.every(call => !call.projection.includes('question_results')));
const failedReport = fixture({data:reportRows,failAt:3});
assert.equal((await fetchLiveClassAttempts(failedReport.client,'student_realm_assessments',['ours'],()=>true,{includeQuestionResults:true})).data,null);
assert.deepEqual(await fetchLiveClassAttempts(empty.client,'student_lesson_attempts',[]),{data:[],error:null});
assert.equal(empty.calls.length,0,'Empty scope must not read all students');
for (const failAt of [1,3]) {
  const test = fixture({failAt});
  const result = await fetchLiveClassAttempts(test.client,'student_lesson_attempts',['ours']);
  assert.equal(result.error.code,'42501'); assert.equal(result.data,null);
  assert.equal(test.calls.length,failAt,'Access errors must not trigger fallback');
}
for (const malformed of [[rows[1],rows[0]], [rows[0],rows[0]], [{id:id(1),student_id:'foreign'}], [{student_id:'ours'}]]) {
  assert.equal((await fetchLiveClassAttempts(fixture({malformed}).client,'student_lesson_attempts',['ours'])).data,null);
}
let active = true;
const cancelled = fixture({ mutate: n => { if (n === 2) active = false; } });
assert.equal((await fetchLiveClassAttempts(cancelled.client,'student_lesson_attempts',['ours'],()=>active)).data,null);
assert.equal(cancelled.calls.length,2,'Class change stops further pages');
const changingRows = rows.slice();
const later = {...rows[0], id:id(2000)};
const changing = fixture({ data: changingRows, mutate: n => { if (n === 2) changingRows.push(later); } });
assert.deepEqual((await fetchLiveClassAttempts(changing.client,'student_lesson_attempts',['ours'])).data,rows,'Bounded refresh excludes newer upper IDs');
assert.deepEqual((await fetchLiveClassAttempts(changing.client,'student_lesson_attempts',['ours'])).data,[...rows,later],'Next refresh recovers writes');
const disappearing = fixture({ data: rows.slice(), mutate: (n,data) => { if (n === 2) data.pop(); } });
assert.equal((await fetchLiveClassAttempts(disappearing.client,'student_lesson_attempts',['ours'])).data.length,1206,'Deleted upper cursor terminates at an empty page');
const incomplete = fixture({ data: [...rows,{id:id(2000),student_id:'ours',completed:false}] });
assert.deepEqual((await fetchLiveClassAttempts(incomplete.client,'student_lesson_attempts',['ours'])).data,rows);
const transport = fixture({mutate: n => { if(n === 3) throw new Error('network unavailable'); }});
assert.equal((await fetchLiveClassAttempts(transport.client,'student_lesson_attempts',['ours'])).data,null);
console.log('PASS: complete scoped history across API caps, fixed upper bound, failed-page/transport protection, cancellation, malformed pages and concurrent-write recovery.');

const classRows = rows.map(row => ({...row, realm_id:'number', question_results:[{correct:true}], passed:true, placement_result:{week:2}, notes:'Retained override'}));
for (const [kind,endpoint] of Object.entries({lessons:'get_class_realm_lesson_attempts',quizzes:'get_class_realm_weekly_quiz_attempts',assessments:'student_realm_assessments',overrides:'student_progress_overrides'})) {
  const test = fixture({data:[...classRows,{...classRows[0],id:id(2001),realm_id:'space'},{...classRows[0],id:id(2002),student_id:'foreign'}]});
  const result = await fetchClassRealmHistory(test.client,kind,'class-a','number',['ours']);
  assert.deepEqual(result.data,classRows,`${kind} complete history retains detailed fields`);
  assert(test.calls.every(call => call.table===endpoint && call.filters.realm_id==='number' && call.filters.student_id[0]==='ours'));
  if (kind==='lessons' || kind==='quizzes') assert(test.calls.every(call => call.rpcParams.p_class_id==='class-a' && call.rpcParams.p_realm_id==='number'));
  else assert(test.calls.slice(1).every(call => call.projection.includes(kind==='assessments'?'placement_result,question_results':'teacher_id,reason,notes')));
  const failed = fixture({data:classRows,failAt:3});
  assert.equal((await fetchClassRealmHistory(failed.client,kind,'class-a','number',['ours'])).data,null);
  const emptyClass = fixture();
  assert.deepEqual(await fetchClassRealmHistory(emptyClass.client,kind,'class-a','number',[]),{data:[],error:null});
  assert.equal(emptyClass.calls.length,0);
}
console.log('PASS: all four canonical class history sources page completely, retain details and scope, and fail without partial data.');
