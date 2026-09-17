"use client";
import {BookOpen,Flag,House,TreePine,Waves,Volleyball} from 'lucide-react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {PositionObjectVisual} from './StarpathPositionCards';
import GroundStarpathAssessmentCard from './GroundStarpathAssessmentCard';
import {ARROWS,type Level2Item,type MapIcon} from '@/data/assessments/revisions/level2StarpathFiveForms';
import {routeCells,type Direction} from '@/data/assessments/revisions/level1StarpathFiveForms';
import {sameCell} from '@/lib/starpath-level1-review';
import type {Level2Response} from '@/lib/starpath-level2-review';
import shared from '@/components/demo/GroundStarpathRedesign.module.css';
import styles from './Level2StarpathAssessmentCard.module.css';
const icons={gate:Flag,book:BookOpen,building:House,tree:TreePine,water:Waves,ball:Volleyball};
function MapSymbol({name}:{name:MapIcon}){const Icon=icons[name];return <Icon aria-hidden="true" className={styles.symbol} strokeWidth={2}/>;}
export default function Level2StarpathAssessmentCard({item,response:a,onChange}:{item:Level2Item;response:Level2Response;onChange:(a:Level2Response)=>void}){
 if(item.kind==='shape')return <GroundStarpathAssessmentCard item={item} response={a.shape} onChange={shape=>onChange({...a,shape})}/>;
 if(item.kind==='edge'){
  const t=item.task;
  return <><div className={shared.question}><h2 id="ground-question-heading">{t.prompt}</h2><ReadAloudBtn text={item.readAloudText} label="Read question" className={shared.voice}/></div><p className={shared.instruction}>{t.instruction}</p>
   <div className={styles.edgeLayout}><svg viewBox="0 0 300 300" className={styles.edgeDiagram} role="group" aria-label="Four-sided shape with labelled sides"><polygon points={t.vertices.map(p=>p.join(',')).join(' ')} fill="#ede9fe"/>{t.vertices.map(([x,y],i)=>{const next=t.vertices[(i+1)%4],cx=(x+next[0])/2,cy=(y+next[1])/2,dx=cx-150,dy=cy-150,len=Math.hypot(dx,dy);return <g key={i}>
    <line x1={x} y1={y} x2={next[0]} y2={next[1]} stroke={i===t.reference?'#087f9c':a.edge===i?'#7c3aed':'#524269'} strokeWidth={i===t.reference||a.edge===i?8:4} strokeLinecap="round"/>
    <text x={cx+dx/len*22} y={cy+dy/len*22} textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="800" fill="#40305c">{'ABCD'[i]}</text>
    {i!==t.reference&&<line x1={x} y1={y} x2={next[0]} y2={next[1]} stroke="transparent" strokeWidth="28" role="button" tabIndex={0} aria-label={`Side ${'ABCD'[i]}`} aria-pressed={a.edge===i} onClick={()=>onChange({...a,edge:i})} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onChange({...a,edge:i});}}}/>}
   </g>;})}</svg><div className={styles.edgeChoices}><p>Choose a side</p>{t.vertices.map((_,i)=>i===t.reference?null:<button key={i} data-edge-id={i} aria-pressed={a.edge===i} onClick={()=>onChange({...a,edge:i})}>Side {'ABCD'[i]}</button>)}<ReadAloudBtn text={`Sides A, B, C and D are labelled around the shape. Side ${'ABCD'[t.reference]} is highlighted. Choose another side by tapping it or its button.`} label="Read diagram" className={shared.voice}/></div></div></>;
 }
 const t=item.task,shown=t.start&&t.shown?routeCells(t.start,t.shown):[];
 const speech=`${t.title}. View from above, with four rows and four columns. Count rows down from the top, columns from the left. ${t.landmarks.map(l=>`${l.label} is at row ${l.cell.r+1}, column ${l.cell.c+1}.`).join(' ')} ${t.start?`Start is at row ${t.start.r+1}, column ${t.start.c+1}.`:''} ${t.blocked.map(c=>`Closed square at row ${c.r+1}, column ${c.c+1}.`).join(' ')} ${t.shown?`The pictured pathway goes ${t.shown.join(', ')}.`:''}`;
 return <><div className={shared.question}><h2 id="ground-question-heading">{t.prompt}</h2><ReadAloudBtn text={item.readAloudText} label="Read question" className={shared.voice}/></div><p className={shared.instruction}>{t.instruction}</p>
  <div className={styles.mapLayout}><div className={styles.mapPanel}><h3>{t.title} · view from above</h3><div className={styles.map} role="group" aria-label="Place map">
   <svg className={styles.path} viewBox="0 0 400 400" aria-hidden="true">{shown.length>0&&<polyline points={shown.map(c=>`${50+100*c.c},${50+100*c.r}`).join(' ')} fill="none" stroke="#7c3aed" strokeWidth="7" strokeLinejoin="round"/>}</svg>
   {Array.from({length:16},(_,i)=>{const cell={r:Math.floor(i/4),c:i%4},landmark=t.landmarks.find(l=>sameCell(l.cell,cell)),closed=t.blocked.some(b=>sameCell(b,cell)),start=t.start&&sameCell(t.start,cell);const contents=<>{landmark&&<MapSymbol name={landmark.icon}/>}<span className={styles.cellLabel}>{t.keyOnly?'':landmark?.label}</span>{start&&<span className={styles.start}>Start</span>}{closed&&<span className={styles.closed} aria-label="Closed square">×</span>}{a.cell&&sameCell(a.cell,cell)&&<span className={styles.selected}>✓</span>}</>;return t.mode==='locate'?<button key={i} aria-label={`Map square row ${cell.r+1}, column ${cell.c+1}`} aria-pressed={!!a.cell&&sameCell(a.cell,cell)} onClick={()=>onChange({...a,cell})}>{contents}</button>:<div key={i} className={styles.mapCell}>{contents}</div>;})}
  </div><ReadAloudBtn text={speech} label="Read map" className={shared.voice}/></div>
  <div className={styles.controls}>
   {t.keyOnly&&<div className={styles.key}><h3>Map key</h3>{t.landmarks.map(l=><div key={l.id}><MapSymbol name={l.icon}/><span>{l.label}</span></div>)}<ReadAloudBtn text={`Map key. ${t.landmarks.map(l=>`${({gate:'Flag',book:'Open book',building:'Building',tree:'Tree',water:'Waves',ball:'Ball'} as const)[l.icon]} symbol means ${l.label}.`).join(' ')}`} label="Read key" className={shared.voice}/></div>}
   {t.given&&<div><h3>Directions</h3><ol className={styles.given}>{t.given.map((d,i)=><li key={i}>{i+1}. <b aria-hidden="true">{ARROWS[d]}</b> {d}</li>)}</ol><ReadAloudBtn text={t.given.map((d,i)=>`Step ${i+1}: ${d}.`).join(' ')} label="Read directions" className={shared.voice}/></div>}
   {t.mode==='choice'&&<div className={t.shown?styles.stepChoices:shared.reasons}>{t.options!.map(o=><div key={o.id} className={shared.optionRow}><button data-option-id={o.id} aria-pressed={a.choice===o.id} onClick={()=>onChange({...a,choice:o.id})}>{o.label}</button><ReadAloudBtn text={o.label.replace(/[↑→↓←]/g,'')} kind="option" className={shared.voice}/></div>)}</div>}
   {t.mode==='locate'&&!t.keyOnly&&<div className={styles.tapHint}><PositionObjectVisual objectId="explorer" className="h-20 w-20"/><p>Tap your answer on the map.</p><ReadAloudBtn text="Tap your answer on the map." label="Read instruction" className={shared.voice}/></div>}
   {t.mode==='route'&&<><div className={shared.inline}><h3>Your directions</h3><ReadAloudBtn text={`Each arrow moves one square. Add arrows in order. Undo removes the last arrow; Clear removes them all. ${a.moves.length?'Your directions are '+a.moves.join(', '):''}`} label="Read controls" className={shared.voice}/></div><div className={styles.sequence}>{a.moves.length?a.moves.map((d,i)=><span key={i} aria-label={`${i+1}: ${d}`}>{ARROWS[d]}</span>):<span className={styles.placeholder}>Choose arrows below</span>}</div><div className={styles.arrows}>{(['up','left','down','right'] as Direction[]).map(d=><button key={d} aria-label={`Add ${d}`} disabled={a.moves.length>=24} onClick={()=>onChange({...a,moves:[...a.moves,d]})}><b aria-hidden="true">{ARROWS[d]}</b>{d}</button>)}</div><div className={shared.tools}><button disabled={!a.moves.length} onClick={()=>onChange({...a,moves:a.moves.slice(0,-1)})}>Undo</button><button disabled={!a.moves.length} onClick={()=>onChange({...a,moves:[]})}>Clear</button></div></>}
  </div></div></>;
}
