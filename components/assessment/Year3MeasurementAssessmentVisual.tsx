"use client";
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {ClockFace} from '@/components/measurelands/MeasurelandsAnalogClockCard';
import {RulerWithObject} from '@/components/measurelands/MeasurelandsRulerCard';
import {MeasurelandsScale} from '@/components/measurelands/MeasurelandsScale';
import {MeasurelandsJug} from '@/components/measurelands/MeasurelandsJug';
import {Clock3} from 'lucide-react';
import MeasuredRibbon from './MeasuredRibbon';
import type {Measurement3Visual} from '@/data/assessments/revisions/year3MeasurementFiveForms';
export function measurement3Speech(v:Measurement3Visual){
 let extra='';
 if(v.task==='duration')extra=v.values!.length===1?`${v.values![0]} ${v.unit}.`:v.labels!.join('. ');
 if(v.task==='ribbons')extra=v.labels!.map((label,i)=>`${label}: ${v.values![i]} centimetres.`).join(' ');
 if(v.task==='benchmark')extra=`Reference: ${v.labels![0]}. Group to estimate.`;
 if(v.task==='scale')extra='Scale labels: zero, one hundred, two hundred, three hundred, four hundred, five hundred, six hundred, seven hundred, eight hundred and nine hundred grams.';
 if(v.task==='jug')extra='Scale labels: zero to one thousand millilitres, in steps of one hundred millilitres.';
 if(v.task==='ruler')extra='Ruler labels: zero to fifteen centimetres.';
 if(v.task==='angle' && v.angle===180)extra='Start. Finish.';
 return `${v.description} ${extra}`.trim();
}
function Art({path}:{path:string}){return <img src={`/images/measurelands/${path}`} alt="" width={160} height={160} className="h-28 w-28 object-contain sm:h-36 sm:w-36"/>;}
function Angle({angle,rotation=0,length=100,door=false,half=false}:{angle:number;rotation?:number;length?:number;door?:boolean;half?:boolean}){
 const r=angle*Math.PI/180,x=150+length*Math.cos(r),y=150-length*Math.sin(r),ax=150+45*Math.cos(r),ay=150-45*Math.sin(r);
 return <svg viewBox="0 0 300 290" className="mx-auto w-full max-w-xs" aria-hidden="true"><g transform={`rotate(${rotation} 150 150)`}>
  {door?<path d="M280 150H150V265" stroke="#d1b98d" strokeWidth="16" fill="none"/>:null}
  <path d={`M${150+length} 150H150L${x} ${y}`} stroke="#785228" strokeWidth="7" fill="none" strokeLinecap="round"/>
  <path d={`M195 150 A45 45 0 ${angle>180?1:0} 0 ${ax} ${ay}`} fill="none" stroke="#9465ac" strokeWidth="4"/>
  {half?<path d={`M${ax+8} ${ay-6}L${ax} ${ay}L${ax-3} ${ay-10}`} fill="none" stroke="#9465ac" strokeWidth="3"/>:null}
  <circle cx="150" cy="150" r="6" fill="#b7852d"/>
 </g>{half?<><text x={150+110*Math.cos(rotation*Math.PI/180)} y={170+110*Math.sin(rotation*Math.PI/180)} textAnchor="middle" fontSize="17" fill="#513323">Start</text><text x={150-110*Math.cos(rotation*Math.PI/180)} y={170-110*Math.sin(rotation*Math.PI/180)} textAnchor="middle" fontSize="17" fill="#513323">Finish</text></>:null}</svg>;
}
export default function Year3MeasurementAssessmentVisual({visual:v}:{visual:Measurement3Visual}){
 let content;
 if(v.task==='object')content=<div className="flex justify-center">{v.arts!.map(a=><Art key={a} path={a}/>)}</div>;
 else if(v.task==='clock')content=<div role="img" aria-label="An analogue clock with hour and minute hands and all minute marks."><div aria-hidden="true" className="flex justify-center"><ClockFace hour={v.hour!} minute={v.minute!} size={300}/></div></div>;
 else if(v.task==='ruler')content=<div className="mx-auto max-w-3xl"><RulerWithObject rulerCm={15} objectShape="pencil" object={{label:'Pencil',icon:'✏️',lengthCm:v.values![0],startCm:v.start}}/></div>;
 else if(v.task==='scale')content=<div role="img" aria-label="A kitchen scale with a needle and marks labelled in grams."><div aria-hidden="true"><MeasurelandsScale value={v.values![0]} unit="g" max={1000} majorStep={100} minorStep={100} size={310}/></div></div>;
 else if(v.task==='jug')content=<div role="img" aria-label="A measuring jug with water and marks labelled in millilitres."><div aria-hidden="true"><MeasurelandsJug value={v.values![0]} unit="mL" max={1000} majorStep={100} minorStep={100} size={300}/></div></div>;
 else if(v.task==='duration')content=<div className="flex flex-wrap justify-center gap-5">{v.values!.map((n,i)=><div key={i} className="flex min-w-56 flex-col items-center gap-4 rounded-2xl border border-amber-200 bg-white p-7"><Clock3 className="h-12 w-12 text-amber-700" aria-hidden="true"/><span className="text-center text-2xl font-black text-amber-950">{v.values!.length===1?`${n} ${v.unit}`:v.labels![i]}</span></div>)}</div>;
 else if(v.task==='benchmark')content=<div className="flex flex-wrap items-center justify-center gap-7"><div className="flex flex-col items-center rounded-2xl border border-amber-300 bg-white p-4"><span className="font-bold text-amber-950">Reference</span><Art path={v.arts![0]}/><span className="text-lg font-bold text-amber-950">{v.labels![0]}</span></div><div className="rounded-2xl border border-amber-200 bg-white p-4"><p className="mb-3 text-center font-bold text-amber-950">Group to estimate</p>{v.unit==='m'?<svg viewBox={`0 0 ${v.quantity!*120+20} 140`} className="w-full min-w-64 max-w-xl" role="img" aria-label="Desks touching end to end in one row.">{Array.from({length:v.quantity!},(_,i)=><g key={i} transform={`translate(${10+i*120} 20)`}><rect x="7" y="45" width="9" height="65" rx="2" fill="#607783"/><rect x="104" y="45" width="9" height="65" rx="2" fill="#607783"/><rect width="120" height="55" rx="2" fill="#dfb47a" stroke="#976630" strokeWidth="2"/><path d="M4 8H116" stroke="#f9dab0" strokeWidth="5"/></g>)}</svg>:<div className="flex flex-wrap justify-center gap-2">{Array.from({length:v.quantity!},(_,i)=><Art key={i} path={v.arts![0]}/>)}</div>}</div></div>;
 else if(v.task==='ribbons')content=<svg viewBox="0 0 700 250" className="mx-auto w-full max-w-3xl" role="img" aria-label={measurement3Speech(v)}>{v.values!.map((n,i)=><g key={i} transform={`translate(0 ${i*120})`}><text x="20" y="35" fill="#513323" fontSize="22" fontWeight="bold">{v.labels![i]}: {n} cm</text><MeasuredRibbon x={20} y={50} width={n*6} height={40} colour={i?'#9867b4':'#31899b'}/></g>)}</svg>;
 else content=v.compareArms?<div className="grid grid-cols-2 gap-4">{['A','B'].map((name,i)=><div key={name} className="rounded-2xl border border-amber-200 bg-white"><p className="pt-3 text-center text-xl font-black text-amber-950">{name}</p><Angle angle={v.angle!} rotation={v.rotation} length={i?110:70}/></div>)}</div>:<Angle angle={v.angle!} rotation={v.rotation} door={v.angle!<90} half={v.angle===180}/>;
 return <div className="w-full rounded-2xl border-2 border-amber-300 bg-[#fffaf0] p-4 sm:p-6"><div className="mb-4 flex justify-end"><ReadAloudBtn text={measurement3Speech(v)} size="sm" label="Read diagram" className="!border-amber-600 !bg-[#fffaf0] !text-amber-900"/></div><p className="mb-5 text-center text-lg font-bold text-amber-950">{v.description}</p>{content}</div>;
}
