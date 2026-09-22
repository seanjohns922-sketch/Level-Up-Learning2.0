'use client';
import ObjectArt from './StatisticaObjectArt';
import StatisticaSortActivity from './StatisticaSortActivity';
import ReviewGraph from './StatisticaReviewGraph';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import type {StatsItem,Category} from '@/data/assessments/revisions/level1StatisticaFiveForms';
import type {StatsResponse} from '@/lib/statistica-level1-review';
import styles from '@/components/demo/StatisticaFiveForms.module.css';

function Marks({n,display,category}:{n:number;display:StatsItem['display'];category:Category}){
 if(display==='tally')return <div className={styles.marks} aria-label={`${n} tally marks`}>{Array.from({length:Math.ceil(n/5)},(_,g)=><svg key={g} viewBox="0 0 40 38" width="40" height="38" aria-hidden="true">{Array.from({length:Math.min(4,n-g*5)},(_,i)=><path key={i} d={`M${6+i*8} 5V33`} stroke="currentColor" strokeWidth="2.5"/>)}{n-g*5>=5&&<path d="M2 31L37 7" stroke="currentColor" strokeWidth="2.5"/>}</svg>)}</div>;
 return <div className={styles.marks} aria-label={`${n} ${display==='pictures'?category.name:'marks'}`}>{Array.from({length:n},(_,i)=><span className={styles.unit} key={i} aria-hidden="true">{display==='pictures'?<ObjectArt name={category.name} color={category.color} size={32}/>:<span className={display==='objects'?styles.counterDisc:styles.dot}/>}</span>)}{n===0&&<span className={styles.zero}>0</span>}</div>;
}
export default function StatisticaAssessmentCard({item,response,onChange}:{item:StatsItem;response:StatsResponse;onChange:(r:StatsResponse)=>void}){
 const names=item.categories.map(c=>c.name);
 const observationLabel=item.sourceLabel??(item.source==='objects'?'Picture':'Child');
 const countSpeech=item.counts.map((n,i)=>`${names[i]}: ${n}`).join('. ');
 const graphProps={max:item.graphMax??12,step:item.graphStep??1,axisLabel:item.axisLabel,valueLabel:item.valueLabel,numerical:item.numerical};
 const scaleSpeech=`Scale from zero to ${graphProps.max} in steps of ${graphProps.step}. ${item.valueLabel??'Groups'} on the bottom axis.`;
 const art=(i:number,size:number)=>item.numerical?<span className={styles.numericValue}>{names[i]}</span>:<ObjectArt name={names[i]} color={item.categories[i].color} size={size}/>;
 const sourceSpeech=item.source==='brief'?`${item.context}. ${item.sourceText}`:item.source==='dual'?`${item.context}. Graph A uses ${item.numerical?'dots':'pictures'}. One ${item.numerical?'dot represents one child':'picture represents one answer'}. ${countSpeech}. Graph B uses columns, ${scaleSpeech} ${ (item.secondaryOrder??item.categories.map((_,i)=>i)).map(i=>`${names[i]}: ${item.counts[i]}`).join('. ')}.`:item.source==='table'?`${item.context}. Frequency table. Frequency means how many answers. ${countSpeech}.`:item.source==='categories'?`Possible answers: ${names.join(', ')}.`:item.source==='graph'?`${item.context}. ${item.graphKind==='columns'?`Column graph. ${scaleSpeech}`:'One picture stands for one answer.'} ${countSpeech}.`:`${item.context}. ${item.observations.map((v,i)=>`${observationLabel} ${i+1}: ${names[v]}`).join('. ')}.`;
 const listSpeech=item.source==='missing'?`Recorded list: ${item.recorded?.map((v,i)=>`Child ${i+1}: ${names[v]}`).join('. ')}.`:item.source==='duplicate'?`Recorded list: ${item.recorded?.map(i=>`Child ${i+1}: ${names[item.observations[i]]}`).join('. ')}.`:'';
 const add=(i:number,d:number)=>onChange({...response,touched:true,values:response.values.map((v,j)=>i===j?Math.max(0,Math.min(item.display==='columns'?12:20,v+d)):v)});
 const controls=(n:number,i:number)=>{const c=item.categories[item.target??i];return <div className={styles.adjust}><button aria-label={`Remove one from ${c.name}`} disabled={n===0} onClick={()=>add(i,-1)}>−</button><output aria-label={`${c.name} recorded`}>{n}</output><button aria-label={`Add one to ${c.name}`} disabled={n===(item.display==='columns'?12:20)} onClick={()=>add(i,1)}>+</button></div>;};
 const table=(values:number[],editable=false)=><table className={styles.frequencyTable}><thead><tr><th scope="col">{item.valueLabel??'Group'}</th><th scope="col">Frequency</th></tr></thead><tbody>{values.map((n,i)=><tr key={i}><th scope="row"><span className={styles.category}>{item.numerical?names[i]:<>{art(i,34)}{names[i]}</>}</span></th><td>{editable?controls(n,i):n}</td></tr>)}</tbody></table>;
 const graph=(values:number[],editable=false)=>{
  if(editable&&item.display==='frequency')return table(values,true);
  if(editable&&item.display==='columns')return <><ReviewGraph {...graphProps} categories={item.categories} values={values} kind="columns"/><div className={styles.columnControls}>{values.map((n,i)=><div key={i}><strong>{names[i]}</strong>{controls(n,i)}</div>)}</div></>;
  if(!editable&&item.graphKind==='columns')return <ReviewGraph {...graphProps} categories={item.categories} values={values} kind="columns"/>;
  return <div className={styles.graph}>{values.map((n,i)=>{const c=item.categories[editable?(item.target??i):i];return <div className={styles.graphRow} key={i}><span className={styles.category} data-category={c.name}><ObjectArt name={c.name} color={c.color} size={30}/>{c.name}</span><Marks n={n} display={editable?item.display:'pictures'} category={c}/>{editable&&controls(n,i)}</div>;})}</div>;
 };
 return <>
  <div className={styles.question}><h2 id="stats-question-heading">{item.prompt}</h2><ReadAloudBtn className={styles.voice} label="Read question" text={`${item.prompt} ${item.instruction}`}/></div>
  {item.instruction&&<p className={styles.instruction}>{item.instruction}</p>}
  {item.mode==='sort'?<StatisticaSortActivity item={item} response={response} onChange={onChange}/>:<div className={`${styles.activity} ${item.source==='dual'?styles.wideActivity:''}`}>
   <div className={styles.source} data-stats-source><div className={styles.panelHeader}><h3>{item.source==='categories'?'Survey answers':item.context}</h3><ReadAloudBtn className={styles.voice} label="Read diagram" text={`${sourceSpeech} ${listSpeech}`}/></div>
    {item.source==='brief'?<p className={styles.sourceBrief}>{item.sourceText}</p>:item.source==='dual'?<div className={styles.twoGraphs}><div><h4>Graph A · {item.numerical?'Dots':'Pictures'}</h4><ReviewGraph {...graphProps} categories={item.categories} values={item.counts} kind="pictures"/></div><div><h4>Graph B · Columns</h4><ReviewGraph {...graphProps} categories={item.categories} values={item.counts} kind="columns" order={item.secondaryOrder}/></div></div>:item.source==='table'?table(item.counts):item.source==='graph'?graph(item.counts):item.source==='categories'?<div className={styles.categoryChoices}>{item.categories.map(c=><div key={c.name}><ObjectArt name={c.name} color={c.color} size={80}/><span>{c.name}</span></div>)}</div>:<div className={styles.observations}>{item.observations.map((v,i)=><div key={i}><span>{observationLabel} {i+1}</span>{art(v,58)}{!item.numerical&&<strong>{names[v]}</strong>}</div>)}</div>}
    {(item.source==='missing'||item.source==='duplicate')&&<div className={styles.recordList}><h4>Recorded list</h4>{item.recorded?.map((v,i)=>{const child=item.source==='duplicate'?v:i;const cat=item.source==='duplicate'?item.observations[v]:v;return <span key={i}>Child {child+1}: {names[cat]}</span>;})}</div>}
   </div>
   <div className={`${styles.answer} ${item.source==='dual'?styles.wideOptions:''}`}>
    {item.mode==='choice'?item.options.map(o=><div className={styles.option} key={o.id}><button aria-pressed={response.choice===o.id} onClick={()=>onChange({...response,choice:o.id,touched:true})}>{o.label}</button><ReadAloudBtn className={styles.voice} kind="option" text={o.label}/></div>):item.mode==='counts'?<><div className={styles.panelHeader}><h3>Your {item.display==='tally'?'tally':item.display==='frequency'?'frequency table':item.display==='columns'?'column graph':'display'}</h3><ReadAloudBtn className={styles.voice} label="Read display" text={`Your display. ${response.values.map((n,i)=>`${names[item.target??i]}: ${n}`).join('. ')}. Use plus to add one, minus to remove one.${item.display==='columns'?` ${scaleSpeech}`:''}`}/></div>{graph(response.values,true)}</>:<><div className={styles.panelHeader}><h3>Your list</h3><ReadAloudBtn className={styles.voice} label="Read list" text={`${item.instruction} ${response.values.map((v,i)=>`${observationLabel} ${i+1}: ${v<0?'not chosen':names[v]}`).join('. ')}. Choices: ${names.join(', ')}.`}/></div><div className={styles.entries}>{response.values.map((v,i)=><label key={i}>{observationLabel} {i+1}<select aria-label={`${observationLabel} ${i+1} answer`} value={v} onChange={e=>onChange({...response,touched:true,values:response.values.map((old,j)=>j===i?Number(e.target.value):old)})}><option value={-1}>Choose…</option>{names.map((name,k)=><option key={name} value={k}>{name}</option>)}</select></label>)}</div></>}
   </div>
  </div>}
 </>;
}
