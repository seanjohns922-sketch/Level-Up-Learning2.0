"use client";
import {getStudentSessionToken} from '@/lib/studentIdentity';
import type {ExpeditionAccess,ExpeditionRealm} from './expedition-access';
export async function fetchExpeditionAccess(studentId:string,realm?:ExpeditionRealm):Promise<ExpeditionAccess>{
 const token=getStudentSessionToken();if(!token)throw new Error('Student sign-in required');
 const response=await fetch('/api/world/expedition-access',{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json','x-student-session':token},body:JSON.stringify({studentId,...(realm?{realm}:{})})});
 if(!response.ok)throw new Error('Expedition access could not be verified');
 return response.json();
}
