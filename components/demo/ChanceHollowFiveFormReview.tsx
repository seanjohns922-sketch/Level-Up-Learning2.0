'use client';
import Link from 'next/link';
import {MathFormattedText} from '@/components/FractionText';
import {useState,type CSSProperties} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {CH_FORMS,CH_LABELS,LEVEL3_CHANCE_FORMS,chEmpty,chReady,chScore,chSpeech,chOutcome,type CHItem,type CHForm,type CHResponse} from '@/data/assessments/revisions/level3ChanceHollowFiveForms';
import ChanceVisual from '@/components/chance-hollow/ChanceVisual';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import AssessmentQuestionNavigator from '@/components/assessment/AssessmentQuestionNavigator';
import {getRealmTheme} from '@/lib/useRealmTheme';
import {stopSpeaking} from '@/lib/speak';
import styles from './StatisticaFiveForms.module.css';
import ch from './ChanceHollowFiveForms.module.css';
export default function ChanceHollowFiveFormReview({level=3,forms=LEVEL3_CHANCE_FORMS}:{level?:3|4|5;forms?:Record<CHForm,CHItem[]>}){
 const router=useRouter(),params=useSearchParams(),form=CH_FORMS.find(f=>f===params.get('form'))??'posttest',items=forms[form];
 const raw=Number(params.get('question')??1)-1,index=Number.isInteger(raw)?Math.max(0,Math.min(19,raw)):0,q=items[index];
 const [records,setRecords]=useState<Record<string,CHResponse>>({}),[finished,setFinished]=useState<Partial<Record<CHForm,boolean>>>({}),[show,setShow]=useState(false);
 const r=records[q.id]??chEmpty(),theme=getRealmTheme('chance'),trials=q.mode==='experiment'?r.trials:q.trials;
 const select=(f:CHForm,i:number)=>{stopSpeaking();setShow(false);router.replace(`/demo-review/chance-level${level}?form=${f}&question=${i+1}`,{scroll:false});};
 const update=(next:CHResponse)=>{setRecords(old=>({...old,[q.id]:next}));setFinished(old=>({...old,[form]:false}));};
 const advance=()=>index===19?setFinished(old=>({...old,[form]:true})):select(form,index+1);
 const trial=()=>{if(r.trials.length>=q.target!)return;const u=new Uint32Array(1);crypto.getRandomValues(u);const outcome=chOutcome(q,u[0]/4294967296);update({...r,trials:[...r.trials,outcome],values:[]});};
 const answered=items.filter(item=>records[item.id]&&chReady(item,records[item.id])).length;
 return <main className={styles.page} style={{'--light':theme.chipText,'--accent':theme.accentText,'--selected':theme.ctaFrom,'--ring':theme.borderRing,'--cta':theme.ctaGradientCss,'--surface':theme.cardSurface,'--tint':theme.surfaceTint} as CSSProperties}><div className={styles.shell}>
 <header className={styles.header}><div><p>CHANCE HOLLOW · LEVEL {level}</p><h1>Level {level} assessments</h1></div><Link href={`/demo-review?realm=chance&year=Year%20${level}`} >Back to review</Link></header>
 <div className={styles.reviewBar}><div className={styles.formTabs}>{CH_FORMS.map(f=><button key={f} aria-pressed={form===f} onClick={()=>select(f,index)}>{CH_LABELS[f]}</button>)}</div><select aria-label='Review question' value={index} onChange={e=>select(form,Number(e.target.value))}>{items.map((item,i)=><option key={item.id} value={i}>{i+1} — {item.skill}</option>)}</select><span>Review only · 20 questions per form · Student results are not saved</span><span>{answered}/20 recorded</span></div>
 <AssessmentQuestionNavigator answeredFlags={items.map(item=>Boolean(records[item.id]&&chReady(item,records[item.id])))} currentIndex={index} onJump={i=>select(form,i)} realmId='chance' reviewMode/>
 <section className={styles.card} data-question-id={q.id} aria-labelledby='ch-question'><p className={styles.counter}>Question {index+1} of 20 · {CH_LABELS[form]}</p>
 <div className={styles.question}><h2 id='ch-question'><MathFormattedText text={q.prompt}/></h2><ReadAloudBtn text={[q.prompt,q.instruction].filter(Boolean).join('. ')} label='Read question' className={styles.voice}/></div>{q.instruction&&<p className={styles.instruction}>{q.instruction}</p>}
 <div className={styles.activity}><div className={styles.source}><div className={styles.panelHeader}><h3>{q.mode==='experiment'?'Try the experiment':q.rows||trials?'Experiment results':'Look at the evidence'}</h3><ReadAloudBtn text={chSpeech(q,r)} label='Read diagram' className={styles.voice}/></div>
 <p className={ch.caption}><MathFormattedText text={q.caption}/></p>
 {q.apparatus&&<div className={ch.apparatus}><ChanceVisual visual={q.apparatus}/></div>}
 {q.displays&&<div className={ch.displays}>{q.displays.map(d=><div key={d.label}><h4>{d.label}</h4><ChanceVisual visual={d.apparatus}/><p>{d.caption}</p></div>)}</div>}
 {q.mode==='experiment'&&<div className={ch.experiment}><button className={styles.primary} disabled={r.trials.length===q.target} onClick={trial}>{q.experiment==='coin'?'Toss coin':q.experiment==='twoCoins'?'Toss both coins':'Spin'}</button><span aria-live='polite'>{r.trials.length}/{q.target} trials{r.trials.length>0?` · Latest: ${r.trials.at(-1)}`:''}</span></div>}
 {trials&&trials.length>0&&<ol className={ch.trials} aria-label='Trial results'>{trials.map((t,i)=><li key={i}><small>{i+1}</small><strong>{t}</strong></li>)}</ol>}
 {q.matrix&&<div className={ch.matrix}><table className={styles.frequencyTable}><caption>Difference between the two dice</caption><thead><tr><th scope='col'>Die 1 ↓ / Die 2 →</th>{[1,2,3,4,5,6].map(n=><th scope='col' key={n}>{n}</th>)}</tr></thead><tbody>{q.matrix.map((row,i)=><tr key={i}><th scope='row'>{i+1}</th>{row.map((n,j)=><td key={j}>{n}</td>)}</tr>)}</tbody></table></div>}
 {q.rows&&<table className={styles.frequencyTable}><thead><tr><th scope='col'>Experiment</th>{q.outcomes!.map(o=><th scope='col' key={o}>{o}</th>)}</tr></thead><tbody>{q.rows.map(row=><tr key={row.label}><th scope='row'>{row.label}</th>{row.counts.map((n,i)=><td key={i}>{n}</td>)}</tr>)}</tbody></table>}
 </div><div className={styles.answer}>
 {q.mode==='choice'?q.options.map((o,i)=><div className={styles.option} key={o}><button aria-pressed={!r.skipped&&r.choice===i} onClick={()=>update({...chEmpty(),choice:i})}><MathFormattedText text={o}/></button><ReadAloudBtn text={o} label='Read answer' className={styles.voice}/></div>):<><div className={styles.panelHeader}><h3>Your results table</h3><ReadAloudBtn text={`Record how many times each outcome appeared: ${q.outcomes!.join(', ')}. ${q.mode==='experiment'?'Complete all trials first.':''}`} label='Read table' className={styles.voice}/></div><table className={styles.frequencyTable}><thead><tr><th scope='col'>Outcome</th><th scope='col'>Number of times</th></tr></thead><tbody>{q.outcomes!.map((o,i)=><tr key={o}><th scope='row'>{o}</th><td><input className={ch.input} aria-label={`${o} count`} inputMode='numeric' value={r.values[i]??''} disabled={q.mode==='experiment'&&r.trials.length!==q.target} onChange={e=>{const values=[...r.values];values[i]=e.target.value.replace(/\D/g,'').slice(0,2);update({...r,values,skipped:false});}}/></td></tr>)}</tbody></table>{q.mode==='experiment'&&r.trials.length!==q.target&&<p>Complete all {q.target} trials to fill in your table.</p>}</>}
 </div></div><p className={styles.status} aria-live='polite'>{r.skipped?'You chose “I don’t know”.':chReady(q,r)?'Answer recorded.':''}</p>
 <footer className={styles.footer}><button disabled={index===0} onClick={()=>select(form,index-1)}>Back</button><button onClick={()=>{update({...chEmpty(),skipped:true});advance();}}>I don’t know</button><button className={styles.primary} onClick={advance}>{index===19?'Finish':'Next'}</button></footer></section>
 <details className={styles.notes} key={q.id}><summary>Review details</summary><p>{q.code} · {q.skill} · Chance Hollow lesson week {q.week}</p><button onClick={()=>setShow(!show)}>{show?'Hide answer':'Show answer'}</button>{show&&<p>{q.mode==='choice'?`${q.options[q.correct]} `:''}{q.explanation}</p>}<p>Five parallel forms for review. Experiments are scored against the results the student actually generated.</p></details>
 {finished[form]&&<p role='status' className={styles.notes}>{CH_LABELS[form]} review: {items.filter(item=>records[item.id]&&chScore(item,records[item.id])).length}/20 correct · {answered}/20 recorded. Nothing was saved to a student record.</p>}
 </div></main>;
}
