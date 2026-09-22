'use client';
import {useState} from 'react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import ObjectArt from './StatisticaObjectArt';
import type {StatsItem} from '@/data/assessments/revisions/level1StatisticaFiveForms';
import type {StatsResponse} from '@/lib/statistica-level1-review';
import styles from '@/components/demo/StatisticaFiveForms.module.css';

export default function StatisticaSortActivity({item,response,onChange}:{item:StatsItem;response:StatsResponse;onChange:(r:StatsResponse)=>void}){
 const [selected,setSelected]=useState<number|null>(null);
 const [message,setMessage]=useState('');
 const assigned=response.values.filter(v=>v>=0).length;
 const tile=(i:number)=>{const c=item.categories[item.observations[i]];return <button className={styles.sortTile} key={i} aria-label={`Select picture ${i+1}`} aria-pressed={selected===i} onClick={()=>{setSelected(i);setMessage(`Picture ${i+1} selected. Tap a group.`);}}><span>{i+1}</span><ObjectArt name={c.name} color={c.color} size={62}/></button>;};
 const place=(group:number)=>{if(selected===null)return;onChange({...response,touched:true,values:response.values.map((v,i)=>i===selected?group:v)});setMessage(`Picture ${selected+1} moved to ${group<0?'the picture tray':`the ${item.categories[group].name} group`}.`);setSelected(null);};
 return <div className={styles.sortActivity}>
  <div className={styles.sortTray}>
   <div className={styles.panelHeader}><h3>Pictures to sort</h3><ReadAloudBtn className={styles.voice} label="Read pictures" text={`Pictures to sort. ${item.instruction} ${item.observations.map((v,i)=>`Picture ${i+1}: ${item.categories[v].name}`).join('. ')}.`}/></div>
   <div className={styles.sortTiles}>{item.observations.map((_,i)=>response.values[i]<0?tile(i):null)}</div>
   <p className={styles.sortProgress}>{assigned} of {item.observations.length} pictures placed</p>
   <p className={styles.sortHint}>{selected===null?(assigned===item.observations.length?'All pictures placed. Choose Next, or tap a picture in a group to move it.':'Tap a picture to select it.'):`Picture ${selected+1} selected — tap a group.`}</p>
   {selected!==null&&response.values[selected]>=0&&<button onClick={()=>place(-1)}>Return picture to tray</button>}
  </div>
  <div className={styles.sortGroups}>
   <div className={styles.panelHeader}><h3>Groups</h3><ReadAloudBtn className={styles.voice} label="Read groups" text={`Groups: ${item.categories.map((c,k)=>`${c.name}. ${response.values.map((v,i)=>v===k?`Picture ${i+1}`:'').filter(Boolean).join(', ')||'Empty'}`).join('. ')}. Select a picture, then tap its group. To move a picture again, select it in its group.`}/></div>
   <div className={styles.bucketGrid}>{item.categories.map((c,k)=><div key={c.name} className={styles.bucket}>
    <button className={styles.bucketTarget} disabled={selected===null} aria-label={`Put selected picture in ${c.name} group`} onClick={()=>place(k)}><ObjectArt name={c.name} color={c.color} size={42}/><strong>{c.name}</strong><span>{selected===null?'Select a picture first':'Tap to place here'}</span></button>
    <div className={styles.bucketPictures}>{response.values.map((v,i)=>v===k?tile(i):null)}{!response.values.includes(k)&&<button className={styles.bucketEmpty} disabled={selected===null} aria-label={`Place picture in empty ${c.name} group`} onClick={()=>place(k)}>{selected===null?"": "+"}</button>}</div>
   </div>)}</div>
  </div>
  <p className={styles.sortAnnouncement} role="status">{message}</p>
 </div>;
}
