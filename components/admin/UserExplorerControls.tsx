"use client";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function UserExplorerControls({schools}:{schools:Array<{id:string;name:string}>}){
  const router=useRouter();const pathname=usePathname();const params=useSearchParams();
  const [query,setQuery]=useState(params.get("q")??"");
  useEffect(()=>{const timer=window.setTimeout(()=>{const next=new URLSearchParams(params.toString());if(query)next.set("q",query);else next.delete("q");next.delete("page");router.replace(`${pathname}?${next}`)},300);return()=>window.clearTimeout(timer)},[query,params,pathname,router]);
  const setFilter=(key:string,value:string)=>{const next=new URLSearchParams(params.toString());if(value==="all")next.delete(key);else next.set(key,value);next.delete("page");router.replace(`${pathname}?${next}`)};
  return <div className="grid gap-3 border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_160px_190px_180px_180px]">
    <label className="relative"><span className="sr-only">Search users</span><Search className="absolute left-3 top-3 h-5 w-5 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Name, email, username or Explorer Code" className="h-11 w-full border border-slate-300 pl-10 pr-3 text-sm"/></label>
    <select aria-label="User type" value={params.get("type")??"all"} onChange={e=>setFilter("type",e.target.value)} className="h-11 border border-slate-300 px-3 text-sm"><option value="all">All users</option><option value="student">Students</option><option value="parent">Parents</option><option value="educator">Educators</option></select>
    <select aria-label="Student segment" value={params.get("segment")??"all"} onChange={e=>setFilter("segment",e.target.value)} className="h-11 border border-slate-300 px-3 text-sm"><option value="all">All access / links</option><option value="school_only">School only</option><option value="school_and_home">School + Home</option><option value="home_only">Home only</option><option value="inactive">Inactive</option><option value="parent_linked">Parent linked</option><option value="no_parent_linked">No parent linked</option><option value="home_active">Home active</option><option value="no_home_access">No home access</option></select>
    <select aria-label="School" value={params.get("school")??"all"} onChange={e=>setFilter("school",e.target.value)} className="h-11 border border-slate-300 px-3 text-sm"><option value="all">All schools</option>{schools.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
    <select aria-label="Activity" value={params.get("activity")??"all"} onChange={e=>setFilter("activity",e.target.value)} className="h-11 border border-slate-300 px-3 text-sm"><option value="all">Any activity</option><option value="active_7d">Active this week</option><option value="inactive_14d">Inactive 14+ days</option><option value="inactive">Inactive users</option></select>
  </div>
}
