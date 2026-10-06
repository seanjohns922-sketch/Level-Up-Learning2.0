'use client';
import dynamic from 'next/dynamic';
import type {ExpeditionRealm} from '@/lib/world3d/expedition-access';
const Cavern=dynamic(()=>import('./ShatteredRealmCavern'),{ssr:false,loading:()=> <main className="grid min-h-dvh place-items-center bg-slate-950 text-white">Opening the cavern…</main>});
export default function ShatteredRealmEntry({realm,week,live=false}:{realm:ExpeditionRealm;week:number;live?:boolean}){return <Cavern key={`${realm}-${week}`} realm={realm} week={week} live={live}/>;}
