"use client";

import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Play, RotateCcw, X } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { runGridRoute, type GridMove } from "@/data/activities/starpath/level4/gridRoute";
import { normaliseGridReference } from "@/lib/starpath-grid-reference";

type Task = Extract<PracticeTask, { kind: "starpathGridRoute" }>;
const ICONS = { up: ArrowUp, down: ArrowDown, left: ArrowLeft, right: ArrowRight };
const WORDS = { up: "Up", down: "Down", left: "Left", right: "Right" };

function RouteGrid({ task, route = [] }: { task: Task; route?: GridMove[] }) {
  const positions = [{ ...task.start }];
  for (const move of route) {
    const last = positions.at(-1)!;
    const delta = move === "up" ? [-1, 0] : move === "down" ? [1, 0] : move === "left" ? [0, -1] : [0, 1];
    positions.push({ r: last.r + delta[0]!, c: last.c + delta[1]! });
  }
  const routeKeys = new Set(positions.map((cell) => `${cell.r}:${cell.c}`));
  const blocked = new Set((task.blocked ?? []).map((cell) => `${cell.r}:${cell.c}`));
  const checkpoints = new Set((task.checkpoints ?? []).map((cell) => `${cell.r}:${cell.c}`));
  return (
    <div className="mx-auto grid w-full max-w-2xl gap-1" style={{ gridTemplateColumns: `2rem repeat(${task.cols}, minmax(0, 1fr))` }}>
      <div />
      {task.columnLabels.map((label) => <div key={label} className="pb-1 text-center text-xs font-black text-cyan-700">{label}</div>)}
      {Array.from({ length: task.rows }, (_, r) => [
        <div key={`row-${r}`} className="flex items-center justify-center text-xs font-black text-cyan-700">{task.rowLabels[r]}</div>,
        ...Array.from({ length: task.cols }, (_, c) => {
          const key = `${r}:${c}`;
          const isStart = r === task.start.r && c === task.start.c;
          const isGoal = r === task.goal.r && c === task.goal.c;
          return <div key={key} className={["relative aspect-square border border-cyan-200 bg-white", routeKeys.has(key) ? "bg-cyan-100" : "", blocked.has(key) ? "bg-rose-100" : ""].join(" ")}>
            {isStart ? <span className="absolute inset-1 flex items-center justify-center rounded bg-violet-600 text-[9px] font-black text-white">START</span> : null}
            {isGoal ? <span className="absolute inset-1 flex items-center justify-center rounded border-2 border-amber-400 bg-amber-100 text-[9px] font-black text-amber-900">GOAL</span> : null}
            {blocked.has(key) ? <X className="absolute inset-0 m-auto h-1/2 w-1/2 text-rose-600" /> : null}
            {checkpoints.has(key) ? <span className="absolute bottom-0.5 left-0.5 right-0.5 truncate text-center text-[7px] font-black text-cyan-900">RELAY</span> : null}
            {routeKeys.has(key) && !isStart && !isGoal ? <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-cyan-600" /> : null}
          </div>;
        }),
      ])}
    </div>
  );
}

function RouteStrip({ route }: { route: GridMove[] }) {
  return <div className="flex min-h-12 flex-wrap items-center justify-center gap-1.5">{route.map((move, index) => { const Icon = ICONS[move]; return <span key={`${move}-${index}`} className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-200 bg-white"><Icon className="h-5 w-5" /></span>; })}</div>;
}

export default function StarpathGridRouteCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [moves, setMoves] = useState<GridMove[]>([]);
  const [answer, setAnswer] = useState("");
  const [settled, setSettled] = useState(false);
  const shownRoute = task.route ?? moves;
  const typedMode = task.mode === "trace" || task.mode === "missingReference";
  function submitTyped() { if (!answer.trim() || settled) return; setSettled(true); if (normaliseGridReference(answer) === normaliseGridReference(task.expectedReference ?? "")) onCorrect(); else onWrong(answer); }
  function runAuthored() { if (!moves.length || settled) return; setSettled(true); if (runGridRoute(task, moves).valid) onCorrect(); else onWrong(moves.join(",")); }
  function choose(id: string) { if (settled) return; setSettled(true); if (id === task.correctOptionId) onCorrect(); else onWrong(id); }
  return <div className="space-y-4">
    <TaskHeading prompt={task.prompt} speech={task.speakText} />
    <div className="rounded-lg border border-cyan-200 bg-cyan-50/60 p-3"><p className="mb-3 text-center text-sm font-bold text-cyan-950">{task.rule}</p><RouteGrid task={task} route={shownRoute} /></div>
    {typedMode ? <><RouteStrip route={task.route ?? []} /><div className="mx-auto flex max-w-xs gap-2"><input value={answer} onChange={(event) => setAnswer(event.target.value.toUpperCase())} maxLength={3} aria-label="Final grid reference" className="min-w-0 flex-1 rounded-lg border-2 border-violet-200 px-4 py-3 text-center text-xl font-black uppercase" placeholder="B3" /><button type="button" onClick={submitTyped} className="rounded-lg bg-violet-700 px-4 text-white" aria-label="Check reference"><Check /></button></div></> : null}
    {(task.mode === "author" || task.mode === "checkpoint") ? <><RouteStrip route={moves} /><div className="flex flex-wrap justify-center gap-2">{(Object.keys(ICONS) as GridMove[]).map((move) => { const Icon = ICONS[move]; return <button key={move} type="button" disabled={settled || moves.length >= task.maxSteps} onClick={() => setMoves((current) => [...current, move])} title={WORDS[move]} aria-label={`Add ${WORDS[move]} command`} className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-violet-200 bg-white text-violet-800 disabled:opacity-40"><Icon /></button>; })}<button type="button" disabled={settled || !moves.length} onClick={() => setMoves([])} title="Reset route" aria-label="Reset route" className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-slate-200 bg-white"><RotateCcw /></button><button type="button" disabled={settled || !moves.length} onClick={runAuthored} title="Run route" aria-label="Run route" className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-700 text-white disabled:opacity-40"><Play /></button></div></> : null}
    {(task.mode === "debug" || task.mode === "compare") ? <div className="grid gap-3 sm:grid-cols-2">{task.routeOptions?.map((option) => <button type="button" key={option.id} disabled={settled} onClick={() => choose(option.id)} className="rounded-lg border-2 border-violet-200 bg-white p-3 text-left hover:border-cyan-500"><span className="font-black text-violet-950">{option.label}</span><RouteStrip route={option.route} /></button>)}</div> : null}
  </div>;
}
