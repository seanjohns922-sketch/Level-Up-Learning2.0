import { Backpack, GlassWater, PaintBucket, Package, Ticket, Users, Wallet } from 'lucide-react';
import { FractionText } from '@/components/FractionText';
import type { ReactNode } from 'react';
const money=(n:unknown)=>`$${Number(n).toFixed(2)}`;
function Card({label,value,note,icon}:{label:string;value:ReactNode;note?:string;icon?:ReactNode}){
 return <div className="min-w-0 rounded-xl border border-teal-900/15 bg-white p-5"><div className="mb-3 flex items-center gap-3 font-bold text-teal-800">{icon}{label}</div><div className="text-3xl font-black text-slate-950">{value}</div>{note&&<p className="mt-2 text-base font-semibold text-slate-600">{note}</p>}</div>;
}
export default function NumberNexusYear7AssessmentVisual({visual:v}:{visual:Record<string,unknown>}){
 let content:ReactNode;
 switch(v.kind){
  case 'ordering':return null;
  case 'power':content=<div className="flex flex-wrap items-center justify-center gap-3 py-5 text-3xl font-black">{String(v.number)} = {String(v.digit)} × <span>10<sup className="ml-1 rounded border-2 border-dashed border-teal-600 px-2 text-xl">?</sup></span></div>;break;
  case 'estimate':content=<div className="grid gap-4 sm:grid-cols-2"><Card label="Fabric length" value={`${v.metres} m`} note="Round to the nearest whole metre."/><Card label="Price for ONE metre" value={money(v.price)} note="Round to the nearest whole dollar."/></div>;break;
  case 'mixture':content=<div className="grid gap-4 sm:grid-cols-2"><Card label="Total drink to make" value={`${v.total} mL`} icon={<GlassWater/>}/><Card label="Concentrate : Water" value={String(v.ratio)} note="Use this mixing ratio."/></div>;break;
  case 'packs':content=<div className="grid gap-4 sm:grid-cols-2">{(v.packs as Array<{label:string;kg:number;price:number}>).map(p=><Card key={p.label} label={p.label} value={`${p.kg} kg`} note={`${money(p.price)} for this whole pack`} icon={<Package/>}/>)}</div>;break;
  case 'expression':content=<div className="flex flex-wrap items-center justify-center gap-4 py-5 text-4xl font-black text-slate-950">{String(v.expression).split(' ').map((part,i)=><span key={i}>{/^\d+\/\d+$/.test(part)?<FractionText value={part}/>:part}</span>)}</div>;break;
  case 'square':content=<svg viewBox="0 0 520 220" role="img" aria-label={`Square with area ${v.area} square metres. Side lengths are unknown.`} className="mx-auto w-full max-w-lg"><rect x="164" y="20" width="180" height="180" rx="6" fill="#ccfbf1" stroke="#0f766e" strokeWidth="3"/><text x="254" y="98" textAnchor="middle" fontSize="18" fill="#115e59">Area</text><text x="254" y="132" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#0f172a">{String(v.area)} m²</text></svg>;break;
  case 'number-line':content=<><p className="mb-3 text-center text-sm font-semibold text-slate-600">Each unit is divided into 4 equal parts.</p><svg viewBox="0 0 720 140" role="img" aria-label="Number line from negative three to one, divided into quarters, with one marked point." className="w-full"><line x1="32" x2="688" y1="58" y2="58" stroke="#1e293b" strokeWidth="3"/>{Array.from({length:17},(_,i)=><g key={i}><line x1={32+i*41} x2={32+i*41} y1={i%4===0?44:50} y2={i%4===0?72:66} stroke="#334155" strokeWidth="2"/>{i%4===0&&<text x={32+i*41} y="105" textAnchor="middle" fontSize="21" fontWeight="bold" fill="#0f172a">{i/4-3}</text>}</g>)}<circle cx={32+(Number(v.marker)+3)*164} cy="58" r="10" fill="#0d9488" stroke="white" strokeWidth="4"/></svg></>;break;
  case 'paint':content=<div className="grid gap-4 sm:grid-cols-2"><Card label="Paint needed" value={`${v.litres} L`} icon={<PaintBucket/>}/><Card label="One full tin" value={`${v.tin} L`} note="Buy whole tins. No paint is left over from another job." icon={<PaintBucket/>}/></div>;break;
  case 'ratio':content=<div className="grid gap-4 sm:grid-cols-2">{[['Blue',Number(v.blue),'bg-sky-600'],['Orange',Number(v.orange),'bg-orange-500']].map(([label,count,color])=><Card key={String(label)} label={`${label} counters`} value={<><div className="mb-4 flex flex-wrap gap-2" aria-hidden="true">{Array.from({length:Number(count)},(_,i)=><span key={i} className={`h-6 w-6 rounded-full ${color}`}/>)}</div>{count}</>}/>)}</div>;break;
  case 'share':content=<div className="grid gap-4 sm:grid-cols-2"><Card label="Total to share" value={money(v.total)} icon={<Wallet/>}/><Card label="Alex : Sam" value={String(v.ratio)} note="Share the whole amount in this ratio." icon={<Users/>}/></div>;break;
  case 'delivery':content=<div className="grid gap-4 sm:grid-cols-3"><Card label="One backpack" value={money(v.price)} note="Original price" icon={<Backpack/>}/><Card label="Backpack discount" value={`${v.discount}% off`} note="Applies to the backpack only."/><Card label="Delivery" value={money(v.delivery)} note="Add once after the discount."/></div>;break;
  case 'fundraiser':content=<div className="grid gap-4 sm:grid-cols-3"><Card label="Total event cost" value={money(v.cost)} note="All expenses included." icon={<Wallet/>}/><Card label="Tickets sold" value={String(v.tickets)} icon={<Ticket/>}/><Card label="Price for ONE ticket" value={money(v.price)} note="No other income."/></div>;break;
  default:return null;
 }
 return <div className="rounded-xl border border-teal-900/15 bg-[#f0fdfa] p-5 text-slate-950 sm:p-7">{content}</div>;
}
