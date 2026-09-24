'use client';
import ChanceHollowAssessmentCard from './ChanceHollowAssessmentCard';
import Link from 'next/link';
import {useState,type CSSProperties} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {CH_FORMS,CH_LABELS,LEVEL3_CHANCE_FORMS,chEmpty,chReady,chScore,type CHItem,type CHForm,type CHResponse} from '@/data/assessments/revisions/level3ChanceHollowFiveForms';
import AssessmentQuestionNavigator from '@/components/assessment/AssessmentQuestionNavigator';
import {getRealmTheme} from '@/lib/useRealmTheme';
import {stopSpeaking} from '@/lib/speak';
import styles from './StatisticaFiveForms.module.css';
export default function ChanceHollowFiveFormReview({level=3,forms=LEVEL3_CHANCE_FORMS}:{level?:3|4|5|6|7|8;forms?:Record<CHForm,CHItem[]>}){
 const router=useRouter(),params=useSearchParams(),form=CH_FORMS.find(f=>f===params.get('form'))??'posttest',items=forms[form];
 const raw=Number(params.get('question')??1)-1,index=Number.isInteger(raw)?Math.max(0,Math.min(items.length-1,raw)):0,q=items[index];
 const [records,setRecords]=useState<Record<string,CHResponse>>({}),[finished,setFinished]=useState<Partial<Record<CHForm,boolean>>>({}),[show,setShow]=useState(false);
 const r=records[q.id]??chEmpty(),theme=getRealmTheme('chance');
 const select=(f:CHForm,i:number)=>{stopSpeaking();setShow(false);router.replace(`/demo-review/chance-level${level}?form=${f}&question=${i+1}`,{scroll:false});};
 const update=(next:CHResponse)=>{setRecords(old=>({...old,[q.id]:next}));setFinished(old=>({...old,[form]:false}));};
 const advance=()=>index===items.length-1?setFinished(old=>({...old,[form]:true})):select(form,index+1);
 const answered=items.filter(item=>records[item.id]&&chReady(item,records[item.id])).length;
 return <main className={styles.page} style={{'--light':theme.chipText,'--accent':theme.accentText,'--selected':theme.ctaFrom,'--ring':theme.borderRing,'--cta':theme.ctaGradientCss,'--surface':theme.cardSurface,'--tint':theme.surfaceTint} as CSSProperties}><div className={styles.shell}>
 <header className={styles.header}><div><p>CHANCE HOLLOW · LEVEL {level}</p><h1>Level {level} assessments</h1></div><Link href={`/demo-review?realm=chance&year=Year%20${level}`} >Back to review</Link></header>
 <div className={styles.reviewBar}><div className={styles.formTabs}>{CH_FORMS.map(f=><button key={f} aria-pressed={form===f} onClick={()=>select(f,index)}>{CH_LABELS[f]}</button>)}</div><select aria-label='Review question' value={index} onChange={e=>select(form,Number(e.target.value))}>{items.map((item,i)=><option key={item.id} value={i}>{i+1} — {item.skill}</option>)}</select><span>Review only · {items.length} questions per form · Student results are not saved</span><span>{answered}/{items.length} recorded</span></div>
 <AssessmentQuestionNavigator answeredFlags={items.map(item=>Boolean(records[item.id]&&chReady(item,records[item.id])))} currentIndex={index} onJump={i=>select(form,i)} realmId='chance' reviewMode/>
 <section className={styles.card} data-question-id={q.id} aria-labelledby='ch-question'><p className={styles.counter}>Question {index+1} of {items.length} · {CH_LABELS[form]}</p>
 <ChanceHollowAssessmentCard item={q} response={r} update={update} level={level}/><p className={styles.status} aria-live='polite'>{r.skipped?'You chose “I don’t know”.':chReady(q,r)?'Answer recorded.':''}</p>
 <footer className={styles.footer}><button disabled={index===0} onClick={()=>select(form,index-1)}>Back</button><button onClick={()=>{update({...chEmpty(),skipped:true});advance();}}>I don’t know</button><button className={styles.primary} onClick={advance}>{index===items.length-1?'Finish':'Next'}</button></footer></section>
 <details className={styles.notes} key={q.id}><summary>Review details</summary><p>{q.code} · {q.skill} · {level>=7?'Assessment coverage block':'Chance Hollow lesson week'} {q.week}</p><button onClick={()=>setShow(!show)}>{show?'Hide answer':'Show answer'}</button>{show&&<p>{q.mode==='choice'?`${q.options[q.correct]} `:q.mode==='complete'?`${q.completion!.map(field=>`${field.label}: ${field.answer}`).join('; ')}. `:''}{q.explanation}</p>}<p>Five parallel forms for review. Experiments are scored against the results the student actually generated.</p></details>
 {finished[form]&&<p role='status' className={styles.notes}>{CH_LABELS[form]} review: {items.filter(item=>records[item.id]&&chScore(item,records[item.id])).length}/{items.length} correct · {answered}/{items.length} recorded. Nothing was saved to a student record.</p>}
 </div></main>;
}
