'use client';
import dynamic from 'next/dynamic';
import type {ExpeditionRealm} from '@/lib/world3d/expedition-access';
const Stronghold=dynamic(()=>import('./RealmStrongholdDemo'),{ssr:false,loading:()=> <main className="grid min-h-dvh place-items-center bg-slate-950 text-white">Opening the stronghold…</main>});
export default function RealmStrongholdEntry({realm}:{realm:ExpeditionRealm}){return <Stronghold realm={realm} key={realm}/>;}
