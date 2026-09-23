'use client';
import PatternPeaksAssessmentCard from './PatternPeaksAssessmentCard';
import Link from 'next/link';
import {useState,type CSSProperties} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {PP_FORMS,PP_LABELS,ppEmpty,ppReady,ppScore,type PPForm,type PPItem,type PPResponse} from '@/data/assessments/revisions/level3PatternPeaksFiveForms';
import {MathFormattedText} from '@/components/FractionText';
import AssessmentQuestionNavigator from '@/components/assessment/AssessmentQuestionNavigator';
import {getRealmTheme} from '@/lib/useRealmTheme';
import {stopSpeaking} from '@/lib/speak';
import styles from './StatisticaFiveForms.module.css';
export default function PatternPeaksFiveFormReview({level,forms}:{level:3|4|5|6|7|8;forms:Record<PPForm,PPItem[]>}){
 const router=useRouter(),params=useSearchParams();const form=PP_FORMS.find(f=>f===params.get('form'))??'posttest';
 const items=forms[form],count=items.length;
 const raw=Number(params.get('question')??1)-1,index=Number.isInteger(raw)?Math.max(0,Math.min(count-1,raw)):0,item=items[index];
 const [records,setRecords]=useState<Record<string,PPResponse>>({}),[finished,setFinished]=useState<Partial<Record<PPForm,boolean>>>({}),[showAnswer,setShowAnswer]=useState(false);
 const response=records[item.id]??ppEmpty(),theme=getRealmTheme('pattern');
 const select=(f:PPForm,i:number)=>{stopSpeaking();setShowAnswer(false);router.replace(`/demo-review/pattern-level${level}?form=${f}&question=${i+1}`,{scroll:false});};
 const update=(r:PPResponse)=>{setRecords(old=>({...old,[item.id]:r}));setFinished(old=>({...old,[form]:false}));};
 const advance=()=>index===count-1?setFinished(old=>({...old,[form]:true})):select(form,index+1);
 const answered=items.filter(q=>records[q.id]&&ppReady(q,records[q.id])).length;
 const expected=(item.mode==='choice'||item.mode==='testerChoice'||item.mode==='labChoice')?item.options[item.correct]:item.mode==='plot'?item.plotPoints!.map(p=>`(${p.join(', ')})`).join('; '):item.mode==='linearPair'?`Any A and B from 1 to 20 satisfying 3 × A + B = ${item.total}.`:item.mode==='product'?`Any two whole numbers from 2 to ${item.maxFactor} whose product is ${item.total}.`:item.mode==='filterBuilder'?`Two divisors whose lowest common multiple is ${item.targetMultiple}.`:item.mode==='equivalent'?`Two numbers from 1 to ${item.equivalence!.max} satisfying ${item.equivalence!.left} + first = ${item.equivalence!.right} + second.`:item.mode==='partition'?`Any two positive whole numbers totalling ${item.total}.`:item.mode==='algorithm'?`Any two steps that multiply each input by ${item.multiplier}${item.algorithmOffset?` and add ${item.algorithmOffset}`:''}.`:item.answers.join(', ');
 return <main className={styles.page} style={{'--light':theme.chipText,'--accent':theme.accentText,'--selected':theme.ctaFrom,'--ring':theme.borderRing,'--cta':theme.ctaGradientCss,'--surface':theme.cardSurface,'--tint':theme.surfaceTint} as CSSProperties}><div className={styles.shell}>
 <header className={styles.header}><div><p>PATTERN PEAKS · LEVEL {level}</p><h1>Level {level} assessments</h1></div><Link href={`/demo-review?realm=pattern&year=Year%20${level}`}>Back to review</Link></header>
 <div className={styles.reviewBar}><div className={styles.formTabs}>{PP_FORMS.map(f=><button key={f} aria-pressed={f===form} onClick={()=>select(f,index)}>{PP_LABELS[f]}</button>)}</div><select aria-label='Review question' value={index} onChange={e=>select(form,Number(e.target.value))}>{items.map((q,i)=><option key={q.id} value={i}>{i+1} — {q.skill}</option>)}</select><span>Review only · {count} questions per form · Student results are not saved</span><span>{answered}/{count} recorded</span></div>
 <AssessmentQuestionNavigator answeredFlags={items.map(q=>Boolean(records[q.id]&&ppReady(q,records[q.id])))} currentIndex={index} onJump={i=>select(form,i)} realmId='pattern' reviewMode/>
 <section className={styles.card} aria-labelledby='pp-question-heading' data-question-id={item.id}>
 <p className={styles.counter}>Question {index+1} of {count} · {PP_LABELS[form]}</p><PatternPeaksAssessmentCard item={item} response={response} update={update}/>
 <footer className={styles.footer}><button disabled={index===0} onClick={()=>select(form,index-1)}>Back</button><button onClick={()=>{update({...ppEmpty(),skipped:true});advance();}}>I don’t know</button><button className={styles.primary} onClick={advance}>{index===count-1?'Finish':'Next'}</button></footer>
 </section>
 <details className={styles.notes} key={item.id}><summary>Review details</summary><p>{item.code} · {item.skill} · {item.difficulty} · {level>=7?`Year ${level} curriculum review`:`Pattern Peaks lesson week ${item.week}`}</p><button onClick={()=>setShowAnswer(v=>!v)}>{showAnswer?'Hide answer':'Show answer'}</button>{showAnswer&&<p>Expected response: <MathFormattedText text={expected}/></p>}<p>Five parallel forms for content review. Student attempts are unchanged.</p></details>
 {finished[form]&&<div className={styles.notes} role='status'>{PP_LABELS[form]} review: {items.filter(q=>records[q.id]&&ppScore(q,records[q.id])).length}/{count} correct · {answered}/{count} recorded. Nothing was saved to a student record.</div>}
 </div></main>;
}
