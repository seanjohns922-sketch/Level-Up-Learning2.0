"use client";

import { useState, type PointerEvent } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { ShapeVisual, SceneObjectVisual } from "./StarpathShapeTaskCard";
import { PositionObjectVisual } from "./StarpathPositionCards";
import { BuildObjectVisual } from "./StarpathShapeBuilderCards";
import type { GroundRedesignItem, GroundScene, GroundVisual, ShapeSpec } from "@/data/assessments/revisions/groundStarpathRedesignedForms";
import type { GroundResponse } from "@/lib/starpath-ground-redesign";
import styles from "@/components/demo/GroundStarpathRedesign.module.css";

const cells = ["top left", "top middle", "top right", "middle left", "middle", "middle right", "bottom left", "bottom middle", "bottom right"];
function Shape({ spec, small = false }: { spec: ShapeSpec; small?: boolean }) {
  if (spec.vertices) return <svg aria-hidden="true" viewBox="0 0 100 100" className={small ? styles.smallShapeArt : styles.shapeArt}><polygon points={spec.vertices.map(p=>p.join(",")).join(" ")} transform={`rotate(${spec.rotation ?? 0} 50 50)`} fill={spec.colour} stroke="#433878" strokeWidth="3" strokeLinejoin="round"/></svg>;
  return <span style={{ display: "block", transform: `rotate(${spec.rotation ?? 0}deg) scaleX(${spec.stretch ?? 1})` }}><ShapeVisual shape={spec.shape} colour={spec.colour} scale={spec.scale} className={small ? styles.smallShapeArt : styles.shapeArt} /></span>;
}
function Scene({ scene }: { scene: GroundScene }) {
  return <div className={styles.groundScene} aria-hidden="true">
    {scene.prop?.kind === "basket" && <svg viewBox="0 0 300 240" className={styles.sceneProp}><ellipse cx="150" cy="140" rx="59" ry="18" fill="#e9c997" stroke="#76532f" strokeWidth="3" /></svg>}
    {scene.items.map((item,i) => <div key={i} className={styles.sceneItem} style={{ left: `${item.x/3}%`, top: `${item.y/2.4}%`, width: item.size ?? 76, height: item.size ?? 76, zIndex: item.layer ?? 1 }}><PositionObjectVisual objectId={item.object} className="h-full w-full" />{["geospin", "alien", "explorer"].includes(item.object) && <span className={styles.personLabel}>{item.object === "geospin" ? "Geospin" : item.object}</span>}</div>)}
    {scene.prop && <svg viewBox="0 0 300 240" className={styles.sceneProp} style={{zIndex:scene.prop.layer}}>
      {scene.prop.kind === "basket" && <><path d="M91 140Q150 167 209 140L197 199Q150 214 103 199Z" fill="#d7ad72" stroke="#76532f" strokeWidth="3"/><path d="M100 163Q150 179 202 163M103 182Q150 197 199 182M117 150l6 53M140 158l2 48M162 158l-2 48M185 150l-6 53" fill="none" stroke="#ad7e45" strokeWidth="2"/></>}
      {scene.prop.kind === "table" && <><path d="M75 131v99M225 131v99" stroke="#79513c" strokeWidth="13"/><rect x="55" y="119" width="190" height="16" rx="4" fill="#bf936e" stroke="#79513c" strokeWidth="3"/></>}
      {scene.prop.kind === "fence" && <><path d="M40 151h220M40 185h220" stroke="#b58a59" strokeWidth="17"/>{[55,102,150,198,245].map(x=><path key={x} d={`M${x-9} 218V137l9-13 9 13v81Z`} fill="#e1bd86" stroke="#8b6439" strokeWidth="2"/>)}</>}
    </svg>}
  </div>;
}
function Visual({ visual }: { visual: GroundVisual }) {
  if (visual.kind === "shapes") return <div className={styles.shapeGroup}>{visual.shapes.map((spec,i)=><Shape key={i} spec={spec} small={visual.shapes.length>2}/>)}</div>;
  if (visual.kind === "object") return <div className={styles.familiarObject}><SceneObjectVisual objectId={visual.object}/></div>;
  if (visual.kind === "picture") return <BuildObjectVisual objectId={visual.object} visiblePieceIds={visual.pieces} className={styles.pictureArt}/>;
  if (visual.kind === "scene") return <Scene scene={visual.scene}/>;
  return <div className={styles.beforeAfter}><div><p>Before</p><Scene scene={visual.before}/></div><span aria-hidden="true">→</span><div><p>Now</p><Scene scene={visual.after}/></div></div>;
}

/** Assessment-only interaction. No teaching hints or correctness feedback. */
export default function GroundStarpathAssessmentCard({ item, response: a, onChange }: { item: Pick<GroundRedesignItem, "task" | "readAloudText">; response: GroundResponse; onChange: (value: GroundResponse) => void }) {
  const task = item.task;
  const [piece,setPiece] = useState(0);
  const [drag,setDrag] = useState<number|null>(null);
  const update = (value: Partial<GroundResponse>) => onChange({...a,...value});
  const movePiece = (n:number,x:number,y:number) => update({pieces:a.pieces.map((p,i)=>i===n?{...p,x,y}:p)});
  const dragMove = (event:PointerEvent<SVGSVGElement>) => {
    if(drag===null)return;
    const bounds=event.currentTarget.getBoundingClientRect();
    movePiece(drag,Math.max(60,Math.min(260,Math.round((event.clientX-bounds.left)/bounds.width*16)*20)),Math.max(60,Math.min(180,Math.round((event.clientY-bounds.top)/bounds.height*12)*20)));
  };
  const options = <div className={task.options?.some(o=>o.shape) ? task.mode==="multi"? styles.sortGrid : task.options.length === 4 ? `${styles.choices} ${styles.fourChoices}` : styles.choices : styles.reasons}>
    {task.options?.map((o,i)=>o.shape ? <button key={o.id} data-option-id={o.id} className={styles.shape} aria-label={`Shape ${String.fromCharCode(65+i)}`} aria-pressed={a.selected.includes(o.id)} onClick={()=>update({selected:task.mode==="multi" ? a.selected.includes(o.id)?a.selected.filter(v=>v!==o.id):[...a.selected,o.id] : [o.id]})}><span className={styles.letter}>{String.fromCharCode(65+i)}{a.selected.includes(o.id)?" ✓":""}</span><Shape spec={o.shape} small={task.mode==="multi"}/></button> : <div key={o.id} className={styles.optionRow}><button data-option-id={o.id} aria-pressed={a.selected.includes(o.id)} onClick={()=>update({selected:[o.id]})}>{o.label}</button><ReadAloudBtn text={o.label ?? ""} kind="option" className={styles.voice}/></div>)}
  </div>;
  return <>
    <div className={styles.question}><h2 id="ground-question-heading">{task.prompt}</h2><ReadAloudBtn text={item.readAloudText} label="Read question" size="md" className={styles.voice}/></div>
    {task.instruction && <p className={styles.instruction}>{task.instruction}</p>}
    <div className={`${styles.activity} ${styles.fullBankActivity}`}>
      {(task.mode==="choice"||task.mode==="multi") && <div className={styles.questionBody}>
        <div className={task.visual ? task.visual.kind==="change" ? styles.changeLayout : styles.sortLayout : undefined}>
          {task.visual && <div className={styles.visualPanel}><Visual visual={task.visual}/>{task.visual.kind==="change" && <ReadAloudBtn text="The first picture shows before. The second picture shows now." label="Read labels" className={styles.voice}/>}</div>}
          {options}
        </div>
        {task.reasons && <div className={styles.reasonSection}><div className={styles.inline}><h3>Why?</h3><ReadAloudBtn text="Why? Choose a reason." className={styles.voice}/></div><div className={styles.reasonChoices}>{task.reasons.map(r=><div key={r.id} className={styles.optionRow}><button data-reason-id={r.id} aria-pressed={a.reason===r.id} onClick={()=>update({reason:r.id})}>{r.label}</button><ReadAloudBtn text={r.label} kind="option" className={styles.voice}/></div>)}</div></div>}
      </div>}
      {task.mode==="draw" && <div className={styles.workshop}><div className={styles.dotBoard}><svg viewBox="0 0 300 300" aria-hidden="true"><polygon points={a.points.map(p=>`${p.x},${p.y}`).join(" ")} fill={a.points.length>=3?"#ede9fe":"none"} stroke="#6d28d9" strokeWidth="4"/></svg>{cells.map((name,n)=>{const p={x:50+n%3*100,y:50+Math.floor(n/3)*100};return <button key={n} data-tap-feedback="false" style={{left:`${p.x/3}%`,top:`${p.y/3}%`}} aria-label={`Dot ${name}`} aria-pressed={a.points.some(v=>v.x===p.x&&v.y===p.y)} onClick={()=>{if(!a.points.some(v=>v.x===p.x&&v.y===p.y))update({points:[...a.points,p]});}}/>;})}</div><div className={styles.tools}><button disabled={!a.points.length} onClick={()=>update({points:a.points.slice(0,-1)})}>↶ Undo</button><button disabled={!a.points.length} onClick={()=>update({points:[]})}>Clear</button></div></div>}
      {task.mode==="compose" && <div className={styles.workshop}><svg className={styles.pieceBoard} viewBox="0 0 320 240" onPointerMove={dragMove} onPointerUp={()=>setDrag(null)} onPointerCancel={()=>setDrag(null)} aria-label="Work area for two pieces">{Array.from({length:77},(_,n)=><circle key={n} cx={60+n%11*20} cy={60+Math.floor(n/11)*20} r="2" fill="#b9b1cd"/>)}{a.pieces.map((p,n)=><g key={n} transform={`translate(${p.x} ${p.y}) rotate(${p.turn*90})`} onPointerDown={e=>{setPiece(n);setDrag(n);e.currentTarget.ownerSVGElement?.setPointerCapture(e.pointerId);}}><path d="M-40 -40 L40 40 L-40 40 Z" fill={n===0?"#67e8f9":"#c4b5fd"} stroke="#433878" strokeWidth="2"/><text x="-15" y="24" fontSize="15" fill="#21143f" pointerEvents="none" transform={`rotate(${-p.turn*90} -15 24)`}>{n+1}</text></g>)}</svg><div className={styles.tools}>{[0,1].map(n=><button key={n} aria-pressed={piece===n} onClick={()=>setPiece(n)}>Piece {n+1}</button>)}<button onClick={()=>update({pieces:a.pieces.map((p,n)=>n===piece?{...p,turn:(p.turn+1)%4}:p)})}>↻ Turn</button><button onClick={()=>update({pieces:task.initialPieces!.map(p=>({...p}))})}>Reset</button></div><div className={styles.tools}>{[{name:"left",label:"←",x:-20,y:0},{name:"up",label:"↑",x:0,y:-20},{name:"down",label:"↓",x:0,y:20},{name:"right",label:"→",x:20,y:0}].map(d=><button key={d.name} aria-label={`Move piece ${d.name}`} onClick={()=>movePiece(piece,Math.max(60,Math.min(260,a.pieces[piece].x+d.x)),Math.max(60,Math.min(180,a.pieces[piece].y+d.y)))}>{d.label}</button>)}<ReadAloudBtn text="Choose piece one or piece two. Use the arrows to move it, or drag it. Turn rotates the piece. Reset puts both pieces back." label="Read controls" className={styles.voice}/></div></div>}
      {task.mode==="place" && <div className={styles.positionGrid}>{cells.map((name,n)=>n===4?<div className={styles.reference} key={n}><PositionObjectVisual objectId={task.reference!} className={styles.object}/></div>:<button key={n} aria-label={`Place ${task.subject} ${name}`} aria-pressed={a.cell===n} onClick={()=>update({cell:n})}>{a.cell===n?<PositionObjectVisual objectId={task.subject!} className={styles.object}/>:<span>+</span>}</button>)}</div>}
    </div>
  </>;
}
