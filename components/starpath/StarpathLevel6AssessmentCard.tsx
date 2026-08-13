"use client";

import { useState } from "react";
import { Check, Minus, Plus, RotateCcw } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "starpathLevel6Assessment" }>;
type Point = { x: number; y: number };

const samePoint = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
const samePoints = (actual: Point[], expected: Point[]) =>
  actual.length === expected.length && expected.every((point) => actual.some((candidate) => samePoint(candidate, point)));

function applyOperation(point: Point, operation: NonNullable<Task["operations"]>[number]): Point {
  if (operation.kind === "translate") return { x: point.x + operation.dx, y: point.y + operation.dy };
  if (operation.kind === "rotate90") return { x: -point.y, y: point.x };
  if (operation.kind === "reflectX") return { x: point.x, y: -point.y };
  return { x: -point.x, y: point.y };
}

function Stepper({ label, value, onChange, min = -8, max = 8 }: { label: string; value: number; onChange: (value: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border-2 border-indigo-100 bg-white p-3">
      <span className="font-bold text-slate-800">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" aria-label={`Decrease ${label}`} onClick={() => onChange(Math.max(min, value - 1))} className="grid h-10 w-10 place-items-center rounded-lg border-2 border-indigo-200 text-indigo-800"><Minus className="h-4 w-4" /></button>
        <span className="w-10 text-center text-xl font-black tabular-nums text-slate-950">{value}</span>
        <button type="button" aria-label={`Increase ${label}`} onClick={() => onChange(Math.min(max, value + 1))} className="grid h-10 w-10 place-items-center rounded-lg border-2 border-indigo-200 text-indigo-800"><Plus className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function CartesianBoard({ range, points, selected, onSelect }: { range: number; points: Point[]; selected: Point[]; onSelect: (point: Point) => void }) {
  const size = range * 2 + 1;
  return (
    <div className="mx-auto grid w-[min(30rem,88vw)] border-l border-t border-cyan-200 bg-slate-950 p-3" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
      {Array.from({ length: size * size }, (_, index) => {
        const x = (index % size) - range;
        const y = range - Math.floor(index / size);
        const marked = points.some((point) => point.x === x && point.y === y);
        const chosen = selected.some((point) => point.x === x && point.y === y);
        return (
          <button
            key={`${x}:${y}`}
            type="button"
            aria-label={`Point ${x}, ${y}`}
            onClick={() => onSelect({ x, y })}
            className={[
              "relative aspect-square border-b border-r border-cyan-200/25",
              x === 0 || y === 0 ? "bg-cyan-900/45" : "bg-slate-950",
            ].join(" ")}
          >
            {marked ? <span className="absolute inset-1/4 rounded-full bg-amber-300 ring-2 ring-white" /> : null}
            {chosen ? <span className="absolute inset-[18%] rounded-full border-[3px] border-cyan-300" /> : null}
            {(x === -range && y % 2 === 0) || (y === -range && x % 2 === 0) ? <span className="absolute bottom-0.5 left-1 text-[8px] font-bold text-cyan-100">{x},{y}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export default function StarpathLevel6AssessmentCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [profile, setProfile] = useState<[number, number, number]>([1, 1, 1]);
  const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);
  const [translation, setTranslation] = useState<Point>({ x: 0, y: 0 });
  const [rule, setRule] = useState({ across: 0, down: 0, quarterTurns: 0 });
  const [option, setOption] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  const submit = () => {
    if (settled) return;
    let correct = false;
    let answer = "";
    if (task.mode === "diagnose") {
      correct = option === task.correctOptionId;
      answer = option ?? "";
    } else if (task.mode === "crossSectionProfile") {
      correct = profile.every((value, index) => value === task.profileAnswer?.[index]);
      answer = profile.join(",");
    } else if (task.mode === "coordinatePlot") {
      correct = samePoints(selectedPoints, task.targetPoints ?? []);
      answer = selectedPoints.map((point) => `${point.x}:${point.y}`).join("|");
    } else if (task.mode === "transformChain") {
      const expected = (task.operations ?? []).reduce(applyOperation, task.start ?? { x: 0, y: 0 });
      correct = samePoint(translation, expected);
      answer = `${translation.x}:${translation.y}`;
    } else {
      correct = rule.across === task.ruleAnswer?.across && rule.down === task.ruleAnswer?.down && rule.quarterTurns === task.ruleAnswer?.quarterTurns;
      answer = `${rule.across}:${rule.down}:${rule.quarterTurns}`;
    }
    setSettled(true);
    if (correct) onCorrect(); else onWrong(answer);
  };

  const ready = task.mode === "diagnose" ? Boolean(option) : task.mode === "coordinatePlot" ? selectedPoints.length === (task.targetPoints?.length ?? 0) : true;
  const range = task.range ?? 4;

  return (
    <div className="space-y-5">
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto max-w-2xl rounded-lg border-2 border-indigo-100 bg-indigo-50/70 p-4">
        <div className="mb-4 font-mono text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{task.contextLabel}</div>

        {task.mode === "diagnose" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {task.options?.map((item) => <button key={item.id} type="button" onClick={() => !settled && setOption(item.id)} className={["min-h-20 rounded-lg border-2 p-4 text-left font-bold", option === item.id ? "border-cyan-500 bg-cyan-50 text-slate-950" : "border-indigo-200 bg-white text-slate-800"].join(" ")}>{item.label}</button>)}
          </div>
        ) : null}

        {task.mode === "crossSectionProfile" ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {(["Lower cut", "Middle cut", "Upper cut"] as const).map((label, index) => <Stepper key={label} label={label} min={1} max={6} value={profile[index]} onChange={(value) => setProfile((current) => current.map((entry, entryIndex) => entryIndex === index ? value : entry) as [number, number, number])} />)}
          </div>
        ) : null}

        {task.mode === "coordinatePlot" ? (
          <>
            <CartesianBoard range={range} points={[]} selected={selectedPoints} onSelect={(point) => !settled && setSelectedPoints((current) => current.some((candidate) => samePoint(candidate, point)) ? current.filter((candidate) => !samePoint(candidate, point)) : current.length < (task.targetPoints?.length ?? 0) ? [...current, point] : current)} />
            <p className="mt-3 text-center text-sm font-bold text-slate-600">Select {task.targetPoints?.length ?? 0} point{(task.targetPoints?.length ?? 0) === 1 ? "" : "s"}. Selected: {selectedPoints.length}</p>
          </>
        ) : null}

        {task.mode === "transformChain" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-950 p-4 text-white">
              <div className="text-sm font-bold text-cyan-200">Start: ({task.start?.x}, {task.start?.y})</div>
              <ol className="mt-3 space-y-2 text-sm font-semibold">{task.operations?.map((operation, index) => <li key={`${operation.label}:${index}`}>{index + 1}. {operation.label}</li>)}</ol>
            </div>
            <div className="space-y-3"><Stepper label="Final x" value={translation.x} onChange={(x) => setTranslation((value) => ({ ...value, x }))} /><Stepper label="Final y" value={translation.y} onChange={(y) => setTranslation((value) => ({ ...value, y }))} /></div>
          </div>
        ) : null}

        {task.mode === "tessellationRule" ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <Stepper label="Across" min={-6} max={6} value={rule.across} onChange={(across) => setRule((value) => ({ ...value, across }))} />
            <Stepper label="Down" min={-6} max={6} value={rule.down} onChange={(down) => setRule((value) => ({ ...value, down }))} />
            <Stepper label="Quarter turns" min={0} max={3} value={rule.quarterTurns} onChange={(quarterTurns) => setRule((value) => ({ ...value, quarterTurns }))} />
          </div>
        ) : null}
      </div>

      <div className="flex justify-center gap-3">
        {task.mode !== "diagnose" ? <button type="button" onClick={() => { setProfile([1, 1, 1]); setSelectedPoints([]); setTranslation({ x: 0, y: 0 }); setRule({ across: 0, down: 0, quarterTurns: 0 }); }} disabled={settled} className="grid h-12 w-12 place-items-center rounded-lg border-2 border-indigo-200 bg-white text-indigo-800 disabled:opacity-40" title="Reset answer"><RotateCcw className="h-5 w-5" /></button> : null}
        <button type="button" onClick={submit} disabled={settled || !ready} className="inline-flex h-12 items-center gap-2 rounded-lg bg-indigo-700 px-7 font-black text-white disabled:opacity-40"><Check className="h-5 w-5" /> Record answer</button>
      </div>
    </div>
  );
}
