"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AssessmentShell from "@/components/assessment/AssessmentShell";
import Year1NumberCandidateCard from "@/components/assessment/Year1NumberCandidateCard";
import { YEAR1_NUMBER_CANDIDATE_SPECS } from "@/data/assessments/candidates/year1-number/authoring";
import { scoreYear1NumberSubmission } from "@/data/assessments/candidates/year1-number/scoring";
import PrepNumberCandidateCard from "@/components/assessment/PrepNumberCandidateCard";
import ReadAloudBtn, { ReadAloudRateProvider } from "@/components/ReadAloudBtn";
import { ASSESSMENT_FORMS, type DesignedForm } from "@/data/assessments/design/assessmentContract";
import { PREP_NUMBER_CANDIDATE_FORMS } from "@/data/assessments/candidates/prep-number/forms";
import { parsePrepNumberSubmission, scorePrepNumberSubmission } from "@/data/assessments/candidates/prep-number/scoring";

// Protected Demo Review. No learner identity, database writes or rewards.
export default function PrepNumberCandidateReview() {
  const router = useRouter();
  const [level,setLevel]=useState<"Prep"|"Year 1">("Prep");
  const [resetVersion,setResetVersion]=useState(0);
  const [finishedItem,setFinishedItem]=useState<string|null>(null);
  const [form,setForm]=useState<DesignedForm>("pretest");
  const [index,setIndex]=useState(0);
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [submitted,setSubmitted]=useState<Record<string,boolean>>({});
  const prepItem=PREP_NUMBER_CANDIDATE_FORMS[form][index];
  const year1Item=YEAR1_NUMBER_CANDIDATE_SPECS[form][index];
  const item=level==="Prep" ? prepItem : year1Item;
  const raw=answers[item.id] ?? null;
  const result=level==="Prep" ? scorePrepNumberSubmission(prepItem,parsePrepNumberSubmission(prepItem,raw)) : scoreYear1NumberSubmission(year1Item,raw);
  const formLabel = {pretest:"Pre-Test",posttest:"Post-Test","diagnostic-start":"Diagnostic Start","diagnostic-mid":"Diagnostic Mid","diagnostic-end":"Diagnostic End"}[form];
  return <ReadAloudRateProvider>
    <div className="border-b border-teal-300/20 bg-[#001b18] px-4 py-3 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4">
        <p className="text-sm text-teal-100">Candidate preview · saves no student data</p>
        <label className="text-sm">Level<select aria-label="Assessment level" value={level} onChange={e=>{ if(e.target.value === "Year 1") router.push("/demo-review/number-level-1"); else setLevel("Prep"); }} className="ml-2 min-h-12 rounded-lg border border-teal-300/30 bg-[#042925] px-3 text-white"><option value="Prep">Prep</option><option value="Year 1">Level 1</option></select></label>
        <label className="text-sm">Form<select aria-label="Assessment form" value={form} onChange={e=>setForm(e.target.value as DesignedForm)} className="ml-2 min-h-12 rounded-lg border border-teal-300/30 bg-[#042925] px-3 text-white">{ASSESSMENT_FORMS.map(f=><option key={f} value={f}>{f}</option>)}</select></label>
        <label className="text-sm">Question<select aria-label="Question number" value={index} onChange={e=>setIndex(Number(e.target.value))} className="ml-2 min-h-12 rounded-lg border border-teal-300/30 bg-[#042925] px-3 text-white">{Array.from({length:20},(_,i)=><option key={i} value={i}>{i+1}</option>)}</select></label>
      </div>
    </div>
    <AssessmentShell
      testType={formLabel} year={level} realmId="number"
      currentIndex={index} totalQuestions={20}
      subtitle="Number Nexus · Candidate preview"
      questionPrompt={item.prompt}
      promptAction={<ReadAloudBtn text={item.prompt} size="md"/>}
      questionContent={<>
        {finishedItem===item.id ? <p role="status" className="mb-4 rounded-xl border border-teal-300/30 bg-teal-950 p-3 text-teal-100">Preview complete. No student results were saved. Use the question selector to review any question.</p> : null}
        <fieldset disabled={submitted[item.id]}>{level==="Prep" ? <PrepNumberCandidateCard key={`${item.id}:${resetVersion}`} item={prepItem} value={raw} onChange={value=>setAnswers(previous=>({...previous,[item.id]:value}))}/> : <Year1NumberCandidateCard key={`${item.id}:${resetVersion}`} item={year1Item} value={raw} onChange={value=>setAnswers(previous=>({...previous,[item.id]:value}))}/>}</fieldset>
        <details className="mt-4 rounded-xl border border-teal-300/20 p-3 text-sm text-teal-100">
          <summary className="cursor-pointer font-bold">Author review controls</summary>
          <p className="mt-3">{item.slot.descriptor}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" disabled={!raw || submitted[item.id]} onClick={()=>setSubmitted(s=>({...s,[item.id]:true}))} className="min-h-12 rounded-xl bg-teal-200 px-4 font-bold text-slate-950 disabled:opacity-40">Check score</button>
            <button type="button" onClick={()=>{setFinishedItem(null);setResetVersion(v=>v+1);setAnswers(a=>{const next={...a};delete next[item.id];return next;});setSubmitted(s=>({...s,[item.id]:false}));}} className="min-h-12 rounded-xl border border-teal-300/40 px-4">Reset question</button>
          </div>
          {submitted[item.id] ? <p className="mt-3" role="status">Author check: {result.score} / 1. Response locked.</p> : null}
        </details>
      </>}
      hasAnswer={true} isLast={index===19}
      onBack={()=>setIndex(i=>Math.max(0,i-1))}
      onNext={()=>setIndex(i=>Math.min(19,i+1))}
      onSubmit={()=>{setSubmitted(s=>({...s,[item.id]:true}));setFinishedItem(item.id);}}
      onExit={()=>{window.location.href="/demo-review";}}
    />
  </ReadAloudRateProvider>;
}
