// Requires Docker. Only fictional records in a network-isolated container.
import { readFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const read = file => readFileSync(file,'utf8');
const source=read('supabase/migrations/20260812100000_platform_admin_pa4_identity_parent_home.sql');
const original=source.match(/create or replace function public.link_existing_student_to_school\([\s\S]*?\n\$\$;/)[0];
const migration=read('supabase/migrations/20261102160000_require_active_transfer_class.sql');
const fixed=migration.match(/create or replace function public.link_existing_student_to_school\([\s\S]*?\n\$\$;/)[0];
assert.equal(fixed.replace("\n      and status = 'active'\n    for share;",';').replace('Class is not active or available for this school year','Class is not available for this school year'),original);
const access=read('supabase/migrations/20260914133000_allow_school_teachers_manage_student_learning.sql').match(/create or replace function public.can_manage_school_student_learning\([\s\S]*?\n\$\$;/)[0];
const fixture=read('scripts/test-support/school-transfer-fixture.sql').replace('-- ACCESS_FUNCTION',()=>access);
const sql=fixture.replace('-- TRANSFER_FUNCTION',()=>fixed);
const change=statement=>sql.replace('SET LOCAL ROLE authenticated;',`${statement}\nSET LOCAL ROLE authenticated;`);
const container=`reliq-transfer-test-${process.pid}`;
function docker(args,input) {
 const r=spawnSync('docker',args,{input,encoding:'utf8',timeout:120000});
 if(r.error || r.status!==0) throw Error(r.error?.message || r.stderr || r.stdout);
 return r.stdout;
}
try {
 docker(['run','--detach','--name',container,'--network','none','--memory','512m','-e','POSTGRES_PASSWORD=fictional-only','postgres:17-alpine']);
 let ready=false;
 for(let i=0;i<40;i++) {
  if(spawnSync('docker',['exec',container,'pg_isready','-h','127.0.0.1','-U','postgres']).status===0){ready=true;break;}
  await new Promise(resolve=>setTimeout(resolve,500));
 }
 assert(ready);
 const psql=['exec','-i',container,'psql','-X','-U','postgres','-v','ON_ERROR_STOP=1'];
 const archivedClass="UPDATE classes SET status='archived' WHERE id='00000000-0000-0000-0000-000000000002';";
 // The old function accepts the same archived destination rejected by the fix.
 docker(psql,change(archivedClass).replace(fixed,()=>original));
 assert.throws(()=>docker(psql,change(archivedClass)),/Class is not active or available/);
 docker(psql,sql);
 const call=sql.split('\n').find(line=>line.startsWith('SELECT link_existing_student_to_school('));
 docker(psql,sql.replace(call,call+'\n'+call));
 assert.throws(()=>docker(psql,change('UPDATE students SET archived_at=now();')),/Student identity unavailable/);
 assert.throws(()=>docker(psql,change("UPDATE classes SET school_id='00000000-0000-0000-0000-000000000001' WHERE id='00000000-0000-0000-0000-000000000002';")),/Class is not active or available/);
 assert.throws(()=>docker(psql,change('UPDATE classes SET academic_year_id=null;')),/Class is not active or available/);
 assert.throws(()=>docker(psql,change("UPDATE classes SET status='inactive';")),/Class is not active or available/);
 // Commit fictional setup so two independent connections can test an archive race.
 docker(psql,sql.slice(0,sql.indexOf('SET LOCAL ROLE authenticated;'))+'COMMIT;');
 const archiver=spawn('docker',psql,{stdio:['pipe','pipe','pipe']});
 let archiveOutput='';
 const archived=new Promise((resolve,reject)=>{
  archiver.on('error',reject);
  archiver.on('close',code=>code===0?resolve():reject(Error('Concurrent archive failed')));
 });
 // Observe the archive holding its row lock before attempting the transfer.
 await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('Archive lock signal timed out')),10000);
  archiver.stdout.on('data',chunk=>{
   archiveOutput+=chunk;
   if(archiveOutput.includes('ARCHIVE_LOCK_HELD')) {clearTimeout(timer);resolve();}
  });
  archiver.on('error',error=>{clearTimeout(timer);reject(error);});
  archiver.stdin.end("BEGIN; UPDATE classes SET status='archived' WHERE id='00000000-0000-0000-0000-000000000002'; SELECT 'ARCHIVE_LOCK_HELD'; SELECT pg_sleep(2); COMMIT;");
 });
 assert.throws(()=>docker(psql,"BEGIN; SET LOCAL ROLE authenticated; SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true); "+call+'ROLLBACK;'),/Class is not active or available/);
 await archived;
 docker(psql,"DO $$BEGIN IF EXISTS(SELECT 1 FROM students WHERE school_id='00000000-0000-0000-0000-000000000002') OR EXISTS(SELECT 1 FROM student_school_transfer_events) THEN RAISE EXCEPTION 'Rejected concurrent transfer changed records'; END IF; END$$;");
 console.log('PASS concurrent class archive rejects transfer without moving the student.');
 console.log('PASS: old archived-class bug reproduced; valid/repeated transfers preserve identity and access behavior; archived students and archived/inactive/wrong-school/wrong-year classes rejected.');
} finally { docker(['rm','-f',container]); }
