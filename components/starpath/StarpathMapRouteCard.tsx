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

// Decorative compass so the grid reads as a real map (no coordinate system).
function MapCompass() {
  return (
    <div
      aria-hidden="true"
      className="absolute right-1.5 top-1.5 z-30 flex h-7 w-7 flex-col items-center justify-center rounded-full border border-cyan-200/40 bg-slate-900/45 shadow sm:h-8 sm:w-8"
    >
      <span className="text-[6px] font-black leading-none text-amber-300 sm:text-[7px]">N</span>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true">
        <path d="M12 3l3 9h-6z" fill="#fca5a5" />
        <path d="M12 21l-3-9h6z" fill="#67e8f9" />
      </svg>
    </div>
  );
}

const cellKey = (c: { r: number; c: number }) => `${c.r}:${c.c}`;

function MapBase({ task, rover, reached }: { task: MapRouteTask; rover: Cell; reached: boolean }) {
  const blockedKeys = new Set((task.blocked ?? []).map(cellKey));
  return (
    <DirectionGrid cols={task.cols} rows={task.rows}>
      <MapCompass />
      {/* Blocked hazard cells (mission mode) */}
      {task.blocked?.map((b) => (
        <GridMarker key={`blocked-${cellKey(b)}`} cell={b} cols={task.cols} rows={task.rows} z={7}>
          <div className="flex h-3/4 w-3/4 items-center justify-center rounded-xl border-2 border-rose-300 bg-rose-950/80 text-rose-200 shadow-inner">
            <X className="h-1/2 w-1/2" strokeWidth={3} />
          </div>
        </GridMarker>
      ))}
      {/* Checkpoints to visit first (mission mode) */}
      {task.checkpoints?.map((cp) => (
        <GridMarker key={`checkpoint-${cellKey(cp)}`} cell={cp} cols={task.cols} rows={task.rows} z={8}>
          <div className="flex h-4/5 w-4/5 flex-col items-center justify-center rounded-xl border-2 border-dashed border-cyan-300 bg-cyan-300/10">
            <PositionObjectVisual objectId={cp.object} className="h-1/2 w-1/2" />
            {cp.label ? <span className="max-w-full truncate px-0.5 text-[6px] font-black leading-none text-cyan-200 sm:text-[7px]">{cp.label}</span> : null}
          </div>
        </GridMarker>
      ))}
      {/* Faded landmark context (skip goal + checkpoint + blocked cells) */}
      {task.landmarks
        .filter((l) => !(l.r === task.goal.r && l.c === task.goal.c))
        .filter((l) => !(task.checkpoints ?? []).some((cp) => cp.r === l.r && cp.c === l.c))
        .filter((l) => !blockedKeys.has(cellKey(l)))
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

// ── Test & Fix: find the broken step in a route drawn across the map ──────────
function DebugRoute({ task, onCorrect, onWrong }: { task: MapRouteTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrongTap, setWrongTap] = useState<string | null>(null);
  const steps = task.debugSteps ?? [];

  function tap(id: string) {
    if (id === task.wrongStepId) {
      onCorrect();
    } else {
      setWrongTap(id);
      setTimeout(() => setWrongTap((v) => (v === id ? null : v)), 440);
      onWrong();
    }
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto max-w-3xl"><MapBase task={task} rover={task.start} reached={false} /></div>
      <p className="mt-4 mb-2 text-center text-xs font-black uppercase tracking-[0.16em] text-violet-700">
        Tap the step that breaks the route
      </p>
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-2">
        {steps.map((step, index) => {
          const Icon = ARROW_ICON[step.direction];
          return (
            <button
              key={step.id}
              type="button"
              aria-label={`Step ${index + 1}: ${DIRECTION_WORD[step.direction]}`}
              onClick={() => tap(step.id)}
              className={["flex min-h-14 items-center gap-1.5 rounded-2xl border-2 px-3 py-2 font-black text-indigo-950 transition active:scale-95", wrongTap === step.id ? "sp-mroute-shake border-rose-400 bg-rose-100" : "border-violet-200 bg-white hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md"].join(" ")}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs">{index + 1}</span>
              <Icon className="h-5 w-5" strokeWidth={2.75} />
              <span className="text-sm">{DIRECTION_WORD[step.direction]}</span>
            </button>
          );
        })}
      </div>
      {ROUTE_STYLE}
    </div>
  );
}

export function StarpathMapRouteCard(props: { task: MapRouteTask; onCorrect: () => void; onWrong: (studentAnswer?: string) => void; onComplete: () => void }) {
  const { task } = props;
  const [rover, setRover] = useState<Cell>(task.start);
  const [stepIndex, setStepIndex] = useState(0);
  const [wrong, setWrong] = useState<Direction | null>(null);
  const [reached, setReached] = useState(false);
  const [moves, setMoves] = useState<Direction[]>([]);
  const [status, setStatus] = useState<"editing" | "running" | "fail" | "done">("editing");
  const [settled, setSettled] = useState(false);
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

  const isMission = task.mode === "mission";

  // ── give / mission (build a route, then run it) ──
  function run() {
    if (status !== "editing" || moves.length === 0 || !task.goal) return;
    setStatus("running");
    const blockedKeys = new Set((task.blocked ?? []).map(cellKey));
    const checkpointKeys = new Set((task.checkpoints ?? []).map(cellKey));
    let i = 0;
    let pos: Cell = task.start;
    let leftGrid = false;
    let hitBlocked = false;
    const visited = new Set<string>();
    if (checkpointKeys.has(cellKey(pos))) visited.add(cellKey(pos));
    setRover(task.start);
    const timer = window.setInterval(() => {
      const d = moves[i];
      if (!d) {
        window.clearInterval(timer);
        const ok = !leftGrid && !hitBlocked && visited.size === checkpointKeys.size && pos.r === task.goal.r && pos.c === task.goal.c;
        if (doneRef.current) return;
        doneRef.current = true;
        setSettled(true);
        if (ok) {
          setReached(true);
          setStatus("done");
          setTimeout(props.onComplete, 1000);
        } else {
          // A wrong run is the answer: record it and move on, like every other
          // task — no reset-and-retry on the same question.
          setStatus("fail");
          setTimeout(() => props.onWrong(moves.join(", ")), 950);
        }
        return;
      }
      if (isMission) {
        // Mission: leaving the map fails the run (matches the L1 mission rules).
        const delta = DELTA[d];
        const next = { r: pos.r + delta.dr, c: pos.c + delta.dc };
        if (next.r < 0 || next.r >= task.rows || next.c < 0 || next.c >= task.cols) {
          leftGrid = true;
        } else {
          pos = next;
          if (blockedKeys.has(cellKey(pos))) hitBlocked = true;
          if (checkpointKeys.has(cellKey(pos))) visited.add(cellKey(pos));
        }
      } else {
        pos = clamp(pos, d);
      }
      setRover(pos);
      i += 1;
    }, 330);
  }

  if (task.mode === "debug") {
    return <DebugRoute task={task} onCorrect={props.onCorrect} onWrong={props.onWrong} />;
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

  // give + mission (build a route, then run it)
  if (task.mode === "give" || task.mode === "mission") {
    const disabled = status === "running" || settled;
    return (
      <div>
        <TaskHeading prompt={task.prompt} speech={task.speakText} />
        <div className="mx-auto max-w-3xl"><MapBase task={task} rover={rover} reached={reached} /></div>
        <div className="mx-auto mt-4 max-w-xl">
          {isMission && task.missionRule ? (
            <div className="mb-3 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-black text-amber-900">
              Mission rule: {task.missionRule}
            </div>
          ) : null}
          <div className="mb-3 flex min-h-12 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/60 p-2">
            {moves.length === 0 ? <span className="px-2 text-sm font-semibold text-slate-500">Add moves to guide the rover.</span> : moves.map((d, i) => { const Icon = ARROW_ICON[d]; return <span key={i} className="flex items-center gap-1 rounded-xl border-2 border-violet-200 bg-white px-2.5 py-1.5 text-sm font-black text-indigo-950"><span className="text-xs text-violet-500">{i + 1}</span><Icon className="h-4 w-4" strokeWidth={2.75} /></span>; })}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(task.palette ?? []).map((d) => { const Icon = ARROW_ICON[d]; return <button key={d} type="button" disabled={disabled || moves.length >= (task.maxSteps ?? 12)} onClick={() => { setMoves((m) => [...m, d]); setStatus("editing"); setRover(task.start); }} className="flex h-12 min-w-12 items-center justify-center gap-1 rounded-xl border-2 border-violet-300 bg-white px-3 text-indigo-950 transition hover:-translate-y-0.5 hover:border-cyan-400 active:scale-95 disabled:opacity-30"><Icon className="h-5 w-5" strokeWidth={2.75} /><span className="text-sm font-black">{DIRECTION_WORD[d]}</span></button>; })}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <button type="button" disabled={disabled || moves.length === 0} onClick={() => { setMoves((m) => m.slice(0, -1)); setStatus("editing"); setRover(task.start); }} className="flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 font-black text-slate-700 transition active:scale-95 disabled:opacity-30"><X className="h-4 w-4" strokeWidth={3} /> Undo</button>
            <button type="button" disabled={disabled} onClick={() => { setMoves([]); setStatus("editing"); setRover(task.start); }} className="flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 font-black text-slate-700 transition active:scale-95 disabled:opacity-30"><RotateCcw className="h-4 w-4" strokeWidth={3} /> Reset</button>
            <button type="button" disabled={disabled || moves.length === 0} onClick={run} className="flex min-h-11 items-center gap-1.5 rounded-xl bg-violet-700 px-6 font-black text-white shadow-lg transition hover:bg-violet-600 active:scale-95 disabled:opacity-40"><Play className="h-4 w-4 fill-white" strokeWidth={3} /> Run</button>
          </div>
          {isMission && !settled ? (
            <p className="mt-2 text-center text-xs font-semibold text-slate-500">
              Visit the checkpoint, dodge the asteroids, and reach the goal. Plan carefully — you get one run.
            </p>
          ) : null}
          {status === "fail" ? <p className="sp-mroute-shake mt-3 flex items-center justify-center gap-1.5 text-center text-sm font-black text-rose-600"><X className="h-4 w-4" strokeWidth={3} /> {isMission ? "Mission not complete — moving on." : "Not there yet — moving on."}</p> : null}
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
