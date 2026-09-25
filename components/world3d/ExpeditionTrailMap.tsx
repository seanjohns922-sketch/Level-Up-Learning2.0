'use client';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import { EXPEDITION_TRAILS,TRAIL_SAMPLES } from '@/lib/world3d/expedition-crossroads';
import { VOLCANO_ROUTE } from '@/lib/world3d/volcano-expedition';
export default function ExpeditionTrailMap({position,volcanoOpen}:{position:[number,number];volcanoOpen:boolean}){return <>
 <p className="summit-eyebrow">SIXFOLD OUTPOST</p><h2 id="summit-dialog-title">The Shattered Realms</h2>
 <ReadAloudBtn text="Six Level 7 trails leave the outpost. One: Measurelands. Two: Starpath. Three: Number Nexus, the occupied foundry. Four: Statistica. Five: Pattern Peaks. Six: Chance Hollow. The separate seventh route, The Final Battle, leads up the volcano to six Level 8 strongholds. Finish a realm’s Level 7 to unlock the pass and that realm’s summit gateway. The white marker shows your position."/>
 <svg className="expedition-map expedition-map-expanded" viewBox="-182 -236 337 365" role="img" aria-label="Six separate Level 7 routes surround the outpost. A seventh route winds up the northern volcano.">
 <rect x="-182" y="-236" width="337" height="365" rx="8" fill="#263c3b"/>
 {[94,65,35].map(r=><circle key={r} cx="0" cy="-130" r={r} fill="none" stroke="#65706a" strokeWidth=".8"/>)}
 <text x="0" y="-223" textAnchor="middle" fontSize="8" fill="#e0a379">VOLCANO · LEVEL 8</text>
 <polyline points={VOLCANO_ROUTE.map(p=>`${p[0]},${p[2]}`).join(' ')} stroke={volcanoOpen?'#f1ba76':'#a5917c'} strokeWidth="3" strokeDasharray={volcanoOpen?undefined:'5 4'} fill="none"/>
 <circle cx="0" cy="-130" r="9" fill="#be643c"/><text x="13" y="-127" fontSize="7" fill="#ffe3b1">6 STRONGHOLDS</text>
 {TRAIL_SAMPLES.map((points,i)=>{const end=points.at(-1)!;return <g key={i}><polyline points={points.map(p=>`${p[0]},${p[2]}`).join(' ')} fill="none" stroke={EXPEDITION_TRAILS[i].colour} strokeWidth="3"/><circle cx={end[0]} cy={end[2]} r="6" fill={EXPEDITION_TRAILS[i].colour}/><text x={end[0]} y={end[2]+2.3} textAnchor="middle" fontSize="7" fill="#14342e" fontWeight="900">{i+1}</text></g>;})}
 <path d="M0 65V100" stroke="#d6c19a" strokeWidth="3"/><circle cx="0" cy="65" r="5" fill="#ffe7ac"/>
 <circle cx={position[0]} cy={position[1]} r="3.5" fill="white" stroke="#173f36" strokeWidth="1"/>
 </svg>
 <small className="expedition-map-location">White marker: you are here · Dashed route: sealed pass</small>
 <div className="expedition-map-key">{EXPEDITION_TRAILS.map((t,i)=><div key={t.id}><b style={{color:t.colour}}>{i+1}</b><span><strong>{t.name}</strong><small>{'Level 7 · Weekly lesson entrance'}</small></span></div>)}</div>
 <p className="summit-disclaimer">The volcano and six stronghold entrances are explorable scenery. Level 8 lessons and boss encounters are not implemented in this preview.</p>
 </>;}
