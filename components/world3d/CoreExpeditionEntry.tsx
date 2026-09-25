'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {getActiveStudentIdentity} from '@/lib/studentIdentity';
import {fetchExpeditionAccess} from '@/lib/world3d/expedition-access-client';
import type {ExpeditionAccess} from '@/lib/world3d/expedition-access';
const World=dynamic(()=>import('./NumberAdventure3DWorld'),{ssr:false});
export default function CoreExpeditionEntry(){
 const router=useRouter(),[access,setAccess]=useState<ExpeditionAccess|null>(null),[error,setError]=useState(false),[version,setVersion]=useState(0);
 useEffect(()=>{let cancelled=false;const id=getActiveStudentIdentity().studentId;if(!id){router.replace('/login');return;}
 fetchExpeditionAccess(id).then(result=>{if(!cancelled)setAccess(result);}).catch(()=>{if(!cancelled)setError(true);});return()=>{cancelled=true;};},[router,version]);
 if(access?.level7.length)return <World access={access}/>;
 return <main className="grid min-h-dvh place-items-center bg-slate-950 p-8 text-center text-white"><section><h1 className="text-2xl font-bold">The Core Expedition</h1><p className="my-5">{error?'We could not check your expedition access.':access?'Score above 86% on a Level 6 post-test in any realm to open this portal.':'Checking your expedition unlock…'}</p>{error&&<button className="m-4 rounded bg-amber-200 px-5 py-3 text-black" onClick={()=>{setError(false);setVersion(v=>v+1);}}>Try again</button>}<Link href="/world/tower" className="underline">Return to the tower</Link></section></main>;
}
