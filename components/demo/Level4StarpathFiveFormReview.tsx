"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GROUND_STARPATH_FORMS, GROUND_STARPATH_LABELS, type GroundStarpathForm } from "@/data/assessments/revisions/groundStarpathFiveForms";
import { LEVEL4_STARPATH_FORMS } from "@/data/assessments/revisions/level4StarpathFiveForms";
import { emptyLevel4Response, level4ResponseReady, scoreLevel4Response, level4Expected, type Level4Response } from "@/lib/starpath-level4-review";
import { getRealmTheme } from "@/lib/useRealmTheme";
import { stopSpeaking } from "@/lib/speak";
import Level4StarpathAssessmentCard from "@/components/starpath/Level4StarpathAssessmentCard";
import AssessmentQuestionNavigator from "@/components/assessment/AssessmentQuestionNavigator";
import styles from "./GroundStarpathRedesign.module.css";

type RecordValue = { response: Level4Response; submitted: boolean; skipped: boolean };
export default function Level4StarpathFiveFormReview() {
  const router = useRouter();
  const params = useSearchParams();
  const form = GROUND_STARPATH_FORMS.find(f=>f===params.get("form")) ?? "posttest";
  const rawIndex = Number(params.get("question") ?? "1")-1;
  const index = Number.isInteger(rawIndex) ? Math.max(0,Math.min(19,rawIndex)) : 0;
  const items = LEVEL4_STARPATH_FORMS[form];
  const item = items[index];
  const [records,setRecords] = useState<Record<string,RecordValue>>({});
  const [showAnswer,setShowAnswer] = useState(false);
  const [finished,setFinished] = useState<Partial<Record<GroundStarpathForm,boolean>>>({});
  const saved = records[item.id];
  const response = saved?.response ?? emptyLevel4Response(item);
  const theme = getRealmTheme("space");
  const select = (nextForm: GroundStarpathForm,nextIndex:number) => {stopSpeaking();setShowAnswer(false);router.replace(`/demo-review/starpath-level4?form=${nextForm}&question=${nextIndex+1}`,{scroll:false});};
  const update = (next:Level4Response) => {setRecords(old=>({...old,[item.id]:{response:next,submitted:level4ResponseReady(item,next),skipped:false}}));setFinished(old=>({...old,[form]:false}));};
  const advance = () => index===items.length-1 ? setFinished(old=>({...old,[form]:true})) : select(form,index+1);
  const skip = () => {setRecords(old=>({...old,[item.id]:{response,submitted:true,skipped:true}}));advance();};
  const answered = items.filter(q=>records[q.id]?.submitted).length;
  const correct = items.filter(q=>records[q.id]?.submitted&&!records[q.id].skipped&&scoreLevel4Response(q,records[q.id].response)).length;
  const expected = level4Expected(item);
  return <main className={styles.page} style={{"--accent":theme.accentText,"--selected":theme.ctaFrom,"--ring":theme.borderRing,"--cta":theme.ctaGradientCss,"--surface":theme.cardSurface,"--tint":theme.surfaceTint} as CSSProperties}>
    <div className={styles.shell}>
      <header className={`${styles.header} ${styles.fullReviewHeader}`}><div><p>STARPATH · LEVEL 4</p><h1>Five redesigned assessments</h1></div><Link href="/demo-review?realm=space&year=Year%204">Back to review</Link></header>
      <div className={styles.reviewBar}><div className={styles.formTabs} aria-label="Assessment forms">{GROUND_STARPATH_FORMS.map(f=><button key={f} aria-pressed={f===form} onClick={()=>select(f,index)}>{GROUND_STARPATH_LABELS[f]}</button>)}</div><select className={styles.reviewSelect} aria-label="Review question" value={index} onChange={e=>select(form,Number(e.target.value))}>{items.map((q,i)=><option key={q.id} value={i}>{i+1} — {q.skillLabel}</option>)}</select><span>Review only · 20 questions · Results are not saved</span><span>{answered}/20 recorded</span></div>
      <div className="mb-4">
        <AssessmentQuestionNavigator
          answeredFlags={items.map(q=>Boolean(records[q.id]?.submitted))}
          currentIndex={index}
          onJump={nextIndex=>select(form,nextIndex)}
          realmId="space"
          reviewMode
        />
      </div>
      <section className={styles.card} aria-labelledby="ground-question-heading" data-assessment-task-kind={`starpathLevel4V5-${item.task.mode}`} data-question-id={item.id}>
        <p className={styles.counter}>Question {index+1} of 20 · {GROUND_STARPATH_LABELS[form]}</p>
        <Level4StarpathAssessmentCard key={item.id} item={item} response={response} onChange={update}/>
        <div className={styles.status} role="status">{saved?.submitted ? saved.skipped ? "You chose ‘I don’t know’." : "Answer recorded." : ""}</div>
        <footer className={styles.footer}>
          <button disabled={index===0} onClick={()=>select(form,index-1)}>Back</button>
          <button onClick={skip}>I don’t know</button>
          <button className={styles.primary} onClick={advance}>{index===items.length-1 ? form==="posttest" ? "Submit" : "Finish" : "Next"}</button>
        </footer>
      </section>
      <details className={styles.notes} key={item.id}><summary>Review details</summary><p>{item.primaryDescriptorCode} · {item.skillLabel} · Intended difficulty: {item.difficulty}</p><button onClick={()=>setShowAnswer(v=>!v)}>{showAnswer?"Hide answer":"Show answer"}</button>{showAnswer&&<p>Expected response: {expected}{saved?.submitted?` · Your answer: ${saved.skipped?"I don’t know":scoreLevel4Response(item,response)?"correct":"incorrect"}`:""}</p>}<p>All five forms use the same skill sequence. New version 5 questions are isolated from existing student attempts while this bank is reviewed.</p></details>
      {finished[form]&&<div className={styles.notes} role="status">{GROUND_STARPATH_LABELS[form]} review: {correct}/20 correct · {answered}/20 recorded. Nothing was saved to a student record.</div>}
    </div>
  </main>;
}
