"use client";
import {useState} from "react";
import {TaskHeading} from "./StarpathShapeTaskCard";
import {axesAreCorrect, samePointSet, tileCells, tilesAreCorrect, type GridPoint, type IndependentConstructionTask, type TilePlacement} from "@/lib/starpath-independent-construction";

const colours = ["#a78bfa", "#67e8f9", "#fbbf24", "#fda4af", "#86efac", "#fdba74", "#c4b5fd", "#93c5fd"];
const buttonClass = "min-h-11 rounded-lg border-2 border-indigo-200 bg-white px-4 py-2 font-bold text-indigo-950";
export default function StarpathIndependentConstructionCard({task, onCorrect, onWrong, onAssessmentAnswer}: {onAssessmentAnswer?: (correct: boolean, response: string) => void; task: IndependentConstructionTask; onCorrect: () => void; onWrong: (answer?: string) => void}) {
  const [points, setPoints] = useState<GridPoint[]>([]);
  const [tiles, setTiles] = useState<TilePlacement[]>([]);
  const [turn, setTurn] = useState(0);
  const [labels, setLabels] = useState(["", "", "", "", ""]);
  const [parts, setParts] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [settled, setSettled] = useState(false);
  function submit() {
    if (settled) return;
    const correct = task.mode === "image" ? samePointSet(points, task.expected)
      : task.mode === "tiles" ? tilesAreCorrect(task, tiles)
      : task.mode === "axes" ? axesAreCorrect(task, labels, points[0] ?? null)
      : task.accepted.some(model => model.length === parts.length && model.every((part, i) => part === parts[i])) && reason === task.correctReason;
    setSettled(true);
    const response = JSON.stringify({points, tiles, labels, parts, reason});
    if (onAssessmentAnswer) onAssessmentAnswer(correct, response);
    else if (correct) onCorrect(); else onWrong(response);
  }
  function select(point: GridPoint) {
    if (settled) return;
    setPoints(current => task.mode === "axes" ? [point] : current.some(p => p.x === point.x && p.y === point.y) ? current.filter(p => p.x !== point.x || p.y !== point.y) : [...current, point]);
  }
  return <div className="space-y-4">
    <TaskHeading prompt={task.prompt} speech={task.speakText}/>
    {task.instructions?.map(instruction => <p key={instruction} className="mx-auto max-w-lg text-base text-slate-800">{instruction}</p>)}
    {(task.mode === "image" || task.mode === "axes") && (() => {
      const min = task.mode === "image" ? task.min : 0, max = task.mode === "image" ? task.max : task.size;
      const size = max - min + 1, step = 36, offset = 32, extent = (size - 1) * step + offset * 2;
      const px = (x: number) => offset + (x - min) * step, py = (y: number) => offset + (max - y) * step;
      return <>
        <svg viewBox={`0 0 ${extent} ${extent}`} className="mx-auto w-full max-w-lg rounded-xl bg-slate-950" role="group" aria-label="Coordinate construction grid">
          {Array.from({length: size}, (_, i) => {const v = i + min; return <g key={v}>
            <line x1={px(v)} y1={py(min)} x2={px(v)} y2={py(max)} stroke={v === 0 ? "#fff" : "#475569"}/>
            <line x1={px(min)} y1={py(v)} x2={px(max)} y2={py(v)} stroke={v === 0 ? "#fff" : "#475569"}/>
            {task.mode === "image" && <><text x={px(v)} y={py(0) + 17} fill="white" fontSize="11">{v}</text><text x={px(0) - 20} y={py(v)} fill="white" fontSize="11">{v}</text></>}
          </g>;})}
          {task.mode === "image" && <>
            <polygon points={task.original.map(p => `${px(p.x)},${py(p.y)}`).join(" ")} fill="#fbbf2444" stroke="#fbbf24" strokeWidth="3"/>
            {task.line && <line x1={task.line.axis === "x" ? px(task.line.at) : px(min)} x2={task.line.axis === "x" ? px(task.line.at) : px(max)} y1={task.line.axis === "y" ? py(task.line.at) : py(min)} y2={task.line.axis === "y" ? py(task.line.at) : py(max)} stroke="#fda4af" strokeDasharray="6 4" strokeWidth="3"/>}
            {task.centre && <circle cx={px(task.centre.x)} cy={py(task.centre.y)} r="5" fill="#fda4af"/>}
          </>}
          {task.mode === "axes" && <>
            <text x={px(max) + 10} y={py(0)} fill="white" fontSize="13">{labels[0] || "?"}</text>
            <text x={px(0)} y={py(max) - 12} fill="white" fontSize="13">{labels[1] || "?"}</text>
            {[0,1,2].map(v => <g key={v}><text x={px(v)} y={py(0)+20} fill="white" fontSize="12">{labels[v+2] || "?"}</text>{v>0 && <text x={px(0)-20} y={py(v)} fill="white" fontSize="12">{labels[v+2] || "?"}</text>}</g>)}
          </>}
          {points.length > 1 && task.mode === "image" && <polygon points={points.map(p => `${px(p.x)},${py(p.y)}`).join(" ")} fill="#67e8f933" stroke="#67e8f9" strokeWidth="2"/>}
          {Array.from({length: size * size}, (_, i) => {const p = {x: min+i%size, y: max-Math.floor(i/size)}; const selected = points.some(q => q.x===p.x && q.y===p.y); return <circle key={i} cx={px(p.x)} cy={py(p.y)} r={selected ? 7 : 12} fill={selected ? "#67e8f9" : "transparent"} stroke={selected ? "white" : "none"} role="button" tabIndex={settled ? -1 : 0} aria-label={task.mode === "axes" ? `Grid intersection ${p.x} steps across, ${p.y} steps up` : `Point ${p.x}, ${p.y}`} aria-pressed={selected} onClick={() => select(p)} onKeyDown={e => {if(e.key === "Enter" || e.key === " "){e.preventDefault();select(p);}}}/>;})}
        </svg>
        {task.mode === "image" ? <p className="text-center text-sm">Tap every vertex of your image in order. Tap a selected vertex to remove it.</p> : <div className="mx-auto grid max-w-lg gap-2">{["Name the horizontal axis", "Name the vertical axis", "Label the origin", "Value at the first tick on each axis", "Value at the second tick on each axis"].map((label,i)=><label key={label} className="flex items-center justify-between gap-3 text-sm font-bold">{label}<input aria-label={label} className="w-20 rounded border-2 border-indigo-200 p-2 text-slate-950" value={labels[i]} disabled={settled} onChange={e=>setLabels(current=>current.map((v,j)=>i===j?e.target.value:v))}/></label>)}</div>}
      </>;
    })()}
    {task.mode === "tiles" && <>
      <div className="flex items-center justify-center gap-3"><span>Tile to place:</span><svg viewBox="0 0 100 100" className="h-20 w-20" role="img" aria-label={`Tile turned ${turn*90} degrees`}>{tileCells(task.piece, {x:0,y:0,turn}).map(p=><rect key={`${p.x}:${p.y}`} x={p.x*24+2} y={p.y*24+2} width="23" height="23" fill="#a78bfa" stroke="#312e81"/>)}</svg><button type="button" className={buttonClass} disabled={settled} onClick={()=>setTurn(v=>(v+1)%4)}>Turn tile 90°</button></div>
      <p className="text-center text-sm">Tap a square to place the top-left of this tile. Tiles may overlap while you work; your submitted design must have no gaps or overlaps.</p>
      <div className="mx-auto grid w-full max-w-md gap-1 rounded-xl bg-slate-950 p-3" style={{gridTemplateColumns:`repeat(${task.width},minmax(0,1fr))`}}>{Array.from({length:task.width*task.height},(_,i)=>{const x=i%task.width,y=Math.floor(i/task.width);const visible=task.outline.some(p=>p.x===x&&p.y===y);const owners=tiles.flatMap((tile,j)=>tileCells(task.piece,tile).some(p=>p.x===x&&p.y===y)?[j]:[]);return <button key={i} type="button" disabled={settled} aria-label={`Tile grid row ${y+1}, column ${x+1}${owners.length?`, ${owners.length} tile layers`:""}`} className="aspect-square rounded border border-white/30 text-sm font-black" style={{background:owners.length?colours[owners.at(-1)!%colours.length]:visible?"#e2e8f0":"#0f172a",color:"#0f172a"}} onClick={()=>setTiles(current=>[...current,{x,y,turn}])}>{owners.length>1?owners.length:""}</button>;})}</div>
      <p className="text-center text-sm">{tiles.length} tiles placed. {task.minimumOrientations>1?`Use at least ${task.minimumOrientations} different orientations.`:""}</p>
      <div className="flex justify-center"><button type="button" className={buttonClass} disabled={settled||!tiles.length} onClick={()=>setTiles(v=>v.slice(0,-1))}>Undo tile</button></div>
    </>}
    {task.mode === "model" && <>
      <div className="mx-auto flex max-w-lg flex-col-reverse items-center gap-1 rounded-xl bg-indigo-50 p-4">{task.slots.map((slot,i)=>{const part=task.palette.find(p=>p.id===parts[i]);return <div key={slot} className="w-full rounded-lg border border-indigo-200 bg-white p-2"><label className="flex items-center justify-between gap-2 font-bold">{slot}<select className="rounded border-2 border-indigo-200 p-2" aria-label={slot} value={parts[i]??""} disabled={settled} onChange={e=>setParts(current=>Array.from({length:task.slots.length},(_,j)=>i===j?e.target.value:current[j]??""))}><option value="">Choose object</option>{task.palette.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></label>{part && <div className="mx-auto h-24 w-24 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{__html:part.svg}}/>}</div>;})}</div>
      <fieldset className="mx-auto grid max-w-lg gap-2"><legend className="mb-2 font-bold">Choose the feature that makes your model suitable.</legend>{task.reasons.map(option=><label key={option.id} className={buttonClass}><input type="radio" name="model-reason" disabled={settled} checked={reason===option.id} onChange={()=>setReason(option.id)}/> {option.label}</label>)}</fieldset>
    </>}
    <div className="flex justify-center gap-3"><button type="button" className={buttonClass} disabled={settled} onClick={()=>{setPoints([]);setTiles([]);setParts([]);setReason("");setLabels(["","","","",""]);}}>Clear</button><button type="button" className="min-h-11 rounded-lg bg-emerald-700 px-6 py-2 font-bold text-white disabled:opacity-50" disabled={settled} onClick={submit}>Record answer</button></div>
  </div>;
}
