'use client';
import Link from 'next/link';
import {useState,type CSSProperties} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {PP_FORMS,PP_LABELS,PP_OPERATIONS,ppEmpty,ppReady,ppScore,ppVisualSpeech,type PPForm,type PPItem,type PPVisual,type PPResponse} from '@/data/assessments/revisions/level3PatternPeaksFiveForms';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import AssessmentQuestionNavigator from '@/components/assessment/AssessmentQuestionNavigator';
import {getRealmTheme} from '@/lib/useRealmTheme';
import {stopSpeaking} from '@/lib/speak';
import styles from './StatisticaFiveForms.module.css';
import pp from './PatternPeaksFiveForms.module.css';
function Visual({v}:{v:PPVisual}){
 return <div className={pp.visual}>
 {v.kind==='sequence'?<>{v.rule&&<h4>{v.rule}</h4>}<div className={pp.tiles}>{v.terms.map((n,i)=><div className={pp.tiles} key={i}><span className={pp.tile}>{n}</span>{i<v.terms.length-1&&<span className={pp.arrow} aria-hidden>→</span>}</div>)}</div></>:
 v.kind==='cards'?v.cards.map((c,i)=><div key={i}><h4>{c.label}</h4><div className={pp.equation}>{c.text}</div></div>):
 v.kind==='array'?<><h4>{v.rows} rows of {v.columns} counters</h4>{v.splitAfter&&<p className={pp.splitLabel}>{v.splitAfter} columns + {v.columns-v.splitAfter} columns</p>}<div className={pp.array}>{Array.from({length:v.rows},(_,r)=><div className={pp.arrayRow} key={r}>{Array.from({length:v.columns},(_,c)=><span className={`${pp.counter} ${v.splitAfter&&c>=v.splitAfter?pp.secondPart:''}`} data-pp-counter key={c}/>)}</div>)}</div></>:
 v.kind==='balance'?<div className={pp.balance}><div className={pp.pans}><div>{v.left}</div><span>=</span><div>{v.right}</div></div><div className={pp.beam}/><div className={pp.stand}/></div>:
 v.kind==='parts'?<div className={pp.partModel}><div className={pp.whole}><small>Whole</small><strong>{v.whole}</strong></div><div className={pp.parts}>{v.parts.map((part,i)=><div key={i}><small>Part {i+1}</small><strong>{part}</strong></div>)}</div><p>Diagram not to scale</p></div>:
 v.kind==='decision'?<><div className={pp.tile}><h4>Input</h4>{v.input}</div><div className={pp.arrow} aria-hidden>↓</div><div className={pp.decision}>Is the number even?</div><div className={pp.branches}><div><strong>Yes ↙</strong><div className={pp.branch}>{v.yes}</div></div><div><strong>No ↘</strong><div className={pp.branch}>{v.no}</div></div></div><div className={pp.arrow} aria-hidden>↓</div><div className={pp.tile}><h4>Output</h4>?</div></>:
 <table className={pp.table}><thead><tr><th scope='col'>Input</th><th scope='col'>Output</th></tr></thead><tbody>{v.inputs.map((n,i)=><tr key={i}><td>{n}</td><td>{v.outputs[i]}</td></tr>)}</tbody></table>}
 </div>;
}
export default function PatternPeaksFiveFormReview({level,forms}:{level:3|4;forms:Record<PPForm,PPItem[]>}){
 const router=useRouter(),params=useSearchParams();const form=PP_FORMS.find(f=>f===params.get('form'))??'posttest';
 const raw=Number(params.get('question')??1)-1,index=Number.isInteger(raw)?Math.max(0,Math.min(19,raw)):0,items=forms[form],item=items[index];
 const [records,setRecords]=useState<Record<string,PPResponse>>({}),[finished,setFinished]=useState<Partial<Record<PPForm,boolean>>>({}),[showAnswer,setShowAnswer]=useState(false);
 const response=records[item.id]??ppEmpty(),theme=getRealmTheme('pattern');
 const select=(f:PPForm,i:number)=>{stopSpeaking();setShowAnswer(false);router.replace(`/demo-review/pattern-level${level}?form=${f}&question=${i+1}`,{scroll:false});};
 const update=(r:PPResponse)=>{setRecords(old=>({...old,[item.id]:r}));setFinished(old=>({...old,[form]:false}));};
 const advance=()=>index===19?setFinished(old=>({...old,[form]:true})):select(form,index+1);
 const answered=items.filter(q=>records[q.id]&&ppReady(q,records[q.id])).length;
 const expected=item.mode==='choice'?item.options[item.correct]:item.mode==='equivalent'?`Two numbers from 1 to ${item.equivalence!.max} satisfying ${item.equivalence!.left} + first = ${item.equivalence!.right} + second.`:item.mode==='partition'?`Any two positive whole numbers totalling ${item.total}.`:item.mode==='algorithm'?`Any two steps that multiply each input by ${item.multiplier}.`:item.answers.join(', ');
 return <main className={styles.page} style={{'--light':theme.chipText,'--accent':theme.accentText,'--selected':theme.ctaFrom,'--ring':theme.borderRing,'--cta':theme.ctaGradientCss,'--surface':theme.cardSurface,'--tint':theme.surfaceTint} as CSSProperties}><div className={styles.shell}>
 <header className={styles.header}><div><p>PATTERN PEAKS · LEVEL {level}</p><h1>Level {level} assessments</h1></div><Link href={`/demo-review?realm=pattern&year=Year%20${level}`}>Back to review</Link></header>
 <div className={styles.reviewBar}><div className={styles.formTabs}>{PP_FORMS.map(f=><button key={f} aria-pressed={f===form} onClick={()=>select(f,index)}>{PP_LABELS[f]}</button>)}</div><select aria-label='Review question' value={index} onChange={e=>select(form,Number(e.target.value))}>{items.map((q,i)=><option key={q.id} value={i}>{i+1} — {q.skill}</option>)}</select><span>Review only · 20 questions per form · Student results are not saved</span><span>{answered}/20 recorded</span></div>
 <AssessmentQuestionNavigator answeredFlags={items.map(q=>Boolean(records[q.id]&&ppReady(q,records[q.id])))} currentIndex={index} onJump={i=>select(form,i)} realmId='pattern' reviewMode/>
 <section className={styles.card} aria-labelledby='pp-question-heading' data-question-id={item.id}>
 <p className={styles.counter}>Question {index+1} of 20 · {PP_LABELS[form]}</p><div className={styles.question}><h2 id='pp-question-heading'>{item.prompt}</h2><ReadAloudBtn className={styles.voice} label='Read question' text={`${item.prompt} ${item.instruction}`}/></div>{item.instruction&&<p className={styles.instruction}>{item.instruction}</p>}
 <div className={styles.activity}><div className={styles.source}><div className={styles.panelHeader}><h3>{item.visual.kind==='decision'?'Number pathway':item.visual.kind==='table'?'Number machine':'Look at the model'}</h3><ReadAloudBtn className={styles.voice} label='Read diagram' text={ppVisualSpeech(item.visual)}/></div><Visual v={item.visual}/></div>
 <div className={styles.answer}>
 {item.mode==='choice'?item.options.map((o,i)=><div className={styles.option} key={i}><button data-pp-option={i} aria-pressed={!response.skipped&&response.choice===i} onClick={()=>update({...ppEmpty(),choice:i})}>{o}</button><ReadAloudBtn className={styles.voice} kind='option' text={o}/></div>):item.mode==='algorithm'?<div className={pp.builder}>
 <div className={styles.panelHeader}><h3>Your two steps</h3><ReadAloudBtn className={styles.voice} label='Read your rule' text={`Step 1: ${response.operations[0]??'empty'}. Step 2: ${response.operations[1]??'empty'}. Choices: ${PP_OPERATIONS.join(', ')}. Add the starting number means use the original input, not the result of step one.`}/></div>
 <div className={pp.steps}>{[0,1].map(i=><div className={pp.step} key={i}><small>Step {i+1}</small><strong>{response.operations[i]??'?'}</strong></div>)}</div>
 <p className={styles.instruction}>“Starting number” means the original input.</p>
 <div className={pp.palette}>{PP_OPERATIONS.map(op=><div className={pp.operation} key={op}><button data-pp-operation={op} disabled={response.operations.length===2} onClick={()=>update({...ppEmpty(),operations:[...response.operations,op]})}>{op}</button><ReadAloudBtn className={styles.voice} kind='option' text={op}/></div>)}</div>
 <div className={pp.tools}><button disabled={!response.operations.length} onClick={()=>update({...ppEmpty(),operations:response.operations.slice(0,-1)})}>Undo</button><button disabled={!response.operations.length} onClick={()=>update(ppEmpty())}>Clear</button></div>
 </div>:<><div className={pp.readResponse}><ReadAloudBtn className={styles.voice} label='Read answer boxes' text={item.labels.map((label,i)=>`${label}: ${response.values[i]||'empty'}`).join('. ')}/></div><div className={pp.numbers}>{item.labels.map((label,i)=><label key={i}>{label}<input aria-label={label} inputMode='numeric' autoComplete='off' value={response.values[i]??''} onChange={e=>update({...ppEmpty(),values:item.labels.map((_,j)=>i===j?e.target.value:response.values[j]??'')})}/></label>)}</div></>}
 </div></div>
 <div className={styles.status} role='status'>{response.skipped?'You chose ‘I don’t know’.':ppReady(item,response)?'Answer recorded.':''}</div>
 <footer className={styles.footer}><button disabled={index===0} onClick={()=>select(form,index-1)}>Back</button><button onClick={()=>{update({...ppEmpty(),skipped:true});advance();}}>I don’t know</button><button className={styles.primary} onClick={advance}>{index===19?'Finish':'Next'}</button></footer>
 </section>
 <details className={styles.notes} key={item.id}><summary>Review details</summary><p>{item.code} · {item.skill} · {item.difficulty} · Pattern Peaks lesson week {item.week}</p><button onClick={()=>setShowAnswer(v=>!v)}>{showAnswer?'Hide answer':'Show answer'}</button>{showAnswer&&<p>Expected response: {expected}</p>}<p>Five parallel forms for content review. Student attempts are unchanged.</p></details>
 {finished[form]&&<div className={styles.notes} role='status'>{PP_LABELS[form]} review: {items.filter(q=>records[q.id]&&ppScore(q,records[q.id])).length}/20 correct · {answered}/20 recorded. Nothing was saved to a student record.</div>}
 </div></main>;
}
