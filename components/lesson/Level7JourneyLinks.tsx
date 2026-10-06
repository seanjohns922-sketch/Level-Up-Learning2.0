'use client';

import Link from 'next/link';
import { useDemoPreviewMode } from '@/lib/demo-mode';
import { Home, Mountain } from 'lucide-react';
import { cave7Realm } from '@/lib/cave7-config';
import { cavernHref, studentCavernHref } from '@/lib/world3d/shattered-realms';
import { getRealmTheme } from '@/lib/useRealmTheme';

/** Persistent exits shared by the Level 7 lesson, completion and week screens. */
export default function Level7JourneyLinks({realm,week=1,demo,showCave=true}:{realm:string;week?:number;demo?:boolean;showCave?:boolean}) {
 const preview=useDemoPreviewMode(),isDemo=demo??preview;
 if(!cave7Realm(realm))return null;
 const theme=getRealmTheme(realm);
 const style={background:theme.cardSurface,color:theme.accentTextSoft,borderColor:theme.borderRing};
 const className='inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2';
 return <nav aria-label="Level 7 journey" className="flex flex-wrap items-center gap-2">
  {showCave&&<Link href={isDemo?cavernHref(realm,week):studentCavernHref(realm,week)} style={style} className={className}><Mountain size={18} aria-hidden="true"/>Back to cave</Link>}
  <Link href={isDemo?'/demo-review':'/world'} style={style} className={className}><Home size={18} aria-hidden="true"/>{isDemo?'Demo review':'Central hub'}</Link>
 </nav>;
}
