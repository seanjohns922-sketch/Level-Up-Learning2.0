// Rollback-only SQL prototype. Not an application endpoint or migration.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { localConfig, localDir } from './local-config.mjs';
localConfig();
const groups = Array.from({ length: 20 }, (_, i) => JSON.parse(fs.readFileSync(`${localDir}/synthetic-accounts${i ? `-${i + 1}` : ''}.json`, 'utf8')));
const uuid = value => { assert.match(value, /^[0-9a-f-]{36}$/i); return `'${value}'::uuid`; };
const tables = ['student_lesson_attempts', 'student_weekly_quiz_attempts', 'student_realm_assessments'];
const columns = [
  'id,student_id,realm_id,working_level,week,lesson,lesson_id,attempt_no,correct_count,total_questions,accuracy_percent,completed,completed_at',
  'id,student_id,realm_id,working_level,week,quiz_id,attempt_no,correct_count,total_questions,accuracy_percent,completed_at',
  'id,student_id,realm_id,working_level,assessment_type,correct_count,total_questions,score_percent,completed_at',
];
const query = (index, scope) => `select ${columns[index]} from public.${tables[index]} where student_id=any(${scope})${index === 0 ? ' and completed=true' : ''}`;
const aggregate = q => `(select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) from (${q}) t)`;
const combined = scope => `jsonb_build_array(${tables.map((_, i) => aggregate(query(i, scope))).join(',')})`;
function sql(input) {
  try {
    return execFileSync('docker', ['exec', '-i', 'supabase_db_reliq-scale-local', 'psql', '-X', '-qAt', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'],
      { input, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (error) { throw new Error(String(error.stderr ?? error.message).slice(-2000)); }
}
// No persistent objects: pg_temp disappears with the connection, and every
// fixture permission change rolls back even if an assertion aborts the session.
const setup = `begin; set local statement_timeout='30s';
create function pg_temp.scoped_attempts(ids uuid[]) returns jsonb
language plpgsql stable security definer set search_path=public,pg_temp as $$
declare permitted uuid[]; requested uuid[];
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if ids is null or cardinality(ids)>500 then raise exception 'Explicit bounded scope required' using errcode='22023'; end if;
 select coalesce(array_agg(distinct id order by id),'{}') into requested from unnest(ids) id where id is not null;
 select coalesce(array_agg(s.id order by s.id),'{}') into permitted from public.students s
 where s.id=any(requested) and public.can_view_student_learning(s.id);
 -- Do not return partial data. Legacy/unsupported scopes must use original RLS.
 if permitted <> requested or array_position(ids,null) is not null then
  return jsonb_build_object('supported',false);
 end if;
 return jsonb_build_object('supported',true,'data',${combined('permitted')});
end $$;
revoke all on function pg_temp.scoped_attempts(uuid[]) from public;
grant execute on function pg_temp.scoped_attempts(uuid[]) to authenticated;
create function pg_temp.check_scope(ids uuid[], label text, candidate_first boolean default false) returns jsonb
language plpgsql security invoker as $$
declare original jsonb; candidate jsonb; started timestamptz; old_ms numeric; new_ms numeric;
begin
 if candidate_first then
  started:=clock_timestamp(); candidate:=pg_temp.scoped_attempts(ids);
  new_ms:=extract(epoch from clock_timestamp()-started)*1000;
 end if;
 started:=clock_timestamp(); select ${combined('ids')} into original;
 old_ms:=extract(epoch from clock_timestamp()-started)*1000;
 if not candidate_first then
  started:=clock_timestamp(); candidate:=pg_temp.scoped_attempts(ids);
  new_ms:=extract(epoch from clock_timestamp()-started)*1000;
 end if;
 if (candidate->>'supported')::boolean then
  assert candidate->'data'=original, 'Scoped reads must match direct RLS exactly';
 else
  assert not candidate ? 'data', 'Unsupported scope must not expose data';
 end if;
 return jsonb_build_object('label',label,'supported',candidate->'supported','rows',jsonb_build_array(jsonb_array_length(original->0),jsonb_array_length(original->1),jsonb_array_length(original->2)),'baselineMs',old_ms,'candidateMs',new_ms);
end $$;
`;
const cases = [];
for (const [index, group] of groups.entries()) {
  const scope = `array[${group.students.map(s => uuid(s.studentId)).join(',')}]`;
  const foreign = uuid(groups[(index + 1) % groups.length].students[0].studentId);
  const claims = `set local role authenticated; select set_config('request.jwt.claim.sub',${uuid(group.teacherId)}::text,true);`;
  let script = setup + claims;
  for (let round = 0; round < 4; round++) script += `select pg_temp.check_scope(${scope},'teacher-${index + 1}-round-${round + 1}',${round % 2 === 1});`;
  script += `select pg_temp.check_scope(${scope}||array[${foreign}],'mixed-school-${index + 1}');
select pg_temp.check_scope('{}'::uuid[],'empty-${index + 1}');
select pg_temp.check_scope(${scope}||${scope},'duplicates-${index + 1}');
rollback;`;
  cases.push(...sql(script).split('\n').filter(line => line.startsWith('{')).map(line => JSON.parse(line)));
}
// Change only existing synthetic memberships, inside one rollback transaction.
const g = groups[0], scope = `array[${g.students.map(s => uuid(s.studentId)).join(',')}]`;
let roles = setup + `select set_config('request.jwt.claim.sub',${uuid(g.teacherId)}::text,true);`;
for (const role of ['support_staff', 'principal', 'school_admin']) {
  roles += `reset role; update public.school_memberships set role='${role}' where user_id=${uuid(g.teacherId)} and school_id=${uuid(g.schoolId)};
set local role authenticated; select pg_temp.check_scope(${scope},'${role}');`;
}
roles += `reset role; update public.school_memberships set status='inactive' where user_id=${uuid(g.teacherId)} and school_id=${uuid(g.schoolId)};
set local role authenticated; select pg_temp.check_scope(${scope},'revoked');
reset role; insert into public.platform_roles(user_id,role,status) values(${uuid(g.teacherId)},'platform_admin','active');
set local role authenticated;
select pg_temp.check_scope(array[${uuid(groups[1].students[0].studentId)}],'platform-admin-cross-school');
select pg_temp.check_scope(array[null::uuid],'null-element');
select pg_temp.check_scope(array['ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid],'unknown-student');
do $$ begin
 begin perform pg_temp.scoped_attempts(null); raise exception 'Expected null scope rejection'; exception when invalid_parameter_value then null; end;
 begin perform pg_temp.scoped_attempts(array_fill(${uuid(g.students[0].studentId)},array[501])); raise exception 'Expected scope size rejection'; exception when invalid_parameter_value then null; end;
end $$;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 begin perform pg_temp.scoped_attempts('{}'); raise exception 'Expected authentication denial'; exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin assert not has_function_privilege('anon','pg_temp.scoped_attempts(uuid[])','execute'), 'No anonymous execute'; end $$;
rollback;`;
cases.push(...sql(roles).split('\n').filter(line => line.startsWith('{')).map(line => JSON.parse(line)));
// Independently exercise legacy ownership and individual assignment access.
// All fixture mutations roll back, including when any assertion fails.
const firstStudent = uuid(g.students[0].studentId);
const secondStudent = uuid(g.students[1].studentId);
const compatibility = setup + `
update public.class_staff_memberships set status='inactive' where user_id=${uuid(g.teacherId)};
select set_config('request.jwt.claim.sub',${uuid(g.teacherId)}::text,true);
set local role authenticated;
select pg_temp.check_scope(array[${firstStudent}],'legacy-owner-only');
reset role;
update public.classes set teacher_id=${uuid(groups[1].teacherId)} where id=${uuid(g.classId)};
set local role authenticated;
select pg_temp.check_scope(array[${firstStudent}],'no-canonical-or-legacy-access');
reset role;
insert into public.student_staff_assignments(student_id,school_id,user_id,role,status)
values(${firstStudent},${uuid(g.schoolId)},${uuid(g.teacherId)},'support_staff','active');
set local role authenticated;
select pg_temp.check_scope(array[${firstStudent}],'individual-assignment');
select pg_temp.check_scope(array[${firstStudent},${secondStudent}],'partial-individual-assignment');
reset role;
update public.student_staff_assignments set status='inactive' where student_id=${firstStudent} and user_id=${uuid(g.teacherId)};
set local role authenticated;
select pg_temp.check_scope(array[${firstStudent}],'individual-assignment-revoked');
reset role;
update public.student_staff_assignments set status='active' where student_id=${firstStudent} and user_id=${uuid(g.teacherId)};
set local role authenticated;
select pg_temp.check_scope(array[${firstStudent}],'individual-assignment-restored');
rollback;`;
const compatibilityCases = sql(compatibility).split('\n').filter(line => line.startsWith('{')).map(line => JSON.parse(line));
fs.writeFileSync(`${localDir}/scoped-attempts-compatibility-result.json`, JSON.stringify(compatibilityCases, null, 2) + '\n');
const byLabel = Object.fromEntries(compatibilityCases.map(row => [row.label, row]));
for (const label of ['partial-individual-assignment']) {
  assert.equal(byLabel[label].supported, false);
  assert.ok(byLabel[label].rows.every(n => n > 0), 'Fallback must preserve nonempty partial RLS results');
}
// Legacy attempt policy joins students, whose RLS still requires student access.
for (const label of ['legacy-owner-only','no-canonical-or-legacy-access','individual-assignment-revoked']) {
  assert.equal(byLabel[label].supported, false);
  assert.ok(byLabel[label].rows.every(n => n === 0), 'Revoked access must not retain old results');
}
for (const label of ['individual-assignment','individual-assignment-restored']) {
  assert.equal(byLabel[label].supported, true);
  assert.ok(byLabel[label].rows.every(n => n > 0));
}
cases.push(...compatibilityCases);
assert.equal(cases.length, 153);
assert(cases.filter(c => c.label.startsWith('teacher-')).every(c => c.supported));
assert(cases.filter(c => c.label.startsWith('mixed-school-') || c.label === 'revoked').every(c => !c.supported));
assert(cases.filter(c => ['support_staff','principal','school_admin','platform-admin-cross-school'].includes(c.label)).every(c => c.supported));
assert(cases.filter(c => ['null-element','unknown-student'].includes(c.label)).every(c => !c.supported));
const timings = cases.filter(c => c.label.startsWith('teacher-'));
const report = { at: new Date().toISOString(), environment: 'local rollback-only scoped attempt prototype', cases,
  baselineMeanMs: timings.reduce((n,c) => n + Number(c.baselineMs),0)/timings.length,
  candidateMeanMs: timings.reduce((n,c) => n + Number(c.candidateMs),0)/timings.length,
  limitation: 'SQL prototype only; unsupported scopes require original RLS reads. No HTTP endpoint, application integration, browser test or 10,000-user proof.' };
fs.writeFileSync(`${localDir}/scoped-attempts-result.json`, JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({ cases: cases.length, baselineMeanMs: report.baselineMeanMs, candidateMeanMs: report.candidateMeanMs, passed: true }));
