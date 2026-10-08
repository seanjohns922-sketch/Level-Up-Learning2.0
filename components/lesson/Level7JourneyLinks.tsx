'use client';

import Link from 'next/link';
import { useDemoPreviewMode } from '@/lib/demo-mode';
import { Home, LayoutGrid, Mountain } from 'lucide-react';
import type { CSSProperties } from 'react';
import { cave7Realm } from '@/lib/cave7-config';
import { cavernHref, studentCavernHref } from '@/lib/world3d/shattered-realms';
import { getRealmTheme } from '@/lib/useRealmTheme';

/** Persistent exits shared by the Level 7 lesson, completion and week screens.
 *  Central hub always shows; Demo review appears only in a demo session. Pages pass
 *  linkClassName/linkStyle so the links match their other realm widgets. */
export default function Level7JourneyLinks({realm,week=1,demo,showCave=true,level=7,linkClassName,linkStyle}:{realm:string;week?:number;demo?:boolean;showCave?:boolean;level?:number;linkClassName?:string;linkStyle?:CSSProperties}) {
 const preview=useDemoPreviewMode(),isDemo=demo??preview;
 if(!cave7Realm(realm))return null;
 const theme=getRealmTheme(realm);
 const style=linkStyle??{background:theme.cardSurface,color:theme.accentTextSoft,borderColor:theme.borderRing};
 const className=`inline-flex items-center justify-center gap-2 ${linkClassName??'min-h-11 rounded-lg border px-3 py-2 text-sm font-bold hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2'}`;
 return <nav aria-label={`Level ${level} journey`} className="flex flex-wrap items-center gap-2">
  {showCave&&<Link href={level===8?`/demo-review/volcano/${realm}`:isDemo?cavernHref(realm,week):studentCavernHref(realm,week)} style={style} className={className}><Mountain size={16} aria-hidden="true"/>{level===8?"Back to stronghold":"Back to cave"}</Link>}
  <Link href="/world" style={style} className={className}><Home size={14} aria-hidden="true"/>Central hub</Link>
  {isDemo&&<Link href="/demo-review" style={style} className={className}><LayoutGrid size={14} aria-hidden="true"/>Demo review</Link>}
 </nav>;
}
