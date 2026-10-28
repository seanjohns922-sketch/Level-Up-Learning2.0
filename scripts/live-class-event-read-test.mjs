import assert from 'node:assert/strict';
import { fetchLiveClassEvents } from '../lib/live-class-events.ts';

function clientWith(error) {
  const calls = [];
  const rows = [{ id: 'synthetic-event' }];
  function builder(result, label) {
    const chain = { then: (resolve, reject) => Promise.resolve(result).then(resolve, reject) };
    for (const method of ['select', 'eq', 'in', 'order', 'limit']) chain[method] = (...args) => { calls.push([label, method, ...args]); return chain; };
    return chain;
  }
  const client = {
    rpc(name, args) { calls.push(['rpc', name, args]); return builder({ data: error ? null : rows, error }, 'rpc'); },
    from(table) { calls.push(['from', table]); return builder({ data: rows, error: null }, 'legacy'); },
  };
  return { client, calls, rows };
}
const options = { classId: 'synthetic-class', studentIds: ['synthetic-student'], eventTypes: ['answer_correct'], newestFirst: true, limit: 15 };
const success = clientWith(null);
assert.equal((await fetchLiveClassEvents(success.client, options)).data, success.rows);
assert.equal(success.calls.filter(call => call[0] === 'from').length, 0);
assert.deepEqual(success.calls[0][2], { p_class_id:options.classId, p_student_ids:options.studentIds, p_event_types:options.eventTypes, p_newest_first:true, p_limit:15 });
const absent = clientWith({ code: 'PGRST202' });
assert.equal((await fetchLiveClassEvents(absent.client, options)).data, absent.rows);
for (const expected of [
  ['legacy','eq','class_id',options.classId], ['legacy','in','student_id',options.studentIds],
  ['legacy','in','event_type',options.eventTypes], ['legacy','order','created_at',{ascending:false}], ['legacy','limit',15],
]) assert.ok(absent.calls.some(call => JSON.stringify(call)===JSON.stringify(expected)), `fallback preserves ${expected[1]}`);
for (const code of ['42501','57014','42883','PGRST301']) {
  const denied = clientWith({code});
  assert.equal((await fetchLiveClassEvents(denied.client, options)).error.code, code);
  assert.ok(!denied.calls.some(call=>call[0]==='from'), 'Access, timeout and other errors must not trigger fallback');
}
const empty = clientWith({code:'PGRST202'});
await fetchLiveClassEvents(empty.client, {classId:options.classId,studentIds:[],eventTypes:[]});
assert.deepEqual(empty.calls[0][2].p_student_ids,[]);
assert.deepEqual(empty.calls[0][2].p_event_types,[]);
assert.equal(empty.calls[0][2].p_limit,null,'No new cap on classroom history');
assert.ok(!empty.calls.some(call=>call[1]==='limit'));
assert.ok(empty.calls.some(call=>call[0]==='legacy'&&call[1]==='in'&&call[2]==='student_id'&&call[3].length===0));
console.log('PASS: RPC filters/order, explicit timeline limit, unchanged history cap, rollout fallback and fail-closed error handling.');
