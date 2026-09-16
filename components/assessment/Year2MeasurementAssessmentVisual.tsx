"use client";
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {ClockFace} from '@/components/measurelands/MeasurelandsAnalogClockCard';
import MeasuredRibbon from './MeasuredRibbon';
import type {Measurement2Visual} from '@/data/assessments/revisions/year2MeasurementFiveForms';
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
const weekdays=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
export function measurement2Speech(v:Measurement2Visual){return v.description+(v.task==='calendar'?` ${months[v.month!]} 2026. Columns: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.`:v.task==='precision'?' Large blocks. Small blocks.':v.task==='turn'?' Start: solid pointer.'+(v.showEnd?(v.steps===4?' Finish: back at Start.':' Finish: dashed pointer.'):''): '');}
export default function Year2MeasurementAssessmentVisual({visual:v}:{visual:Measurement2Visual}){
 let content;
 if(v.task==='clock')content=<div className="flex justify-center"><ClockFace hour={v.hour!} minute={v.minute!} size={280}/></div>;
 else if(v.task==='calendar'){
  const offset=(new Date(Date.UTC(2026,v.month!,1)).getUTCDay()+6)%7,count=new Date(Date.UTC(2026,v.month!+1,0)).getUTCDate();
  content=<div className="mx-auto max-w-lg rounded-2xl border border-amber-300 bg-white p-4"><h3 className="mb-4 text-center text-2xl font-black text-amber-950">{months[v.month!]} 2026</h3><div className="grid grid-cols-7 gap-1" style={{gridTemplateColumns:'repeat(7,minmax(0,1fr))'}}>{weekdays.map(day=><span key={day} className="text-center text-sm font-bold text-amber-950">{day}</span>)}{Array.from({length:offset},(_,i)=><span key={`blank-${i}`}/>)}{Array.from({length:count},(_,i)=><span key={i} className={`rounded border p-2 text-center text-lg font-bold text-amber-950 ${v.dates?.includes(i+1)?'border-amber-800 bg-amber-200':'border-amber-200 bg-amber-50'}`}>{i+1}</span>)}</div></div>;
 }else if(v.task==='fraction'){
  const parts=v.parts!,selected=(v.variant??0)%parts;
  content=<svg viewBox="0 0 600 225" className="mx-auto w-full max-w-2xl" role="img" aria-label={v.description}>
   {v.object==='ribbon'?<MeasuredRibbon x={60} y={70} width={480} height={72} colour="#b89ac9" squareEnd/>:<rect x="60" y="35" width="480" height="160" rx={0} fill={v.object==='sandwich'?'#f4d4a0':'#fff'} stroke="#9d7036" strokeWidth={v.object==='sandwich'?7:3}/>}
   {v.object==='sandwich'?<><rect x="64" y="179" width="472" height="7" fill="#78a448"/><rect x="64" y="186" width="472" height="5" fill="#edc958"/>{Array.from({length:20},(_,i)=><ellipse key={i} cx={78+i*23} cy={55+(i%3)*28} rx="2" ry="1.3" fill="#c49b60" fillOpacity=".6"/>)}</>:null}
   {Array.from({length:parts},(_,i)=>{const edges=v.unequal?((v.variant??0)%2?[0,.7,1]:[0,.3,1]):Array.from({length:parts+1},(_,j)=>j/parts);const x=60+edges[i]*480,w=(edges[i+1]-edges[i])*480;return <g key={i}>{i===selected?<rect x={x+3} y={v.object==='ribbon'?73:39} width={w-6} height={v.object==='ribbon'?66:152} fill="#8f68ac" fillOpacity=".8"/>:null}{i>0?<path d={`M${x} ${v.object==='ribbon'?70:35}V${v.object==='ribbon'?142:195}`} stroke="#513323" strokeWidth="3"/>:null}</g>})}
  </svg>;
 }else if(v.task==='precision'){
  const blocks=v.parts!,step=360/blocks;
  content=<svg viewBox="0 0 600 250" className="mx-auto w-full max-w-2xl" role="img" aria-label={v.description}>{[1,.5].map((scale,i)=><g key={i} transform={`translate(0 ${i*115})`}><text x="8" y="40" fontSize="19" fill="#513323">{i?'Small blocks':'Large blocks'}</text><MeasuredRibbon x={155} y={12} width={360-step/2} height={28} colour="#9463b0"/>{Array.from({length:blocks/scale},(_,j)=><rect key={j} x={155+j*step*scale} y="50" width={step*scale} height="30" fill={j%2?'#f6d89b':'#ffedc9'} stroke="#8b642f" strokeWidth="2"/>)}<path d={`M${155+360-step/2} 7V86`} stroke="#513323" strokeDasharray="4 3"/></g>)}</svg>;
 }else{
  const rotation=(v.variant??0)%4*90,steps=v.steps!,angle=steps*90;
  const point=(a:number,r:number)=>[300+Math.sin(a*Math.PI/180)*r,150-Math.cos(a*Math.PI/180)*r];
  const end=point(rotation+angle,90),begin=point(rotation,90);const startPointer=point(rotation,65),endPointer=point(rotation+angle,65);
  const path=steps===4?`M${begin[0]} ${begin[1]} A90 90 0 1 1 ${point(rotation+180,90).join(' ')} A90 90 0 1 1 ${begin.join(' ')}`:`M${begin.join(' ')} A90 90 0 ${steps>2?1:0} 1 ${end.join(' ')}`;
  content=<svg viewBox="0 0 600 310" className="mx-auto w-full max-w-xl" role="img" aria-label={v.description}>
   <circle cx="300" cy="150" r="110" fill="#fff" stroke="#b18a4c" strokeWidth="3"/>
   <path d={`M300 150L${startPointer.join(' ')}`} stroke="#6a4829" strokeWidth="8"/>
   <path d="M-8 12L0 0L8 12" transform={`translate(${startPointer.join(' ')}) rotate(${rotation})`} fill="none" stroke="#6a4829" strokeWidth="5"/>
   {v.showEnd?<><path d={path} fill="none" stroke="#b18438" strokeWidth="5"/><path d="M-9 -6L0 0L-9 6" transform={`translate(${end.join(' ')}) rotate(${rotation+angle})`} fill="none" stroke="#b18438" strokeWidth="4"/>{steps<4?<path d={`M300 150L${endPointer.join(' ')}`} stroke="#8d65a9" strokeWidth="6" strokeDasharray="7 4"/>:null}</>:null}
   <circle cx="300" cy="150" r="8" fill="#6a4829"/>
   <text x="105" y="275" fill="#6a4829" fontWeight="700" fontSize="20">Start: solid pointer</text>{v.showEnd?<text x="340" y="275" fill="#795092" fontWeight="700" fontSize="20">{steps===4?'Finish: back at Start':'Finish: dashed pointer'}</text>:null}
  </svg>;
 }
 return <section className="mb-5 rounded-2xl border-2 border-amber-200 bg-[#fffaf0] p-4 sm:p-6"><div className="mb-4 flex justify-end"><ReadAloudBtn text={measurement2Speech(v)} label="Read diagram" size="md"/></div><p className="mb-4 text-center text-lg font-bold text-amber-950">{v.description}</p>{content}</section>;
}
