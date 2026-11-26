'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {getActiveStudentIdentity} from '@/lib/studentIdentity';
import {fetchExpeditionAccess} from '@/lib/world3d/expedition-access-client';
import type {ExpeditionRealm} from '@/lib/world3d/expedition-access';
const Stronghold=dynamic(()=>import('./RealmStronghold'),{ssr:false,loading:()=> <main className="grid min-h-dvh place-items-center bg-slate-950 text-white">Opening the stronghold…</main>});

/** live: a real student's stronghold. Nothing is mounted until the server confirms this realm's Level 8 is open to them. */
export default function RealmStrongholdEntry({realm,live=false}:{realm:ExpeditionRealm;live?:boolean}){
 const router=useRouter(),[access,setAccess]=useState<{realm:ExpeditionRealm;recovered:boolean}|null>(null),[failed,setFailed]=useState<'locked'|'error'|null>(null),[attempt,setAttempt]=useState(0);
 useEffect(()=>{if(!live)return;let cancelled=false;const id=getActiveStudentIdentity().studentId;if(!id){router.replace('/login');return;}
  fetchExpeditionAccess(id,realm,8).then(result=>{if(!cancelled&&getActiveStudentIdentity().studentId===id)setAccess({realm,recovered:result.recovered.includes(realm)});})
   .catch((error:unknown)=>{if(!cancelled)setFailed(error instanceof Error&&error.message==='locked'?'locked':'error');});
  return()=>{cancelled=true;};},[live,realm,router,attempt]);
 if(!live)return <Stronghold realm={realm} key={realm}/>;
 if(access?.realm===realm)return <Stronghold realm={realm} key={realm} live recovered={access.recovered}/>;
 return <main className="grid min-h-dvh place-items-center bg-slate-950 p-8 text-center text-white"><section><h1 className="text-2xl font-bold">The Level 8 stronghold</h1>
  <p className="my-5">{failed==='locked'?'This stronghold opens when you pass this realm’s Level 7 post-test with 85% or above, or when your teacher places you at Level 8.':failed?'We could not check your stronghold access.':'Checking your stronghold…'}</p>
  {failed==='error'&&<button className="m-4 rounded bg-amber-200 px-5 py-3 text-black" onClick={()=>{setFailed(null);setAttempt(n=>n+1);}}>Try again</button>}
  <Link href="/world/expedition" className="underline">Return to the summit</Link></section></main>;
}
