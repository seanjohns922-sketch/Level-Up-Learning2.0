"use client";
import { useId } from 'react';
import { REALM_FILTER_OPTIONS, type ItemRealmFilter } from '@/lib/marketplace-realm-filter';
export default function RealmItemFilter({value,onChange}:{value:ItemRealmFilter;onChange:(value:ItemRealmFilter)=>void}){
 const id=useId();
 return <div className="flex flex-wrap items-center gap-3"><label htmlFor={id} className="text-sm font-bold text-slate-700">Realm</label><select id={id} value={value} onChange={event=>onChange(event.target.value as ItemRealmFilter)} className="min-h-11 max-w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700">{REALM_FILTER_OPTIONS.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select>{value!=='all'&&<button type="button" onClick={()=>onChange('all')} className="min-h-11 px-2 text-sm font-bold text-slate-600 underline">Clear realm filter</button>}</div>;
}
