"use client";
import ReadAloudBtn from '@/components/ReadAloudBtn';
import GroundStarpathAssessmentCard from './GroundStarpathAssessmentCard';
import { PositionObjectVisual } from './StarpathPositionCards';
import { routeCells,type Direction,type Level1Item } from '@/data/assessments/revisions/level1StarpathFiveForms';
import { sameCell,type Level1Response } from '@/lib/starpath-level1-review';
import shared from '@/components/demo/GroundStarpathRedesign.module.css';
import styles from './Level1StarpathAssessmentCard.module.css';
const arrows:Record<Direction,string>={up:'↑',right:'→',down:'↓',left:'←'};
const directions:Direction[]=['up','left','down','right'];
export default function Level1StarpathAssessmentCard({item,response:a,onChange}:{item:Level1Item;response:Level1Response;onChange:(a:Level1Response)=>void}){
 if(item.kind==='shape')return <GroundStarpathAssessmentCard item={item} response={a.shape} onChange={shape=>onChange({...a,shape})}/>;
 const t=item.task;
 const shown=t.shown?routeCells(t.start,t.shown):[];
 const landmarks=[...t.landmarks,...(t.goal?[{cell:t.goal,object:t.goalObject}]:[])];
 const mapSpeech=`Map with four rows and four columns. Rows count down from the top, columns count from the left. Explorer starts at row ${t.start.r+1}, column ${t.start.c+1}. ${landmarks.map(l=>`${l.object} at row ${l.cell.r+1}, column ${l.cell.c+1}.`).join(' ')} ${t.blocked.map(c=>`Rock at row ${c.r+1}, column ${c.c+1}.`).join(' ')} ${t.shown?`The purple route goes ${t.shown.join(', ')}.`:''}`;
 return <>
  <div className={shared.question}><h2 id="ground-question-heading">{t.prompt}</h2><ReadAloudBtn text={item.readAloudText} label="Read question" className={shared.voice}/></div>
  <p className={shared.instruction}>{t.instruction}</p>
  <div className={styles.layout}>
   <div className={styles.mapPanel}>
    {t.facing?<div className={styles.facing}><span aria-hidden="true">{arrows[t.facing]}</span><PositionObjectVisual objectId="explorer" className="h-24 w-24"/><p>Facing {t.facing}</p></div>:<div className={styles.map} role="group" aria-label="Route map">
     <svg viewBox="0 0 400 400" className={styles.path} aria-hidden="true">{shown.length>0&&<polyline points={shown.map(c=>`${50+c.c*100},${50+c.r*100}`).join(' ')} fill="none" stroke="#7c3aed" strokeWidth="7" strokeLinejoin="round"/>}</svg>
     {Array.from({length:16},(_,i)=>{const cell={r:Math.floor(i/4),c:i%4};const start=sameCell(t.start,cell),rock=t.blocked.some(c=>sameCell(c,cell));const landmark=landmarks.find(l=>sameCell(l.cell,cell));const object=start?'explorer':landmark?.object;const contents=<>{rock&&<svg viewBox="0 0 64 64" className={styles.mapObject} aria-hidden="true"><path d="M7 44 13 22 29 10 47 17 58 39 48 53 20 55Z" fill="#8b8899" stroke="#51495f" strokeWidth="3"/><path d="m13 22 21 3 13-8M34 25l-6 18 20 10M7 44l21-1" fill="none" stroke="#bbb8c7" strokeWidth="3"/></svg>}{object&&<PositionObjectVisual objectId={object} className={styles.mapObject}/>}<span className={styles.cellLabel}>{start?'Start':rock?'Rock':landmark?.object??''}</span>{a.cell&&sameCell(a.cell,cell)&&<span className={styles.selection}>✓</span>}</>;
      return t.mode==='destination'?<button key={i} aria-label={`Row ${cell.r+1}, column ${cell.c+1}${start?', explorer starts here':''}`} aria-pressed={!!a.cell&&sameCell(a.cell,cell)} onClick={()=>onChange({...a,cell})}>{contents}</button>:<div key={i} className={styles.mapCell}>{contents}</div>;
     })}
    </div>}
    <ReadAloudBtn text={t.facing?`The arrow points ${t.facing}. The explorer is facing ${t.facing}.`:mapSpeech} label="Read map" className={shared.voice}/>
   </div>
   <div className={styles.controls}>
    {t.given&&<div className={styles.instructions}><p>Instructions</p><ol>{t.given.map((d,i)=><li key={i}><span>{i+1}.</span> <b aria-hidden="true">{arrows[d]}</b> {d}</li>)}</ol><ReadAloudBtn text={t.given.map((d,i)=>`Step ${i+1}: ${d}.`).join(' ')} label="Read instructions" className={shared.voice}/></div>}
    {t.mode==='destination'&&<p>Tap the square where the explorer finishes.</p>}
    {t.mode==='choice'&&<div className={t.shown?styles.stepChoices:shared.reasons}>{t.options?.map(o=><div className={shared.optionRow} key={o.id}><button data-option-id={o.id} aria-pressed={a.choice===o.id} onClick={()=>onChange({...a,choice:o.id})}>{o.label}</button><ReadAloudBtn text={o.label.replace(/[↑→↓←]/g,'')} kind="option" className={shared.voice}/></div>)}</div>}
    {(t.mode==='record'||t.mode==='build')&&<>
     <div className={shared.inline}><h3>Your directions</h3><ReadAloudBtn text={`Each arrow is one square. Choose arrows to add directions. Undo removes the last arrow. Clear removes all arrows.${a.moves.length?' Your directions are '+a.moves.join(', '):''}`} label="Read directions" className={shared.voice}/></div>
     <div className={styles.sequence} aria-label="Your directions">{a.moves.length?a.moves.map((d,i)=><span key={i} aria-label={`${i+1}: ${d}`}>{arrows[d]}</span>):<span className={styles.placeholder}>Choose arrows below</span>}</div>
     <div className={styles.arrows}>{directions.map(d=><button key={d} aria-label={`Add ${d}`} disabled={a.moves.length>=24} onClick={()=>onChange({...a,moves:[...a.moves,d]})}><b aria-hidden="true">{arrows[d]}</b><span>{d}</span></button>)}</div>
     <div className={shared.tools}><button disabled={!a.moves.length} onClick={()=>onChange({...a,moves:a.moves.slice(0,-1)})}>Undo</button><button disabled={!a.moves.length} onClick={()=>onChange({...a,moves:[]})}>Clear</button></div>
    </>}
   </div>
  </div>
 </>;
}
