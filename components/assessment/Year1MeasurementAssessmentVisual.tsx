"use client";
/* eslint-disable @next/next/no-img-element -- Reuse local lesson artwork. */
import MeasuredRibbon from './MeasuredRibbon';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import GroundMeasurementAssessmentVisual from './GroundMeasurementAssessmentVisual';
import type {Measurement1Visual} from '@/data/assessments/revisions/year1MeasurementFiveForms';
export function measurement1Speech(v:Measurement1Visual){return [v.description,...(v.task==='calendar'&&v.values?['Calendar year 2026. Columns: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.']:[]),...v.labels.map((label,i)=>`${label==='?'?'Missing item':label}${v.values?.[i]!==undefined&&!['units','fair','string','balance'].includes(v.task)?`: ${v.values[i]} ${v.unit??''}`:''}`)].join('. ');}
export default function Year1MeasurementAssessmentVisual({visual:v}:{visual:Measurement1Visual}){
 if(v.task==='balance')return <GroundMeasurementAssessmentVisual visual={{type:'measurement_ground_panel',task:'mass',labels:v.labels,values:v.values,description:v.description}}/>;
 let content;
 if(v.task==='units'||v.task==='fair'||v.task==='string'){
  const max=Math.max(...v.values!);const different=v.unit==='different units';
  content=<svg viewBox={`0 0 680 ${v.labels.length*110+20}`} className="mx-auto w-full max-w-3xl" role="img" aria-label={v.description}>{v.labels.map((label,i)=>{
   const count=v.values![i],x=155,y=15+i*110,step=different?400/count:400/max,kind=v.variants?.[i]??'fair';const objectWidth=different?400:count*step;
   return <g key={label}><text x="5" y={y+25} fill="#3b2a14" fontSize="19" fontWeight="700">{label}</text>
    {v.task==='string'?<><path d={`M${x} ${y+22}H${x+objectWidth}`} stroke={i===0?'#b4793c':i===1?'#2c8794':'#9463b0'} strokeWidth={i===0?6:28} strokeLinecap={i===0?'round':'butt'}/>{i>0?<rect x={x} y={y+8} width={objectWidth} height={28} fill={i===1?'#c89b6c':'#d2b0df'} stroke="#714c2b" strokeWidth="2"/>:null}{i>0?<path d={`M${x} ${y+52}H${x+v.target!*step}`} stroke="#b4793c" strokeWidth="5" strokeDasharray="8 3"/>:null}</>:<>
    {label.startsWith('Ribbon')?<MeasuredRibbon x={x} y={y+4} width={objectWidth} height={24} colour={i%2?'#9463b0':'#2c8794'}/>:label==='Pencil'?<svg x={x} y={y-4} width={objectWidth} height="38" viewBox="21 108 729 44" preserveAspectRatio="none"><image href="/images/measurelands/measure-objects-3d/pencil.png" width="768" height="256"/></svg>:<rect x={x} y={y+4} width={v.task==='fair'?6*step:objectWidth} height="24" rx="4" fill={i%2?'#9463b0':'#2c8794'}/>}
    {Array.from({length:count},(_,j)=><rect key={j} x={x+j*step*(kind==='gap'?1.18:kind==='overlap'?.8:1)} y={y+38} width={step} height="32" fill={j%2?'#f5d78e':'#ffeab8'} stroke="#8b642f" strokeWidth="2"/>)}
    <path d={`M${x} ${y-2}V${y+76}`} stroke="#8b642f" strokeDasharray="4 4"/>
    </>}
   </g>;
  })}</svg>;
 }else content=<div className={`grid gap-4 ${v.labels.length===3?'sm:grid-cols-3':v.labels.length===2?'sm:grid-cols-2':''}`}>{v.labels.map((label,i)=><div key={i} className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-white p-4 text-center">
  {v.arts?.[i]?<img src={`/images/measurelands/${v.arts[i]}`} alt="" width="150" height="150" className="h-32 w-32 rounded-xl object-contain"/>:null}
  {v.task==='calendar'?<div className="h-3 w-full rounded-t-lg bg-amber-300"/>:null}
  <p className="text-xl font-black text-amber-950">{label}</p>
  {v.task==='timeline'&&v.values?<ReadAloudBtn text={`${label}: ${v.values[i]} ${v.unit}.`} label={`Read ${label}`} size="md"/>:null}
  {v.task==='calendar'&&v.values?<div className="w-full max-w-sm text-amber-950"><p className="mb-2 font-bold">2026</p><div className="grid grid-cols-7 gap-1" style={{gridTemplateColumns:'repeat(7,minmax(0,1fr))'}}>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day=><span key={day} className="text-xs font-bold">{day}</span>)}{Array.from({length:(new Date(Date.UTC(2026,['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(label),1)).getUTCDay()+6)%7},(_,day)=><span key={`blank-${day}`}/>)}{Array.from({length:v.values[i]},(_,day)=><span key={day} className="rounded border border-amber-200 bg-amber-50 p-1 text-sm font-bold">{day+1}</span>)}</div></div>:null}
  {v.values?.[i]!==undefined?<p className="text-2xl font-black text-amber-950">{v.values[i]} <span className="text-lg">{v.unit}</span></p>:null}
  {v.task==='capacity'?<div className="flex max-w-56 flex-wrap justify-center gap-1" aria-hidden>{Array.from({length:v.values![i]},(_,j)=><svg key={j} viewBox="0 0 28 32" className="h-7 w-6"><path d="M4 5H22L20 28H6Z" fill="#8bcee7" stroke="#327592" strokeWidth="2"/><path d="M22 9Q34 16 22 21" fill="none" stroke="#327592" strokeWidth="2"/></svg>)}</div>:null}
  {v.unit?.includes('cubes')?<div className="flex max-w-56 flex-wrap justify-center gap-1" aria-hidden>{Array.from({length:v.values![i]},(_,j)=><span key={j} className="h-5 w-5 border-2 border-amber-800 bg-amber-200"/>)}</div>:null}
 </div>)}</div>;
 return <section className="mb-5 rounded-2xl border-2 border-amber-200 bg-[#fffaf0] p-4 sm:p-6"><div className="mb-4 flex justify-end"><ReadAloudBtn text={measurement1Speech(v)} label="Read diagram" size="md"/></div>{!['units','fair','calendar','balance'].includes(v.task)?<p className="mb-4 text-center text-lg font-bold text-amber-950">{v.description}</p>:null}{content}</section>;
}
