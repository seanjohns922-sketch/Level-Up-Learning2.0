"use client";
import { useState } from "react";
import PrepNumberCandidateCard from "@/components/assessment/PrepNumberCandidateCard";
import ReadAloudBtn, { ReadAloudRateProvider } from "@/components/ReadAloudBtn";
import { ASSESSMENT_FORMS, type DesignedForm } from "@/data/assessments/design/assessmentContract";
import { PREP_NUMBER_CANDIDATE_FORMS } from "@/data/assessments/candidates/prep-number/forms";
import { parsePrepNumberSubmission, scorePrepNumberSubmission } from "@/data/assessments/candidates/prep-number/scoring";

// Development-only review harness. The route returns 404 in production. It has
// no learner identity, Supabase calls, localStorage or reward/progression effects.
export default function PrepNumberCandidateReview() {
  const [form,setForm]=useState<DesignedForm>("pretest");
  const [index,setIndex]=useState(0);
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [submitted,setSubmitted]=useState<Record<string,boolean>>({});
  const item=PREP_NUMBER_CANDIDATE_FORMS[form][index];
  const raw=answers[item.id] ?? null;
  const result=scorePrepNumberSubmission(item,parsePrepNumberSubmission(item,raw));
  return <ReadAloudRateProvider><main className="min-h-screen bg-[#06131f] px-4 py-6 text-white"><div className="mx-auto max-w-3xl space-y-5">
    <p className="text-sm text-amber-200">Internal authoring review · candidate questions · saves no student data</p>
    <h1 className="text-2xl font-bold">Prep Number</h1>
    <div className="flex flex-wrap gap-3"><label>Form<select aria-label="Assessment form" value={form} onChange={e=>setForm(e.target.value as DesignedForm)} className="ml-2 min-h-12 rounded-lg bg-white px-3 text-slate-950">{ASSESSMENT_FORMS.map(f=><option key={f}>{f}</option>)}</select></label><label>Question<select aria-label="Question number" value={index} onChange={e=>setIndex(Number(e.target.value))} className="ml-2 min-h-12 rounded-lg bg-white px-3 text-slate-950">{Array.from({length:20},(_,i)=><option key={i} value={i}>{i+1}</option>)}</select></label></div>
    <p className="text-sm text-slate-300">{item.slot.descriptor} · {index+1} of 20</p>
    <div className="flex items-start gap-3"><h2 className="flex-1 text-2xl font-bold leading-relaxed">{item.prompt}</h2><ReadAloudBtn text={item.prompt} size="md"/></div>
    <fieldset disabled={submitted[item.id]}><PrepNumberCandidateCard key={item.id} item={item} value={raw} onChange={value=>setAnswers(previous=>({...previous,[item.id]:value}))}/></fieldset>
    <div className="flex flex-wrap gap-3"><button type="button" disabled={!raw || submitted[item.id]} onClick={()=>setSubmitted(s=>({...s,[item.id]:true}))} className="min-h-12 rounded-xl bg-cyan-200 px-5 font-bold text-slate-950 disabled:opacity-40">Submit for scoring check</button><button type="button" onClick={()=>{setAnswers(a=>{const next={...a};delete next[item.id];return next;});setSubmitted(s=>({...s,[item.id]:false}));}} className="min-h-12 rounded-xl border border-slate-400 px-5">Reset this question</button></div>
    {submitted[item.id] ? <p role="status">Author check: {result.score} / 1. Response locked.</p> : null}
    <nav className="flex justify-between"><button type="button" disabled={index===0} onClick={()=>setIndex(i=>i-1)} className="min-h-12 rounded-lg border border-slate-400 px-4 disabled:opacity-40">Previous</button><button type="button" disabled={index===19} onClick={()=>setIndex(i=>i+1)} className="min-h-12 rounded-lg border border-slate-400 px-4 disabled:opacity-40">Next</button></nav>
  </div></main></ReadAloudRateProvider>;
}
