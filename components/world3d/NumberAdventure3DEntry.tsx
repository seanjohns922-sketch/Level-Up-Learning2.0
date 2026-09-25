'use client';
import dynamic from 'next/dynamic';
const World = dynamic(() => import('./NumberAdventure3DWorld'), {ssr:false, loading:()=> <div className="grid min-h-dvh place-items-center bg-[#031713] text-teal-100">Preparing The Shattered Realms…</div>});
export default function NumberAdventure3DEntry(){return <World/>;}
