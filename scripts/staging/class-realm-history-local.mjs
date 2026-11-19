// Read-only integration check against existing synthetic local fixtures.
import assert from 'node:assert/strict';
import { fetchClassRealmHistory } from '../../lib/class-realm-history.ts';
import { groups, newClient, idsFor } from './scoped-attempts-http-local.mjs';
const tables = { lessons:'student_lesson_attempts', quizzes:'student_weekly_quiz_attempts', assessments:'student_realm_assessments', overrides:'student_progress_overrides' };
const cases = [];
for (const group of groups.slice(0,2)) {
  const client = newClient();
  assert.equal((await client.auth.signInWithPassword({email:group.email,password:group.password})).error,null);
  const counts = {};
  for (const [kind,table] of Object.entries(tables)) {
    const result = await fetchClassRealmHistory(client,kind,group.classId,'number',idsFor(group));
    assert.equal(result.error,null);
    const expected = [];
    for (;;) {
      const page = await client.from(table).select('*').in('student_id',idsFor(group)).eq('realm_id','number').order('id').range(expected.length,expected.length+499);
      assert.equal(page.error,null);
      if (!page.data.length) break;
      expected.push(...page.data);
    }
    assert.deepEqual(result.data.map(row=>row.id),expected.map(row=>row.id));
    result.data.forEach((row,i)=>Object.keys(row).forEach(key=>assert.deepEqual(row[key],expected[i][key])));
    const foreign = groups.find(other=>other.classId!==group.classId);
    const denied = await fetchClassRealmHistory(client,kind,foreign.classId,'number',idsFor(foreign));
    assert.equal(denied.error,null); assert.deepEqual(denied.data,[]);
    counts[kind] = result.data.length;
  }
  cases.push(counts);
}
assert(cases.some(row=>row.lessons>1000),'Must exercise real API cap');
console.log(JSON.stringify({passed:true,teachers:cases.length,counts:cases,foreignScopeChecks:8,limitations:'Local static fixtures, not hosted capacity or browser verification'}));
