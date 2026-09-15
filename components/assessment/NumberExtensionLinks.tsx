"use client";
import {useSyncExternalStore} from 'react';
import Link from 'next/link';
import {readProgress} from '@/data/progress';
import {isDemoPreviewMode} from '@/lib/demo-mode';
const subscribe=(changed:()=>void)=>{window.addEventListener('storage',changed);window.addEventListener('focus',changed);return()=>{window.removeEventListener('storage',changed);window.removeEventListener('focus',changed);};};
const eligible=()=>!isDemoPreviewMode()&&['Year 6','Year 7'].includes(readProgress('number')?.year??'');
export default function NumberExtensionLinks(){
 const canOpen=useSyncExternalStore(subscribe,eligible,()=>false);
 if(!canOpen)return null;
 return <Link href="/number-extension" className="inline-flex min-h-11 shrink-0 items-center rounded-xl border border-teal-300/40 bg-teal-950 px-4 py-2 text-sm font-bold text-teal-50">Level 7 Number tests</Link>;
}
