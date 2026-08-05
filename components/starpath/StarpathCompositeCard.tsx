"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { isCompositeSolution, type CompositePlacement } from "@/data/activities/starpath/level4/composite";

type Task = Extract<PracticeTask, { kind: "starpathComposite" }>;
const cellKey = (cell: { r: number; c: number }) => `${cell.r}:${cell.c}`;

export default function StarpathCompositeCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [selectedPiece, setSelectedPiece] = useState(task.palette[0]?.id ?? "");
  const [placements, setPlacements] = useState<CompositePlacement[]>(task.fixedCells ?? []);
  const [choice, setChoice] = useState("");
  const [reason, setReason] = useState("");
  const [settled, setSettled] = useState(false);
  const judgment = Boolean(task.options?.length);
  const occupied = new Map(placements.map((item) => [cellKey(item), item]));
  const targets = new Set(task.targetCells.map(cellKey));
  function place(r: number, c: number) {
    if (settled || judgment) return;
    const key = `${r}:${c}`;
    setPlacements((current) => current.some((item) => cellKey(item) === key) ? current.filter((item) => cellKey(item) !== key) : [...current, { r, c, pieceId: selectedPiece }]);
  }
  function submit() {
    if (settled) return;
    setSettled(true);
    const correct = judgment ? choice === task.correctOptionId && reason === task.correctReasonId : isCompositeSolution(task, placements);
    if (correct) onCorrect(); else onWrong(judgment ? `${choice}:${reason}` : placements.map((item) => `${cellKey(item)}=${item.pieceId}`).join(","));
  }
  return <div className="space-y-4">
    <TaskHeading prompt={task.prompt} speech={task.speakText} />
    <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-center text-sm font-bold text-cyan-950">{task.designBrief}</div>
    {task.viewLabels ? <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold"><div className="rounded bg-violet-50 p-2">Front: {task.viewLabels.front.join("-")}</div><div className="rounded bg-cyan-50 p-2">Side: {task.viewLabels.side.join("-")}</div><div className="rounded bg-amber-50 p-2">Top cells: {task.viewLabels.top}</div></div> : null}
    {judgment ? <><div className="grid gap-2 sm:grid-cols-2">{task.options?.map((option) => <button type="button" key={option.id} onClick={() => setChoice(option.id)} className={["min-h-20 rounded-lg border-2 p-3 text-left font-bold", choice === option.id ? "border-violet-600 bg-violet-50" : "border-slate-200 bg-white"].join(" ")}>{option.label}</button>)}</div><div className="grid gap-2">{task.reasonOptions?.map((option) => <button type="button" key={option.id} onClick={() => setReason(option.id)} className={["rounded-lg border-2 p-3 text-left text-sm font-semibold", reason === option.id ? "border-cyan-600 bg-cyan-50" : "border-slate-200 bg-white"].join(" ")}>{option.label}</button>)}</div></> : <><div className="flex flex-wrap justify-center gap-2">{task.palette.map((piece) => <button type="button" key={piece.id} onClick={() => setSelectedPiece(piece.id)} className={["rounded-lg border-2 px-3 py-2 font-bold", selectedPiece === piece.id ? "border-violet-700" : "border-transparent"].join(" ")} style={{ backgroundColor: `${piece.colour}25` }}><span className="mr-2 inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: piece.colour }} />{piece.label}</button>)}</div><div className="mx-auto grid max-w-md gap-1" style={{ gridTemplateColumns: `repeat(${task.cols}, minmax(0, 1fr))` }}>{Array.from({ length: task.rows * task.cols }, (_, index) => { const r = Math.floor(index / task.cols); const c = index % task.cols; const item = occupied.get(`${r}:${c}`); const piece = task.palette.find((entry) => entry.id === item?.pieceId); const showTarget = task.mode !== "model" && task.mode !== "solid"; return <button type="button" key={`${r}:${c}`} onClick={() => place(r, c)} aria-label={`Canvas row ${r + 1}, column ${c + 1}`} className={["aspect-square border-2 transition", showTarget && targets.has(`${r}:${c}`) ? "border-dashed border-cyan-400 bg-cyan-50" : "border-slate-200 bg-white"].join(" ")} style={piece ? { backgroundColor: piece.colour } : undefined}><span className="text-xs font-black text-white">{piece?.label.match(/\d/)?.[0] ?? ""}</span></button>; })}</div></>}
    <div className="flex justify-center gap-2">{!judgment ? <button type="button" onClick={() => setPlacements(task.fixedCells ?? [])} disabled={settled} title="Reset canvas" aria-label="Reset canvas" className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-slate-200"><RotateCcw /></button> : null}<button type="button" onClick={submit} disabled={settled || (judgment ? !choice || !reason : !placements.length)} className="flex h-11 items-center gap-2 rounded-lg bg-violet-700 px-5 font-bold text-white disabled:opacity-40"><Check className="h-5 w-5" />Check</button></div>
  </div>;
}
