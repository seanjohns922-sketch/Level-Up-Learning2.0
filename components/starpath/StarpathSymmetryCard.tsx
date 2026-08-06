"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { isSymmetricDesign, type SymmetryCell } from "@/data/activities/starpath/level4/symmetry";

type Task = Extract<PracticeTask, { kind: "starpathSymmetry" }>;
const COLOURS = ["#7c3aed", "#0891b2", "#f59e0b"];
const SYM_STYLE = (
  <style>{`.l4sym-stage{background:radial-gradient(120% 90% at 50% 2%, #2a2a6e 0%, #16123f 45%, #0b0a24 100%);box-shadow:0 14px 34px -16px rgba(10,8,40,.6), inset 0 0 0 1px rgba(148,163,255,.14);}`}</style>
);
const key = (cell: { r: number; c: number }) => `${cell.r}:${cell.c}`;
function exact(task: Task, cells: SymmetryCell[]) { const actual = new Map(cells.map((cell) => [key(cell), cell.colour])); return task.expectedCells.length === actual.size && task.expectedCells.every((cell) => actual.get(key(cell)) === cell.colour); }

export default function StarpathSymmetryCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [cells, setCells] = useState<SymmetryCell[]>(task.seedCells);
  const [colour, setColour] = useState(COLOURS[0]!);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [settled, setSettled] = useState(false);
  const optionsMode = Boolean(task.options?.length);
  const map = new Map(cells.map((cell) => [key(cell), cell]));
  function toggle(r: number, c: number) { if (settled || optionsMode) return; const k = `${r}:${c}`; setCells((current) => current.some((cell) => key(cell) === k) ? current.filter((cell) => key(cell) !== k) : [...current, { r, c, colour }]); }
  function pick(id: string) { setSelectedOptions((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]); }
  function submit() {
    if (settled) return;
    setSettled(true);
    const correct = optionsMode ? (task.correctOptionIds ?? []).length === selectedOptions.length && (task.correctOptionIds ?? []).every((id) => selectedOptions.includes(id)) : task.mode === "create" ? isSymmetricDesign(task, cells) : exact(task, cells);
    if (correct) onCorrect(); else onWrong(optionsMode ? selectedOptions.join(",") : cells.map(key).join(","));
  }
  return <div className="space-y-4">
    <TaskHeading prompt={task.prompt} speech={task.speakText} />
    <div className="l4sym-stage relative mx-auto grid max-w-sm gap-1.5 rounded-3xl p-4" style={{ gridTemplateColumns: `repeat(${task.size}, minmax(0, 1fr))` }}>
      {Array.from({ length: task.size * task.size }, (_, index) => { const r = Math.floor(index / task.size); const c = index % task.size; const item = map.get(`${r}:${c}`); const onVertical = task.line === "vertical" && c === Math.floor(task.size / 2); const onHorizontal = task.line === "horizontal" && r === Math.floor(task.size / 2); const onDiagonal = task.line === "diagonal" && r === c; const centre = task.centre?.r === r && task.centre.c === c; return <button type="button" key={`${r}:${c}`} onClick={() => toggle(r, c)} aria-label={`Symmetry grid row ${r + 1}, column ${c + 1}`} className={["relative aspect-square rounded-lg border bg-white/[0.03] transition hover:bg-white/[0.08]", onVertical ? "border-x-4 border-x-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.5)]" : onHorizontal ? "border-y-4 border-y-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.5)]" : onDiagonal ? "outline outline-2 outline-cyan-300" : "border-white/10"].join(" ")}><span className="absolute inset-[12%] rounded-md" style={item ? { backgroundColor: item.colour, boxShadow: `0 2px 6px ${item.colour}66` } : undefined} />{centre ? <span className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-amber-300" /> : null}</button>; })}
    </div>
    {optionsMode ? <div className="grid gap-2 sm:grid-cols-2">{task.options?.map((option) => <button type="button" key={option.id} onClick={() => pick(option.id)} className={["rounded-lg border-2 p-3 font-bold", selectedOptions.includes(option.id) ? "border-violet-600 bg-violet-50" : "border-slate-200"].join(" ")}>{option.label}</button>)}</div> : <div className="flex justify-center gap-2">{COLOURS.map((value) => <button type="button" key={value} onClick={() => setColour(value)} aria-label={`Choose ${value} tile`} className={["h-10 w-10 rounded-md border-4", colour === value ? "border-slate-900" : "border-white"].join(" ")} style={{ backgroundColor: value }} />)}</div>}
    <div className="flex justify-center gap-2">{!optionsMode ? <button type="button" onClick={() => setCells(task.seedCells)} title="Reset design" aria-label="Reset design" className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-slate-200"><RotateCcw /></button> : null}<button type="button" onClick={submit} disabled={settled || (optionsMode ? !selectedOptions.length : !cells.length)} className="flex h-11 items-center gap-2 rounded-lg bg-violet-700 px-5 font-bold text-white disabled:opacity-40"><Check />Test</button></div>
    {SYM_STYLE}
  </div>;
}
