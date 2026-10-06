'use client';
import dynamic from 'next/dynamic';
const Stronghold=dynamic(()=>import('./NumberStrongholdDemo'),{ssr:false,loading:()=> <main className="grid min-h-dvh place-items-center bg-slate-950 text-white">Opening Number’s stronghold…</main>});
export default function NumberStrongholdEntry(){return <Stronghold/>;}
