"use client";
import {getRealmTheme} from '@/lib/useRealmTheme';
import {useSyncExternalStore} from 'react';
import Link from 'next/link';
import {readProgress} from '@/data/progress';
import {isDemoPreviewMode} from '@/lib/demo-mode';
const subscribe=(changed:()=>void)=>{window.addEventListener('storage',changed);window.addEventListener('focus',changed);return()=>{window.removeEventListener('storage',changed);window.removeEventListener('focus',changed);};};
const eligible=()=>!isDemoPreviewMode()&&['Year 6','Year 7','Year 8'].includes(readProgress('pattern')?.year??'');
const theme=getRealmTheme('pattern');
export default function PatternExtensionLinks(){
 const canOpen=useSyncExternalStore(subscribe,eligible,()=>false);
 if(!canOpen)return null;
 return <Link style={{background:theme.surfaceTint,borderColor:theme.borderRing,color:theme.accentText}} href="/pattern-extension" className="inline-flex min-h-11 shrink-0 items-center rounded-xl border   px-4 py-2 text-sm font-bold ">Level 7–8 Pattern tests</Link>;
}
