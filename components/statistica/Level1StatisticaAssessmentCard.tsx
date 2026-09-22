'use client';
import DataIcon from './StatisticaObjectArt';
import StatisticaSortActivity from './StatisticaSortActivity';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import type {StatsItem,Category} from '@/data/assessments/revisions/level1StatisticaFiveForms';
import type {StatsResponse} from '@/lib/statistica-level1-review';
import styles from '@/components/demo/StatisticaFiveForms.module.css';

function Marks({n,display,category}:{n:number;display:StatsItem['display'];category:Category}){
 if(display==='tally')return <div className={styles.marks} aria-label={`${n} tally marks`}>{Array.from({length:Math.ceil(n/5)},(_,g)=><svg key={g} viewBox="0 0 40 38" width="40" height="38" aria-hidden="true">{Array.from({length:Math.min(4,n-g*5)},(_,i)=><path key={i} d={`M${6+i*8} 5V33`} stroke="currentColor" strokeWidth="2.5"/>)}{n-g*5>=5&&<path d="M2 31L37 7" stroke="currentColor" strokeWidth="2.5"/>}</svg>)}</div>;
 return <div className={styles.marks} aria-label={`${n} ${display==='pictures'?category.name:'marks'}`}>{Array.from({length:n},(_,i)=><span className={styles.unit} key={i} aria-hidden="true">{display==='pictures'?<DataIcon name={category.name} color={category.color} size={32}/>:<span className={display==='objects'?styles.counterDisc:styles.dot}/>}</span>)}{n===0&&<span className={styles.zero}>0</span>}</div>;
}
export default function Level1StatisticaAssessmentCard({item,response,onChange}:{item:StatsItem;response:StatsResponse;onChange:(r:StatsResponse)=>void}){
 const names=item.categories.map(c=>c.name);
 const sourceSpeech = item.source==='categories'?`Possible answers: ${names.join(', ')}.`:item.source==='graph'?`${item.context}. One picture stands for one child's answer. ${item.counts.map((n,i)=>`${names[i]}: ${n} pictures`).join('. ')}.`:`${item.context}. ${item.observations.map((v,i)=>`${item.source==='objects'?'Picture':'Child'} ${i+1}: ${names[v]}`).join('. ')}.`;
 const listSpeech=item.source==='missing'?`Recorded list: ${item.recorded?.map((v,i)=>`Child ${i+1}: ${names[v]}`).join('. ')}.`:item.source==='duplicate'?`Recorded list: ${item.recorded?.map(i=>`Child ${i+1}: ${names[item.observations[i]]}`).join('. ')}.`:'';
 const add=(i:number,d:number)=>onChange({...response,touched:true,values:response.values.map((v,j)=>i===j?Math.max(0,Math.min(20,v+d)):v)});
 const graph=(values:number[],editable=false)=><div className={styles.graph}>{values.map((n,i)=>{const cat=item.categories[editable?(item.target??i):i];return <div className={styles.graphRow} key={i}><span className={styles.category} data-category={cat.name}><DataIcon name={cat.name} color={cat.color} size={30}/>{cat.name}</span><Marks n={n} display={editable?item.display:'pictures'} category={cat}/>{editable&&<div className={styles.adjust}><button aria-label={`Remove one from ${cat.name}`} disabled={n===0} onClick={()=>add(i,-1)}>−</button><output aria-label={`${cat.name} recorded`}>{n}</output><button aria-label={`Add one to ${cat.name}`} disabled={n===20} onClick={()=>add(i,1)}>+</button></div>}</div>;})}</div>;
 return <>
  <div className={styles.question}><h2 id="stats-question-heading">{item.prompt}</h2><ReadAloudBtn className={styles.voice} label="Read question" text={`${item.prompt} ${item.instruction}`}/></div>
  {item.instruction&&<p className={styles.instruction}>{item.instruction}</p>}
  {item.mode==='sort'?<StatisticaSortActivity item={item} response={response} onChange={onChange}/>:<div className={styles.activity}>
   <div className={styles.source} data-stats-source><div className={styles.panelHeader}><h3>{item.source==='categories'?'Survey answers':item.context}</h3><ReadAloudBtn className={styles.voice} label="Read diagram" text={`${sourceSpeech} ${listSpeech}`}/></div>
    {item.source==='graph'?graph(item.counts):item.source==='categories'?<div className={styles.categoryChoices}>{item.categories.map(c=><div key={c.name}><DataIcon name={c.name} color={c.color} size={80}/><span>{c.name}</span></div>)}</div>:<div className={styles.observations}>{item.observations.map((v,i)=><div key={i}><span>{item.source==='objects'?'Picture':'Child'} {i+1}</span><DataIcon name={names[v]} color={item.categories[v].color} size={58}/><strong>{names[v]}</strong></div>)}</div>}
    {(item.source==='missing'||item.source==='duplicate')&&<div className={styles.recordList}><h4>Recorded list</h4>{item.recorded?.map((v,i)=>{const child=item.source==='duplicate'?v:i;const cat=item.source==='duplicate'?item.observations[v]:v;return <span key={i}>Child {child+1}: {names[cat]}</span>;})}</div>}
   </div>
   <div className={styles.answer}>
    {item.mode==='choice'?item.options.map(o=><div className={styles.option} key={o.id}><button aria-pressed={response.choice===o.id} onClick={()=>onChange({...response,choice:o.id,touched:true})}>{o.label}</button><ReadAloudBtn className={styles.voice} kind="option" text={o.label}/></div>):item.mode==='counts'?<><div className={styles.panelHeader}><h3>Your {item.display==='tally'?'tally':'display'}</h3><ReadAloudBtn className={styles.voice} label="Read display" text={`Your display. ${response.values.map((n,i)=>`${names[item.target??i]}: ${n}`).join('. ')}. Use plus to add one, minus to remove one.`}/></div>{graph(response.values,true)}</>:<><div className={styles.panelHeader}><h3>Your list</h3><ReadAloudBtn className={styles.voice} label="Read list" text={`${item.instruction} ${response.values.map((v,i)=>`${item.source==='objects'?'Picture':'Child'} ${i+1}: ${v<0?'not chosen':names[v]}`).join('. ')}. Choices: ${names.join(', ')}.`}/></div><div className={styles.entries}>{response.values.map((v,i)=><label key={i}>{item.source==='objects'?'Picture':'Child'} {i+1}<select aria-label={`${item.source==='objects'?'Picture':'Child'} ${i+1} answer`} value={v} onChange={e=>onChange({...response,touched:true,values:response.values.map((old,j)=>j===i?Number(e.target.value):old)})}><option value={-1}>Choose…</option>{names.map((name,k)=><option key={name} value={k}>{name}</option>)}</select></label>)}</div></>}
   </div>
  </div>}
 </>;
}
