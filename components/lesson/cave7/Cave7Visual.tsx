'use client';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import ChanceVisual from '@/components/chance-hollow/ChanceVisual';
import {getRealmTheme} from '@/lib/useRealmTheme';
import type {Cave7Visual as Visual} from '@/data/activities/cave7/shared';
export function cave7VisualSpeech(v:Visual){return [v.title,v.kind==='table'?`${v.headers.join('; ')}. ${v.rows.map(row=>row.join('; ')).join('. ')}. ${v.caption??''}`:v.kind==='formula'?`${v.formula}. ${v.meaning}`:v.kind==='chance'?v.caption:v.kind==='frequency'?`${v.unit}. ${v.values.map((n,i)=>`Value ${n}: frequency ${v.counts[i]}`).join('. ')}`:`Horizontal axis: ${v.xLabel}. Vertical axis: ${v.yLabel}. ${v.points.map(p=>`Point ${p[0]}, ${p[1]}`).join('. ')}. ${v.connect?'Recorded points are joined.':'Points are not joined.'}`].join('. ');}
export default function Cave7Visual({visual:v,realm}:{visual:Visual;realm:string}){
 const t=getRealmTheme(realm);let body;
 if(v.kind==='table')body=<div className="overflow-x-auto"><table className="w-full text-left text-base"><thead><tr>{v.headers.map(h=><th key={h} className="border-b p-3">{h}</th>)}</tr></thead><tbody>{v.rows.map((row,i)=><tr key={i}>{row.map((s,j)=><td key={j} className="border-b border-slate-200 p-3">{s}</td>)}</tr>)}</tbody></table>{v.caption&&<p className="mt-2">{v.caption}</p>}</div>;
 else if(v.kind==='formula')body=<><p className="py-4 text-center text-2xl font-bold sm:text-3xl">{v.formula}</p><p className="text-center">{v.meaning}</p></>;
 else if(v.kind==='chance')body=<><ChanceVisual visual={v.apparatus}/><p className="mt-2 text-center">{v.caption}</p></>;
 else if(v.kind==='frequency'){
  const max=Math.max(1,...v.counts),bar=440/v.values.length;
  body=<svg viewBox="0 0 520 280" className="mx-auto max-h-72 w-full" role="img" aria-label={cave7VisualSpeech(v)}><path d="M55 20V220H505" fill="none" stroke="#475569"/>{v.values.map((n,i)=><g key={i}><rect x={60+i*bar} y={220-v.counts[i]/max*170} width={Math.max(8,bar-10)} height={v.counts[i]/max*170} fill={t.ctaFrom}/><text x={60+i*bar+(bar-10)/2} y={210-v.counts[i]/max*170} textAnchor="middle" fill="#1e293b">{v.counts[i]}</text><text x={60+i*bar+(bar-10)/2} y="243" textAnchor="middle" fill="#1e293b">{n}</text></g>)}<text x="270" y="270" textAnchor="middle" fill="#1e293b">{v.unit}</text><text x="5" y="15" fill="#1e293b">Frequency</text></svg>;
 }else{
  const minX=Math.min(0,...v.points.map(p=>p[0])),maxX=Math.max(1,...v.points.map(p=>p[0])),minY=Math.min(0,...v.points.map(p=>p[1])),maxY=Math.max(1,...v.points.map(p=>p[1])),px=(x:number)=>65+(x-minX)/(maxX-minX)*410,py=(y:number)=>230-(y-minY)/(maxY-minY)*190;
  body=<svg viewBox="0 0 540 300" className="mx-auto max-h-80 w-full" role="img" aria-label={cave7VisualSpeech(v)}>{[0,1,2,3,4].map(i=>{const y=minY+(maxY-minY)*i/4;return <g key={i}><path d={`M65 ${py(y)}H475`} stroke="#e2e8f0"/><text x="55" y={py(y)+5} textAnchor="end" fill="#334155">{Math.round(y*100)/100}</text></g>;})}<path d="M65 30V230H490" fill="none" stroke="#475569"/>{v.connect&&<polyline points={v.points.map(p=>`${px(p[0])},${py(p[1])}`).join(' ')} fill="none" stroke={t.ctaFrom} strokeWidth="3"/>}{v.points.map((p,i)=><g key={i}><circle cx={px(p[0])} cy={py(p[1])} r="5" fill={t.ctaFrom}/><text x={px(p[0])} y="254" textAnchor="middle" fill="#334155">{p[0]}</text><text x={px(p[0])} y={py(p[1])-11} textAnchor="middle" fill="#334155">{p[1]}</text></g>)}<text x="270" y="282" textAnchor="middle" fill="#1e293b">{v.xLabel}</text><text x="65" y="16" fill="#1e293b">{v.yLabel}</text></svg>;
 }
 return <section className="my-4 rounded-xl border bg-white p-4 text-slate-900" style={{borderColor:t.ctaFrom}}><div className="mb-3 flex items-start justify-between gap-3"><h3 className="font-bold">{v.title}</h3><ReadAloudBtn text={cave7VisualSpeech(v)} label="Read diagram"/></div>{body}</section>;
}
