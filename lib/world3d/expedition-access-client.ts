"use client";
import {getStudentSessionToken} from '@/lib/studentIdentity';
import type {ExpeditionAccess,ExpeditionRealm} from './expedition-access';
/** Level 8 asks for that realm's stronghold; otherwise the summit or a realm's Level 7 cave. */
export async function fetchExpeditionAccess(studentId:string,realm?:ExpeditionRealm,level?:8):Promise<ExpeditionAccess>{
 const token=getStudentSessionToken();if(!token)throw new Error('Student sign-in required');
 const response=await fetch('/api/world/expedition-access',{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json','x-student-session':token},body:JSON.stringify({studentId,...(realm?{realm}:{}),...(level?{level}:{})})});
 // 'locked' means the student is signed in but has not opened this realm yet; anything else is a failed check.
 if(!response.ok){const reply=await response.json().catch(()=>null) as {error?:string}|null;throw new Error(reply?.error==='This expedition is locked'?'locked':'Expedition access could not be verified');}
 return response.json();
}
