'use client';
import Link from 'next/link';
import {useState,type CSSProperties} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {LEVEL1_PP_FORMS,PP_FORMS,PP_LABELS,ppReady,ppScore,ppSay,type PPForm,type PPValue,type PPResponse} from '@/data/assessments/revisions/level1PatternPeaksFiveForms';
import {RepeatingPatternToken} from '@/components/number-nexus/RepeatingPatternVisual';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import AssessmentQuestionNavigator from '@/components/assessment/AssessmentQuestionNavigator';
import {getRealmTheme} from '@/lib/useRealmTheme';
import {stopSpeaking} from '@/lib/speak';
import styles from './StatisticaFiveForms.module.css';
import pp from './PatternPeaksFiveForms.module.css';
function Tile({value}:{value:PPValue}){return typeof value==='string'&&value!=='?'?<RepeatingPatternToken token={value}/>:<span className={`${pp.tile} ${value==='?'?pp.blank:''}`}>{value}</span>;}
export default function Level1PatternPeaksFiveFormReview(){
 const router=useRouter(),params=useSearchParams();
 const form=PP_FORMS.find(f=>f===params.get('form'))??'posttest';
 const raw=Number(params.get('question')??1)-1,index=Number.isInteger(raw)?Math.max(0,Math.min(19,raw)):0;
 const items=LEVEL1_PP_FORMS[form],item=items[index];
 const [records,setRecords]=useState<Record<string,PPResponse>>({});
 const [finished,setFinished]=useState<Partial<Record<PPForm,boolean>>>({});
 const [showAnswer,setShowAnswer]=useState(false);
 const response=records[item.id]??{built:[]};
 const theme=getRealmTheme('pattern');
 const select=(f:PPForm,i:number)=>{stopSpeaking();setShowAnswer(false);router.replace(`/demo-review/pattern-level1?form=${f}&question=${i+1}`,{scroll:false});};
 const update=(r:PPResponse)=>{setRecords(old=>({...old,[item.id]:r}));setFinished(old=>({...old,[form]:false}));};
 const advance=()=>index===19?setFinished(old=>({...old,[form]:true})):select(form,index+1);
 const answered=items.filter(q=>records[q.id]&&ppReady(q,records[q.id])).length;
 const sourceSpeech=item.groups?`${item.groups.count} groups. Each group has ${item.groups.size} counters.`:ppSay(item.sequence);
 const expected=item.mode==='choice'?ppSay(item.options[item.correct].values):item.mode==='create'?(item.createStep?`Any four allowed numbers increasing by ${item.createStep}.`:'Any pair of different pictures repeated three times.'):ppSay(item.expected);
 return <main className={styles.page} style={{'--light':theme.chipText,'--accent':theme.accentText,'--selected':theme.ctaFrom,'--ring':theme.borderRing,'--cta':theme.ctaGradientCss,'--surface':theme.cardSurface,'--tint':theme.surfaceTint} as CSSProperties}><div className={styles.shell}>
 <header className={styles.header}><div><p>PATTERN PEAKS · LEVEL 1</p><h1>Level 1 assessments</h1></div><Link href='/demo-review?realm=pattern&year=Year%201'>Back to review</Link></header>
 <div className={styles.reviewBar}><div className={styles.formTabs}>{PP_FORMS.map(f=><button key={f} aria-pressed={f===form} onClick={()=>select(f,index)}>{PP_LABELS[f]}</button>)}</div><select aria-label='Review question' value={index} onChange={e=>select(form,Number(e.target.value))}>{items.map((q,i)=><option key={q.id} value={i}>{i+1} — {q.skill}</option>)}</select><span>Review only · 20 questions per form · Student results are not saved</span><span>{answered}/20 recorded</span></div>
 <AssessmentQuestionNavigator answeredFlags={items.map(q=>Boolean(records[q.id]&&ppReady(q,records[q.id])))} currentIndex={index} onJump={i=>select(form,i)} realmId='pattern' reviewMode/>
 <section className={styles.card} aria-labelledby='pp-question-heading' data-question-id={item.id}>
 <p className={styles.counter}>Question {index+1} of 20 · {PP_LABELS[form]}</p>
 <div className={styles.question}><h2 id='pp-question-heading'>{item.prompt}</h2><ReadAloudBtn className={styles.voice} label='Read question' text={`${item.prompt} ${item.instruction}`}/></div>
 {item.instruction&&<p className={styles.instruction}>{item.instruction}</p>}
 <div className={styles.activity}>
 {(item.sequence.length>0||item.groups)&&<div className={styles.source}><div className={styles.panelHeader}><h3>{item.groups?'Equal groups':'Look at the pattern'}</h3><ReadAloudBtn className={styles.voice} label='Read diagram' text={sourceSpeech}/></div>
 {item.groups?<div className={pp.groups}>{Array.from({length:item.groups.count},(_,g)=><div className={pp.group} key={g} aria-label={`Group ${g+1}: ${item.groups!.size} counters`}>{Array.from({length:item.groups!.size},(_,j)=><span key={j}/>)}</div>)}</div>:<div className={pp.strip}>{item.sequence.map((v,i)=><Tile key={i} value={v}/>)}</div>}</div>}
 <div className={`${styles.answer} ${!item.sequence.length&&!item.groups?pp.wide:''}`}>
 {item.mode==='choice'?<div className={pp.optionGrid}>{item.options.map((o,i)=><div className={styles.option} key={i}><button data-pp-option={i} aria-label={`Choose ${ppSay(o.values)}`} aria-pressed={!response.skipped&&response.choice===i} onClick={()=>update({built:[],choice:i})}><span className={pp.optionTiles}>{o.values.map((v,j)=><Tile key={j} value={v}/>)}</span></button><ReadAloudBtn className={styles.voice} kind='option' text={ppSay(o.values)}/></div>)}</div>:<>
 <div className={pp.buildTitle}><h3>Your pattern</h3><ReadAloudBtn className={styles.voice} label='Read your pattern' text={`${item.instruction} Your pattern: ${response.built.length?ppSay(response.built):'empty'}. ${item.expected.length-response.built.length} spaces left. Choices: ${ppSay(item.palette)}.`}/></div>
 <div className={`${pp.strip} ${pp.response}`} data-pp-built>{Array.from({length:item.expected.length},(_,i)=><Tile key={i} value={response.built[i]??'?'}/>)}</div>
 <div className={pp.palette}>{item.palette.map((v,i)=><div key={i}><button data-pp-token={String(v)} aria-label={`Add ${ppSay([v])}`} disabled={response.built.length===item.expected.length} onClick={()=>update({built:[...response.built,v]})}><Tile value={v}/></button><ReadAloudBtn className={styles.voice} kind='option' text={ppSay([v])}/></div>)}</div>
 <div className={pp.tools}><button disabled={!response.built.length} onClick={()=>update({built:response.built.slice(0,-1)})}>Undo</button><button disabled={!response.built.length} onClick={()=>update({built:[]})}>Clear</button></div>
 </>}
 </div></div>
 <div className={styles.status} role='status'>{response.skipped?'You chose ‘I don’t know’.':ppReady(item,response)?'Answer recorded.':''}</div>
 <footer className={styles.footer}><button disabled={index===0} onClick={()=>select(form,index-1)}>Back</button><button onClick={()=>{update({built:[],skipped:true});advance();}}>I don’t know</button><button className={styles.primary} onClick={advance}>{index===19?'Finish':'Next'}</button></footer>
 </section>
 <details className={styles.notes} key={item.id}><summary>Review details</summary><p>{item.code} · {item.skill} · {item.difficulty} · Existing Year 1 lesson week {item.week}</p><button onClick={()=>setShowAnswer(v=>!v)}>{showAnswer?'Hide answer':'Show answer'}</button>{showAnswer&&<p>Expected response: {expected}</p>}<p>Five parallel forms for review. Existing student assessment banks are unchanged.</p></details>
 {finished[form]&&<div className={styles.notes} role='status'>{PP_LABELS[form]} review: {items.filter(q=>records[q.id]&&ppScore(q,records[q.id])).length}/20 correct · {answered}/20 recorded. Nothing was saved to a student record.</div>}
 </div></main>;
}
