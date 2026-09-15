"use client";

import { PlaceValueBlocks } from "@/components/assessment/PlaceValueBlocks";
import { useState } from "react";
import Image from "next/image";
import { Bird, Car, Sailboat, Shell, Leaf, Circle, Square } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { YEAR1_NUMBER_CANDIDATE_SPECS } from "@/data/assessments/candidates/year1-number/authoring";
import { scoreYear1NumberSubmission, type Year1NumberResponse } from "@/data/assessments/candidates/year1-number/scoring";

type Item=typeof YEAR1_NUMBER_CANDIDATE_SPECS.pretest[number];
const control="min-h-12 min-w-12 rounded-xl border-2 border-teal-800/40 bg-white px-3 py-2 text-lg font-bold text-slate-950 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-40";
const active=" !border-teal-700 !bg-teal-100 ring-2 ring-teal-600";
function Panel({label,children}:{label:string;children:React.ReactNode}) {
  return <section className="min-w-0 space-y-3 rounded-2xl border border-teal-900/20 bg-[#f8fbfc] p-3 sm:p-4"><h3 className="text-center text-base font-bold text-slate-700">{label}</h3>{children}</section>;
}
function Token({material}:{material:string}) {
  if(material==="frogs") return <span className="grid h-10 w-10 place-items-center rounded-lg border border-teal-700 bg-teal-50 text-2xl" role="img" aria-label="frog">🐸</span>;
  const Icon=material==="birds" || material==="ducks" ? Bird : material==="cars" ? Car : material==="boats" ? Sailboat : material==="shells" ? Shell : material==="leaves" ? Leaf : material==="cards" ? Square : Circle;
  return <span className="grid h-10 w-10 place-items-center rounded-lg border border-teal-700 bg-teal-50 text-teal-900"><Icon size={25} aria-hidden="true"/></span>;
}
function Blocks({tens,ones}:{tens:number;ones:number}) {
  return <PlaceValueBlocks tens={tens} ones={ones} />;
}
function Shape({symbol}:{symbol:string}) {
  const [colour,shape]=symbol.split("-");
  const fill=colour==="blue" ? "#2563eb" : colour==="red" ? "#dc2626" : "#d97706";
  return <svg viewBox="0 0 48 48" role="img" aria-label={symbol.replace("-"," ")} className="h-10 w-10"><g fill={fill} stroke="#172b36" strokeWidth="2">{shape==="circle" ? <circle cx="24" cy="24" r="17"/> : shape==="square" ? <rect x="7" y="7" width="34" height="34" rx="2"/> : <path d="M24 5L44 42H4Z"/>}</g></svg>;
}

/** Same renderer for all five forms. Parent owns response and submission lock. */
export default function Year1NumberCandidateCard({item,value,onChange}:{item:Item;value:string|null;onChange:(value:string)=>void}) {
  const [picked,setPicked]=useState<number[]>([]);
  const [groupCount,setGroupCount]=useState(1);
  const [scratch,setScratch]=useState(false);
  const [scratchCount,setScratchCount]=useState(0);
  const r=scoreYear1NumberSubmission(item,value).response ?? {};
  const t=item.task;
  function update(patch:Partial<Year1NumberResponse>) {onChange(JSON.stringify({itemId:item.id,version:item.version,response:{...r,...patch}}));}
  function number(label="Your answer",position=0) {
    return <label className="flex flex-col items-center gap-2 text-base font-bold text-slate-700">{label}<input aria-label={label} inputMode="numeric" pattern="[0-9]*" value={r.values?.[position] ?? ""} onChange={e=>{const values=[...(r.values ?? [])];values[position]=/^\d+$/.test(e.target.value) ? Number(e.target.value) : NaN;update({values});}} className="h-14 w-28 rounded-xl border-2 border-teal-800/50 bg-white text-center text-2xl text-slate-950 focus:outline-teal-600"/></label>;
  }
  function model(position=0,label="Your model",withAnswer=false) {
    const current=r.models?.[position] ?? {tens:0,ones:0};
    function change(key:"tens"|"ones",delta:number) {
      const models=Array.from({length:Math.max(position+1,r.models?.length ?? 0)},(_,i)=>r.models?.[i] ?? {tens:0,ones:0});
      models[position]={...current,[key]:Math.max(0,Math.min(key==="tens" ? 12 : 20,current[key]+delta))};
      update({models});
    }
    return <Panel label={label}><Blocks {...current}/><div className="flex flex-wrap justify-center gap-5">{(["tens","ones"] as const).map(key=><div key={key} className="flex items-center gap-2"><button type="button" className={control} aria-label={`Remove ${key} from ${label}`} disabled={current[key]===0} onClick={()=>change(key,-1)}>−</button><span className="min-w-14 text-center font-bold">{current[key]} {key}</span><button type="button" className={control} aria-label={`Add ${key} to ${label}`} disabled={current[key]===(key==="tens" ? 12 : 20)} onClick={()=>change(key,1)}>+</button></div>)}</div>{withAnswer ? number(`${label}: number`,position) : null}</Panel>;
  }
  function reasons(choices:string[]) {return <div className="grid gap-3">{choices.map(reason=><div key={reason} className="flex items-center gap-2"><button type="button" className={`${control} flex-1 text-left ${r.reason===reason ? active : ""}`} aria-pressed={r.reason===reason} onClick={()=>update({reason})}>{reason}</button><OptionReadAloudButton text={reason}/></div>)}</div>;}
  function allocation(total:number,initial:number[]|undefined,labels:string[]|null,material:string) {
    const placements=r.placements ?? initial ?? Array<number>(total).fill(-1);
    const bins=labels?.length ?? Math.max(groupCount,1,...placements.map(n=>n+1));
    function move(bin:number) {update({placements:placements.map((dest,i)=>picked.includes(i) ? bin : dest)});setPicked([]);}
    return <div className="space-y-3"><p className="text-center text-slate-700">Tap one or more objects. Then choose where to put them.</p><div className="grid gap-3 sm:grid-cols-2">{[-1,...Array.from({length:bins},(_,i)=>i)].map(bin=><Panel key={bin} label={bin<0 ? "Objects to place" : labels?.[bin] ?? `Group ${bin+1}`}><div className="flex min-h-12 flex-wrap justify-center gap-1">{placements.map((dest,i)=>dest===bin ? <button key={i} type="button" aria-label={`Select object in ${bin<0 ? "supply" : labels?.[bin] ?? `group ${bin+1}`}`} aria-pressed={picked.includes(i)} className={`rounded-xl p-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-600 ${picked.includes(i) ? active : ""}`} onClick={()=>setPicked(p=>p.includes(i) ? p.filter(n=>n!==i) : [...p,i])}><Token material={material}/></button> : null)}</div><button type="button" className={`${control} w-full`} disabled={!picked.length} onClick={()=>move(bin)}>Place selected here</button></Panel>)}</div>{!labels ? <button type="button" className={control} disabled={bins>=total} onClick={()=>setGroupCount(bins+1)}>Add a group</button> : null}</div>;
  }
  function patternInput(key:"symbols"|"unit",length:number,palette:string[],label:string) {
    const symbols=r[key] ?? [];
    return <Panel label={label}><div className="flex flex-wrap justify-center gap-2">{Array.from({length},(_,i)=><span key={i} className="grid h-12 w-12 place-items-center rounded-xl border-2 border-dashed border-slate-400">{symbols[i] ? <Shape symbol={symbols[i]}/> : "?"}</span>)}</div><div className="flex flex-wrap justify-center gap-3">{palette.map(s=><button key={s} type="button" className={control} disabled={symbols.length>=length} aria-label={`Add ${s.replace("-"," ")} to ${label}`} onClick={()=>update({[key]:[...symbols,s]})}><Shape symbol={s}/></button>)}</div><button type="button" className={control} disabled={!symbols.length} onClick={()=>update({[key]:symbols.slice(0,-1)})}>Undo last shape</button></Panel>;
  }
  let content:React.ReactNode;
  switch(t.kind) {
    case "build-tens": content=model();break;
    case "order": content=<><Panel label="Smallest first"><div className="flex flex-wrap justify-center gap-3">{Array.from({length:4},(_,i)=><span key={i} className="grid h-14 min-w-16 place-items-center rounded-xl border-2 border-dashed border-slate-400 text-2xl font-bold">{r.values?.[i] ?? "?"}</span>)}</div></Panel><div className="flex flex-wrap justify-center gap-3">{t.cards.map(n=><button key={n} type="button" className={control} disabled={r.values?.includes(n)} onClick={()=>update({values:[...(r.values ?? []),n]})}>{n}</button>)}</div><button type="button" className={control} onClick={()=>update({values:(r.values ?? []).slice(0,-1)})}>Undo last number</button></>;break;
    case "number-line": content=<Panel label="Number line"><svg viewBox="0 0 660 95" className="w-full" role="img" aria-label="Number line from 100 to 120, marked in ones"><path d="M30 38H630" stroke="#164e63" strokeWidth="3"/>{Array.from({length:21},(_,i)=><g key={i}><path d={`M${30+i*30} 29v18`} stroke="#164e63" strokeWidth="2"/>{i%10===0 ? <text x={30+i*30} y="77" textAnchor="middle" fontSize="22" fill="#172b36">{100+i}</text> : null}</g>)}{r.values?.[0]!==undefined ? <circle cx={30+(r.values[0]-100)*30} cy="38" r="9" fill="#0d9488"/> : null}</svg><input type="range" min={0} max={20} step={1} value={(r.values?.[0] ?? 100)-100} onChange={e=>update({values:[100+Number(e.target.value)]})} aria-label="Place your point on the number line" className="h-12 w-full accent-teal-700"/><div className="flex items-center justify-center gap-3"><button type="button" className={control} aria-label="Move point one left" disabled={r.values?.[0]===undefined || r.values[0]<=100} onClick={()=>update({values:[r.values![0]-1]})}>←</button><span className="min-w-20 text-center text-2xl font-bold">{r.values?.[0]===undefined ? "Place a point" : "Your point"}</span><button type="button" className={control} aria-label="Move point one right" onClick={()=>update({values:[Math.min(120,(r.values?.[0] ?? 99)+1)]})} disabled={r.values?.[0]===120}>→</button></div></Panel>;break;
    case "two-partitions": {const parts=r.parts ?? [0,0];content=<><Panel label={`First: split ${t.small} into two nonempty parts`}><div className="grid gap-3 sm:grid-cols-2">{parts.map((count,i)=><Panel key={i} label={`Part ${i+1}`}><div className="flex min-h-12 flex-wrap justify-center gap-1">{Array.from({length:count},(_,j)=><Token key={j} material={item.materials}/>)}</div><div className="flex justify-center gap-2"><button type="button" className={control} disabled={count===0} aria-label={`Remove object from part ${i+1}`} onClick={()=>{const next:[number,number]=[...parts];next[i]--;update({parts:next});}}>−</button><button type="button" className={control} disabled={count>=10} aria-label={`Add object to part ${i+1}`} onClick={()=>{const next:[number,number]=[...parts];next[i]++;update({parts:next});}}>+</button></div></Panel>)}</div></Panel><Panel label={`This is ${t.large}`}><Blocks tens={Math.floor(t.large/10)} ones={t.large%10}/></Panel>{model(0,"Now show the same number with one fewer ten")}</>;break;}
    case "count-tens": content=<><Panel label="Count the grouped objects"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({length:12},(_,i)=><div key={i} className="grid grid-cols-5 gap-1 rounded-lg border border-teal-800/30 bg-white p-2">{Array.from({length:10},(_,j)=><span key={j} className="aspect-square rounded-full border border-teal-900 bg-teal-400"/>)}</div>)}</div></Panel>{number("How many objects altogether?")}</>;break;
    case "make-groups": content=<>{allocation(t.total,undefined,null,item.materials)}{number("How many objects altogether?")}</>;break;
    case "add": case "subtract": content=<><Panel label="Work out the answer"><p className="text-center text-4xl font-bold">{t.kind==="add" ? `${t.left} + ${t.right}` : `${t.whole} − ${t.removed}`} = ?</p>{number()}</Panel><details open={scratch} onToggle={e=>setScratch(e.currentTarget.open)} className="rounded-xl border border-teal-800/20 p-3"><summary className="cursor-pointer text-slate-700">Use counters if you want</summary><div className="mx-auto my-3 grid max-w-sm grid-cols-5 gap-2">{Array.from({length:20},(_,i)=><span key={i} className={`aspect-square rounded-lg border border-slate-400 ${i<scratchCount ? "bg-teal-500" : "bg-white"}`}/>)}</div><div className="flex justify-center gap-3"><button type="button" className={control} disabled={scratchCount===0} onClick={()=>setScratchCount(n=>n-1)}>Remove counter</button><button type="button" className={control} disabled={scratchCount===20} onClick={()=>setScratchCount(n=>n+1)}>Add counter</button></div></details></>;break;
    case "missing-part": content=<><Panel label={`Whole: ${t.whole}`}><div className="grid grid-cols-2 gap-3"><Panel label="One part"><p className="text-center text-3xl font-bold">{t.known}</p></Panel><Panel label="Missing part">{number("Missing part")}</Panel></div></Panel>{reasons(t.reasonChoices)}</>;break;
    case "addition-story": content=<>{allocation(t.initial+t.arrive,undefined,["Here at first","Arriving"],t.objects)}{number(`How many ${t.objects} now?`)}</>;break;
    case "subtraction-story": content=<>{allocation(t.initial,Array<number>(t.initial).fill(0),["Staying","Leaving"],t.objects)}{number(`How many ${t.objects} stay?`)}</>;break;
    case "money": {const paid=r.paidCoinIds ?? [];content=<><Panel label={`${t.object[0].toUpperCase()+t.object.slice(1)} price: $${t.price}`}><p className="text-center text-slate-700">Tap coins to pay. Tap a paid coin to put it back.</p></Panel><div className="grid gap-3 sm:grid-cols-2">{[false,true].map(isPaid=><Panel key={String(isPaid)} label={isPaid ? "Paid" : "Your wallet"}><div className="flex min-h-20 flex-wrap items-center justify-center gap-2">{t.wallet.map((coin,i)=>paid.includes(i)===isPaid ? <button key={i} type="button" className={`${control} !p-1`} aria-label={`${isPaid ? "Return" : "Pay"} a ${coin} dollar coin`} onClick={()=>update({paidCoinIds:paid.includes(i) ? paid.filter(n=>n!==i) : [...paid,i]})}><Image src={`/coins/coin-${coin}.png`} alt={`$${coin}`} width={coin===1 ? 64 : 52} height={coin===1 ? 64 : 52}/></button> : null)}</div></Panel>)}</div>{number("Dollars left")}</>;break;}
    case "share": content=<>{allocation(t.total,undefined,["Child 1","Child 2","Child 3"],t.objects)}{number("How many does each child get?")}</>;break;
    case "group": content=<>{allocation(t.total,undefined,null,t.objects)}{number("How many groups?")}</>;break;
    case "unequal-share": content=<><div className="grid gap-3 sm:grid-cols-3">{t.groups.map((n,i)=><Panel key={i} label={`Tray ${i+1}`}><div className="flex flex-wrap justify-center gap-1">{Array.from({length:n},(_,j)=><Token key={j} material={item.materials}/>)}</div></Panel>)}</div><div className="flex justify-center gap-3">{["Yes","No"].map(choice=><button key={choice} type="button" className={control+(r.choice===choice ? active : "")} aria-pressed={r.choice===choice} onClick={()=>update({choice})}>{choice}</button>)}</div>{reasons(t.reasonChoices)}</>;break;
    case "skip-two": content=<Panel label="Number pattern"><div className="flex flex-wrap items-center justify-center gap-3">{t.terms.map((n,i)=>n===null ? <div key={i}>{number(`Missing number ${i-2}`,i-3)}</div> : <span key={i} className="grid h-14 min-w-14 place-items-center rounded-xl border-2 border-teal-800/30 bg-white text-2xl font-bold">{n}</span>)}</div></Panel>;break;
    case "create-tens": content=<>{Array.from({length:3},(_,i)=><div key={i}>{model(i,`Step ${i+1}`,true)}</div>)}</>;break;
    case "continue-pattern": case "create-pattern": {const palette=[t.unit[1],t.unit[2],t.unit[0]];content=<><Panel label={t.kind==="continue-pattern" ? "Pattern" : "Repeating part"}><div className="flex flex-wrap justify-center gap-2">{(t.kind==="continue-pattern" ? [...t.unit,...t.unit] : t.unit).map((s,i)=><Shape key={i} symbol={s}/>)}</div></Panel>{t.kind==="continue-pattern" ? <>{patternInput("unit",3,palette,"Repeating part")}{patternInput("symbols",3,palette,"Next three shapes")}</> : patternInput("symbols",9,palette,"Your three repeats")}</>;break;}
  }
  return <div className="space-y-5 rounded-2xl border border-teal-800/20 bg-white p-3 text-slate-950 sm:p-5">{content}</div>;
}
