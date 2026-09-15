"use client";

import { BadgePercent, Landmark, Scale, Package, Utensils, Building2 } from "lucide-react";
import NumberNexusYear5AssessmentVisual from "@/components/assessment/NumberNexusYear5AssessmentVisual";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { Fraction } from "@/components/FractionText";

type Visual = Record<string, unknown>;

function Surface({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-cyan-900/15 bg-[#f8fbfc] p-4 text-slate-950 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-5">{children}</div>;
}

function Rows({ rows }: { rows: Array<[string, string]> }) {
  return <div className="mx-auto grid max-w-xl divide-y divide-slate-200 overflow-hidden rounded-lg border border-cyan-900/15 bg-white">{rows.map(([label, value]) => <div key={`${label}-${value}`} className="grid grid-cols-[1fr_auto] items-center gap-6 px-4 py-3"><span className="font-semibold text-slate-600">{label}</span><span className="text-xl font-black">{value}</span></div>)}</div>;
}

function ReadableVisual({ text, children }: { text: string; children: React.ReactNode }) {
  return <div className="relative"><div className="absolute right-3 top-3 z-10"><OptionReadAloudButton text={text} /></div>{children}</div>;
}

function FractionExpression({ expression }: { expression: string }) {
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
      {expression.split(/(\?\/\d+|\d+\/\d+)/g).map((part, index) => {
        const match = part.match(/^(\?|\d+)\/(\d+)$/);
        return match
          ? <Fraction key={`${part}-${index}`} numerator={match[1]} denominator={match[2]} size="lg" />
          : <span key={`${part}-${index}`}>{part}</span>;
      })}
    </span>
  );
}

function mappedVisualReadAloud(type: string, visual: Visual) {
  if (type === "number_y6_integer_set" || type === "number_y6_fraction_set") {
    return `Values: ${((visual.values as Array<string | number> | undefined) ?? []).join(", ")}.`;
  }
  if (type === "number_y6_number_card") return `Number: ${String(visual.number ?? "")}.`;
  if (type === "number_y6_constraint") {
    return `Conditions: ${((visual.rules as string[] | undefined) ?? []).join(", ")}.`;
  }
  if (type === "number_y6_number_line") {
    return `Number line from ${String(visual.min ?? 0)} to ${String(visual.max ?? 1)}, divided into ${String(visual.divisions ?? "")} equal intervals. A point is marked on the line.`;
  }
  if (type === "number_y6_claim") return `${String(visual.label ?? "Student's result")}: ${String(visual.statement ?? "")}.`;
  return String(visual.expression ?? "");
}

const money = (value:unknown) => Number(value).toLocaleString('en-AU',{style:'currency',currency:'AUD'});
function DataCard({label,value,note}:{label:string;value:React.ReactNode;note?:string}) {
 return <div className="rounded-xl border border-teal-900/20 bg-white p-5 text-center"><div className="text-sm font-black text-teal-800">{label}</div><div className="my-3 text-3xl font-black text-slate-950">{value}</div>{note?<div className="text-sm font-semibold text-slate-600">{note}</div>:null}</div>;
}
function CoordinateGrid({points}:{points:Array<{x:number;y:number;label:string}>}) {
 const ticks=Array.from({length:13},(_,i)=>i-6);
 return <svg viewBox="0 0 380 380" className="mx-auto w-full max-w-[420px]" role="img" aria-label="Cartesian grid with labelled axes and point P marked"><rect x="20" y="20" width="340" height="340" rx="12" fill="white" stroke="#b7d4d0"/>{ticks.map(t=><g key={t}><path d={`M${190+t*24} 46V334 M46 ${190+t*24}H334`} stroke={t===0?'#24434a':'#d4e6e4'} strokeWidth={t===0?2:1}/>{t!==0?<><text x={190+t*24} y="207" textAnchor="middle" fontSize="12" fill="#294850">{t}</text><text x="179" y={194-t*24} textAnchor="end" fontSize="12" fill="#294850">{t}</text></>:null}</g>)}<text x="179" y="207" textAnchor="end" fontSize="12" fill="#294850">0</text><text x="345" y="183" fontSize="16" fontWeight="bold" fill="#134e4a">x</text><text x="199" y="35" fontSize="16" fontWeight="bold" fill="#134e4a">y</text>{points.map(p=><g key={p.label}><circle cx={190+p.x*24} cy={190-p.y*24} r="6" fill="#0d9488" stroke="#134e4a" strokeWidth="2"/><text x={201+p.x*24} y={180-p.y*24} fontSize="18" fontWeight="bold" fill="#134e4a">{p.label}</text></g>)}</svg>;
}
export default function NumberNexusYear6AssessmentVisual({ visual }: { visual: Visual }) {
  const type = String(visual.type ?? "");

  if (visual.reviewPresentation && ['number_y6_integer_set','number_y6_fraction_set','number_y6_prime_choice'].includes(type)) return null;
  if (visual.reviewPresentation && type==='number_y6_coordinate') return <Surface><CoordinateGrid points={visual.points as Array<{x:number;y:number;label:string}>}/></Surface>;
  if (visual.reviewPresentation && type==='number_y6_tank') {
   const full=Number(visual.percentFull),waterY=220-full*1.8;
   return <Surface><div className="mx-auto grid max-w-3xl items-center gap-5 sm:grid-cols-[220px_1fr]"><svg viewBox="0 0 220 260" className="mx-auto h-60 w-52" role="img" aria-label={`Tank ${full} percent full`}><path d="M40 40Q110 12 180 40V220Q110 248 40 220Z" fill="#e6f6f6" stroke="#326f79" strokeWidth="3"/><path d={`M42 ${waterY}Q110 ${waterY+20} 178 ${waterY}V218Q110 244 42 218Z`} fill="#42b6ce"/><ellipse cx="110" cy={waterY} rx="68" ry="16" fill="#8ad5e4"/><ellipse cx="110" cy="40" rx="70" ry="18" fill="#f4fbfb" stroke="#326f79" strokeWidth="3"/><path d="M40 40V220M180 40V220" stroke="#326f79" strokeWidth="3"/></svg><div className="grid gap-4"><DataCard label="Total capacity" value={`${visual.capacity} L`}/><DataCard label="Currently full" value={`${full}%`}/></div></div></Surface>;
  }
  if (visual.reviewPresentation && type==='number_y6_round_estimate') return <Surface><div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2"><DataCard label="Percentage" value={`${visual.percent}%`} note="Round to a whole percent"/><DataCard label="Quantity" value={String(visual.quantity)} note="Round to the nearest ten"/></div></Surface>;
  if (visual.reviewPresentation && type==='number_y6_budget') {
   const purchases=visual.purchases as Array<{label:string;quantity:number;price:number}>;
   return <Surface><div className="mx-auto max-w-4xl"><div className="mb-5 flex items-center justify-between rounded-xl bg-teal-900 p-5 text-white"><span className="font-bold">Money available</span><span className="text-3xl font-black">{money(visual.budget)}</span></div><div className="grid gap-5 sm:grid-cols-2">{purchases.map(p=>{const Icon=/meal/i.test(p.label)?Utensils:Building2;return <div key={p.label} className="rounded-xl border border-teal-900/20 bg-white p-5"><Icon className="mb-3 h-12 w-12 text-teal-700" aria-hidden="true"/><div className="mb-4 text-xl font-black">{p.label}</div><div className="grid grid-cols-2 gap-4"><div><div className="text-xs font-black text-teal-800">QUANTITY TO BUY</div><div className="mt-2 text-3xl font-black">{p.quantity}</div></div><div><div className="text-xs font-black text-teal-800">PRICE FOR ONE</div><div className="mt-2 text-3xl font-black">{money(p.price)}</div><div className="text-sm text-slate-600">each</div></div></div></div>;})}</div></div></Surface>;
  }
  if (visual.reviewPresentation && type==='number_y6_rates') {
   const packs=visual.packs as Array<{label:string;kg:number;price:number}>;
   return <Surface><div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">{packs.map(p=><div key={p.label} className="rounded-xl border border-teal-900/20 bg-white p-6 text-center"><Package className="mx-auto mb-3 h-16 w-16 text-teal-700" strokeWidth={1.5} aria-hidden="true"/><div className="text-lg font-black text-teal-800">{p.label}</div><div className="my-3 text-4xl font-black">{p.kg} kg</div><div className="text-2xl font-black">{money(p.price)}</div><div className="mt-1 text-sm text-slate-600">for ONE pack</div></div>)}</div></Surface>;
  }
  if (visual.reviewPresentation && type==='number_y6_kit_budget') return <Surface><div className="mx-auto max-w-3xl"><Package className="mx-auto mb-4 h-16 w-16 text-teal-700" strokeWidth={1.5} aria-hidden="true"/><div className="grid gap-4 sm:grid-cols-3"><DataCard label="Money available" value={money(visual.budget)}/><DataCard label="Original price for ONE kit" value={money(visual.price)}/><DataCard label="Discount on EACH kit" value={`${visual.discount}%`} note="No extra fees"/></div></div></Surface>;
  if (visual.reviewPresentation && type==='number_y6_discount') return <Surface><BadgePercent className="mx-auto mb-4 h-14 w-14 text-teal-700" aria-hidden="true"/><div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2"><DataCard label="Original price" value={money(visual.price)}/><DataCard label="Discount" value={`${visual.discount}%`} note="off the original price"/></div></Surface>;

  if (type === "number_y6_coordinate") {
    const points = (visual.points as Array<{ x: number; y: number; label: string }> | undefined) ?? [];
    const spoken = points.map((point) => `Point ${point.label} is at ${point.x}, ${point.y}.`).join(" ");
    const scale = [-4, -3, -2, -1, 1, 2, 3, 4];
    return <ReadableVisual text={spoken}><Surface><div className="relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-lg border border-cyan-900/20 bg-[linear-gradient(to_right,rgba(8,145,178,.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(8,145,178,.12)_1px,transparent_1px)] bg-[size:10%_10%]"><span className="absolute left-1/2 top-0 h-full w-px bg-slate-700" /><span className="absolute left-0 top-1/2 h-px w-full bg-slate-700" />{scale.map((value) => <span key={`x-${value}`} aria-hidden className="absolute top-[52%] -translate-x-1/2 text-[10px] font-bold text-slate-500" style={{ left: `${50 + value * 10}%` }}>{value}</span>)}{scale.map((value) => <span key={`y-${value}`} aria-hidden className="absolute left-[52%] -translate-y-1/2 text-[10px] font-bold text-slate-500" style={{ top: `${50 - value * 10}%` }}>{value}</span>)}<span aria-hidden className="absolute right-2 top-[45%] text-xs font-black text-slate-600">x</span><span aria-hidden className="absolute left-[52%] top-2 text-xs font-black text-slate-600">y</span>{points.map((point) => <span key={point.label} className="absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cyan-700 text-sm font-black text-white shadow" style={{ left: `${50 + point.x * 10}%`, top: `${50 - point.y * 10}%` }}>{point.label}</span>)}</div></Surface></ReadableVisual>;
  }

  if (type === "number_y6_quantity") {
    const spoken = `Whole: ${String(visual.whole ?? "unknown")}. Part: ${String(visual.part ?? "unknown")}.`;
    return <ReadableVisual text={spoken}><Surface><div className="flex flex-wrap items-center justify-center gap-5"><div className="rounded-lg border border-cyan-800/20 bg-white px-6 py-4 text-center"><div className="text-xs font-black uppercase text-cyan-900">Whole</div><div className="mt-1 text-4xl font-black">{String(visual.whole ?? "?")}</div></div><BadgePercent className="h-8 w-8 text-cyan-800" aria-hidden /><div className="rounded-lg border border-cyan-800/20 bg-white px-6 py-4 text-center"><div className="text-xs font-black uppercase text-cyan-900">Part</div><div className="mt-1 text-3xl font-black">{String(visual.part ?? "?")}</div></div></div></Surface></ReadableVisual>;
  }

  if (type === "number_y6_discount") {
    const spoken = `Original price ${String(visual.price ?? "")} dollars. Discount ${String(visual.discount ?? "")} percent.`;
    return <ReadableVisual text={spoken}><Surface><BadgePercent className="mx-auto mb-3 h-8 w-8 text-cyan-800" aria-hidden /><Rows rows={[["Original price", `$${String(visual.price ?? "")}`], ["Discount", `${String(visual.discount ?? "")}%`]]} /></Surface></ReadableVisual>;
  }

  if (type === "number_y6_rates") {
    const rows = ((visual.rows as Array<[string, string]> | undefined) ?? []).map(([label, value]) => [String(label), String(value)] as [string, string]);
    return <ReadableVisual text={rows.map(([label, value]) => `${label}: ${value}.`).join(" ")}><Surface><Scale className="mx-auto mb-3 h-8 w-8 text-cyan-800" aria-hidden /><Rows rows={rows} /></Surface></ReadableVisual>;
  }

  if (type === "number_y6_budget") {
    const rows = ((visual.rows as Array<[string, string]> | undefined) ?? []).map(([label, value]) => [String(label), String(value)] as [string, string]);
    const allRows: Array<[string, string]> = [["Budget", `$${String(visual.budget ?? "")}`], ...rows];
    return <ReadableVisual text={allRows.map(([label, value]) => `${label}: ${value}.`).join(" ")}><Surface><Landmark className="mx-auto mb-3 h-8 w-8 text-cyan-800" aria-hidden /><Rows rows={allRows} /></Surface></ReadableVisual>;
  }

  if (type === "number_y6_claim") {
    const label = String(visual.label ?? "Student's result");
    const statement = String(visual.statement ?? "");
    return <ReadableVisual text={`${label}: ${statement}.`}><Surface><div className="mx-auto max-w-3xl pr-12 text-center"><div className="text-xs font-black uppercase text-amber-700">{label}</div><div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-5 py-4 text-2xl font-black sm:text-3xl"><FractionExpression expression={statement} /></div></div></Surface></ReadableVisual>;
  }

  if (type === "number_y6_fraction_equation") {
    const expression = String(visual.expression ?? "");
    return <ReadableVisual text={expression}><Surface><div className="pr-12 text-center text-3xl font-black sm:text-4xl"><FractionExpression expression={expression} /></div></Surface></ReadableVisual>;
  }

  const mappedType: Record<string, string> = {
    number_y6_integer_set: "number_y5_decimal_set",
    number_y6_number_card: "number_y5_factor_card",
    number_y6_constraint: "number_y5_divisibility_target",
    number_y6_fraction_set: "number_y5_fraction_set",
    number_y6_number_line: "number_y5_number_line",
    number_y6_calculation: "number_y5_calculation",
    number_y6_estimate: "number_y5_estimate",
  };
  const mapped = mappedType[type];
  const spoken = mappedVisualReadAloud(type, visual);
  return mapped ? <ReadableVisual text={spoken}><NumberNexusYear5AssessmentVisual visual={{ ...visual, type: mapped }} /></ReadableVisual> : null;
}
