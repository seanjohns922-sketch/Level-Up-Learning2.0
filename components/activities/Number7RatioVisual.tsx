'use client';
import Image from 'next/image';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {getRealmTheme} from '@/lib/useRealmTheme';
import {number7RatioSpeech,type Number7RatioModel} from '@/lib/number7-ratio-visual';

export default function Number7RatioVisual({model}:{model:Number7RatioModel}){
 const theme=getRealmTheme('number');
 return <figure className="my-3 rounded-xl border p-3" style={{background:theme.surfaceTint,borderColor:theme.borderRing}}>
  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
   <figcaption className="font-bold text-slate-800">{model.total??(model.kind==='crystals'?'One ratio group · blue : gold':'Equal parts')}</figcaption>
   <ReadAloudBtn text={`${model.kind==='crystals'?'One ratio group, blue to gold. ':''}${number7RatioSpeech(model)}`} label="Read diagram"/>
  </div>
  <div className="grid gap-3 sm:grid-cols-2">{model.parts.map((count,group)=><div key={group} className="rounded-lg border border-slate-200 bg-white p-3">
   <div className="flex items-center gap-3">
    {model.kind==='mixture'&&<Image src="/images/number-nexus/level7/objects/jug-v1.png" alt="" aria-hidden="true" width={64} height={64} className="h-16 w-16 object-contain"/>}
    <p className="font-bold text-slate-800">{model.labels[group]} · {count}{model.kind==='crystals'?'':` part${count===1?'':'s'}`}</p>
   </div>
   <div aria-hidden="true" className="mt-2 flex flex-wrap gap-2">{Array.from({length:count},(_,i)=>model.kind==='crystals'?<svg key={i} data-ratio-part={group} viewBox="0 0 40 48" className="h-10 w-9"><path d="M20 2L35 15L33 34L20 46L5 33L5 15Z" fill={group===0?'#2563eb':'#d99a20'} stroke={group===0?'#173f93':'#885815'} strokeWidth="1.5"/><path d="M20 2L26 17L20 46L13 17Z" fill={group===0?'#93c5fd':'#ffdf87'}/><path d="M5 15L13 17L20 2Z M26 17L35 15L20 2Z" fill={group===0?'#dbeafe':'#fff0bd'}/><path d="M13 17L26 17L20 46Z" fill={group===0?'#60a5fa':'#efbb47'}/></svg>:<span key={i} data-ratio-part={group} className="h-7 w-7 rounded-md border-2" style={{background:group===0?'#f1c86b':'#b7e1f3',borderColor:group===0?'#927027':'#40728b'}}/>)}</div>
  </div>)}</div>
  {model.kind!=='crystals'&&<p className="mt-2 text-sm text-slate-600">Each square is one equal part.</p>}
 </figure>;
}
