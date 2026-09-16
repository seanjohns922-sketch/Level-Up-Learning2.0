"use client";
import type {ReactNode} from 'react';
import Image from 'next/image';
import AssessmentWorkspace from "./AssessmentWorkspace";
import {needsFullWidthAssessment} from "@/lib/assessment-layout";
import AssessmentQuestionCard from './AssessmentQuestionCard';
import type {Level3Visual,NumberLevel3ReviewItem} from '@/data/assessments/revisions/year3NumberFiveForms';
const fmt=(n:number)=>n.toLocaleString('en-AU');
const panel='rounded-2xl border border-slate-300 bg-white p-4 text-slate-950 sm:p-6';
function Frame({label,children}:{label:string;children:ReactNode}) {return <section aria-label={label} className="mb-6 rounded-2xl border border-teal-300/30 bg-[#edf7f6] p-4 text-slate-950 shadow-sm sm:p-6">{children}</section>;}
function FractionStrip({parts,filled}:{parts:number;filled:number}) {return <div className="flex h-14 overflow-hidden rounded-lg border-2 border-teal-950" role="img" aria-label={`${filled} of ${parts} equal parts shaded`}>{Array.from({length:parts},(_,i)=><span key={i} className={`flex-1 border-r border-teal-950 last:border-r-0 ${i<filled?'bg-teal-600':'bg-white'}`}/>)}</div>;}
function Coin({cents}:{cents:number}) {
 const file=cents>=100?`coin-${cents/100}.png`:`coin-${cents}c.png`;
 const size=cents===200?76:cents===100?90:cents===20?100:82;
 return <Image src={`/coins/${file}`} alt={cents>=100?`Australian ${cents/100} dollar coin`:`Australian ${cents} cent coin`} width={size} height={size} unoptimized className="shrink-0 object-contain"/>;
}
function CanIllustration({damaged=false}:{damaged?:boolean}) {
 return <svg viewBox="0 0 100 120" className="mx-auto mb-3 h-24 w-20" aria-hidden="true">
  <path d={damaged?'M22 20H78V46L70 57L78 72V99Q50 115 22 99V68L29 56L22 45Z':'M22 20H78V99Q50 115 22 99Z'} fill="#d7e5e7" stroke="#48666b" strokeWidth="2"/>
  <path d="M24 42Q50 51 76 42V83Q50 93 24 83Z" fill="#0f766e"/>
  <ellipse cx="50" cy="20" rx="28" ry="10" fill="#edf3f4" stroke="#48666b" strokeWidth="2"/>
  <ellipse cx="50" cy="20" rx="10" ry="4" fill="none" stroke="#64858b" strokeWidth="2"/>
  <path d="M38 63L45 51L51 62M61 60L68 71L55 71M48 77L35 77L40 66" fill="none" stroke="#ccfbf1" strokeWidth="3" strokeLinecap="round"/>
  {damaged?<path d="M69 48L60 60L70 66L63 82" fill="none" stroke="#334155" strokeWidth="3"/>:null}
 </svg>;
}
function TicketIllustration() {
 return <svg viewBox="0 0 130 100" className="mx-auto mb-3 h-24 w-28" aria-hidden="true">
  <path d="M14 18H116V40Q102 50 116 60V82H14V60Q28 50 14 40Z" fill="#fef3c7" stroke="#927343" strokeWidth="2"/>
  <path d="M91 20V80" stroke="#927343" strokeWidth="2" strokeDasharray="4 4"/>
  <path d="M24 29H81M24 71H81" stroke="#c3a465" strokeWidth="2"/>
  <path d="M53 35L58 45L70 47L61 55L63 67L53 61L43 67L45 55L36 47L48 45Z" fill="#0f766e"/>
  <path d="M99 32H108M99 39H108M99 46H108M99 53H108M99 60H108M99 67H108" stroke="#927343" strokeWidth="2"/>
 </svg>;
}
function Visual({v}:{v:Level3Visual}) {
 switch(v.kind){
 case 'place':return <Frame label="Place-value chart"><div className="grid grid-cols-5 overflow-hidden rounded-xl border border-teal-800">{['Ten thousands','Thousands','Hundreds','Tens','Ones'].map((name,i)=><div key={name} className="border-r border-teal-800 last:border-r-0"><div className="flex min-h-16 items-center justify-center bg-teal-950 p-2 text-center text-xs font-bold text-teal-50 sm:text-base">{name}</div><div className="bg-white py-6 text-center text-3xl font-black sm:text-5xl">{v.parts[i]/10**(4-i)}</div></div>)}</div></Frame>;
 case 'cards':return null; // The existing ordering widget supplies movable numeral cards.
 case 'round':{const lower=Math.floor(v.value/v.step)*v.step,upper=lower+v.step;return <Frame label="Rounding interval"><div className="text-center text-3xl font-black">{fmt(v.value)}</div><svg viewBox="0 0 640 100" className="mt-3 w-full" role="img" aria-label={`Interval from ${lower} to ${upper}`}><path d="M50 35H590 M50 20V50 M590 20V50" fill="none" stroke="#0f766e" strokeWidth="4"/><text x="50" y="85" textAnchor="middle" fontSize="24" fill="#0f172a">{fmt(lower)}</text><text x="590" y="85" textAnchor="middle" fontSize="24" fill="#0f172a">{fmt(upper)}</text></svg></Frame>;}
 case 'estimate':return <Frame label="Collection totals"><div className="grid grid-cols-2 gap-4">{v.amounts.map((n,i)=><div key={i} className={panel}><div className="text-sm font-bold text-teal-800">Collection {i+1}</div><svg viewBox="0 0 100 55" className="mx-auto my-2 h-16" aria-hidden="true"><rect x="18" y="3" width="65" height="38" rx="5" fill="#bce4df" stroke="#0f766e"/><rect x="12" y="9" width="65" height="38" rx="5" fill="#e0f2f1" stroke="#0f766e"/><rect x="6" y="15" width="65" height="38" rx="5" fill="#fff" stroke="#0f766e"/></svg><div className="text-center text-3xl font-black">{n} <span className="text-base font-semibold">{v.unit}</span></div></div>)}</div></Frame>;
 case 'equation':return <Frame label="Number sentence"><div className="py-7 text-center text-3xl font-black tracking-wide sm:text-5xl">{v.expression}</div></Frame>;
 case 'money':{const coins=[...Array(Math.floor(v.dollars/2)).fill(200),...(v.dollars%2?[100]:[]),...Array(v.twenties).fill(20)];return <Frame label="Australian coin values"><div className={panel}><div className="mb-4 text-sm font-bold uppercase tracking-wider text-teal-800">Money you have</div><div className="flex flex-wrap items-center justify-center gap-3">{coins.map((c,i)=><Coin key={i} cents={c}/>)}</div></div>{v.targetCoin?<div className="mt-4 flex items-center justify-center gap-4 rounded-xl border border-dashed border-teal-700 bg-white p-3"><Coin cents={v.targetCoin}/><span className="text-xl font-bold">How many of these?</span></div>:null}</Frame>;}
 case 'story':return <Frame label="Problem information"><div className="grid gap-3 sm:grid-cols-3">{v.stages.map((s,i)=><div key={s.label} className={panel}><div className="mb-2 flex items-center gap-2 text-sm font-bold text-teal-800"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100">{i+1}</span>{s.label}</div>{v.unit==='cans'?<CanIllustration damaged={i===2}/>:v.unit==='tickets'?<TicketIllustration/>:null}<div className="py-2 text-4xl font-black">{s.value}</div><div className="text-lg text-slate-600">{v.unit}</div></div>)}</div></Frame>;
 case 'groups':return <Frame label={`${v.groups} bags with ${v.size} oranges in each`}><div className="flex flex-wrap justify-center gap-4">{Array.from({length:v.groups},(_,i)=><div key={i} className="w-28 text-center"><svg viewBox="0 0 110 100" className="h-28 w-28" aria-hidden="true"><path d="M24 23 Q55 10 86 23L97 86Q55 100 13 86Z" fill="#f7e2bd" stroke="#967041" strokeWidth="2"/><path d="M37 28V14Q55 -1 73 14V28" fill="none" stroke="#967041" strokeWidth="4"/><circle cx="55" cy="58" r="20" fill="#ea9035" stroke="#a64e12" strokeWidth="2"/><path d="M55 38Q59 25 71 29Q67 40 55 38" fill="#267754"/></svg><div className="text-lg font-bold">{v.size} oranges</div></div>)}</div></Frame>;
 case 'array':return <Frame label={`${v.rows} rows with ${v.columns} counters in each row`}><div className="mx-auto w-fit max-w-full"><div className="mb-3 text-center text-lg font-bold">{v.columns} in each row</div><div className="flex items-center gap-3"><span className="text-sm font-bold">{v.rows}<br/>rows</span><div className="grid gap-1 rounded-xl border border-teal-300 bg-white p-3 sm:gap-2 sm:p-4" style={{gridTemplateColumns:`repeat(${v.columns},minmax(0,1fr))`}}>{Array.from({length:v.rows*v.columns},(_,i)=><span key={i} className="h-4 w-4 rounded-full border-2 border-teal-800 bg-teal-400 sm:h-7 sm:w-7"/>)}</div></div></div></Frame>;
 case 'algorithm':return <Frame label="Number algorithm"><div className="mx-auto max-w-xl text-center"><div className={`${panel} text-2xl font-black`}>Start: {v.start}</div><div aria-hidden="true" className="py-1 text-2xl">↓</div><div className="rounded-2xl border-2 border-teal-800 bg-teal-100 p-4 text-xl font-bold">Is the number even?</div><div className="grid grid-cols-2 gap-4 py-4"><div><div className="mb-2 font-bold">Yes ↓</div><div className={panel}>Halve it</div></div><div><div className="mb-2 font-bold">No ↓</div><div className={panel}>Add 5</div></div></div><div className={`${panel} text-xl font-bold`}>Then add {v.extra}</div><div className="mt-3 text-xl font-black">Final number: ?</div></div></Frame>;
 case 'fractionChoices':return <Frame label="Fraction models"><div className="space-y-4">{v.models.map((m,i)=><div key={i} className="flex items-center gap-4"><span className="w-6 text-xl font-black">{'ABCDE'[i]}</span><div className="flex-1"><FractionStrip parts={m.denominator} filled={m.numerator}/></div></div>)}</div></Frame>;
 case 'completeWhole':return <Frame label="One whole split into ten equal parts"><div className="mb-3 flex justify-between text-lg font-bold"><span>{v.filled}/10 already shaded</span><span>One whole</span></div><FractionStrip parts={v.denominator} filled={v.filled}/><p className="mt-3 text-center text-lg font-semibold">More tenths needed: ?</p></Frame>;
 case 'fractionOrder':return null; // Existing response cards show the fraction strips.
 case 'numberLine':return null; // Interactive number line below is the visual and response.
 }
}
export default function NumberLevel3QuestionCard({question,value,onChange}:{question:NumberLevel3ReviewItem;value:string;onChange:(value:string)=>void}){
 const v=question.visual;
 if(v.kind==='numberLine') return <Frame label="Choose a point on the number line"><div className="mb-4 text-center text-xl font-bold">0 to 1 · equal tenths</div><div className="overflow-x-auto pb-2"><div className="min-w-[484px]"><div className="relative mx-auto flex max-w-3xl justify-between pt-5"><div aria-hidden="true" className="absolute inset-x-5 top-[2.6rem] h-1 bg-teal-900"/>{Array.from({length:v.denominator+1},(_,i)=>{const answer=`${i}/${v.denominator}`;return <button key={i} type="button" aria-label={`Point ${i} of ${v.denominator} equal intervals`} aria-pressed={value===answer} onClick={()=>onChange(answer)} className={`relative z-10 flex h-12 min-w-6 flex-1 items-center justify-center rounded-lg focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:min-w-11 ${value===answer?'bg-teal-200':'hover:bg-teal-100'}`}><span className={`h-6 w-1 ${value===answer?'bg-teal-800':'bg-slate-600'}`}/>{value===answer?<span className="absolute top-0 h-4 w-4 rounded-full border-2 border-teal-950 bg-teal-400"/>:null}</button>})}</div><div className="mx-auto mt-2 flex max-w-3xl justify-between px-3 text-xl font-black"><span>0</span><span>1</span></div></div></div></Frame>;
 return <AssessmentWorkspace realmId="number" visual={v.kind==='fractionOrder'?null:<Visual v={v}/>} wide={needsFullWidthAssessment(question.type ?? "mcq", v as unknown as Record<string,unknown>, 'number')} responseKind={question.type==='numeric'?'numeric':'choices'}><AssessmentQuestionCard question={{...question,visual:undefined,showFractionModels:v.kind!=='fractionOrder'}} value={value} onChange={onChange} realmId="number"/></AssessmentWorkspace>;
}
