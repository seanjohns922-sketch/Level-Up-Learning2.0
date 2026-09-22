"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { STATISTICA_FORMS, STATISTICA_FORM_LABELS, type StatisticaForm } from "@/data/assessments/revisions/level1StatisticaFiveForms";
import { LEVEL2_STATISTICA_FORMS } from "@/data/assessments/revisions/level2StatisticaFiveForms";
import { emptyStatsResponse, statsResponseReady, scoreStatsResponse, statsExpected, type StatsResponse } from "@/lib/statistica-level1-review";
import { getRealmTheme } from "@/lib/useRealmTheme";
import { stopSpeaking } from "@/lib/speak";
import StatisticaAssessmentCard from "@/components/statistica/StatisticaAssessmentCard";
import AssessmentQuestionNavigator from "@/components/assessment/AssessmentQuestionNavigator";
import styles from "./StatisticaFiveForms.module.css";

type RecordValue = { response: StatsResponse; submitted: boolean; skipped: boolean };
export default function Level2StatisticaFiveFormReview() {
  const router = useRouter();
  const params = useSearchParams();
  const form = STATISTICA_FORMS.find(f=>f===params.get("form")) ?? "posttest";
  const rawIndex = Number(params.get("question") ?? "1")-1;
  const index = Number.isInteger(rawIndex) ? Math.max(0,Math.min(19,rawIndex)) : 0;
  const items = LEVEL2_STATISTICA_FORMS[form];
  const item = items[index];
  const [records,setRecords] = useState<Record<string,RecordValue>>({});
  const [showAnswer,setShowAnswer] = useState(false);
  const [finished,setFinished] = useState<Partial<Record<StatisticaForm,boolean>>>({});
  const saved = records[item.id];
  const response = saved?.response ?? emptyStatsResponse(item);
  const theme = getRealmTheme("statistics");
  const select = (nextForm: StatisticaForm,nextIndex:number) => {stopSpeaking();setShowAnswer(false);router.replace(`/demo-review/statistica-level2?form=${nextForm}&question=${nextIndex+1}`,{scroll:false});};
  const update = (next:StatsResponse) => {setRecords(old=>({...old,[item.id]:{response:next,submitted:statsResponseReady(item,next),skipped:false}}));setFinished(old=>({...old,[form]:false}));};
  const advance = () => index===items.length-1 ? setFinished(old=>({...old,[form]:true})) : select(form,index+1);
  const skip = () => {setRecords(old=>({...old,[item.id]:{response,submitted:true,skipped:true}}));advance();};
  const answered = items.filter(q=>records[q.id]?.submitted).length;
  const correct = items.filter(q=>records[q.id]?.submitted&&!records[q.id].skipped&&scoreStatsResponse(q,records[q.id].response)).length;
  const expected = statsExpected(item);
  return <main className={styles.page} style={{"--light":theme.chipText,"--accent":theme.accentText,"--selected":theme.ctaFrom,"--ring":theme.borderRing,"--cta":theme.ctaGradientCss,"--surface":theme.cardSurface,"--tint":theme.surfaceTint} as CSSProperties}>
    <div className={styles.shell}>
      <header className={styles.header}><div><p>STATISTICA · LEVEL 2</p><h1>Level 2 assessments</h1></div><Link href="/demo-review?realm=statistics&year=Year%202">Back to review</Link></header>
      <div className={styles.reviewBar}><div className={styles.formTabs} aria-label="Assessment forms">{STATISTICA_FORMS.map(f=><button key={f} aria-pressed={f===form} onClick={()=>select(f,index)}>{STATISTICA_FORM_LABELS[f]}</button>)}</div><select aria-label="Review question" value={index} onChange={e=>select(form,Number(e.target.value))}>{items.map((q,i)=><option key={q.id} value={i}>{i+1} — {q.skillLabel}</option>)}</select><span>Review only · 20 questions per form · Student results are not saved</span><span>{answered}/20 recorded</span></div>
      <div className="mb-4">
        <AssessmentQuestionNavigator
          answeredFlags={items.map(q=>Boolean(records[q.id]?.submitted))}
          currentIndex={index}
          onJump={nextIndex=>select(form,nextIndex)}
          realmId="statistics"
          reviewMode
        />
      </div>
      <section className={styles.card} aria-labelledby="stats-question-heading" data-assessment-task-kind={`statisticaLevel2V1-${item.mode}`} data-question-id={item.id}>
        <p className={styles.counter}>Question {index+1} of 20 · {STATISTICA_FORM_LABELS[form]}</p>
        <StatisticaAssessmentCard key={item.id} item={item} response={response} onChange={update}/>
        <div className={styles.status} role="status">{saved?.submitted ? saved.skipped ? "You chose ‘I don’t know’." : "Answer recorded." : ""}</div>
        <footer className={styles.footer}>
          <button disabled={index===0} onClick={()=>select(form,index-1)}>Back</button>
          <button onClick={skip}>I don’t know</button>
          <button className={styles.primary} onClick={advance}>{index===items.length-1 ? form==="posttest" ? "Submit" : "Finish" : "Next"}</button>
        </footer>
      </section>
      <details className={styles.notes} key={item.id}><summary>Review details</summary><p>{item.code} · {item.skillLabel} · Intended difficulty: {item.difficulty} · Lesson week {item.week}</p><button onClick={()=>setShowAnswer(v=>!v)}>{showAnswer?"Hide answer":"Show answer"}</button>{showAnswer&&<p>Expected response: {expected}{saved?.submitted?` · Your answer: ${saved.skipped?"I don’t know":scoreStatsResponse(item,response)?"correct":"incorrect"}`:""}</p>}<p>All five forms use the same skill sequence. New Level 2 questions are isolated from existing student attempts while this bank is reviewed.</p></details>
      {finished[form]&&<div className={styles.notes} role="status">{STATISTICA_FORM_LABELS[form]} review: {correct}/20 correct · {answered}/20 recorded. Nothing was saved to a student record.</div>}
    </div>
  </main>;
}
