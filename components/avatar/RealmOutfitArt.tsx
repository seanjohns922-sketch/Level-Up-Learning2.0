import { realmOutfit } from '@/lib/avatar/realm-outfits';
/** Garments use the same 120 x 220 avatar frame; hands and face remain separate. */
export function RealmOutfitArt({top,fill,trim}:{top:string;fill:string;trim:string}){
 const item=realmOutfit(top);if(!item)return null;
 const k=item.key;
 const long=['timewielder','starweaver','insightkeeper'].includes(k);
 const crystal=(x:number,y:number,s=1)=><g transform={`translate(${x} ${y}) scale(${s})`}><path d="M0-9 5 0 0 8-5 0Z" fill={k==='insightkeeper'?'#77d9ed':'#b781ef'} stroke={trim} strokeWidth=".7"/><path d="M0-9V8L5 0Z" fill="#e3c9ff" opacity=".65"/></g>;
 return <g data-realm-outfit={k}>
  <path d="M31 100Q60 94 89 100L92 157Q60 167 28 157Z" fill={fill} stroke={trim} strokeWidth=".8"/>
  <path d="M33 104 36 154M86 104 84 154" stroke="#fff" strokeOpacity=".12" strokeWidth="2"/>
  {long&&<><path d="M33 126 55 136 49 188 25 181Z" fill={fill} stroke={trim}/><path d="M87 126 65 136 71 188 95 181Z" fill={fill} stroke={trim}/><path d="M37 145 33 177M83 145 87 177" stroke="#fff" strokeOpacity=".15" strokeWidth="2"/></>}
  {k==='equationator'&&<><path d="M34 99 48 104 72 104 86 99 83 131 70 140H50L37 131Z" fill={fill} stroke="#94d8ee"/><path d="M45 140H75L80 151 60 158 40 151Z" fill="#182d39" stroke={trim}/>{[112,122].map(y=><rect key={y} x="50" y={y} width="20" height="6" rx="2" fill={trim} stroke="#fff1b5" strokeWidth=".7"/>)}{[24,80].map(x=><path key={x} d={`M${x} 100q9-8 16 2v10h-16Z`} fill={fill} stroke={trim} strokeWidth="2"/>)}</>}
  {k==='timewielder'&&<><path d="M46 98 60 121 74 98 80 101 67 134H53L40 101Z" fill="#2d2347" stroke={trim}/><circle cx="60" cy="118" r="10" fill="#362448" stroke={trim} strokeWidth="2"/><circle cx="60" cy="118" r="6" fill="#a06bd4" stroke={trim}/>{Array.from({length:12},(_,i)=><path key={i} d="M60 108v3" transform={`rotate(${i*30} 60 118)`} stroke={trim}/>)}<path d="M60 114v5l4 2" stroke="#fff2c4" fill="none"/>{[0,1,2,3,4].map(i=><path key={i} d={`M${32+i} ${146+i*7}h7m42 0h7`} stroke={trim}/>)}{crystal(60,156,.65)}</>}
  {k==='starweaver'&&<><path d="M28 103Q40 91 49 101L88 146 74 164Z" fill="#9580ca" stroke={trim}/><path d="M38 109 65 113 48 140 77 153 80 125 38 109M48 140 65 113 77 153" stroke={trim} strokeWidth=".7" fill="none"/>{[[38,109],[65,113],[48,140],[77,153],[80,125],[39,169],[81,173]].map(([x,y])=><path key={x+':'+y} d={`M${x-3} ${y}h6m-3-3v6`} stroke="#fff1cb"/>)}<path d="M25 105Q31 94 44 98L49 109 28 117Z" fill="#57428d" stroke={trim}/>{crystal(48,106,.6)}</>}
  {k==='codemaster'&&<>{[0,1,2,3].map(i=><path key={i} d={`M${36+i} ${108+i*12} 60 ${118+i*12} ${84-i} ${108+i*12} 79 ${117+i*12} 60 ${128+i*12} 41 ${117+i*12}Z`} fill={i%2?'#42334e':'#241e30'} stroke={trim} strokeWidth=".8"/>)}{[28,38,82,92].map((x,i)=><g key={x} transform={`rotate(${i<2?-25:25} ${x} 103)`}>{crystal(x,103,i%2?.8:1)}</g>)}{crystal(60,120,1.1)}</>}
  {k==='insightkeeper'&&<><path d="M49 99 60 106 71 99 72 149H48Z" fill="#20354c" stroke={trim}/><path d="M43 99 52 123 46 135 35 102M77 99 68 123 74 135 85 102" fill="#fff5df" stroke={trim}/>{[119,129,139].map(y=><circle key={y} cx="60" cy={y} r="1.5" fill={trim}/>)}{crystal(60,107,.55)}<path d="M76 143h11v12H76Z" fill="#28465e" stroke={trim}/><path d="M79 152v-4m3 4v-7m3 7v-5" stroke="#77d9ed"/></>}
  {k==='chanzia'&&<><path d="M36 101Q60 84 84 101L77 115Q60 106 43 115Z" fill="#24182e" stroke={trim}/>{[0,1,2,3].map(i=><path key={i} d={`M32 ${116+i*10} 86 ${125+i*8}`} stroke={i%2?'#a46aba':'#715181'} strokeWidth="4"/>)}<path d="M77 108 86 112 47 159 37 156Z" fill="#281a37" stroke={trim}/><circle cx="59" cy="137" r="7" fill="#1f182a" stroke={trim}/><path d="M57 133c8-2 7 10 0 8-4-2-2-7 2-5" fill="none" stroke="#e8a8f3" strokeWidth="1.4"/><path d="M42 157 50 157 40 174 32 168Z" fill="#61366d" stroke={trim}/></>}
  <path d="M31 150Q60 157 89 150L88 156Q60 163 32 156Z" fill="#211e30" stroke={trim} strokeWidth=".6"/><rect x="56" y="152" width="8" height="7" rx="1" fill={trim}/>
 </g>;
}
