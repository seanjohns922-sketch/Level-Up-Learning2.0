import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { localConfig, localDir } from './local-config.mjs';
const config = localConfig(); // Fail closed outside the known local fixture environment.
const f = JSON.parse(fs.readFileSync(`${localDir}/synthetic-accounts.json`, 'utf8'));
const vars = { teacher_id:f.teacherId, school_id:f.schoolId, class_id:f.classId, student_id:f.students[0].studentId, other_student_id:f.students[1].studentId };
for (const value of Object.values(vars)) if (!/^[0-9a-f-]{36}$/i.test(value)) throw new Error('Invalid synthetic fixture UUID');
const migration = fs.readFileSync('supabase/migrations/20261028150000_optimize_live_class_event_reads.sql', 'utf8') + fs.readFileSync('supabase/migrations/20261028170000_page_live_class_events.sql', 'utf8');
const sql = 'begin;\nset local statement_timeout=\'60s\';\n'
  + fs.readFileSync('supabase/manual/live-event-reads/test.sql', 'utf8') + '\nrollback;\n';
const args = ['exec','-i','supabase_db_reliq-scale-local','psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1', ...Object.entries(vars).flatMap(([key,value])=>['-v',`${key}=${value}`])];
// Install locally in a separate transaction, as a real migration would be.
const installed = spawnSync('docker', args, { input: 'begin;\n' + migration + '\ncommit;\nnotify pgrst, \'reload schema\';', encoding: 'utf8' });
if (installed.status !== 0) throw new Error(installed.stderr);
const result=spawnSync('docker',args,{input:sql,encoding:'utf8',maxBuffer:4*1024*1024});
if(result.status!==0){ console.error(result.stdout); console.error(result.stderr); process.exit(1); }
// Test the actual API boundary in a separate connection (no SET ROLE switching).
async function request(path, body, token = config.ANON_KEY) {
  const response = await fetch(config.API_URL + path, {
    method: 'POST', headers: { apikey: config.ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, data: await response.json() };
}
const login = await request('/auth/v1/token?grant_type=password', { email: f.email, password: f.password });
if (login.status !== 200 || !login.data.access_token) throw new Error('Local fixture login failed');
const endpoint = '/rest/v1/rpc/get_live_class_events_secure';
const allowed = await request(endpoint, { p_class_id: f.classId, p_limit: 15 }, login.data.access_token);
if (allowed.status !== 200 || !Array.isArray(allowed.data)) throw new Error(`Teacher API read failed: ${allowed.status} ${allowed.data.code}`);
const denied = await request(endpoint, { p_class_id: '00000000-0000-0000-0000-000000009002' }, login.data.access_token);
if (denied.status !== 403 || denied.data.code !== '42501') throw new Error('Unrelated class API denial failed');
const anon = await request(endpoint, { p_class_id: f.classId });
if (![401,403].includes(anon.status) || anon.data.code !== '42501') throw new Error(`Anonymous API denial failed: ${anon.status} ${anon.data.code}`);
const pageEndpoint = '/rest/v1/rpc/get_live_class_event_page_secure';
const pageArgs = {p_class_id:f.classId,p_through_created_at:'2099-01-01T00:00:00Z',p_through_id:'ffffffff-ffff-ffff-ffff-ffffffffffff'};
const pageAllowed = await request(pageEndpoint,pageArgs,login.data.access_token);
if(pageAllowed.status!==200 || pageAllowed.data.length!==500) throw new Error('Expected a complete authenticated page');
const invalidCursor = await request(pageEndpoint,{...pageArgs,p_after_id:'ffffffff-ffff-ffff-ffff-ffffffffffff'},login.data.access_token);
if(invalidCursor.status!==400 || invalidCursor.data.code!=='22023') throw new Error('Incomplete cursor rejection failed');
const emptyPage = await request(pageEndpoint,{...pageArgs,p_student_ids:[]},login.data.access_token);
if(emptyPage.status!==200 || emptyPage.data.length!==0) throw new Error('Empty page filter failed');
const pageDenied = await request(pageEndpoint,{...pageArgs,p_class_id:'00000000-0000-0000-0000-000000009002'},login.data.access_token);
if(pageDenied.status!==403 || pageDenied.data.code!=='42501') throw new Error('Page class denial failed');
const pageAnon = await request(pageEndpoint,pageArgs);
if(![401,403].includes(pageAnon.status) || pageAnon.data.code!=='42501') throw new Error('Anonymous page denial failed');
console.log('PASS: event-row parity, dashboard/timeline ordering, empty filters, teacher/support/principal/admin/legacy scopes, revoked access, missing identity, and real API teacher/unauthorised/anonymous access checks. Fixtures rolled back; migration installed only locally.');
