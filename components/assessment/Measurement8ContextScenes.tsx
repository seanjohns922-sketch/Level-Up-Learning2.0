"use client";
import {useId} from 'react';

/** Decorative city scenes: daylight is not evidence about the unknown local time. */
export function CityScene({city}:{city:string}) {
 const id=useId().replace(/:/g,'');
 const tokyo=city.includes('Tokyo'),delhi=city.includes('Delhi'),la=city.includes('Los Angeles'),adelaide=city.includes('Adelaide'),perth=city.includes('Perth');
 return <svg viewBox="0 0 360 130" aria-hidden="true" className="mb-3 w-full rounded-lg" style={{height:105,objectFit:'cover'}}>
  <defs><linearGradient id={id} x2="0" y2="1"><stop stopColor="#d0eaf4"/><stop offset="1" stopColor="#f9edcf"/></linearGradient></defs>
  <rect width="360" height="130" fill={`url(#${id})`}/><path d="M0 86Q40 52 86 82T180 73T270 77T360 66V130H0" fill="#cad6c2"/>
  {[18,49,84,122,167,201,241,283,322].map((x,i)=><g key={x}><rect x={x} y={56+(i%3)*12} width={23+(i%2)*9} height={65-(i%3)*12} rx="2" fill={i%2?'#769eab':'#547b8c'}/>{[0,1,2].map(k=><path key={k} d={`M${x+6} ${65+(i%3)*12+k*12}h5m4 0h5`} stroke="#e1f1f4" strokeWidth="4"/>)}</g>)}
  {tokyo?<g stroke="#b55146" fill="#dc8171"><path d="M176 112L204 15L232 112Z"/><path d="M204 4V20M186 76h36m-28-31h20" strokeWidth="4"/><path d="M182 97h44m-35-24h26" stroke="#fff5df" strokeWidth="5"/></g>:delhi?<g fill="#caa06c" stroke="#987248" strokeWidth="2"><path d="M135 117V47H224V117H198V80Q180 60 162 80V117Z"/><path d="M126 47H234V37H216V28H145V37H126Z"/><path d="M143 56h73M145 66h14m43 0h14"/></g>:la?<g stroke="#547c52" strokeWidth="5" fill="none">{[75,282].map(x=><g key={x}><path d={`M${x} 125Q${x+8} 80 ${x} 42`} stroke="#93774b"/><path d={`M${x} 44q-28-26-40 2m40-2q24-29 42-3m-42 3q-15-10-30 15m30-15q18-9 31 16`}/></g>)}</g>:adelaide?<g stroke="#98774b" fill="#e6d4b0" strokeWidth="2"><path d="M132 120V58H224V120Z"/><path d="M124 58L178 34L232 58Z"/><path d="M163 38V22H192V38M178 22V12"/>{[144,166,188,210].map(x=><path key={x} d={`M${x} 65v49`} strokeWidth="6"/>)}</g>:perth?<g stroke="#5a7c79" fill="#aad0c2"><path d="M157 119L180 22L203 119Z" strokeWidth="2"/><path d="M168 89L180 22L193 89M174 68L180 14L186 68" fill="none" strokeWidth="3"/></g>:<g fill="none" stroke="#e5d5ad"><path d="M90 111H280M110 112V69M255 112V69M110 69L180 107L255 69M110 69L255 69" strokeWidth="5"/>{[130,150,170,195,215,235].map(x=><path key={x} d={`M${x} 70V110`} strokeWidth="2"/>)}</g>}
  <path d="M0 119H360V130H0Z" fill={la||delhi||adelaide?'#afbf99':'#85b9ca'}/>
 </svg>;
}

export function WaterFlow({tank}:{tank:boolean}) {
 const id=useId().replace(/:/g,'');
 return <svg viewBox="0 0 480 280" aria-hidden="true" style={{width:'100%',maxWidth:440,maxHeight:230}}>
  <defs><linearGradient id={id}><stop stopColor="#e4f2f4"/><stop offset=".5" stopColor="#95b1bc"/><stop offset="1" stopColor="#e7f5f7"/></linearGradient></defs>
  <ellipse cx="300" cy="253" rx="147" ry="12" fill="#d9d5c9"/>
  {tank?<><path d="M190 100L246 75H424V224L366 249H190Z" fill="#cde7ed" stroke="#547d8a" strokeWidth="3"/><path d="M190 100H366V249M366 100L424 75" fill="none" stroke="#547d8a" strokeWidth="3"/><path d="M195 184H364L420 160V221L363 244H195Z" fill="#65b8d2" opacity=".8"/><path d="M195 184H364L420 160H250Z" fill="#a8e5ed"/><path d="M200 113V172M207 114V157" stroke="white" strokeWidth="4" opacity=".8"/><path d="M193 98L246 73H424L366 98Z" fill="#e5f4f6" stroke="#547d8a" strokeWidth="3"/></>:<><ellipse cx="300" cy="119" rx="101" ry="24" fill="#e2f1f5" stroke="#537b89" strokeWidth="3"/><path d="M199 119L220 225Q300 265 380 225L401 119Q300 155 199 119Z" fill={`url(#${id})`} stroke="#537b89" strokeWidth="3"/><ellipse cx="300" cy="119" rx="95" ry="19" fill="#75c5dc"/><path d="M210 146Q164 233 235 232M390 146Q437 233 365 232" fill="none" stroke="#627e8b" strokeWidth="7"/><path d="M237 159L245 221" stroke="white" strokeWidth="7" opacity=".65"/></>}
  <path d="M46 47H252Q272 47 272 68V96" fill="none" stroke="#597682" strokeWidth="23"/><path d="M48 43H251Q267 43 267 67V89" fill="none" stroke={`url(#${id})`} strokeWidth="15"/>
  <path d="M194 21V47m-24-26h48" stroke="#986744" strokeWidth="9" strokeLinecap="round"/><ellipse cx="272" cy="96" rx="13" ry="5" fill="#3e6573"/>
  <path d={tank?'M272 104V174':'M272 104V117'} stroke="#43afd0" strokeWidth="9" strokeDasharray="7 4"/>
  <path d={tank?'M260 178q12-8 24 0m-33 8q22-12 42 0':'M258 119q14-8 28 0'} fill="none" stroke="#defaff" strokeWidth="3"/>
 </svg>;
}

/** Illustrative package geometry; labels carry exact dimensions and packing orientation. */
export function PackingScene({n}:{n:number[]}) {
 const box=(x:number,y:number,w:number,h:number,tissue:boolean)=><g><path d={`M${x} ${y}l28-20h${w}l-28 20Z`} fill={tissue?'#cbdde7':'#ead3a8'} stroke="#856d4a" strokeWidth="2"/><path d={`M${x+w} ${y}l28-20v${h}l-28 20Z`} fill={tissue?'#79a6bc':'#b99b67'} stroke="#856d4a" strokeWidth="2"/><rect x={x} y={y} width={w} height={h} fill={tissue?'#a8cbdc':'#d7bc8d'} stroke="#856d4a" strokeWidth="2"/>{tissue?<><ellipse cx={x+w/2+14} cy={y-10} rx="20" ry="5" fill="#638799"/><path d={`M${x+w/2} ${y-10}q-6-18 2-31q15 10 28 1l-8 30Z`} fill="white" stroke="#b7c6cb"/><path d={`M${x+7} ${y+h-10}q20-20 38 0t38 0`} fill="none" stroke="#e9f3f5" strokeWidth="4"/></>:<path d={`M${x+w/2} ${y}v${h}m-7-${h}l28-20`} stroke="#b89a66" strokeWidth="13" opacity=".65"/>}</g>;
 return <div className="flex flex-wrap justify-center gap-3">{[false,true].map(tissue=><div key={String(tissue)} className="min-w-0 flex-1 rounded-xl border border-amber-200 bg-white p-3 text-center" style={{flexBasis:220}}><p className="font-bold">{tissue?'One tissue box':'Shipping carton'}</p><svg viewBox="0 0 280 190" aria-hidden="true" className="w-full" style={{maxHeight:160}}>{box(tissue?72:45,70,tissue?115:165,tissue?62:88,tissue)}</svg><p className="font-bold">{(tissue?n.slice(3):n.slice(0,3)).join(' × ')} cm</p><p className="text-sm">Length × width × height</p></div>)}</div>;
}
