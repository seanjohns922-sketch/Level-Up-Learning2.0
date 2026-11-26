import {LEVEL7_LIVE} from '@/lib/level7-release';
import {LEVEL8_LIVE} from '@/lib/level8-release';
import {readStudentExpeditionAccess} from '@/lib/world3d/expedition-access-server';
import {cavernRealm} from '@/lib/world3d/shattered-realms';
export async function POST(request:Request){
 const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
 if(!LEVEL7_LIVE)return reply({error:'Level 7 is not released'},404);
 const token=request.headers.get('x-student-session')?.trim();
 if(!token)return reply({error:'Student sign-in required'},401);
 let body;try{body=await request.json();}catch{return reply({error:'Invalid request'},400);}
 if(!body||typeof body.studentId!=='string'||!body.studentId.match(/^[0-9a-f-]{36}$/i))return reply({error:'Invalid student'},400);
 const realm=body.realm===undefined?null:typeof body.realm==='string'?cavernRealm(body.realm):null;
 if(body.realm!==undefined&&!realm)return reply({error:'Unknown realm'},400);
 // A stronghold request (level 8) needs that realm's Level 8; anything else needs Level 7.
 const stronghold=body.level===8;
 if(body.level!==undefined&&(!stronghold||!realm))return reply({error:'Invalid level'},400);
 if(stronghold&&!LEVEL8_LIVE)return reply({error:'Level 8 is not released'},404);
 try{
  const access=await readStudentExpeditionAccess(body.studentId,token);
  const open=stronghold?access.level8:access.level7;
  if(realm?!open.includes(realm):!open.length)return reply({error:'This expedition is locked'},403);
  return reply(access);
 }catch{return reply({error:'Unable to verify student access'},403);}
}
