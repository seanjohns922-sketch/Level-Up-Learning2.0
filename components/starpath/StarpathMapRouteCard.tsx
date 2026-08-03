"use client";

import { useRef, useState } from "react";
import { Check, Play, RotateCcw, Sparkles, X } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import { PositionObjectVisual } from "@/components/starpath/StarpathPositionCards";
import {
  ARROW_ICON,
  DELTA,
  DIRECTION_WORD,
  DirectionGrid,
  GridMarker,
  type Cell,
  type Direction,
} from "@/components/starpath/StarpathDirectionCards";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type MapRouteTask = Extract<PracticeTask, { kind: "starpathMapRoute" }>;

const ROUTE_STYLE = (
  <style>{`
    @keyframes sp-mroute-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
    .sp-mroute-shake { animation: sp-mroute-shake 0.4s ease-in-out; }
    @keyframes sp-mroute-pop { 0%{transform:scale(0.6);opacity:0} 60%{transform:scale(1.08);opacity:1} 100%{transform:scale(1);opacity:1} }
    .sp-mroute-pop { animation: sp-mroute-pop 0.4s ease-out; }
    @media (prefers-reduced-motion: reduce) { .sp-mroute-shake, .sp-mroute-pop { animation: none; } }
  `}</style>
);

function MapBase({ task, rover, reached }: { task: MapRouteTask; rover: Cell; reached: boolean }) {
  return (
    <DirectionGrid cols={task.cols} rows={task.rows}>
      {/* Faded landmark context */}
      {task.landmarks
        .filter((l) => !(l.r === task.goal.r && l.c === task.goal.c))
        .map((l) => (
          <GridMarker key={l.id} cell={l} cols={task.cols} rows={task.rows} z={3}>
            <div className="flex flex-col items-center justify-center opacity-45">
              <PositionObjectVisual objectId={l.object} className="h-1/2 w-1/2" />
              <span className="max-w-full truncate px-0.5 text-[6px] font-black leading-none text-cyan-100 sm:text-[7px]">{l.label}</span>
            </div>
          </GridMarker>
        ))}
      {/* Goal */}
      <GridMarker cell={task.goal} cols={task.cols} rows={task.rows} z={6}>
        <div className="flex h-4/5 w-4/5 flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-300/70 bg-amber-300/10">
          <PositionObjectVisual objectId={task.goal.object} className="h-1/2 w-1/2" />
          <span className="max-w-full truncate px-0.5 text-[6px] font-black leading-none text-amber-200 sm:text-[7px]">{task.goal.label}</span>
        </div>
      </GridMarker>
      {/* Rover */}
      <GridMarker cell={rover} cols={task.cols} rows={task.rows} z={20}>
        <PositionObjectVisual objectId={task.object} className="h-4/5 w-4/5" />
      </GridMarker>
      {reached ? (
        <GridMarker cell={task.goal} cols={task.cols} rows={task.rows} z={30}>
          <Sparkles className="sp-mroute-pop h-1/2 w-1/2 text-amber-300" />
        </GridMarker>
      ) : null}
    </DirectionGrid>
  );
}

function ArrowPad({ onPick, wrong, disabled }: { onPick: (d: Direction) => void; wrong?: Direction | null; disabled?: boolean }) {
  const cellFor: Record<Direction, string> = { up: "col-start-2 row-start-1", left: "col-start-1 row-start-2", right: "col-start-3 row-start-2", down: "col-start-2 row-start-3" };
  return (
    <div className="mx-auto mt-5 grid w-44 grid-cols-3 grid-rows-3 gap-2">
      {(Object.keys(DIRECTION_WORD) as Direction[]).map((direction) => {
        const Icon = ARROW_ICON[direction];
        return (
          <button
            key={direction}
            type="button"
            aria-label={DIRECTION_WORD[direction]}
            disabled={disabled}
            onClick={() => onPick(direction)}
            className={[cellFor[direction], "flex h-12 w-12 items-center justify-center rounded-xl border-2 text-indigo-950 transition active:scale-95", wrong === direction ? "sp-mroute-shake border-rose-400 bg-rose-100" : "border-violet-300 bg-white hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md", disabled ? "opacity-30" : ""].join(" ")}
          >
            <Icon className="h-6 w-6" strokeWidth={2.75} />
          </button>
        );
      })}
      <div className="col-start-2 row-start-2 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-violet-300">Move</div>
    </div>
  );
}

export function StarpathMapRouteCard(props: { task: MapRouteTask; onCorrect: () => void; onWrong: () => void; onComplete: () => void }) {
  const { task } = props;
  const [rover, setRover] = useState<Cell>(task.start);
  const [stepIndex, setStepIndex] = useState(0);
  const [wrong, setWrong] = useState<Direction | null>(null);
  const [reached, setReached] = useState(false);
  const [moves, setMoves] = useState<Direction[]>([]);
  const [status, setStatus] = useState<"editing" | "running" | "fail" | "done">("editing");
  const doneRef = useRef(false);

  const clamp = (c: Cell, d: Direction): Cell => {
    const delta = DELTA[d];
    return { r: Math.min(task.rows - 1, Math.max(0, c.r + delta.dr)), c: Math.min(task.cols - 1, Math.max(0, c.c + delta.dc)) };
  };

  // ── follow ──
  function follow(direction: Direction) {
    if (doneRef.current || !task.steps) return;
    const step = task.steps[stepIndex];
    if (!step) return;
    if (direction === step.direction) {
      setRover((c) => clamp(c, direction));
      if (stepIndex + 1 >= task.steps.length) {
        doneRef.current = true;
        setReached(true);
        setTimeout(props.onComplete, 900);
      } else {
        setStepIndex(stepIndex + 1);
      }
    } else {
      setWrong(direction);
      setTimeout(() => setWrong((v) => (v === direction ? null : v)), 420);
    }
  }

  // ── give ──
  function run() {
    if (status !== "editing" || moves.length === 0 || !task.goal) return;
    setStatus("running");
    let i = 0;
    let pos: Cell = task.start;
    setRover(task.start);
    const timer = window.setInterval(() => {
      const d = moves[i];
      if (!d) {
        window.clearInterval(timer);
        const ok = pos.r === task.goal.r && pos.c === task.goal.c;
        if (ok && !doneRef.current) {
          doneRef.current = true;
          setReached(true);
          setStatus("done");
          setTimeout(props.onComplete, 1000);
        } else setStatus("fail");
        return;
      }
      pos = clamp(pos, d);
      setRover(pos);
      i += 1;
    }, 330);
  }

  if (task.mode === "choose") {
    return (
      <div>
        <TaskHeading prompt={task.prompt} speech={task.speakText} />
        <div className="mx-auto max-w-3xl"><MapBase task={task} rover={rover} reached={reached} /></div>
        <div className="mx-auto mt-6 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
          {(task.options ?? []).map((option) => {
            const Icon = ARROW_ICON[option.direction];
            return (
              <button key={option.id} type="button" onClick={() => (option.id === task.correctOptionId ? props.onCorrect() : props.onWrong())} className="relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-violet-200 bg-white px-3 text-indigo-950 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]">
                <Icon className="h-6 w-6" strokeWidth={2.75} />
                <span className="text-sm font-black">{DIRECTION_WORD[option.direction]}</span>
                <OptionReadAloudButton text={DIRECTION_WORD[option.direction]} className="absolute right-1.5 top-1.5" />
              </button>
            );
          })}
        </div>
        {ROUTE_STYLE}
      </div>
    );
  }

  if (task.mode === "give") {
    const disabled = status === "running" || status === "done";
    return (
      <div>
        <TaskHeading prompt={task.prompt} speech={task.speakText} />
        <div className="mx-auto max-w-3xl"><MapBase task={task} rover={rover} reached={reached} /></div>
        <div className="mx-auto mt-4 max-w-xl">
          <div className="mb-3 flex min-h-12 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/60 p-2">
            {moves.length === 0 ? <span className="px-2 text-sm font-semibold text-slate-500">Add moves to guide the rover.</span> : moves.map((d, i) => { const Icon = ARROW_ICON[d]; return <span key={i} className="flex items-center gap-1 rounded-xl border-2 border-violet-200 bg-white px-2.5 py-1.5 text-sm font-black text-indigo-950"><span className="text-xs text-violet-500">{i + 1}</span><Icon className="h-4 w-4" strokeWidth={2.75} /></span>; })}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(task.palette ?? []).map((d) => { const Icon = ARROW_ICON[d]; return <button key={d} type="button" disabled={disabled || moves.length >= (task.maxSteps ?? 8)} onClick={() => { setMoves((m) => [...m, d]); setStatus("editing"); setRover(task.start); }} className="flex h-12 min-w-12 items-center justify-center gap-1 rounded-xl border-2 border-violet-300 bg-white px-3 text-indigo-950 transition hover:-translate-y-0.5 hover:border-cyan-400 active:scale-95 disabled:opacity-30"><Icon className="h-5 w-5" strokeWidth={2.75} /><span className="text-sm font-black">{DIRECTION_WORD[d]}</span></button>; })}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <button type="button" disabled={disabled || moves.length === 0} onClick={() => { setMoves((m) => m.slice(0, -1)); setStatus("editing"); setRover(task.start); }} className="flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 font-black text-slate-700 transition active:scale-95 disabled:opacity-30"><X className="h-4 w-4" strokeWidth={3} /> Undo</button>
            <button type="button" disabled={disabled} onClick={() => { setMoves([]); setStatus("editing"); setRover(task.start); }} className="flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 font-black text-slate-700 transition active:scale-95 disabled:opacity-30"><RotateCcw className="h-4 w-4" strokeWidth={3} /> Reset</button>
            <button type="button" disabled={disabled || moves.length === 0} onClick={run} className="flex min-h-11 items-center gap-1.5 rounded-xl bg-violet-700 px-6 font-black text-white shadow-lg transition hover:bg-violet-600 active:scale-95 disabled:opacity-40"><Play className="h-4 w-4 fill-white" strokeWidth={3} /> Run</button>
          </div>
          {status === "fail" ? <p className="sp-mroute-shake mt-3 flex items-center justify-center gap-1.5 text-center text-sm font-black text-rose-600"><X className="h-4 w-4" strokeWidth={3} /> Not there yet — adjust and run again.</p> : null}
          {status === "done" ? <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-sm font-black text-emerald-600"><Check className="h-4 w-4" strokeWidth={3} /> {task.feedback.correct}</p> : null}
        </div>
        {ROUTE_STYLE}
      </div>
    );
  }

  // follow
  const step = task.steps?.[stepIndex];
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border-2 border-cyan-300 bg-cyan-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-sm font-black text-white">{Math.min(stepIndex + 1, task.steps?.length ?? 1)}</span>
          <span className="text-base font-black text-indigo-950 sm:text-lg">{reached ? "You made it!" : step?.instruction ?? "Done!"}</span>
        </div>
        {step && !reached ? <ReadAloudBtn text={step.speakText} size="md" label="Read" className="shrink-0" /> : null}
      </div>
      <div className="mx-auto max-w-3xl"><MapBase task={task} rover={rover} reached={reached} /></div>
      <ArrowPad onPick={follow} wrong={wrong} />
      <p className="mt-3 text-center text-sm font-semibold text-slate-600">Step {Math.min(stepIndex + 1, task.steps?.length ?? 1)} of {task.steps?.length ?? 1}</p>
      {ROUTE_STYLE}
    </div>
  );
}
