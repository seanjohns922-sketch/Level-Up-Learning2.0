"use client";

import { useState } from "react";
import { Leaf, Shell } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { GroundAssessmentToken } from "./NumberNexusGroundAssessmentVisual";
import { numberName } from "@/data/assessments/candidates/prep-number/forms";
import { initialPrepNumberResponse, parsePrepNumberSubmission } from "@/data/assessments/candidates/prep-number/scoring";
import type { PrepNumberCandidate, PrepNumberResponse, Token } from "@/data/assessments/candidates/prep-number/types";

const button = "min-h-12 min-w-12 rounded-xl border-2 border-slate-400 bg-white px-3 py-2 text-lg font-bold text-slate-950 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 disabled:opacity-40";
const selected = " !border-cyan-700 !bg-cyan-100 ring-2 ring-cyan-700";

function CandidateToken({token}: {token:Token}) {
  if (token!=="leaf" && token!=="shell") return <GroundAssessmentToken token={token}/>;
  const Icon=token==="leaf" ? Leaf : Shell;
  return <span className="grid h-11 w-11 place-items-center rounded-lg border-2 border-teal-700 bg-teal-50 text-teal-800"><Icon className="h-6 w-6" aria-hidden="true"/></span>;
}

function Dots({count, layout=0, spread=false}: {count:number;layout?:number;spread?:boolean}) {
  // Same-sized objects and equivalent density across forms. Never print the total.
  const small = count<=5;
  const positions = small ? [[40,30],[100,30],[40,85],[100,85],[70,57]] : Array.from({length:20},(_,i)=>[22+(i%5)*30,20+Math.floor(i/5)*28]);
  return <svg viewBox={small ? "0 0 140 115" : "0 0 165 125"} role="img" aria-label="Dot collection" className={`mx-auto h-auto w-full ${spread ? "max-w-80" : "max-w-52"}`}>
    <g transform={small ? `rotate(${layout*12} 70 57)` : undefined}>{positions.slice(0,count).map(([x,y],i)=><circle key={i} cx={x} cy={y} r={small ? 9 : 6} fill="#0e7490" stroke="#164e63" strokeWidth="2" />)}</g>
  </svg>;
}
function Objects({count,token,spread=false}: {count:number;token:Token;spread?:boolean}) {
  return <div className={`flex flex-wrap items-center justify-center ${spread ? "gap-5" : "gap-2"}`} aria-label="Object collection">{Array.from({length:count},(_,i)=><CandidateToken key={i} token={token}/>)}</div>;
}
function Panel({label,children}: {label:string;children:React.ReactNode}) {
  return <section className="min-w-0 rounded-2xl border border-slate-300 bg-slate-50 p-3 sm:p-4"><h3 className="mb-3 text-center text-base font-bold text-slate-700">{label}</h3>{children}</section>;
}

/** Candidate interaction, shared by all five forms. No feedback, hints, answer
 * keys, correctness flags or student writes. Parent owns raw evidence and locks. */
export default function PrepNumberCandidateCard({item,value,onChange}: {item:PrepNumberCandidate;value:string|null;onChange:(value:string)=>void}) {
  const [picked,setPicked] = useState<number|null>(null);
  const [groups,setGroups] = useState(1);
  const r = parsePrepNumberSubmission(item,value)?.response ?? initialPrepNumberResponse(item);
  const t = item.task;
  function update(patch: Partial<PrepNumberResponse>) {
    onChange(JSON.stringify({itemId:item.id,version:item.version,response:{...r,...patch}}));
  }
  function numeric() {
    return <label className="flex flex-col items-center gap-2 text-lg font-bold">How many?<input aria-label="Your number" inputMode="numeric" pattern="[0-9]*" value={r.values?.[0] ?? ""} onChange={e=>update({values:/^\d+$/.test(e.target.value) ? [Number(e.target.value)] : []})} className="h-16 w-28 rounded-xl border-2 border-slate-500 bg-white text-center text-3xl text-slate-950 focus:outline-cyan-700" /></label>;
  }
  function allocation() {
    if (!r.placements) return null;
    const p = r.placements;
    const bins = t.kind==="share" ? t.recipients : t.kind==="provide" ? t.recipients : t.kind==="group" ? Math.max(groups,1,...p.map(n=>n+1)) : t.kind==="partition" || t.kind==="remove" ? 2 : 1;
    const canSupply = t.kind!=="remove" && !(t.kind==="share" && t.initial);
    const binLabel = (b:number) => b===-1 ? "Supply" : t.kind==="remove" ? (b===0 ? "Here" : "Away") : t.kind==="provide" ? `Robot ${b+1}` : t.kind==="group" ? `Group ${b+1}` : bins===1 ? "Your mat" : `Tray ${b+1}`;
    function move(b: number) {
      if (picked===null) return;
      if (t.kind==="add" && picked<t.start) return;
      update({placements:p.map((dest,i)=>i===picked ? b : dest)});
      setPicked(null);
    }
    return <div className="space-y-4">
      <p className="text-center text-base text-slate-700">Tap an object. Then tap where it belongs.</p>
      <div className="grid gap-3 sm:grid-cols-2">{[...(canSupply ? [-1] : []),...Array.from({length:bins},(_,b)=>b)].map(b=><Panel key={b} label={binLabel(b)}>
        {t.kind==="provide" && b>=0 ? <div className="mb-3 flex justify-center"><CandidateToken token="robot"/></div> : null}
        <div className="flex min-h-16 flex-wrap justify-center gap-2">{p.map((dest,i)=>dest===b ? <button key={i} type="button" aria-label={`Object in ${binLabel(b)}`} aria-pressed={picked===i} disabled={t.kind==="add" && i<t.start} onClick={()=>setPicked(picked===i ? null : i)} className={`rounded-xl p-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-cyan-700 ${picked===i ? "bg-cyan-100 ring-2 ring-cyan-700" : "bg-white"}`}><CandidateToken token={item.token}/></button> : null)}</div>
        <button type="button" disabled={picked===null} onClick={()=>move(b)} className={`${button} mt-3 w-full`}>Place here</button>
      </Panel>)}</div>
      {t.kind==="group" ? <button type="button" disabled={bins>=t.total} onClick={()=>setGroups(bins+1)} className={button}>Add a group</button> : null}
    </div>;
  }

  let content: React.ReactNode;
  switch(t.kind) {
    case "numerals": content=<div className="grid gap-5">{t.targets.map((target,i)=><Panel key={i} label={`Choose ${numberName(target)}`}><div className="mb-3 flex justify-center"><OptionReadAloudButton text={numberName(target)}/></div><div className="flex flex-wrap justify-center gap-3">{t.choices[i].map(n=><button key={n} type="button" className={button+(r.values?.[i]===n ? selected : "")} aria-pressed={r.values?.[i]===n} onClick={()=>{const v=[...(r.values ?? [-1,-1])];v[i]=n;update({values:v});}}>{n}</button>)}</div></Panel>)}</div>;break;
    case "count": content=<><Panel label="Look carefully">{t.quickLook ? <Dots count={t.count} layout={t.layout}/> : <Objects count={t.count} token={item.token}/>}</Panel>{numeric()}{t.quickLook ? <p className="text-center text-sm text-slate-600">Take the time you need.</p> : null}</>;break;
    case "combine": content=<><div className="grid grid-cols-2 gap-3">{t.parts.map((n,i)=><Panel key={i} label={`Part ${i+1}`}><Dots count={n}/></Panel>)}</div><Panel label="Whole">{numeric()}</Panel></>;break;
    case "missing": content=<><Panel label={`Whole: ${t.whole}`}><Objects count={t.whole} token={item.token}/></Panel><div className="grid grid-cols-2 gap-3"><Panel label="One part"><Dots count={t.part}/></Panel><Panel label="Other part">{numeric()}</Panel></div></>;break;
    case "pattern": content=<><Panel label="Pattern"><div className="flex flex-wrap justify-center gap-2">{t.source.map((s,i)=><CandidateToken key={i} token={s}/>)}</div></Panel><Panel label={t.copy ? "Your copy" : "What comes next?"}><div className="grid grid-cols-2 gap-3">{Array.from({length:t.blanks},(_,i)=><div key={i} className="rounded-xl border-2 border-dashed border-slate-400 p-2"><div className="mb-2 flex min-h-12 justify-center">{r.symbols?.[i] ? <CandidateToken token={r.symbols[i]}/> : <span className="text-3xl">?</span>}</div><div className="flex flex-wrap justify-center gap-1">{t.palette.map(s=><button key={s} type="button" aria-label={`Put ${s} in space ${i+1}`} aria-pressed={r.symbols?.[i]===s} onClick={()=>{const v=[...(r.symbols ?? [])];v[i]=s;update({symbols:v});}} className={`rounded-xl p-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-cyan-700 ${r.symbols?.[i]===s ? selected : ""}`}><CandidateToken token={s}/></button>)}</div></div>)}</div></Panel></>;break;
    case "order": content=<><Panel label="Smallest first"><div className="flex flex-wrap justify-center gap-2">{Array.from({length:t.cards.length},(_,i)=><span key={i} className="grid h-14 min-w-14 place-items-center rounded-xl border-2 border-dashed border-slate-400 text-2xl font-bold">{r.values?.[i] ?? "?"}</span>)}</div></Panel><div className="flex flex-wrap justify-center gap-3">{t.cards.map(n=><button key={n} type="button" disabled={r.values?.includes(n)} className={button} onClick={()=>update({values:[...(r.values ?? []),n]})}>{n}</button>)}</div><button type="button" className={button} onClick={()=>update({values:(r.values ?? []).slice(0,-1)})}>Undo last</button></>;break;
    case "match": content=<><Panel label="Match this card"><Dots count={t.count} layout={t.layout}/></Panel><div className="grid grid-cols-3 gap-2">{t.choices.map((n,i)=><button key={i} type="button" aria-label={`Card ${String.fromCharCode(65+i)}`} aria-pressed={r.choice===i} className={`rounded-xl border-2 border-slate-400 bg-white p-2 focus-visible:outline focus-visible:outline-4 focus-visible:outline-cyan-700 ${r.choice===i ? selected : ""}`} onClick={()=>update({choice:i})}><span className="font-bold">{String.fromCharCode(65+i)}</span><Dots count={n} layout={(t.layout+1)%5}/></button>)}</div></>;break;
    case "compare": content=<><div className="grid grid-cols-2 gap-3">{[t.a,t.b].map((n,col)=><Panel key={col} label={col===0 ? "A" : "B"}><div className={`flex flex-wrap justify-center ${col===0 ? "gap-2" : "gap-4"}`}>{Array.from({length:n},(_,i)=><button key={i} type="button" aria-label={`Object in ${col===0 ? "A" : "B"}`} aria-pressed={col===0 && picked===i} className={`relative rounded-xl p-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-cyan-700 ${col===0 && picked===i ? selected : "bg-white"}`} onClick={()=>{if(col===0){setPicked(i);return;}if(picked!==null){const pairs=[...(r.pairs ?? [])].map(v=>v===i ? -1 : v);pairs[picked]=i;update({pairs});setPicked(null);}}}><CandidateToken token={item.token}/>{(col===0 ? r.pairs?.[i]!==-1 : r.pairs?.includes(i)) ? <span className="absolute -right-1 -top-2 rounded-full bg-slate-800 px-1.5 text-xs text-white">{col===0 ? i+1 : (r.pairs?.indexOf(i) ?? 0)+1}</span> : null}</button>)}</div></Panel>)}</div><p className="text-center text-slate-700">Tap an object in A, then one in B to make a pair.</p><div className="flex justify-center gap-3">{["A has more","B has more"].map((label,i)=><button key={label} type="button" className={button+(r.choice===i ? selected : "")} onClick={()=>update({choice:i})}>{label}</button>)}</div><button type="button" className={button} onClick={()=>{update({pairs:Array<number>(t.a).fill(-1)});setPicked(null);}}>Clear pairs</button></>;break;
    case "conserve": content=<><Panel label="Before"><Objects count={t.count} token={item.token}/></Panel><Panel label="After spreading out"><Objects count={t.count} token={item.token} spread/></Panel>{numeric()}<div className="grid gap-3">{t.reasons.map(reason=><div key={reason} className="flex items-center gap-2"><button type="button" className={`${button} flex-1 text-left ${r.reason===reason ? selected : ""}`} onClick={()=>update({reason})}>{reason}</button><OptionReadAloudButton text={reason}/></div>)}</div></>;break;
    default: content=<>{t.kind==="partition" && t.previous ? <Panel label="First way"><div className="grid grid-cols-2 gap-3">{t.previous.map((n,i)=><Objects key={i} count={n} token={item.token}/>)}</div></Panel> : null}{allocation()}</>;
  }
  return <div className="space-y-5 rounded-2xl border border-cyan-900/20 bg-white p-4 text-slate-950 shadow-sm sm:p-6">{content}</div>;
}
